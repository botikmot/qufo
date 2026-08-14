import {
  MessageSquareText,
} from "lucide-react";

import {
  formatDateTime,
} from "@/utils/date";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationCustomerResponseCardProps = {
  quotation: Quotation;
};

export function QuotationCustomerResponseCard({
  quotation,
}: QuotationCustomerResponseCardProps) {
  if (
    quotation.status !==
      "CHANGES_REQUESTED" &&
    quotation.status !==
      "REJECTED"
  ) {
    return null;
  }

  const date =
    quotation.status ===
    "CHANGES_REQUESTED"
      ? quotation.changesRequestedAt
      : quotation.rejectedAt;

  return (
    <div
      className={
        quotation.status ===
        "REJECTED"
          ? "rounded-2xl border border-red-400/10 bg-red-400/[0.035] p-5"
          : "rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-5"
      }
    >
      <div className="flex items-start gap-3">
        <MessageSquareText
          size={18}
          className={
            quotation.status ===
            "REJECTED"
              ? "mt-0.5 shrink-0 text-red-300"
              : "mt-0.5 shrink-0 text-amber-300"
          }
        />

        <div>
          <p className="text-sm font-medium text-slate-300">
            {quotation.status ===
            "REJECTED"
              ? "Customer declined quotation"
              : "Customer requested changes"}
          </p>

          {quotation.customerResponseNote ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
              {
                quotation.customerResponseNote
              }
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No reason provided.
            </p>
          )}

          {date && (
            <p className="mt-3 text-xs text-slate-600">
              {formatDateTime(date)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}