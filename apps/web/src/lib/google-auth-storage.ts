import type {
  GoogleProfile,
} from "@/types/auth";

const STORAGE_KEY =
  "qufo_pending_google_registration";

const MAX_AGE =
  45 * 60 * 1000;

export type PendingGoogleRegistration = {
  credential: string;

  profile: GoogleProfile;

  createdAt: number;
};

export function savePendingGoogleRegistration(
  data: Omit<
    PendingGoogleRegistration,
    "createdAt"
  >,
) {
  if (typeof window === "undefined") {
    return;
  }

  const value: PendingGoogleRegistration = {
    ...data,
    createdAt: Date.now(),
  };

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(value),
  );
}

export function getPendingGoogleRegistration():
  | PendingGoogleRegistration
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    sessionStorage.getItem(
      STORAGE_KEY,
    );

  if (!raw) {
    return null;
  }

  try {
    const value =
      JSON.parse(
        raw,
      ) as PendingGoogleRegistration;

    if (
      !value.credential ||
      !value.profile?.email ||
      Date.now() -
        value.createdAt >
        MAX_AGE
    ) {
      clearPendingGoogleRegistration();

      return null;
    }

    return value;
  } catch {
    clearPendingGoogleRegistration();

    return null;
  }
}

export function clearPendingGoogleRegistration() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(
    STORAGE_KEY,
  );
}