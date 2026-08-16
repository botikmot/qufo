import {
  PublicQuotationResponseBanner,
} from "@/components/public-quotation/public-quotation-response-banner";

import type {
  PublicQuotation,
} from "@/types/quotation";

type PublicQuotationStatusResponseProps = {
  quotation: PublicQuotation;
};

export function PublicQuotationStatusResponse({
  quotation,
}: PublicQuotationStatusResponseProps) {
  if (
    !quotation.revisionInfo
      .isLatest
  ) {
    return null;
  }

  if (
    quotation.status ===
    "APPROVED"
  ) {
    return (
      <PublicQuotationResponseBanner
        type="success"
        title="Quotation approved"
        message="Thank you. The business has been notified and can proceed with your order."
      />
    );
  }

  if (
    quotation.status ===
    "CHANGES_REQUESTED"
  ) {
    return (
      <PublicQuotationResponseBanner
        type="warning"
        title="Changes requested"
        message="Your request has been sent. The business can prepare and send you a revised quotation."
      />
    );
  }

  if (
    quotation.status ===
    "REJECTED"
  ) {
    return (
      <PublicQuotationResponseBanner
        type="warning"
        title="Quotation declined"
        message="You declined this quotation. The business may prepare and send a revised quotation if needed."
      />
    );
  }

  if (
    quotation.status ===
    "EXPIRED"
  ) {
    return (
      <PublicQuotationResponseBanner
        type="warning"
        title="Quotation expired"
        message="This quotation is no longer available for approval. Please contact the business for an updated quotation."
      />
    );
  }

  if (
    quotation.status ===
    "CONVERTED"
  ) {
    return (
      <PublicQuotationResponseBanner
        type="success"
        title="Order confirmed"
        message="This approved quotation has already been converted into a production job."
      />
    );
  }

  return null;
}