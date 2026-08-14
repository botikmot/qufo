"use client";

import {
  QuotationActions,
} from "@/components/quotations/quotation-actions";

import {
  QuotationCustomerResponseCard,
} from "@/components/quotations/quotation-customer-response-card";

import {
  QuotationDetailHeader,
} from "@/components/quotations/quotation-detail-header";

import {
  QuotationFinancialSummary,
} from "@/components/quotations/quotation-financial-summary";

import {
  QuotationInfoGrid,
} from "@/components/quotations/quotation-info-grid";

import {
  QuotationItemsTable,
} from "@/components/quotations/quotation-items-table";

import {
  QuotationNotesTerms,
} from "@/components/quotations/quotation-notes-terms";

import type {
  Quotation,
} from "@/types/quotation";

import {
  QuotationSendResult,
} from "@/components/quotations/quotation-send-result";

type QuotationDetailModalProps = {
  quotation: Quotation;

  loading?: boolean;

  sentUrl?: string | null;

  onClose: () => void;

  onEdit: () => void;

  onSend: () => void;

  onCreateRevision: () => void;

  onConvertToJob: () => void;
};

export function QuotationDetailModal({
  quotation,
  sentUrl,
  loading = false,
  onClose,
  onEdit,
  onSend,
  onCreateRevision,
  onConvertToJob,
}: QuotationDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl">
        <QuotationDetailHeader
          quotation={
            quotation
          }
          loading={loading}
          onClose={onClose}
        />

        <div className="space-y-7 p-6">
          <QuotationInfoGrid
            quotation={
              quotation
            }
          />

          <QuotationCustomerResponseCard
            quotation={
              quotation
            }
          />

          <QuotationItemsTable
            items={
              quotation.items
            }
          />

          <QuotationFinancialSummary
            quotation={
              quotation
            }
          />

          <QuotationNotesTerms
            quotation={
              quotation
            }
          />

          {sentUrl && (
            <QuotationSendResult
              url={sentUrl}
            />
          )}

          <QuotationActions
            quotation={
              quotation
            }
            loading={loading}
            onEdit={onEdit}
            onSend={onSend}
            onCreateRevision={
              onCreateRevision
            }
            onConvertToJob={
              onConvertToJob
            }
          />
        </div>
      </div>
    </div>
  );
}