"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type { Customer } from "@/types/customer";

import type {
  DiscountType,
  Quotation,
  QuotationFormData,
  QuotationFormItem,
} from "@/types/quotation";

type Props = {
  customers: Customer[];

  quotation?: Quotation | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: QuotationFormData,
  ) => Promise<void>;
};

function createEmptyItem(): QuotationFormItem {
  return {
    name: "",
    description: "",
    quantity: "1",
    unit: "pcs",
    unitPrice: "0",
  };
}

export function QuotationFormModal({
  customers,
  quotation,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const editing =
    Boolean(quotation);

  const [customerId, setCustomerId] =
    useState(
      quotation?.customer.id ?? "",
    );

  const [validUntil, setValidUntil] =
    useState(
      quotation?.validUntil
        ? quotation.validUntil.slice(
            0,
            10,
          )
        : "",
    );

  const [
    discountType,
    setDiscountType,
  ] = useState<DiscountType>(
    quotation?.discountType ??
      "NONE",
  );

  const [
    discountValue,
    setDiscountValue,
  ] = useState(
    quotation?.discountValue ??
      "0",
  );

  const [taxRate, setTaxRate] =
    useState(
      quotation?.taxRate ?? "0",
    );

  const [notes, setNotes] =
    useState(
      quotation?.notes ?? "",
    );

  const [terms, setTerms] =
    useState(
      quotation?.terms ?? "",
    );

  const [items, setItems] =
    useState<QuotationFormItem[]>(
      quotation?.items?.length
        ? quotation.items.map(
            (item) => ({
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
                item.unit,

              unitPrice:
                String(
                  item.unitPrice,
                ),
            }),
          )
        : [createEmptyItem()],
    );

  const [error, setError] =
    useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal =
      items.reduce(
        (sum, item) => {
          const quantity =
            Number(
              item.quantity,
            ) || 0;

          const unitPrice =
            Number(
              item.unitPrice,
            ) || 0;

          return (
            sum +
            quantity *
              unitPrice
          );
        },
        0,
      );

    let discountAmount = 0;

    const discount =
      Number(
        discountValue,
      ) || 0;

    if (
      discountType === "FIXED"
    ) {
      discountAmount =
        discount;
    }

    if (
      discountType ===
      "PERCENTAGE"
    ) {
      discountAmount =
        subtotal *
        (discount / 100);
    }

    discountAmount =
      Math.min(
        subtotal,
        discountAmount,
      );

    const taxable =
      subtotal -
      discountAmount;

    const tax =
      taxable *
      ((Number(taxRate) || 0) /
        100);

    const total =
      taxable + tax;

    return {
      subtotal,
      discountAmount,
      taxAmount: tax,
      total,
    };
  }, [
    items,
    discountType,
    discountValue,
    taxRate,
  ]);

  function updateItem(
    index: number,
    field:
      keyof QuotationFormItem,
    value: string,
  ) {
    setItems(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item,
        ),
    );
  }

  function addItem() {
    setItems(
      (current) => [
        ...current,
        createEmptyItem(),
      ],
    );
  }

  function removeItem(
    index: number,
  ) {
    if (items.length <= 1) {
      return;
    }

    setItems(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index,
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

    if (
      items.some(
        (item) =>
          !item.name.trim() ||
          !item.unit.trim() ||
          Number(
            item.quantity,
          ) <= 0,
      )
    ) {
      setError(
        "Please complete all quotation items.",
      );

      return;
    }

    try {
      await onSubmit({
        customerId,

        validUntil,

        discountType,

        discountValue,

        taxRate,

        notes,

        terms,

        items,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save quotation.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl shadow-2xl shadow-black/30">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--qufo-border)] bg-[rgba(8,20,35,0.94)] px-6 py-5 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editing
                ? `Edit ${quotation?.quotationNumber}`
                : "Create quotation"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Build a quotation
              from products and
              services.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Customer">
              <select
                required
                value={customerId}
                onChange={(event) =>
                  setCustomerId(
                    event.target
                      .value,
                  )
                }
                className="qufo-input"
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={
                        customer.id
                      }
                      value={
                        customer.id
                      }
                    >
                      {customer.companyName ??
                        customer.name}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field label="Valid until">
              <input
                type="date"
                value={validUntil}
                onChange={(
                  event,
                ) =>
                  setValidUntil(
                    event.target
                      .value,
                  )
                }
                className="qufo-input"
              />
            </Field>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-300">
                  Quotation items
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Add products,
                  services, labor,
                  or fabrication
                  work.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-400/[0.1]"
              >
                <Plus size={14} />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              {items.map(
                (item, index) => {
                  const lineTotal =
                    (Number(
                      item.quantity,
                    ) || 0) *
                    (Number(
                      item.unitPrice,
                    ) || 0);

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-4"
                    >
                      <div className="grid gap-3 lg:grid-cols-[2fr_1fr_0.7fr_1fr_auto]">
                        <input
                          value={
                            item.name
                          }
                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              index,
                              "name",
                              event
                                .target
                                .value,
                            )
                          }
                          className="qufo-input"
                          placeholder="Tarpaulin Printing"
                        />

                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={
                            item.quantity
                          }
                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              index,
                              "quantity",
                              event
                                .target
                                .value,
                            )
                          }
                          className="qufo-input"
                          placeholder="Qty"
                        />

                        <input
                          value={
                            item.unit
                          }
                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              index,
                              "unit",
                              event
                                .target
                                .value,
                            )
                          }
                          className="qufo-input"
                          placeholder="pcs"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.unitPrice
                          }
                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              index,
                              "unitPrice",
                              event
                                .target
                                .value,
                            )
                          }
                          className="qufo-input"
                          placeholder="0.00"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index,
                            )
                          }
                          disabled={
                            items.length <=
                            1
                          }
                          className="flex size-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-red-400/[0.06] hover:text-red-300 disabled:opacity-20"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                        <input
                          value={
                            item.description
                          }
                          onChange={(
                            event,
                          ) =>
                            updateItem(
                              index,
                              "description",
                              event
                                .target
                                .value,
                            )
                          }
                          className="qufo-input"
                          placeholder="Description / specifications..."
                        />

                        <div className="flex min-w-36 items-center justify-end px-2">
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Line total
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-300">
                              {formatCurrency(
                                lineTotal,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <Field label="Notes">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input resize-none"
                  placeholder="Message for the customer..."
                />
              </Field>

              <Field label="Terms">
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(event) =>
                    setTerms(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input resize-none"
                  placeholder="Example: 50% downpayment before production."
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-[var(--qufo-border)] bg-black/10 p-5">
              <h3 className="mb-5 text-sm font-medium text-slate-300">
                Summary
              </h3>

              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  totals.subtotal,
                )}
              />

              <div className="my-4 grid grid-cols-2 gap-3">
                <select
                  value={
                    discountType
                  }
                  onChange={(
                    event,
                  ) =>
                    setDiscountType(
                      event.target
                        .value as DiscountType,
                    )
                  }
                  className="qufo-input text-sm"
                >
                  <option value="NONE">
                    No discount
                  </option>

                  <option value="FIXED">
                    Fixed
                  </option>

                  <option value="PERCENTAGE">
                    Percentage
                  </option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={
                    discountType ===
                    "NONE"
                  }
                  value={
                    discountValue
                  }
                  onChange={(
                    event,
                  ) =>
                    setDiscountValue(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input"
                  placeholder="0"
                />
              </div>

              <SummaryRow
                label="Discount"
                value={`- ${formatCurrency(
                  totals.discountAmount,
                )}`}
              />

              <div className="my-4">
                <label className="mb-2 block text-xs text-slate-600">
                  Tax rate (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(
                    event,
                  ) =>
                    setTaxRate(
                      event.target
                        .value,
                    )
                  }
                  className="qufo-input"
                />
              </div>

              <SummaryRow
                label="Tax"
                value={formatCurrency(
                  totals.taxAmount,
                )}
              />

              <div className="mt-5 border-t border-[var(--qufo-border)] pt-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-slate-400">
                    Total
                  </span>

                  <span className="text-2xl font-semibold tracking-tight text-emerald-300">
                    {formatCurrency(
                      totals.total,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[var(--qufo-border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {editing
                ? "Save changes"
                : "Create quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      {children}
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
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-slate-300">
        {value}
      </span>
    </div>
  );
}

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    },
  ).format(value);
}