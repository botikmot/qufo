"use client";

import {
  BriefcaseBusiness,
  LoaderCircle,
  Pencil,
  RefreshCcw,
  Send,
  Copy,
  ExternalLink,
} from "lucide-react";

import {
  canConvertQuotationToJob,
  canCreateRevision,
  canEditQuotation,
  canSendQuotation,
} from "@/utils/quotation";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationActionsProps = {
  quotation: Quotation;

  loading?: boolean;

  onEdit: () => void;

  onSend: () => void;

  onCreateRevision: () => void;

  onConvertToJob: () => void;

  onCopyCustomerLink:
    () => void | Promise<void>;

  onOpenCustomerView:
    () => void | Promise<void>;
};

export function QuotationActions({
  quotation,
  loading = false,
  onEdit,
  onSend,
  onCreateRevision,
  onConvertToJob,
  onCopyCustomerLink,
  onOpenCustomerView,
}: QuotationActionsProps) {
  const canEdit =
    canEditQuotation(
      quotation.status,
    );

  const canSend =
    canSendQuotation(
      quotation.status,
    );

  const canRevise =
    canCreateRevision(
      quotation.status,
      quotation.revisionInfo
        ?.isLatest ??
        false,
    );

  const canConvert =
    canConvertQuotationToJob(
      quotation.status,
    );

  const canAccessPublicLink = quotation.status !== "DRAFT";

  if (
    !canEdit &&
    !canSend &&
    !canRevise &&
    !canConvert &&
    !canAccessPublicLink
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-end gap-3">
      {canEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[var(--qufo-border)] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
        >
          <Pencil size={15} />

          Edit
        </button>
      )}

      {canSend && (
        <button
          type="button"
          onClick={onSend}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <Send size={15} />
          )}

          Send quotation
        </button>
      )}

      {canAccessPublicLink && (
        <>
          <button
            type="button"
            onClick={onCopyCustomerLink}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--qufo-border)]
              px-4
              py-2.5
              text-sm
              text-slate-300
              transition
              hover:bg-white/[0.04]
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <Copy size={15} />

            Copy customer link
          </button>

          <button
            type="button"
            onClick={onOpenCustomerView}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--qufo-border)]
              px-4
              py-2.5
              text-sm
              text-slate-300
              transition
              hover:bg-white/[0.04]
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <ExternalLink size={15} />

            Open customer view
          </button>
        </>
      )}

      {canRevise && (
        <button
          type="button"
          onClick={onCreateRevision}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <RefreshCcw
              size={15}
            />
          )}

          Create revision
        </button>
      )}

      {canConvert && (
        <button
          type="button"
          onClick={onConvertToJob}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <BriefcaseBusiness
              size={15}
            />
          )}

          Convert to job
        </button>
      )}
    </div>
  );
}