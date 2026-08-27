import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';

import { Server, Socket } from 'socket.io';

import { PrismaService } from '../prisma/prisma.service';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

type QuotationUpdatedEvent = {
  quotationId: string;
  quotationNumber: string;
  status: string;

  customerResponseNote?: string | null;

  respondedAt?: Date | null;
};

type ServerToClientEvents = {
  'quotation.updated': (event: QuotationUpdatedEvent) => void;
};

type ClientToServerEvents = Record<string, never>;

type InterServerEvents = Record<string, never>;

type RealtimeSocketData = {
  userId?: string;
  organizationId?: string;
};

type RealtimeSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  RealtimeSocketData
>;

type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  RealtimeSocketData
>;

type SocketAuth = {
  token: string;
  organizationId: string;
};

@WebSocketGateway({
  namespace: '/realtime',

  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: RealtimeServer;

  constructor(
    private readonly prisma: PrismaService,

    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: RealtimeSocket) {
    try {
      const auth = this.parseSocketAuth(client.handshake.auth);

      if (!auth) {
        client.disconnect(true);

        return;
      }

      const { token, organizationId } = auth;

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: payload.sub,
          },
        },

        select: {
          id: true,
          isActive: true,
        },
      });

      if (!membership || !membership.isActive) {
        client.disconnect(true);

        return;
      }

      client.data.userId = payload.sub;

      client.data.organizationId = organizationId;

      await client.join(this.getOrganizationRoom(organizationId));
    } catch {
      client.disconnect(true);
    }
  }

  emitQuotationUpdated(organizationId: string, event: QuotationUpdatedEvent) {
    this.server
      .to(this.getOrganizationRoom(organizationId))
      .emit('quotation.updated', event);
  }

  private parseSocketAuth(value: unknown): SocketAuth | null {
    if (typeof value !== 'object' || value === null) {
      return null;
    }

    const auth = value as Record<string, unknown>;

    const token = auth.token;

    const organizationId = auth.organizationId;

    if (
      typeof token !== 'string' ||
      !token ||
      typeof organizationId !== 'string' ||
      !organizationId
    ) {
      return null;
    }

    return {
      token,
      organizationId,
    };
  }

  private getOrganizationRoom(organizationId: string) {
    return `organization:${organizationId}`;
  }
}
