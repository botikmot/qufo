import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client | null;

  private readonly clientId: string | null;

  constructor(private readonly configService: ConfigService) {
    /*
     * Self-hosted installations may run
     * without Google authentication.
     */
    if (!this.googleAuthEnabled) {
      this.client = null;
      this.clientId = null;

      return;
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new Error(
        'GOOGLE_CLIENT_ID is required when GOOGLE_AUTH_ENABLED=true.',
      );
    }

    this.clientId = clientId;

    this.client = new OAuth2Client(clientId);
  }

  private get googleAuthEnabled(): boolean {
    const value = this.configService.get<string>('GOOGLE_AUTH_ENABLED');

    /*
     * Default ON for backward compatibility.
     *
     * Only explicit false disables Google auth.
     */
    return value?.trim().toLowerCase() !== 'false';
  }

  async verifyCredential(credential: string) {
    if (!this.googleAuthEnabled || !this.client || !this.clientId) {
      throw new NotFoundException(
        'Google authentication is not available in this deployment.',
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new UnauthorizedException(
          'Google account could not be verified.',
        );
      }

      return {
        googleId: payload.sub,

        email: payload.email.trim().toLowerCase(),

        name: payload.name?.trim() || payload.email,

        picture: payload.picture ?? null,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google credential.');
    }
  }
}
