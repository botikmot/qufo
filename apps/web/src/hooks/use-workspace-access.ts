"use client";

import {
  useAuthSession,
} from "@/lib/auth-storage";

import {
  getEffectiveSubscriptionStatus,
  isSubscriptionWritable,
} from "@/utils/subscription";

export function useWorkspaceAccess() {
  const session =
    useAuthSession();

  const subscription =
    session?.organization
      .subscription ??
    null;

  const subscriptionStatus =
    getEffectiveSubscriptionStatus(
      subscription,
    );

  const writable =
    Boolean(
      subscription &&
        isSubscriptionWritable(
          subscriptionStatus,
        ),
    );

  return {
    session,

    subscription,

    subscriptionStatus,

    writable,

    readOnly:
      !writable,
  };
}