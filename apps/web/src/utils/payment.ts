import type {
  Payment,
} from "@/types/payment";

export function getPaidAmount(
  payments: Payment[],
) {
  return payments
    .filter(
      (payment) =>
        payment.status === "PAID",
    )
    .reduce(
      (total, payment) =>
        total +
        Number(payment.amount),
      0,
    );
}

export function getPaymentBalance(
  total: number,
  paidAmount: number,
) {
  return Math.max(
    total - paidAmount,
    0,
  );
}

export function getJobPaymentStatus(
  total: number,
  paidAmount: number,
) {
  if (
    total > 0 &&
    paidAmount >= total
  ) {
    return "PAID" as const;
  }

  if (paidAmount > 0) {
    return "PARTIALLY_PAID" as const;
  }

  return "UNPAID" as const;
}