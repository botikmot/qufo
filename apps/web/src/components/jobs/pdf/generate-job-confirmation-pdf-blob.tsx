import {
  pdf,
} from "@react-pdf/renderer";

import QRCode from "qrcode";

import {
  JobPdfDocument,
} from "./job-pdf-document";

import type {
  JobPdfData,
} from "./job-pdf-types";

type ConfirmationPdfData =
  Omit<
    JobPdfData,
    | "trackingUrl"
    | "qrCodeDataUrl"
  >;

export async function generateJobConfirmationPdfBlob(
  pdfData: ConfirmationPdfData,
  trackingUrl: string,
): Promise<Blob> {
  const qrCodeDataUrl =
    await QRCode.toDataURL(
      trackingUrl,
      {
        type: "image/png",
        width: 320,
        margin: 1,
        errorCorrectionLevel:
          "M",
      },
    );

  const data: JobPdfData = {
    ...pdfData,

    trackingUrl,
    qrCodeDataUrl,
  };

  return pdf(
    <JobPdfDocument
      data={data}
    />,
  ).toBlob();
}