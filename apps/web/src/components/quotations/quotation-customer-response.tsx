import {
  MessageSquareText,
} from "lucide-react";

import {
  hasCustomerResponse,
} from "@/utils/quotation";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationCustomerResponseProps = {
  quotation: Quotation;
};

export function QuotationCustomerResponse({
  quotation,
}: QuotationCustomerResponseProps) {
  if (
    !hasCustomerResponse(
      quotation.status,
    )
  ) {
    return (
      <span className="text-xs text-slate-700">
        —
      </span>
    );
  }

  if (
    !quotation.customerResponseNote
  ) {
    return (
      <span className="text-xs text-slate-600">
        No reason provided
      </span>
    );
  }

  return (
    <div className="flex max-w-xs items-start gap-2">
      <MessageSquareText
        size={14}
        className="mt-0.5 shrink-0 text-amber-300/70"
      />

      <p className="line-clamp-2 text-xs leading-5 text-slate-500">
        {
          quotation.customerResponseNote
        }
      </p>
    </div>
  );
}