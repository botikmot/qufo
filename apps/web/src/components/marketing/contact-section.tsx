import Link from "next/link";

import {
  ArrowRight,
  Mail,
  MessageCircle,
} from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative border-t border-white/[0.05] py-24 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.05] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-6 py-12 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)] sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-[-8rem] size-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07]">
              <MessageCircle className="size-5 text-emerald-300" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Contact Us
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Have questions about QUFO?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Whether you want to learn more, need help setting up your
              workspace, or want to know if QUFO fits your business,
              we&apos;re happy to help.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:support@qufo.im?subject=QUFO%20Inquiry"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] sm:w-auto"
              >
                <Mail className="size-4 text-emerald-300" />
                Contact Support
              </a>

              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#04110d] shadow-[0_0_35px_rgba(52,211,153,.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-7">
              <p className="text-xs text-slate-600">
                Email us at
              </p>

              <a
                href="mailto:support@qufo.im"
                className="mt-1 inline-block text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                support@qufo.im
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}