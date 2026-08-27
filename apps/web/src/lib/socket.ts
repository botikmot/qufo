import {
  io,
  type Socket,
} from "socket.io-client";

import {
  getAuthSession,
} from "@/lib/auth-storage";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/realtime";

type RealtimeSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "http://localhost:3001";

let socket:
  | RealtimeSocket
  | null = null;

let connectedOrganizationId:
  | string
  | null = null;

function createSocket() {
  return io(
    `${SOCKET_URL}/realtime`,
    {
      autoConnect: false,

      withCredentials: true,

      reconnection: true,

      reconnectionAttempts:
        Infinity,

      reconnectionDelay:
        1000,

      reconnectionDelayMax:
        5000,
    },
  );
}

export function getRealtimeSocket() {
  if (!socket) {
    socket =
      createSocket();
  }

  return socket;
}

export function connectRealtimeSocket() {
  const session =
    getAuthSession();

  if (!session) {
    return null;
  }

  const realtimeSocket =
    getRealtimeSocket();

  const organizationId =
    session.organization.id;

  /*
   * If the user switched workspace,
   * reconnect so the backend joins
   * the correct organization room.
   */
  if (
    connectedOrganizationId &&
    connectedOrganizationId !==
      organizationId
  ) {
    realtimeSocket.disconnect();

    connectedOrganizationId =
      null;
  }

  realtimeSocket.auth = {
    token:
      session.accessToken,

    organizationId,
  };

  connectedOrganizationId =
    organizationId;

  if (
    !realtimeSocket.connected
  ) {
    realtimeSocket.connect();
  }

  return realtimeSocket;
}

export function disconnectRealtimeSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();

  connectedOrganizationId =
    null;
}