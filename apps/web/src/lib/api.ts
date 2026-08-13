import {
  clearAuthSession,
  getAuthSession,
  updateAccessToken,
} from "@/lib/auth-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

type ApiOptions =
  RequestInit & {
    requireAuth?: boolean;
  };

let refreshPromise: Promise<string | null> | null = null;

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    requireAuth = true,
    headers,
    ...requestOptions
  } = options;

  const finalHeaders =
    new Headers(headers);

  if (
    requestOptions.body &&
    !finalHeaders.has("Content-Type")
  ) {
    finalHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (requireAuth) {
    const session =
      getAuthSession();

    if (!session) {
      throw new Error(
        "AUTH_REQUIRED",
      );
    }

    finalHeaders.set(
      "Authorization",
      `Bearer ${session.accessToken}`,
    );

    finalHeaders.set(
      "X-Organization-Id",
      session.organization.id,
    );
  }

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...requestOptions,
        credentials:'include',
        headers: finalHeaders,
      },
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    if (
        response.status === 401 &&
        requireAuth
      ) {
        const newAccessToken =
          await refreshAccessToken();

        if (newAccessToken) {
          finalHeaders.set(
            "Authorization",
            `Bearer ${newAccessToken}`,
          );

          const retryResponse =
            await fetch(
              `${API_URL}${path}`,
              {
                ...requestOptions,

                credentials:
                  "include",

                headers:
                  finalHeaders,
              },
            );

          const retryData =
            await retryResponse
              .json()
              .catch(() => null);

          if (!retryResponse.ok) {
            const message =
              retryData?.message ??
              "Something went wrong.";

            throw new Error(
              Array.isArray(message)
                ? message.join(", ")
                : message,
            );
          }

          return retryData as T;
        }

        clearAuthSession();

        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

    const message =
      data?.message ??
      "Something went wrong.";

    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : message,
    );
  }

  return data as T;
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise =
    (async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/auth/refresh`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          );

        if (!response.ok) {
          clearAuthSession();

          return null;
        }

        const data =
          (await response.json()) as {
            accessToken: string;
          };

        updateAccessToken(
          data.accessToken,
        );

        return data.accessToken;
      } catch {
        clearAuthSession();

        return null;
      } finally {
        refreshPromise = null;
      }
    })();

  return refreshPromise;
}