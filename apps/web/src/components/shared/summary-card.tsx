
export function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-lg font-semibold",
          accent
            ? "text-emerald-300"
            : "text-slate-300",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}