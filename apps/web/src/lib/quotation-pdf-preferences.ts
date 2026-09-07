export type QuotationPdfPreferences = {
  showSubject: boolean;
  showMessage: boolean;
  showAcceptedConforme: boolean;
};

export const DEFAULT_QUOTATION_PDF_PREFERENCES: QuotationPdfPreferences = {
  showSubject: true,
  showMessage: true,
  showAcceptedConforme: true,
};

const STORAGE_KEY = "qufo:quotation-pdf-preferences";

export function getQuotationPdfPreferences(): QuotationPdfPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_QUOTATION_PDF_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_QUOTATION_PDF_PREFERENCES;
    }

    const parsed = JSON.parse(stored);

    return {
      showSubject:
        typeof parsed.showSubject === "boolean"
          ? parsed.showSubject
          : DEFAULT_QUOTATION_PDF_PREFERENCES.showSubject,

      showMessage:
        typeof parsed.showMessage === "boolean"
          ? parsed.showMessage
          : DEFAULT_QUOTATION_PDF_PREFERENCES.showMessage,

      showAcceptedConforme:
        typeof parsed.showAcceptedConforme === "boolean"
          ? parsed.showAcceptedConforme
          : DEFAULT_QUOTATION_PDF_PREFERENCES.showAcceptedConforme,
    };
  } catch {
    return DEFAULT_QUOTATION_PDF_PREFERENCES;
  }
}

export function saveQuotationPdfPreferences(
  preferences: QuotationPdfPreferences,
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences),
  );
}