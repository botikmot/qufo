"use client";

import {
  Check,
  Clipboard,
  MapPin,
  Send,
} from "lucide-react";

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

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.1] disabled:opacity-50"
        >
          <Send size={15} />

          {trackingEnabled
            ? "Regenerate link"
            : "Generate link"}
        </button>
      </div>

      {trackingError && (
        <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
          {trackingError}
        </div>
      )}

      {trackingLink && (
        <div className="mt-4 flex gap-2">
          <input
            readOnly
            value={trackingLink}
            className="qufo-input min-w-0 flex-1 text-xs"
          />

          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-medium text-slate-950"
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
        </div>
      )}
    </div>
  );
}