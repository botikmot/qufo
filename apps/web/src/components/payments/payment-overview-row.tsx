import {
  JobPaymentStatusBadge,
} from "@/components/payments/job-payment-status-badge";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  JobPaymentSummary,
} from "@/types/payment";

type Props = {
  item: JobPaymentSummary;
};

export function PaymentOverviewRow({
  item,
}: Props) {
  const balance =
    Number(item.balance);

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      <td className="px-5 py-4">
        <p className="font-medium text-slate-200">
          {item.jobNumber}
        </p>

        <p className="mt-1 max-w-[240px] truncate text-xs text-slate-600">
          {item.title}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-300">
          {item.customer
            .companyName ??
            item.customer.name}
        </p>

        {item.customer
          .companyName && (
          <p className="mt-1 text-xs text-slate-600">
            {item.customer.name}
          </p>
        )}
      </td>

      <td className="px-5 py-4 font-medium text-slate-300">
        {formatCurrency(
          item.total,
        )}
      </td>

      <td className="px-5 py-4 font-medium text-emerald-300">
        {formatCurrency(
          item.paidAmount,
        )}
      </td>

      <td className="px-5 py-4">
        <span
          className={
            balance > 0
              ? "font-medium text-amber-300"
              : "font-medium text-slate-500"
          }
        >
          {formatCurrency(
            balance,
          )}
        </span>
      </td>

      <td className="px-5 py-4">
        <JobPaymentStatusBadge
          status={
            item.paymentStatus
          }
        />
      </td>
    </tr>
  );
}