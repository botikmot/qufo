import mammoth from "mammoth";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
} from "@/types/quotation-import";

type RawCell = string | number | null | undefined;
type WordTableRow = RawCell[];

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

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  let text = String(value ?? "").trim();

  if (!text) {
    return 0;
  }

  const isAccountingNegative = /^\(.*\)$/.test(text);

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

function getHeaderRole(
  header: string,
): keyof typeof HEADER_ALIASES | null {
  const normalizedHeader = normalizeHeader(header);

  if (!normalizedHeader) {
    return null;
  }

  const roles = Object.keys(HEADER_ALIASES) as Array<
    keyof typeof HEADER_ALIASES
  >;

  // Exact match first.
  for (const role of roles) {
    const hasExactMatch = HEADER_ALIASES[role].some(
      (alias) => normalizeHeader(alias) === normalizedHeader,
    );

    if (hasExactMatch) {
      return role;
    }
  }

  // Partial match fallback.
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

function createColumnMap(headerRow: WordTableRow): {
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

    console.log("[Word Import Header]", {
      rawHeader: cell,
      normalizedHeader: normalizeHeader(cell),
      detectedRole: role,
      columnIndex: index,
    });

    if (!role) {
      return;
    }

    if (map[role] === undefined) {
      map[role] = index;
    }
  });

  console.log("[Word Import Column Map]", map);

  return map;
}

function getCell(
  row: WordTableRow,
  index?: number,
): RawCell {
  if (index === undefined) {
    return undefined;
  }

  return row[index];
}

