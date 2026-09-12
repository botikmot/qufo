import * as pdfjsLib from "pdfjs-dist";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
} from "@/types/quotation-import";

// Configure PDF.js worker.
// For Next.js/browser usage, use the worker bundled by pdfjs-dist.
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

function normalizeText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseNumericValue(value: string): number {
  return Number(
    value
      .replace(/₱/gi, "")
      .replace(/PHP/gi, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim(),
  );
}

function isPrice(value: string): boolean {
  return /^(?:₱|PHP|\$)?\s*[\d,]+(?:\.\d{1,2})?$/i.test(
    value.trim(),
  );
}

function isQuantity(value: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(value.trim());
}

function isFooter(value: string): boolean {
  const normalized = normalizeText(value);

  return (
    normalized === "total" ||
    normalized.startsWith("terms") ||
    normalized.startsWith("payment") ||
    normalized.startsWith("duration") ||
    normalized.startsWith("confirmed") ||
    normalized.startsWith("approved") ||
    normalized.startsWith("conforme") ||
    normalized.startsWith("thank you") ||
    normalized.startsWith("we thank")
  );
}

/**
 * Extract text lines from every PDF page.
 *
 * PDF text items are positioned individually, so we group
 * them into lines using their Y coordinate.
 */
async function extractPdfLines(
  file: File,
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const allLines: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const textItems = textContent.items
    .filter((item) => {
        return (
        "str" in item &&
        typeof item.str === "string" &&
        "transform" in item &&
        Array.isArray(item.transform) &&
        "width" in item
        );
    })
    .map((item) => {
        const textItem = item as {
        str: string;
        transform: number[];
        width: number;
        };

        return {
        text: textItem.str.trim(),
        x: textItem.transform[4],
        y: textItem.transform[5],
        width: textItem.width ?? 0,
        };
    })
    .filter((item) => item.text);

    /**
     * Group text items with approximately the same Y coordinate.
     */
    const groupedLines: Array<{
      y: number;
      items: typeof textItems;
    }> = [];

    for (const item of textItems) {
      const existingLine = groupedLines.find(
        (line) => Math.abs(line.y - item.y) <= 3,
      );

      if (existingLine) {
        existingLine.items.push(item);
      } else {
        groupedLines.push({
          y: item.y,
          items: [item],
        });
      }
    }

    /**
     * PDF coordinates start from the bottom,
     * therefore sort descending by Y.
     */
    groupedLines.sort((a, b) => b.y - a.y);

    for (const line of groupedLines) {
      line.items.sort((a, b) => a.x - b.x);

      const text = line.items
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        allLines.push(text);
      }
    }
  }

  return allLines;
}

/**
 * Handles PDFs where the item data is extracted as
 * separate lines:
 *
 * 1
 * UNIT
 * PANAFLEX SIGNAGE
 * 47,850
 * SINGLE FACE
 * PRINTING...
 */
function parseLineBasedItems(
  lines: string[],
  warnings: string[],
): ImportedQuotationItem[] {
  const items: ImportedQuotationItem[] = [];

  const cleanLines = lines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const normalizedLines = cleanLines.map(normalizeText);

  const headerIndex = normalizedLines.findIndex(
    (line, index) =>
      line === "qty" &&
      normalizedLines[index + 1] === "unit",
  );

  if (headerIndex === -1) {
    warnings.push(
      "PDF quotation header was not detected.",
    );

    return items;
  }

  let index = headerIndex + 1;

  /**
   * Skip header columns:
   *
   * QTY
   * UNIT
   * ARTICLES/DESCRIPTION
   * UNIT PRICE
   * AMOUNT
   */
  while (
    index < cleanLines.length &&
    !isQuantity(cleanLines[index])
  ) {
    index++;
  }

  let currentItem: ImportedQuotationItem | null = null;

  const flushCurrentItem = () => {
    if (!currentItem) {
      return;
    }

    currentItem.name = currentItem.name.trim();
    currentItem.description =
      currentItem.description?.trim() || "";

    if (
      currentItem.name &&
      currentItem.quantity > 0 &&
      currentItem.unitPrice >= 0
    ) {
      items.push(currentItem);
    }

    currentItem = null;
  };

  while (index < cleanLines.length) {
    const line = cleanLines[index];

    if (isFooter(line)) {
      flushCurrentItem();
      break;
    }

    /**
     * New item structure:
     *
     * quantity
     * unit
     * name
     * price
     */
    if (isQuantity(line)) {
      flushCurrentItem();

      const quantity = Number(line);
      const unit = cleanLines[index + 1]?.trim() || "";
      const name = cleanLines[index + 2]?.trim() || "";
      const price = cleanLines[index + 3]?.trim() || "";

      if (
        unit &&
        name &&
        isPrice(price)
      ) {
        currentItem = {
          name,
          description: "",
          quantity,
          unit,
          unitPrice: parseNumericValue(price),
        };

        index += 4;
        continue;
      }

      warnings.push(
        `Could not parse PDF item near line ${index + 1}.`,
      );
    }

    /**
     * Lines after price become description
     * until the next quantity or footer.
     */
    if (currentItem) {
      currentItem.description = currentItem.description
        ? `${currentItem.description}\n${line}`
        : line;
    }

    index++;
  }

  flushCurrentItem();

  return items;
}

