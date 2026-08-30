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

import {
  QuotationPdfActions,
} from "@/components/quotations/pdf/quotation-pdf-actions";

import {
  QuotationSendResult,
} from "@/components/quotations/quotation-send-result";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import type {
  QuotationDetail,
} from "@/types/quotation";

type QuotationDetailModalProps = {
  quotation: QuotationDetail;

  loading?: boolean;

  sentUrl?: string | null;

  onClose: () => void;

  onEdit: () => void;

  onSend: () => void;

  onCreateRevision: () => void;

  onConvertToJob: () => void;

  onCopyCustomerLink: () => void;
  onOpenCustomerView: () => void;
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
  onCopyCustomerLink,
  onOpenCustomerView,
}: QuotationDetailModalProps) {

  return (
    <QufoModal
      title={`Quotation ${quotation.quotationNumber}`}
      onClose={onClose}
      closeDisabled={loading}
      size="5xl"
      customHeader={
        <QuotationDetailHeader
          quotation={
            quotation
          }
          loading={
            loading
          }
          onClose={
            onClose
          }
        />
      }
    >
      <div className="min-w-0 space-y-7">
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
          currency={quotation.currency}
        />

        <QuotationFinancialSummary
          quotation={
            quotation
          }
          currency={quotation.currency}
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

        <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Document action - left */}
          <QuotationPdfActions
            quotation={quotation}
          />

          {/* Workflow actions - right */}
          <QuotationActions
            quotation={quotation}
            loading={loading}
            onEdit={onEdit}
            onSend={onSend}
            onCreateRevision={onCreateRevision}
            onConvertToJob={onConvertToJob}
            onCopyCustomerLink={onCopyCustomerLink}
            onOpenCustomerView={onOpenCustomerView}
          />
        </div>
        
      </div>
    </QufoModal>
  );
}