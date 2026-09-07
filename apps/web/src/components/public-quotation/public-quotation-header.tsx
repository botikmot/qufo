import {
  Building2,
} from "lucide-react";

import Image from "next/image";

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
  /*
   * New quotations use the saved
   * business snapshot returned by
   * the backend.
   *
   * Older API responses / quotations
   * safely fall back to Organization.
   */
  const business =
    quotation.business ??
    quotation.organization;

  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-[var(--qufo-surface)]">
          {business.logoUrl ? (
            <Image
              src={
                business.logoUrl
              }
              alt={`${business.name} logo`}
              fill
              sizes="56px"
              className="object-contain p-3"
            />
          ) : (
            <>
              <div className="absolute -left-3 -top-3 size-10 rounded-full bg-cyan-400/10 blur-xl" />

              <div className="absolute -bottom-4 -right-3 size-10 rounded-full bg-emerald-400/10 blur-xl" />

              <Building2
                size={19}
                className="relative text-emerald-300"
              />
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">
            {business.name}
          </p>

          <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
            Powered by QUFO
          </p>

          {(business.email ||
            business.phone) && (
            <p className="mt-1 truncate text-xs text-slate-500">
              {business.email}

              {business.email &&
              business.phone
                ? " · "
                : ""}

              {business.phone}
            </p>
          )}
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