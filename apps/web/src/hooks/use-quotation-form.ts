"use client";

import {
  type FormEvent,
  useMemo,
  useEffect,
  useState,
} from "react";

import {
  calculateQuotationTotals,
} from "@/utils/quotation-calculation";

import {
  createQuotationFormItem,
} from "@/utils/quotation-form";

import {
  toDateInputValue,
} from "@/utils/date";

import type {
  Quotation,
} from "@/types/quotation";

import type {
  QuotationDiscountType,
  QuotationFormItem,
  QuotationFormPayload,
} from "@/types/quotation-form";

import {
  getRememberedQuotationSubject,
  getRememberedQuotationMessage,
  rememberQuotationSubject,
  rememberQuotationMessage,
} from "@/lib/quotation-local-storage";

type UseQuotationFormProps = {
  quotation?: Quotation | null;

  businessProfileId?: string | null;

  onSubmit: (
    data: QuotationFormPayload,
  ) => Promise<void>;
};

const QUOTATION_NOTES_STORAGE_PREFIX =
  "qufo:quotation-notes:";

function getQuotationNotesStorageKey(
  businessProfileId?: string | null,
) {
  return `${QUOTATION_NOTES_STORAGE_PREFIX}${
    businessProfileId ?? "main"
  }`;
}

function getRememberedQuotationNotes(
  businessProfileId?: string | null,
) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return (
      window.localStorage.getItem(
        getQuotationNotesStorageKey(
          businessProfileId,
        ),
      ) ?? ""
    );
  } catch {
    return "";
  }
}

