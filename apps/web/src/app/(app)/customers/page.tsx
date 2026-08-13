"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Archive,
  Building2,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/app/page-header";

import {
  CustomerFormModal,
} from "@/components/customers/customer-form-modal";

import { apiFetch } from "@/lib/api";
import { useAuthSession } from "@/lib/auth-storage";

import type {
  Customer,
  CustomerFormData,
  CustomerStatus,
  CustomersResponse,
} from "@/types/customer";

export default function CustomersPage() {
  const session =
    useAuthSession();

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

  const [activeSearch, setActiveSearch] =
    useState("");

  const [status, setStatus] =
    useState<CustomerStatus>(
      "ACTIVE",
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    showCustomerForm,
    setShowCustomerForm,
  ] = useState(false);

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    async function initialLoad() {
      try {
        const data =
          await apiFetch<CustomersResponse>(
            "/customers?page=1&limit=20&status=ACTIVE",
          );

        setCustomers(
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
            : "Unable to load customers.",
        );
      } finally {
        setLoading(false);
      }
    }

    void initialLoad();
  }, []);

  async function loadCustomers(
    options?: {
      page?: number;
      search?: string;
      status?: CustomerStatus;
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

          status:
            targetStatus,
        });

      if (targetSearch) {
        params.set(
          "search",
          targetSearch,
        );
      }

      const data =
        await apiFetch<CustomersResponse>(
          `/customers?${params.toString()}`,
        );

      setCustomers(
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
          : "Unable to load customers.",
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

    await loadCustomers({
      page: 1,
      search: value,
    });
  }

  async function changeStatus(
    newStatus: CustomerStatus,
  ) {
    setStatus(newStatus);

    await loadCustomers({
      page: 1,
      status: newStatus,
    });
  }

  function openCreate() {
    setEditingCustomer(null);
    setShowCustomerForm(true);
  }

  async function openEdit(
    customer: Customer,
  ) {
    try {
      const fullCustomer =
        await apiFetch<Customer>(
          `/customers/${customer.id}`,
        );

      setEditingCustomer(
        fullCustomer,
      );

      setShowCustomerForm(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customer.",
      );
    }
  }

  async function saveCustomer(
    data: CustomerFormData,
  ) {
    setSaving(true);

    try {
      const body = {
        type:
          data.type,

        name:
          data.name,

        companyName:
          data.companyName || undefined,

        email:
          data.email || undefined,

        phone:
          data.phone || undefined,

        address:
          data.address || undefined,

        notes:
          data.notes || undefined,
      };

      if (editingCustomer) {
        await apiFetch(
          `/customers/${editingCustomer.id}`,
          {
            method: "PATCH",

            body: JSON.stringify(
              body,
            ),
          },
        );
      } else {
        await apiFetch(
          "/customers",
          {
            method: "POST",

            body: JSON.stringify(
              body,
            ),
          },
        );
      }

      setShowCustomerForm(false);
      setEditingCustomer(null);

      await loadCustomers({
        page:
          editingCustomer
            ? page
            : 1,
      });
    } finally {
      setSaving(false);
    }
  }

  async function archiveCustomer(
    customer: Customer,
  ) {
    const confirmed =
      window.confirm(
        `Archive ${customer.companyName ?? customer.name}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(
        `/customers/${customer.id}`,
        {
          method: "DELETE",
        },
      );

      await loadCustomers({
        page,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to archive customer.",
      );
    }
  }

  const canArchive =
    session?.organization.role ===
      "OWNER" ||
    session?.organization.role ===
      "ADMIN";

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage the people and businesses flowing through your workspace."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={17} />

            Add customer
          </button>
        }
      />

      <div className="qufo-surface overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-[var(--qufo-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={handleSearch}
            className="relative w-full sm:max-w-sm pl-12"
          >
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              className="qufo-input pl-12"
              placeholder="Search customer..."
            />
          </form>

          <div className="flex rounded-xl border border-[var(--qufo-border)] bg-black/10 p-1">
            <StatusButton
              active={
                status === "ACTIVE"
              }
              onClick={() =>
                void changeStatus(
                  "ACTIVE",
                )
              }
            >
              Active
            </StatusButton>

            <StatusButton
              active={
                status ===
                "ARCHIVED"
              }
              onClick={() =>
                void changeStatus(
                  "ARCHIVED",
                )
              }
            >
              Archived
            </StatusButton>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-500/10 bg-red-500/[0.04] px-5 py-3 text-sm text-red-300">
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

              Loading customers...
            </div>
          </div>
        ) : customers.length === 0 ? (
          <EmptyCustomers
            archived={
              status ===
              "ARCHIVED"
            }
            onAdd={openCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-[var(--qufo-border)] text-left">
                    <TableHead>
                      Customer
                    </TableHead>

                    <TableHead>
                      Contact
                    </TableHead>

                    <TableHead>
                      Type
                    </TableHead>

                    <TableHead>
                      Location
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      <span className="sr-only">
                        Actions
                      </span>
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {customers.map(
                    (customer) => (
                      <CustomerRow
                        key={
                          customer.id
                        }
                        customer={
                          customer
                        }
                        canArchive={
                          canArchive
                        }
                        onEdit={() =>
                          void openEdit(customer)
                        }
                        onArchive={() =>
                          void archiveCustomer(
                            customer,
                          )
                        }
                      />
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-600">
                {total}{" "}
                {total === 1
                  ? "customer"
                  : "customers"}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    void loadCustomers(
                      {
                        page:
                          page - 1,
                      },
                    )
                  }
                  className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-30"
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
                  type="button"
                  disabled={
                    page >= pages ||
                    loading
                  }
                  onClick={() =>
                    void loadCustomers(
                      {
                        page:
                          page + 1,
                      },
                    )
                  }
                  className="rounded-lg border border-[var(--qufo-border)] px-3 py-1.5 text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCustomerForm && (
        <CustomerFormModal
          key={
            editingCustomer?.id ??
            "new-customer"
          }
          customer={
            editingCustomer
          }
          loading={saving}
          onClose={() => {
            if (!saving) {
              setShowCustomerForm(
                false,
              );

              setEditingCustomer(
                null,
              );
            }
          }}
          onSubmit={
            saveCustomer
          }
        />
      )}
    </>
  );
}

function CustomerRow({
  customer,
  canArchive,
  onEdit,
  onArchive,
}: {
  customer: Customer;
  canArchive: boolean;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const displayName =
    customer.type === "COMPANY"
      ? customer.companyName ??
        customer.name
      : customer.name;

  return (
    <tr className="group border-b border-[var(--qufo-border)] transition last:border-0 hover:bg-white/[0.018]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
            {customer.type ===
            "COMPANY" ? (
              <Building2
                size={17}
              />
            ) : (
              <UserRound
                size={17}
              />
            )}
          </div>

          <div>
            <p className="font-medium text-slate-200">
              {displayName}
            </p>

            {customer.type ===
              "COMPANY" && (
              <p className="mt-0.5 text-xs text-slate-600">
                Contact:{" "}
                {customer.name}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-400">
          {customer.phone ??
            "—"}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {customer.email ??
            "No email"}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-full border border-[var(--qufo-border)] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-slate-400">
          {customer.type}
        </span>
      </td>

      <td className="max-w-52 px-5 py-4 text-sm text-slate-500">
        <span className="line-clamp-2">
          {customer.address ??
            "—"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
            customer.status ===
            "ACTIVE"
              ? "bg-emerald-400/[0.08] text-emerald-300"
              : "bg-slate-400/[0.08] text-slate-500",
          ].join(" ")}
        >
          <span
            className={[
              "size-1.5 rounded-full",
              customer.status ===
              "ACTIVE"
                ? "bg-emerald-400"
                : "bg-slate-600",
            ].join(" ")}
          />

          {customer.status}
        </span>
      </td>

      <td className="px-5 py-4">
        {customer.status ===
          "ACTIVE" && (
          <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              title="Edit customer"
              className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
            >
              <Pencil
                size={15}
              />
            </button>

            {canArchive && (
              <button
                type="button"
                onClick={
                  onArchive
                }
                title="Archive customer"
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-400/[0.07] hover:text-amber-300"
              >
                <Archive
                  size={15}
                />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-slate-600">
      {children}
    </th>
  );
}

function StatusButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg px-3 py-1.5 text-xs font-medium transition",
        active
          ? "bg-cyan-400/[0.08] text-cyan-300"
          : "text-slate-600 hover:text-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EmptyCustomers({
  archived,
  onAdd,
}: {
  archived: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--qufo-border)] bg-cyan-400/[0.04] text-cyan-300">
        <UserRound size={20} />
      </div>

      <h3 className="font-medium text-slate-300">
        {archived
          ? "No archived customers"
          : "No customers yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        {archived
          ? "Archived customers will appear here."
          : "Add your first customer to start creating quotations and jobs."}
      </p>

      {!archived && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-400/[0.12]"
        >
          <Plus size={15} />

          Add first customer
        </button>
      )}
    </div>
  );
}