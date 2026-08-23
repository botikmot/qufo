"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  customersService,
} from "@/services/customers.service";

import type {
  Customer,
} from "@/types/customer";

import type {
  CustomerFormData,
} from "@/types/customer-form";

import { useConfirm } from "@/components/providers/confirm-dialog-provider";

export function useCustomers() {
  const [
    customers,
    setCustomers,
  ] =
    useState<Customer[]>([]);

  const confirm = useConfirm();

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] =
    useState<Customer | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    activeSearch,
    setActiveSearch,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    archivingId,
    setArchivingId,
  ] =
    useState<string | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingCustomer,
    setEditingCustomer,
  ] =
    useState<Customer | null>(
      null,
    );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    customersService
      .getAll(
        1,
        20,
      )
      .then((data) => {
        if (cancelled) {
          return;
        }

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
      })
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load customers.",
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

  async function loadCustomers(
    options?: {
      page?: number;
      search?: string;
    },
  ) {
    const targetPage =
      options?.page ?? page;

    const targetSearch =
      options?.search ??
      activeSearch;

    setLoading(true);
    setError(null);

    try {
      const data =
        await customersService.getAll(
          targetPage,
          20,
          targetSearch
            ? {
                search: targetSearch,
              }
            : undefined,
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

  async function openCustomer(
    customer: Customer,
  ) {
    setDetailLoading(true);
    setError(null);

    try {
      const fullCustomer =
        await customersService.getOne(
          customer.id,
        );

      setSelectedCustomer(
        fullCustomer,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customer.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeCustomer() {
    setSelectedCustomer(null);
  }

  async function archiveCustomer(
    customer: Customer,
  ) {
    const confirmed =
      await confirm({
        title:
          "Archive customer?",
        description: `Archive ${customer.name}? You can no longer use this customer for new transactions while archived.`,
        confirmText:
          "Archive customer",
        variant:
          "destructive",
      });

    if (!confirmed) {
      return;
    }

    setArchivingId(
      customer.id,
    );

    setError(null);

    try {
      await customersService.archive(
        customer.id,
      );

      if (
        selectedCustomer?.id ===
        customer.id
      ) {
        setSelectedCustomer(
          null,
        );
      }

      await loadCustomers({
        page,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to archive customer.",
      );
    } finally {
      setArchivingId(null);
    }
  }

  function openCreateForm() {
    setEditingCustomer(null);
    setShowForm(true);
  }

  async function openEditForm() {
    if (!selectedCustomer) {
      return;
    }

    setError(null);

    try {
      const customer =
        await customersService.getOne(
          selectedCustomer.id,
        );

      setEditingCustomer(
        customer,
      );

      setShowForm(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customer.",
      );
    }
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCustomer(null);
  }

  async function saveCustomer(
    data: CustomerFormData,
  ) {
    setSaving(true);
    setError(null);

    try {
      if (editingCustomer) {
        await customersService.update(
          editingCustomer.id,
          data,
        );
      } else {
        await customersService.create(
          data,
        );
      }

      setShowForm(false);
      setEditingCustomer(null);
      setSelectedCustomer(null);

      await loadCustomers({
        page: editingCustomer
          ? page
          : 1,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save customer.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  return {
    customers,
    selectedCustomer,

    search,

    page,
    pages,
    total,

    loading,
    detailLoading,
    archivingId,
    error,

    showForm,
    editingCustomer,
    saving,

    openCreateForm,
    openEditForm,
    closeForm,
    saveCustomer,

    setSearch,

    handleSearch,

    openCustomer,
    closeCustomer,

    archiveCustomer,

    reload:
      loadCustomers,

    previousPage: () =>
      loadCustomers({
        page: Math.max(
          page - 1,
          1,
        ),
      }),

    nextPage: () =>
      loadCustomers({
        page: Math.min(
          page + 1,
          pages,
        ),
      }),
  };
}