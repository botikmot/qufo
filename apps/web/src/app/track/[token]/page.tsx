"use client";

import {
  Check,
  //CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  PackageOpen,
  RefreshCcw,
  //Truck,
  XCircle,
} from "lucide-react";

import { useParams } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";

import type {
  JobStatus,
  PublicJob,
} from "@/types/job";

const JOB_STEPS: {
  status: JobStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "PENDING",
    label: "Order received",
    description:
      "Your order has been received.",
  },
  {
    status: "QUEUED",
    label: "Queued for production",
    description:
      "Your order has been added to the production queue.",
  },
  {
    status: "IN_PROGRESS",
    label: "In production",
    description:
      "Production work is currently in progress.",
  },
  {
    status: "FOR_REVIEW",
    label: "Quality review",
    description:
      "Your order is being reviewed before release.",
  },
  {
    status: "READY",
    label: "Ready",
    description:
      "Your order is ready for pickup or delivery.",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description:
      "Your order has been delivered.",
  },
  {
    status: "COMPLETED",
    label: "Completed",
    description:
      "The job has been completed.",
  },
];

export default function PublicJobTrackingPage() {
  const params =
    useParams<{
      token: string;
    }>();

  const token =
    params.token;

  const [
    job,
    setJob,
  ] =
    useState<PublicJob | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    if (!token) {
        return;
    }

    let cancelled = false;

    apiFetch<PublicJob>(
        `/public/jobs/${token}`,
        {
        requireAuth: false,
        },
    )
        .then((data) => {
        if (!cancelled) {
            setJob(data);
        }
        })
        .catch((error: unknown) => {
        if (!cancelled) {
            setError(
            error instanceof Error
                ? error.message
                : "Unable to load job tracking.",
            );
        }
        })
        .finally(() => {
        if (!cancelled) {
            setLoading(false);
        }
        });

    return () => {
        cancelled = true;
    };
    }, [token]);

    async function refreshJob() {
        if (!token) {
            return;
        }

        setRefreshing(true);
        setError(null);

        try {
            const data =
            await apiFetch<PublicJob>(
                `/public/jobs/${token}`,
                {
                requireAuth: false,
                },
            );

            setJob(data);
        } catch (error) {
            setError(
            error instanceof Error
                ? error.message
                : "Unable to refresh job tracking.",
            );
        } finally {
            setRefreshing(false);
        }
        }

  if (loading) {
    return (
      <main className="qufo-background flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle
            size={18}
            className="animate-spin text-cyan-300"
          />

          Loading job tracking...
        </div>
      </main>
    );
  }

  if (
    error &&
    !job
  ) {
    return (
      <main className="qufo-background flex min-h-screen items-center justify-center px-6">
        <div className="qufo-surface w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-400/[0.08] text-red-300">
            <XCircle size={22} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-white">
            Tracking unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <p className="mt-6 text-xs text-slate-600">
            The tracking link may
            have expired or been
            replaced. Please contact
            the business for a new
            link.
          </p>
        </div>
      </main>
    );
  }

  if (!job) {
    return null;
  }

  const progress =
    job.progress ??
    getJobProgress(
      job.status,
    );

  return (
    <main className="qufo-background min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/15 bg-[var(--qufo-surface)]">
              <div className="absolute -left-3 -top-3 size-10 rounded-full bg-cyan-400/10 blur-xl" />

              <div className="absolute -bottom-4 -right-3 size-10 rounded-full bg-emerald-400/10 blur-xl" />

              <MapPin
                size={19}
                className="relative text-cyan-300"
              />
            </div>

            <div>
              <p className="text-lg font-semibold text-white">
                {job.organization
                  ?.name ??
                  "Job Tracking"}
              </p>

              <p className="text-xs uppercase tracking-[0.22em] text-slate-600">
                Powered by QUFO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void refreshJob()
            }
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-[var(--qufo-border)] px-3.5 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            <RefreshCcw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh status
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Main job */}
        <section className="qufo-surface overflow-hidden rounded-3xl">
          <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Production Job
                </p>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {job.jobNumber}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {job.title}
                </p>

                {job.customer && (
                  <p className="mt-4 text-xs text-slate-600">
                    Customer:{" "}
                    <span className="text-slate-400">
                      {job.customer
                        .companyName ??
                        job.customer
                          .name}
                    </span>
                  </p>
                )}
              </div>

              <JobStatusBadge
                status={job.status}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="border-b border-[var(--qufo-border)] p-6 sm:p-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Overall progress
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Based on the
                  current production
                  stage.
                </p>
              </div>

              <p className="text-2xl font-semibold text-emerald-300">
                {progress}%
              </p>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {job.dueDate && (
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={14} />

                Expected / due:{" "}
                <span className="text-slate-300">
                  {formatDate(
                    job.dueDate,
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Cancelled warning */}
          {job.status ===
            "CANCELLED" && (
            <div className="border-b border-red-400/10 bg-red-400/[0.035] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <XCircle
                  size={20}
                  className="mt-0.5 text-red-300"
                />

                <div>
                  <p className="font-medium text-red-200">
                    Job cancelled
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This job is no
                    longer in active
                    production. Please
                    contact the
                    business if you
                    need more
                    information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Production stages */}
          {job.status !==
            "CANCELLED" && (
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-slate-300">
                  Production journey
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Follow your order
                  from confirmation
                  through completion.
                </p>
              </div>

              <div className="relative">
                {JOB_STEPS.map(
                  (
                    step,
                    index,
                  ) => {
                    const state =
                      getStepState(
                        job.status,
                        step.status,
                      );

                    const message =
                      getLatestPublicMessage(
                        job,
                        step.status,
                      );

                    return (
                      <div
                        key={
                          step.status
                        }
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index <
                          JOB_STEPS.length -
                            1 && (
                          <div
                            className={[
                              "absolute left-[15px] top-8 h-[calc(100%-16px)] w-px",
                              state ===
                                "completed"
                                ? "bg-emerald-400/35"
                                : "bg-white/[0.06]",
                            ].join(
                              " ",
                            )}
                          />
                        )}

                        <StepIcon
                          state={
                            state
                          }
                        />

                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p
                              className={[
                                "text-sm font-medium",
                                state ===
                                  "current"
                                  ? "text-cyan-200"
                                  : state ===
                                      "completed"
                                    ? "text-slate-300"
                                    : "text-slate-600",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                step.label
                              }
                            </p>

                            {getUpdateDate(
                              job,
                              step.status,
                            ) && (
                              <span className="text-[11px] text-slate-700">
                                {formatDateTime(
                                  getUpdateDate(
                                    job,
                                    step.status,
                                  )!,
                                )}
                              </span>
                            )}
                          </div>

                          <p
                            className={[
                              "mt-1 text-xs leading-5",
                              state ===
                                "pending"
                                ? "text-slate-700"
                                : "text-slate-500",
                            ].join(
                              " ",
                            )}
                          >
                            {message ??
                              step.description}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Items */}
          {job.items &&
            job.items.length >
              0 && (
            <div className="border-t border-[var(--qufo-border)] p-6 sm:p-8">
              <h2 className="mb-4 text-sm font-medium text-slate-300">
                Order items
              </h2>

              <div className="overflow-hidden rounded-2xl border border-[var(--qufo-border)]">
                {job.items.map(
                  (item, index) => (
                    <div
                      key={`${item.name}-${item.sortOrder ?? index}`}
                      className="flex flex-col gap-2 border-b border-[var(--qufo-border)] px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          {
                            item.name
                          }
                        </p>

                        {item.description && (
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {
                              item.description
                            }
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-slate-500">
                        {formatQuantity(
                          item.quantity,
                        )}{" "}
                        {item.unit}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Latest updates */}
          {job.updates &&
            job.updates.filter(
              (update) =>
                Boolean(
                  update.publicMessage,
                ),
            ).length >
              0 && (
            <div className="border-t border-[var(--qufo-border)] p-6 sm:p-8">
              <h2 className="text-sm font-medium text-slate-300">
                Latest updates
              </h2>

              <div className="mt-4 space-y-3">
                {job.updates
                  .filter(
                    (update) =>
                      Boolean(
                        update.publicMessage,
                      ),
                  )
                  .slice(0, 5)
                  .map(
                    (update) => (
                      <div
                        key={
                          update.id
                        }
                        className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <PackageOpen
                            size={
                              16
                            }
                            className="mt-0.5 shrink-0 text-cyan-300"
                          />

                          <div>
                            <p className="text-sm leading-6 text-slate-300">
                              {
                                update.publicMessage
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-slate-600">
                              {formatDateTime(
                                update.createdAt,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>
          )}

          {job.status ===
            "COMPLETED" && (
            <div className="border-t border-emerald-400/10 bg-emerald-400/[0.035] p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <PackageCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-300"
                />

                <div>
                  <p className="font-medium text-emerald-200">
                    Job completed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your order has
                    successfully
                    completed the
                    production
                    workflow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Business contact */}
        {job.organization &&
          (job.organization.phone ||
            job.organization.email ||
            job.organization
              .address) && (
          <section className="qufo-surface-soft mt-5 rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
              Need help?
            </p>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {job.organization
                .phone && (
                <span>
                  {
                    job
                      .organization
                      .phone
                  }
                </span>
              )}

              {job.organization
                .email && (
                <span>
                  {
                    job
                      .organization
                      .email
                  }
                </span>
              )}

              {job.organization
                .address && (
                <span>
                  {
                    job
                      .organization
                      .address
                  }
                </span>
              )}
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-col gap-2 text-center text-xs text-slate-700 sm:flex-row sm:justify-between">
          <span>
            Secure job tracking
            powered by QUFO
          </span>

          <span>
            Quick Flow · Move work
            forward.
          </span>
        </footer>
      </div>
    </main>
  );
}

function StepIcon({
  state,
}: {
  state:
    | "completed"
    | "current"
    | "pending";
}) {
  if (
    state === "completed"
  ) {
    return (
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.1] text-emerald-300">
        <Check size={14} />
      </div>
    );
  }

  if (state === "current") {
    return (
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/[0.1] text-cyan-300">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-300 opacity-40" />
          <span className="relative inline-flex size-2.5 rounded-full bg-cyan-300" />
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-black/10">
      <span className="size-2 rounded-full bg-slate-700" />
    </div>
  );
}

function JobStatusBadge({
  status,
}: {
  status: JobStatus;
}) {
  const styles: Record<
    JobStatus,
    string
  > = {
    PENDING:
      "bg-slate-400/[0.08] text-slate-400",

    QUEUED:
      "bg-blue-400/[0.08] text-blue-300",

    IN_PROGRESS:
      "bg-cyan-400/[0.08] text-cyan-300",

    FOR_REVIEW:
      "bg-violet-400/[0.08] text-violet-300",

    READY:
      "bg-emerald-400/[0.08] text-emerald-300",

    DELIVERED:
      "bg-teal-400/[0.08] text-teal-300",

    COMPLETED:
      "bg-emerald-400/[0.08] text-emerald-300",

    CANCELLED:
      "bg-red-400/[0.08] text-red-300",
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

function getJobProgress(
  status: JobStatus,
) {
  const values: Record<
    JobStatus,
    number
  > = {
    PENDING: 10,
    QUEUED: 20,
    IN_PROGRESS: 50,
    FOR_REVIEW: 70,
    READY: 85,
    DELIVERED: 95,
    COMPLETED: 100,
    CANCELLED: 0,
  };

  return values[status];
}

function getStepState(
  currentStatus: JobStatus,
  stepStatus: JobStatus,
):
  | "completed"
  | "current"
  | "pending" {
  const order: JobStatus[] =
    [
      "PENDING",
      "QUEUED",
      "IN_PROGRESS",
      "FOR_REVIEW",
      "READY",
      "DELIVERED",
      "COMPLETED",
    ];

  const currentIndex =
    order.indexOf(
      currentStatus,
    );

  const stepIndex =
    order.indexOf(
      stepStatus,
    );

  if (
    stepIndex < currentIndex
  ) {
    return "completed";
  }

  if (
    stepIndex === currentIndex
  ) {
    return "current";
  }

  return "pending";
}

function getLatestPublicMessage(
  job: PublicJob,
  status: JobStatus,
) {
  return (
    job.updates
      ?.filter(
        (update) =>
          update.status ===
            status &&
          update.publicMessage,
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      )[0]
      ?.publicMessage ??
    null
  );
}

function getUpdateDate(
  job: PublicJob,
  status: JobStatus,
) {
  return (
    job.updates
      ?.filter(
        (update) =>
          update.status ===
          status,
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      )[0]?.createdAt ??
    null
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

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
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