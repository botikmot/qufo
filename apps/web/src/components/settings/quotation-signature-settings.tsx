"use client";

import {
  ChangeEvent,
  useRef,
} from "react";

import {
  FileSignature,
  ImageUp,
  LoaderCircle,
  Trash2,
} from "lucide-react";

type Props = {
  signatureUrl:
    | string
    | null;

  name: string;
  title: string;
  enabled: boolean;

  uploading: boolean;
  removing: boolean;
  disabled?: boolean;

  onNameChange: (
    value: string,
  ) => void;

  onTitleChange: (
    value: string,
  ) => void;

  onEnabledChange: (
    enabled: boolean,
  ) => void;

  onUpload: (
    file: File,
  ) => Promise<boolean>;

  onRemove:
    () => Promise<boolean>;
};

export function QuotationSignatureSettings({
  signatureUrl,
  name,
  title,
  enabled,
  uploading,
  removing,
  disabled = false,
  onNameChange,
  onTitleChange,
  onEnabledChange,
  onUpload,
  onRemove,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const busy =
    uploading ||
    removing ||
    disabled;

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowed.includes(
        file.type,
      ) ||
      file.size >
        2 * 1024 * 1024
    ) {
      event.target.value =
        "";

      return;
    }

    await onUpload(
      file,
    );

    event.target.value =
      "";
  }

  async function handleRemove() {
    const success =
      await onRemove();

    if (success) {
      onEnabledChange(
        false,
      );
    }
  }

  return (
    <div className="border-t border-[var(--qufo-border)] pt-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.08] text-violet-300">
          <FileSignature
            size={18}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">
            Quotation signature
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Optionally include an
            authorized signature in
            generated quotation PDFs.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
        {/* Signature information */}
        <div className="min-w-0 space-y-5">
          <div>
            <label
              htmlFor="quotation-signatory-name"
              className="mb-2 block text-sm text-slate-400"
            >
              Authorized signatory
            </label>

            <input
              id="quotation-signatory-name"
              value={name}
              maxLength={150}
              disabled={busy}
              onChange={(event) =>
                onNameChange(
                  event.target.value,
                )
              }
              className="qufo-input"
              placeholder="Desmond Gonzales"
            />
          </div>

          <div>
            <label
              htmlFor="quotation-signatory-title"
              className="mb-2 block text-sm text-slate-400"
            >
              Position / title
            </label>

            <input
              id="quotation-signatory-title"
              value={title}
              maxLength={150}
              disabled={busy}
              onChange={(event) =>
                onTitleChange(
                  event.target.value,
                )
              }
              className="qufo-input"
              placeholder="Owner / Manager"
            />
          </div>

          <div className="flex items-start justify-between gap-5 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.015] p-4">
            <div>
              <div className="text-sm font-medium text-slate-200">
                Show on quotation PDFs
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Display the uploaded
                signature above the
                authorized signatory.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                enabled
              }
              disabled={
                !signatureUrl ||
                busy
              }
              onClick={() =>
                onEnabledChange(
                  !enabled,
                )
              }
              className={`
                relative
                h-7
                w-12
                shrink-0
                rounded-full
                border
                transition
                disabled:cursor-not-allowed
                disabled:opacity-40
                ${
                  enabled
                    ? "border-violet-300/30 bg-violet-400"
                    : "border-white/10 bg-slate-800"
                }
              `}
            >
              <span
                className={`
                  absolute
                  left-1
                  top-1/2
                  size-5
                  -translate-y-1/2
                  rounded-full
                  bg-white
                  shadow
                  transition-transform
                  ${
                    enabled
                      ? "translate-x-5"
                      : "translate-x-0"
                  }
                `}
              />
            </button>
          </div>

          <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] px-4 py-3 text-xs leading-5 text-amber-200/60">
            Only upload a signature
            that you are authorized to
            use on business quotations.
          </div>
        </div>

        {/* Signature image */}
        <div className="min-w-0">
          <label className="mb-2 block text-sm text-slate-400">
            Signature image
          </label>

          <div className="qufo-surface-soft flex min-h-40 items-center justify-center rounded-2xl p-5">
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Authorized signature"
                className="max-h-24 max-w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <FileSignature
                  size={28}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-2 text-xs text-slate-600">
                  No signature uploaded.
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={
              handleFileChange
            }
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                inputRef.current
                  ?.click()
              }
              className="flex items-center gap-2 rounded-xl border border-[var(--qufo-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              {uploading ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <ImageUp
                  size={15}
                />
              )}

              {signatureUrl
                ? "Replace"
                : "Upload signature"}
            </button>

            {signatureUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void handleRemove();
                }}
                className="flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/[0.08] disabled:opacity-50"
              >
                {removing ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={15}
                  />
                )}

                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            JPG, PNG or WebP.
            Maximum 2 MB. Transparent
            PNG is recommended.
          </p>
        </div>
      </div>
    </div>
  );
}