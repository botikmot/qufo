"use client";

import { ArrowLeft } from "lucide-react";

export default function NotFoundBackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-300/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      <ArrowLeft size={16} />
      Go Back
    </button>
  );
}
