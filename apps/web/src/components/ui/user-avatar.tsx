"use client";

import {
  useMemo,
  useState,
} from "react";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
  xl: "size-24 text-2xl",
};

function getInitials(
  name?: string | null,
  email?: string | null,
) {
  const safeName =
    name?.trim();

  if (safeName) {
    const parts = safeName
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  if (email) {
    return email
      .slice(0, 2)
      .toUpperCase();
  }

  return "U";
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [
    failedImageUrl,
    setFailedImageUrl,
  ] = useState<string | null>(
    null,
  );

  const initials = useMemo(
    () =>
      getInitials(
        name,
        email,
      ),
    [name, email],
  );

  const shouldShowImage =
    Boolean(avatarUrl) &&
    failedImageUrl !==
      avatarUrl;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-[var(--qufo-border)] bg-[#07111f]",
        "flex shrink-0 items-center justify-center",
        sizeMap[size],
        className,
      ].join(" ")}
    >
      {shouldShowImage &&
      avatarUrl ? (
        <img
          src={avatarUrl}
          alt={
            name ??
            "User avatar"
          }
          className="h-full w-full object-cover"
          onError={() => {
            setFailedImageUrl(
              avatarUrl,
            );
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400/20 via-emerald-400/10 to-violet-400/20 font-semibold text-white">
          {initials}
        </div>
      )}
    </div>
  );
}