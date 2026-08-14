import { X } from "lucide-react";

import { QuotationStatusBadge } from "@/components/quotations/quotation-status-badge";

import type { Quotation } from "@/types/quotation";

type QuotationDetailHeaderProps = {
  quotation: Quotation;
  loading?: boolean;
  onClose: () => void;
};

export function QuotationDetailHeader({
  quotation,
  loading = false,
  onClose,
}: QuotationDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex items-start justify-between border-b border-[var(--qufo-border)] bg-[rgba(8,20,35,0.94)] px-6 py-5 backdrop-blur-xl">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-white">
            {quotation.quotationNumber}
          </h2>

          <QuotationStatusBadge
            status={quotation.status}
          />

          {(quotation.revisionNumber ?? 1) > 1 && (
            <span className="rounded-full bg-violet-400/[0.08] px-2.5 py-1 text-xs font-medium text-violet-300">
              Revision {quotation.revisionNumber}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {quotation.customer.companyName ??
            quotation.customer.name}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
      >
        <X size={18} />
      </button>
    </div>
  );
}