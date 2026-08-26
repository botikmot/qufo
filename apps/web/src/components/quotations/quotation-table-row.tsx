import {
  Eye,
} from "lucide-react";

import {
  QuotationCustomerResponse,
} from "@/components/quotations/quotation-customer-response";

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
  Quotation,
} from "@/types/quotation";

type QuotationTableRowProps = {
  quotation: Quotation;

  onOpen: (
    quotation: Quotation,
  ) => void;
};

export function QuotationTableRow({
  quotation,
  onOpen,
}: QuotationTableRowProps) {
  const customerName =
    quotation.customer
      .companyName ??
    quotation.customer.name;

  const contactName =
    quotation.customer
      .companyName
      ? quotation.customer.name
      : null;

  const createdDate =
    quotation.createdAt
      ? formatDate(
          quotation.createdAt,
        )
      : "—";

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      {/* Main quotation information */}
      <td className="min-w-0 px-4 py-4 sm:px-5">
        <p className="break-words text-sm font-medium text-slate-200">
          {
            quotation.quotationNumber
          }
        </p>

        {(quotation.revisionNumber ??
          1) > 1 && (
          <p className="mt-1 text-xs text-violet-300/70">
            Revision{" "}
            {
              quotation.revisionNumber
            }
          </p>
        )}

        {/* Compact mobile / tablet view */}
        <div className="mt-3 space-y-3 xl:hidden">
          <div>
            <p className="break-words text-sm text-slate-300">
              {customerName}
            </p>

            {contactName && (
              <p className="mt-0.5 break-words text-xs text-slate-600">
                {contactName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <QuotationStatusBadge
              status={
                quotation.status
              }
            />

            <QuotationCustomerResponse
              quotation={
                quotation
              }
            />
          </div>

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm font-medium text-slate-300">
              {formatCurrency(
                quotation.total,
              )}
            </p>

            <p className="text-xs text-slate-600">
              Created{" "}
              {createdDate}
            </p>
          </div>
        </div>
      </td>

      {/* Customer - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <p className="text-sm text-slate-300">
          {customerName}
        </p>

        {contactName && (
          <p className="mt-1 text-xs text-slate-600">
            {contactName}
          </p>
        )}
      </td>

      {/* Status - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <QuotationStatusBadge
          status={
            quotation.status
          }
        />
      </td>

      {/* Customer response - desktop */}
      <td className="hidden px-5 py-4 xl:table-cell">
        <QuotationCustomerResponse
          quotation={
            quotation
          }
        />
      </td>

      {/* Total - desktop */}
      <td className="hidden px-5 py-4 font-medium text-slate-300 xl:table-cell">
        {formatCurrency(
          quotation.total,
        )}
      </td>

      {/* Created - desktop */}
      <td className="hidden px-5 py-4 text-sm text-slate-500 xl:table-cell">
        {createdDate}
      </td>

      {/* Action */}
      <td className="w-16 whitespace-nowrap px-2 py-4 sm:w-20 sm:px-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onOpen(
                quotation,
              )
            }
            title="View quotation"
            aria-label={`View ${quotation.quotationNumber}`}
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition
              hover:bg-cyan-400/[0.07]
              hover:text-cyan-300

              sm:size-9
            "
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}