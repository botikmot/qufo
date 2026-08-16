import {
  Building2,
} from "lucide-react";

import {
  PublicQuotationStatusBadge,
} from "@/components/public-quotation/public-quotation-status-badge";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationHeaderProps = {
  quotation: PublicQuotation;
};

export function PublicQuotationHeader({
  quotation,
}: PublicQuotationHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/15 bg-[var(--qufo-surface)]">
          <div className="absolute -left-3 -top-3 size-10 rounded-full bg-cyan-400/10 blur-xl" />

          <div className="absolute -bottom-4 -right-3 size-10 rounded-full bg-emerald-400/10 blur-xl" />

          <Building2
            size={19}
            className="relative text-emerald-300"
          />
        </div>

        <div>
          <p className="text-lg font-semibold text-white">
            {
              quotation
                .organization.name
            }
          </p>

          <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
            Powered by QUFO
          </p>
        </div>
      </div>

      <PublicQuotationStatusBadge
        status={
          quotation.status
        }
      />
    </header>
  );
}