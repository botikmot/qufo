"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmVariant =
  | "default"
  | "destructive";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

type ConfirmContextValue = (
  options: ConfirmOptions,
) => Promise<boolean>;

const ConfirmContext =
  createContext<ConfirmContextValue | null>(
    null,
  );

export function ConfirmDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] =
    useState(false);

  const [
    options,
    setOptions,
  ] =
    useState<ConfirmOptions | null>(
      null,
    );

  const resolverRef =
    useRef<
      ((value: boolean) => void) | null
    >(null);

  const confirm =
    useCallback(
      (
        options: ConfirmOptions,
      ) => {
        return new Promise<boolean>(
          (resolve) => {
            resolverRef.current =
              resolve;

            setOptions(options);
            setOpen(true);
          },
        );
      },
      [],
    );

  function handleConfirm() {
    resolverRef.current?.(
      true,
    );

    resolverRef.current =
      null;

    setOpen(false);
  }

  function handleCancel() {
    resolverRef.current?.(
      false,
    );

    resolverRef.current =
      null;

    setOpen(false);
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (!nextOpen) {
      handleCancel();
    }
  }

  return (
    <ConfirmContext.Provider
      value={confirm}
    >
      {children}

      <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <AlertDialogContent
          className="
            border-slate-800
            bg-[#0B1929]
            text-slate-100
            shadow-2xl
            sm:max-w-md
            z-[205]
          "
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="
                text-base
                font-semibold
                text-slate-100
              "
            >
              {options?.title}
            </AlertDialogTitle>

            {options?.description && (
              <AlertDialogDescription
                className="
                  leading-6
                  text-slate-400
                "
              >
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-3">
            <AlertDialogCancel
              onClick={handleCancel}
              className="
                border-slate-700
                bg-slate-900/70
                text-slate-300
                hover:bg-slate-800
                hover:text-white
              "
            >
              {options?.cancelText ?? "Cancel"}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options?.variant === "destructive"
                  ? `
                    bg-red-500
                    text-white
                    hover:bg-red-600
                    focus:ring-red-500
                  `
                  : `
                    bg-emerald-400
                    text-slate-950
                    hover:bg-emerald-300
                    focus:ring-emerald-400
                  `
              }
            >
              {options?.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context =
    useContext(
      ConfirmContext,
    );

  if (!context) {
    throw new Error(
      "useConfirm must be used within ConfirmDialogProvider.",
    );
  }

  return context;
}