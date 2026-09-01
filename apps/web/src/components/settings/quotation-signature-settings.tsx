"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  FileSignature,
  ImageUp,
  LoaderCircle,
  Save,
  Trash2,
} from "lucide-react";

import type {
  UpdateQuotationSignatureSettingsData,
} from "@/types/settings";

type Props = {
  signatureUrl:
    string | null;

  initialName:
    string | null;

  initialTitle:
    string | null;

  initialEnabled:
    boolean;

  uploading:
    boolean;

  removing:
    boolean;

  saving:
    boolean;

  onUpload: (
    file: File,
  ) => Promise<boolean>;

  onRemove:
    () => Promise<boolean>;

  onSave: (
    data: UpdateQuotationSignatureSettingsData,
  ) => Promise<boolean>;
};

export function QuotationSignatureSettings({
  signatureUrl,
  initialName,
  initialTitle,
  initialEnabled,
  uploading,
  removing,
  saving,
  onUpload,
  onRemove,
  onSave,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    name,
    setName,
  ] = useState(
    initialName ?? "",
  );

  const [
    title,
    setTitle,
  ] = useState(
    initialTitle ?? "",
  );

  const [
    enabled,
    setEnabled,
] = useState<boolean>(
    initialEnabled ?? false,
);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
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
      )
    ) {
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      return;
    }

    await onUpload(file);

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  }

  async function handleRemove() {
    const success =
      await onRemove();

    if (success) {
      setEnabled(false);
    }
  }

  async function handleSave() {
    await onSave({
      quotationSignatoryName:
        name.trim(),

      quotationSignatoryTitle:
        title.trim(),

      showQuotationSignature:
        enabled,
    });
  }

  const busy =
    uploading ||
    removing ||
    saving;

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
            Optionally include an authorized signature
            in generated quotation PDFs.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
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
              onChange={(event) =>
                setName(
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
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              className="qufo-input"
              placeholder="Owner / Manager"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-400">
            Signature image
          </label>

          <div className="qufo-surface-soft flex min-h-36 items-center justify-center rounded-2xl p-5">
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Authorized signature"
                className="max-h-28 max-w-full object-contain"
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
                inputRef.current?.click()
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
                ? "Replace signature"
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
            JPG, PNG or WebP. Maximum 2 MB.
            Transparent PNG is recommended.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.015] p-4">
          <input
            type="checkbox"
            checked={enabled}
            disabled={
              !signatureUrl ||
              busy
            }
            onChange={(event) =>
              setEnabled(
                event.target.checked,
              )
            }
            className="mt-0.5 size-4 accent-emerald-400"
          />

          <div>
            <div className="text-sm font-medium text-slate-200">
              Show signature on quotation PDFs
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              When enabled, the uploaded signature
              appears above the authorized signatory
              name.
            </p>
          </div>
        </label>

        <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] px-4 py-3 text-xs leading-5 text-amber-200/60">
          Only upload a signature that you are
          authorized to use on business quotations.
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void handleSave();
            }}
            className="flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-violet-300 disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Save
                size={15}
              />
            )}

            Save signature settings
          </button>
        </div>
      </div>
    </div>
  );
}