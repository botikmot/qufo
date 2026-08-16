import {
  CheckCircle2,
  Clock3,
} from "lucide-react";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationNoticesProps = {
  quotation: PublicQuotation;

  successMessage:
    | string
    | null;

  error:
    | string
    | null;
};

export function PublicQuotationNotices({
  quotation,
  successMessage,
  error,
}: PublicQuotationNoticesProps) {
  return (
    <>
      {successMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-300"
          />

          <p className="text-sm leading-6 text-emerald-200">
            {successMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!quotation
        .revisionInfo
        .isLatest && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] px-5 py-4">
          <Clock3
            size={18}
            className="mt-0.5 shrink-0 text-amber-300"
          />

          <div>
            <p className="text-sm font-medium text-amber-200">
              Newer quotation
              available
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              This quotation has
              been replaced by{" "}
              <span className="font-medium text-slate-300">
                {
                  quotation
                    .revisionInfo
                    .latestQuotationNumber
                }
              </span>
              . Please use the
              latest quotation link
              sent by the business.
            </p>
          </div>
        </div>
      )}
    </>
  );
}