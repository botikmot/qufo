"use client";

import {
  Banknote,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  PaymentBalanceSummary,
} from "@/components/payments/payment-balance-summary";

import {
  usePaymentForm,
} from "@/hooks/use-payment-form";

import {
  formatCurrency,
} from "@/utils/currency";

import type {
  Job,
} from "@/types/job";

import type {
  PaymentFormData,
  PaymentMethod,
} from "@/types/payment";

type PaymentFormModalProps = {
  jobs: Job[];

  initialJobId?: string;

  lockJobSelection?: boolean;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: PaymentFormData,
  ) => Promise<void>;
};

export function PaymentFormModal({
  jobs,
  initialJobId,
  lockJobSelection = false,
  loading = false,
  onClose,
  onSubmit,
}: PaymentFormModalProps) {
  const form =
    usePaymentForm({
      jobs,
      initialJobId,
      onSubmit,
    });

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl">
        <div className="flex items-start justify-between border-b border-[var(--qufo-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
              <Banknote
                size={18}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Record payment
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Record customer
                payment against a
                production job.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={
            form.handleSubmit
          }
          className="space-y-6 p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Job
            </label>

            <select
              required
              disabled={
                lockJobSelection
              }
              value={
                form.jobId
              }
              onChange={(event) =>
                void form.handleJobChange(
                  event.target
                    .value,
                )
              }
              className="qufo-input disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!lockJobSelection && (
                <option value="">
                  Select job
                </option>
              )}

              {jobs.map(
                (job) => (
                  <option
                    key={
                      job.id
                    }
                    value={
                      job.id
                    }
                  >
                    {
                      job.jobNumber
                    }
                    {" — "}
                    {job.customer
                      .companyName ??
                      job.customer
                        .name}
                  </option>
                ),
              )}
            </select>
          </div>

          {form.selectedJob && (
            <PaymentBalanceSummary
              total={
                form.total
              }
              paidAmount={
                form.paidAmount
              }
              balance={
                form.balance
              }
              status={
                form.paymentStatus
              }
              loading={
                form.loadingBalance
              }
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-600">
                  ₱
                </span>

                <input
                  type="number"
                  min="0.01"
                  max={
                    form.balance >
                    0
                      ? form.balance
                      : undefined
                  }
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    form.setAmount(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input pl-8"
                  placeholder="0.00"
                />
              </div>

              {form.balance >
                0 && (
                <button
                  type="button"
                  onClick={
                    form.setFullBalance
                  }
                  className="mt-2 text-xs text-emerald-300/70 transition hover:text-emerald-300"
                >
                  Pay full remaining
                  balance (
                  {formatCurrency(
                    form.balance,
                  )}
                  )
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Payment method
              </label>

              <select
                value={
                  form.method
                }
                onChange={(
                  event,
                ) =>
                  form.setMethod(
                    event.target
                      .value as PaymentMethod,
                  )
                }
                className="qufo-input"
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="GCASH">
                  GCash
                </option>

                <option value="MAYA">
                  Maya
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="CHECK">
                  Check
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Reference number
            </label>

            <input
              value={
                form.referenceNumber
              }
              onChange={(event) =>
                form.setReferenceNumber(
                  event.target
                    .value,
                )
              }
              className="qufo-input"
              placeholder="Optional — GCash ref, bank reference, check no., etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Notes
            </label>

            <textarea
              rows={3}
              value={
                form.notes
              }
              onChange={(event) =>
                form.setNotes(
                  event.target
                    .value,
                )
              }
              className="qufo-input resize-none"
              placeholder="Optional internal payment note..."
            />
          </div>

          {form.error && (
            <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
              {form.error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[var(--qufo-border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                form.loadingBalance ||
                form.balance <= 0
              }
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              Record payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}