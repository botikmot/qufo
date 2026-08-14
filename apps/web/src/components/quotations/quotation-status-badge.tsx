import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_STYLES,
} from "@/constants/quotation";

import type {
  QuotationStatus,
} from "@/types/quotation";

type QuotationStatusBadgeProps = {
  status: QuotationStatus;
};

export function QuotationStatusBadge({
  status,
}: QuotationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${QUOTATION_STATUS_STYLES[status]}`}
    >
      {
        QUOTATION_STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}