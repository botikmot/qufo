import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { JobStatus } from '../generated/prisma/enums';
import { buildQufoEmail } from './templates/qufo-email-layout';

type QuotationNotificationData = {
  recipientEmail: string;
  recipientName?: string | null;

  quotationId: string;
  quotationNumber: string;

  customerName: string;

  total?: string;
  message?: string | null;
  note?: string | null;
};

type QuotationApprovedNotification = {
  recipientEmail: string;
  quotationId: string;
  quotationNumber: string;
  customerName: string;
  note?: string | null;
};

type QuotationCustomerEmailData = {
  recipientEmail: string;
  customerName: string;
  businessName: string;
  quotationNumber: string;
  publicUrl: string;
  validUntil?: Date | null;
};

type QuotationBusinessNotificationData = {
  recipientEmail: string;
  quotationId: string;
  quotationNumber: string;
  customerName: string;
  message?: string | null;
};

type JobStatusNotificationData = {
  recipientEmail: string;
  customerName: string;
  businessName: string;

  jobNumber: string;
  status: JobStatus;

  message?: string | null;
  trackingUrl?: string | null;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  private get appUrl() {
    return this.configService.get<string>('WEB_URL') ?? 'https://qufo.im';
  }

  private get fromEmail() {
    return (
      this.configService.get<string>('MAIL_FROM') ?? 'QUFO <no-reply@qufo.im>'
    );
  }

  private getQuotationUrl(quotationId: string) {
    return `${this.appUrl}/quotations/${quotationId}`;
  }

  private formatJobStatus(status: JobStatus) {
    switch (status) {
      case JobStatus.IN_PROGRESS:
        return 'In Progress';

      case JobStatus.READY:
        return 'Ready';

      case JobStatus.DELIVERED:
        return 'Delivered';

      case JobStatus.COMPLETED:
        return 'Completed';

      case JobStatus.CANCELLED:
        return 'Cancelled';

      default:
        return status
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  }

  private getJobStatusEmailSubject(jobNumber: string, status: JobStatus) {
    switch (status) {
      case JobStatus.IN_PROGRESS:
        return `Your job ${jobNumber} is now in progress`;

      case JobStatus.READY:
        return `Your job ${jobNumber} is ready`;

      case JobStatus.DELIVERED:
        return `Your job ${jobNumber} has been delivered`;

      case JobStatus.COMPLETED:
        return `Your job ${jobNumber} is complete`;

      case JobStatus.CANCELLED:
        return `Important update about ${jobNumber}`;

      default:
        return `Update on your job ${jobNumber}`;
    }
  }

  async sendQuotationApproved(
    data: QuotationApprovedNotification,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const message = data.note ? this.escapeHtml(data.note) : null;

    const quotationUrl = this.getQuotationUrl(data.quotationId);

    const html = buildQufoEmail({
      title: 'Quotation approved',

      preheader: `${data.customerName} approved quotation ${data.quotationNumber}.`,

      content: `
      <p
        style="
          margin: 0 0 14px;
        "
      >
        <strong>${customerName}</strong>
        approved quotation
        <strong>${quotationNumber}</strong>.
      </p>

      <p
        style="
          margin: 0;
          color: #475467;
        "
      >
        The quotation is ready for the next step in your workflow.
      </p>
    `,

      infoCard: message
        ? `
          <div
            style="
              font-size: 11px;
              line-height: 16px;
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
              color: #667085;
            "
          >
            Customer note
          </div>

          <div
            style="
              margin-top: 8px;
              font-size: 14px;
              line-height: 22px;
              color: #475467;
            "
          >
            ${message}
          </div>
        `
        : null,

      actionLabel: 'View quotation',

      actionUrl: quotationUrl,
    });

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} was approved`,

      html,
    });
  }

  async sendQuotationRevisionRequested(
    data: QuotationBusinessNotificationData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const message = data.message ? this.escapeHtml(data.message) : null;

    const quotationUrl = this.getQuotationUrl(data.quotationId);

    const html = buildQufoEmail({
      title: 'Customer requested changes',

      preheader: `${data.customerName} requested changes to quotation ${data.quotationNumber}.`,

      content: `
      <p
        style="
          margin: 0 0 14px;
        "
      >
        <strong>${customerName}</strong>
        requested changes to quotation
        <strong>${quotationNumber}</strong>.
      </p>

      <p
        style="
          margin: 0;
          color: #475467;
        "
      >
        Review the customer's request before preparing the next revision.
      </p>
    `,

      infoCard: message
        ? `
          <div
            style="
              font-size: 11px;
              line-height: 16px;
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
              color: #667085;
            "
          >
            Requested changes
          </div>

          <div
            style="
              margin-top: 8px;
              font-size: 14px;
              line-height: 22px;
              color: #475467;
            "
          >
            ${message}
          </div>
        `
        : null,

      actionLabel: 'Review request',

      actionUrl: quotationUrl,
    });

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `Changes requested for ${data.quotationNumber}`,

      html,
    });
  }

  async sendQuotationDeclined(
    data: QuotationBusinessNotificationData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const message = data.message ? this.escapeHtml(data.message) : null;

    const quotationUrl = this.getQuotationUrl(data.quotationId);

    const html = buildQufoEmail({
      title: 'Quotation declined',

      preheader: `${data.customerName} declined quotation ${data.quotationNumber}.`,

      content: `
      <p
        style="
          margin: 0 0 14px;
        "
      >
        <strong>${customerName}</strong>
        declined quotation
        <strong>${quotationNumber}</strong>.
      </p>

      <p
        style="
          margin: 0;
          color: #475467;
        "
      >
        You can review the quotation and the customer's response below.
      </p>
    `,

      infoCard: message
        ? `
          <div
            style="
              font-size: 11px;
              line-height: 16px;
              font-weight: 700;
              letter-spacing: .06em;
              text-transform: uppercase;
              color: #667085;
            "
          >
            Customer reason
          </div>

          <div
            style="
              margin-top: 8px;
              font-size: 14px;
              line-height: 22px;
              color: #475467;
            "
          >
            ${message}
          </div>
        `
        : null,

      actionLabel: 'View quotation',

      actionUrl: quotationUrl,
    });

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} was declined`,

      html,
    });
  }

  async sendQuotationCommentAdded(data: QuotationNotificationData) {
    await this.sendSafely({
      to: data.recipientEmail,
      subject: `New comment on ${data.quotationNumber}`,
      html: `
        <h2>New customer comment</h2>

        <p>
          <strong>${data.customerName}</strong>
          left a comment on
          <strong>${data.quotationNumber}</strong>.
        </p>

        ${
          data.message
            ? `
              <blockquote>${this.escapeHtml(data.message)}</blockquote>
            `
            : ''
        }

        <p>
          <a href="${this.getQuotationUrl(data.quotationId)}">
            Open quotation
          </a>
        </p>
      `,
    });
  }

  private async sendSafely(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        this.logger.error(
          `Failed to send notification "${params.subject}" to ${params.to}: ${error.message}`,
        );

        return false;
      }

      this.logger.log(`Notification email sent to ${params.to}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send notification "${params.subject}" to ${params.to}`,
        error instanceof Error ? error.stack : String(error),
      );

      return false;
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

  async sendQuotationToCustomer(
    data: QuotationCustomerEmailData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const businessName = this.escapeHtml(data.businessName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const validUntil = data.validUntil
      ? new Intl.DateTimeFormat('en', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(data.validUntil)
      : null;

    const html = buildQufoEmail({
      title: 'Your quotation is ready',

      preheader: `${data.businessName} sent you quotation ${data.quotationNumber}.`,

      businessName,

      content: `
      <p
        style="
          margin: 0 0 14px;
        "
      >
        Hi ${customerName},
      </p>

      <p
        style="
          margin: 0 0 14px;
        "
      >
        ${businessName} has prepared quotation
        <strong>${quotationNumber}</strong>
        for you.
      </p>

      <p
        style="
          margin: 0;
        "
      >
        You can securely review the quotation,
        approve it, request changes, or decline it.
      </p>
    `,

      infoCard: validUntil
        ? `
          <div
            style="
              font-size: 14px;
              line-height: 22px;
              color: #475467;
            "
          >
            <strong>Valid until:</strong>
            ${validUntil}
          </div>
        `
        : null,

      actionLabel: 'Review quotation',

      actionUrl: data.publicUrl,
    });

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} from ${data.businessName}`,

      html,
    });
  }

  async sendJobStatusUpdated(
    data: JobStatusNotificationData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const businessName = this.escapeHtml(data.businessName);

    const jobNumber = this.escapeHtml(data.jobNumber);

    const message = data.message ? this.escapeHtml(data.message) : null;

    const statusLabel = this.formatJobStatus(data.status);

    const subject = this.getJobStatusEmailSubject(data.jobNumber, data.status);

    const html = buildQufoEmail({
      title: 'Your job has been updated',

      preheader: `${data.jobNumber} is now ${statusLabel}.`,

      businessName,

      content: `
      <p
        style="
          margin: 0 0 14px;
        "
      >
        Hi ${customerName},
      </p>

      <p
        style="
          margin: 0;
        "
      >
        There's an update on job
        <strong>${jobNumber}</strong>.
      </p>
    `,

      infoCard: `
      <div
        style="
          font-size: 11px;
          line-height: 16px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #667085;
        "
      >
        New status
      </div>

      <div
        style="
          margin-top: 6px;
          font-size: 18px;
          line-height: 24px;
          font-weight: 700;
          color: #172033;
        "
      >
        ${statusLabel}
      </div>

      ${
        message
          ? `
            <div
              style="
                margin-top: 10px;
                font-size: 14px;
                line-height: 22px;
                color: #475467;
              "
            >
              ${message}
            </div>
          `
          : ''
      }
    `,

      actionLabel: data.trackingUrl ? 'Track your job' : null,

      actionUrl: data.trackingUrl ?? null,
    });

    return this.sendSafely({
      to: data.recipientEmail,

      subject,

      html,
    });
  }
}
