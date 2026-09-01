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

      /*
       * Use WebSocket directly.
       *
       * This avoids stale Engine.IO
       * polling session IDs after
       * backend restarts/reconnects.
       */
      transports: [
        "websocket",
      ],

      /*
       * IMPORTANT:
       *
       * This runs again every time
       * Socket.IO connects/reconnects,
       * so we always send the latest
       * access token.
       */
      auth: (callback) => {
        const session =
          getAuthSession();

        if (!session) {
          callback({});

          return;
        }

        callback({
          token:
            session.accessToken,

          organizationId:
            session.organization.id,
        });
      },

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
    disconnectRealtimeSocket();

    return null;
  }

  const realtimeSocket =
    getRealtimeSocket();

  const organizationId =
    session.organization.id;

  /*
   * If the user changed workspace,
   * disconnect first.
   *
   * The auth callback above will
   * automatically use the new
   * organization on reconnect.
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