"use client";

import {
  useMemo,
  useSyncExternalStore,
} from "react";

import type {
  AuthSession,
  LoginOrganization,
  LoginResponse,
} from "@/types/auth";

const ACCESS_TOKEN_KEY =
  "qufo_access_token";

const USER_KEY =
  "qufo_user";

const ORGANIZATION_KEY =
  "qufo_organization";

const AUTH_CHANGE_EVENT =
  "qufo-auth-change";

export function saveLoginSession(
  response: LoginResponse,
  organization: LoginOrganization,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    response.accessToken,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      response.user,
    ),
  );

  localStorage.setItem(
    ORGANIZATION_KEY,
    JSON.stringify(
      organization,
    ),
  );

  notifyAuthChange();
}

export function getAuthSession():
  | AuthSession
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken =
    localStorage.getItem(
      ACCESS_TOKEN_KEY,
    );

  const user =
    localStorage.getItem(
      USER_KEY,
    );

  const organization =
    localStorage.getItem(
      ORGANIZATION_KEY,
    );

  if (
    !accessToken ||
    !user ||
    !organization
  ) {
    return null;
  }

  try {
    return {
      accessToken,

      user:
        JSON.parse(user),

      organization:
        JSON.parse(
          organization,
        ),
    };
  } catch {
    clearAuthSession();

    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );

  localStorage.removeItem(
    ORGANIZATION_KEY,
  );

  notifyAuthChange();
}

/*
 * React-friendly auth session hook.
 */
export function useAuthSession() {
  const snapshot =
    useSyncExternalStore(
      subscribeToAuth,
      getAuthSnapshot,
      getServerAuthSnapshot,
    );

  return useMemo<
    AuthSession | null
  >(() => {
    if (!snapshot) {
      return null;
    }

    try {
      return JSON.parse(
        snapshot,
      ) as AuthSession;
    } catch {
      return null;
    }
  }, [snapshot]);
}

/*
 * Lets us know when hydration
 * has completed without setState.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
}

function getAuthSnapshot():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const session =
    getAuthSession();

  if (!session) {
    return null;
  }

  return JSON.stringify(
    session,
  );
}

function getServerAuthSnapshot():
  | null {
  return null;
}

function subscribeToAuth(
  callback: () => void,
) {
  window.addEventListener(
    "storage",
    callback,
  );

  window.addEventListener(
    AUTH_CHANGE_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback,
    );

    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      callback,
    );
  };
}

function subscribeToHydration() {
  return () => {};
}

function notifyAuthChange() {
  window.dispatchEvent(
    new Event(
      AUTH_CHANGE_EVENT,
    ),
  );
}

export function updateAccessToken(
  accessToken: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  notifyAuthChange();
}