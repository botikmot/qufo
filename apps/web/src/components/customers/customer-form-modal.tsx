"use client";

import {
  LoaderCircle,
  UserRound,
} from "lucide-react";

import {
  CustomerFormFields,
} from "@/components/customers/customer-form-fields";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import {
  useCustomerForm,
} from "@/hooks/use-customer-form";

import type {
  Customer,
} from "@/types/customer";

import type {
  CustomerFormData,
} from "@/types/customer-form";

type CustomerFormModalProps = {
  customer?: Customer | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: CustomerFormData,
  ) => Promise<void>;
};

export function CustomerFormModal({
  customer,
  loading = false,
  onClose,
  onSubmit,
}: CustomerFormModalProps) {
  const form =
    useCustomerForm({
      customer,
      onSubmit,
    });

  const editing =
    Boolean(customer);

  return (
    <QufoModal
      title={
        editing
          ? "Edit customer"
          : "New customer"
      }
      description={
        editing
          ? "Update customer information."
          : "Add a customer to your business workspace."
      }
      icon={
        <UserRound size={18} />
      }
      onClose={onClose}
      closeDisabled={loading}
      size="3xl"
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
            form="customer-form"
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
              : "Add customer"}
          </button>
        </div>
      }
    >
      <form
        id="customer-form"
        onSubmit={
          form.handleSubmit
        }
      >
        <CustomerFormFields
          name={form.name}
          email={form.email}
          phone={form.phone}
          address={form.address}
          companyName={
            form.companyName
          }
          notes={form.notes}
          onNameChange={
            form.setName
          }
          onEmailChange={
            form.setEmail
          }
          onPhoneChange={
            form.setPhone
          }
          onAddressChange={
            form.setAddress
          }
          onCompanyNameChange={
            form.setCompanyName
          }
          onNotesChange={
            form.setNotes
          }
        />

        {form.error && (
          <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {form.error}
          </div>
        )}
      </form>
    </QufoModal>
  );
}