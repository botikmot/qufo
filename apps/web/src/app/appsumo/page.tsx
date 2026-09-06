import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Layers3,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import {
  buildAuthUrl,
} from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title:
    "Redeem your AppSumo code | QUFO",

  description:
    "Activate QUFO lifetime access using your AppSumo code.",
};

const REDEMPTION_PATH =
  "/settings?tab=subscription";

const SUPPORT_PATH =
  "/settings?tab=support";

const STEPS = [
  {
    title:
      "Copy your code",

    description:
      "Copy your unique QUFO code from your AppSumo purchase page.",
  },
  {
    title:
      "Create or sign in",

    description:
      "Create your QUFO workspace or sign in to an existing owner account.",
  },
  {
    title:
      "Choose your workspace",

    description:
      "Confirm that you selected the workspace receiving the lifetime license.",
  },
  {
    title:
      "Redeem the code",

    description:
      "Paste the code under Settings → Subscription and select Redeem code.",
  },
] as const;

const TIERS = [
  {
    codes:
      "1 code",

    tier:
      "Tier 1",

    members:
      "3 members",

    storage:
      "1 GB",

    emails:
      "250 / month",
  },
  {
    codes:
      "2 codes",

    tier:
      "Tier 2",

    members:
      "10 members",

    storage:
      "5 GB",

    emails:
      "1,000 / month",
  },
  {
    codes:
      "3 codes",

    tier:
      "Tier 3",

    members:
      "25 members",

    storage:
      "15 GB",

    emails:
      "2,500 / month",
  },
] as const;

export default function AppSumoPage() {
  const registrationUrl =
    buildAuthUrl(
      "/register",
      REDEMPTION_PATH,
    );

  const loginUrl =
    buildAuthUrl(
      "/login",
      REDEMPTION_PATH,
    );

  const supportUrl =
    buildAuthUrl(
      "/login",
      SUPPORT_PATH,
    );

  return (
    <main className="qufo-background min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/images/qufo_logo_variant2.png"
              alt="QUFO"
              width={52}
              height={52}
              priority
            />

            <div>
              <p className="text-lg font-semibold tracking-[0.24em] text-white">
                QUFO
              </p>

              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
                Quick Flow
              </p>
            </div>
          </Link>

          <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-2 text-xs font-medium text-emerald-300">
            AppSumo redemption
          </div>
        </header>

        <section className="qufo-surface overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 border-b border-[var(--qufo-border)] p-6 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-emerald-400/[0.1] text-emerald-300">
                <KeyRound
                  size={22}
                />
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-400">
                Lifetime access
              </p>

              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Redeem your QUFO
                AppSumo code
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Activate lifetime access
                for your QUFO workspace.
                No credit card or recurring
                payment is required.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={registrationUrl}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
                >
                  <UserPlus
                    size={17}
                  />

                  Create account

                  <ArrowRight
                    size={16}
                  />
                </Link>

                <Link
                  href={loginUrl}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--qufo-border)] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
                >
                  <LogIn
                    size={17}
                  />

                  Sign in
                </Link>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-600">
                After authentication,
                QUFO will take you directly
                to the Subscription tab.
              </p>
            </div>

            <aside className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                  <ShieldCheck
                    size={19}
                  />
                </div>

                <div>
                  <h2 className="font-medium text-slate-100">
                    Before you redeem
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Please check these details.
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-4">
                {[
                  "You must be the workspace owner.",
                  "Confirm the correct workspace before redeeming.",
                  "Each AppSumo code can only be used once.",
                  "Additional codes stack up to Tier 3.",
                  "No payment information is required.",
                ].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-400"
                    >
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />

                      {item}
                    </li>
                  ),
                )}
              </ul>
            </aside>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
                <Layers3
                  size={18}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  How to redeem
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Follow these four steps.
                </p>
              </div>
            </div>

            <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(
                (
                  step,
                  index,
                ) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] text-xs font-semibold text-emerald-300">
                      {index + 1}
                    </div>

                    <h3 className="mt-4 text-sm font-medium text-slate-200">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </li>
                ),
              )}
            </ol>

            <section className="mt-10">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Stack codes for higher limits
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Redeem additional codes
                  in the same workspace to
                  unlock the next tier.
                  Team limits include the
                  workspace owner.
                </p>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--qufo-border)]">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="border-b border-[var(--qufo-border)] bg-white/[0.025]">
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4 font-medium">
                        Codes
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Access
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Team
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Storage
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Customer emails
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {TIERS.map(
                      (tier) => (
                        <tr
                          key={tier.tier}
                          className="border-b border-[var(--qufo-border)] last:border-b-0"
                        >
                          <td className="px-5 py-4 text-sm text-slate-400">
                            {tier.codes}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-emerald-300">
                            {tier.tier}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {tier.members}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {tier.storage}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {tier.emails}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-medium text-slate-100">
                  Need help redeeming?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in and open the
                  Support tab to contact
                  the QUFO team.
                </p>
              </div>

              <Link
                href={supportUrl}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-400/15 bg-violet-400/[0.07] px-5 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-400/[0.12]"
              >
                Open support

                <ArrowRight
                  size={16}
                />
              </Link>
            </section>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-slate-600 sm:flex-row">
          <p>
            QUFO · Move work forward.
          </p>

          <div className="flex gap-5">
            <Link
              href="/terms"
              className="transition hover:text-slate-400"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-slate-400"
            >
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}