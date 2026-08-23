"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Building2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

import type {
  BusinessSettings,
  UpdateBusinessSettingsData,
} from "@/types/settings";

type BusinessSettingsFormProps = {
  settings: BusinessSettings;

  saving: boolean;

  error: string | null;

  success: string | null;

  onSave: (
    data: UpdateBusinessSettingsData,
  ) => Promise<boolean>;
};

export function BusinessSettingsForm({
  settings,
  saving,
  error,
  success,
  onSave,
}: BusinessSettingsFormProps) {
  const [
    name,
    setName,
  ] = useState(
    settings.name,
  );

  const [
    businessType,
    setBusinessType,
  ] = useState(
    settings.businessType ??
      "",
  );

  const [
    email,
    setEmail,
  ] = useState(
    settings.email ?? "",
  );

  const [
    phone,
    setPhone,
  ] = useState(
    settings.phone ?? "",
  );

  const [
    address,
    setAddress,
  ] = useState(
    settings.address ?? "",
  );

  

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await onSave({
      name,
      businessType,
      email,
      phone,
      address,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="qufo-surface overflow-hidden rounded-3xl"
    >
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <Building2
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Business profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Information used
              throughout your QUFO
              workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="business-name"
              className="mb-2 block text-sm text-slate-400"
            >
              Business name
            </label>

            <input
              id="business-name"
              required
              value={name}
              onChange={(
                event,
              ) =>
                setName(
                  event.target
                    .value,
                )
              }
              className="qufo-input"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label
              htmlFor="business-type"
              className="mb-2 block text-sm text-slate-400"
            >
              Business type
            </label>

            <input
              id="business-type"
              value={
                businessType
              }
              onChange={(
                event,
              ) =>
                setBusinessType(
                  event.target
                    .value,
                )
              }
              className="qufo-input"
              placeholder="Printing, signage, fabrication..."
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="business-email"
              className="mb-2 block text-sm text-slate-400"
            >
              Business email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="business-email"
                type="email"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="hello@business.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="business-phone"
              className="mb-2 block text-sm text-slate-400"
            >
              Phone
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="business-phone"
                value={phone}
                onChange={(
                  event,
                ) =>
                  setPhone(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="+63..."
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="business-address"
            className="mb-2 block text-sm text-slate-400"
          >
            Business address
          </label>

          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-600"
            />

            <textarea
              id="business-address"
              rows={3}
              value={address}
              onChange={(
                event,
              ) =>
                setAddress(
                  event.target
                    .value,
                )
              }
              className="qufo-input qufo-input-with-icon resize-none"
              placeholder="Business address..."
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Workspace URL
          </label>

          <div className="qufo-surface-soft rounded-xl px-4 py-3 text-sm text-slate-500">
            {settings.slug}
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Workspace identifier
            cannot be changed here.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--qufo-border)] px-6 py-5">
        <button
          type="submit"
          disabled={
            saving ||
            !name.trim()
          }
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          {saving
            ? "Saving..."
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}