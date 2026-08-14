import {
  JOB_PAYMENT_STATUS_LABELS,
  JOB_PAYMENT_STATUS_STYLES,
} from "@/constants/payment";

import type {
  JobPaymentStatus,
} from "@/types/payment";

type Props = {
  status: JobPaymentStatus;
};

export function JobPaymentStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${JOB_PAYMENT_STATUS_STYLES[status]}`}
    >
      {
        JOB_PAYMENT_STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}