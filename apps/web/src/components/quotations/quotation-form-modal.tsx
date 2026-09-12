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
import { useEffect, useState, useCallback, useRef } from "react";

import { uploadsService } from "@/services/uploads.service";

import {
  importQuotationFile,
  isSupportedQuotationImportFile,
} from "@/lib/quotation-import/import-quotation-file";
import type { ImportedQuotationDraft } from "@/types/quotation-import";
import type { QuotationFormItem } from "@/types/quotation-form";

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

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


  function convertImportedItems(
    draft: ImportedQuotationDraft,
    currency: string,
  ): QuotationFormItem[] {
    return draft.items.map((item) => ({
      key: crypto.randomUUID(),
      name: item.name,
      description: item.description ?? "",
      quantity: String(item.quantity),
      unit: item.unit || "pcs",
      unitPrice: String(item.unitPrice),
      imageUrl: "",
      imageKey: "",
      warrantyDuration: item.warrantyDuration
        ? String(item.warrantyDuration)
        : "",
      warrantyUnit: item.warrantyUnit ?? "",
      warrantyTerms: item.warrantyTerms ?? "",
      currency,
    }));
  }

  function normalizeMatchValue(value?: string | null): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function findMatchingCustomer(
    draft: ImportedQuotationDraft,
  ): Customer | null {
    const importedName = normalizeMatchValue(draft.customer.name);
    const importedCompanyName = normalizeMatchValue(
      draft.customer.companyName,
    );
    const importedEmail = normalizeMatchValue(draft.customer.email);
    const importedPhone = normalizeMatchValue(draft.customer.phone);

    if (
      !importedName &&
      !importedCompanyName &&
      !importedEmail &&
      !importedPhone
    ) {
      return null;
    }

    const exactMatches = customers.filter((customer) => {
      const customerName = normalizeMatchValue(customer.name);
      const customerCompanyName = normalizeMatchValue(customer.companyName);
      const customerEmail = normalizeMatchValue(customer.email);
      const customerPhone = normalizeMatchValue(customer.phone);

      const emailMatches =
        importedEmail &&
        customerEmail &&
        importedEmail === customerEmail;

      const phoneMatches =
        importedPhone &&
        customerPhone &&
        importedPhone === customerPhone;

      const nameMatches =
        importedName &&
        customerName &&
        importedName === customerName;

      const companyMatches =
        importedCompanyName &&
        customerCompanyName &&
        importedCompanyName === customerCompanyName;

      return Boolean(emailMatches || phoneMatches || nameMatches || companyMatches);
    });

    if (exactMatches.length === 1) {
      return exactMatches[0];
    }

    return null;
  }


  async function handleImportFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    setImportError(null);
    setImportSuccess(null);
    setImportWarnings([]);
    setImportedFileName(null);

    if (!isSupportedQuotationImportFile(file)) {
      setImportError(
        "Unsupported file type. Please upload an Excel, Word, PDF, or image quotation.",
      );
      return;
    }

    try {
      setIsImporting(true);

      const draft = await importQuotationFile(file);

      const importedItems = convertImportedItems(draft, currency);

      if (!importedItems.length) {
        throw new Error("No quotation items were found in the file.");
      }

      form.replaceItems(importedItems);

      if (draft.customer.name || draft.customer.companyName) {
        const matchedCustomer = findMatchingCustomer(draft);

        if (matchedCustomer) {
          form.setCustomerId(matchedCustomer.id);
        } else {
          setImportWarnings((previous) => [
            ...previous,
            "Customer information was found but no exact customer match was detected. Please select the customer manually.",
          ]);
        }
      }

      if (draft.subject) {
        form.setSubject(draft.subject);
      }

      if (draft.notes) {
        form.setNotes(draft.notes);
      }

      if (draft.terms) {
        form.setTerms(draft.terms);
      }

      if (draft.validUntil) {
        form.setValidUntil(draft.validUntil);
      }

      if (draft.discountType) {
        form.setDiscountType(draft.discountType);
        form.setDiscountValue(String(draft.discountValue ?? 0));
      }

      form.setTaxRate(String(draft.taxRate ?? 0));

      setImportedFileName(file.name);
      setImportWarnings(draft.warnings);
      setImportSuccess(
        `${importedItems.length} quotation item${
          importedItems.length === 1 ? "" : "s"
        } imported successfully.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to import the quotation file.";

      setImportError(message);
    } finally {
      setIsImporting(false);
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

      {!quotation && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Import existing quotation</p>
              <p className="text-xs text-muted-foreground">
                Upload an Excel, Word, PDF, or image quotation to prefill the form.
                You can review and edit everything before saving.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting ? "Importing..." : "Import Quotation"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.docx,.pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleImportFile}
            className="hidden"
          />

          {importedFileName && (
            <p className="mt-3 text-xs text-muted-foreground">
              Imported from:{" "}
              <span className="font-medium text-foreground">
                {importedFileName}
              </span>
            </p>
          )}

          {importSuccess && (
            <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              {importSuccess}
            </div>
          )}

          {importError && (
            <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {importError}
            </div>
          )}

          {importWarnings.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">Import warnings</p>

              <ul className="mt-1 list-disc space-y-1 pl-5">
                {importWarnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          onInsertBefore={
            form.insertItemBefore
          }
          onInsertAfter={
            form.insertItemAfter
          }
          onRemove={
            form.removeItem
          }
          onReorder={form.reorderItems}
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