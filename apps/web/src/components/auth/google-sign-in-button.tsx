"use client";

import Image from "next/image";
import { LoaderCircle } from "lucide-react";

type GoogleSignInButtonProps = {
  onClick: () => void;
  loading?: boolean;
  label?: string;
};

export function GoogleSignInButton({
  onClick,
  loading = false,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        group
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-[var(--qufo-border)]
        bg-white/[0.04]
        px-4
        py-3
        text-sm
        font-medium
        text-slate-100
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
        transition
        hover:border-cyan-400/30
        hover:bg-white/[0.06]
        hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08)]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Image
          src="/images/google-logo.png"
          alt="Google"
          width={18}
          height={18}
        />
      </div>

      <span className="flex items-center gap-2">
        {loading && (
          <LoaderCircle
            size={16}
            className="animate-spin text-cyan-300"
          />
        )}

        {label}
      </span>
    </button>
  );
}