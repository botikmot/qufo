"use client";

import {
  useParams,
} from "next/navigation";

import {
  PublicQuotationActions,
} from "@/components/public-quotation/public-quotation-actions";

import {
  PublicQuotationChangesModal,
} from "@/components/public-quotation/public-quotation-changes-modal";

import {
  PublicQuotationDeclineModal,
} from "@/components/public-quotation/public-quotation-decline-modal";

import {
  PublicQuotationDetails,
} from "@/components/public-quotation/public-quotation-details";

import {
  PublicPageFooter,
} from "@/components/shared/public-page-footer";

import {
  PublicQuotationHeader,
} from "@/components/public-quotation/public-quotation-header";

import {
  PublicQuotationInfo,
} from "@/components/public-quotation/public-quotation-info";

import {
  PublicQuotationItems,
} from "@/components/public-quotation/public-quotation-items";

import {
  PublicQuotationLoading,
} from "@/components/public-quotation/public-quotation-loading";

import {
  PublicQuotationNotices,
} from "@/components/public-quotation/public-quotation-notices";

import {
  PublicQuotationStatusResponse,
} from "@/components/public-quotation/public-quotation-status-response";

import {
  PublicQuotationSummary,
} from "@/components/public-quotation/public-quotation-summary";

import {
  PublicQuotationUnavailable,
} from "@/components/public-quotation/public-quotation-unavailable";

import {
  usePublicQuotation,
} from "@/hooks/use-public-quotation";

export default function PublicQuotationPage() {
  const params =
    useParams<{
      token: string;
    }>();

  const quote =
    usePublicQuotation(
      params.token,
    );

  if (quote.loading) {
    return (
      <PublicQuotationLoading />
    );
  }

  if (
    quote.error &&
    !quote.quotation
  ) {
    return (
      <PublicQuotationUnavailable
        message={
          quote.error
        }
      />
    );
  }

  if (!quote.quotation) {
    return null;
  }

  const quotation =
    quote.quotation;

  console.log('public qout:', quotation)

  return (
    <main className="qufo-background min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PublicQuotationHeader
          quotation={
            quotation
          }
        />

        <PublicQuotationNotices
          quotation={
            quotation
          }
          successMessage={
            quote.successMessage
          }
          error={
            quote.error
          }
        />

        <section className="qufo-surface overflow-hidden rounded-3xl">
          <PublicQuotationInfo
            quotation={
              quotation
            }
          />

          <div className="p-6 sm:p-8">
            <PublicQuotationItems
              items={
                quotation.items
              }
              currency={quotation.currency}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              <PublicQuotationDetails
                quotation={
                  quotation
                }
              />

              <PublicQuotationSummary
                quotation={
                  quotation
                }
                currency={quotation.currency}
              />
            </div>
          </div>

          {quote.canRespond && (
            <PublicQuotationActions
              loadingAction={
                quote.actionLoading
              }
              onRequestChanges={
                quote.openChangesForm
              }
              onApprove={() =>
                void quote.approveQuotation()
              }
              onDecline={
                quote.openDeclineForm
              }
            />
          )}

          <PublicQuotationStatusResponse
            quotation={
              quotation
            }
          />
        </section>

        <PublicPageFooter
          label="Secure quotation powered by QUFO"
        />
      </div>

      {quote.showChangesForm && (
        <PublicQuotationChangesModal
          note={
            quote.changesNote
          }
          loading={
            quote.actionLoading ===
            "requestChanges"
          }
          onNoteChange={
            quote.setChangesNote
          }
          onClose={
            quote.closeChangesForm
          }
          onSubmit={() =>
            void quote.requestChanges()
          }
        />
      )}

      {quote.showDeclineForm && (
        <PublicQuotationDeclineModal
          reason={
            quote.declineReason
          }
          loading={
            quote.actionLoading ===
            "reject"
          }
          onReasonChange={
            quote.setDeclineReason
          }
          onClose={
            quote.closeDeclineForm
          }
          onSubmit={() =>
            void quote.declineQuotation()
          }
        />
      )}
    </main>
  );
}