import {
  FileText,
} from "lucide-react";

import {
  QuotationTableRow,
} from "@/components/quotations/quotation-table-row";

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
  Quotation,
} from "@/types/quotation";

type QuotationsTableProps = {
  quotations: Quotation[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  onOpen: (
    quotation: Quotation,
  ) => void;

  onPrevious: () => void;
  onNext: () => void;
};

export function QuotationsTable({
  quotations,
  loading,
  page,
  pages,
  total,
  onOpen,
  onPrevious,
  onNext,
}: QuotationsTableProps) {
  if (loading) {
    return (
      <div className="qufo-surface overflow-hidden rounded-2xl">
        <LoadingState label="Loading quotations..." />
      </div>
    );
  }

  if (
    quotations.length === 0
  ) {
    return (
      <div className="qufo-surface flex min-h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
          <FileText
            size={20}
          />
        </div>

        <h3 className="font-medium text-slate-300">
          No quotations found
        </h3>

        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Create a quotation
          for a qualified
          customer inquiry.
        </p>
      </div>
    );
  }

  return (
    <div className="qufo-surface overflow-hidden rounded-2xl">
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed xl:table-auto">
          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                Quotation
              </TableHead>

              <TableHead className="hidden xl:table-cell">
                Customer
              </TableHead>

              <TableHead className="hidden xl:table-cell">
                Status
              </TableHead>

              <TableHead className="hidden xl:table-cell">
                Customer Response
              </TableHead>

              <TableHead className="hidden xl:table-cell">
                Total
              </TableHead>

              <TableHead className="hidden xl:table-cell">
                Created
              </TableHead>

              <TableHead className="w-16 sm:w-20">
                <span className="sr-only">
                  Actions
                </span>
              </TableHead>
            </tr>
          </thead>

          <tbody>
            {quotations.map(
              (quotation) => (
                <QuotationTableRow
                  key={
                    quotation.id
                  }
                  quotation={
                    quotation
                  }
                  onOpen={
                    onOpen
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
            ? "quotation"
            : "quotations"}
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