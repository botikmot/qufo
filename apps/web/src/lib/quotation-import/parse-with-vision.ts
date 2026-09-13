import "server-only";

type VisionQuotationItem = {
  description: string | null;
  quantity: number | string | null;
  unitPrice: number | string | null;
  total: number | string | null;
};

export type VisionQuotationResult = {
  customerName: string | null;
  quotationDate: string | null;
  validUntil: string | null;
  subject: string | null;
  items: VisionQuotationItem[];
  subtotal: number | string | null;
  tax: number | string | null;
  grandTotal: number | string | null;
};

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434";

const OLLAMA_VISION_MODEL =
  process.env.OLLAMA_VISION_MODEL || "qwen2.5vl";

function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();

  // Remove Markdown code fences if the model returns them.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // If the model includes extra text around the JSON,
  // extract the first JSON object.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function toNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = value
    .replace(/[^0-9.-]/g, "")
    .trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeResult(
  result: Partial<VisionQuotationResult>,
): VisionQuotationResult {
  const rawItems = Array.isArray(result.items)
    ? result.items
    : [];

  const items: VisionQuotationItem[] = rawItems
    .map((item) => ({
      description:
        typeof item?.description === "string"
          ? item.description.trim()
          : null,
      quantity: toNumber(item?.quantity),
      unitPrice: toNumber(item?.unitPrice),
      total: toNumber(item?.total),
    }))
    .filter((item) => {
      return Boolean(
        item.description ||
          item.quantity !== null ||
          item.unitPrice !== null ||
          item.total !== null,
      );
    });

  return {
    customerName:
      typeof result.customerName === "string"
        ? result.customerName.trim()
        : null,

    quotationDate:
      typeof result.quotationDate === "string"
        ? result.quotationDate.trim()
        : null,

    validUntil:
      typeof result.validUntil === "string"
        ? result.validUntil.trim()
        : null,

    subject:
      typeof result.subject === "string"
        ? result.subject.trim()
        : null,

    items,

    subtotal: toNumber(result.subtotal),
    tax: toNumber(result.tax),
    grandTotal: toNumber(result.grandTotal),
  };
}

export async function parseQuotationImageWithVision(
  imageBase64: string,
): Promise<VisionQuotationResult> {
  const prompt = `
Analyze this quotation image carefully and extract its information.

Return JSON only. Do not return Markdown, explanations, or comments.

Rules:
- Read the customer or company name.
- Read the quotation date and validity date if visible.
- Read the subject/title if visible.
- Read every product or service row in the quotation table.
- Preserve the exact product/service description as much as possible.
- Extract quantity, unit price, and total for every item.
- Extract subtotal, tax, and grand total if visible.
- Do not invent values.
- If a value is missing or unreadable, use null.
- Numeric fields must contain numbers only, without currency symbols or commas.
- If there are no readable items, return an empty items array.

Use exactly this JSON structure:

{
  "customerName": null,
  "quotationDate": null,
  "validUntil": null,
  "subject": null,
  "items": [
    {
      "description": null,
      "quantity": null,
      "unitPrice": null,
      "total": null
    }
  ],
  "subtotal": null,
  "tax": null,
  "grandTotal": null
}
`;

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [imageBase64],
        },
      ],
      stream: false,
      format: "json",
      options: {
        temperature: 0,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama vision request failed: ${response.status} ${errorText}`,
    );
  }

  const data =
    (await response.json()) as OllamaChatResponse;

  const content = data.message?.content;

  if (!content) {
    throw new Error(
      "Ollama vision model returned an empty response.",
    );
  }

  const cleanedJson = cleanJsonResponse(content);

  let parsed: Partial<VisionQuotationResult>;

  try {
    parsed = JSON.parse(cleanedJson);
  } catch {
    throw new Error(
      "Ollama vision model returned invalid JSON.",
    );
  }

  return normalizeResult(parsed);
}