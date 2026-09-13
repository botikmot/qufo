import { NextResponse } from "next/server";

import { parseQuotationTextWithOllama } from "@/lib/quotation-import/parse-with-ollama";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawText =
      typeof body?.rawText === "string"
        ? body.rawText
        : "";

    const sourceFileName =
      typeof body?.sourceFileName === "string"
        ? body.sourceFileName
        : "quotation-image";

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          message: "OCR text is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await parseQuotationTextWithOllama(
      rawText,
      sourceFileName,
      "image",
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Ollama Quotation Import Error]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to parse quotation using Ollama.",
      },
      {
        status: 500,
      },
    );
  }
}