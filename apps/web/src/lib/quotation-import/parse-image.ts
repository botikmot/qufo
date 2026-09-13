import { createWorker } from "tesseract.js";
import Tesseract from "tesseract.js";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
} from "@/types/quotation-import";

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

function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseImageLines(
  lines: string[],
  warnings: string[],
): ImportedQuotationItem[] {
  const items: ImportedQuotationItem[] = [];

  /**
   * Tesseract sometimes returns the entire document as one long line.
   * Therefore, join all lines and parse quotation rows using patterns.
   */
  const text = lines
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  /**
   * Matches quotation rows like:
   *
   * [Service Fee] 230.00 230.00
   * ([Labor @ $75/hr] 75.00 375.00
   * [Parts] 25.00 75.00
   * [Parts] 25.00 3 X 75.00
   *
   * Structure:
   * [Description] [Unit Price] [Optional Qty] [Optional Tax Marker] [Amount]
   */
  const moneyPattern =
    String.raw`(?:₱|PHP|\$)?\s*[\d,]+(?:\.\d{1,2})?`;

  const itemRowPattern = new RegExp(
    String.raw`\(?\s*\[([^\]]+)\]\s+(${moneyPattern})\s+(?:(\d+(?:\.\d+)?)\s+)?(?:X\s+)?(${moneyPattern})(?=\s|$)`,
    "gi",
  );

  const totalPattern =
    /\b(grand\s+total|subtotal|taxable|tax\s+due|amount\s+due|total)\b/i;

  const footerPattern =
    /\b(terms\s+and\s+conditions|warranty|thank\s+you|very\s+truly|customer\s+acceptance|prepared\s+by|checked\s+by)\b/i;

  let match: RegExpExecArray | null;

  while ((match = itemRowPattern.exec(text)) !== null) {
    const [
      ,
      rawName,
      rawUnitPrice,
      rawQuantity,
      rawAmount,
    ] = match;

    const name = rawName.trim();
    const unitPrice = parseNumericValue(rawUnitPrice);
    const amount = parseNumericValue(rawAmount);

    if (!name) {
      continue;
    }

    if (!Number.isFinite(unitPrice)) {
      continue;
    }

    if (!Number.isFinite(amount)) {
      continue;
    }

    /**
     * If OCR detects quantity, use it.
     * Otherwise infer quantity:
     *
     * Amount / Unit Price
     *
     * Example:
     * Labor: 375 / 75 = 5
     */
    let quantity = rawQuantity
      ? Number(rawQuantity)
      : 1;

    if (
      !rawQuantity &&
      unitPrice > 0 &&
      amount > 0
    ) {
      const inferredQuantity = amount / unitPrice;

      if (
        Number.isFinite(inferredQuantity) &&
        inferredQuantity > 0
      ) {
        quantity = Number(
          inferredQuantity.toFixed(4),
        );
      }
    }

    const item: ImportedQuotationItem = {
      name,
      description: "",
      quantity,
      unit: "UNIT",
      unitPrice,
    };

    items.push(item);

    console.log("[Image OCR Item]", {
      name,
      quantity,
      unit: "UNIT",
      unitPrice,
      amount,
    });
  }

  /**
   * Remove possible duplicates.
   * This protects against OCR/parser reprocessing.
   */
  const uniqueItems = items.filter(
    (item, index, array) => {
      return (
        index ===
        array.findIndex(
          (other) =>
            other.name === item.name &&
            other.quantity === item.quantity &&
            other.unitPrice === item.unitPrice,
        )
      );
    },
  );

  if (!uniqueItems.length) {
    warnings.push(
      "No structured quotation items were detected from the image text.",
    );
  }

  console.log(
    "[Image OCR Parsed Items]",
    uniqueItems,
  );

  return uniqueItems;
}

export async function parseImageQuotation(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ImportedQuotationDraft> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid quotation image.");
  }

  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(file, {
      rotateAuto: true,
    });

    onProgress?.(100);

    const rawText = normalizeOcrText(result.data.text);

    console.log("[Image OCR Raw Text]", rawText);

    const lines = rawText.split("\n");

    const warnings: string[] = [];
    const items = parseImageLines(lines, warnings);

    console.log("[Image OCR Parsed Items]", items);

    return {
        sourceFileName: file.name,
        sourceFileType: "image",
        extractionMethod: "local",
        customer: {},
        items,
        discountType: "NONE",
        discountValue: 0,
        taxRate: 0,
        warnings,
    };
  } finally {
    await worker.terminate();
  }
}

async function preprocessImageForOcr(
  file: File,
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        img.src = imageUrl;
      },
    );

    const scale = 3;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context.");
    }

    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];

      // Grayscale conversion
      const gray = Math.round(
        0.299 * red +
          0.587 * green +
          0.114 * blue,
      );

      // Increase contrast
      const contrast = 1.5;
      const adjusted = Math.max(
        0,
        Math.min(
          255,
          (gray - 128) * contrast + 128,
        ),
      );

      pixels[index] = adjusted;
      pixels[index + 1] = adjusted;
      pixels[index + 2] = adjusted;
    }

    context.putImageData(imageData, 0, 0);

    const processedBlob = await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error("Failed to process image."),
              );
            }
          },
          "image/png",
          1,
        );
      },
    );

    return processedBlob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function cropQuotationTable(
  file: File,
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;

        img.src = imageUrl;
      },
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context.");
    }

    /*
     * For the uploaded quotation template:
     * image size: approximately 768 x 1086
     *
     * Table area:
     * x: 6% to 94%
     * y: 36% to 53%
     *
     * These values can be adjusted for other quotation layouts.
     */

    const sourceX = image.width * 0.06;
    const sourceY = image.height * 0.36;
    const sourceWidth = image.width * 0.88;
    const sourceHeight = image.height * 0.18;

    const scale = 4;

    canvas.width = sourceWidth * scale;
    canvas.height = sourceHeight * scale;

    context.imageSmoothingEnabled = false;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error("Failed to crop quotation table."),
              );
            }
          },
          "image/png",
          1,
        );
      },
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function isUsefulTableOcrText(text: string): boolean {
  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  const hasProductWords =
    /\b(brand|design|guidelines|social|media|branding|marketing|collateral|service|product)\b/i.test(
      normalized,
    );

  const hasMultipleReadableWords =
    (normalized.match(/[A-Za-z]{4,}/g) ?? []).length >= 2;

  return hasProductWords || hasMultipleReadableWords;
}

export async function extractImageText(
  file: File,
): Promise<string> {
  const wholeImageResult = await Tesseract.recognize(
    file,
    "eng",
    {
      logger: (message) => {
        console.log("[OCR WHOLE IMAGE]", message);
      },
    },
  );

  const wholeImageText = wholeImageResult.data.text;

  console.log(
    "[OCR WHOLE IMAGE TEXT]",
    wholeImageText,
  );

  const tableImage = await cropQuotationTable(file);

  const tableResult = await Tesseract.recognize(
    tableImage,
    "eng",
    {
      logger: (message) => {
        console.log("[OCR TABLE]", message);
      },
    },
  );

  const tableText = tableResult.data.text;

  console.log("[OCR TABLE TEXT]", tableText);

  if (isUsefulTableOcrText(tableText)) {
    return `
WHOLE QUOTATION OCR:
${wholeImageText}

TABLE-FOCUSED OCR:
${tableText}
    `.trim();
  }

  return wholeImageText;
}