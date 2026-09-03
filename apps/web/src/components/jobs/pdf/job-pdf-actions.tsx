"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  Eye,
  FileCheck2,
  LoaderCircle,
} from "lucide-react";

import {
  pdf,
} from "@react-pdf/renderer";

import QRCode from "qrcode";

import type {
  Job,
} from "@/types/job";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  JobPdfDocument,
} from "./job-pdf-document";

import {
  mapJobToPdfData,
} from "./map-job-to-pdf-data";

type JobPdfActionsProps = {
  job: Job;

  trackingUrl: string;
};

export function JobPdfActions({
  job,
  trackingUrl,
}: JobPdfActionsProps) {
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
  ] =
    useState<string | null>(
      null,
    );

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
    /*
     * Generate a high-resolution
     * QR image for the PDF.
     */
    const qrCodeDataUrl =
      await QRCode.toDataURL(
        trackingUrl,
        {
          errorCorrectionLevel:
            "H",

          width: 360,

          margin: 1,

          color: {
            dark: "#020617",

            light: "#FFFFFF",
          },
        },
      );

    const data =
      mapJobToPdfData(
        job,
        {
          trackingUrl,
          qrCodeDataUrl,
        },
      );

    return pdf(
      <JobPdfDocument
        data={data}
      />,
    ).toBlob();
  }

  async function handlePreview() {
    try {
      setGenerating(true);

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

      setPdfUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error(
        "Unable to preview job confirmation PDF.",
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

    anchor.href = pdfUrl;

    anchor.download =
      `${job.jobNumber}-confirmation.pdf`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();
  }

  function handleOpenChange(
    open: boolean,
  ) {
    setPreviewOpen(open);

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
      <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
              <FileCheck2
                size={16}
              />

              Job confirmation PDF
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Preview and download
              a customer copy with
              the secure tracking QR
              code.
            </p>
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={() => {
              void handlePreview();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Eye size={16} />
            )}

            {generating
              ? "Preparing..."
              : "Preview PDF"}
          </button>
        </div>
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
                  {job.jobNumber}
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs text-slate-500">
                  Preview the job
                  confirmation and
                  tracking QR before
                  downloading.
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
                title={`Job confirmation ${job.jobNumber}`}
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