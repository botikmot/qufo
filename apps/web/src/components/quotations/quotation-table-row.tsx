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
  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      <td className="px-5 py-4">
        <p className="font-medium text-slate-200">
          {
            quotation.quotationNumber
          }
        </p>

        {(quotation.revisionNumber ?? 1) > 1 && (
        <p className="mt-1 text-xs text-violet-300/70">
            Revision{" "}
            {quotation.revisionNumber}
        </p>
        )}
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-300">
          {quotation.customer
            .companyName ??
            quotation.customer.name}
        </p>

        {quotation.customer
          .companyName && (
          <p className="mt-1 text-xs text-slate-600">
            {
              quotation.customer
                .name
            }
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <QuotationStatusBadge
          status={
            quotation.status
          }
        />
      </td>

      <td className="px-5 py-4">
        <QuotationCustomerResponse
          quotation={
            quotation
          }
        />
      </td>

      <td className="px-5 py-4 font-medium text-slate-300">
        {formatCurrency(
          quotation.total,
        )}
      </td>

      <td className="px-5 py-4 text-sm text-slate-500">
        {quotation.createdAt
            ? formatDate(
                quotation.createdAt,
            )
            : "—"}
        </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onOpen(
                quotation,
              )
            }
            title="View quotation"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}