import type { ImportedQuotationDraft } from "@/types/quotation-import";
import { parseXlsxQuotation } from "./parse-xlsx";
import { parseWordQuotation } from "./parse-word";

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
      throw new Error(
        "PDF import is not yet enabled. The PDF parser is still being implemented.",
      );

    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
      throw new Error(
        "Image import is not yet enabled. Image OCR is still being implemented.",
      );

    default:
      throw new Error(
        "Unsupported file type. Please upload an Excel, Word, PDF, or image quotation.",
      );
  }
}