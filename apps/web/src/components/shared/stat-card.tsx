type StatCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger";

type StatCardProps = {
  label: string;
  value: string;
  variant?: StatCardVariant;
};

const VALUE_STYLES:
  Record<
    StatCardVariant,
    string
  > = {
  default:
    "text-slate-200",

  success:
    "text-emerald-300",

  warning:
    "text-amber-300",

  danger:
    "text-red-300",
};

export function StatCard({
  label,
  value,
  variant = "default",
}: StatCardProps) {
  return (
    <div className="qufo-surface rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${VALUE_STYLES[variant]}`}
      >
        {value}
      </p>
    </div>
  );
}