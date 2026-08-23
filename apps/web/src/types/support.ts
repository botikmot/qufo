export type SupportMessageType =
  | "GENERAL"
  | "BUG"
  | "FEATURE";

export type SendSupportMessageData = {
  type: SupportMessageType;
  subject: string;
  message: string;
};

export type SendSupportMessageResponse = {
  message: string;
};