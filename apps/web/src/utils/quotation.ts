import type {
  QuotationStatus,
} from "@/types/quotation";

export function canEditQuotation(
  status: QuotationStatus,
) {
  return status === "DRAFT";
}

export function canSendQuotation(
  status: QuotationStatus,
) {
  return status === "DRAFT";
}

export function canCreateRevision(
  status: QuotationStatus,
  isLatestRevision: boolean,
) {
  return (
    isLatestRevision &&
    (
      status ===
        "CHANGES_REQUESTED" ||
      status ===
        "REJECTED"
    )
  );
}

export function canConvertQuotationToJob(
  status: QuotationStatus,
) {
  return status === "APPROVED";
}

export function hasCustomerResponse(
  status: QuotationStatus,
) {
  return (
    status ===
      "CHANGES_REQUESTED" ||
    status === "REJECTED"
  );
}