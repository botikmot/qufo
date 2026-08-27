import {
  LogOut,
  UserRound,
} from "lucide-react";

import type {
  AppShellUser,
} from "@/types/app-shell";

type AppUserSummaryProps = {
  user: AppShellUser;

  onLogout: () => void;
};

export function AppUserSummary({
  user,
  onLogout,
}: AppUserSummaryProps) {

  console.log('user::', user)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-[var(--qufo-border)] bg-black/10 p-3">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="size-9 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <UserRound size={16} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-300">
            {user.name}
          </p>

          {user.email &&
            user.email !== user.name && (
              <p className="mt-0.5 truncate text-xs text-slate-600">
                {user.email}
              </p>
            )}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-400/[0.05] hover:text-red-300"
      >
        <LogOut size={16} />

        Sign out
      </button>
    </div>
  );
}