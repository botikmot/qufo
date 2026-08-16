import type {
  QuotationStatus,
} from "@/types/quotation";

type PublicQuotationStatusBadgeProps = {
  status: QuotationStatus;
};

const styles: Record<
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
    "bg-amber-400/[0.08] text-amber-300",

  EXPIRED:
    "bg-red-400/[0.08] text-red-300",

  CONVERTED:
    "bg-violet-400/[0.08] text-violet-300",

  CANCELLED:
    "bg-slate-400/[0.08] text-slate-500",
};

export function PublicQuotationStatusBadge({
  status,
}: PublicQuotationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />

      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}