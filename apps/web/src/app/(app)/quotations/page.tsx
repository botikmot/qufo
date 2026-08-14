"use client";

import {
  Plus,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/app/page-header";

import {
  QuotationDetailModal,
} from "@/components/quotations/quotation-detail-modal";

import {
  QuotationFormModal,
} from "@/components/quotations/quotation-form-modal";

import {
  QuotationsTable,
} from "@/components/quotations/quotations-table";

import {
  QuotationsToolbar,
} from "@/components/quotations/quotations-toolbar";

import {
  useQuotations,
} from "@/hooks/use-quotations";

export default function QuotationsPage() {
  const quotations =
    useQuotations();

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Create, send, revise, approve, and convert customer quotations into production jobs."
        action={
          <button
            type="button"
            onClick={
              quotations.openCreateForm
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={17} />

            New quotation
          </button>
        }
      />

      <QuotationsToolbar
        search={
          quotations.search
        }
        status={
          quotations.status
        }
        onSearchChange={
          quotations.setSearch
        }
        onSearch={
          quotations.handleSearch
        }
        onStatusChange={(
          status,
        ) =>
          void quotations.changeStatus(
            status,
          )
        }
      />

      {quotations.error && (
        <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {quotations.error}
        </div>
      )}

      <QuotationsTable
        quotations={
          quotations.quotations
        }
        loading={
          quotations.loading
        }
        page={
          quotations.page
        }
        pages={
          quotations.pages
        }
        total={
          quotations.total
        }
        onOpen={(quotation) =>
          void quotations.openQuotation(
            quotation,
          )
        }
        onPrevious={() =>
          void quotations.previousPage()
        }
        onNext={() =>
          void quotations.nextPage()
        }
      />

      {quotations.selectedQuotation && (
        <QuotationDetailModal
          quotation={
            quotations.selectedQuotation
          }
          sentUrl={
            quotations.sentQuotationUrl
          }
          loading={
            quotations.actionLoading
          }
          onClose={
            quotations.closeQuotation
          }
          onEdit={() =>
            void quotations.openEditForm()
          }
          onSend={() =>
            void quotations.sendQuotation()
          }
          onCreateRevision={() =>
            void quotations.createRevision()
          }
          onConvertToJob={() =>
            void quotations.convertToJob()
          }
        />
      )}

      {quotations.showForm && (
        <QuotationFormModal
          key={
            quotations.editingQuotation
              ?.id ??
            "new-quotation"
          }
          customers={
            quotations.customers
          }
          quotation={
            quotations.editingQuotation
          }
          loading={
            quotations.saving
          }
          onClose={
            quotations.closeForm
          }
          onSubmit={
            quotations.saveQuotation
          }
        />
      )}
    </>
  );
}