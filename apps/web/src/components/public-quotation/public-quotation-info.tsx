import {
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

import {
  formatDate,
} from "@/utils/date";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationInfoProps = {
  quotation: PublicQuotation;
};

export function PublicQuotationInfo({
  quotation,
}: PublicQuotationInfoProps) {
  return (
    <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
            <FileText
              size={14}
            />

            Quotation
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {
              quotation
                .quotationNumber
            }
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Prepared for{" "}
            <span className="text-slate-300">
              {quotation.customer
                .companyName ??
                quotation.customer
                  .name}
            </span>
          </p>

          {quotation.customer
            .companyName && (
            <p className="mt-1 text-xs text-slate-600">
              Contact:{" "}
              {
                quotation
                  .customer.name
              }
            </p>
          )}
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.03] text-slate-500">
              <CalendarDays
                size={14}
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Issued
              </p>

              <p className="mt-0.5 text-xs text-slate-300">
                {formatDate(
                  quotation.issueDate,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.03] text-slate-500">
              <Clock3
                size={14}
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Valid until
              </p>

              <p className="mt-0.5 text-xs text-slate-300">
                {quotation.validUntil
                  ? formatDate(
                      quotation.validUntil,
                    )
                  : "No expiry"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}