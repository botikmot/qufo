import type {
  ReactNode,
} from "react";

type InfoCardProps = {
  label: string;
  value: ReactNode;
};

export function InfoCard({
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <div className="mt-2 text-sm font-medium text-slate-300">
        {value}
      </div>
    </div>
  );
}