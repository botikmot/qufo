"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DealifyRedemptionCardProps = {
  redeeming: boolean;
  success: string | null;
  error: string | null;
  onRedeem: (code: string) => Promise<boolean>;
};

export function DealifyRedemptionCard({
  redeeming,
  success,
  error,
  onRedeem,
}: DealifyRedemptionCardProps) {
  const [code, setCode] = useState("");

  async function handleRedeem() {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      return;
    }

    const redeemed = await onRedeem(normalizedCode);

    if (redeemed) {
      setCode("");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
          <KeyRound size={18} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-200">
            Redeem a Dealify code
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Purchased QUFO through Dealify? Enter your code to activate your
            lifetime plan.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          disabled={redeeming}
          placeholder="Enter your Dealify code"
          autoComplete="off"
          className="qufo-input flex-1"
        />

        <Button
          type="button"
          className="rounded-xl"
          disabled={redeeming || !code.trim()}
          onClick={() => {
            void handleRedeem();
          }}
        >
          {redeeming ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Redeeming...
            </>
          ) : (
            "Redeem code"
          )}
        </Button>
      </div>

      {success && (
        <div className="mt-4 flex gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />

          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
