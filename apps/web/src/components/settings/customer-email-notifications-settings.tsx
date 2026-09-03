"use client";

import {
  MailCheck,
} from "lucide-react";

type CustomerEmailNotificationsSettingsProps = {
  enabled: boolean;
  disabled?: boolean;

  onChange: (
    enabled: boolean,
  ) => void;
};

export function CustomerEmailNotificationsSettings({
  enabled,
  disabled = false,
  onChange,
}: CustomerEmailNotificationsSettingsProps) {
  return (
    <div className="border-t border-[var(--qufo-border)] pt-6">
      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <MailCheck
                size={18}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-white">
                Customer email notifications
              </h3>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                Automatically email the customer a job confirmation,
                tracking QR code, and PDF attachment after they approve
                a quotation.
              </p>

              <p
                className={
                  enabled
                    ? "mt-3 text-xs text-emerald-300"
                    : "mt-3 text-xs text-slate-600"
                }
              >
                {enabled
                  ? "Automatic customer emails are enabled."
                  : "Automatic customer emails are disabled."}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              enabled
            }
            aria-label="Toggle customer email notifications"
            disabled={
              disabled
            }
            onClick={() =>
              onChange(
                !enabled,
              )
            }
            className={`
              relative
              h-7
              w-12
              shrink-0
              rounded-full
              border
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                enabled
                  ? "border-emerald-300/30 bg-emerald-400"
                  : "border-white/10 bg-slate-800"
              }
            `}
          >
            <span
              className={`
                absolute
                left-1
                top-1/2
                size-5
                -translate-y-1/2
                rounded-full
                bg-white
                shadow
                transition-transform
                ${
                  enabled
                    ? "translate-x-5"
                    : "translate-x-0"
                }
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}