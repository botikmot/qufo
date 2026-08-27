export type QuotationUpdatedEvent = {
  quotationId: string;
  quotationNumber: string;
  status: string;

  customerResponseNote:
    string | null;

  respondedAt:
    string | null;
};

export type ServerToClientEvents = {
  "quotation.updated": (
    event: QuotationUpdatedEvent,
  ) => void;
};

export type ClientToServerEvents =
  Record<string, never>;