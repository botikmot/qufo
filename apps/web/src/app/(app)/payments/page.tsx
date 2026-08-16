"use client";

import {
  Plus,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/app/page-header";

import {
  PaymentFormModal,
} from "@/components/payments/payment-form-modal";

import {
  PaymentOverview,
} from "@/components/payments/payment-overview";

import {
  PaymentSummaryCards,
} from "@/components/payments/payment-summary-cards";

import {
  PaymentTransactions,
} from "@/components/payments/payment-transactions";

import {
  useAuthSession,
} from "@/lib/auth-storage";

import {
  usePayments,
} from "@/hooks/use-payments";

import {
  canVoidPayment,
} from "@/utils/payment-permission";

import {
  useWorkspaceAccess,
} from "@/hooks/use-workspace-access";

export default function PaymentsPage() {
  const session =
    useAuthSession();

  const payments =
    usePayments();

  const canVoid =
    canVoidPayment(
      session?.organization.role,
    );

   const {
      readOnly,
    } = useWorkspaceAccess();

  return (
    <>
      <PageHeader
        title="Payments"
        description="Track customer payments, balances, and payment transactions."
        action={
          <button
            type="button"
            disabled={readOnly}
            onClick={
              payments.openPaymentForm
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={17} />

            Record payment
          </button>
        }
      />

      <PaymentSummaryCards
        summary={
          payments.summary
        }
      />

      {payments.error && (
        <div className="mb-5 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
          {payments.error}
        </div>
      )}

      <PaymentOverview
        summary={
          payments.summary
        }
        loading={
          payments.loading
        }
      />

      <PaymentTransactions
        payments={
          payments.payments
        }
        loading={
          payments.loading
        }
        canVoid={
          canVoid
        }
        voidingId={
          payments.voidingId
        }
        onVoid={
          payments.voidPayment
        }
      />

      {payments.showPaymentForm && (
        <PaymentFormModal
          jobs={
            payments.jobs
          }
          loading={
            payments.saving
          }
          onClose={
            payments.closePaymentForm
          }
          onSubmit={
            payments.recordPayment
          }
        />
      )}
    </>
  );
}