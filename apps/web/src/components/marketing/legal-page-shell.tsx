import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-dvh bg-[#050d18] text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[55rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to QUFO
        </Link>

        <header className="mt-12 border-b border-white/[0.07] pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            {description}
          </p>

          <p className="mt-5 text-xs text-slate-600">
            Last updated: {updatedAt}
          </p>
        </header>

        <article
          className="
            mt-10
            space-y-10
            text-sm leading-7 text-slate-400

            [&_h2]:mb-3
            [&_h2]:text-xl
            [&_h2]:font-semibold
            [&_h2]:tracking-tight
            [&_h2]:text-white

            [&_h3]:mb-2
            [&_h3]:font-medium
            [&_h3]:text-slate-200

            [&_a]:text-emerald-300
            [&_a]:underline
            [&_a]:underline-offset-4

            [&_ul]:ml-5
            [&_ul]:list-disc
            [&_ul]:space-y-2

            [&_strong]:font-medium
            [&_strong]:text-slate-200
          "
        >
          {children}
        </article>

        <footer className="mt-16 border-t border-white/[0.07] pt-8 text-xs text-slate-600">
          © {new Date().getFullYear()} QUFO. All rights reserved.
        </footer>
      </div>
    </main>
  );
}