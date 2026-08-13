"use client";

import { type FormEvent, useState, } from "react";

import {
  LoaderCircle,
  X,
} from "lucide-react";

import type {
  Customer,
  CustomerFormData,
  CustomerType,
} from "@/types/customer";

type Props = {
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
}: Props) {
  const [type, setType] =
    useState<CustomerType>(
      customer?.type ?? "INDIVIDUAL",
    );

  const [name, setName] =
    useState(
      customer?.name ?? "",
    );

  const [companyName, setCompanyName] =
    useState(
      customer?.companyName ?? "",
    );

  const [email, setEmail] =
    useState(
      customer?.email ?? "",
    );

  const [phone, setPhone] =
    useState(
      customer?.phone ?? "",
    );

  const [address, setAddress] =
    useState(
      customer?.address ?? "",
    );

  const [notes, setNotes] =
    useState(
      customer?.notes ?? "",
    );

  const [error, setError] =
    useState<string | null>(null);

  const editing = Boolean(customer);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError(
        "Customer name is required.",
      );

      return;
    }

    try {
      await onSubmit({
        type,
        name: name.trim(),
        companyName:
          companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save customer.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl shadow-2xl shadow-black/30">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--qufo-border)] bg-[rgba(8,20,35,0.92)] px-6 py-5 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {editing
                ? "Edit customer"
                : "Add customer"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {editing
                ? "Update customer information."
                : "Add a person or business to your workspace."}
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
          className="space-y-6 p-6"
        >
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Customer type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <TypeButton
                active={
                  type === "INDIVIDUAL"
                }
                onClick={() =>
                  setType("INDIVIDUAL")
                }
              >
                Individual
              </TypeButton>

              <TypeButton
                active={
                  type === "COMPANY"
                }
                onClick={() =>
                  setType("COMPANY")
                }
              >
                Company
              </TypeButton>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={
                type === "COMPANY"
                  ? "Contact person"
                  : "Customer name"
              }
            >
              <input
                required
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                className="qufo-input"
                placeholder={
                  type === "COMPANY"
                    ? "Maria Santos"
                    : "Juan Dela Cruz"
                }
              />
            </Field>

            {type === "COMPANY" && (
              <Field label="Company name">
                <input
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(
                      event.target.value,
                    )
                  }
                  className="qufo-input"
                  placeholder="ABC Construction Inc."
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                className="qufo-input"
                placeholder="customer@example.com"
              />
            </Field>

            <Field label="Phone">
              <input
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value,
                  )
                }
                className="qufo-input"
                placeholder="0917 123 4567"
              />
            </Field>
          </div>

          <Field label="Address">
            <textarea
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              rows={2}
              className="qufo-input resize-none"
              placeholder="Butuan City"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              rows={3}
              className="qufo-input resize-none"
              placeholder="Optional customer notes..."
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
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
                : "Add customer"}
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

function TypeButton({
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
        "rounded-xl border px-4 py-3 text-sm transition",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-[var(--qufo-border)] bg-white/[0.02] text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}