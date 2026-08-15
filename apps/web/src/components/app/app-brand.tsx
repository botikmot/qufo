import Link from "next/link";

export function AppBrand() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3"
    >
      <div className="flex size-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06]">
        <span className="text-lg font-semibold text-cyan-300">
          Q
        </span>
      </div>

      <div>
        <p className="font-semibold tracking-[0.14em] text-white">
          QUFO
        </p>

        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Quick Flow
        </p>
      </div>
    </Link>
  );
}