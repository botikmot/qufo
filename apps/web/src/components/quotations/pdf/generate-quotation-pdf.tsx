import {
  pdf,
} from "@react-pdf/renderer";

import type {
  QuotationDetail,
} from "@/types/quotation";

import {
  mapQuotationToPdfData,
} from "./map-quotation-to-pdf-data";

import {
  QuotationPdfDocument,
} from "./quotation-pdf-document";

export async function generateQuotationPdfBlob(
  quotation: QuotationDetail,
): Promise<Blob> {
  const data =
    mapQuotationToPdfData(
      quotation,
    );

  return pdf(
    <QuotationPdfDocument
      data={data}
    />,
  ).toBlob();
}