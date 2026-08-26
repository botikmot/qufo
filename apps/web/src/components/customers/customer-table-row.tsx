import {
  Archive,
  Eye,
  LoaderCircle,
} from "lucide-react";

import type {
  Customer,
} from "@/types/customer";

type CustomerTableRowProps = {
  customer: Customer;

  archiving: boolean;
  readOnly: boolean;

  onOpen: (
    customer: Customer,
  ) => void;

  onArchive: (
    customer: Customer,
  ) => void;
};

export function CustomerTableRow({
  customer,
  archiving,
  readOnly,
  onOpen,
  onArchive,
}: CustomerTableRowProps) {
  const companyLabel =
    customer.companyName ??
    "Individual customer";

  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      {/* Customer */}
      <td className="min-w-0 px-4 py-4 sm:px-5">
        <p className="break-words text-sm font-medium text-slate-200">
          {customer.name}
        </p>

        {/* Mobile only */}
        <p className="mt-1 break-words text-xs leading-5 text-slate-600 sm:hidden">
          {companyLabel}
        </p>
      </td>

      {/* Company - tablet / desktop only */}
      <td className="hidden px-5 py-4 sm:table-cell">
        <span className="text-sm text-slate-500">
          {companyLabel}
        </span>
      </td>

      {/* Actions */}
      <td className="w-24 whitespace-nowrap px-2 py-4 sm:px-5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="View customer"
            aria-label={`View ${customer.name}`}
            onClick={() =>
              onOpen(customer)
            }
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

          <button
            type="button"
            title={
              readOnly
                ? "Workspace is read-only"
                : "Archive customer"
            }
            aria-label={`Archive ${customer.name}`}
            onClick={() =>
              onArchive(customer)
            }
            disabled={
              archiving ||
              readOnly
            }
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-600
              transition
              hover:bg-red-400/[0.07]
              hover:text-red-300
              disabled:cursor-not-allowed
              disabled:opacity-30
              disabled:hover:bg-transparent
              disabled:hover:text-slate-600

              sm:size-9
            "
          >
            {archiving ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Archive size={15} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}