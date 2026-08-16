import {
  MessageSquareText,
} from "lucide-react";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationDetailsProps = {
  quotation: PublicQuotation;
};

export function PublicQuotationDetails({
  quotation,
}: PublicQuotationDetailsProps) {
  return (
    <div className="space-y-6">
      {quotation.notes && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600">
            Notes
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {
              quotation.notes
            }
          </p>
        </div>
      )}

      {quotation.terms && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600">
            Terms & conditions
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {
              quotation.terms
            }
          </p>
        </div>
      )}

      {quotation
        .customerResponseNote && (
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
            <MessageSquareText
              size={16}
            />

            Customer response
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {
              quotation
                .customerResponseNote
            }
          </p>
        </div>
      )}
    </div>
  );
}