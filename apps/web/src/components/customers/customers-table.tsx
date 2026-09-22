import { Users } from "lucide-react";

import { CustomerTableRow } from "@/components/customers/customer-table-row";

import { LoadingState } from "@/components/shared/loading-state";

import { Pagination } from "@/components/shared/pagination";

import { TableHead } from "@/components/shared/table-head";

import type { Customer } from "@/types/customer";

type CustomersTableProps = {
  customers: Customer[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  archivingId: string | null;

  readOnly: boolean;

  onOpen: (customer: Customer) => void;

  onArchive: (customer: Customer) => void;

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
      <div className="min-w-0">
        <div className="flex min-h-64 items-center justify-center px-6">
          <LoadingState label="Loading customers..." />
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/[0.04] blur-xl" />

          <Users size={24} strokeWidth={1.6} className="relative" />
        </div>

        <h3 className="text-sm font-semibold text-slate-200">
          No customers found
        </h3>

        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Add a customer to start building your QUFO workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* =========================================================
          TABLE
      ========================================================= */}

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          {/* TABLE HEADER */}

          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Customer
                </span>
              </TableHead>

              <TableHead className="hidden sm:table-cell">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Company
                </span>
              </TableHead>

              <TableHead className="w-24 text-right">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Actions
                </span>
              </TableHead>
            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody>
            {customers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                archiving={archivingId === customer.id}
                onOpen={onOpen}
                onArchive={onArchive}
                readOnly={readOnly}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="flex flex-col gap-4 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Count */}

        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cyan-400" />

          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-300">{total}</span>{" "}
            {total === 1 ? "customer" : "customers"}
          </p>
        </div>

        {/* Pagination */}

        <div className="flex items-center justify-end">
          <Pagination
            page={page}
            pages={pages}
            loading={loading}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}
