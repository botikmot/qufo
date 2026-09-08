"use client";

import {
  FileText,
  LoaderCircle,
} from "lucide-react";

import {
  QuotationFormCustomer,
} from "@/components/quotations/quotation-form-customer";

import {
  QuotationFormDates,
} from "@/components/quotations/quotation-form-dates";

import {
  QuotationFormDiscountTax,
} from "@/components/quotations/quotation-form-discount-tax";

import {
  QuotationFormItems,
} from "@/components/quotations/quotation-form-items";

import {
  QuotationFormNotes,
} from "@/components/quotations/quotation-form-notes";

import {
  QuotationFormSummary,
} from "@/components/quotations/quotation-form-summary";

import {
  QufoModal,
} from "@/components/ui/qufo-modal";

import {
  useQuotationForm,
} from "@/hooks/use-quotation-form";

import type {
  Customer,
} from "@/types/customer";

import type {
  Quotation,
} from "@/types/quotation";

import type {
  QuotationFormPayload,
} from "@/types/quotation-form";

import type {
  BusinessProfilesResponse,
} from "@/types/business-profile";

import { settingsService } from "@/services/settings.service";
import { useEffect, useState, useCallback } from "react";

import { uploadsService } from "@/services/uploads.service";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import {
  getQuotationPdfPreferences,
} from "@/lib/quotation-pdf-preferences";

type QuotationFormModalProps = {
  customers: Customer[];

  businessProfiles:
    | BusinessProfilesResponse
    | null;

  quotation?: Quotation | null;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: QuotationFormPayload,
  ) => Promise<void>;
};

const MAIN_BUSINESS_VALUE = "__MAIN_BUSINESS__";

