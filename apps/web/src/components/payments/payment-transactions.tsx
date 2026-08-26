"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  LoaderCircle,
  Search,
  XCircle,
} from "lucide-react";

import {
  LoadingState,
} from "@/components/shared/loading-state";

import {
  TableHead,
} from "@/components/shared/table-head";

import {
  PaymentStatusBadge,
} from "@/components/payments/payment-status-badge";

import {
  PAYMENT_METHOD_LABELS,
} from "@/constants/payment";

import {
  formatCurrency,
} from "@/utils/currency";

import {
  formatDateTime,
} from "@/utils/date";

import type {
  Payment,
  PaymentStatus,
} from "@/types/payment";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentTransactionsVariant =
  | "default"
  | "job";

type Props = {
  payments: Payment[];

  loading: boolean;

  canVoid?: boolean;

  voidingId?:
    | string
    | null;

  onVoid?: (
    payment: Payment,
  ) => Promise<void>;

  variant?: PaymentTransactionsVariant;
};

export function PaymentTransactions({
  payments,
  loading,
  canVoid = false,
  voidingId = null,
  onVoid,
  variant = "default",
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "ALL" | PaymentStatus
    >("ALL");

  const jobVariant =
    variant === "job";

  const showActions =
    !jobVariant ||
    (
      canVoid &&
      Boolean(onVoid)
    );

  const filteredPayments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          if (
            statusFilter !==
              "ALL" &&
            payment.status !==
              statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            payment.paymentNumber,
            payment.referenceNumber,
            payment.method,
            payment.job
              ?.jobNumber,
            payment.job?.title,
            payment.customer
              ?.name,
            payment.customer
              ?.companyName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
        },
      );
    }, [
      payments,
      search,
      statusFilter,
    ]);

  return (
    <div
      className={
        jobVariant
          ? "overflow-hidden rounded-xl border border-[var(--qufo-border)] bg-black/10"
          : "qufo-surface overflow-hidden rounded-2xl"
      }
    >
      <div
        className={[
          "flex flex-col gap-4 border-b border-[var(--qufo-border)] p-4",
          !jobVariant
            ? "lg:flex-row lg:items-end lg:justify-between"
            : "",
        ].join(" ")}
      >
        <div>
          <h2 className="text-sm font-medium text-slate-300">
            {jobVariant
              ? "Payment History"
              : "Payment Transactions"}
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            {jobVariant
              ? "Payments recorded for this job."
              : "History of payments recorded in QUFO."}
          </p>
        </div>

        {!jobVariant && (
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="Search payment, job, customer..."
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (!value) return;

                setStatusFilter(
                  value as
                    | "ALL"
                    | PaymentStatus,
                );
              }}
            >
              <SelectTrigger className="qufo-input h-auto! w-full text-sm sm:w-44">
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
                <SelectItem value="ALL">
                  All statuses
                </SelectItem>

                <SelectItem value="PAID">
                  Paid
                </SelectItem>

                <SelectItem value="PENDING">
                  Pending
                </SelectItem>

                <SelectItem value="VOIDED">
                  Voided
                </SelectItem>

                <SelectItem value="FAILED">
                  Failed
                </SelectItem>

                <SelectItem value="REFUNDED">
                  Refunded
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState label="Loading payment transactions..." />
      ) : filteredPayments.length ===
        0 ? (
        <div
          className={[
            "flex flex-col items-center justify-center px-6 text-center",
            jobVariant
              ? "min-h-40"
              : "min-h-64",
          ].join(" ")}
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-emerald-400/[0.04] text-emerald-300">
            <Banknote
              size={20}
            />
          </div>

          <h3 className="font-medium text-slate-300">
            No payments found
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Record a deposit,
            partial payment, or
            full payment.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed 2xl:table-auto">
            <thead>
              <tr className="border-b border-[var(--qufo-border)]">
                <TableHead>
                  Payment
                </TableHead>

                {!jobVariant && (
                  <>
                    <TableHead className="hidden 2xl:table-cell">
                      Job
                    </TableHead>

                    <TableHead className="hidden 2xl:table-cell">
                      Customer
                    </TableHead>
                  </>
                )}

                <TableHead className="hidden 2xl:table-cell">
                  Method
                </TableHead>

                <TableHead className="hidden 2xl:table-cell">
                  Reference
                </TableHead>

                <TableHead className="hidden 2xl:table-cell">
                  Status
                </TableHead>

                <TableHead className="hidden 2xl:table-cell">
                  Amount
                </TableHead>

                <TableHead className="hidden 2xl:table-cell">
                  Date
                </TableHead>

                {showActions && (
                  <TableHead className="w-16 sm:w-20">
                    <span className="sr-only">
                      Actions
                    </span>
                  </TableHead>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(
                (payment) => {
                  const jobNumber =
                    payment.job
                      ?.jobNumber ??
                    "—";

                  const jobTitle =
                    payment.job?.title;

                  const customerName =
                    payment.customer
                      ?.companyName ??
                    payment.customer
                      ?.name ??
                    "—";

                  const paidDate =
                    formatDateTime(
                      payment.paidAt ??
                        payment.createdAt,
                    );

                  const methodLabel =
                    PAYMENT_METHOD_LABELS[
                      payment.method
                    ];

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]"
                    >
                      {/* Main / compact payment */}
                      <td className="min-w-0 px-4 py-4 sm:px-5">
                        <p className="break-words text-sm font-medium text-slate-200">
                          {
                            payment.paymentNumber
                          }
                        </p>

                        {payment.notes && (
                          <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                            {payment.notes}
                          </p>
                        )}

                        {/* Mobile / tablet / normal desktop */}
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
                            <PaymentStatusBadge
                              status={
                                payment.status
                              }
                            />

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
                                {
                                  payment.referenceNumber
                                }
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5 border-t border-[var(--qufo-border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <span
                              className={
                                payment.status ===
                                "VOIDED"
                                  ? "text-sm font-medium text-slate-600 line-through"
                                  : "text-sm font-medium text-emerald-300"
                              }
                            >
                              {formatCurrency(
                                payment.amount,
                              )}
                            </span>

                            <span className="text-xs text-slate-600">
                              {paidDate}
                            </span>
                          </div>
                        </div>
                      </td>

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

                          <td className="hidden px-5 py-4 text-sm text-slate-400 2xl:table-cell">
                            {customerName}
                          </td>
                        </>
                      )}

                      <td className="hidden px-5 py-4 text-sm text-slate-400 2xl:table-cell">
                        {methodLabel}
                      </td>

                      <td className="hidden px-5 py-4 text-sm text-slate-500 2xl:table-cell">
                        {payment.referenceNumber ??
                          "—"}
                      </td>

                      <td className="hidden px-5 py-4 2xl:table-cell">
                        <PaymentStatusBadge
                          status={
                            payment.status
                          }
                        />
                      </td>

                      <td className="hidden px-5 py-4 2xl:table-cell">
                        <span
                          className={
                            payment.status ===
                            "VOIDED"
                              ? "font-medium text-slate-600 line-through"
                              : "font-medium text-emerald-300"
                          }
                        >
                          {formatCurrency(
                            payment.amount,
                          )}
                        </span>
                      </td>

                      <td className="hidden px-5 py-4 text-sm text-slate-500 2xl:table-cell">
                        {paidDate}
                      </td>

                      {showActions && (
                        <td className="w-16 whitespace-nowrap px-2 py-4 sm:w-20 sm:px-4">
                          <div className="flex justify-end">
                            {canVoid &&
                              onVoid &&
                              payment.status ===
                                "PAID" && (
                                <button
                                  type="button"
                                  title="Void payment"
                                  aria-label={`Void ${payment.paymentNumber}`}
                                  onClick={() =>
                                    void onVoid(
                                      payment,
                                    )
                                  }
                                  disabled={
                                    voidingId ===
                                    payment.id
                                  }
                                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:opacity-50 sm:size-9"
                                >
                                  {voidingId ===
                                  payment.id ? (
                                    <LoaderCircle
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <XCircle
                                      size={15}
                                    />
                                  )}
                                </button>
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}