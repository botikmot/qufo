import { NextResponse } from "next/server";

import { parseQuotationImageWithVision } from "@/lib/quotation-import/parse-with-vision";

export const runtime = "nodejs";

type VisionRequestBody = {
  imageBase64?: string;
};

function removeDataUrlPrefix(value: string): string {
  return value.replace(
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
    "",
  );
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VisionRequestBody;

    if (!body.imageBase64) {
      return NextResponse.json(
        {
          message: "Image data is required.",
        },
        {
          status: 400,
        },
      );
    }

    const imageBase64 = removeDataUrlPrefix(
      body.imageBase64,
    );

    const result =
      await parseQuotationImageWithVision(imageBase64);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "[QUOTATION VISION IMPORT ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to process quotation image.",
      },
      {
        status: 500,
      },
    );
  }
}