function rememberQuotationNotes(
  businessProfileId: string | null | undefined,
  notes: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  const key =
    getQuotationNotesStorageKey(
      businessProfileId,
    );

  try {
    if (notes.trim()) {
      window.localStorage.setItem(
        key,
        notes,
      );
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore localStorage failures.
  }
}

export function useQuotationForm({
  quotation,
  businessProfileId,
  onSubmit,
}: UseQuotationFormProps) {
  const [
    customerId,
    setCustomerId,
  ] = useState(
    quotation?.customer?.id ??
      "",
  );

  const [
    issueDate,
    setIssueDate,
  ] = useState(
    toDateInputValue(
      quotation?.issueDate ??
        new Date(),
    ),
  );

  const [
    validUntil,
    setValidUntil,
  ] = useState(
    toDateInputValue(
      quotation?.validUntil,
    ),
  );

  const [
    discountType,
    setDiscountType,
  ] =
    useState<QuotationDiscountType>(
      quotation?.discountType ??
        "NONE",
    );

  const [
    discountValue,
    setDiscountValue,
  ] = useState(
    String(
      quotation?.discountValue ??
        0,
    ),
  );

  const [
    taxRate,
    setTaxRate,
  ] = useState(
    String(
      quotation?.taxRate ?? 0,
    ),
  );

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    quotationMessage,
    setQuotationMessage,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState(
    quotation?.notes ?? "",
  );

  useEffect(() => {
    /* if (quotation) {
      return;
    } */

    let cancelled = false;

    async function loadRememberedQuotationContent() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      setNotes(
        getRememberedQuotationNotes(
          businessProfileId,
        ),
      );

      setSubject(
        getRememberedQuotationSubject(
          businessProfileId,
        ),
      );

      setQuotationMessage(
        getRememberedQuotationMessage(
          businessProfileId,
        ),
      );
    }

    void loadRememberedQuotationContent();

    return () => {
      cancelled = true;
    };
  }, [
    quotation,
    businessProfileId,
  ]);


  useEffect(() => {
    if (quotation) {
      return;
    }

    let cancelled = false;

    async function loadRememberedQuotationContent() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      setSubject(
        getRememberedQuotationSubject(
          businessProfileId,
        ),
      );

      setQuotationMessage(
        getRememberedQuotationMessage(
          businessProfileId,
        ),
      );
    }

    void loadRememberedQuotationContent();

    return () => {
      cancelled = true;
    };
  }, [
    quotation,
    businessProfileId,
  ]);


  const [
    terms,
    setTerms,
  ] = useState(
    quotation?.terms ?? "",
  );

  const [
    items,
    setItems,
  ] =
    useState<
      QuotationFormItem[]
    >(
      quotation?.items?.length
        ? quotation.items.map(
            (item) => ({
              key:
                item.id ??
                crypto.randomUUID(),

              name:
                item.name,

              description:
                item.description ??
                "",

              quantity:
                String(
                  item.quantity,
                ),

              unit:
                item.unit || "pc",

              unitPrice:
                String(
                  item.unitPrice,
                ),
              imageUrl:
                item.imageUrl ?? "",

              imageKey:
                item.imageKey ?? "",

              warrantyDuration:
                item.warrantyDuration != null
                  ? String(item.warrantyDuration)
                  : "",

              warrantyUnit:
                item.warrantyUnit ?? "",

              warrantyTerms:
                item.warrantyTerms ?? "",
              currency: item.currency ?? 'PHP',
            }),
          )
        : [
            createQuotationFormItem(),
          ],
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const totals =
    useMemo(
      () =>
        calculateQuotationTotals(
          items,
          discountType,
          Number(
            discountValue,
          ),
          Number(taxRate),
        ),
      [
        items,
        discountType,
        discountValue,
        taxRate,
      ],
    );

  function addItem() {
    setItems((current) => [
      ...current,
      createQuotationFormItem(),
    ]);
  }

  function removeItem(
    key: string,
  ) {
    setItems((current) => {
      if (
        current.length <= 1
      ) {
        return current;
      }

      return current.filter(
        (item) =>
          item.key !== key,
      );
    });
  }

  function updateItem(
    key: string,
    patch: Partial<QuotationFormItem>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!customerId) {
      setError(
        "Please select a customer.",
      );

      return;
    }

    if (!issueDate) {
      setError(
        "Issue date is required.",
      );

      return;
    }

    const validItems =
      items.filter(
        (item) =>
          item.name.trim() &&
          Number(
            item.quantity,
          ) > 0 &&
          Number(
            item.unitPrice,
          ) >= 0,
      );

    for (const item of validItems) {
      const hasWarranty =
        Boolean(
          item.warrantyDuration ||
          item.warrantyUnit ||
          item.warrantyTerms?.trim(),
        );

      if (!hasWarranty) {
        continue;
      }

      const warrantyDuration =
        Number(
          item.warrantyDuration,
        );

      if (
        !Number.isInteger(
          warrantyDuration,
        ) ||
        warrantyDuration < 1
      ) {
        setError(
          `Enter a valid warranty duration for "${item.name}".`,
        );

        return;
      }

      if (!item.warrantyUnit) {
        setError(
          `Select a warranty period for "${item.name}".`,
        );

        return;
      }
    }

    if (
      validItems.length === 0
    ) {
      setError(
        "Add at least one valid quotation item.",
      );

      return;
    }

    const discount =
      Number(
        discountValue,
      );

    if (
      discountType ===
        "PERCENTAGE" &&
      (discount < 0 ||
        discount > 100)
    ) {
      setError(
        "Percentage discount must be between 0 and 100.",
      );

      return;
    }

    const tax =
      Number(taxRate);

    if (
      tax < 0 ||
      tax > 100
    ) {
      setError(
        "Tax rate must be between 0 and 100.",
      );

      return;
    }

    try {
      await onSubmit({
        customerId,

        validUntil:
          validUntil ||
          undefined,

        discountType,

        discountValue:
          discountType ===
          "NONE"
            ? 0
            : discount,

        taxRate: tax,

        subject:
          subject.trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,

        terms:
          terms.trim() ||
          undefined,

        items:
          validItems.map(
            (item) => {
              const hasWarranty =
                Boolean(
                  item.warrantyDuration ||
                  item.warrantyUnit ||
                  item.warrantyTerms?.trim(),
                );

              return {
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

                imageUrl:
                  item.imageUrl ||
                  undefined,

                imageKey:
                  item.imageKey ||
                  undefined,

                warrantyDuration:
                  hasWarranty
                    ? Number(
                        item.warrantyDuration,
                      )
                    : undefined,

                warrantyUnit:
                  hasWarranty
                    ? item.warrantyUnit ||
                      undefined
                    : undefined,

                warrantyTerms:
                  hasWarranty
                    ? item.warrantyTerms
                        ?.trim() ||
                      undefined
                    : undefined,
              };
            },
          ),
      });

      rememberQuotationNotes(
        businessProfileId,
        notes,
      );

      rememberQuotationSubject(
        businessProfileId,
        subject,
      );

      rememberQuotationMessage(
        businessProfileId,
        quotationMessage,
      );

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save quotation.",
      );
    }
  }

  return {
    customerId,
    issueDate,
    validUntil,

    discountType,
    discountValue,
    taxRate,

    subject,
    quotationMessage,

    notes,
    terms,
    items,

    totals,
    error,
    setError,

    setCustomerId,
    setIssueDate,
    setValidUntil,

    setDiscountType,
    setDiscountValue,
    setTaxRate,

    setSubject,
    setQuotationMessage,

    setNotes,
    setTerms,

    addItem,
    removeItem,
    updateItem,

    handleSubmit,
  };
}