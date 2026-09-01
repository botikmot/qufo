"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";

import {
  useRouter,
} from "next/navigation";

import {
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  apiFetch,
} from "@/lib/api";

import {
  saveLoginSession,
} from "@/lib/auth-storage";

import {
  savePendingGoogleRegistration,
} from "@/lib/google-auth-storage";

import type {
  GoogleAuthResponse,
} from "@/types/auth";

type Props = {
  onError?: (
    message: string | null,
  ) => void;
};

const GOOGLE_AUTH_ENABLED =
  process.env
    .NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !==
  "false";

export function GoogleContinueButton({
  onError,
}: Props) {
  /*
   * Self-hosted deployment:
   * Google authentication is completely hidden.
   *
   * The inner component containing Google hooks /
   * provider is never mounted.
   */
  if (!GOOGLE_AUTH_ENABLED) {
    return null;
  }

  return (
    <GoogleContinueButtonInner
      onError={onError}
    />
  );
}

function GoogleContinueButtonInner({
  onError,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    buttonWidth,
    setButtonWidth,
  ] = useState(400);

  const clientId =
    process.env
      .NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const updateWidth =
      () => {
        const width =
          element.clientWidth;

        setButtonWidth(
          Math.min(
            width,
            400,
          ),
        );
      };

    updateWidth();

    const observer =
      new ResizeObserver(
        updateWidth,
      );

    observer.observe(
      element,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Google auth is enabled but the
   * client ID is missing.
   *
   * This should only happen due to an
   * incomplete SaaS configuration.
   */
  if (!clientId) {
    return (
      <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-xs leading-5 text-amber-200/70">
        Google sign-in is
        currently unavailable.
      </div>
    );
  }

  async function handleCredential(
    credential: string,
  ) {
    setLoading(true);

    onError?.(null);

    try {
      const response =
        await apiFetch<GoogleAuthResponse>(
          "/auth/google",
          {
            method: "POST",

            requireAuth:
              false,

            body:
              JSON.stringify({
                credential,
              }),
          },
        );

      /*
       * Brand-new Google user.
       */
      if (
        response.requiresOnboarding
      ) {
        savePendingGoogleRegistration({
          credential,

          profile:
            response.profile,
        });

        router.push(
          "/register/google",
        );

        return;
      }

      /*
       * Existing QUFO user.
       */
      const organization =
        response
          .organizations[0];

      if (!organization) {
        throw new Error(
          "Your account does not belong to an organization.",
        );
      }

      saveLoginSession(
        response,
        organization,
      );

      router.replace(
        "/dashboard",
      );
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <GoogleOAuthProvider
      clientId={clientId}
    >
      <div className="mb-3 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-cyan-400/15 hover:bg-white/[0.025]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-300">
              Fast sign in
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Use your Google
              account to continue.
            </p>
          </div>

          <div className="flex size-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05] text-cyan-300">
            <ShieldCheck
              size={16}
            />
          </div>
        </div>

        <div
          className={[
            "relative overflow-hidden rounded-xl",

            loading
              ? "pointer-events-none opacity-50"
              : "",
          ].join(" ")}
        >
          <div
            ref={
              containerRef
            }
            className="flex w-full justify-center"
          >
            <GoogleLogin
              onSuccess={(
                response,
              ) => {
                if (
                  !response
                    .credential
                ) {
                  onError?.(
                    "Google did not return a valid credential.",
                  );

                  return;
                }

                void handleCredential(
                  response
                    .credential,
                );
              }}
              onError={() => {
                onError?.(
                  "Google sign-in was cancelled or failed.",
                );
              }}
              theme="filled_blue"
              size="large"
              shape="circle"
              text="continue_with"
              logo_alignment="left"
              width={String(
                buttonWidth,
              )}
            />
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#081522]/90 backdrop-blur-sm">
              <LoaderCircle
                size={17}
                className="animate-spin text-cyan-300"
              />

              <span className="ml-2 text-sm text-slate-300">
                Signing
                in...
              </span>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}