export function QuotationFormModal({
  customers,
  businessProfiles,
  quotation,
  loading = false,
  onClose,
  onSubmit,
}: QuotationFormModalProps) {
  
  const editing =
    Boolean(quotation);

  const [
    businessSelection,
    setBusinessSelection,
  ] = useState<{
    contextKey: string;
    value: string;
  } | null>(null);

  const pdfOptions =
    getQuotationPdfPreferences();

  /*
  * A different quotation means
  * a different selection context.
  */
  const businessContextKey =
    quotation?.id ??
    "__NEW_QUOTATION__";

  /*
  * EDIT / REVISION
  * → preserve saved business.
  *
  * CREATE
  * → use configured default profile.
  *
  * No profile default
  * → Main Business.
  */
  const defaultBusinessValue =
    quotation?.businessProfileId ??
    businessProfiles?.profiles.find(
      (profile) =>
        profile.isDefault,
    )?.id ??
    MAIN_BUSINESS_VALUE;

  /*
  * Manual user selection wins.
  *
  * Otherwise we simply derive the
  * value above — no Effect needed.
  */
  const selectedBusinessValue =
    businessSelection?.contextKey ===
    businessContextKey
      ? businessSelection.value
      : defaultBusinessValue;

  const selectedBusinessProfile =
    selectedBusinessValue ===
    MAIN_BUSINESS_VALUE
      ? undefined
      : businessProfiles?.profiles.find(
          (profile) =>
            profile.id ===
            selectedBusinessValue,
        );

  const selectedBusinessLabel =
    selectedBusinessValue ===
    MAIN_BUSINESS_VALUE
      ? businessProfiles
        ? `${businessProfiles.mainBusiness.label} — ${businessProfiles.mainBusiness.name}`
        : "Main Business"
      : selectedBusinessProfile
        ? `${selectedBusinessProfile.label} — ${selectedBusinessProfile.name}`
        : quotation?.businessNameSnapshot ??
          "Select business or store";

  const selectedBusinessProfileId =
    selectedBusinessValue ===
    MAIN_BUSINESS_VALUE
      ? null
      : selectedBusinessValue;

  const handleQuotationSubmit =
    useCallback(
      async (
        data: QuotationFormPayload,
      ) => {
        await onSubmit({
          ...data,

          businessProfileId: selectedBusinessProfileId,

        });
      },
      [
        onSubmit,
        selectedBusinessProfileId,
      ],
    );

  const form =
    useQuotationForm({
      quotation,

      businessProfileId:
        selectedBusinessProfileId,

      onSubmit:
        handleQuotationSubmit,
    });

  const [
    uploadingImageKey,
    setUploadingImageKey,
  ] = useState<string | null>(null);

  const [
    organizationCurrency,
    setOrganizationCurrency,
  ] = useState("PHP");

  useEffect(() => {
    /*
    * Editing quotations already use
    * their saved currency below.
    *
    * No state update needed here.
    */
    if (quotation?.currency) {
      return;
    }

    let cancelled = false;

    async function loadOrganizationCurrency() {
      try {
        const organization =
          await settingsService.getBusiness();

        if (cancelled) {
          return;
        }

        setOrganizationCurrency(
          organization.currency,
        );
      } catch {
        /*
        * Keep PHP as the safe fallback.
        */
      }
    }

    void loadOrganizationCurrency();

    return () => {
      cancelled = true;
    };
  }, [quotation?.currency]);


  const currency = quotation?.currency ?? organizationCurrency;


  async function handleItemImageUpload(
    key: string,
    file: File,
  ) {
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    try {
      setUploadingImageKey(key);

      const uploaded =
        await uploadsService.uploadQuotationItemImage(
          file,
        );

      form.updateItem(key, {
        imageUrl: uploaded.url,
        imageKey: uploaded.imageKey,
      });
    } catch (error) {
      console.error(
        "Failed to upload quotation item image:",
        error,
      );
    } finally {
      setUploadingImageKey(null);
    }
  }


  return (
    <QufoModal
      title={
        editing
          ? "Edit quotation"
          : "New quotation"
      }
      description={
        editing
          ? quotation?.quotationNumber
          : "Prepare a new quotation for a customer."
      }
      icon={
        <FileText size={18} />
      }
      onClose={onClose}
      closeDisabled={
        loading ||
        Boolean(uploadingImageKey)
      }
      size="6xl"
      footer={
        <div
          className="
            flex
            flex-col-reverse
            gap-2.5

            sm:flex-row
            sm:justify-end
            sm:gap-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={
              loading ||
              !businessProfiles ||
              Boolean(uploadingImageKey)
            }
            className="
              w-full
              rounded-xl
              px-4
              py-2.5
              text-sm
              text-slate-400
              transition
              hover:bg-white/[0.04]
              hover:text-white
              disabled:pointer-events-none
              disabled:opacity-50

              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            form="quotation-form"
            disabled={
              loading ||
              !businessProfiles ||
              Boolean(uploadingImageKey)
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-400
              px-5
              py-2.5
              text-sm
              font-medium
              text-slate-950
              transition
              hover:bg-emerald-300
              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
          >
            {uploadingImageKey ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Uploading image...
              </>
            ) : (
              <>
                {loading && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editing
                  ? "Save changes"
                  : "Create quotation"}
              </>
            )}
          </button>
        </div>
      }
    >
      <form
        id="quotation-form"
        onSubmit={
          form.handleSubmit
        }
        className="min-w-0 space-y-8"
      >
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          <div className="min-w-0">
            <label
              htmlFor="quotation-business"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Business / Store
              <span className="text-red-300">
                {" *"}
              </span>
            </label>

            <Select
              value={
                selectedBusinessValue
              }
              disabled={
                loading ||
                !businessProfiles
              }
              onValueChange={(value) => {
                if (value === null) {
                  return;
                }

                setBusinessSelection({
                  contextKey:
                    businessContextKey,

                  value,
                });
              }}
            >
              <SelectTrigger
                id="quotation-business"
                className="w-full"
              >
                <span className="truncate">
                  {selectedBusinessLabel}
                </span>
              </SelectTrigger>

              <SelectContent>
                {businessProfiles && (
                  <>
                    <SelectItem
                      value={
                        MAIN_BUSINESS_VALUE
                      }
                    >
                      {businessProfiles
                        .mainBusiness.label}
                      {" — "}
                      {businessProfiles
                        .mainBusiness.name}

                      {businessProfiles
                        .mainBusiness
                        .isDefault
                        ? " · Default"
                        : ""}
                    </SelectItem>

                    {businessProfiles.profiles.map(
                      (profile) => (
                        <SelectItem
                          key={profile.id}
                          value={profile.id}
                        >
                          {profile.label}
                          {" — "}
                          {profile.name}

                          {profile.isDefault
                            ? " · Default"
                            : ""}
                        </SelectItem>
                      ),
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <QuotationFormCustomer
            customers={
              customers
            }
            value={
              form.customerId
            }
            onChange={
              form.setCustomerId
            }
          />

          <QuotationFormDates
            validUntil={
              form.validUntil
            }
            onValidUntilChange={
              form.setValidUntil
            }
          />
        </div>

        {/* Quotation Subject & Message */}
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">

          {pdfOptions.showSubject && (
            <div className="min-w-0">
              <label
                htmlFor="quotation-subject"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Subject
              </label>

              <input
                id="quotation-subject"
                type="text"
                value={form.subject}
                onChange={(event) =>
                  form.setSubject(event.target.value)
                }
                placeholder="e.g. Office Signage Project"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3
                  py-2.5
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  focus:border-emerald-400/40
                  focus:ring-2
                  focus:ring-emerald-400/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>

          )}

          {pdfOptions.showMessage && (

            <div className="min-w-0">
              <label
                htmlFor="quotation-message"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Quotation Message
              </label>

              <textarea
                id="quotation-message"
                value={form.quotationMessage}
                onChange={(event) =>
                  form.setQuotationMessage(event.target.value)
                }
                placeholder="We are pleased to quote to you the following items for your consideration and approval."
                rows={3}
                disabled={loading}
                className="
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3
                  py-2.5
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-slate-500
                  focus:border-emerald-400/40
                  focus:ring-2
                  focus:ring-emerald-400/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>
          )}
        </div>

        <QuotationFormItems
          items={
            form.items
          }
          onAdd={
            form.addItem
          }
          onRemove={
            form.removeItem
          }
          onChange={
            form.updateItem
          }
          onImageSelect={
            handleItemImageUpload
          }
          uploadingImageKey={
            uploadingImageKey
          }
          currency={currency}
        />

        <QuotationFormDiscountTax
          discountType={
            form.discountType
          }
          discountValue={
            form.discountValue
          }
          taxRate={
            form.taxRate
          }
          onDiscountTypeChange={
            form.setDiscountType
          }
          onDiscountValueChange={
            form.setDiscountValue
          }
          onTaxRateChange={
            form.setTaxRate
          }
        />

        <QuotationFormSummary
          subtotal={
            form.totals.subtotal
          }
          discountAmount={
            form.totals
              .discountAmount
          }
          taxAmount={
            form.totals.taxAmount
          }
          total={
            form.totals.total
          }
          currency={currency}
        />

        <QuotationFormNotes
          notes={
            form.notes
          }
          terms={
            form.terms
          }
          onNotesChange={
            form.setNotes
          }
          onTermsChange={
            form.setTerms
          }
        />

        {form.error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {form.error}
          </div>
        )}
      </form>
    </QufoModal>
  );
}