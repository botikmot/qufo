import * as XLSX from "xlsx";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
} from "@/types/quotation-import";

type RawCell = string | number | boolean | Date | null | undefined;

type SheetRow = RawCell[];

//type NormalizedRow = Record<string, RawCell>;

const HEADER_ALIASES = {
  name: [
    "item",
    "item name",
    "product",
    "product name",
    "service",
    "service name",
    "particular",
    "particulars",
    "details",
    "item description",
    "description of goods",
    "goods description",
    "description of materials",
    "work description",
    "scope of work",
    "materials",
    "material",
    "materials/services",
    "materials / services",
    "product/service",
    "product / service",
    "quotation details",
  ],

  description: [
    "description",
    "item description",
    "details",
    "specification",
    "specifications",
    "remarks",
    "scope",
    "work description",
  ],

  quantity: [
    "quantity",
    "qty",
    "qnty",
    "qnt",
    "no",
    "no.",
    "number",
    "number of units",
    "no of units",
    "no. of units",
    "units",
    "unit quantity",
  ],

  unit: [
    "unit of measure",
    "unit measure",
    "measurement unit",
    "uom",
    "measure",
    "unit",
    ],

    unitPrice: [
    "price per unit",
    "amount per unit",
    "cost per unit",
    "rate per unit",
    "unit price",
    "unit rate",
    "unit cost",
    "selling price",
    "price/unit",
    "rate",
    "price",
    ],

  lineTotal: [
    "amount",
    "total",
    "line total",
    "total amount",
    "line amount",
    "extended amount",
    "total cost",
    "subtotal",
  ],
} as const;

const STOP_WORDS = [
  "subtotal",
  "sub total",
  "total",
  "grand total",
  "net total",
  "amount due",
  "balance due",
  "vat",
  "tax",
  "discount",
  "less discount",
  "terms and conditions",
  "terms & conditions",
  "notes",
  "prepared by",
  "approved by",
  "conforme",
  "conformed by",
];

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .replace(/[.:]/g, "")
    .trim();
}

function isMeaningfulCell(value: RawCell): boolean {
  return String(value ?? "").trim().length > 0;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  let text = String(value ?? "").trim();

  if (!text) {
    return 0;
  }

  const isAccountingNegative =
    /^\(.*\)$/.test(text);

  text = text
    .replace(/₱/gi, "")
    .replace(/PHP/gi, "")
    .replace(/USD/gi, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .replace(/[()]/g, "");

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return isAccountingNegative ? -Math.abs(parsed) : parsed;
}

function isNumericLike(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  const text = String(value ?? "").trim();

  if (!text) {
    return false;
  }

  const normalized = text
    .replace(/₱/gi, "")
    .replace(/PHP/gi, "")
    .replace(/USD/gi, "")
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "");

  if (!normalized) {
    return false;
  }

  const parsed = Number(
    normalized.replace(/^\((.*)\)$/, "-$1"),
  );

  return Number.isFinite(parsed);
}

/* function includesAlias(header: string, aliases: readonly string[]): boolean {
  const normalizedHeader = normalizeHeader(header);

  return aliases.some((alias) => {
    const normalizedAlias = normalizeHeader(alias);

    return (
      normalizedHeader === normalizedAlias ||
      normalizedHeader.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedHeader)
    );
  });
} */

function getHeaderRole(header: string): keyof typeof HEADER_ALIASES | null {
  const normalizedHeader = normalizeHeader(header);

  if (!normalizedHeader) {
    return null;
  }

  const roles = Object.keys(HEADER_ALIASES) as Array<
    keyof typeof HEADER_ALIASES
  >;

  // First: exact match has the highest priority.
  for (const role of roles) {
    const hasExactMatch = HEADER_ALIASES[role].some(
      (alias) => normalizeHeader(alias) === normalizedHeader,
    );

    if (hasExactMatch) {
      return role;
    }
  }

  // Second: use partial matching only if there is no exact match.
  for (const role of roles) {
    const hasPartialMatch = HEADER_ALIASES[role].some((alias) => {
      const normalizedAlias = normalizeHeader(alias);

      return (
        normalizedHeader.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedHeader)
      );
    });

    if (hasPartialMatch) {
      return role;
    }
  }

  return null;
}

