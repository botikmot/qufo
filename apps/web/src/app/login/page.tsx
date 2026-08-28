"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { saveLoginSession } from "@/lib/auth-storage";
import Link from "next/link";
import Image from "next/image";

import type { LoginResponse } from "@/types/auth";
import { GoogleContinueButton } from "@/components/shared/google-continue-button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response =
        await apiFetch<LoginResponse>(
          "/auth/login",
          {
            method: "POST",

            requireAuth: false,

            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

      const organization =
        response.organizations[0];

      if (!organization) {
        throw new Error(
          "Your account does not belong to an organization.",
        );
      }

      saveLoginSession(
        response,
        organization,
      );

      router.push(
        "/dashboard",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to log in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6 text-white">
      <div className="w-full max-w-md">
        <div className="flex justify-center w-full">
          <Link href="/">
            <Image 
              src="/images/qufo_logo_variant2.png"
              alt="QUFO"
              width={60}
              height={60}
            />
          </Link>
        </div>
        <div className="mb-10">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-emerald-400">
            Quick Flow
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome to QUFO
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in to manage quotations,
            jobs, customers, tracking,
            and payments.
          </p>
        </div>

        <GoogleContinueButton
          onError={setError}
        />

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.07]" />

          <span className="text-xs uppercase tracking-[0.2em] text-slate-600">
            or
          </span>

          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-zinc-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-zinc-600">
          QUFO · Move work forward.
        </p>
      </div>
    </main>
  );
}