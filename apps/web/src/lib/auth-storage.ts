'use client';

import {
  useMemo,
  useSyncExternalStore,
} from 'react';

import type {
  AuthSession,
  LoginOrganization,
  LoginResponse,
} from '@/types/auth';

const ACCESS_TOKEN_KEY = 'qufo_access_token';

const USER_KEY = 'qufo_user';

const ORGANIZATION_KEY = 'qufo_organization';

const ORGANIZATIONS_KEY = 'qufo_organizations';

const AUTH_CHANGE_EVENT = 'qufo-auth-change';

export function saveLoginSession(
  response: LoginResponse,
  organization: LoginOrganization,
) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);

  localStorage.setItem(USER_KEY, JSON.stringify(response.user));

  localStorage.setItem(ORGANIZATION_KEY, JSON.stringify(organization));

  localStorage.setItem(
    ORGANIZATIONS_KEY,
    JSON.stringify(response.organizations),
  );

  notifyAuthChange();
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  const user = localStorage.getItem(USER_KEY);

  const organization = localStorage.getItem(ORGANIZATION_KEY);

  if (!accessToken || !user || !organization) {
    return null;
  }

  try {
    return {
      accessToken,
      user: JSON.parse(user),
      organization: JSON.parse(organization),
    } as AuthSession;
  } catch {
    clearAuthSession();

    return null;
  }
}

export function getAvailableOrganizations(): LoginOrganization[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedOrganizations = localStorage.getItem(ORGANIZATIONS_KEY);

  if (storedOrganizations) {
    try {
      const parsed: unknown = JSON.parse(storedOrganizations);

      if (Array.isArray(parsed)) {
        return parsed.filter(isLoginOrganization);
      }
    } catch {
      localStorage.removeItem(ORGANIZATIONS_KEY);
    }
  }

  /*
   * Backward-compatible fallback for sessions created before
   * the workspace list was added to local storage.
   */
  const session = getAuthSession();

  return session ? [session.organization] : [];
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ORGANIZATION_KEY);
  localStorage.removeItem(ORGANIZATIONS_KEY);

  notifyAuthChange();
}

export function useAuthSession() {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  return useMemo<AuthSession | null>(() => {
    if (!snapshot) {
      return null;
    }

    try {
      return JSON.parse(snapshot) as AuthSession;
    } catch {
      return null;
    }
  }, [snapshot]);
}

export function useAvailableOrganizations() {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getOrganizationsSnapshot,
    getServerOrganizationsSnapshot,
  );

  return useMemo<LoginOrganization[]>(() => {
    try {
      const parsed: unknown = JSON.parse(snapshot);

      return Array.isArray(parsed)
        ? parsed.filter(isLoginOrganization)
        : [];
    } catch {
      return [];
    }
  }, [snapshot]);
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
}

export function updateAccessToken(accessToken: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  notifyAuthChange();
}

/*
 * Adds newly joined organizations to the saved list and
 * makes the provided organization the active workspace.
 */
export function setActiveOrganization(
  organization: LoginOrganization,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const currentOrganizations = getAvailableOrganizations();

  const organizationExists = currentOrganizations.some(
    (item) => item.id === organization.id,
  );

  const nextOrganizations = organizationExists
    ? currentOrganizations.map((item) =>
        item.id === organization.id ? organization : item,
      )
    : [...currentOrganizations, organization];

  localStorage.setItem(ORGANIZATION_KEY, JSON.stringify(organization));

  localStorage.setItem(
    ORGANIZATIONS_KEY,
    JSON.stringify(nextOrganizations),
  );

  notifyAuthChange();
}

function getAuthSnapshot(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const session = getAuthSession();

  return session ? JSON.stringify(session) : null;
}

function getOrganizationsSnapshot() {
  return JSON.stringify(getAvailableOrganizations());
}

function getServerAuthSnapshot(): null {
  return null;
}

function getServerOrganizationsSnapshot() {
  return '[]';
}

function subscribeToAuth(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function subscribeToHydration() {
  return () => {};
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function isLoginOrganization(value: unknown): value is LoginOrganization {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const organization = value as Record<string, unknown>;

  return (
    typeof organization.id === 'string' &&
    typeof organization.name === 'string' &&
    typeof organization.slug === 'string' &&
    isOrganizationRole(organization.role) &&
    (organization.subscription === null ||
      typeof organization.subscription === 'object')
  );
}

function isOrganizationRole(value: unknown) {
  return (
    value === 'OWNER' ||
    value === 'ADMIN' ||
    value === 'MANAGER' ||
    value === 'STAFF'
  );
}
