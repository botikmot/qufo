const INTERNAL_ORIGIN =
  "https://qufo.local";

export const DEFAULT_AUTH_REDIRECT =
  "/dashboard";

export function getSafeAuthRedirect(
  value:
    | string
    | null
    | undefined,
) {
  const candidate =
    value?.trim();

  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const url =
      new URL(
        candidate,
        INTERNAL_ORIGIN,
      );

    if (
      url.origin !==
      INTERNAL_ORIGIN
    ) {
      return DEFAULT_AUTH_REDIRECT;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export function buildAuthUrl(
  path:
    | "/login"
    | "/register"
    | "/register/google",
  nextPath: string,
) {
  const safeNextPath =
    getSafeAuthRedirect(
      nextPath,
    );

  if (
    safeNextPath ===
    DEFAULT_AUTH_REDIRECT
  ) {
    return path;
  }

  return `${path}?next=${encodeURIComponent(safeNextPath)}`;
}