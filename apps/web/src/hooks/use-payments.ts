"use client";

import { useEffect, useState } from "react";

import { jobsService } from "@/services/jobs.service";

import { paymentsService } from "@/services/payments.service";

import type { Job } from "@/types/job";

import type {
  Payment,
  PaymentFormData,
  PaymentStatus,
  PaymentsSummaryResponse,
} from "@/types/payment";

import { useConfirm } from "@/components/providers/confirm-dialog-provider";

const PAYMENT_PAGE_SIZE = 10;
const OVERVIEW_PAGE_SIZE = 10;

export function usePayments() {
  /*
   * =========================================================
   * TRANSACTIONS
   * =========================================================
   */

  const [payments, setPayments] = useState<Payment[]>([]);

  const [paymentPage, setPaymentPage] = useState(1);

  const [paymentPages, setPaymentPages] = useState(1);

  const [paymentTotal, setPaymentTotal] = useState(0);

  const [paymentSearch, setPaymentSearch] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"ALL" | PaymentStatus>(
    "ALL",
  );

  const [paymentsLoading, setPaymentsLoading] = useState(true);

  /*
   * =========================================================
   * PAYMENT OVERVIEW
   * =========================================================
   */

  const [summary, setSummary] = useState<PaymentsSummaryResponse | null>(null);

  const [overviewLoading, setOverviewLoading] = useState(true);

  /*
   * =========================================================
   * OTHER STATE
   * =========================================================
   */

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [voidingId, setVoidingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const confirm = useConfirm();

  /*
   * =========================================================
   * LOAD TRANSACTIONS
   * =========================================================
   */

  async function loadPayments(
    page: number,
    search: string = paymentSearch,
    status: "ALL" | PaymentStatus = paymentStatus,
  ) {
    setPaymentsLoading(true);

    try {
      const response = await paymentsService.getAll({
        page,
        limit: PAYMENT_PAGE_SIZE,
        search,
        ...(status !== "ALL"
          ? {
              status,
            }
          : {}),
      });

      setPayments(response.items);

      setPaymentPage(response.pagination.page);

      setPaymentPages(response.pagination.pages);

      setPaymentTotal(response.pagination.total);
    } finally {
      setPaymentsLoading(false);
    }
  }

  /*
   * =========================================================
   * LOAD PAYMENT OVERVIEW
   * =========================================================
   */

  async function loadOverview(page: number) {
    setOverviewLoading(true);

    try {
      const response = await paymentsService.getSummary({
        page,
        limit: OVERVIEW_PAGE_SIZE,
      });

      setSummary(response);
    } finally {
      setOverviewLoading(false);
    }
  }

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const [paymentData, overviewData, jobsData] = await Promise.all([
          paymentsService.getAll({
            page: 1,
            limit: PAYMENT_PAGE_SIZE,
          }),

          paymentsService.getSummary({
            page: 1,
            limit: OVERVIEW_PAGE_SIZE,
          }),

          jobsService.getAll(),
        ]);

        if (cancelled) {
          return;
        }

        /*
         * Transactions
         */

        setPayments(paymentData.items);

        setPaymentPage(paymentData.pagination.page);

        setPaymentPages(paymentData.pagination.pages);

        setPaymentTotal(paymentData.pagination.total);

        /*
         * Overview
         */

        setSummary(overviewData);

        /*
         * Payment form jobs
         */

        setJobs(jobsData.items.filter((job) => job.status !== "CANCELLED"));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error ? error.message : "Unable to load payments.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setPaymentsLoading(false);
          setOverviewLoading(false);
        }
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =========================================================
   * TRANSACTION SEARCH
   * =========================================================
   */

  async function searchPayments(value: string) {
    setPaymentSearch(value);

    await loadPayments(1, value, paymentStatus);
  }

  /*
   * =========================================================
   * TRANSACTION STATUS
   * =========================================================
   */

  async function changePaymentStatus(status: "ALL" | PaymentStatus) {
    setPaymentStatus(status);

    await loadPayments(1, paymentSearch, status);
  }

  /*
   * =========================================================
   * TRANSACTION PAGINATION
   * =========================================================
   */

  async function previousPaymentPage() {
    const currentPage = paymentPage;

    if (currentPage <= 1) {
      return;
    }

    await loadPayments(currentPage - 1, paymentSearch, paymentStatus);
  }

  async function nextPaymentPage() {
    const currentPage = paymentPage;

    if (currentPage >= paymentPages) {
      return;
    }

    await loadPayments(currentPage + 1, paymentSearch, paymentStatus);
  }

  /*
   * =========================================================
   * OVERVIEW PAGINATION
   * =========================================================
   */

  async function previousOverviewPage() {
    const currentPage = summary?.pagination.page ?? 1;

    if (currentPage <= 1) {
      return;
    }

    await loadOverview(currentPage - 1);
  }

  async function nextOverviewPage() {
    const currentPage = summary?.pagination.page ?? 1;

    const totalPages = summary?.pagination.pages ?? 1;

    if (currentPage >= totalPages) {
      return;
    }

    await loadOverview(currentPage + 1);
  }

  /*
   * =========================================================
   * RELOAD CURRENT DATA
   * =========================================================
   */

  async function reload() {
    const currentPaymentPage = paymentPage;

    const currentOverviewPage = summary?.pagination.page ?? 1;

    const [paymentData, overviewData] = await Promise.all([
      paymentsService.getAll({
        page: currentPaymentPage,
        limit: PAYMENT_PAGE_SIZE,
        search: paymentSearch,
        ...(paymentStatus !== "ALL"
          ? {
              status: paymentStatus,
            }
          : {}),
      }),

      paymentsService.getSummary({
        page: currentOverviewPage,
        limit: OVERVIEW_PAGE_SIZE,
      }),
    ]);

    setPayments(paymentData.items);

    setPaymentPage(paymentData.pagination.page);

    setPaymentPages(paymentData.pagination.pages);

    setPaymentTotal(paymentData.pagination.total);

    setSummary(overviewData);
  }

  /*
   * =========================================================
   * RECORD PAYMENT
   * =========================================================
   */

  async function recordPayment(data: PaymentFormData) {
    setSaving(true);
    setError(null);

    try {
      await paymentsService.create(data);

      setShowPaymentForm(false);

      await reload();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to record payment.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * VOID PAYMENT
   * =========================================================
   */

  async function voidPayment(payment: Payment) {
    const confirmed = await confirm({
      title: "Void payment?",
      description: `${payment.paymentNumber} will no longer count toward the customer's paid balance.`,
      confirmText: "Void payment",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    setVoidingId(payment.id);

    setError(null);

    try {
      await paymentsService.void(payment.id);

      await reload();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to void payment.",
      );
    } finally {
      setVoidingId(null);
    }
  }

  /*
   * =========================================================
   * PAYMENT FORM
   * =========================================================
   */

  function openPaymentForm() {
    setShowPaymentForm(true);
  }

  function closePaymentForm() {
    if (!saving) {
      setShowPaymentForm(false);
    }
  }

  return {
    /*
     * Data
     */
    payments,
    jobs,
    summary,

    /*
     * General loading
     */
    loading,
    paymentsLoading,
    overviewLoading,

    /*
     * Mutations
     */
    saving,
    voidingId,

    /*
     * Error
     */
    error,

    /*
     * Payment form
     */
    showPaymentForm,

    /*
     * Transaction pagination/filter
     */
    paymentPage,
    paymentPages,
    paymentTotal,

    paymentSearch,
    paymentStatus,

    searchPayments,
    changePaymentStatus,

    previousPaymentPage,
    nextPaymentPage,

    /*
     * Overview pagination
     */
    previousOverviewPage,
    nextOverviewPage,

    /*
     * Actions
     */
    recordPayment,
    voidPayment,

    openPaymentForm,
    closePaymentForm,
  };
}
