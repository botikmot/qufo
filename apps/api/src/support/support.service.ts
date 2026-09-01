import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import {
  SendSupportMessageDto,
  SupportMessageType,
} from './dto/send-support-message.dto';

import { Resend } from 'resend';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(
    user: JwtPayload,
    tenant: TenantContext,
    dto: SendSupportMessageDto,
  ) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },

      select: {
        name: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }

    const smtpHost = this.configService.get<string>('SMTP_HOST');

    const smtpUser = this.configService.get<string>('SMTP_USER');

    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    const from = this.configService.get<string>('SMTP_FROM');

    const supportEmail = this.configService.get<string>('QUFO_SUPPORT_EMAIL');

    if (!smtpHost || !smtpUser || !smtpPassword || !from || !supportEmail) {
      throw new InternalServerErrorException(
        'Support email is not configured.',
      );
    }

    const resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );

    const typeLabel = this.getTypeLabel(dto.type);

    const { error } = await resend.emails.send({
      from:
        this.configService.get<string>('MAIL_FROM') ??
        'QUFO <no-reply@qufo.im>',

      to: supportEmail,

      replyTo: currentUser.email,

      subject: `[QUFO ${typeLabel}] ${dto.subject.trim()}`,

      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>QUFO ${typeLabel}</h2>

        <p>
          <strong>From:</strong>
          ${this.escapeHtml(currentUser.name)}
        </p>

        <p>
          <strong>Email:</strong>
          ${this.escapeHtml(currentUser.email)}
        </p>

        <p>
          <strong>Business:</strong>
          ${this.escapeHtml(tenant.organizationName)}
        </p>

        <hr />

        <p>
          <strong>Subject:</strong>
          ${this.escapeHtml(dto.subject.trim())}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <p style="white-space: pre-wrap;">
          ${this.escapeHtml(dto.message.trim())}
        </p>
      </div>
    `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send your message right now.',
      );
    }

    return {
      message: 'Your message has been sent successfully.',
    };
  }

  private getTypeLabel(type: SupportMessageType) {
    switch (type) {
      case SupportMessageType.BUG:
        return 'Bug Report';

      case SupportMessageType.FEATURE:
        return 'Feature Suggestion';

      default:
        return 'General Inquiry';
    }
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
