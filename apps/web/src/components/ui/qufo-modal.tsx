"use client";

import type {
  ReactNode,
} from "react";

import {
  X,
} from "lucide-react";


type QufoModalSize =
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

type QufoModalProps = {
  title: string;
  description?: string;

  icon?: ReactNode;

  customHeader?: ReactNode;

  children: ReactNode;
  footer?: ReactNode;

  onClose: () => void;

  closeDisabled?: boolean;

  size?: QufoModalSize;
};

const sizeClasses: Record<
  QufoModalSize,
  string
> = {
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
};

export function QufoModal({
  title,
  description,
  icon,
  customHeader,
  children,
  footer,
  onClose,
  closeDisabled = false,
  size = "3xl",
}: QufoModalProps) {
  return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="
          fixed
          inset-0
          z-[140]
          bg-slate-950/80
          backdrop-blur-sm

          sm:flex
          sm:items-center
          sm:justify-center
          sm:p-4
        "
      >
        <div
          className={`
            flex
            h-dvh
            w-full
            min-w-0
            flex-col
            overflow-hidden
            bg-[var(--qufo-bg)]

            sm:h-auto
            sm:max-h-[calc(100dvh-2rem)]
            sm:rounded-3xl
            sm:border
            sm:border-[var(--qufo-border)]
            sm:bg-[var(--qufo-surface)]
            sm:shadow-2xl
            sm:backdrop-blur-xl

            ${sizeClasses[size]}
          `}
        >
          {customHeader ? (
            <div className="shrink-0">
              {customHeader}
            </div>
          ) : (
            <div
              className="
                flex
                shrink-0
                items-start
                justify-between
                gap-4
                border-b
                border-[var(--qufo-border)]
                px-4
                py-4
                sm:px-6
                sm:py-5
              "
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {icon && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-300">
                    {icon}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-white sm:text-lg">
                    {title}
                  </h2>

                  {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Scrollable body */}
          <div
            className="
              min-h-0
              min-w-0
              flex-1
              overflow-x-hidden
              overflow-y-auto
              overscroll-contain
              px-4
              py-5
              sm:px-6
              sm:py-6
            "
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="
                shrink-0
                border-t
                border-[var(--qufo-border)]
                bg-[var(--qufo-bg)]/95
                px-4
                pt-3
                pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                backdrop-blur-xl

                sm:bg-[var(--qufo-bg)]/80
                sm:px-6
                sm:py-4
              "
            >
              {footer}
            </div>
          )}
        </div>
      </div>
  );
}