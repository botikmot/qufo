"use client";

import {
  LoaderCircle,
  X,
  XCircle,
} from "lucide-react";

type PublicQuotationDeclineModalProps = {
  reason: string;
  loading?: boolean;

  onReasonChange: (
    value: string,
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
};

export function PublicQuotationDeclineModal({
  reason,
  loading = false,
  onReasonChange,
  onClose,
  onSubmit,
}: PublicQuotationDeclineModalProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-red-400/[0.08] text-red-300">
              <XCircle
                size={18}
              />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Decline quotation
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tell the business why
              you are declining this
              quotation. They may use
              your feedback to prepare
              a revised quotation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <textarea
          autoFocus
          rows={5}
          value={reason}
          onChange={(event) =>
            onReasonChange(
              event.target.value,
            )
          }
          className="qufo-input mt-6 resize-none"
          placeholder="Example: The current price is above our budget."
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            Keep quotation
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              loading ||
              !reason.trim()
            }
            className="flex items-center gap-2 rounded-xl bg-red-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-red-300 disabled:opacity-50"
          >
            {loading && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            Decline quotation
          </button>
        </div>
      </div>
    </div>
  );
}