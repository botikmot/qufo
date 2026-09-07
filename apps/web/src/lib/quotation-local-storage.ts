export const DEFAULT_QUOTATION_MESSAGE =
  "We are pleased to quote to you the following items for your consideration and approval.";

const QUOTATION_SUBJECT_STORAGE_PREFIX =
  "qufo:quotation-subject:";

const QUOTATION_MESSAGE_STORAGE_PREFIX =
  "qufo:quotation-message:";

export function getQuotationSubjectStorageKey(
  businessProfileId?: string | null,
) {
  return `${QUOTATION_SUBJECT_STORAGE_PREFIX}${
    businessProfileId ?? "main"
  }`;
}

export function getQuotationMessageStorageKey(
  businessProfileId?: string | null,
) {
  return `${QUOTATION_MESSAGE_STORAGE_PREFIX}${
    businessProfileId ?? "main"
  }`;
}

export function getRememberedQuotationSubject(
  businessProfileId?: string | null,
) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return (
      window.localStorage.getItem(
        getQuotationSubjectStorageKey(
          businessProfileId,
        ),
      ) ?? ""
    );
  } catch {
    return "";
  }
}

export function getRememberedQuotationMessage(
  businessProfileId?: string | null,
) {
  if (typeof window === "undefined") {
    return DEFAULT_QUOTATION_MESSAGE;
  }

  try {
    return (
      window.localStorage.getItem(
        getQuotationMessageStorageKey(
          businessProfileId,
        ),
      ) ?? DEFAULT_QUOTATION_MESSAGE
    );
  } catch {
    return DEFAULT_QUOTATION_MESSAGE;
  }
}

export function rememberQuotationSubject(
  businessProfileId: string | null | undefined,
  subject: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key =
      getQuotationSubjectStorageKey(
        businessProfileId,
      );

    if (subject.trim()) {
      window.localStorage.setItem(
        key,
        subject,
      );
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore localStorage failures.
  }
}

export function rememberQuotationMessage(
  businessProfileId: string | null | undefined,
  message: string,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key =
      getQuotationMessageStorageKey(
        businessProfileId,
      );

    if (message.trim()) {
      window.localStorage.setItem(
        key,
        message,
      );
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore localStorage failures.
  }
}