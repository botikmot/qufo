"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  QuotationStatusFilter,
} from "@/components/quotations/quotations-toolbar";

import {
  quotationsService,
} from "@/services/quotations.service";

import type {
  Quotation,
  QuotationDetail,
} from "@/types/quotation";

import type {
  QuotationFormPayload,
} from "@/types/quotation-form";

import {
  customersService,
} from "@/services/customers.service";

import type {
  Customer,
} from "@/types/customer";

import { useConfirm } from "@/components/providers/confirm-dialog-provider";

import {
  useQuotationRealtime,
} from "@/hooks/use-quotation-realtime";

import type {
  QuotationUpdatedEvent,
} from "@/types/realtime";


export function useQuotations() {
  const [
    quotations,
    setQuotations,
  ] =
    useState<Quotation[]>([]);

  const confirm = useConfirm();

  const [
    selectedQuotation,
    setSelectedQuotation,
  ] =
    useState<QuotationDetail | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    activeSearch,
    setActiveSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<QuotationStatusFilter>(
      "ALL",
    );

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
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingQuotation,
    setEditingQuotation,
  ] =
    useState<Quotation | null>(
      null,
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    customers,
    setCustomers,
  ] =
    useState<Customer[]>([]);

  const [
    sentQuotationUrl,
    setSentQuotationUrl,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      quotationsService.getAll({
        page: 1,
        limit: 20,
      }),

      customersService.getAll(
        1,
        100,
      ),
    ])
      .then(
        ([
          quotationData,
          customerData,
        ]) => {
          if (cancelled) {
            return;
          }

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
        },
      )
      .catch(
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load quotations.",
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

  async function sendQuotation() {
    if (!selectedQuotation) {
      return null;
    }

    const confirmed =
      await confirm({
        title:
          "Send quotation?",
        description: `${selectedQuotation.quotationNumber} will be sent to the customer for review.`,
        confirmText:
          "Send quotation",
      });

    if (!confirmed) {
      return null;
    }

    setActionLoading(true);
    setError(null);

    try {
      const result =
        await quotationsService.send(
          selectedQuotation.id,
        );

      const refreshed =
        await quotationsService.getOne(
          selectedQuotation.id,
        );

      setSelectedQuotation(
        refreshed,
      );

      await loadQuotations({
        page,
      });

      const url =
          result.publicUrl ??
          result.quotationUrl ??
          result.url ??
          null;

        setSentQuotationUrl(url);

        return url;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send quotation.",
      );

      throw error;
    } finally {
      setActionLoading(false);
    }
  }

  async function convertToJob() {
    if (!selectedQuotation) {
      return;
    }

    const confirmed =
      await confirm({
        title:
          "Create production job?",
        description: `${selectedQuotation.quotationNumber} will be converted into a production job.`,
        confirmText:
          "Create job",
      });

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await quotationsService.convertToJob(
        selectedQuotation.id,
      );

      setSelectedQuotation(null);

      await loadQuotations({
        page,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to convert quotation to job.",
      );

      throw error;
    } finally {
      setActionLoading(false);
    }
  }

  const loadQuotations =
    useCallback(
      async (
        options?: {
          page?: number;

          search?: string;

          status?:
            QuotationStatusFilter;

          silent?: boolean;
        },
      ) => {
        const targetPage =
          options?.page ?? page;

        const targetSearch =
          options?.search ??
          activeSearch;

        const targetStatus =
          options?.status ??
          status;

        const silent =
          options?.silent ?? false;

        if (!silent) {
          setLoading(true);
        }

        setError(null);

        try {
          const data =
            await quotationsService.getAll({
              page:
                targetPage,

              limit: 20,

              search:
                targetSearch ||
                undefined,

              status:
                targetStatus,
            });

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
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        page,
        activeSearch,
        status,
      ],
    );

  const selectedQuotationId =
    selectedQuotation?.id ??
    null;

  const handleRealtimeQuotationUpdate =
    useCallback(
      (
        event:
          QuotationUpdatedEvent,
      ) => {
        /*
        * Refresh the current table
        * silently using its existing
        * page/search/status filters.
        */
        void loadQuotations({
          page,
          silent: true,
        });

        /*
        * If the quotation currently
        * open in the detail modal is
        * the one that changed, refresh
        * the full detail as well.
        */
        if (
          selectedQuotationId !==
          event.quotationId
        ) {
          return;
        }

        void quotationsService
          .getOne(
            event.quotationId,
          )
          .then(
            (
              refreshedQuotation,
            ) => {
              setSelectedQuotation(
                refreshedQuotation,
              );
            },
          )
          .catch(
            (error: unknown) => {
              setError(
                error instanceof Error
                  ? error.message
                  : "Unable to refresh quotation.",
              );
            },
          );
      },
      [
        loadQuotations,
        page,
        selectedQuotationId,
      ],
    );

  useQuotationRealtime({
    onUpdated:
      handleRealtimeQuotationUpdate,
  });

  function openCreateForm() {
    setEditingQuotation(null);
    setShowForm(true);
  }

  async function openEditForm() {
    if (!selectedQuotation) {
      return;
    }

    try {
      const quotation =
        await quotationsService.getOne(
          selectedQuotation.id,
        );

      setEditingQuotation(
        quotation,
      );

      setShowForm(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quotation.",
      );
    }
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingQuotation(null);
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

  async function saveQuotation(
    data: QuotationFormPayload,
  ) {
    setSaving(true);
    setError(null);

    try {
      if (
        editingQuotation
      ) {
        await quotationsService.update(
          editingQuotation.id,
          data,
        );
      } else {
        await quotationsService.create(
          data,
        );
      }

      setShowForm(false);
      setEditingQuotation(null);
      setSelectedQuotation(null);

      await loadQuotations({
        page: editingQuotation
          ? page
          : 1,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save quotation.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    value:
      QuotationStatusFilter,
  ) {
    setStatus(value);

    await loadQuotations({
      page: 1,
      status: value,
    });
  }

  async function openQuotation(
    quotation: Quotation,
  ) {
    setDetailLoading(true);
    setSentQuotationUrl(null);
    setError(null);

    try {
      const fullQuotation =
        await quotationsService.getOne(
          quotation.id,
        );

      setSelectedQuotation(
        fullQuotation,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load quotation.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeQuotation() {
    setSelectedQuotation(null);
    setSentQuotationUrl(null);
  }

  async function createRevision() {
    if (!selectedQuotation) {
      return;
    }

   const confirmed =
      await confirm({
        title:
          "Create new revision?",
        description: `A new editable revision will be created from ${selectedQuotation.quotationNumber}.`,
        confirmText:
          "Create revision",
      });

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const result =
        await quotationsService.createRevision(
          selectedQuotation.id,
        );

      setSelectedQuotation(
        null,
      );

      setEditingQuotation(
        result.quotation,
      );

      setShowForm(
        true,
      );

      await loadQuotations({
        page,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create quotation revision.",
      );

      throw error;
    } finally {
      setActionLoading(false);
    }
  }


  return {
    quotations,
    selectedQuotation,
    customers,

    search,
    status,

    page,
    pages,
    total,

    loading,
    detailLoading,
    error,

    actionLoading,

    showForm,
    editingQuotation,
    saving,
    sentQuotationUrl,

    openCreateForm,
    openEditForm,
    closeForm,
    saveQuotation,

    createRevision,

    sendQuotation,
    convertToJob,

    setSearch,

    handleSearch,
    changeStatus,
    
    openQuotation,
    closeQuotation,


    reload:
      loadQuotations,

    previousPage: () =>
      loadQuotations({
        page:
          Math.max(
            page - 1,
            1,
          ),
      }),

    nextPage: () =>
      loadQuotations({
        page:
          Math.min(
            page + 1,
            pages,
          ),
      }),
  };
}