export type BusinessSettings = {
  id: string;

  name: string;
  slug: string;

  businessType: string | null;

  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  quotationTerms: string | null;
  quotationFooterNote: string | null;

  quotationSignatureUrl: string | null;

  quotationSignatoryName: string | null;

  quotationSignatoryTitle: string | null;

  showQuotationSignature: boolean;

  countryCode: string | null;

  currency: string;

  currencyLocked: boolean;

  status: string;

  createdAt?: string;
  updatedAt: string;
};

export type UpdateBusinessSettingsData = {
  name?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  address?: string;
  quotationTerms?: string | null;
  quotationFooterNote?: string | null;

  countryCode?: string;
  currency?: string;
};

export type UpdateBusinessSettingsResponse = {
  message: string;

  organization: BusinessSettings;
};

export type ProfileSettings = {
  id: string;
  name: string;
  email: string;

  phone:
    | string
    | null;

  avatarUrl:
    | string
    | null;

  status: string;

  emailVerifiedAt:
    | string
    | null;

  lastLoginAt:
    | string
    | null;

  createdAt?: string;
  updatedAt: string;

  security: {
    hasPassword: boolean;
    googleLinked: boolean;
  };
};

export type UpdateProfileSettingsData = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};

export type UpdateProfileSettingsResponse = {
  message: string;

  profile: ProfileSettings;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export type UploadProfilePhotoResponse = {
  message: string;
  avatarUrl: string;
};

export type RemoveProfilePhotoResponse = {
  message: string;
};

export type UpdateQuotationSignatureSettingsData = {
  quotationSignatoryName:
    string;

  quotationSignatoryTitle:
    string;

  showQuotationSignature:
    boolean;
};

export type UploadQuotationSignatureResponse = {
  quotationSignatureUrl:
    string | null;

  quotationSignatoryName:
    string | null;

  quotationSignatoryTitle:
    string | null;

  showQuotationSignature:
    boolean;
};