"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Check,
  Clipboard,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  CopyPlus,
  Search,
  Send,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";

import {
  QuotationFormModal,
} from "@/components/quotations/quotation-form-modal";

import { apiFetch } from "@/lib/api";
import { useAuthSession } from "@/lib/auth-storage";

import type {
  Customer,
  CustomersResponse,
} from "@/types/customer";

import type {
  Quotation,
  QuotationFormData,
  QuotationStatus,
  QuotationsResponse,
} from "@/types/quotation";

type StatusFilter =
  | "ALL"
  | QuotationStatus;

type SendQuotationResponse = {
  id: string;
  quotationNumber: string;
  status: "SENT";
  sentAt: string;
  publicUrl: string;
};

export default function QuotationsPage() {
  const session =
    useAuthSession();

  const [quotations, setQuotations] =
    useState<Quotation[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [
    activeSearch,
    setActiveSearch,
  ] = useState("");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    editingQuotation,
    setEditingQuotation,
  ] =
    useState<Quotation | null>(
      null,
    );

  const [
    showQuotationForm,
    setShowQuotationForm,
  ] = useState(false);

  const [
    generatedLink,
    setGeneratedLink,
  ] = useState<string | null>(
    null,
  );

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    async function initialLoad() {
      try {
        const [
          quotationData,
          customerData,
        ] = await Promise.all([
          apiFetch<QuotationsResponse>(
            "/quotations?page=1&limit=20",
          ),

          apiFetch<CustomersResponse>(
            "/customers?page=1&limit=100&status=ACTIVE",
          ),
        ]);

        setQuotations(
          quotationData.items,
        );

        setPage(
          quotationData
            .pagination.page,
        );

        setPages(
          quotationData
            .pagination.pages,
        );

        setTotal(
          quotationData
            .pagination.total,
        );

        setCustomers(
          customerData.items,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load quotations.",
        );
      } finally {
        setLoading(false);
      }
    }

    void initialLoad();
  }, []);

  async function loadQuotations(
    options?: {
      page?: number;
      search?: string;
      status?: StatusFilter;
    },
  ) {
    const targetPage =
      options?.page ?? page;

    const targetSearch =
      options?.search ??
      activeSearch;

    const targetStatus =
      options?.status ??
      status;

    setLoading(true);
    setError(null);

    try {
      const params =
        new URLSearchParams({
          page:
            String(targetPage),

          limit:
            "20",
        });

      if (targetSearch) {
        params.set(
          "search",
          targetSearch,
        );
      }

      if (
        targetStatus !== "ALL"
      ) {
        params.set(
          "status",
          targetStatus,
        );
      }

      const data =
        await apiFetch<QuotationsResponse>(
          `/quotations?${params.toString()}`,
        );

      setQuotations(
        data.items,
      );

      setPage(
        data.pagination.page,
      );

      setPages(
        data.pagination.pages,
      );

      setTotal(
        data.pagination.total,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quotations.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const value =
      search.trim();

    setActiveSearch(value);

    await loadQuotations({
      page: 1,
      search: value,
    });
  }

  async function changeStatus(
    value: StatusFilter,
  ) {
    setStatus(value);

    await loadQuotations({
      page: 1,
      status: value,
    });
  }

  function openCreate() {
    setEditingQuotation(null);
    setShowQuotationForm(true);
  }

  async function openEdit(
    quotation: Quotation,
  ) {
    try {
      const fullQuotation =
        await apiFetch<Quotation>(
          `/quotations/${quotation.id}`,
        );

      setEditingQuotation(
        fullQuotation,
      );

      setShowQuotationForm(
        true,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quotation.",
      );
    }
  }

  async function saveQuotation(
    data: QuotationFormData,
  ) {
    setSaving(true);

    try {
      const body = {
        customerId:
          data.customerId,

        validUntil:
          data.validUntil ||
          undefined,

        discountType:
          data.discountType,

        discountValue:
          Number(
            data.discountValue,
          ) || 0,

        taxRate:
          Number(
            data.taxRate,
          ) || 0,

        notes:
          data.notes.trim() ||
          undefined,

        terms:
          data.terms.trim() ||
          undefined,

        items:
          data.items.map(
            (item) => ({
              name:
                item.name.trim(),

              description:
                item.description
                  .trim() ||
                undefined,

              quantity:
                Number(
                  item.quantity,
                ),

              unit:
                item.unit.trim(),

              unitPrice:
                Number(
                  item.unitPrice,
                ),
            }),
          ),
      };

      if (editingQuotation) {
        await apiFetch(
          `/quotations/${editingQuotation.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              body,
            ),
          },
        );
      } else {
        await apiFetch(
          "/quotations",
          {
            method: "POST",
            body: JSON.stringify(
              body,
            ),
          },
        );
      }

      setShowQuotationForm(
        false,
      );

      setEditingQuotation(
        null,
      );

      await loadQuotations({
        page:
          editingQuotation
            ? page
            : 1,
      });
    } finally {
      setSaving(false);
    }
  }

  async function sendQuotation(
    quotation: Quotation,
  ) {
    const confirmed =
      window.confirm(
        `Send ${quotation.quotationNumber} to the customer? Once sent, it can no longer be edited.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await apiFetch<SendQuotationResponse>(
          `/quotations/${quotation.id}/send`,
          {
            method: "POST",
          },
        );

      setGeneratedLink(
        result.publicUrl,
      );

      setCopied(false);

      await loadQuotations({
        page,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send quotation.",
      );
    }
  }

  async function createRevision(
    quotation: Quotation,
  ) {
    const confirmed =
      window.confirm(
        `Create a new revision from ${quotation.quotationNumber}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await apiFetch<{
          quotation: Quotation;
        }>(
          `/quotations/${quotation.id}/revise`,
          {
            method: "POST",
          },
        );

      /*
      * Load full newly-created revision
      * straight into the edit form.
      */
      const fullQuotation =
        await apiFetch<Quotation>(
          `/quotations/${result.quotation.id}`,
        );

      setEditingQuotation(
        fullQuotation,
      );

      setShowQuotationForm(
        true,
      );

      await loadQuotations({
        page: 1,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create revision.",
      );
    }
  }

  async function copyLink() {
    if (!generatedLink) {
      return;
    }

    await navigator.clipboard.writeText(
      generatedLink,
    );

    setCopied(true);
  }

  const canSend =
    session?.organization.role ===
      "OWNER" ||
    session?.organization.role ===
      "ADMIN" ||
    session?.organization.role ===
      "MANAGER";

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Create, send, and manage customer quotations."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={17} />

            New quotation
          </button>
        }
      />

      <div className="qufo-surface overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-[var(--qufo-border)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-sm pl-12"
          >
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
              placeholder="Search quotation or customer..."
            />
          </form>

          <select
            value={status}
            onChange={(event) =>
              void changeStatus(
                event.target
                  .value as StatusFilter,
              )
            }
            className="qufo-input w-full text-sm lg:w-44"
          >
            <option value="ALL">
              All statuses
            </option>
            <option value="DRAFT">
              Draft
            </option>
            <option value="SENT">
              Sent
            </option>
            <option value="VIEWED">
              Viewed
            </option>
            <option value="CHANGES_REQUESTED">
              Changes requested
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="REJECTED">
              Rejected
            </option>
            <option value="EXPIRED">
              Expired
            </option>
            <option value="CONVERTED">
              Converted
            </option>
          </select>
        </div>

        {error && (
          <div className="border-b border-red-400/10 bg-red-400/[0.04] px-5 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle
                size={17}
                className="animate-spin"
              />

              Loading quotations...
            </div>
          </div>
        ) : quotations.length ===
          0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
              <FileText
                size={20}
              />
            </div>

            <h3 className="font-medium text-slate-300">
              No quotations found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Create a quotation
              for an existing
              customer to start
              the sales workflow.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-[var(--qufo-border)]">
                    <TableHead>
                      Quotation
                    </TableHead>

                    <TableHead>
                      Customer
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Valid until
                    </TableHead>

                    <TableHead>
                      Items
                    </TableHead>

                    <TableHead>
                      Total
                    </TableHead>

                    <TableHead>
                      <span className="sr-only">
                        Actions
                      </span>
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {quotations.map(
                    (quotation) => (
                      <tr
                        key={
                          quotation.id
                        }
                        className="group border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">
                            {
                              quotation.quotationNumber
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {formatDate(
                              quotation.issueDate,
                            )}
                          </p>

                            {quotation.customerResponseNote &&
                            (
                              quotation.status ===
                                "CHANGES_REQUESTED" ||
                              quotation.status ===
                                "REJECTED"
                            ) && (
                              <div className="mt-2 max-w-xs rounded-lg border border-amber-400/10 bg-amber-400/[0.04] px-2.5 py-2">
                                <p className="line-clamp-2 text-xs leading-5 text-amber-200/80">
                                  “
                                  {
                                    quotation.customerResponseNote
                                  }
                                  ”
                                </p>
                              </div>
                            )}

                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-300">
                            {quotation
                              .customer
                              .companyName ??
                              quotation
                                .customer
                                .name}
                          </p>

                          {quotation
                            .customer
                            .companyName && (
                            <p className="mt-1 text-xs text-slate-600">
                              {
                                quotation
                                  .customer
                                  .name
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <QuotationStatusBadge
                            status={
                              quotation.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {quotation.validUntil
                            ? formatDate(
                                quotation.validUntil,
                              )
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {quotation
                            ._count
                            ?.items ??
                            quotation
                              .items
                              ?.length ??
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">
                            {formatCurrency(
                              quotation.total,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {quotation.status ===
                              "DRAFT" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void openEdit(
                                    quotation,
                                  )
                                }
                                title="Edit quotation"
                                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </button>
                            )}

                            {quotation.status ===
                              "DRAFT" &&
                              canSend && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void sendQuotation(
                                      quotation,
                                    )
                                  }
                                  title="Send quotation"
                                  className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-400/[0.07] hover:text-emerald-300"
                                >
                                  <Send
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              )}

                              {quotation.status ===
                                "CHANGES_REQUESTED" &&
                                canSend && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void createRevision(
                                        quotation,
                                      )
                                    }
                                    title="Create revision"
                                    className="flex size-9 items-center justify-center rounded-lg text-amber-300 transition hover:bg-amber-400/[0.08]"
                                  >
                                    <CopyPlus size={15} />
                                  </button>
                                )}

                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {total} quotations
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    void loadQuotations(
                      {
                        page:
                          page - 1,
                      },
                    )
                  }
                  className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-sm text-slate-400 disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="px-2 text-xs text-slate-500">
                  Page {page} of{" "}
                  {Math.max(
                    pages,
                    1,
                  )}
                </span>

                <button
                  disabled={
                    page >= pages ||
                    loading
                  }
                  onClick={() =>
                    void loadQuotations(
                      {
                        page:
                          page + 1,
                      },
                    )
                  }
                  className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-sm text-slate-400 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showQuotationForm && (
        <QuotationFormModal
          key={
            editingQuotation?.id ??
            "new-quotation"
          }
          customers={customers}
          quotation={
            editingQuotation
          }
          loading={saving}
          onClose={() => {
            if (!saving) {
              setShowQuotationForm(
                false,
              );

              setEditingQuotation(
                null,
              );
            }
          }}
          onSubmit={
            saveQuotation
          }
        />
      )}

      {generatedLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="qufo-surface w-full max-w-lg rounded-3xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Send
                    size={18}
                  />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Quotation sent
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Share this secure
                  approval link with
                  the customer.
                </p>
              </div>

              <button
                onClick={() =>
                  setGeneratedLink(
                    null,
                  )
                }
                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <input
                readOnly
                value={generatedLink}
                className="qufo-input min-w-0 flex-1 text-xs"
              />

              <button
                type="button"
                onClick={() =>
                  void copyLink()
                }
                className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-medium text-slate-950"
              >
                {copied ? (
                  <Check
                    size={16}
                  />
                ) : (
                  <Clipboard
                    size={16}
                  />
                )}

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
      {children}
    </th>
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
      "bg-red-400/[0.08] text-red-300",

    EXPIRED:
      "bg-amber-400/[0.08] text-amber-300",

    CONVERTED:
      "bg-violet-400/[0.08] text-violet-300",

    CANCELLED:
      "bg-slate-400/[0.08] text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status.replace(
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
  ).format(Number(value));
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
  ).format(new Date(value));
}
