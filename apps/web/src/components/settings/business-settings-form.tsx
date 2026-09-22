"use client";

import {
  Building2,
  CheckCircle2,
  CheckSquare2,
  FileText,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Save,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { FormEvent, useState } from "react";

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

import { BusinessLogoUpload } from "./business-logo-upload";

import { QuotationSignatureSettings } from "./quotation-signature-settings";

import { CustomerEmailNotificationsSettings } from "./customer-email-notifications-settings";

import { BusinessProfilesSection } from "@/components/settings/business-profiles-section";

import {
  QuotationPdfPreferences,
  getQuotationPdfPreferences,
  saveQuotationPdfPreferences,
} from "@/lib/quotation-pdf-preferences";

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

  onSave: (data: UpdateBusinessSettingsData) => Promise<boolean>;

  onUploadLogo: (file: File) => Promise<boolean>;

  onRemoveLogo: () => Promise<boolean>;

  onUploadSignature: (file: File) => Promise<boolean>;

  onRemoveSignature: () => Promise<boolean>;

  onSaveSignature: (
    data: UpdateQuotationSignatureSettingsData,
  ) => Promise<boolean>;
};

export function BusinessSettingsForm({
  settings,
  saving,
  uploadingLogo,
  removingLogo,
  error,
  success,
  uploadingSignature,
  removingSignature,
  savingSignature,
  onSave,
  onUploadLogo,
  onRemoveLogo,
  onUploadSignature,
  onRemoveSignature,
  onSaveSignature,
}: BusinessSettingsFormProps) {
  const [name, setName] = useState(settings.name);

  const [businessType, setBusinessType] = useState(settings.businessType ?? "");

  const [email, setEmail] = useState(settings.email ?? "");

  const [phone, setPhone] = useState(settings.phone ?? "");

  const [address, setAddress] = useState(settings.address ?? "");

  const [countryCode, setCountryCode] = useState(settings.countryCode ?? "PH");

  const [currency, setCurrency] = useState(settings.currency ?? "PHP");

  const [quotationTerms, setQuotationTerms] = useState(
    settings.quotationTerms ?? "",
  );

  const [quotationFooterNote, setQuotationFooterNote] = useState(
    settings.quotationFooterNote ?? "",
  );

  const [quotationPdfPreferences, setQuotationPdfPreferences] =
    useState<QuotationPdfPreferences>(() => getQuotationPdfPreferences());

  const [
    customerEmailNotificationsEnabled,
    setCustomerEmailNotificationsEnabled,
  ] = useState(settings.customerEmailNotificationsEnabled);

  const [quotationSignatoryName, setQuotationSignatoryName] = useState(
    settings.quotationSignatoryName ?? "",
  );

  const [quotationSignatoryTitle, setQuotationSignatoryTitle] = useState(
    settings.quotationSignatoryTitle ?? "",
  );

  const [showQuotationSignature, setShowQuotationSignature] = useState(
    Boolean(settings.showQuotationSignature && settings.quotationSignatureUrl),
  );

  function updateQuotationPdfPreference(
    key: keyof typeof quotationPdfPreferences,
    value: boolean,
  ) {
    const next = {
      ...quotationPdfPreferences,
      [key]: value,
    };

    setQuotationPdfPreferences(next);

    saveQuotationPdfPreferences(next);
  }

  function handleCountryChange(value: string) {
    setCountryCode(value);

    if (settings.currencyLocked) {
      return;
    }

    const country = BUSINESS_COUNTRIES.find((item) => item.code === value);

    if (country) {
      setCurrency(country.currency);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const businessSaved = await onSave({
      name,

      businessType,

      email,

      phone,

      address,

      countryCode,

      currency,

      quotationTerms,

      quotationFooterNote,

      ...(settings.emailNotificationsAvailable && {
        customerEmailNotificationsEnabled,
      }),
    });

    if (!businessSaved) {
      return;
    }

    await onSaveSignature({
      quotationSignatoryName: quotationSignatoryName.trim(),

      quotationSignatoryTitle: quotationSignatoryTitle.trim(),

      showQuotationSignature,
    });
  }

  const formSaving = saving || savingSignature;

  return (
    <>
      {/* =========================================================
          STATUS TOAST
      ========================================================= */}

      {(error || success) && (
        <div className="pointer-events-none fixed inset-x-4 top-20 z-[200] flex justify-center sm:justify-end">
          <div
            role={error ? "alert" : "status"}
            className={[
              "flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl",

              error
                ? "border-red-400/20 bg-[#1a0d16]/95 text-red-200"
                : "border-emerald-400/20 bg-[#071a19]/95 text-emerald-200",
            ].join(" ")}
          >
            {error ? (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            )}

            <span>{error ?? success}</span>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN FORM
      ========================================================= */}

      <form
        onSubmit={handleSubmit}
        className="qufo-surface min-w-0 overflow-hidden rounded-2xl"
      >
        {/* =======================================================
            FORM HEADER
        ======================================================= */}

        <div className="border-b border-[var(--qufo-border)] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
              <Building2 size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="font-medium text-white">Business profile</h2>

              <p className="mt-1 text-xs text-slate-500">
                Information used throughout your QUFO workspace.
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            TWO COLUMN WORKSPACE
        ======================================================= */}

        <div className="grid min-w-0 gap-5 p-5 sm:p-6 lg:grid-cols-2">
          {/* =====================================================
              LEFT COLUMN
          ===================================================== */}

          <div className="min-w-0 space-y-5">
            {/* ---------------------------------------------------
                BUSINESS IDENTITY
            --------------------------------------------------- */}

            <section className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] p-5">
              <div className="mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/[0.07] text-cyan-300">
                    <Building2 size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      Business identity
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-600">
                      Your workspace branding and contact details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo */}

              <div className="mb-5">
                <BusinessLogoUpload
                  businessName={name}
                  logoUrl={settings.logoUrl}
                  uploading={uploadingLogo}
                  removing={removingLogo}
                  onUpload={onUploadLogo}
                  onRemove={onRemoveLogo}
                />
              </div>

              {/* Name / Type */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
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
                    onChange={(event) => setName(event.target.value)}
                    className="qufo-input"
                    placeholder="Your business name"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="business-type"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Business type
                  </label>

                  <input
                    id="business-type"
                    value={businessType}
                    onChange={(event) => setBusinessType(event.target.value)}
                    className="qufo-input"
                    placeholder="Printing, signage, fabrication..."
                  />
                </div>
              </div>

              {/* Email / Phone */}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
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
                      onChange={(event) => setEmail(event.target.value)}
                      className="qufo-input qufo-input-with-icon"
                      placeholder="hello@business.com"
                    />
                  </div>
                </div>

                <div className="min-w-0">
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
                      onChange={(event) => setPhone(event.target.value)}
                      className="qufo-input qufo-input-with-icon"
                      placeholder="+63..."
                    />
                  </div>
                </div>
              </div>

              {/* Address */}

              <div className="mt-5">
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
                    onChange={(event) => setAddress(event.target.value)}
                    className="qufo-input qufo-input-with-icon resize-none"
                    placeholder="Business address..."
                  />
                </div>
              </div>

              {/* Country / Currency */}

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
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
                        {BUSINESS_COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Used to suggest the appropriate business currency.
                  </p>
                </div>

                <div className="min-w-0">
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
                      disabled={settings.currencyLocked}
                    >
                      <SelectTrigger
                        id="business-currency"
                        className="w-full pl-10 pr-10"
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>

                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code}
                            {" — "}
                            {item.name}
                          </SelectItem>
                        ))}
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
                      Currency is locked because this workspace already contains
                      quotations.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600">
                      Currency becomes locked after your first quotation is
                      created.
                    </p>
                  )}
                </div>
              </div>

              {/* Email notifications */}

              {settings.emailNotificationsAvailable && (
                <div className="mt-5 border-t border-[var(--qufo-border)] pt-5">
                  <CustomerEmailNotificationsSettings
                    enabled={customerEmailNotificationsEnabled}
                    disabled={saving}
                    onChange={setCustomerEmailNotificationsEnabled}
                  />
                </div>
              )}
              {/* ---------------------------------------------------
                  ADDITIONAL BUSINESS PROFILES
              --------------------------------------------------- */}

              <div className="border-t border-[var(--qufo-border)] pt-5">
                <BusinessProfilesSection />
              </div>
            </section>
          </div>

          {/* =====================================================
              RIGHT COLUMN
          ===================================================== */}

          <div className="min-w-0 space-y-5">
            {/* ---------------------------------------------------
                QUOTATION DEFAULTS
            --------------------------------------------------- */}

            <section className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] p-5">
              <div className="mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-emerald-300">
                    <FileText size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      Quotation defaults
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-600">
                      Default content used in printable quotation documents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                {/* Terms */}

                <div className="min-w-0">
                  <label
                    htmlFor="quotation-terms"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Terms &amp; Conditions
                  </label>

                  <textarea
                    id="quotation-terms"
                    rows={5}
                    maxLength={5000}
                    value={quotationTerms}
                    onChange={(event) => setQuotationTerms(event.target.value)}
                    className="qufo-input resize-y"
                    placeholder={`Quotation validity: 30 days.
50% downpayment upon approval.
Balance payable upon completion.
Lead time is subject to material availability.`}
                  />

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                      Appears below the quotation totals.
                    </p>

                    <span className="shrink-0 text-xs text-slate-700">
                      {quotationTerms.length}
                      /5000
                    </span>
                  </div>
                </div>

                {/* Footer note */}

                <div className="min-w-0">
                  <label
                    htmlFor="quotation-footer-note"
                    className="mb-2 block text-sm text-slate-400"
                  >
                    Footer note
                  </label>

                  <textarea
                    id="quotation-footer-note"
                    rows={4}
                    maxLength={1000}
                    value={quotationFooterNote}
                    onChange={(event) =>
                      setQuotationFooterNote(event.target.value)
                    }
                    className="qufo-input resize-y"
                    placeholder="Thank you for your business. We look forward to working with you."
                  />

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                      Short closing message shown near the bottom of printed
                      quotations.
                    </p>

                    <span className="shrink-0 text-xs text-slate-700">
                      {quotationFooterNote.length}
                      /1000
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------
                PDF DISPLAY
            --------------------------------------------------- */}

            <section className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] p-5">
              <div className="mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/[0.07] text-cyan-300">
                    <FileText size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      Quotation PDF display
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-slate-600">
                      Choose which optional sections appear on generated
                      quotation PDFs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Details */}

                <button
                  type="button"
                  onClick={() =>
                    updateQuotationPdfPreference(
                      "showQuotationDetails",
                      !quotationPdfPreferences.showQuotationDetails,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={16} className="shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">
                        Show quotation details
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-600">
                        Display QUOTATION, quotation number, revision, and
                        dates.
                      </p>
                    </div>
                  </div>

                  <div
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full transition",
                      quotationPdfPreferences.showQuotationDetails
                        ? "bg-emerald-400"
                        : "bg-slate-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 size-4 rounded-full bg-white transition",
                        quotationPdfPreferences.showQuotationDetails
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {/* Subject */}

                <button
                  type="button"
                  onClick={() =>
                    updateQuotationPdfPreference(
                      "showSubject",
                      !quotationPdfPreferences.showSubject,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={16} className="shrink-0 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">Show subject</p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-600">
                        Display the quotation subject when provided.
                      </p>
                    </div>
                  </div>

                  <div
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full transition",
                      quotationPdfPreferences.showSubject
                        ? "bg-emerald-400"
                        : "bg-slate-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 size-4 rounded-full bg-white transition",
                        quotationPdfPreferences.showSubject
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {/* Message */}

                <button
                  type="button"
                  onClick={() =>
                    updateQuotationPdfPreference(
                      "showMessage",
                      !quotationPdfPreferences.showMessage,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MessageSquareText
                      size={16}
                      className="shrink-0 text-slate-500"
                    />

                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">
                        Show quotation message
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-600">
                        Display the introductory message above the items.
                      </p>
                    </div>
                  </div>

                  <div
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full transition",
                      quotationPdfPreferences.showMessage
                        ? "bg-emerald-400"
                        : "bg-slate-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 size-4 rounded-full bg-white transition",
                        quotationPdfPreferences.showMessage
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </div>
                </button>

                {/* Accepted / Conforme */}

                <button
                  type="button"
                  onClick={() =>
                    updateQuotationPdfPreference(
                      "showAcceptedConforme",
                      !quotationPdfPreferences.showAcceptedConforme,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--qufo-border)] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CheckSquare2
                      size={16}
                      className="shrink-0 text-slate-500"
                    />

                    <div className="min-w-0">
                      <p className="text-sm text-slate-200">
                        Show ACCEPTED / CONFORME
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-600">
                        Display the customer acceptance section.
                      </p>
                    </div>
                  </div>

                  <div
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full transition",
                      quotationPdfPreferences.showAcceptedConforme
                        ? "bg-emerald-400"
                        : "bg-slate-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 size-4 rounded-full bg-white transition",
                        quotationPdfPreferences.showAcceptedConforme
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </div>
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] px-4 py-3">
                <p className="text-xs leading-5 text-slate-500">
                  These preferences are saved only in this browser and do not
                  affect your quotation data.
                </p>
              </div>
            </section>

            {/* ---------------------------------------------------
                SIGNATURE
            --------------------------------------------------- */}

            <section className="rounded-2xl border border-[var(--qufo-border)] bg-white/[0.012] p-5">
              <QuotationSignatureSettings
                signatureUrl={settings.quotationSignatureUrl}
                name={quotationSignatoryName}
                title={quotationSignatoryTitle}
                enabled={showQuotationSignature}
                uploading={uploadingSignature}
                removing={removingSignature}
                disabled={saving || savingSignature}
                onNameChange={setQuotationSignatoryName}
                onTitleChange={setQuotationSignatoryTitle}
                onEnabledChange={setShowQuotationSignature}
                onUpload={onUploadSignature}
                onRemove={onRemoveSignature}
              />
            </section>
          </div>
        </div>

        {/* =======================================================
            INLINE ERROR / SUCCESS
        ======================================================= */}

        {(error || success) && (
          <div className="border-t border-[var(--qufo-border)] px-5 py-4 sm:px-6">
            {error && (
              <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {!error && success && (
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            SAVE BAR
        ======================================================= */}

        <div className="flex flex-col gap-3 border-t border-[var(--qufo-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-xs text-slate-600">
              Changes apply across your QUFO workspace.
            </p>
          </div>

          <button
            type="submit"
            disabled={formSaving}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {formSaving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}

            {formSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}
