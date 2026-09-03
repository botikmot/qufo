"use client";

import {
  useRef,
  useState,
} from "react";

import {
  Check,
  Clipboard,
  Download,
  ExternalLink,
  MapPin,
  QrCode,
  Send,
} from "lucide-react";

import {
  QRCodeCanvas,
} from "qrcode.react";

type JobTrackingCardProps = {
  trackingEnabled: boolean;

  trackingLink:
    | string
    | null;

  trackingError:
    | string
    | null;

  copied: boolean;

  loading?: boolean;

  onGenerate: () => void;

  onCopy: () => void;
};

export function JobTrackingCard({
  trackingEnabled,
  trackingLink,
  trackingError,
  copied,
  loading = false,
  onGenerate,
  onCopy,
}: JobTrackingCardProps) {
  const [
    showQrCode,
    setShowQrCode,
  ] = useState(false);

  const qrCanvasRef =
    useRef<HTMLCanvasElement>(
      null,
    );

  function downloadQrCode() {
    const canvas =
      qrCanvasRef.current;

    if (!canvas) {
      return;
    }

    const downloadLink =
      document.createElement(
        "a",
      );

    downloadLink.download =
      "qufo-job-tracking-qr.png";

    downloadLink.href =
      canvas.toDataURL(
        "image/png",
      );

    document.body.appendChild(
      downloadLink,
    );

    downloadLink.click();
    downloadLink.remove();
  }

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
            <MapPin size={16} />

            Customer tracking
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Generate a secure
            public link so the
            customer can follow
            job progress.
          </p>
        </div>

        {!trackingEnabled &&
          !trackingLink && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />

              {loading
                ? "Generating..."
                : "Generate link"}
            </button>
          )}
      </div>

      {trackingError && (
        <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
          {trackingError}
        </div>
      )}

      {trackingLink && (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <input
              readOnly
              value={trackingLink}
              className="qufo-input min-w-0 text-xs"
            />

            <button
              type="button"
              onClick={onCopy}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
            >
              {copied ? (
                <Check size={15} />
              ) : (
                <Clipboard
                  size={15}
                />
              )}

              {copied
                ? "Copied"
                : "Copy"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowQrCode(
                  (current) =>
                    !current,
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.1]"
            >
              <QrCode size={15} />

              {showQrCode
                ? "Hide QR"
                : "Show QR"}
            </button>
          </div>

          {showQrCode && (
            <div className="mt-4 flex flex-col items-center gap-5 rounded-2xl border border-cyan-400/10 bg-slate-950/30 p-5 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-2xl bg-white p-3 shadow-2xl shadow-cyan-950/40">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={trackingLink}
                  size={200}
                  level="H"
                  marginSize={1}
                  bgColor="#ffffff"
                  fgColor="#020617"
                  title="QUFO job tracking QR code"
                />
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-100 sm:justify-start">
                  <QrCode
                    size={16}
                    className="text-cyan-300"
                  />

                  Scan to track this
                  order
                </div>

                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                  Customers can scan
                  this QR code using
                  their phone camera
                  to view the latest
                  job progress.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      downloadQrCode
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                  >
                    <Download
                      size={15}
                    />

                    Download QR
                  </button>

                  <a
                    href={trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.1]"
                  >
                    <ExternalLink
                      size={15}
                    />

                    Open tracking
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}