"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";
import Image from "next/image";

import {
  Building2,
  Globe2,
  LoaderCircle,
  WalletCards,
} from "lucide-react";

import {
  apiFetch,
} from "@/lib/api";

import {
  saveLoginSession,
} from "@/lib/auth-storage";

import {
  clearPendingGoogleRegistration,
  getPendingGoogleRegistration,
} from "@/lib/google-auth-storage";

import type {
  GoogleSessionResponse,
} from "@/types/auth";

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

export default function GoogleRegisterPage() {
  const router =
    useRouter();

  const [
    businessName,
    setBusinessName,
  ] = useState("");

  const [
    businessType,
    setBusinessType,
  ] = useState("");

  const [
    countryCode,
    setCountryCode,
  ] = useState("");

  const [
    currency,
    setCurrency,
  ] = useState("");

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const pending =
      getPendingGoogleRegistration();

    if (!pending) {
      router.replace(
        "/register",
      );
    }
  }, [router]);

  function handleCountryChange(
    value: string,
  ) {
    setCountryCode(
      value,
    );

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
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const pending =
      getPendingGoogleRegistration();

    if (!pending) {
      setError(
        "Your Google sign-in session has expired. Please continue with Google again.",
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
      const response =
        await apiFetch<GoogleSessionResponse>(
          "/auth/google/complete",
          {
            method: "POST",

            requireAuth: false,

            body: JSON.stringify({
              credential:
                pending.credential,

              businessName,

              businessType:
                businessType.trim() ||
                undefined,

              countryCode,
              currency,

              acceptedTerms,
            }),
          },
        );

      const organization =
        response.organizations[0];

      if (!organization) {
        throw new Error(
          "Your workspace was created, but no organization was found.",
        );
      }

      saveLoginSession(
        response,
        organization,
      );

      clearPendingGoogleRegistration();

      router.replace(
        "/dashboard",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your workspace.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="qufo-background flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-xl">
        <div className="flex w-full justify-center">
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
            Set up your workspace
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Your Google account is
            ready. Tell us a little
            about your business to
            finish setting up QUFO.
          </p>
        </div>

        <div className="qufo-surface rounded-3xl p-6 sm:p-8">
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >
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
                onChange={(
                  event,
                ) =>
                  setBusinessName(
                    event.target
                      .value,
                  )
                }
                className="qufo-input"
                placeholder="Eagle Printing"
              />
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
                  onChange={(
                    event,
                  ) =>
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
                    value={
                      countryCode
                    }
                    onValueChange={(
                      value,
                    ) => {
                      if (
                        value !==
                        null
                      ) {
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
                        (
                          country,
                        ) => (
                          <SelectItem
                            key={
                              country.code
                            }
                            value={
                              country.code
                            }
                          >
                            {
                              country.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                    value={
                      currency
                    }
                    onValueChange={(
                      value,
                    ) => {
                      if (
                        value !==
                        null
                      ) {
                        setCurrency(
                          value,
                        );
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
                        (
                          item,
                        ) => (
                          <SelectItem
                            key={
                              item.code
                            }
                            value={
                              item.code
                            }
                          >
                            {
                              item.code
                            }{" "}
                            —{" "}
                            {
                              item.name
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] px-4 py-3">
              <p className="text-xs leading-5 text-amber-200/70">
                Choose your business
                currency carefully.
                You can change it
                until your first
                quotation is
                created.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  required
                  checked={
                    acceptedTerms
                  }
                  onChange={(
                    event,
                  ) =>
                    setAcceptedTerms(
                      event.target
                        .checked,
                    )
                  }
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-emerald-400"
                />

                <span className="text-xs leading-6 text-slate-500 sm:text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-300 underline decoration-emerald-400/30 underline-offset-4"
                  >
                    Terms of Service
                  </Link>{" "}
                  and acknowledge
                  the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-300 underline decoration-emerald-400/30 underline-offset-4"
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
      </div>
    </main>
  );
}