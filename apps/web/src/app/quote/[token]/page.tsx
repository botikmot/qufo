"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import { apiFetch } from "@/lib/api";

import type {
  PublicQuotation,
  PublicQuotationResponse,
  QuotationStatus,
} from "@/types/quotation";

export default function PublicQuotationPage() {
  const params =
    useParams<{
      token: string;
    }>();

  const token =
    params.token;

  const [
    quotation,
    setQuotation,
  ] =
    useState<PublicQuotation | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<
    "approve" | "reject" | null
  >(null);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    showRejectForm,
    setShowRejectForm,
  ] = useState(false);

  const [
    rejectNote,
    setRejectNote,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadQuotation() {
      if (!token) {
        return;
      }

      try {
        const data =
          await apiFetch<PublicQuotation>(
            `/public/quotations/${token}`,
            {
              requireAuth: false,
            },
          );

        setQuotation(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load quotation.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadQuotation();
  }, [token]);

  async function approveQuotation() {
    if (!quotation) {
      return;
    }

    const confirmed =
      window.confirm(
        `Approve ${quotation.quotationNumber}?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading("approve");
    setError(null);

    try {
      const result =
        await apiFetch<PublicQuotationResponse>(
          `/public/quotations/${token}/approve`,
          {
            method: "POST",

            requireAuth: false,

            body: JSON.stringify({}),
          },
        );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,
                status:
                  result.quotation
                    .status,
              }
            : current,
      );

      setSuccessMessage(
        "Quotation approved successfully. The business can now proceed with your order.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve quotation.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function requestChanges() {
    if (!rejectNote.trim()) {
      setError(
        "Please tell the business what you would like changed.",
      );

      return;
    }

    setActionLoading("reject");
    setError(null);

    try {
      const result =
        await apiFetch<PublicQuotationResponse>(
          `/public/quotations/${token}/request-changes`,
          {
            method: "POST",

            requireAuth: false,

            body: JSON.stringify({
              note:
                rejectNote.trim(),
            }),
          },
        );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,

                status:
                  result.quotation
                    .status,

                customerResponseNote:
                  rejectNote.trim(),
              }
            : current,
      );

      setShowRejectForm(false);

      setSuccessMessage(
        "Your requested changes have been sent to the business.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your request.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function declineQuotation(
    reason: string,
  ) {
    setActionLoading("reject");
    setError(null);

    try {
      const result =
        await apiFetch<PublicQuotationResponse>(
          `/public/quotations/${token}/reject`,
          {
            method: "POST",

            requireAuth: false,

            body: JSON.stringify({
              note:
                reason.trim(),
            }),
          },
        );

      setQuotation(
        (current) =>
          current
            ? {
                ...current,

                status:
                  result.quotation
                    .status,

                customerResponseNote:
                  reason.trim(),
              }
            : current,
      );

      setSuccessMessage(
        "The business has been informed that you declined this quotation.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to decline quotation.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="qufo-background flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle
            size={18}
            className="animate-spin text-emerald-300"
          />

          Loading quotation...
        </div>
      </main>
    );
  }

  if (
    error &&
    !quotation
  ) {
    return (
      <main className="qufo-background flex min-h-screen items-center justify-center px-6">
        <div className="qufo-surface w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/[0.08] text-red-300">
            <XCircle size={22} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-white">
            Quotation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <p className="mt-6 text-xs text-slate-600">
            Please contact the
            business if you believe
            this link should still be
            active.
          </p>
        </div>
      </main>
    );
  }

  if (!quotation) {
    return null;
  }

  const canRespond =
    quotation.status === "SENT" ||
    quotation.status === "VIEWED";

  return (
    <main className="qufo-background min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BusinessMark />

            <div>
              <p className="text-lg font-semibold text-white">
                {
                  quotation
                    .organization.name
                }
              </p>

              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
                Powered by QUFO
              </p>
            </div>
          </div>

          <QuotationStatusBadge
            status={
              quotation.status
            }
          />
        </header>

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-4">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-300"
            />

            <p className="text-sm leading-6 text-emerald-200">
              {successMessage}
            </p>
          </div>
        )}

        {error && quotation && (
          <div className="mb-6 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="qufo-surface overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  <FileText
                    size={14}
                  />

                  Quotation
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {
                    quotation
                      .quotationNumber
                  }
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                  Prepared for{" "}
                  <span className="text-slate-300">
                    {quotation.customer
                      .companyName ??
                      quotation.customer
                        .name}
                  </span>
                </p>

                {quotation.customer
                  .companyName && (
                  <p className="mt-1 text-xs text-slate-600">
                    Contact:{" "}
                    {
                      quotation
                        .customer.name
                    }
                  </p>
                )}
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
                <DateInfo
                  icon={
                    CalendarDays
                  }
                  label="Issued"
                  value={formatDate(
                    quotation.issueDate,
                  )}
                />

                <DateInfo
                  icon={Clock3}
                  label="Valid until"
                  value={
                    quotation.validUntil
                      ? formatDate(
                          quotation.validUntil,
                        )
                      : "No expiry"
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
              <div className="hidden grid-cols-[1fr_100px_120px_140px] border-b border-[var(--qufo-border)] bg-white/[0.02] px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-600 sm:grid">
                <span>
                  Item
                </span>

                <span>
                  Quantity
                </span>

                <span>
                  Unit Price
                </span>

                <span className="text-right">
                  Total
                </span>
              </div>

              <div>
                {quotation.items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="border-b border-[var(--qufo-border)] p-5 last:border-0 sm:grid sm:grid-cols-[1fr_100px_120px_140px] sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {
                            item.name
                          }
                        </p>

                        {item.description && (
                          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
                            {
                              item.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="mt-3 text-sm text-slate-400 sm:mt-0">
                        {
                          formatQuantity(
                            item.quantity,
                          )
                        }{" "}
                        {item.unit}
                      </div>

                      <div className="mt-2 text-sm text-slate-400 sm:mt-0">
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </div>

                      <div className="mt-2 text-sm font-medium text-slate-200 sm:mt-0 sm:text-right">
                        {formatCurrency(
                          item.total,
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {quotation.notes && (
                  <InfoBlock
                    title="Notes"
                  >
                    {
                      quotation.notes
                    }
                  </InfoBlock>
                )}

                {quotation.terms && (
                  <InfoBlock
                    title="Terms & conditions"
                  >
                    {
                      quotation.terms
                    }
                  </InfoBlock>
                )}

                {quotation
                  .customerResponseNote && (
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
                      <MessageSquareText
                        size={16}
                      />

                      Customer response
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                      {
                        quotation
                          .customerResponseNote
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
                <h2 className="mb-5 text-sm font-medium text-slate-300">
                  Summary
                </h2>

                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(
                    quotation.subtotal,
                  )}
                />

                {Number(
                  quotation.discountAmount,
                ) > 0 && (
                  <SummaryRow
                    label={
                      quotation.discountType ===
                      "PERCENTAGE"
                        ? `Discount (${formatNumber(
                            quotation.discountValue,
                          )}%)`
                        : "Discount"
                    }
                    value={`- ${formatCurrency(
                      quotation.discountAmount,
                    )}`}
                  />
                )}

                {Number(
                  quotation.taxAmount,
                ) > 0 && (
                  <SummaryRow
                    label={`Tax (${formatNumber(
                      quotation.taxRate,
                    )}%)`}
                    value={formatCurrency(
                      quotation.taxAmount,
                    )}
                  />
                )}

                <div className="mt-5 border-t border-[var(--qufo-border)] pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm text-slate-400">
                      Total
                    </span>

                    <span className="text-2xl font-semibold tracking-tight text-emerald-300">
                      {formatCurrency(
                        quotation.total,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canRespond && (
            <div className="border-t border-[var(--qufo-border)] bg-black/10 p-6 sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <ShieldCheck
                      size={17}
                      className="text-emerald-300"
                    />

                    Ready to proceed?
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Approving confirms
                    that you agree with
                    the quotation details
                    above.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);

                      setShowRejectForm(
                        true,
                      );
                    }}
                    disabled={
                      actionLoading !==
                      null
                    }
                    className="rounded-xl border border-[var(--qufo-border)] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-400/[0.05] hover:text-red-300 disabled:opacity-50"
                  >
                    Request changes
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void approveQuotation()
                    }
                    disabled={
                      actionLoading !==
                      null
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {actionLoading ===
                    "approve" ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Check
                        size={16}
                      />
                    )}

                    Approve quotation
                  </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError(null);

                        const reason =
                          window.prompt(
                            "Why are you declining this quotation?",
                          );

                        if (!reason?.trim()) {
                          return;
                        }

                        void declineQuotation(
                          reason,
                        );
                      }}
                      disabled={
                        actionLoading !== null
                      }
                      className="text-xs text-slate-600 underline-offset-4 transition hover:text-red-300 hover:underline"
                    >
                      Decline quotation
                    </button>

                </div>
              </div>
            </div>
          )}

          {quotation.status ===
            "APPROVED" && (
            <ResponseBanner
              type="success"
              title="Quotation approved"
              message="Thank you. The business has been notified and can proceed with your order."
            />
          )}

          {quotation.status ===
            "CHANGES_REQUESTED" && (
            <ResponseBanner
              type="warning"
              title="Changes requested"
              message="Your request has been sent. The business can prepare and send you a revised quotation."
            />
          )}

          {quotation.status ===
            "REJECTED" && (
            <ResponseBanner
              type="warning"
              title="Changes requested"
              message="Your response has been recorded. The business can review your request and prepare a revised quotation."
            />
          )}

          {quotation.status ===
            "EXPIRED" && (
            <ResponseBanner
              type="warning"
              title="Quotation expired"
              message="This quotation is no longer available for approval. Please contact the business for an updated quotation."
            />
          )}

          {quotation.status ===
            "CONVERTED" && (
            <ResponseBanner
              type="success"
              title="Order confirmed"
              message="This approved quotation has already been converted into a production job."
            />
          )}
        </section>

        <footer className="mt-8 flex flex-col gap-3 text-center text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>
            Secure quotation powered
            by QUFO
          </span>

          <span>
            Quick Flow · Move work
            forward.
          </span>
        </footer>
      </div>

      {showRejectForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="qufo-surface w-full max-w-lg rounded-3xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-400/[0.08] text-amber-300">
                  <MessageSquareText
                    size={18}
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Request changes
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tell the business
                  what you would like
                  changed in this
                  quotation.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRejectForm(
                    false,
                  )
                }
                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <textarea
              autoFocus
              rows={5}
              value={rejectNote}
              onChange={(event) =>
                setRejectNote(
                  event.target.value,
                )
              }
              className="qufo-input mt-6 resize-none"
              placeholder="Example: Please revise the quantity to 3 pieces and update the total price."
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowRejectForm(
                    false,
                  )
                }
                disabled={
                  actionLoading !== null
                }
                className="rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[0.04]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void requestChanges()
                }
                disabled={
                  actionLoading !== null
                }
                className="flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-medium text-slate-950 disabled:opacity-50"
              >
                {actionLoading ===
                "reject" && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                Submit request
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function BusinessMark() {
  return (
    <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/15 bg-[var(--qufo-surface)]">
      <div className="absolute -left-3 -top-3 size-10 rounded-full bg-cyan-400/10 blur-xl" />

      <div className="absolute -bottom-4 -right-3 size-10 rounded-full bg-emerald-400/10 blur-xl" />

      <Building2
        size={19}
        className="relative text-emerald-300"
      />
    </div>
  );
}

function DateInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-white/[0.03] text-slate-500">
        <Icon size={14} />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600">
        {title}
      </h3>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
        {children}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-slate-300">
        {value}
      </span>
    </div>
  );
}

function ResponseBanner({
  type,
  title,
  message,
}: {
  type:
    | "success"
    | "warning";

  title: string;
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={[
        "border-t p-6 sm:p-8",
        success
          ? "border-emerald-400/10 bg-emerald-400/[0.035]"
          : "border-amber-400/10 bg-amber-400/[0.035]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-300"
          />
        ) : (
          <Clock3
            size={20}
            className="mt-0.5 shrink-0 text-amber-300"
          />
        )}

        <div>
          <p
            className={
              success
                ? "font-medium text-emerald-200"
                : "font-medium text-amber-200"
            }
          >
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuotationStatusBadge({
  status,
}: {
  status: QuotationStatus;
}) {
  const styles:
    Record<
      QuotationStatus,
      string
    > = {
    DRAFT:
      "bg-slate-400/[0.08] text-slate-400",

    SENT:
      "bg-blue-400/[0.08] text-blue-300",

    VIEWED:
      "bg-cyan-400/[0.08] text-cyan-300",

    CHANGES_REQUESTED:
      "bg-amber-400/[0.08] text-amber-300",

    APPROVED:
      "bg-emerald-400/[0.08] text-emerald-300",

    REJECTED:
      "bg-amber-400/[0.08] text-amber-300",

    EXPIRED:
      "bg-red-400/[0.08] text-red-300",

    CONVERTED:
      "bg-violet-400/[0.08] text-violet-300",

    CANCELLED:
      "bg-slate-400/[0.08] text-slate-500",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />

      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function formatCurrency(
  value: string,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    },
  ).format(
    Number(value),
  );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatQuantity(
  value: string,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      maximumFractionDigits: 3,
    },
  ).format(
    Number(value),
  );
}

function formatNumber(
  value: string,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      maximumFractionDigits: 2,
    },
  ).format(
    Number(value),
  );
}