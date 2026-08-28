"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  LoaderCircle,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import type {
  ProfileSettings,
  UpdateProfileSettingsData,
} from "@/types/settings";

type ProfileSettingsFormProps = {
  profile: ProfileSettings;

  saving: boolean;

  error: string | null;

  success: string | null;

  onSave: (
    data: UpdateProfileSettingsData,
  ) => Promise<boolean>;
};

export function ProfileSettingsForm({
  profile,
  saving,
  error,
  success,
  onSave,
}: ProfileSettingsFormProps) {
  const [
    name,
    setName,
  ] = useState(
    profile.name,
  );

  const [
    phone,
    setPhone,
  ] = useState(
    profile.phone ?? "",
  );

  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState(
    profile.avatarUrl ?? "",
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await onSave({
      name,
      phone,
      avatarUrl,
    });
  }

  function handleRemovePhoto() {
    setAvatarUrl("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="qufo-surface overflow-hidden rounded-3xl"
    >
      {/* Header */}
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <UserRound
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              My profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage your personal
              account information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-7 p-6">
        {/* Basic profile */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm text-slate-400"
            >
              Name
            </label>

            <div className="relative">
              <UserRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="profile-name"
                required
                value={name}
                onChange={(event) =>
                  setName(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-phone"
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
                id="profile-phone"
                value={phone}
                onChange={(event) =>
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

        {/* Email */}
        <div>
          <label
            htmlFor="profile-email"
            className="mb-2 block text-sm text-slate-400"
          >
            Email
          </label>

          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              id="profile-email"
              type="email"
              readOnly
              value={
                profile.email
              }
              className="qufo-input qufo-input-with-icon cursor-not-allowed opacity-70"
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Your email is used to
            sign in to QUFO. Email
            changes will be handled
            separately for account
            security.
          </p>
        </div>

        {/* Messages */}
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

      {/* Footer */}
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
            <Save
              size={16}
            />
          )}

          {saving
            ? "Saving..."
            : "Save profile"}
        </button>
      </div>
    </form>
  );
}