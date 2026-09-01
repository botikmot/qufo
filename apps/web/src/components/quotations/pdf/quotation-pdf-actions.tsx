"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  Eye,
  LoaderCircle,
} from "lucide-react";

import {
  pdf,
} from "@react-pdf/renderer";

import type {
  QuotationDetail,
} from "@/types/quotation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  ] = useState(false);

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    pdfUrl,
    setPdfUrl,
  ] = useState<string | null>(
    null,
  );

  /*
   * Clean up the browser blob URL.
   */
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(
          pdfUrl,
        );
      }
    };
  }, [pdfUrl]);

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

  async function handlePreview() {
    try {
      setGenerating(true);

      /*
       * Remove previous preview URL
       * before generating a new one.
       */
      if (pdfUrl) {
        URL.revokeObjectURL(
          pdfUrl,
        );

        setPdfUrl(null);
      }

      const blob =
        await createPdfBlob();

      const url =
        URL.createObjectURL(
          blob,
        );

      setPdfUrl(
        url,
      );

      setPreviewOpen(
        true,
      );
    } catch (error) {
      console.error(
        "Unable to preview quotation PDF.",
        error,
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!pdfUrl) {
      return;
    }

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      pdfUrl;

    anchor.download =
      `${quotation.quotationNumber}.pdf`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();
  }

  function handleOpenChange(
    open: boolean,
  ) {
    setPreviewOpen(
      open,
    );

    /*
     * We can release the blob once
     * the preview is closed.
     */
    if (
      !open &&
      pdfUrl
    ) {
      URL.revokeObjectURL(
        pdfUrl,
      );

      setPdfUrl(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
        <button
          type="button"
          disabled={generating}
          onClick={() => {
            void handlePreview();
          }}
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
          {generating ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Eye
              size={16}
            />
          )}

          {generating
            ? "Preparing..."
            : "Preview PDF"}
        </button>
      </div>

      <Dialog
        open={previewOpen}
        onOpenChange={
          handleOpenChange
        }
      >
        <DialogContent
          className="
            flex
            h-[92vh]
            w-[96vw]
            max-w-6xl!
            flex-col
            gap-0
            overflow-hidden
            border-[var(--qufo-border)]
            bg-[#07111f]
            p-0
          "
        >
          <DialogHeader
            className="
              shrink-0
              border-b
              border-[var(--qufo-border)]
              px-6
              py-4
            "
          >
            <div className="flex items-center justify-between gap-4 pr-8">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base text-white">
                  {quotation.quotationNumber}
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs text-slate-500">
                  Preview the quotation before downloading.
                </DialogDescription>
              </div>

              <button
                type="button"
                disabled={!pdfUrl}
                onClick={
                  handleDownload
                }
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-400
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-950
                  transition
                  hover:bg-emerald-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Download
                  size={16}
                />

                Download PDF
              </button>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 bg-slate-950/70 p-3 sm:p-5">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title={`Quotation ${quotation.quotationNumber}`}
                className="
                  h-full
                  w-full
                  rounded-xl
                  border
                  border-[var(--qufo-border)]
                  bg-white
                "
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <LoaderCircle
                  size={24}
                  className="animate-spin text-cyan-300"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}