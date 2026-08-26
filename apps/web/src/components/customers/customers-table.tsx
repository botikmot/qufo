import {
  Users,
} from "lucide-react";

import {
  CustomerTableRow,
} from "@/components/customers/customer-table-row";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  Pagination,
} from "@/components/shared/pagination";

import {
  TableHead,
} from "@/components/shared/table-head";

import type {
  Customer,
} from "@/types/customer";

type CustomersTableProps = {
  customers: Customer[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  archivingId:
    | string
    | null;

  readOnly: boolean;

  onOpen: (
    customer: Customer,
  ) => void;

  onArchive: (
    customer: Customer,
  ) => void;

  onPrevious: () => void;
  onNext: () => void;
};

export function CustomersTable({
  customers,
  loading,
  page,
  pages,
  total,
  archivingId,
  readOnly,
  onOpen,
  onArchive,
  onPrevious,
  onNext,
}: CustomersTableProps) {
  if (loading) {
    return (
      <div className="qufo-surface overflow-hidden rounded-2xl">
        <LoadingState label="Loading customers..." />
      </div>
    );
  }

  if (
    customers.length === 0
  ) {
    return (
      <div className="qufo-surface flex min-h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
          <Users size={20} />
        </div>

        <h3 className="font-medium text-slate-300">
          No customers found
        </h3>

        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Add qualified customers
          before preparing their
          quotations.
        </p>
      </div>
    );
  }

  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed sm:table-auto">
          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                Customer
              </TableHead>

              <TableHead className="hidden sm:table-cell">
                Company
              </TableHead>

              <TableHead className="w-20 sm:w-24">
                <span className="sr-only">
                  Actions
                </span>
              </TableHead>
            </tr>
          </thead>

          <tbody>
            {customers.map(
              (customer) => (
                <CustomerTableRow
                  key={
                    customer.id
                  }
                  customer={
                    customer
                  }
                  archiving={
                    archivingId ===
                    customer.id
                  }
                  onOpen={
                    onOpen
                  }
                  onArchive={
                    onArchive
                  }
                  readOnly={
                    readOnly
                  }
                />
              ),
            )}
          </tbody>
        </table>
      </div>

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-[var(--qufo-border)]
          px-4
          py-4

          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
      >
        <p className="text-xs text-slate-600 sm:text-sm">
          {total}{" "}
          {total === 1
            ? "customer"
            : "customers"}
        </p>

        <Pagination
          page={page}
          pages={pages}
          loading={loading}
          onPrevious={
            onPrevious
          }
          onNext={
            onNext
          }
        />
      </div>
    </div>
  );
}