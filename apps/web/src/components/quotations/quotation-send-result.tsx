"use client";

import {
  Check,
  Clipboard,
  ExternalLink,
} from "lucide-react";

import {
  useState,
} from "react";

type QuotationSendResultProps = {
  url: string;
};

export function QuotationSendResult({
  url,
}: QuotationSendResultProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(
      url,
    );

    setCopied(true);
  }

  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
      <p className="text-sm font-medium text-cyan-200">
        Customer quotation link
      </p>

      <p className="mt-1 text-xs text-slate-600">
        Share this secure link with
        the customer.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          className="qufo-input min-w-0 flex-1 text-xs"
        />

        <button
          type="button"
          onClick={() =>
            void handleCopy()
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 px-4 py-2.5 text-sm text-cyan-200 transition hover:bg-cyan-400/[0.07]"
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

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-medium text-slate-950"
        >
          <ExternalLink
            size={15}
          />

          Open
        </a>
      </div>
    </div>
  );
}