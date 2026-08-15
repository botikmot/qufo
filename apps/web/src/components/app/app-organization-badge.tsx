import {
  Building2,
} from "lucide-react";

type AppOrganizationBadgeProps = {
  name: string;
  role?: string;
};

export function AppOrganizationBadge({
  name,
  role,
}: AppOrganizationBadgeProps) {
  return (
    <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-400/[0.07] text-violet-300">
          <Building2
            size={16}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-300">
            {name}
          </p>

          {role && (
            <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-600">
              {role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}