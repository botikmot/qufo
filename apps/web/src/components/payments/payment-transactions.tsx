"use client";

import { Banknote, LoaderCircle, Search, XCircle } from "lucide-react";

import { LoadingState } from "@/components/shared/loading-state";

import { Pagination } from "@/components/shared/pagination";

import { TableHead } from "@/components/shared/table-head";

import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";

import { PAYMENT_METHOD_LABELS } from "@/constants/payment";

import { formatCurrency } from "@/utils/currency";

import { formatDateTime } from "@/utils/date";

import type { Payment, PaymentStatus } from "@/types/payment";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentTransactionsVariant = "default" | "job";

type Props = {
  payments: Payment[];

  loading: boolean;

  paymentsLoading?: boolean;

  canVoid?: boolean;

  voidingId?: string | null;

  onVoid?: (payment: Payment) => Promise<void>;

  variant?: PaymentTransactionsVariant;

  /*
   * Server-side pagination
   */
  page?: number;
  pages?: number;
  total?: number;

  /*
   * Server-side search/filter
   */
  search?: string;

  statusFilter?: "ALL" | PaymentStatus;

  onSearch?: (value: string) => Promise<void>;

  onStatusChange?: (status: "ALL" | PaymentStatus) => Promise<void>;

  onPrevious?: () => Promise<void>;

  onNext?: () => Promise<void>;

  /*
   * Used when rendered inside
   * PaymentTabs.
   */
  embedded?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

export function PaymentTransactions({
  payments,
  loading,
  paymentsLoading = false,
  canVoid = false,
  voidingId = null,
  onVoid,
  variant = "default",
  page = 1,
  pages = 1,
  total = 0,
  search = "",
  statusFilter = "ALL",
  onSearch,
  onStatusChange,
  onPrevious,
  onNext,
  embedded = false,
}: Props) {
  const jobVariant = variant === "job";

  const showActions = !jobVariant || (canVoid && Boolean(onVoid));

  const busy = loading || paymentsLoading;

  /*
   * Backend returns only the current
   * page, so we do NOT filter or slice
   * the payments here.
   */
  const currentPage = Math.max(1, page);

  const effectiveTotal = total > 0 ? total : payments.length;

  const currentPageSize =
    payments.length > 0 ? payments.length : DEFAULT_PAGE_SIZE;

  const totalPages =
    pages > 0
      ? pages
      : Math.max(1, Math.ceil(effectiveTotal / currentPageSize));

  const firstItem =
    effectiveTotal === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;

  const lastItem =
    effectiveTotal === 0
      ? 0
      : Math.min(firstItem + payments.length - 1, effectiveTotal);

  return (
    <div
      className={
        embedded
          ? "overflow-hidden"
          : jobVariant
            ? "overflow-hidden rounded-xl border border-[var(--qufo-border)] bg-black/10"
            : "qufo-surface overflow-hidden rounded-2xl"
      }
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div
        className={[
          "flex flex-col gap-4 border-b border-[var(--qufo-border)] p-4",
          !jobVariant ? "lg:flex-row lg:items-end lg:justify-between" : "",
        ].join(" ")}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-slate-300">
            {jobVariant ? "Payment History" : "Payment Transactions"}
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            {jobVariant
              ? "Payments recorded for this job."
              : "History of payments recorded in QUFO."}
          </p>
        </div>

        {!jobVariant && (
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {/* Search */}

            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) => {
                  void onSearch?.(event.target.value);
                }}
                disabled={paymentsLoading}
                className="qufo-input qufo-input-with-icon w-full disabled:opacity-60"
                placeholder="Search payment, job, customer..."
              />
            </div>

            {/* Status filter */}

            <Select
              value={statusFilter}
              disabled={paymentsLoading}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                void onStatusChange?.(value as "ALL" | PaymentStatus);
              }}
            >
              <SelectTrigger className="qufo-input h-auto! w-full text-sm disabled:opacity-60 sm:w-44">
                <SelectValue>
                  {statusFilter === "ALL"
                    ? "All statuses"
                    : statusFilter === "PAID"
                      ? "Paid"
                      : statusFilter === "PENDING"
                        ? "Pending"
                        : statusFilter === "VOIDED"
                          ? "Voided"
                          : statusFilter === "FAILED"
                            ? "Failed"
                            : "Refunded"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent align="start">
                <SelectItem value="ALL">All statuses</SelectItem>

                <SelectItem value="PAID">Paid</SelectItem>

                <SelectItem value="PENDING">Pending</SelectItem>

                <SelectItem value="VOIDED">Voided</SelectItem>

                <SelectItem value="FAILED">Failed</SelectItem>

                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* =========================================================
          LOADING
      ========================================================= */}

      {loading ? (
        <LoadingState label="Loading payment transactions..." />
      ) : payments.length === 0 ? (
        /* =======================================================
           EMPTY
        ======================================================= */

        <div
          className={[
            "flex flex-col items-center justify-center px-6 text-center",
            jobVariant ? "min-h-40" : "min-h-64",
          ].join(" ")}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-emerald-400/[0.04] text-emerald-300">
            <Banknote size={20} />
          </div>

          <h3 className="font-medium text-slate-300">No payments found</h3>

          <p className="mt-2 max-w-sm text-sm text-slate-600">
            {search.trim() || statusFilter !== "ALL"
              ? "Try adjusting your search or payment status filter."
              : "Record a deposit, partial payment, or full payment."}
          </p>
        </div>
      ) : (
        <>
          {/* =====================================================
              TABLE
          ===================================================== */}

          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse 2xl:min-w-0">
              <thead>
                <tr className="border-b border-[var(--qufo-border)]">
                  <TableHead>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Payment
                    </span>
                  </TableHead>

                  {!jobVariant && (
                    <>
                      <TableHead className="hidden 2xl:table-cell">
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                          Job
                        </span>
                      </TableHead>

                      <TableHead className="hidden 2xl:table-cell">
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                          Customer
                        </span>
                      </TableHead>
                    </>
                  )}

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Method
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Reference
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Status
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Amount
                    </span>
                  </TableHead>

                  <TableHead className="hidden 2xl:table-cell">
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                      Date
                    </span>
                  </TableHead>

                  {showActions && (
                    <TableHead className="w-16 sm:w-20">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  )}
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const jobNumber = payment.job?.jobNumber ?? "—";

                  const jobTitle = payment.job?.title;

                  const customerName =
                    payment.customer?.companyName ??
                    payment.customer?.name ??
                    "—";

                  const paidDate = formatDateTime(
                    payment.paidAt ?? payment.createdAt,
                  );

                  const methodLabel = PAYMENT_METHOD_LABELS[payment.method];

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]"
                    >
                      {/* =================================================
                            PAYMENT / MOBILE CONTENT
                        ================================================= */}

                      <td className="min-w-0 px-4 py-4 sm:px-5">
                        <p className="break-words text-sm font-medium text-slate-200">
                          {payment.paymentNumber}
                        </p>

                        {payment.notes && (
                          <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                            {payment.notes}
                          </p>
                        )}

                        {/* Compact layout for screens
                              below 2xl */}

                        <div className="mt-4 space-y-3 2xl:hidden">
                          {!jobVariant && (
                            <div className="space-y-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                  Job
                                </p>

                                <p className="mt-1 break-words text-sm text-slate-300">
                                  {jobNumber}
                                </p>

                                {jobTitle && (
                                  <p className="mt-0.5 break-words text-xs text-slate-600">
                                    {jobTitle}
                                  </p>
                                )}
                              </div>

                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                  Customer
                                </p>

                                <p className="mt-1 break-words text-sm text-slate-400">
                                  {customerName}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <PaymentStatusBadge status={payment.status} />

                            <span className="rounded-lg border border-[var(--qufo-border)] px-2 py-1 text-xs text-slate-500">
                              {methodLabel}
                            </span>
                          </div>

                          {payment.referenceNumber && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Reference
                              </p>

                              <p className="mt-1 break-all text-xs text-slate-500">
                                {payment.referenceNumber}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5 border-t border-[var(--qufo-border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <span
                              className={
                                payment.status === "VOIDED"
                                  ? "text-sm font-medium text-slate-600 line-through"
                                  : "text-sm font-medium text-emerald-300"
                              }
                            >
                              {formatCurrency(payment.amount, payment.currency)}
                            </span>

                            <span className="text-xs text-slate-600">
                              {paidDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                            JOB
                        ================================================= */}

                      {!jobVariant && (
                        <>
                          <td className="hidden px-5 py-4 2xl:table-cell">
                            <p className="text-sm text-slate-300">
                              {jobNumber}
                            </p>

                            {jobTitle && (
                              <p className="mt-1 max-w-[200px] truncate text-xs text-slate-600">
                                {jobTitle}
                              </p>
                            )}
                          </td>

                          {/* CUSTOMER */}

                          <td className="hidden px-5 py-4 text-sm text-slate-400 2xl:table-cell">
                            {customerName}
                          </td>
                        </>
                      )}

                      {/* METHOD */}

                      <td className="hidden px-5 py-4 text-sm text-slate-400 2xl:table-cell">
                        {methodLabel}
                      </td>

                      {/* REFERENCE */}

                      <td className="hidden px-5 py-4 text-sm text-slate-500 2xl:table-cell">
                        {payment.referenceNumber ?? "—"}
                      </td>

                      {/* STATUS */}

                      <td className="hidden px-5 py-4 2xl:table-cell">
                        <PaymentStatusBadge status={payment.status} />
                      </td>

                      {/* AMOUNT */}

                      <td className="hidden px-5 py-4 2xl:table-cell">
                        <span
                          className={
                            payment.status === "VOIDED"
                              ? "font-medium text-slate-600 line-through"
                              : "font-medium text-emerald-300"
                          }
                        >
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="hidden px-5 py-4 text-sm text-slate-500 2xl:table-cell">
                        {paidDate}
                      </td>

                      {/* ACTION */}

                      {showActions && (
                        <td className="w-16 whitespace-nowrap px-2 py-4 sm:w-20 sm:px-4">
                          <div className="flex justify-end">
                            {canVoid && onVoid && payment.status === "PAID" && (
                              <button
                                type="button"
                                title="Void payment"
                                aria-label={`Void ${payment.paymentNumber}`}
                                onClick={() => void onVoid(payment)}
                                disabled={voidingId === payment.id}
                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:opacity-50 sm:size-9"
                              >
                                {voidingId === payment.id ? (
                                  <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <XCircle size={15} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {!jobVariant && (
            <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing{" "}
                <span className="font-medium text-slate-300">{firstItem}</span>
                {"–"}
                <span className="font-medium text-slate-300">{lastItem}</span>
                {" of "}
                <span className="font-medium text-slate-300">
                  {effectiveTotal}
                </span>
                {" payments"}
              </p>

              <Pagination
                page={currentPage}
                pages={totalPages}
                loading={busy}
                onPrevious={() => {
                  if (onPrevious) {
                    void onPrevious();
                  }
                }}
                onNext={() => {
                  if (onNext) {
                    void onNext();
                  }
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
