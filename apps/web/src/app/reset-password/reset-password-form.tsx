"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import { resetPassword } from "@/services/password-recovery.service";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="qufo-surface rounded-[28px] border border-white/10 p-6 shadow-2xl sm:p-8">
          {success ? (
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>

              <h1 className="text-2xl font-semibold text-white">
                Password updated
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Your password has been reset successfully. You can now sign
                in to QUFO using your new password.
              </p>

              <Link
                href="/login"
                className="mt-7 flex h-12 w-full items-center justify-center rounded-2xl bg-white font-medium text-zinc-950 transition hover:bg-zinc-100"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="mb-2 text-xs font-semibold tracking-[0.32em] text-emerald-400">
                  QUICK FLOW
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Create a new password
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Choose a strong password for your QUFO account.
                </p>
              </div>

              {!token ? (
                <div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    This password reset link is invalid or incomplete.
                  </div>

                  <Link
                    href="/forgot-password"
                    className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-400"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Request another reset link
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-zinc-200"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        className="qufo-input w-full !pl-12 !pr-12"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                      Use at least 8 characters.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-zinc-200"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
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
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-white font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Resetting password..."
                      : "Reset password"}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}