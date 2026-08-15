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
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl">
        <div className="flex items-start justify-between border-b border-[var(--qufo-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
              <UserRound size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                {editing
                  ? "Edit customer"
                  : "New customer"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
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
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={
            form.handleSubmit
          }
          className="space-y-6 p-6"
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
            <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
              {form.error}
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
                : "Add customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}