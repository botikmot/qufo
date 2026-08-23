import type {
  QuotationStatus,
} from "@/types/quotation";

export const QUOTATION_STATUS_LABELS: Record<
  QuotationStatus,
  string
> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  CHANGES_REQUESTED: "Changes Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
  CANCELLED: "Cancelled",
};

export const QUOTATION_STATUS_STYLES: Record<
  QuotationStatus,
  string
> = {
  DRAFT:
    "bg-slate-400/[0.08] text-slate-400",

  SENT:
    "bg-blue-400/[0.08] text-blue-300",

  VIEWED:
    "bg-cyan-400/[0.08] text-cyan-300",

  CHANGES_REQUESTED:
    "bg-amber-400/[0.08] text-amber-300",

  APPROVED:
    "bg-emerald-400/[0.08] text-emerald-300",

  REJECTED:
    "bg-red-400/[0.08] text-red-300",

  EXPIRED:
    "bg-orange-400/[0.08] text-orange-300",

  CONVERTED:
    "bg-violet-400/[0.08] text-violet-300",

  CANCELLED:
    "bg-slate-400/[0.08] text-slate-600",
};

export const QUOTATION_STATUS_OPTIONS:
  QuotationStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
  "CANCELLED",
];