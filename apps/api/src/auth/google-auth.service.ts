import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;

  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');

    this.client = new OAuth2Client(this.clientId);
  }

  async verifyCredential(credential: string) {
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
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid Google credential.');
    }
  }
}
