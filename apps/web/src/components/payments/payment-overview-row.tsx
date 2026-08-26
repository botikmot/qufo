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

  const customerName =
    item.customer.companyName ??
    item.customer.name;

  const contactName =
    item.customer.companyName
      ? item.customer.name
      : null;

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      {/* Main / compact view */}
      <td className="min-w-0 px-4 py-4 sm:px-5">
        <p className="break-words text-sm font-medium text-slate-200">
          {item.jobNumber}
        </p>

        <p className="mt-1 break-words text-xs leading-5 text-slate-600">
          {item.title}
        </p>

        {/* Mobile / tablet */}
        <div className="mt-4 space-y-3 xl:hidden">
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

          <JobPaymentStatusBadge
            status={
              item.paymentStatus
            }
          />

          <div className="grid grid-cols-2 gap-3 border-t border-[var(--qufo-border)] pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Job total
              </p>

              <p className="mt-1 text-sm font-medium text-slate-300">
                {formatCurrency(
                  item.total,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Paid
              </p>

              <p className="mt-1 text-sm font-medium text-emerald-300">
                {formatCurrency(
                  item.paidAmount,
                )}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Remaining balance
              </p>

              <p
                className={
                  balance > 0
                    ? "mt-1 text-sm font-medium text-amber-300"
                    : "mt-1 text-sm font-medium text-slate-500"
                }
              >
                {formatCurrency(
                  balance,
                )}
              </p>
            </div>
          </div>
        </div>
      </td>

      {/* Desktop */}
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

      <td className="hidden px-5 py-4 font-medium text-slate-300 xl:table-cell">
        {formatCurrency(
          item.total,
        )}
      </td>

      <td className="hidden px-5 py-4 font-medium text-emerald-300 xl:table-cell">
        {formatCurrency(
          item.paidAmount,
        )}
      </td>

      <td className="hidden px-5 py-4 xl:table-cell">
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

      <td className="hidden px-5 py-4 xl:table-cell">
        <JobPaymentStatusBadge
          status={
            item.paymentStatus
          }
        />
      </td>
    </tr>
  );
}