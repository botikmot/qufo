import type { ImportedQuotationDraft } from "@/types/quotation-import";
import { parseXlsxQuotation } from "./parse-xlsx";
import { parseWordQuotation } from "./parse-word";
import { parsePdfQuotation } from "./parse-pdf";
// import { extractImageText } from "./parse-image";

const ACCEPTED_EXTENSIONS = [
  ".xlsx",
  ".xls",
  ".csv",
  ".docx",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const;

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

export function isSupportedQuotationImportFile(file: File): boolean {
  const extension = getFileExtension(file.name);

  return ACCEPTED_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_EXTENSIONS)[number],
  );
}

async function parseQuotationImageWithVision(file: File) {
  const imageBase64 = await fileToDataUrl(file);

  const response = await fetch("/api/quotation-import/vision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageBase64,
    }),
  });

  const data = await response.json();

  console.log(
    "[VISION IMPORT] Full API response:",
    JSON.stringify(data, null, 2),
  );

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to parse quotation image with vision AI.",
    );
  }

  return data;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read image file."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Failed to convert image to base64."));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts the raw Vision API response into the standard
 * ImportedQuotationDraft format used by the quotation form.
 */
function normalizeVisionQuotationResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  file: File,
): ImportedQuotationDraft {
  const rawItems = Array.isArray(raw?.items)
    ? raw.items
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = rawItems.map((item: any) => {
    const quantity = Number(item?.quantity ?? 1);

    const unitPrice = Number(
      item?.unitPrice ??
        item?.unit_price ??
        item?.price ??
        0,
    );

    const total = Number(
      item?.total ??
        item?.amount ??
        item?.lineTotal ??
        quantity * unitPrice,
    );

    return {
      name:
        item?.name ??
        item?.description ??
        "",

      description:
        item?.description ??
        undefined,

      quantity: Number.isFinite(quantity)
        ? quantity
        : 1,

      unit:
        item?.unit ??
        "unit",

      unitPrice: Number.isFinite(unitPrice)
        ? unitPrice
        : 0,
    };
  });

  return {
    sourceFileName: file.name,

    sourceFileType: "image",

    extractionMethod: "ai",

    customer: {
      name:
        raw?.customer?.name ??
        raw?.customerName ??
        undefined,

      companyName:
        raw?.customer?.companyName ??
        raw?.companyName ??
        undefined,

      address:
        raw?.customer?.address ??
        raw?.customerAddress ??
        undefined,

      email:
        raw?.customer?.email ??
        raw?.customerEmail ??
        undefined,

      phone:
        raw?.customer?.phone ??
        raw?.customerPhone ??
        undefined,
    },

    subject:
      raw?.subject ??
      undefined,

    validUntil:
      raw?.validUntil ??
      undefined,

    items,

    discountType: "PERCENTAGE",

    discountValue: 0,

    taxRate: Number(raw?.taxRate ?? 0),

    notes:
      raw?.notes ??
      undefined,

    terms:
      raw?.terms ??
      undefined,

    warnings: Array.isArray(raw?.warnings)
      ? raw.warnings
      : [],
  };
}

export async function importQuotationFile(
  file: File,
): Promise<ImportedQuotationDraft> {
  const extension = getFileExtension(file.name);

  switch (extension) {
    case ".xlsx":
    case ".xls":
    case ".csv":
      return parseXlsxQuotation(file);

    case ".docx":
    case ".doc":
      return parseWordQuotation(file);

    case ".pdf":
      return parsePdfQuotation(file);

    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp": {
      const rawVisionResponse =
        await parseQuotationImageWithVision(file);

      return normalizeVisionQuotationResponse(
        rawVisionResponse,
        file,
      );
    }

    default:
      throw new Error(
        "Unsupported file type. Please upload an Excel, Word, PDF, or image quotation.",
      );
  }
}