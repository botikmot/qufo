"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  Send,
} from "lucide-react";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationSendModalProps = {
  quotation: Quotation;

  url?: string | null;

  loading?: boolean;

  copied?: boolean;

  onClose: () => void;

  onSend: () => void;

  onCopy: () => void;

  onOpen: () => void;
};

export function QuotationSendModal({
  quotation,
  url,
  loading = false,
  copied = false,
  onClose,
  onSend,
  onCopy,
  onOpen,
}: QuotationSendModalProps) {
  const sent =
    Boolean(url);

  return (
    <QufoModal
      title={
        sent
          ? "Quotation sent"
          : "Quotation ready to send"
      }
      description={
        quotation.quotationNumber
      }
      onClose={onClose}
      closeDisabled={
        loading
      }
      size="lg"
    >
      <div className="space-y-5">
        {!sent ? (
          <>
            <div
              className="
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-[var(--qufo-border)]
                bg-white/[0.02]
                p-5
              "
            >
              <div
                className="
                  flex
                  size-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-300/10
                  text-cyan-300
                "
              >
                <Send
                  size={18}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Your quotation has been created.
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Send it now so your customer can review,
                  approve, decline, or request changes.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  text-slate-400
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Not now
              </button>

              <button
                type="button"
                onClick={onSend}
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-300
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-950
                  transition
                  hover:bg-cyan-200
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send
                    size={16}
                  />
                )}

                {loading
                  ? "Sending..."
                  : "Send quotation"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-emerald-400/15
                bg-emerald-400/[0.04]
                p-5
              "
            >
              <div
                className="
                  flex
                  size-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-400/10
                  text-emerald-300
                "
              >
                <CheckCircle2
                  size={19}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Ready to share
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Share this secure link with your customer
                  so they can review and respond to the quotation.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs text-slate-500">
                Customer quotation link
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--qufo-border)]
                  bg-black/20
                  p-2
                "
              >
                <input
                  value={
                    url ?? ""
                  }
                  readOnly
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-2
                    text-sm
                    text-slate-300
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={
                    onCopy
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-[var(--qufo-border)]
                    px-3
                    py-2
                    text-xs
                    text-slate-300
                    transition
                    hover:bg-white/[0.04]
                  "
                >
                  {copied ? (
                    <Check
                      size={14}
                    />
                  ) : (
                    <Copy
                      size={14}
                    />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  text-slate-400
                  transition
                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                Done
              </button>

              <button
                type="button"
                onClick={onOpen}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--qufo-border)]
                  px-4
                  py-2.5
                  text-sm
                  text-slate-300
                  transition
                  hover:bg-white/[0.04]
                "
              >
                <ExternalLink
                  size={15}
                />

                Open customer view
              </button>
            </div>
          </>
        )}
      </div>
    </QufoModal>
  );
}