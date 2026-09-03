"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Building2,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  WalletCards,
} from "lucide-react";

import {
  BUSINESS_COUNTRIES,
  SUPPORTED_CURRENCIES,
} from "@/constants/currencies";

import type {
  BusinessSettings,
  UpdateBusinessSettingsData,
  UpdateQuotationSignatureSettingsData,
} from "@/types/settings";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BusinessLogoUpload,
} from "./business-logo-upload";

import {
  QuotationSignatureSettings,
} from "./quotation-signature-settings";

import {
  CustomerEmailNotificationsSettings,
} from "./customer-email-notifications-settings";

type BusinessSettingsFormProps = {
  settings: BusinessSettings;

  saving: boolean;

  uploadingLogo: boolean;

  removingLogo: boolean;

  error: string | null;

  success: string | null;

  uploadingSignature: boolean;

  removingSignature: boolean;

  savingSignature: boolean;

  onSave: (
    data: UpdateBusinessSettingsData,
  ) => Promise<boolean>;

  onUploadLogo: (
    file: File,
  ) => Promise<boolean>;

  onRemoveLogo: () =>
    Promise<boolean>;

  onUploadSignature: (
    file: File,
  ) => Promise<boolean>;

  onRemoveSignature:
    () => Promise<boolean>;

  onSaveSignature: (
    data:
      UpdateQuotationSignatureSettingsData,
  ) => Promise<boolean>;
};