function scoreHeaderRow(row: SheetRow): number {
  let score = 0;
  const detectedRoles = new Set<string>();

  for (const cell of row) {
    const role = getHeaderRole(String(cell ?? ""));

    if (role) {
      detectedRoles.add(role);
    }
  }

  if (detectedRoles.has("name")) {
    score += 4;
  }

  if (detectedRoles.has("quantity")) {
    score += 3;
  }

  if (detectedRoles.has("unit")) {
    score += 2;
  }

  if (detectedRoles.has("unitPrice")) {
    score += 3;
  }

  if (detectedRoles.has("lineTotal")) {
    score += 1;
  }

  if (detectedRoles.has("description")) {
    score += 1;
  }

  return score;
}

function findHeaderRow(rows: SheetRow[]): number {
  let bestIndex = -1;
  let bestScore = 0;

  rows.forEach((row, index) => {
    const score = scoreHeaderRow(row);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  // A useful quotation header should have at least two strong signals.
  return bestScore >= 5 ? bestIndex : -1;
}

function createColumnMap(headerRow: SheetRow): {
  name?: number;
  description?: number;
  quantity?: number;
  unit?: number;
  unitPrice?: number;
  lineTotal?: number;
} {
  const map: {
    name?: number;
    description?: number;
    quantity?: number;
    unit?: number;
    unitPrice?: number;
    lineTotal?: number;
  } = {};

  headerRow.forEach((cell, index) => {
    const role = getHeaderRole(String(cell ?? ""));

    console.log("[Quotation Import Header]", {
      rawHeader: cell,
      normalizedHeader: normalizeHeader(cell),
      detectedRole: role,
      columnIndex: index,
    });

    if (!role) {
      return;
    }

    // Preserve the first detected column for each role.
    if (map[role] === undefined) {
      map[role] = index;
    }
  });

  console.log("[Quotation Import Column Map]", map);

  return map;
}

function isStopRow(row: SheetRow): boolean {
  const rowText = row
    .filter(isMeaningfulCell)
    .map((cell) => normalizeText(cell))
    .join(" ");

  if (!rowText) {
    return false;
  }

  return STOP_WORDS.some((stopWord) => {
    const normalizedStopWord = normalizeText(stopWord);

    return (
      rowText === normalizedStopWord ||
      rowText.startsWith(`${normalizedStopWord} `) ||
      rowText.includes(` ${normalizedStopWord} `)
    );
  });
}

function getCell(row: SheetRow, index?: number): RawCell {
  if (index === undefined) {
    return undefined;
  }

  return row[index];
}

function getItemName(
  row: SheetRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string {
  const nameValue = getCell(row, columnMap.name);

  return String(nameValue ?? "").trim();
}

function getItemDescription(
  row: SheetRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string | undefined {
  const descriptionValue = getCell(row, columnMap.description);

  if (
    descriptionValue === undefined ||
    descriptionValue === null ||
    String(descriptionValue).trim() === ""
  ) {
    return undefined;
  }

  return String(descriptionValue).trim();
}

function getQuantity(
  row: SheetRow,
  columnMap: ReturnType<typeof createColumnMap>,
): number {
  const quantity = toNumber(getCell(row, columnMap.quantity));

  return quantity > 0 ? quantity : 1;
}

function getUnit(
  row: SheetRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string {
  const unit = String(getCell(row, columnMap.unit) ?? "").trim();

  return unit || "pcs";
}

function getUnitPrice(
  row: SheetRow,
  columnMap: ReturnType<typeof createColumnMap>,
): number {
  const unitPriceValue = getCell(row, columnMap.unitPrice);

  return Math.max(0, toNumber(unitPriceValue));
}

function mapRowsToItems(
  rows: SheetRow[],
  headerIndex: number,
  warnings: string[],
): ImportedQuotationItem[] {
  const headerRow = rows[headerIndex];
  const columnMap = createColumnMap(headerRow);

  const items: ImportedQuotationItem[] = [];

  if (columnMap.name === undefined) {
    throw new Error(
      "Unable to identify the item or description column in the quotation.",
    );
  }

  if (columnMap.quantity === undefined) {
    warnings.push(
      "Quantity column was not detected. Quantities may default to 1.",
    );
  }

  if (columnMap.unitPrice === undefined) {
    warnings.push(
      "Unit price column was not detected. Unit prices may default to 0.",
    );
  }

  for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];

    if (!row || !row.some(isMeaningfulCell)) {
      continue;
    }

    if (isStopRow(row)) {
      break;
    }

    const name = getItemName(row, columnMap);

    // Skip rows where the detected name column is empty.
    if (!name) {
      continue;
    }

    // Skip obvious non-item metadata rows.
    const normalizedName = normalizeText(name);

    if (
      normalizedName === "item" ||
      normalizedName === "particulars" ||
      normalizedName === "description"
    ) {
      continue;
    }

    const quantity = getQuantity(row, columnMap);
    const unit = getUnit(row, columnMap);
    const unitPrice = getUnitPrice(row, columnMap);
    const description = getItemDescription(row, columnMap);

    if (columnMap.quantity !== undefined) {
      const rawQuantity = getCell(row, columnMap.quantity);

      if (rawQuantity !== undefined && !isNumericLike(rawQuantity)) {
        warnings.push(
          `Row ${rowIndex + 1}: Quantity for "${name}" was not numeric. Defaulted to 1.`,
        );
      }
    }

    if (columnMap.unitPrice !== undefined) {
      const rawUnitPrice = getCell(row, columnMap.unitPrice);

      if (
        rawUnitPrice !== undefined &&
        String(rawUnitPrice).trim() !== "" &&
        !isNumericLike(rawUnitPrice)
      ) {
        warnings.push(
          `Row ${rowIndex + 1}: Unit price for "${name}" was not numeric. Defaulted to 0.`,
        );
      }
    }

    items.push({
      name,
      description,
      quantity,
      unit,
      unitPrice,
    });
  }

  return items;
}

function getFileType(fileName: string): "xlsx" | "xls" | "csv" {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".csv")) {
    return "csv";
  }

  if (lowerName.endsWith(".xls")) {
    return "xls";
  }

  return "xlsx";
}

export async function parseXlsxQuotation(
  file: File,
): Promise<ImportedQuotationDraft> {
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
  });

  const warnings: string[] = [];

  if (!workbook.SheetNames.length) {
    throw new Error("The Excel file does not contain any worksheet.");
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error("Unable to read the first worksheet.");
  }

  const rows = XLSX.utils.sheet_to_json<SheetRow>(worksheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (!rows.length) {
    throw new Error("The worksheet does not contain any data.");
  }

  const headerIndex = findHeaderRow(rows);

  if (headerIndex === -1) {
    throw new Error(
      "Unable to detect the quotation item headers. Please make sure the file contains columns such as Item, Description, Quantity, Unit, Rate, or Unit Price.",
    );
  }

  const items = mapRowsToItems(rows, headerIndex, warnings);

  if (!items.length) {
    throw new Error(
      "No quotation items were detected after the header row.",
    );
  }

  return {
    sourceFileName: file.name,
    sourceFileType: getFileType(file.name),
    extractionMethod: "local",
    customer: {},
    items,
    discountType: "NONE",
    discountValue: 0,
    taxRate: 0,
    warnings,
  };
}