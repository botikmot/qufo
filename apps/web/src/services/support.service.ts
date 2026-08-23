import {
  apiFetch,
} from "@/lib/api";

import type {
  SendSupportMessageData,
  SendSupportMessageResponse,
} from "@/types/support";

export const supportService = {
  send(
    data: SendSupportMessageData,
  ) {
    return apiFetch<SendSupportMessageResponse>(
      "/support/contact",
      {
        method: "POST",

        body: JSON.stringify(
          data,
        ),
      },
    );
  },
};