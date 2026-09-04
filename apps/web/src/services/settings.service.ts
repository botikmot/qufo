import {
  apiFetch,
} from "@/lib/api";

import type {
  BusinessSettings,
  ProfileSettings,
  UpdateBusinessSettingsData,
  //UpdateBusinessSettingsResponse,
  UpdateProfileSettingsData,
  UpdateProfileSettingsResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  UploadProfilePhotoResponse,
  RemoveProfilePhotoResponse,
  UpdateQuotationSignatureSettingsData,
  UploadQuotationSignatureResponse,
} from "@/types/settings";

import type { 
  SubscriptionSettings, 
  SubscriptionBillingSummary, 
  SubscriptionCheckoutResponse, 
  SubscriptionPaymentHistoryResponse,
  CapturePayPalSubscriptionResponse,
  RedeemAppSumoCodeResponse,
} from "@/types/subscription";

export const settingsService = {
  getBusiness() {
    return apiFetch<BusinessSettings>(
      "/organizations/current",
    );
  },

  updateBusiness(
    data: UpdateBusinessSettingsData,
  ) {
    return apiFetch<BusinessSettings>(
      "/organizations/current",
      {
        method: "PATCH",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  getProfile() {
    return apiFetch<ProfileSettings>(
      "/settings/profile",
    );
  },

  updateProfile(
    data: UpdateProfileSettingsData,
  ) {
    return apiFetch<UpdateProfileSettingsResponse>(
      "/settings/profile",
      {
        method: "PATCH",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  getSubscription() {
    return apiFetch<SubscriptionSettings>(
      "/settings/subscription",
    );
  },

  changePassword(
    data: ChangePasswordData,
  ) {
    return apiFetch<ChangePasswordResponse>(
      "/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  uploadProfilePhoto(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    return apiFetch<UploadProfilePhotoResponse>(
      "/settings/profile/avatar",
      {
        method: "POST",

        body: formData,
      },
    );
  },

  removeProfilePhoto() {
    return apiFetch<RemoveProfilePhotoResponse>(
      "/settings/profile/avatar",
      {
        method: "DELETE",
      },
    );
  },

  async getSubscriptionBilling() {
    return apiFetch<SubscriptionBillingSummary>(
      "/subscriptions/billing",
    );
  },

  async createSubscriptionCheckout(
    provider:
      | "PAYMONGO"
      | "PAYPAL",
  ) {
    return apiFetch<SubscriptionCheckoutResponse>(
      "/subscriptions/billing/checkout",
      {
        method: "POST",

        body: JSON.stringify({
          provider,
        }),
      },
    );
  },

  async getSubscriptionPayments() {
    return apiFetch<SubscriptionPaymentHistoryResponse>(
      "/subscriptions/billing/payments",
    );
  },

  async capturePayPalSubscription(
    orderId: string,
  ) {
    return apiFetch<CapturePayPalSubscriptionResponse>(
      "/subscriptions/billing/paypal/capture",
      {
        method: "POST",

        body: JSON.stringify({
          orderId,
        }),
      },
    );
  },

  async uploadBusinessLogo(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return apiFetch<{
      logoUrl: string | null;
    }>("/settings/business/logo", {
      method: "PATCH",
      body: formData,
    });
  },

  async removeBusinessLogo() {
    return apiFetch<{
      removed: boolean;
    }>("/settings/business/logo", {
      method: "DELETE",
    });
  },

  async uploadQuotationSignature(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    return apiFetch<UploadQuotationSignatureResponse>(
      "/settings/quotation-signature",
      {
        method: "POST",
        body: formData,
      },
    );
  },

  async updateQuotationSignature(
    data: UpdateQuotationSignatureSettingsData,
  ) {
    return apiFetch<UploadQuotationSignatureResponse>(
      "/settings/quotation-signature",
      {
        method: "PATCH",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },

  async removeQuotationSignature() {
    return apiFetch<{
      removed: boolean;
    }>(
      "/settings/quotation-signature",
      {
        method: "DELETE",
      },
    );
  },

  async redeemAppSumoCode(
    code: string,
  ) {
    return apiFetch<RedeemAppSumoCodeResponse>(
      "/appsumo/redeem",
      {
        method: "POST",

        body: JSON.stringify({
          code:
            code.trim(),
        }),
      },
    );
  },

};