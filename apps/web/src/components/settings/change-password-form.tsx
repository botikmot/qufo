"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { useChangePassword } from "@/hooks/use-change-password";

export function ChangePasswordForm() {
  const {
    saving,
    error,
    success,
    changePassword,
  } = useChangePassword();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setValidationError(null);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setValidationError(
        "Please complete all password fields.",
      );

      return;
    }

    if (newPassword.length < 8) {
      setValidationError(
        "New password must be at least 8 characters.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setValidationError(
        "New password and confirmation do not match.",
      );

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setValidationError(
        "New password must be different from your current password.",
      );

      return;
    }

    const changed =
      await changePassword({
        currentPassword,
        newPassword,
      });

    if (!changed) {
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="qufo-surface overflow-hidden rounded-3xl"
    >
      {/* Header */}
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
            <ShieldCheck
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Security
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Keep your QUFO
              account protected
              with a strong
              password.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Current password */}
        <div>
          <label
            htmlFor="current-password"
            className="mb-2 block text-sm text-slate-400"
          >
            Current password
          </label>

          <div className="relative">
            <LockKeyhole
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              id="current-password"
              type={
                showCurrentPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              value={
                currentPassword
              }
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              className="qufo-input qufo-input-with-icon pr-11"
              placeholder="Enter current password"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  (value) =>
                    !value,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
              aria-label={
                showCurrentPassword
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              {showCurrentPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-[var(--qufo-border)]" />

        {/* New passwords */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm text-slate-400"
            >
              New password
            </label>

            <div className="relative">
              <KeyRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="new-password"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={
                  newPassword
                }
                onChange={(event) =>
                  setNewPassword(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon pr-11"
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (value) =>
                      !value,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? (
                  <EyeOff
                    size={16}
                  />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Use at least 8
              characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm text-slate-400"
            >
              Confirm new password
            </label>

            <div className="relative">
              <KeyRound
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon pr-11"
                placeholder="Repeat new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) =>
                      !value,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                aria-label={
                  showConfirmPassword
                    ? "Hide password confirmation"
                    : "Show password confirmation"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={16}
                  />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>
        </div>

        {(validationError ||
          error) && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {validationError ??
              error}
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
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          }
          className="flex items-center gap-2 rounded-xl bg-violet-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <ShieldCheck
              size={16}
            />
          )}

          {saving
            ? "Changing..."
            : "Change password"}
        </button>
      </div>
    </form>
  );
}