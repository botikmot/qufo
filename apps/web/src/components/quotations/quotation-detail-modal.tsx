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
  QuotationSendResult,
} from "@/components/quotations/quotation-send-result";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import type {
  Quotation,
} from "@/types/quotation";

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

  console.log('quotation::', quotation)

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

        <QuotationActions
          quotation={
            quotation
          }
          loading={
            loading
          }
          onEdit={
            onEdit
          }
          onSend={
            onSend
          }
          onCreateRevision={
            onCreateRevision
          }
          onConvertToJob={
            onConvertToJob
          }
        />
      </div>
    </QufoModal>
  );
}