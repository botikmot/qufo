import "server-only";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
  QuotationImportFileType,
} from "@/types/quotation-import";

type OllamaQuotationResponse = {
  customer?: {
    name?: string;
    companyName?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  subject?: string;
  message?: string;
  items?: Array<{
    name?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
  }>;
};

function extractJson(text: string): OllamaQuotationResponse {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Ollama did not return valid JSON.");
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);

  return JSON.parse(jsonText) as OllamaQuotationResponse;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export async function parseQuotationTextWithOllama(
  rawText: string,
  sourceFileName: string,
  sourceFileType: QuotationImportFileType,
): Promise<ImportedQuotationDraft> {
  const model =
    process.env.OLLAMA_QUOTATION_MODEL || "qwen2.5vl";

  const ollamaBaseUrl =
    process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

  const prompt = `
You are an expert quotation document extraction assistant.

Convert the OCR text below into structured quotation data.

Return ONLY valid JSON. Do not include markdown, explanations, or reasoning.

Required JSON structure:
{
  "customer": {
    "name": "",
    "companyName": "",
    "address": "",
    "email": "",
    "phone": ""
  },
  "subject": "",
  "message": "",
  "items": [
    {
      "name": "",
      "description": "",
      "quantity": 1,
      "unit": "UNIT",
      "unitPrice": 0
    }
  ]
}

Important extraction rules:

1. Extract every actual product or service listed in the quotation table.
2. The quotation table may have columns such as:
   NO., PRODUCT / SERVICE, DESCRIPTION, QTY, PRICE, UNIT PRICE, TOTAL, AMOUNT.
3. Do not skip an item merely because its item number, quantity, or one price column is missing from OCR.
4. Preserve the original order of the quotation items.
5. If an item number is missing or unreadable, still extract the product/service name.
6. If quantity is missing but the line clearly represents one service, use quantity 1.
7. If quantity is missing but line total and unit price are available, infer quantity when mathematically reasonable.
8. The unitPrice must be the price for one unit, not the line total.
9. If only one price is visible for an item and it appears to be both unit price and total, use that price as unitPrice.
10. Remove currency symbols and commas from numeric values.
11. Treat $, USD, PHP, ₱, and similar currency symbols as formatting only.
12. Do not include subtotal, grand total, total, tax, discount, balance, payment terms, or shipping notes as items.
13. Do not invent product/service names that are not present in the OCR text.
14. If a product/service name is unreadable, do not replace it with a guessed name.
15. Preserve important specifications in description.
16. If a field is not available, use an empty string.
17. Return an empty items array only if no actual product/service names can be found.

OCR TEXT:
${rawText}
`;

  const response = await fetch(
    `${ollamaBaseUrl}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
        think: false,
        options: {
          temperature: 0,
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama request failed: ${response.status} ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    response?: string;
  };

  if (!data.response) {
    throw new Error("Ollama returned an empty response.");
  }

  const parsed = extractJson(data.response);

  const items: ImportedQuotationItem[] = (parsed.items ?? [])
    .map((item) => ({
      name: item.name?.trim() || "",
      description: item.description?.trim() || "",
      quantity: normalizeNumber(item.quantity, 1),
      unit: item.unit?.trim() || "UNIT",
      unitPrice: normalizeNumber(item.unitPrice, 0),
    }))
    .filter(
      (item) =>
        item.name.length > 0 &&
        item.quantity > 0 &&
        item.unitPrice >= 0,
    );

  return {
    sourceFileName,
    sourceFileType,
    extractionMethod: "ocr+ollama",

    customer: {
      name: parsed.customer?.name?.trim() || "",
      companyName: parsed.customer?.companyName?.trim() || "",
      address: parsed.customer?.address?.trim() || "",
      email: parsed.customer?.email?.trim() || "",
      phone: parsed.customer?.phone?.trim() || "",
    },

    subject: parsed.subject?.trim() || "",
    notes: parsed.message?.trim() || "",

    items,

    // Temporary defaults; adjust only if your type uses different values.
    discountType: "FIXED",
    discountValue: 0,
    taxRate: 0,

    warnings: [],
  };
}