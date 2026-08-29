"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

import { requestPasswordReset } from "@/services/password-recovery.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send reset instructions.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="qufo-surface rounded-[28px] border border-white/10 p-6 shadow-2xl sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold tracking-[0.32em] text-emerald-400">
              QUICK FLOW
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Enter your email address and we&apos;ll send you a secure link
              to reset your QUFO password.
            </p>
          </div>

          {submitted ? (
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>

              <h2 className="text-xl font-semibold text-white">
                Check your email
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                If an account exists for{" "}
                <span className="font-medium text-zinc-200">{email}</span>,
                we&apos;ve sent password reset instructions.
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                The reset link expires in 30 minutes.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    className="
                        pointer-events-none
                        absolute left-4 top-1/2
                        h-4 w-4
                        -translate-y-1/2
                        text-zinc-500
                    "
                    />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="qufo-input w-full !pl-12 pr-4"
                    />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-white font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}