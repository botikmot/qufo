"use client";

import { ArrowRight, FileText, Plus } from "lucide-react";

import { QuotationDetailModal } from "@/components/quotations/quotation-detail-modal";

import { QuotationFormModal } from "@/components/quotations/quotation-form-modal";

import { QuotationsTable } from "@/components/quotations/quotations-table";

import { QuotationsToolbar } from "@/components/quotations/quotations-toolbar";

import { QuotationSendModal } from "@/components/quotations/quotation-send-modal";

import { useQuotations } from "@/hooks/use-quotations";

import { useWorkspaceAccess } from "@/hooks/use-workspace-access";

export default function QuotationsPage() {
  const quotations = useQuotations();

  const { readOnly } = useWorkspaceAccess();

  return (
    <div className="min-w-0 space-y-6 pb-6">
      {/* =========================================================
          QUOTATION HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#07192B]">
        {/* Ambient glows */}

        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-blue-500/[0.04] blur-3xl"
          aria-hidden="true"
        />

        {/* Decorative waves */}

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            className="absolute right-0 top-0 h-full w-3/4"
            fill="none"
          >
            <path
              d="M0 120 C120 20 200 30 320 105 S520 175 650 70 S820 15 1040 70"
              stroke="#06B6D4"
              strokeWidth="1"
              opacity="0.5"
            />

            <path
              d="M0 145 C140 65 230 50 370 125 S570 170 710 90 S850 40 1040 95"
              stroke="#0E7490"
              strokeWidth="0.8"
              opacity="0.45"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          {/* Title */}

          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/70">
              Quotation Management
            </p>

            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                <FileText size={22} strokeWidth={1.7} />
              </div>

              <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Quotations
              </h1>
            </div>

            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Create, send, revise, approve, and convert customer quotations
              into production jobs.
            </p>
          </div>

          {/* Action */}

          <button
            type="button"
            onClick={quotations.openCreateForm}
            disabled={readOnly}
            className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus
              size={17}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            New quotation
          </button>
        </div>
      </section>

      {/* =========================================================
          QUOTATION SUMMARY
      ========================================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total */}

        <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#091C2E] p-5 transition hover:border-cyan-400/35">
          <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-cyan-400/[0.05] blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <FileText size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Total Quotations
              </p>

              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {quotations.total}
              </p>
            </div>
          </div>
        </div>

        {/* Directory */}

        <div className="group relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#091C2E] p-5 transition hover:border-cyan-400/20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Directory
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                Page {quotations.page} of {quotations.pages || 1}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Browse your quotation records
              </p>
            </div>

            <ArrowRight
              size={18}
              className="shrink-0 text-slate-700 transition duration-200 group-hover:translate-x-1 group-hover:text-cyan-300"
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}

      {quotations.error && (
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {quotations.error}
        </div>
      )}

      {/* =========================================================
          QUOTATION DIRECTORY
      ========================================================= */}

      <section className="qufo-surface min-w-0 overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
        {/* Header + Toolbar */}

        <div className="flex flex-col gap-4 border-b border-[var(--qufo-border)] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Title */}

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-200">
              Quotation Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search and manage quotations across your workspace.
            </p>
          </div>

          {/* Search + Filter */}

          <div className="w-full lg:max-w-[650px]">
            <QuotationsToolbar
              search={quotations.search}
              status={quotations.status}
              onSearchChange={quotations.setSearch}
              onSearch={quotations.handleSearch}
              onStatusChange={(status) => void quotations.changeStatus(status)}
            />
          </div>
        </div>

        {/* =======================================================
            TABLE
        ======================================================= */}

        <QuotationsTable
          quotations={quotations.quotations}
          loading={quotations.loading}
          page={quotations.page}
          pages={quotations.pages}
          total={quotations.total}
          onOpen={(quotation) => void quotations.openQuotation(quotation)}
          onDuplicate={(quotation) => void quotations.copyQuotation(quotation)}
          onPrevious={() => void quotations.previousPage()}
          onNext={() => void quotations.nextPage()}
        />
      </section>

      {/* =========================================================
          SEND MODAL
      ========================================================= */}

      {quotations.sendFlowQuotation && (
        <QuotationSendModal
          quotation={quotations.sendFlowQuotation}
          url={quotations.sendFlowUrl}
          loading={quotations.sendFlowLoading}
          copied={quotations.sendFlowCopied}
          onClose={quotations.closeSendFlow}
          onSend={() => {
            void quotations.sendFlowQuotationNow();
          }}
          onCopy={() => {
            void quotations.copySendFlowLink();
          }}
          onOpen={quotations.openSendFlowCustomerView}
        />
      )}

      {/* =========================================================
          DETAIL MODAL
      ========================================================= */}

      {quotations.selectedQuotation && (
        <QuotationDetailModal
          quotation={quotations.selectedQuotation}
          sentUrl={quotations.sentQuotationUrl}
          loading={quotations.actionLoading}
          onClose={quotations.closeQuotation}

          onEdit={() => {
            if (readOnly) {
              return;
            }

            void quotations.openEditForm();
          }}

          onSend={() => {
            if (readOnly) {
              return;
            }

            void quotations.sendQuotation();
          }}

          onCreateRevision={() => {
            if (readOnly) {
              return;
            }

            void quotations.createRevision();
          }}

          onConvertToJob={() => {
            if (readOnly) {
              return;
            }

            void quotations.convertToJob();
          }}

          onCopyCustomerLink={() => {
            void quotations.copyCustomerLink();
          }}

          onOpenCustomerView={() => {
            void quotations.openCustomerView();
          }}
        />
      )}

      {/* =========================================================
          FORM MODAL
      ========================================================= */}

      {quotations.showForm && (
        <QuotationFormModal
          key={quotations.editingQuotation?.id ?? "new-quotation"}
          customers={quotations.customers}
          businessProfiles={quotations.businessProfiles}
          quotation={quotations.editingQuotation}
          loading={quotations.saving}
          onClose={quotations.closeForm}
          onSubmit={quotations.saveQuotation}
        />
      )}
    </div>
  );
}
