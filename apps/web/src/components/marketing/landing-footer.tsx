import Link from "next/link";
import Image from "next/image";

import { FazierBadge } from "@/components/marketing/fazier-badge";
import { StartupBaseBadge } from "@/components/marketing/startupbase-badge";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#040b14]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex size-10 items-center justify-center font-black text-emerald-300">
                <Image 
                  src="/images/qufo_logo_variant2.png"
                  alt="QUFO"
                  width={30}
                  height={30}
                />
              </div>

              <div>
                <p className="font-semibold tracking-wide text-white">QUFO</p>

                <p className="text-xs text-slate-600">
                  Quick Flow for your business
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              A connected business workflow for customers, quotations, jobs,
              payments, and customer tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                Product
              </p>

              <a
                href="#workflow"
                className="block text-slate-400 transition hover:text-white"
              >
                How it works
              </a>

              <a
                href="#features"
                className="block text-slate-400 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#demo"
                className="block text-slate-400 transition hover:text-white"
              >
                Demo
              </a>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                Account
              </p>

              <Link
                href="/login"
                className="block text-slate-400 transition hover:text-white"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="block text-slate-400 transition hover:text-white"
              >
                Start free
              </Link>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                Legal
              </p>

              <Link
                href="/terms"
                className="block text-slate-400 transition hover:text-white"
              >
                Terms of Service
              </Link>

              <Link
                href="/privacy"
                className="block text-slate-400 transition hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                Support
              </p>

              <a
                href="#contact"
                className="block text-slate-400 transition hover:text-white"
              >
                Contact Us
              </a>

              <a
                href="mailto:support@qufo.im"
                className="block text-slate-400 transition hover:text-white"
              >
                Email Support
              </a>
            </div>

          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.05] pt-6 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QUFO. All rights reserved.</p>

          <p>Quick Flow for your business.</p>
          <FazierBadge />
          <StartupBaseBadge />
        </div>
      </div>
    </footer>
  );
}