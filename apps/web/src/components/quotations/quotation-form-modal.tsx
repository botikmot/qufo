"use client";

import {
  FileText,
  LoaderCircle,
} from "lucide-react";

import {
  QuotationFormCustomer,
} from "@/components/quotations/quotation-form-customer";

import {
  QuotationFormDates,
} from "@/components/quotations/quotation-form-dates";

import {
  QuotationFormDiscountTax,
} from "@/components/quotations/quotation-form-discount-tax";

import {
  QuotationFormItems,
} from "@/components/quotations/quotation-form-items";

import {
  QuotationFormNotes,
} from "@/components/quotations/quotation-form-notes";

import {
  QuotationFormSummary,
} from "@/components/quotations/quotation-form-summary";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import {
  useQuotationForm,
} from "@/hooks/use-quotation-form";

import type {
  Customer,
} from "@/types/customer";

import type {
  Quotation,
} from "@/types/quotation";

import type {
  QuotationFormPayload,
} from "@/types/quotation-form";

type QuotationFormModalProps = {
  customers: Customer[];

  quotation?: Quotation | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: QuotationFormPayload,
  ) => Promise<void>;
};

export function QuotationFormModal({
  customers,
  quotation,
  loading = false,
  onClose,
  onSubmit,
}: QuotationFormModalProps) {
  const form =
    useQuotationForm({
      quotation,
      onSubmit,
    });

  const editing =
    Boolean(quotation);

  return (
    <QufoModal
      title={
        editing
          ? "Edit quotation"
          : "New quotation"
      }
      description={
        editing
          ? quotation?.quotationNumber
          : "Prepare a new quotation for a customer."
      }
      icon={
        <FileText size={18} />
      }
      onClose={onClose}
      closeDisabled={loading}
      size="6xl"
      footer={
        <div
          className="
            flex
            flex-col-reverse
            gap-2.5

            sm:flex-row
            sm:justify-end
            sm:gap-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              w-full
              rounded-xl
              px-4
              py-2.5
              text-sm
              text-slate-400
              transition
              hover:bg-white/[0.04]
              hover:text-white
              disabled:pointer-events-none
              disabled:opacity-50

              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            form="quotation-form"
            disabled={loading}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-400
              px-5
              py-2.5
              text-sm
              font-medium
              text-slate-950
              transition
              hover:bg-emerald-300
              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
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
      }
    >
      <form
        id="quotation-form"
        onSubmit={
          form.handleSubmit
        }
        className="min-w-0 space-y-8"
      >
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          <QuotationFormCustomer
            customers={
              customers
            }
            value={
              form.customerId
            }
            onChange={
              form.setCustomerId
            }
          />

          <QuotationFormDates
            validUntil={
              form.validUntil
            }
            onValidUntilChange={
              form.setValidUntil
            }
          />
        </div>

        <QuotationFormItems
          items={
            form.items
          }
          onAdd={
            form.addItem
          }
          onRemove={
            form.removeItem
          }
          onChange={
            form.updateItem
          }
        />

        <QuotationFormDiscountTax
          discountType={
            form.discountType
          }
          discountValue={
            form.discountValue
          }
          taxRate={
            form.taxRate
          }
          onDiscountTypeChange={
            form.setDiscountType
          }
          onDiscountValueChange={
            form.setDiscountValue
          }
          onTaxRateChange={
            form.setTaxRate
          }
        />

        <QuotationFormSummary
          subtotal={
            form.totals.subtotal
          }
          discountAmount={
            form.totals
              .discountAmount
          }
          taxAmount={
            form.totals.taxAmount
          }
          total={
            form.totals.total
          }
        />

        <QuotationFormNotes
          notes={
            form.notes
          }
          terms={
            form.terms
          }
          onNotesChange={
            form.setNotes
          }
          onTermsChange={
            form.setTerms
          }
        />

        {form.error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {form.error}
          </div>
        )}
      </form>
    </QufoModal>
  );
}