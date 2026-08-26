"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050d18]/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-black text-emerald-300">
            Q
          </div> */}

          <Image 
            src="/images/qufo logo.png"
            alt="QUFO"
            width={180}
            height={50}
          />

        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-400 lg:flex">
          <a href="#workflow" className="transition hover:text-white">
            How it works
          </a>

          <a href="#demo" className="transition hover:text-white">
            Demo
          </a>

          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>

          <a href="#faq" className="transition hover:text-white">
            FAQ
          </a>

          <a href="#contact" className="transition hover:text-white">
            Contact Us
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#04110d] shadow-[0_0_30px_rgba(52,211,153,.18)] transition hover:bg-emerald-300"
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}