function parseSingleLineItems(
  lines: string[],
  warnings: string[],
): ImportedQuotationItem[] {
  const items: ImportedQuotationItem[] = [];

  const cleanLines = lines
    .map((line) =>
      line
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

  /**
   * Matches PDF rows such as:
   *
   * 1 Ruijie Reyee RG-EG105G-V3 and RG-EG105G-P-V3 75 6,384.00 478,800.00
   *
   * Structure:
   * ITEM NO.
   * DESCRIPTION
   * QTY
   * UNIT PRICE
   * AMOUNT
   */
  const itemPattern =
    /^(\d+)\s+(.+?)\s+(\d+(?:\.\d+)?)\s+((?:₱|PHP|\$)?\s*[\d,]+(?:\.\d{1,2})?)\s+((?:₱|PHP|\$)?\s*[\d,]+(?:\.\d{1,2})?)$/i;

  const totalPattern =
    /^(grand\s+total|total)\s*:/i;

  const footerPattern =
    /^(terms|warranty|thank you|we thank|very truly|confirmed|approved|conforme)/i;

  let currentItem: ImportedQuotationItem | null = null;

  const flushCurrentItem = () => {
    if (!currentItem) {
      return;
    }

    currentItem.name = currentItem.name.trim();
    currentItem.description =
      currentItem.description?.trim() || "";

    if (
      currentItem.name &&
      currentItem.quantity > 0
    ) {
      items.push(currentItem);
    }

    currentItem = null;
  };

  for (const line of cleanLines) {
    // Stop once the total or footer begins.
    if (
      totalPattern.test(line) ||
      footerPattern.test(line)
    ) {
      flushCurrentItem();
      break;
    }

    const match = line.match(itemPattern);

    if (match) {
      flushCurrentItem();

      const [
        ,
        itemNumber,
        description,
        quantity,
        unitPrice,
      ] = match;

      currentItem = {
        name: description.trim(),
        description: "",
        quantity: Number(quantity),
        unit: "UNIT",
        unitPrice: parseNumericValue(unitPrice),
      };

      console.log("[PDF Single-Line Item]", {
        itemNumber,
        name: currentItem.name,
        quantity: currentItem.quantity,
        unitPrice: currentItem.unitPrice,
      });

      continue;
    }

    /**
     * Any non-item line after an item belongs to
     * the current item's description.
     *
     * Example:
     * SPECIFICATION :
     * Core Features...
     * Throughput...
     */
    if (currentItem) {
      currentItem.description = currentItem.description
        ? `${currentItem.description}\n${line}`
        : line;
    }
  }

  flushCurrentItem();

  console.log(
    "[PDF Single-Line Items With Descriptions]",
    items,
  );

  return items;
}


export async function parsePdfQuotation(
  file: File,
): Promise<ImportedQuotationDraft> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(
      "Only PDF files are supported.",
    );
  }

  const lines = await extractPdfLines(file);

  console.log("[PDF Import Lines]", lines);

  const warnings: string[] = [];

  let items = parseLineBasedItems(
    lines,
    warnings,
  );

    if (!items.length) {
        console.log(
            "[PDF Import] Line-based parser found no items. Trying single-line parser...",
        );

        items = parseSingleLineItems(
            lines,
            warnings,
        );
    }

    if (!items.length) {
        throw new Error(
            "No quotation items were detected in the PDF document.",
        );
    }

  console.log("[PDF Import Items]", items);

  return {
    sourceFileName: file.name,
    sourceFileType: "pdf",
    extractionMethod: "local",
    customer: {},
    items,
    discountType: "NONE",
    discountValue: 0,
    taxRate: 0,
    warnings,
  };
}