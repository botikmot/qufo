import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Logger } from '@nestjs/common';

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

type SendWelcomeEmailParams = {
  to: string;
  name: string;
  dashboardUrl: string;
};

type SendFirstQuoteReminderParams = {
  to: string;
  name: string;
  organizationName: string;
  createQuotationUrl: string;
};

type SendGettingStartedEmailParams = {
  to: string;
  name: string;
  organizationName: string;
  createQuotationUrl: string;
  dashboardUrl: string;
};

type SendFinalReminderEmailParams = {
  to: string;
  name: string;
  organizationName: string;
  createQuotationUrl: string;
};

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(EmailService.name);

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

  async sendWelcomeEmail({ to, name, dashboardUrl }: SendWelcomeEmailParams) {
    const resend = this.getResend();

    const safeName = this.escapeHtml(name);
    const safeDashboardUrl = this.escapeHtml(dashboardUrl);

    const { error } = await resend.emails.send({
      from: this.getFromAddress(),
      to,
      subject: 'Welcome to QUFO — Let’s create your first quotation',

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
          Welcome to QUFO!
        </h1>

        <p style="margin: 0 0 16px;">
          Hi ${safeName},
        </p>

        <p
          style="
            margin: 0 0 16px;
            line-height: 1.6;
          "
        >
          Welcome to QUFO — your quick flow from quotation to payment.
        </p>

        <p
          style="
            margin: 0 0 24px;
            line-height: 1.6;
          "
        >
          You can use QUFO to create quotations, manage customers,
          track jobs, and organize your business workflow.
        </p>

        <p style="margin: 0 0 28px;">
          <a
            href="${safeDashboardUrl}"
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
            Open QUFO
          </a>
        </p>

        <p
          style="
            margin: 0 0 24px;
            color: #525252;
            line-height: 1.6;
          "
        >
          A great place to start is by creating your first quotation.
        </p>

        ${this.footerHtml()}
      </div>
    `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the QUFO welcome email right now.',
      );
    }
  }

  async sendFirstQuoteReminder({
    to,
    name,
    organizationName,
    createQuotationUrl,
  }: SendFirstQuoteReminderParams) {
    const resend = this.getResend();

    const safeName = this.escapeHtml(name);
    const safeOrganizationName = this.escapeHtml(organizationName);
    const safeCreateQuotationUrl = this.escapeHtml(createQuotationUrl);

    const { error } = await resend.emails.send({
      from: this.getFromAddress(),
      to,
      subject: 'Ready to create your first quotation on QUFO?',

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
          Let's create your first quotation
        </h1>

        <p style="margin: 0 0 16px;">
          Hi ${safeName},
        </p>

        <p
          style="
            margin: 0 0 16px;
            line-height: 1.6;
          "
        >
          We noticed that your workspace,
          <strong>${safeOrganizationName}</strong>,
          has not created a quotation yet.
        </p>

        <p
          style="
            margin: 0 0 24px;
            line-height: 1.6;
          "
        >
          Start with a simple quotation for one of your customers.
          You can add items, set your pricing, and prepare it for
          your customer.
        </p>

        <p style="margin: 0 0 28px;">
          <a
            href="${safeCreateQuotationUrl}"
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
            Create your first quotation
          </a>
        </p>

        <p
          style="
            margin: 0 0 24px;
            color: #525252;
            line-height: 1.6;
          "
        >
          No pressure — whenever you're ready, QUFO is here to
          help simplify your workflow.
        </p>

        ${this.footerHtml()}
      </div>
    `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the first quotation reminder right now.',
      );
    }
  }

  async sendGettingStartedEmail({
    to,
    name,
    organizationName,
    createQuotationUrl,
    dashboardUrl,
  }: SendGettingStartedEmailParams) {
    const resend = this.getResend();

    const safeName = this.escapeHtml(name);
    const safeOrganizationName = this.escapeHtml(organizationName);
    const safeCreateQuotationUrl = this.escapeHtml(createQuotationUrl);
    const safeDashboardUrl = this.escapeHtml(dashboardUrl);

    const { error } = await resend.emails.send({
      from: this.getFromAddress(),
      to,
      subject: `Getting started with ${organizationName} on QUFO`,

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
          Your QUFO quick-start guide
        </h1>

        <p style="margin: 0 0 16px;">
          Hi ${safeName},
        </p>

        <p
          style="
            margin: 0 0 24px;
            line-height: 1.6;
          "
        >
          Here are a few simple steps to help you get started
          with <strong>${safeOrganizationName}</strong>.
        </p>

        <h2
          style="
            margin: 0 0 12px;
            font-size: 18px;
          "
        >
          Your first steps
        </h2>

        <ol
          style="
            margin: 0 0 24px;
            padding-left: 22px;
            line-height: 1.8;
          "
        >
          <li>Create a customer.</li>
          <li>Add your quotation items.</li>
          <li>Review your quotation details.</li>
          <li>Save or send the quotation when ready.</li>
        </ol>

        <p style="margin: 0 0 16px;">
          <a
            href="${safeCreateQuotationUrl}"
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
            Create a quotation
          </a>
        </p>

        <p style="margin: 0 0 28px;">
          <a
            href="${safeDashboardUrl}"
            style="
              color: #374151;
              text-decoration: underline;
            "
          >
            Open your QUFO dashboard
          </a>
        </p>

        ${this.footerHtml()}
      </div>
    `,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send the getting started email right now.',
      );
    }
  }

  async sendFinalReminderEmail({
    to,
    name,
    organizationName,
    createQuotationUrl,
  }: SendFinalReminderEmailParams) {
    const resend = this.getResend();
    const from = this.getFromAddress();

    const safeName = this.escapeHtml(name);
    const safeOrganizationName = this.escapeHtml(organizationName);
    const safeCreateQuotationUrl = this.escapeHtml(createQuotationUrl);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: 'Your first QUFO quotation is waiting',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Your first quotation is just a few clicks away 🚀</h2>

        <p>Hi ${safeName},</p>

        <p>
          We wanted to send you one final reminder about
          creating your first quotation for
          <strong>${safeOrganizationName}</strong>.
        </p>

        <p>
          With QUFO, you can create quotations, share them
          with customers, and track your workflow in one place.
        </p>

        <p>
          <a
            href="${safeCreateQuotationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Create Your First Quotation
          </a>
        </p>

        <p>
          If you have already created a quotation,
          you can ignore this email.
        </p>

        <p>
          Thanks for trying QUFO!
        </p>

        ${this.footerHtml()}
      </div>
    `,
    });

    if (error) {
      this.logger.error('Failed to send final reminder email', error);

      throw new InternalServerErrorException(
        'Failed to send final reminder email',
      );
    }
  }
}
