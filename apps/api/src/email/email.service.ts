import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Resend } from 'resend';

type SendPasswordResetParams = {
  to: string;
  name: string;
  resetUrl: string;
};

type SendTeamInvitationParams = {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  invitationUrl: string;
  expiresInDays: number;
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

          ${this.footerHtml()}
        </div>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the password reset email right now.',
      );
    }
  }

  async sendTeamInvitation({
    to,
    organizationName,
    inviterName,
    role,
    invitationUrl,
    expiresInDays,
  }: SendTeamInvitationParams) {
    const resend = this.getResend();

    const safeOrganizationName = this.escapeHtml(organizationName);

    const roleLabel = this.formatRole(role);

    const { error } = await resend.emails.send({
      from: this.getFromAddress(),
      to,
      subject: `${inviterName} invited you to ${organizationName} on QUFO`,

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
            Join ${safeOrganizationName} on QUFO
          </h1>

          <p style="margin: 0 0 16px; line-height: 1.6;">
            ${this.escapeHtml(inviterName)} invited you to join
            <strong>${safeOrganizationName}</strong> as
            <strong>${this.escapeHtml(roleLabel)}</strong>.
          </p>

          <p style="margin: 0 0 24px; line-height: 1.6;">
            Accept the invitation to collaborate on quotations,
            customers, jobs, payments, reports, and customer tracking.
          </p>

          <p style="margin: 0 0 28px;">
            <a
              href="${this.escapeHtml(invitationUrl)}"
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
              Accept invitation
            </a>
          </p>

          <p
            style="
              margin: 0 0 16px;
              color: #525252;
              line-height: 1.6;
            "
          >
            Sign in with ${this.escapeHtml(to)}, or create a QUFO
            account using this same email address.
          </p>

          <p
            style="
              margin: 0 0 24px;
              color: #525252;
              line-height: 1.6;
            "
          >
            This invitation expires in ${expiresInDays} days. If you
            were not expecting it, you can safely ignore this email.
          </p>

          ${this.footerHtml()}
        </div>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the team invitation email right now.',
      );
    }
  }

  private formatRole(role: string) {
    return `${role.slice(0, 1)}${role.slice(1).toLowerCase()}`;
  }

  private footerHtml() {
    return `
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
    `;
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
