import {
  InfoCard,
} from "@/components/shared/info-card";

import {
  formatDate,
} from "@/utils/date";

import type {
  Quotation,
} from "@/types/quotation";

type QuotationInfoGridProps = {
  quotation: Quotation;
};

export function QuotationInfoGrid({
  quotation,
}: QuotationInfoGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InfoCard
        label="Customer"
        value={
          quotation.customer
            .companyName ??
          quotation.customer.name
        }
      />

      <InfoCard
        label="Issue Date"
        value={
          quotation.issueDate
            ? formatDate(
                quotation.issueDate,
              )
            : "—"
        }
      />

      <InfoCard
        label="Valid Until"
        value={
          quotation.validUntil
            ? formatDate(
                quotation.validUntil,
              )
            : "No expiry"
        }
      />

      <InfoCard
        label="Revision"
        value={`Revision ${
          quotation.revisionNumber ??
          1
        }`}
      />
    </div>
  );
}