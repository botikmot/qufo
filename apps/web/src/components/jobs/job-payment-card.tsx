"use client";

import {
  Banknote,
  LoaderCircle,
} from "lucide-react";

import {
  PaymentBalanceSummary,
} from "@/components/payments/payment-balance-summary";

import {
  PaymentFormModal,
} from "@/components/payments/payment-form-modal";

import {
  PaymentTransactions,
} from "@/components/payments/payment-transactions";

import {
  useJobPayments,
} from "@/hooks/use-job-payments";

import type {
  Job,
} from "@/types/job";

type JobPaymentCardProps = {
  job: Job;
};

export function JobPaymentCard({
  job,
}: JobPaymentCardProps) {
  const payment =
    useJobPayments({
      job,
    });

  const canRecordPayment =
    !payment.loading &&
    !payment.error &&
    payment.balance > 0;

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-black/10">
        <div
          className="
            flex
            min-w-0
            flex-col
            gap-4
            border-b
            border-[var(--qufo-border)]
            px-4
            py-4

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
              <Banknote
                size={18}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-medium text-slate-200">
                Payment
              </h3>

              <p className="mt-0.5 text-xs leading-5 text-slate-600">
                Payment status and
                remaining balance
                for this job.
              </p>
            </div>
          </div>

          {canRecordPayment && (
            <button
              type="button"
              onClick={() =>
                payment.setFormOpen(
                  true,
                )
              }
              className="
                w-full
                shrink-0
                rounded-xl
                bg-emerald-400
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-950
                transition
                hover:bg-emerald-300

                sm:w-auto
              "
            >
              Record payment
            </button>
          )}
        </div>

        <div className="min-w-0 space-y-5 p-4 sm:p-5">
          <PaymentBalanceSummary
            total={
              payment.total
            }
            paidAmount={
              payment.paidAmount
            }
            balance={
              payment.balance
            }
            status={
              payment.paymentStatus
            }
            loading={
              payment.loading
            }
          />

          {payment.loading && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <LoaderCircle
                size={14}
                className="shrink-0 animate-spin"
              />

              <span>
                Loading payment
                information...
              </span>
            </div>
          )}

          {payment.error && (
            <div className="break-words rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
              {payment.error}
            </div>
          )}

          {!payment.loading &&
            !payment.error &&
            payment.balance <=
              0 && (
              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3 text-sm text-emerald-300">
                This job has been
                fully paid.
              </div>
            )}

          {!payment.error && (
            <div className="min-w-0">
              <PaymentTransactions
                payments={
                  payment.payments
                }
                loading={
                  payment.loading
                }
                variant="job"
                canVoid={
                  payment.canVoid
                }
                voidingId={
                  payment.voidingId
                }
                onVoid={
                  payment.voidPayment
                }
              />
            </div>
          )}
        </div>
      </section>

      {payment.formOpen && (
        <PaymentFormModal
          jobs={[job]}
          initialJobId={
            job.id
          }
          lockJobSelection
          loading={
            payment.submitting
          }
          onClose={() =>
            payment.setFormOpen(
              false,
            )
          }
          onSubmit={
            payment.recordPayment
          }
        />
      )}
    </>
  );
}