"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  Camera,
  ImageUp,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import type {
  ProfileSettings,
} from "@/types/settings";

import {
  settingsService,
} from "@/services/settings.service";

import { UserAvatar } from "@/components/ui/user-avatar";

type ProfilePhotoCardProps = {
  profile: ProfileSettings;
};

export function ProfilePhotoCard({
  profile,
}: ProfilePhotoCardProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState(
    profile.avatarUrl,
  );

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Please upload a JPG, PNG, or WebP image.",
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Profile photo must be 5 MB or smaller.",
      );

      return;
    }

    try {
      setUploading(true);

      const response =
        await settingsService.uploadProfilePhoto(
          file,
        );

      setAvatarUrl(
        response.avatarUrl,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload profile photo.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }
    }
  }

  async function handleRemove() {
    try {
      setUploading(true);
      setError(null);

      await settingsService.removeProfilePhoto();

      setAvatarUrl(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to remove profile photo.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="qufo-surface overflow-hidden rounded-3xl">
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
            <Camera size={18} />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Profile photo
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your personal QUFO
              account photo.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center p-6 text-center">
        <div className="flex size-32 items-center justify-center overflow-hidden rounded-3xl border border-[var(--qufo-border)] bg-slate-950/40">

           <UserAvatar
            name={profile.name}
            email={profile.email}
            avatarUrl={avatarUrl}
            size="xl"
          />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={
            handleFileChange
          }
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() =>
            inputRef.current?.click()
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {uploading ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <ImageUp size={16} />
          )}

          {uploading
            ? "Uploading..."
            : "Upload photo"}
        </button>

        {avatarUrl && (
          <button
            type="button"
            disabled={uploading}
            onClick={
              handleRemove
            }
            className="mt-3 flex items-center gap-2 text-xs text-red-300/80 transition hover:text-red-300"
          >
            <Trash2 size={13} />
            Remove photo
          </button>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-600">
          JPG, PNG or WebP.
          Maximum 5 MB.
        </p>

        {error && (
          <div className="mt-4 w-full rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}