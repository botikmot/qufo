"use client";

import {
  useEffect,
} from "react";

import {
  connectRealtimeSocket,
} from "@/lib/socket";

import type {
  QuotationUpdatedEvent,
} from "@/types/realtime";

type UseQuotationRealtimeOptions = {
  onUpdated: (
    event: QuotationUpdatedEvent,
  ) => void;
};

export function useQuotationRealtime({
  onUpdated,
}: UseQuotationRealtimeOptions) {
  useEffect(() => {
    const socket =
      connectRealtimeSocket();

    if (!socket) {
      return;
    }

    socket.on(
      "quotation.updated",
      onUpdated,
    );

    return () => {
      socket.off(
        "quotation.updated",
        onUpdated,
      );
    };
  }, [onUpdated]);
}