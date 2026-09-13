import * as pdfjsLib from "pdfjs-dist";

import type {
  ImportedQuotationDraft,
  ImportedQuotationItem,
} from "@/types/quotation-import";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

type VisionQuotationResponse = {
  customerName?: string | null;
  quotationDate?: string | null;
  validUntil?: string | null;
  subject?: string | null;
  items?: Array<{
    description?: string | null;
    quantity?: number | string | null;
    unitPrice?: number | string | null;
    total?: number | string | null;
  }>;
  subtotal?: number | string | null;
  tax?: number | string | null;
  grandTotal?: number | string | null;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(
    value
      .replace(/₱/gi, "")
      .replace(/PHP/gi, "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim(),
  );

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

async function renderPdfPagesToImages(
  file: File,
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  const images: string[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({
      scale: 2,
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Could not create canvas context for PDF rendering.",
      );
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvas,
        viewport,
    }).promise;

    images.push(
      canvas.toDataURL("image/jpeg", 0.85),
    );
  }

  return images;
}

async function sendImageToVision(
  imageBase64: string,
): Promise<VisionQuotationResponse> {
  const response = await fetch(
    "/api/quotation-import/vision",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to parse PDF page using vision AI.",
    );
  }

  return data;
}

function mergeVisionResponses(
  responses: VisionQuotationResponse[],
): VisionQuotationResponse {
  const first = responses[0];

  return {
    customerName:
      responses.find((response) => response.customerName)
        ?.customerName ?? null,

    quotationDate:
      responses.find((response) => response.quotationDate)
        ?.quotationDate ?? null,

    validUntil:
      responses.find((response) => response.validUntil)
        ?.validUntil ?? null,

    subject:
      responses.find((response) => response.subject)
        ?.subject ?? null,

    items: responses.flatMap(
      (response) => response.items ?? [],
    ),

    subtotal:
      responses
        .slice()
        .reverse()
        .find((response) => response.subtotal != null)
        ?.subtotal ??
      first?.subtotal ??
      null,

    tax:
      responses
        .slice()
        .reverse()
        .find((response) => response.tax != null)
        ?.tax ??
      first?.tax ??
      null,

    grandTotal:
      responses
        .slice()
        .reverse()
        .find((response) => response.grandTotal != null)
        ?.grandTotal ??
      first?.grandTotal ??
      null,
  };
}

function normalizeVisionResponse(
  response: VisionQuotationResponse,
  file: File,
): ImportedQuotationDraft {
  const items: ImportedQuotationItem[] = (
    response.items ?? []
  ).map((item) => {
    const quantity = toNumber(item.quantity, 1);
    const unitPrice = toNumber(item.unitPrice, 0);

    return {
      name: item.description?.trim() || "Imported item",
      description: item.description?.trim() || "",
      quantity: quantity > 0 ? quantity : 1,
      unit: "UNIT",
      unitPrice,
    };
  });

  return {
    sourceFileName: file.name,
    sourceFileType: "pdf",
    extractionMethod: "ai",

    customer: {
      name: response.customerName ?? undefined,
    },

    subject: response.subject ?? undefined,
    validUntil: response.validUntil ?? undefined,

    items,

    discountType: "NONE",
    discountValue: 0,
    taxRate: 0,

    warnings: [
      "This PDF was imported using vision AI because no readable PDF text/items were detected.",
    ],
  };
}

export async function parsePdfQuotationWithVision(
  file: File,
): Promise<ImportedQuotationDraft> {
  const pageImages = await renderPdfPagesToImages(file);

  if (!pageImages.length) {
    throw new Error(
      "No pages were found in the PDF document.",
    );
  }

  const responses: VisionQuotationResponse[] = [];

  for (const imageBase64 of pageImages) {
    const response = await sendImageToVision(
      imageBase64,
    );

    responses.push(response);
  }

  const mergedResponse = mergeVisionResponses(
    responses,
  );

  const draft = normalizeVisionResponse(
    mergedResponse,
    file,
  );

  if (!draft.items.length) {
    throw new Error(
      "Vision AI could not detect quotation items in this PDF.",
    );
  }

  return draft;
}