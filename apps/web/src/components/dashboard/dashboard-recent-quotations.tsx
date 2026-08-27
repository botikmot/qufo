import Link from "next/link";

import {
  FileText,
} from "lucide-react";

import {
  QuotationStatusBadge,
} from "@/components/quotations/quotation-status-badge";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatDate,
} from "@/utils/date";

import type {
  DashboardRecentQuotation,
} from "@/types/dashboard";

type DashboardRecentQuotationsProps = {
  quotations:
    DashboardRecentQuotation[];
};

export function DashboardRecentQuotations({
  quotations,
}: DashboardRecentQuotationsProps) {
  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-[var(--qufo-border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            Recent Quotations
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Latest customer quotations.
          </p>
        </div>

        <Link
          href="/quotations"
          className="text-xs text-cyan-300/70 transition hover:text-cyan-300"
        >
          View all
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
          <FileText
            size={20}
            className="mb-3 text-slate-700"
          />

          <p className="text-sm text-slate-600">
            No quotations yet
          </p>
        </div>
      ) : (
        <div>
          {quotations.map(
            (quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between gap-4 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300">
                    {
                      quotation.quotationNumber
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {quotation.customer
                      ?.companyName ??
                      quotation.customer
                        ?.name ??
                      "Customer"}
                  </p>

                  <p className="mt-1 text-xs text-slate-700">
                    {quotation.validUntil
                        ? `Valid until ${formatDate(
                            quotation.validUntil,
                        )}`
                        : "No expiry date"}
                    </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <QuotationStatusBadge
                    status={
                      quotation.status
                    }
                  />

                  <span className="text-xs font-medium text-slate-400">
                    {formatCurrency(
                      quotation.total,
                      quotation.currency
                    )}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}