function getItemName(
  row: WordTableRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string {
  return String(getCell(row, columnMap.name) ?? "").trim();
}

function getItemDescription(
  row: WordTableRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string | undefined {
  const value = getCell(row, columnMap.description);

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return undefined;
  }

  return String(value).trim();
}

function getQuantity(
  row: WordTableRow,
  columnMap: ReturnType<typeof createColumnMap>,
): number {
  const quantity = toNumber(getCell(row, columnMap.quantity));

  return quantity > 0 ? quantity : 1;
}

function getUnit(
  row: WordTableRow,
  columnMap: ReturnType<typeof createColumnMap>,
): string {
  const unit = String(getCell(row, columnMap.unit) ?? "").trim();

  return unit || "pcs";
}

function getUnitPrice(
  row: WordTableRow,
  columnMap: ReturnType<typeof createColumnMap>,
): number {
  const unitPrice = toNumber(
    getCell(row, columnMap.unitPrice),
  );

  return Math.max(0, unitPrice);
}

function isStopRow(row: WordTableRow): boolean {
  const rowText = row
    .filter((cell) => String(cell ?? "").trim().length > 0)
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

function mapRowsToItems(
  rows: WordTableRow[],
  warnings: string[],
): ImportedQuotationItem[] {
  if (!rows.length) {
    return [];
  }

  const headerIndex = findHeaderRow(rows);

  if (headerIndex === -1) {
    throw new Error(
      "Unable to detect quotation headers in the Word table.",
    );
  }

  const headerRow = rows[headerIndex];
  const columnMap = createColumnMap(headerRow);

  if (columnMap.name === undefined) {
    throw new Error(
      "Unable to identify the item or description column in the Word table.",
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

  const items: ImportedQuotationItem[] = [];

  for (
    let rowIndex = headerIndex + 1;
    rowIndex < rows.length;
    rowIndex += 1
  ) {
    const row = rows[rowIndex];

    if (!row || !row.some((cell) => String(cell ?? "").trim())) {
      continue;
    }

    if (isStopRow(row)) {
      break;
    }

    const name = getItemName(row, columnMap);

    if (!name) {
      continue;
    }

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

      if (
        rawQuantity !== undefined &&
        String(rawQuantity).trim() !== "" &&
        !isNumericLike(rawQuantity)
      ) {
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

function scoreHeaderRow(row: WordTableRow): number {
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

function findHeaderRow(rows: WordTableRow[]): number {
  let bestIndex = -1;
  let bestScore = 0;

  rows.forEach((row, index) => {
    const score = scoreHeaderRow(row);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 5 ? bestIndex : -1;
}

/* function extractTextFromElement(element: Element): string {
  return Array.from(element.querySelectorAll("text"))
    .map((node) => node.textContent ?? "")
    .join(" ")
    .trim();
} */

function extractWordTables(html: string): WordTableRow[][] {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const tableElements = Array.from(document.querySelectorAll("table"));

  return tableElements.map((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));

      return cells.map((cell) =>
        (cell.textContent ?? "")
          .replace(/\s+/g, " ")
          .trim(),
      );
    });
  });
}

function extractWordParagraphs(html: string): string[] {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  const elements = Array.from(
    document.querySelectorAll("p, li"),
  );

  return elements
    .map((element) =>
      (element.textContent ?? "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function parseParagraphBasedItems(
  paragraphs: string[],
  warnings: string[],
): ImportedQuotationItem[] {
  const items: ImportedQuotationItem[] = [];

  const cleanParagraphs = paragraphs
    .map((paragraph) =>
      paragraph
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

  const normalizedParagraphs = cleanParagraphs.map((paragraph) =>
    normalizeText(paragraph),
  );

  // Find the header start.
  const headerIndex = normalizedParagraphs.findIndex(
    (paragraph) =>
      paragraph === "qty" ||
      paragraph.includes("qty"),
  );

  if (headerIndex === -1) {
    warnings.push(
      "Quotation header was not detected in the Word paragraphs.",
    );

    return items;
  }

  /**
   * Expected paragraph structure:
   *
   * QTY
   * UNIT
   * ARTICLES/DESCRIPTION
   * UNIT PRICE
   * AMOUNT
   *
   * 1
   * UNIT
   * PANAFLEX SIGNAGE w/ LIGHT
   * 47,850
   * SINGLE FACE
   * PRINTING & LAMINATED
   * ...
   */

  // Find where the actual item rows begin.
  let index = headerIndex;

  while (
    index < cleanParagraphs.length &&
    !/^\d+(?:\.\d+)?$/.test(cleanParagraphs[index])
  ) {
    index++;
  }

  if (index >= cleanParagraphs.length) {
    warnings.push(
      "No item quantity was detected after the quotation header.",
    );

    return items;
  }

  let currentItem: ImportedQuotationItem | null = null;

  const quantityPattern = /^\d+(?:\.\d+)?$/;
  const pricePattern =
    /^(?:₱|PHP|\$)?\s*[\d,]+(?:\.\d{1,2})?$/i;

  const stopPattern =
    /^(total|terms\s*&?\s*conditions?|terms|confirmed\/approved\s*by|approved\s*by|conforme|confirmation)$/i;

  const isFooterParagraph = (value: string) => {
    const normalized = normalizeText(value);

    return (
      stopPattern.test(value.trim()) ||
      normalized.startsWith("terms") ||
      normalized.startsWith("confirmed") ||
      normalized.startsWith("approved") ||
      normalized.startsWith("conforme")
    );
  };

  const parseNumber = (value: string): number => {
    return Number(
      value
        .replace(/₱/gi, "")
        .replace(/PHP/gi, "")
        .replace(/\$/g, "")
        .replace(/,/g, "")
        .trim(),
    );
  };

  const flushCurrentItem = () => {
    if (!currentItem) {
      return;
    }

    currentItem.name = currentItem.name.trim();
    currentItem.description = currentItem.description?.trim() || "";

    if (currentItem.name && currentItem.quantity > 0) {
      items.push(currentItem);
    }

    currentItem = null;
  };

  while (index < cleanParagraphs.length) {
    const paragraph = cleanParagraphs[index].trim();

    if (!paragraph) {
      index++;
      continue;
    }

    // Stop parsing once the footer starts.
    if (isFooterParagraph(paragraph)) {
      flushCurrentItem();
      break;
    }

    /**
     * A new item starts with:
     *
     * 1
     * UNIT
     * DESCRIPTION
     * PRICE
     */
    if (quantityPattern.test(paragraph)) {
      flushCurrentItem();

      const quantity = Number(paragraph);
      const unit = cleanParagraphs[index + 1]?.trim() || "";
      const name = cleanParagraphs[index + 2]?.trim() || "";
      const price = cleanParagraphs[index + 3]?.trim() || "";

      if (
        !unit ||
        !name ||
        !pricePattern.test(price)
      ) {
        warnings.push(
          `Could not fully parse quotation item starting at paragraph ${index + 1}.`,
        );

        index++;
        continue;
      }

      currentItem = {
        name,
        description: "",
        quantity,
        unit,
        unitPrice: parseNumber(price),
      };

      index += 4;
      continue;
    }

    /**
     * Any paragraphs after the price belong to the
     * current item's description until another quantity
     * or footer is found.
     */
    if (currentItem) {
      const isNextQuantity = quantityPattern.test(paragraph);

      if (!isNextQuantity) {
        currentItem.description = currentItem.description
          ? `${currentItem.description}\n${paragraph}`
          : paragraph;
      }
    }

    index++;
  }

  flushCurrentItem();

  console.log("[Word Import Paragraph Items]", items);

  return items;
}

function mergeWarnings(
  target: string[],
  source: string[],
): void {
  for (const warning of source) {
    if (!target.includes(warning)) {
      target.push(warning);
    }
  }
}

export async function parseWordQuotation(
  file: File,
): Promise<ImportedQuotationDraft> {
  if (!file.name.toLowerCase().endsWith(".docx")) {
    throw new Error(
      "Only .docx Word files are supported at the moment.",
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml({
    arrayBuffer,
  });

  const warnings: string[] = [];
  const allItems: ImportedQuotationItem[] = [];

  // First: try Word tables.
  const tables = extractWordTables(result.value);

  for (const table of tables) {
    try {
      const tableWarnings: string[] = [];
      const items = mapRowsToItems(table, tableWarnings);

      if (items.length) {
        allItems.push(...items);
        mergeWarnings(warnings, tableWarnings);
      }
    } catch {
      // Ignore unrelated tables such as company details or signatures.
      continue;
    }
  }

  // Second: fallback to paragraph-based quotation.
  if (!allItems.length) {
    const paragraphs = extractWordParagraphs(result.value);

    console.log("[Word Import Paragraphs]", paragraphs);

    const paragraphWarnings: string[] = [];
    const paragraphItems = parseParagraphBasedItems(
      paragraphs,
      paragraphWarnings,
    );

    if (paragraphItems.length) {
      allItems.push(...paragraphItems);
      mergeWarnings(warnings, paragraphWarnings);
    }
  }

  if (!allItems.length) {
    throw new Error(
      "No quotation items were detected in the Word document.",
    );
  }

  return {
    sourceFileName: file.name,
    sourceFileType: "docx",
    extractionMethod: "local",
    customer: {},
    items: allItems,
    discountType: "NONE",
    discountValue: 0,
    taxRate: 0,
    warnings,
  };
}