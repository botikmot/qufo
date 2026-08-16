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
  return (
    <tr className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      <td className="px-5 py-4">
        <p className="font-medium text-slate-200">
          {customer.name}
        </p>

        {customer.companyName && (
          <p className="mt-1 text-xs text-slate-600">
            {
              customer.companyName
            }
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-500">
          {customer.companyName ??
            "Individual customer"}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            title="View customer"
            onClick={() =>
              onOpen(customer)
            }
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
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
            onClick={() =>
              onArchive(customer)
            }
            disabled={
              archiving ||
              readOnly
            }
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600"
          >
            {archiving ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Archive
                size={15}
              />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}