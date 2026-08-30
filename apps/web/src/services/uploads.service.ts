import {
  apiFetch,
} from "@/lib/api";

export type UploadQuotationItemImageResponse = {
  url: string;
  imageKey: string;
};

export const uploadsService = {
  uploadQuotationItemImage(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    return apiFetch<UploadQuotationItemImageResponse>(
      "/uploads/quotation-item-image",
      {
        method: "POST",
        body: formData,
      },
    );
  },
};