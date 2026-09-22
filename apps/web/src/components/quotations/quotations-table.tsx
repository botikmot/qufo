import { FileText } from "lucide-react";

import { QuotationTableRow } from "@/components/quotations/quotation-table-row";

import { LoadingState } from "@/components/shared/loading-state";

import { Pagination } from "@/components/shared/pagination";

import { TableHead } from "@/components/shared/table-head";

import type { Quotation } from "@/types/quotation";

import { getQuotationPdfPreferences } from "@/lib/quotation-pdf-preferences";

type QuotationsTableProps = {
  quotations: Quotation[];

  loading: boolean;

  page: number;
  pages: number;
  total: number;

  onOpen: (quotation: Quotation) => void;

  onDuplicate: (quotation: Quotation) => void;

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
  onDuplicate,
  onPrevious,
  onNext,
}: QuotationsTableProps) {
  const pdfOptions = getQuotationPdfPreferences();

  /*
   * Loading
   */

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center px-6">
        <LoadingState label="Loading quotations..." />
      </div>
    );
  }

  /*
   * Empty state
   */

  if (quotations.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/[0.04] blur-xl" />

          <FileText size={24} strokeWidth={1.6} className="relative" />
        </div>

        <h3 className="text-sm font-semibold text-slate-200">
          No quotations found
        </h3>

        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Create a quotation to start managing your customer workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* =========================================================
          QUOTATION TABLE
      ========================================================= */}

      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          {/* TABLE HEADER */}

          <thead>
            <tr className="border-b border-[var(--qufo-border)]">
              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Quotation
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Customer
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Status
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Customer Response
                </span>
              </TableHead>

              {pdfOptions.showSubject && (
                <TableHead>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    Subject
                  </span>
                </TableHead>
              )}

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Total
                </span>
              </TableHead>

              <TableHead>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                  Created
                </span>
              </TableHead>

              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody>
            {quotations.map((quotation) => (
              <QuotationTableRow
                key={quotation.id}
                quotation={quotation}
                onOpen={onOpen}
                onDuplicate={onDuplicate}
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

          <p className="text-xs text-slate-500 sm:text-sm">
            <span className="font-medium text-slate-300">{total}</span>{" "}
            {total === 1 ? "quotation" : "quotations"}
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
