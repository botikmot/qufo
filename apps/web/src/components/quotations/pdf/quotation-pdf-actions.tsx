"use client";

import {
  useState,
} from "react";

import {
  Download,
  LoaderCircle,
  Printer,
} from "lucide-react";

import {
  pdf,
} from "@react-pdf/renderer";

import type {
  QuotationDetail,
} from "@/types/quotation";

import { QuotationPdfDocument } from "./quotation-pdf-document";

import {
  mapQuotationToPdfData,
} from "./map-quotation-to-pdf-data";

type QuotationPdfActionsProps = {
  quotation: QuotationDetail;
};

export function QuotationPdfActions({
  quotation,
}: QuotationPdfActionsProps) {
  const [
    generating,
    setGenerating,
  ] = useState<
    "download" | "print" | null
  >(null);

  async function createPdfBlob() {
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

  async function handleDownload() {
    try {
      setGenerating(
        "download",
      );

      const blob =
        await createPdfBlob();

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      anchor.download =
        `${quotation.quotationNumber}.pdf`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url,
      );
    } catch (error) {
      console.error(
        "Unable to download quotation PDF.",
        error,
      );
    } finally {
      setGenerating(null);
    }
  }

  const busy =
    generating !== null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void handleDownload()
        }
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-[var(--qufo-border)]
          bg-white/[0.03]
          px-4
          py-2.5
          text-sm
          font-medium
          text-slate-300
          transition
          hover:bg-white/[0.06]
          hover:text-white
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {generating ===
        "download" ? (
          <LoaderCircle
            size={16}
            className="animate-spin"
          />
        ) : (
          <Download
            size={16}
          />
        )}

        Download PDF
      </button>
    </div>
  );
}