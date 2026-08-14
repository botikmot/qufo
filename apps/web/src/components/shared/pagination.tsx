type PaginationProps = {
  page: number;
  pages: number;

  loading?: boolean;

  onPrevious: () => void;
  onNext: () => void;
};

export function Pagination({
  page,
  pages,
  loading = false,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={
          page <= 1 ||
          loading
        }
        onClick={onPrevious}
        className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/[0.03] disabled:opacity-30"
      >
        Previous
      </button>

      <span className="px-2 text-xs text-slate-500">
        Page {page} of{" "}
        {Math.max(pages, 1)}
      </span>

      <button
        type="button"
        disabled={
          page >= pages ||
          loading
        }
        onClick={onNext}
        className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/[0.03] disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}