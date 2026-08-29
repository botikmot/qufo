import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Resend } from 'resend';

type SendPasswordResetParams = {
  to: string;
  name: string;
  resetUrl: string;
};

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private getResend() {
    return new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
  }

  private getFromAddress() {
    return this.configService.getOrThrow<string>('RESEND_FROM');
  }

  async sendPasswordReset({ to, name, resetUrl }: SendPasswordResetParams) {
    const resend = this.getResend();

    const { error } = await resend.emails.send({
      from: this.getFromAddress(),

      to,

      subject: 'Reset your QUFO password',

      html: `
        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 32px 20px;
            color: #171717;
          "
        >
          <h1
            style="
              margin: 0 0 24px;
              font-size: 24px;
              line-height: 1.3;
            "
          >
            Reset your QUFO password
          </h1>

          <p style="margin: 0 0 16px;">
            Hi ${this.escapeHtml(name)},
          </p>

          <p style="margin: 0 0 24px; line-height: 1.6;">
            We received a request to reset the password for your
            QUFO account.
          </p>

          <p style="margin: 0 0 28px;">
            <a
              href="${this.escapeHtml(resetUrl)}"
              style="
                display: inline-block;
                background: #111827;
                color: #ffffff;
                padding: 12px 20px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
              "
            >
              Reset password
            </a>
          </p>

          <p
            style="
              margin: 0 0 16px;
              color: #525252;
              line-height: 1.6;
            "
          >
            This link will expire in 30 minutes.
          </p>

          <p
            style="
              margin: 0 0 24px;
              color: #525252;
              line-height: 1.6;
            "
          >
            If you didn't request a password reset, you can safely
            ignore this email.
          </p>

          <hr
            style="
              border: 0;
              border-top: 1px solid #e5e7eb;
              margin: 28px 0;
            "
          />

          <p
            style="
              margin: 0;
              color: #737373;
              font-size: 13px;
            "
          >
            QUFO — From quotation to payment, in one quick flow.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the password reset email right now.',
      );
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
