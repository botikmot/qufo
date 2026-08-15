"use client";

import {
  Archive,
  Mail,
  MapPin,
  Pencil,
  Phone,
  X,
} from "lucide-react";

import type {
  Customer,
} from "@/types/customer";

type CustomerDetailModalProps = {
  customer: Customer;

  archiving?: boolean;

  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
};

export function CustomerDetailModal({
  customer,
  archiving = false,
  onClose,
  onEdit,
  onArchive,
}: CustomerDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="qufo-surface max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl">
        <div className="flex items-start justify-between border-b border-[var(--qufo-border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {customer.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {customer.companyName ??
                "Individual customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail size={14} />
                Email
              </div>

              <p className="mt-2 text-sm text-slate-300">
                {customer.email}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone size={14} />
                Phone
              </div>

              <p className="mt-2 text-sm text-slate-300">
                {customer.phone ??
                  "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin size={14} />
              Address
            </div>

            <p className="mt-2 text-sm text-slate-300">
              {customer.address ??
                "—"}
            </p>
          </div>

          {customer.notes && (
            <div className="rounded-xl border border-[var(--qufo-border)] bg-black/10 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Notes
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {customer.notes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--qufo-border)] pt-5">
            <button
              type="button"
              onClick={onArchive}
              disabled={archiving}
              className="flex items-center gap-2 rounded-xl border border-red-400/10 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/[0.05] disabled:opacity-50"
            >
              <Archive size={15} />
              Archive
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
            >
              <Pencil size={15} />
              Edit customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}