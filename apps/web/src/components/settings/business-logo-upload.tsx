"use client";

import {
  ChangeEvent,
  useRef,
} from "react";

import {
  Building2,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import Image from "next/image";

type BusinessLogoUploadProps = {
  businessName: string;

  logoUrl:
    | string
    | null;

  uploading?: boolean;

  removing?: boolean;

  onUpload: (
    file: File,
  ) => Promise<unknown>;

  onRemove: () =>
    Promise<unknown>;
};

export function BusinessLogoUpload({
  businessName,
  logoUrl,
  uploading = false,
  removing = false,
  onUpload,
  onRemove,
}: BusinessLogoUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const busy =
    uploading ||
    removing;

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      event.target.value =
        "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {
      event.target.value =
        "";

      return;
    }

    try {
      await onUpload(
        file,
      );
    } finally {
      /*
       * Allows selecting
       * the same image again.
       */
      event.target.value =
        "";
    }
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--qufo-border)]
        bg-[var(--qufo-surface-soft)]
        p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
        "
      >
        <div
          className="
            relative
            flex
            h-28
            w-28
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-[var(--qufo-border)]
            bg-black/10
          "
        >
          {logoUrl ? (
            <Image
                src={logoUrl}
                alt={`${businessName} logo`}
                fill
                sizes="112px"
                className="object-contain p-3"
            />
          ) : (
            <Building2
              className="
                h-9
                w-9
                text-muted-foreground
              "
            />
          )}

          {uploading && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-background/70
                backdrop-blur-sm
              "
            >
              <Loader2
                className="
                  h-5
                  w-5
                  animate-spin
                "
              />
            </div>
          )}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div>
            <h3
              className="
                text-sm
                font-medium
                text-foreground
              "
            >
              Business Logo
            </h3>

            <p
              className="
                mt-1
                max-w-xl
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              This logo will
              appear on printed
              and downloaded
              quotation
              documents.
            </p>
          </div>

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            <input
              ref={
                inputRef
              }
              type="file"
              accept="
                image/png,
                image/jpeg,
                image/webp
              "
              className="hidden"
              onChange={
                handleFileChange
              }
            />

            <Button
              type="button"
              variant="outline"
              disabled={
                busy
              }
              onClick={() =>
                inputRef.current?.click()
              }
            >
              {uploading ? (
                <Loader2
                  className="
                    mr-2
                    h-4
                    w-4
                    animate-spin
                  "
                />
              ) : (
                <ImagePlus
                  className="
                    mr-2
                    h-4
                    w-4
                  "
                />
              )}

              {logoUrl
                ? "Replace logo"
                : "Upload logo"}
            </Button>

            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                disabled={
                  busy
                }
                onClick={() =>
                  void onRemove()
                }
                className="
                  text-muted-foreground
                  hover:text-destructive
                "
              >
                {removing ? (
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                    "
                  />
                ) : (
                  <Trash2
                    className="
                      mr-2
                      h-4
                      w-4
                    "
                  />
                )}

                Remove
              </Button>
            )}
          </div>

          <p
            className="
              mt-3
              text-xs
              text-muted-foreground
            "
          >
            PNG, JPG or WebP.
            Maximum 5 MB.
            Transparent PNG works
            best for quotation
            documents.
          </p>
        </div>
      </div>
    </div>
  );
}