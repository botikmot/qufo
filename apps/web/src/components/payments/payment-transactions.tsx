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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                className="qufo-input pl-9"
                placeholder="Search payment, job, customer..."
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "ALL"
                    | PaymentStatus,
                )
              }
              className="qufo-input w-full text-sm sm:w-44"
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="VOIDED">
                Voided
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="REFUNDED">
                Refunded
              </option>
            </select>
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
        <div className="overflow-x-auto">
          <table
            className={[
              "w-full",
              jobVariant
                ? "min-w-[760px]"
                : "min-w-[1100px]",
            ].join(" ")}
          >
            <thead>
              <tr className="border-b border-[var(--qufo-border)]">
                <TableHead>
                  Payment
                </TableHead>

                {!jobVariant && (
                  <>
                    <TableHead>
                      Job
                    </TableHead>

                    <TableHead>
                      Customer
                    </TableHead>
                  </>
                )}

                <TableHead>
                  Method
                </TableHead>

                <TableHead>
                  Reference
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Amount
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                {showActions && (
                  <TableHead>
                    <span className="sr-only">
                      Actions
                    </span>
                  </TableHead>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(
                (payment) => (
                  <tr
                    key={
                      payment.id
                    }
                    className="border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-200">
                        {
                          payment.paymentNumber
                        }
                      </p>

                      {payment.notes && (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-600">
                          {
                            payment.notes
                          }
                        </p>
                      )}
                    </td>

                    {!jobVariant && (
                      <>
                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-300">
                            {payment.job
                              ?.jobNumber ??
                              "—"}
                          </p>

                          {payment.job
                            ?.title && (
                            <p className="mt-1 max-w-[200px] truncate text-xs text-slate-600">
                              {
                                payment.job
                                  .title
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {payment
                            .customer
                            ?.companyName ??
                            payment
                              .customer
                              ?.name ??
                            "—"}
                        </td>
                      </>
                    )}

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {
                        PAYMENT_METHOD_LABELS[
                          payment
                            .method
                        ]
                      }
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {payment.referenceNumber ??
                        "—"}
                    </td>

                    <td className="px-5 py-4">
                      <PaymentStatusBadge
                        status={
                          payment.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
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

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDateTime(
                        payment.paidAt ??
                          payment.createdAt,
                      )}
                    </td>

                    {showActions && (
                      <td className="px-5 py-4">
                        {canVoid &&
                          onVoid &&
                          payment.status ===
                            "PAID" && (
                            <button
                              type="button"
                              onClick={() =>
                                void onVoid(
                                  payment,
                                )
                              }
                              disabled={
                                voidingId ===
                                payment.id
                              }
                              className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-400/[0.07] hover:text-red-300 disabled:opacity-50"
                            >
                              {voidingId ===
                              payment.id ? (
                                <LoaderCircle
                                  size={
                                    15
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <XCircle
                                  size={
                                    15
                                  }
                                />
                              )}
                            </button>
                          )}
                      </td>
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}