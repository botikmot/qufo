"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Building2,
  Globe2,
  LoaderCircle,
  UserPlus,
  WalletCards,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { saveLoginSession } from "@/lib/auth-storage";
import type { LoginResponse } from "@/types/auth";

import {
  BUSINESS_COUNTRIES,
  SUPPORTED_CURRENCIES,
} from "@/constants/currencies";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GoogleContinueButton } from "@/components/shared/google-continue-button";

const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "false";

type RegisterResponse = {
  message: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  organization: {
    id: string;
    name: string;
    slug: string;
    businessType: string | null;
    countryCode: string | null;
    currency: string;
    role: string;
  };

  subscription: {
    plan?: string;
    status?: string;
    trialStartedAt?: string;
    trialEndsAt?: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    businessType,
    setBusinessType,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [
    countryCode,
    setCountryCode,
  ] = useState("");

  const [
    currency,
    setCurrency,
  ] = useState("");

  function handleCountryChange(
    value: string,
  ) {
    setCountryCode(value);

    const country =
      BUSINESS_COUNTRIES.find(
        (item) =>
          item.code === value,
      );

    if (country) {
      setCurrency(
        country.currency,
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    if (!countryCode) {
        setError(
          "Please select your business country.",
        );

        return;
      }

      if (!currency) {
        setError(
          "Please select your preferred currency.",
        );

        return;
      }

    if (!acceptedTerms) {
      setError(
        "Please agree to the Terms of Service and acknowledge the Privacy Policy.",
      );

      return;
    }

    setLoading(true);

    try {
      // 1. Create the account and workspace
      await apiFetch<RegisterResponse>(
        "/auth/register",
        {
          method: "POST",
          requireAuth: false,

          body: JSON.stringify({
            name,
            businessName,
            businessType:
              businessType.trim() ||
              undefined,
            countryCode,
            currency,
            email,
            password,
            acceptedTerms,
          }),
        },
      );

      // 2. Automatically sign in
      const loginResponse =
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

      // 3. Select the newly created organization
      const organization =
        loginResponse.organizations[0];

      if (!organization) {
        throw new Error(
          "Your workspace was created, but no organization was found.",
        );
      }

      // 4. Save the same session used by the normal login flow
      saveLoginSession(
        loginResponse,
        organization,
      );

      // 5. Go directly to the dashboard
      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-xl">
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
        <div className="mb-8">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-emerald-400">
            Quick Flow
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Create your QUFO workspace
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Start your business workspace
            for quotations, jobs,
            customers, payments, and
            tracking.
          </p>
        </div>

        <div className="qufo-surface rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
              <UserPlus size={18} />
            </div>

            <div>
              <h2 className="font-medium text-slate-100">
                Create account
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Includes your 30-day free trial.
              </p>
            </div>
          </div>

          {GOOGLE_AUTH_ENABLED && (
            <GoogleContinueButton
              onError={setError}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Your name
                </label>

                <input
                  id="name"
                  required
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  className="qufo-input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Business name
                </label>

                <input
                  id="businessName"
                  required
                  value={
                    businessName
                  }
                  onChange={(event) =>
                    setBusinessName(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input"
                  placeholder="Eagle Printing"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="businessType"
                className="mb-2 block text-sm text-slate-400"
              >
                Business type
                <span className="ml-1 text-slate-600">
                  Optional
                </span>
              </label>

              <div className="relative">
                <Building2
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  id="businessType"
                  value={
                    businessType
                  }
                  onChange={(event) =>
                    setBusinessType(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input qufo-input-with-icon"
                  placeholder="Printing, signage, fabrication..."
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Country */}
              <div>
                <label
                  htmlFor="business-country"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Business country
                </label>

                <div className="relative">
                  <Globe2
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-600"
                  />

                  <Select
                    value={countryCode}
                    onValueChange={(value) => {
                      if (value !== null) {
                        handleCountryChange(
                          value,
                        );
                      }
                    }}
                  >
                    <SelectTrigger
                      id="business-country"
                      className="w-full pl-10"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>

                    <SelectContent>
                      {BUSINESS_COUNTRIES.map(
                        (country) => (
                          <SelectItem
                            key={country.code}
                            value={country.code}
                          >
                            {country.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Where your business is
                  primarily based.
                </p>
              </div>

              {/* Currency */}
              <div>
                <label
                  htmlFor="business-currency"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Preferred currency
                </label>

                <div className="relative">
                  <WalletCards
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-600"
                  />

                  <Select
                    value={currency}
                    onValueChange={(value) => {
                      if (value !== null) {
                        setCurrency(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="business-currency"
                      className="w-full pl-10"
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>

                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map(
                        (item) => (
                          <SelectItem
                            key={item.code}
                            value={item.code}
                          >
                            {item.code} —{" "}
                            {item.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Used for quotations,
                  jobs, payments, and
                  reports.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] px-4 py-3">
              <p className="text-xs leading-5 text-amber-200/70">
                Choose your business
                currency carefully. You
                can change it until your
                first quotation is
                created.
              </p>
            </div>


            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-slate-400"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                className="qufo-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(
                      event.target.checked,
                    )
                  }
                  className="
                    mt-0.5 size-4 shrink-0
                    cursor-pointer
                    accent-emerald-400
                  "
                />

                <span className="text-xs leading-6 text-slate-500 sm:text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-300 underline decoration-emerald-400/30 underline-offset-4 transition hover:text-emerald-200"
                  >
                    Terms of Service
                  </Link>{" "}
                  and acknowledge the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-300 underline decoration-emerald-400/30 underline-offset-4 transition hover:text-emerald-200"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Creating workspace..."
                : "Create workspace"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-300 transition hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-slate-600">
          QUFO · Move work forward.
        </p>
      </div>
    </main>
  );
}