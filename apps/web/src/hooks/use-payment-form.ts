"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  paymentsService,
} from "@/services/payments.service";

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
  PaymentMethod,
} from "@/types/payment";

type UsePaymentFormProps = {
  jobs: Job[];

  onSubmit: (
    data: PaymentFormData,
  ) => Promise<void>;
};

export function usePaymentForm({
  jobs,
  onSubmit,
}: UsePaymentFormProps) {
  const [
    jobId,
    setJobId,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    method,
    setMethod,
  ] =
    useState<PaymentMethod>(
      "CASH",
    );

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    jobPayments,
    setJobPayments,
  ] = useState<Payment[]>([]);

  const [
    loadingBalance,
    setLoadingBalance,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const selectedJob =
    useMemo(
      () =>
        jobs.find(
          (job) =>
            job.id === jobId,
        ) ?? null,
      [jobs, jobId],
    );

  const total =
    Number(
      selectedJob?.total ?? 0,
    );

  const paidAmount =
    useMemo(
      () =>
        getPaidAmount(
          jobPayments,
        ),
      [jobPayments],
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

  async function handleJobChange(
    selectedJobId: string,
  ) {
    setJobId(
      selectedJobId,
    );

    setAmount("");
    setJobPayments([]);
    setError(null);

    if (!selectedJobId) {
      return;
    }

    setLoadingBalance(true);

    try {
      const payments =
        await paymentsService.getByJob(
          selectedJobId,
        );

      setJobPayments(
        payments,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load job payments.",
      );
    } finally {
      setLoadingBalance(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!jobId) {
      setError(
        "Please select a job.",
      );

      return;
    }

    const paymentAmount =
      Number(amount);

    if (
      !paymentAmount ||
      paymentAmount <= 0
    ) {
      setError(
        "Enter a valid payment amount.",
      );

      return;
    }

    if (
      paymentAmount > balance
    ) {
      setError(
        "Payment cannot exceed the remaining balance.",
      );

      return;
    }

    try {
      await onSubmit({
        jobId,
        amount,
        method,
        referenceNumber,
        notes,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to record payment.",
      );
    }
  }

  function setFullBalance() {
    if (balance <= 0) {
      return;
    }

    setAmount(
      balance.toFixed(2),
    );
  }

  return {
    jobId,
    amount,
    method,
    referenceNumber,
    notes,

    selectedJob,

    total,
    paidAmount,
    balance,
    paymentStatus,

    loadingBalance,
    error,

    setAmount,
    setMethod,
    setReferenceNumber,
    setNotes,

    handleJobChange,
    handleSubmit,
    setFullBalance,
  };
}