export function BusinessSettingsForm({
  settings,
  saving,
  uploadingLogo,
  removingLogo,
  uploadingSignature,
  removingSignature,
  savingSignature,
  error,
  success,
  onSave,
  onUploadLogo,
  onRemoveLogo,
  onUploadSignature,
  onRemoveSignature,
  onSaveSignature,
}: BusinessSettingsFormProps) {
  const [
    name,
    setName,
  ] = useState(
    settings.name,
  );

  const [
    businessType,
    setBusinessType,
  ] = useState(
    settings.businessType ??
      "",
  );

  const [
    email,
    setEmail,
  ] = useState(
    settings.email ?? "",
  );

  const [
    phone,
    setPhone,
  ] = useState(
    settings.phone ?? "",
  );

  const [
    address,
    setAddress,
  ] = useState(
    settings.address ?? "",
  );

  const [
    countryCode,
    setCountryCode,
  ] = useState(
    settings.countryCode ?? "PH",
  );

  const [
    currency,
    setCurrency,
  ] = useState(
    settings.currency ?? "PHP",
  );

  const [
    quotationTerms,
    setQuotationTerms,
  ] = useState(
    settings.quotationTerms ??
      "",
  );

  const [
    quotationFooterNote,
    setQuotationFooterNote,
  ] = useState(
    settings.quotationFooterNote ??
      "",
  );

  const [
    customerEmailNotificationsEnabled,
    setCustomerEmailNotificationsEnabled,
  ] = useState(
    settings
      .customerEmailNotificationsEnabled,
  );

  const [
    quotationSignatoryName,
    setQuotationSignatoryName,
  ] = useState(
    settings
      .quotationSignatoryName ??
      "",
  );

  const [
    quotationSignatoryTitle,
    setQuotationSignatoryTitle,
  ] = useState(
    settings
      .quotationSignatoryTitle ??
      "",
  );

  const [
    showQuotationSignature,
    setShowQuotationSignature,
  ] = useState(
    Boolean(
      settings
        .showQuotationSignature &&
      settings
        .quotationSignatureUrl,
    ),
  );

  function handleCountryChange(
    value: string,
  ) {
    setCountryCode(value);

    if (settings.currencyLocked) {
      return;
    }

    const country =
      BUSINESS_COUNTRIES.find(
        (item) =>
          item.code === value,
      );

    if (country) {
      setCurrency(
        country.currency,
      );
    }
  }
  

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const businessSaved =
      await onSave({
        name,
        businessType,
        email,
        phone,
        address,

        countryCode,
        currency,
        quotationTerms,
        quotationFooterNote,

        ...(settings
          .emailNotificationsAvailable && {
          customerEmailNotificationsEnabled,
        }),
      });

    if (!businessSaved) {
      return;
    }

    await onSaveSignature({
      quotationSignatoryName:
        quotationSignatoryName.trim(),

      quotationSignatoryTitle:
        quotationSignatoryTitle.trim(),

      showQuotationSignature:
        showQuotationSignature,
    });
  }

  console.log('settings:', settings)

  const formSaving =
    saving ||
    savingSignature;

  return (
    <form
      onSubmit={handleSubmit}
      className="qufo-surface overflow-hidden rounded-3xl"
    >
      <div className="border-b border-[var(--qufo-border)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
            <Building2
              size={18}
            />
          </div>

          <div>
            <h2 className="font-medium text-white">
              Business profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Information used
              throughout your QUFO
              workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <BusinessLogoUpload
            businessName={
              name
            }
            logoUrl={
              settings.logoUrl
            }
            uploading={
              uploadingLogo
            }
            removing={
              removingLogo
            }
            onUpload={
              onUploadLogo
            }
            onRemove={
              onRemoveLogo
            }
          />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="business-name"
              className="mb-2 block text-sm text-slate-400"
            >
              Business name
            </label>

            <input
              id="business-name"
              required
              value={name}
              onChange={(
                event,
              ) =>
                setName(
                  event.target
                    .value,
                )
              }
              className="qufo-input"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label
              htmlFor="business-type"
              className="mb-2 block text-sm text-slate-400"
            >
              Business type
            </label>

            <input
              id="business-type"
              value={
                businessType
              }
              onChange={(
                event,
              ) =>
                setBusinessType(
                  event.target
                    .value,
                )
              }
              className="qufo-input"
              placeholder="Printing, signage, fabrication..."
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="business-email"
              className="mb-2 block text-sm text-slate-400"
            >
              Business email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="business-email"
                type="email"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="hello@business.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="business-phone"
              className="mb-2 block text-sm text-slate-400"
            >
              Phone
            </label>

            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                id="business-phone"
                value={phone}
                onChange={(
                  event,
                ) =>
                  setPhone(
                    event.target
                      .value,
                  )
                }
                className="qufo-input qufo-input-with-icon"
                placeholder="+63..."
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="business-address"
            className="mb-2 block text-sm text-slate-400"
          >
            Business address
          </label>

          <div className="relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3 top-3.5 text-slate-600"
            />

            <textarea
              id="business-address"
              rows={3}
              value={address}
              onChange={(
                event,
              ) =>
                setAddress(
                  event.target
                    .value,
                )
              }
              className="qufo-input qufo-input-with-icon resize-none"
              placeholder="Business address..."
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="business-country"
              className="mb-2 block text-sm text-slate-400"
            >
              Business country
            </label>

            <div className="relative">
              <Globe2
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-600"
              />

              <Select
                value={countryCode}
                onValueChange={(value) => {
                  if (value !== null) {
                    handleCountryChange(value);
                  }
                }}
              >
                <SelectTrigger
                  id="business-country"
                  className="w-full pl-10"
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>

                <SelectContent>
                  {BUSINESS_COUNTRIES.map(
                    (country) => (
                      <SelectItem
                        key={country.code}
                        value={country.code}
                      >
                        {country.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              Used to suggest the
              appropriate business
              currency.
            </p>
          </div>

          <div>
            <label
              htmlFor="business-currency"
              className="mb-2 block text-sm text-slate-400"
            >
              Business currency
            </label>

            <div className="relative">
              <WalletCards
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-600"
              />

              <Select
                value={currency}
                onValueChange={(value) => {
                  if (value !== null) {
                    setCurrency(value);
                  }
                }}
                disabled={
                  settings.currencyLocked
                }
              >
                <SelectTrigger
                  id="business-currency"
                  className="w-full pl-10 pr-10"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>

                <SelectContent>
                  {SUPPORTED_CURRENCIES.map(
                    (item) => (
                      <SelectItem
                        key={item.code}
                        value={item.code}
                      >
                        {item.code} —{" "}
                        {item.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {settings.currencyLocked && (
                <LockKeyhole
                  size={15}
                  className="pointer-events-none absolute right-10 top-1/2 z-10 -translate-y-1/2 text-amber-300"
                />
              )}
            </div>

            {settings.currencyLocked ? (
              <p className="mt-2 text-xs text-amber-300/70">
                Currency is locked
                because this workspace
                already contains
                quotations.
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                Currency becomes locked
                after your first quotation
                is created.
              </p>
            )}
          </div>
        </div>

        {settings
          .emailNotificationsAvailable && (
          <CustomerEmailNotificationsSettings
            enabled={
              customerEmailNotificationsEnabled
            }
            disabled={
              saving
            }
            onChange={
              setCustomerEmailNotificationsEnabled
            }
          />
        )}

        <div className="border-t border-[var(--qufo-border)] pt-6">
          <div className="mb-5">
            <h3 className="text-sm font-medium text-white">
              Quotation defaults
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Default terms and closing
              content used in printable
              quotation documents.
            </p>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2 mb-6">
            <div className="min-w-0">
              {/* Terms & Conditions field */}
              <div>
                <label
                  htmlFor="quotation-terms"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Terms & Conditions
                </label>

                <textarea
                  id="quotation-terms"
                  rows={5}
                  maxLength={5000}
                  value={
                    quotationTerms
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuotationTerms(
                      event.target.value,
                    )
                  }
                  className="qufo-input resize-y"
                  placeholder={`Quotation validity: 30 days.
          50% downpayment upon approval.
          Balance payable upon completion.
          Lead time is subject to material availability.`}
                />

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-600">
                    Appears below the
                    quotation totals.
                  </p>

                  <span className="text-xs text-slate-700">
                    {
                      quotationTerms.length
                    }
                    /5000
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              {/* Footer Note field */}
              <div>
                <label
                  htmlFor="quotation-footer-note"
                  className="mb-2 block text-sm text-slate-400"
                >
                  Footer note
                </label>

                <textarea
                  id="quotation-footer-note"
                  rows={5}
                  maxLength={1000}
                  value={
                    quotationFooterNote
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuotationFooterNote(
                      event.target.value,
                    )
                  }
                  className="qufo-input resize-y"
                  placeholder="Thank you for your business. We look forward to working with you."
                />

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-600">
                    Short closing message
                    shown near the bottom
                    of printed quotations.
                  </p>

                  <span className="text-xs text-slate-700">
                    {
                      quotationFooterNote.length
                    }
                    /1000
                  </span>
                </div>
              </div>
            </div>
          </div>

            
            <QuotationSignatureSettings
              signatureUrl={
                settings
                  .quotationSignatureUrl
              }
              name={
                quotationSignatoryName
              }
              title={
                quotationSignatoryTitle
              }
              enabled={
                showQuotationSignature
              }
              uploading={
                uploadingSignature
              }
              removing={
                removingSignature
              }
              disabled={
                saving ||
                savingSignature
              }
              onNameChange={
                setQuotationSignatoryName
              }
              onTitleChange={
                setQuotationSignatoryTitle
              }
              onEnabledChange={
                setShowQuotationSignature
              }
              onUpload={
                onUploadSignature
              }
              onRemove={
                onRemoveSignature
              }
            />
        </div>


        {error && (
          <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--qufo-border)] px-6 py-5">
        <button
          type="submit"
          disabled={
            formSaving
          }
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {formSaving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save
              size={16}
            />
          )}

          {formSaving
            ? "Saving..."
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}