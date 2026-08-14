import {
  PAYMENT_STATUS_STYLES,
} from "@/constants/payment";

import type {
  PaymentStatus,
} from "@/types/payment";

type Props = {
  status: PaymentStatus;
};

export function PaymentStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}