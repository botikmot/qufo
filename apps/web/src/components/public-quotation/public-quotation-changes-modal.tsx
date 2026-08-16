"use client";

import {
  LoaderCircle,
  MessageSquareText,
  X,
} from "lucide-react";

type PublicQuotationChangesModalProps = {
  note: string;
  loading?: boolean;

  onNoteChange: (
    value: string,
  ) => void;

  onClose: () => void;
  onSubmit: () => void;
};

export function PublicQuotationChangesModal({
  note,
  loading = false,
  onNoteChange,
  onClose,
  onSubmit,
}: PublicQuotationChangesModalProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface w-full max-w-lg rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-300">
              <MessageSquareText
                size={18}
              />
            </div>

            <h2 className="text-lg font-semibold text-white">
              Request changes
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tell the business
              what you would like
              changed in this
              quotation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <textarea
          autoFocus
          rows={5}
          value={note}
          onChange={(event) =>
            onNoteChange(
              event.target.value,
            )
          }
          className="qufo-input mt-6 resize-none"
          placeholder="Example: Please revise the quantity to 3 pieces and update the total price."
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              loading ||
              !note.trim()
            }
            className="flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-amber-200 disabled:opacity-50"
          >
            {loading && (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            )}

            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}