import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileQuestion, House } from "lucide-react";
import NotFoundBackButton from "./not-found-back-button";

export default function NotFound() {
  return (
    <main className="qufo-background relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-400/[0.07] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-40 h-96 w-96 rounded-full bg-emerald-400/[0.06] blur-[120px]"
      />

      {/* Minimal QUFO header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="QUFO home"
            className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Image
              src="/images/qufo_variant2.png"
              alt="QUFO"
              width={180}
              height={50}
            />
          </Link>

          {/*  <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <House size={16} />
            <span className="hidden sm:inline">Home</span>
          </Link> */}
        </div>
      </header>

      {/* Main error content */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.04] rotate-6"
            />
            <div
              aria-hidden="true"
              className="absolute inset-2 rounded-[1.6rem] border border-emerald-300/15 bg-emerald-300/[0.03] -rotate-3"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0b1b2b] text-cyan-300 shadow-[0_0_50px_rgba(34,211,238,0.08)] sm:h-24 sm:w-24">
              <FileQuestion size={43} strokeWidth={1.4} />
            </div>
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold tracking-[0.16em] text-emerald-300">
              ERROR 404
            </span>
          </div>

          <p className="mb-3 text-7xl font-bold tracking-[-0.07em] text-white sm:text-8xl">
            4<span className="text-cyan-300">0</span>4
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Lost in the workflow?
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            This page doesn&apos;t exist or may have moved. Don&apos;t worry —
            let&apos;s get you back to where your workflow flows.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#052e26] shadow-[0_8px_30px_rgba(52,211,153,0.12)] transition-all hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_12px_35px_rgba(52,211,153,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]"
            >
              <House size={17} />
              Back to QUFO Home
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <NotFoundBackButton />
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Need a hand?{" "}
            <Link
              href="/#contact"
              className="font-medium text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-cyan-200"
            >
              Contact our team
            </Link>
          </p>

          <div className="mx-auto mt-14 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

          <p className="mt-6 text-xs tracking-wide text-slate-600">
            QUFO · One workflow. From quotation to completion.
          </p>
        </div>
      </section>
    </main>
  );
}
