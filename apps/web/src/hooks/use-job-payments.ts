"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuthSession,
} from "@/lib/auth-storage";

import {
  paymentsService,
} from "@/services/payments.service";

import {
  canVoidPayment,
} from "@/utils/payment-permission";

import {
  getJobPaymentStatus,
  getPaidAmount,
  getPaymentBalance,
} from "@/utils/payment";

import type {
  Job,
} from "@/types/job";

import type {
  Payment,
  PaymentFormData,
} from "@/types/payment";

import { useConfirm } from "@/components/providers/confirm-dialog-provider";

type UseJobPaymentsProps = {
  job: Job;
};

export function useJobPayments({
  job,
}: UseJobPaymentsProps) {
  const session =
    useAuthSession();

  const confirm = useConfirm();

  const [
    payments,
    setPayments,
  ] = useState<Payment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    voidingId,
    setVoidingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    const load =
      async () => {
        try {
          const result =
            await paymentsService.getByJob(
              job.id,
            );

          if (cancelled) {
            return;
          }

          setPayments(
            result,
          );

          setError(null);
        } catch (error) {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load job payments.",
          );
        } finally {
          if (!cancelled) {
            setLoading(
              false,
            );
          }
        }
      };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    job.id,
  ]);

  const total =
    Number(
      job.total ?? 0,
    );

  const paidAmount =
    useMemo(
      () =>
        getPaidAmount(
          payments,
        ),
      [
        payments,
      ],
    );

  const balance =
    getPaymentBalance(
      total,
      paidAmount,
    );

  const paymentStatus =
    getJobPaymentStatus(
      total,
      paidAmount,
    );

  const canVoid =
    canVoidPayment(
      session?.organization.role,
    );

  async function refresh(
    showLoading = true,
  ) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const result =
        await paymentsService.getByJob(
          job.id,
        );

      setPayments(
        result,
      );

      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load job payments.",
      );

      throw error;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function recordPayment(
    data: PaymentFormData,
  ) {
    setSubmitting(true);

    try {
      await paymentsService.create(
        data,
      );

      await refresh(
        false,
      );

      setFormOpen(
        false,
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function voidPayment(
    payment: Payment,
  ) {
     const confirmed =
      await confirm({
        title:
          "Void payment?",
        description: `${payment.paymentNumber} will no longer count toward the customer's paid balance. This action should only be used for incorrect or invalid payments.`,
        confirmText:
          "Void payment",
        variant:
          "destructive",
      });

    if (!confirmed) {
      return;
    }

    setVoidingId(
      payment.id,
    );

    setError(null);

    try {
      await paymentsService.void(
        payment.id,
      );

      await refresh(
        false,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to void payment.",
      );
    } finally {
      setVoidingId(
        null,
      );
    }
  }

  return {
    payments,

    total,
    paidAmount,
    balance,
    paymentStatus,

    loading,
    submitting,
    voidingId,
    error,

    canVoid,

    formOpen,
    setFormOpen,

    refresh,
    recordPayment,
    voidPayment,
  };
}