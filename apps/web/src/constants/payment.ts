import type {
  JobPaymentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/payment";

export const PAYMENT_METHOD_LABELS:
  Record<
    PaymentMethod,
    string
  > = {
  CASH: "Cash",
  GCASH: "GCash",
  MAYA: "Maya",
  BANK_TRANSFER:
    "Bank Transfer",
  CARD: "Card",
  CHECK: "Check",
  OTHER: "Other",
};

export const PAYMENT_STATUS_STYLES:
  Record<
    PaymentStatus,
    string
  > = {
  PAID:
    "bg-emerald-400/[0.08] text-emerald-300",

  PENDING:
    "bg-amber-400/[0.08] text-amber-300",

  FAILED:
    "bg-red-400/[0.08] text-red-300",

  REFUNDED:
    "bg-violet-400/[0.08] text-violet-300",

  VOIDED:
    "bg-slate-400/[0.08] text-slate-500",
};

export const JOB_PAYMENT_STATUS_LABELS:
  Record<
    JobPaymentStatus,
    string
  > = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID:
    "Partially Paid",
  PAID: "Paid",
};

export const JOB_PAYMENT_STATUS_STYLES:
  Record<
    JobPaymentStatus,
    string
  > = {
  UNPAID:
    "bg-slate-400/[0.08] text-slate-400",

  PARTIALLY_PAID:
    "bg-amber-400/[0.08] text-amber-300",

  PAID:
    "bg-emerald-400/[0.08] text-emerald-300",
};