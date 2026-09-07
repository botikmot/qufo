export type MainBusinessProfile = {
  id: null;
  type: "ORGANIZATION";

  label: string;
  name: string;

  email: string | null;
  phone: string | null;
  address: string | null;

  logoUrl: string | null;

  quotationTerms: string | null;
  quotationFooterNote: string | null;

  isDefault: boolean;
};

export type BusinessProfile = {
  id: string;
  type: "BUSINESS_PROFILE";

  label: string;
  name: string;

  email: string | null;
  phone: string | null;
  address: string | null;

  logoUrl: string | null;

  quotationTerms: string | null;
  quotationFooterNote: string | null;

  isDefault: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type BusinessProfilesResponse = {
  mainBusiness: MainBusinessProfile;
  profiles: BusinessProfile[];
};

export type BusinessOption =
  | MainBusinessProfile
  | BusinessProfile;


export type CreateBusinessProfileData = {
  label: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  quotationTerms?: string | null;
  quotationFooterNote?: string | null;
  isDefault?: boolean;
};

export type UpdateBusinessProfileData =
  Partial<CreateBusinessProfileData>;