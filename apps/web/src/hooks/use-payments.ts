"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  jobsService,
} from "@/services/jobs.service";

import {
  paymentsService,
} from "@/services/payments.service";

import type {
  Job,
} from "@/types/job";

import type {
  Payment,
  PaymentFormData,
  PaymentsSummaryResponse,
} from "@/types/payment";

export function usePayments() {
  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [
    summary,
    setSummary,
  ] =
    useState<PaymentsSummaryResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    voidingId,
    setVoidingId,
  ] =
    useState<string | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    showPaymentForm,
    setShowPaymentForm,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      paymentsService.getAll(),
      paymentsService.getSummary(),
      jobsService.getAll(),
    ])
      .then(
        ([
          paymentData,
          summaryData,
          jobsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setPayments(
            paymentData,
          );

          setSummary(
            summaryData,
          );

          setJobs(
            jobsData.items.filter(
              (job) =>
                job.status !==
                "CANCELLED",
            ),
          );
        },
      )
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load payments.",
          );
        },
      )
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    const [
      paymentData,
      summaryData,
    ] = await Promise.all([
      paymentsService.getAll(),
      paymentsService.getSummary(),
    ]);

    setPayments(
      paymentData,
    );

    setSummary(
      summaryData,
    );
  }

  async function recordPayment(
    data: PaymentFormData,
  ) {
    setSaving(true);
    setError(null);

    try {
      await paymentsService.create(
        data,
      );

      setShowPaymentForm(
        false,
      );

      await reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to record payment.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function voidPayment(
    payment: Payment,
  ) {
    const confirmed =
      window.confirm(
        `Void ${payment.paymentNumber}? This payment will no longer count toward the customer's paid balance.`,
      );

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

      await reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to void payment.",
      );
    } finally {
      setVoidingId(null);
    }
  }

  function openPaymentForm() {
    setShowPaymentForm(true);
  }

  function closePaymentForm() {
    if (!saving) {
      setShowPaymentForm(
        false,
      );
    }
  }

  return {
    payments,
    jobs,
    summary,
    loading,
    saving,
    voidingId,
    error,
    showPaymentForm,

    recordPayment,
    voidPayment,
    openPaymentForm,
    closePaymentForm,
  };
}