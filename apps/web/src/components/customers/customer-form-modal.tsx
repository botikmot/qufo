"use client";

import {
  LoaderCircle,
  UserRound,
  X,
} from "lucide-react";

import {
  CustomerFormFields,
} from "@/components/customers/customer-form-fields";

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
    <div className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-5">
      <div className="qufo-surface my-auto flex w-full max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-2xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl lg:rounded-3xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--qufo-border)] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <UserRound size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-white sm:text-lg">
                {editing
                  ? "Edit customer"
                  : "New customer"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {editing
                  ? "Update customer information."
                  : "Add a customer to your business workspace."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="ml-3 flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit}
          className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col"
        >
          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
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
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--qufo-border)] px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
          </div>
        </form>
      </div>
    </div>
  );
}