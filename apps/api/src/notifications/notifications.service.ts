import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { JobStatus } from '../generated/prisma/enums';

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
    return `${this.appUrl}/dashboard/quotations/${quotationId}`;
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

  async sendQuotationApproved(data: QuotationApprovedNotification) {
    const quotationUrl = `${this.appUrl}/quotations`;

    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const note = data.note ? this.escapeHtml(data.note) : null;

    await this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} was approved`,

      html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          color: #172033;
        "
      >
        <h2 style="margin-bottom: 8px;">
          Quotation approved
        </h2>

        <p style="line-height: 1.6;">
          <strong>${customerName}</strong>
          approved quotation
          <strong>${quotationNumber}</strong>.
        </p>

        ${
          note
            ? `
              <div
                style="
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 10px;
                  background: #f6f8fa;
                "
              >
                <div
                  style="
                    margin-bottom: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #667085;
                  "
                >
                  Customer note
                </div>

                <div style="line-height: 1.6;">
                  ${note}
                </div>
              </div>
            `
            : ''
        }

        <p style="margin-top: 24px;">
          <a
            href="${quotationUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              border-radius: 8px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              font-weight: 600;
            "
          >
            View quotation
          </a>
        </p>

        <p
          style="
            margin-top: 32px;
            font-size: 12px;
            color: #98a2b3;
          "
        >
          This notification was sent by QUFO.
        </p>
      </div>
    `,
    });
  }

  async sendQuotationRevisionRequested(
    data: QuotationBusinessNotificationData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const message = data.message ? this.escapeHtml(data.message) : null;

    const quotationUrl = `${this.appUrl}/quotations`;

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `Changes requested for ${data.quotationNumber}`,

      html: `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 20px;
          color: #172033;
        "
      >
        <h2>
          Customer requested changes
        </h2>

        <p style="line-height: 1.7;">
          <strong>${customerName}</strong>
          requested changes to quotation
          <strong>${quotationNumber}</strong>.
        </p>

        ${
          message
            ? `
              <div
                style="
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 10px;
                  background: #f6f8fa;
                "
              >
                <div
                  style="
                    margin-bottom: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #667085;
                  "
                >
                  Customer request
                </div>

                <div style="line-height: 1.6;">
                  ${message}
                </div>
              </div>
            `
            : ''
        }

        <p style="margin-top: 24px;">
          <a
            href="${quotationUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              border-radius: 8px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Review request
          </a>
        </p>

        <p
          style="
            margin-top: 32px;
            font-size: 12px;
            color: #98a2b3;
          "
        >
          This notification was sent by QUFO.
        </p>
      </div>
    `,
    });
  }

  async sendQuotationDeclined(
    data: QuotationBusinessNotificationData,
  ): Promise<boolean> {
    const customerName = this.escapeHtml(data.customerName);

    const quotationNumber = this.escapeHtml(data.quotationNumber);

    const message = data.message ? this.escapeHtml(data.message) : null;

    const quotationUrl = `${this.appUrl}/quotations`;

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} was declined`,

      html: `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 20px;
          color: #172033;
        "
      >
        <h2>
          Quotation declined
        </h2>

        <p style="line-height: 1.7;">
          <strong>${customerName}</strong>
          declined quotation
          <strong>${quotationNumber}</strong>.
        </p>

        ${
          message
            ? `
              <div
                style="
                  margin: 24px 0;
                  padding: 16px;
                  border-radius: 10px;
                  background: #f6f8fa;
                "
              >
                <div
                  style="
                    margin-bottom: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #667085;
                  "
                >
                  Customer reason
                </div>

                <div style="line-height: 1.6;">
                  ${message}
                </div>
              </div>
            `
            : ''
        }

        <p style="margin-top: 24px;">
          <a
            href="${quotationUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              border-radius: 8px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              font-weight: 600;
            "
          >
            View quotation
          </a>
        </p>

        <p
          style="
            margin-top: 32px;
            font-size: 12px;
            color: #98a2b3;
          "
        >
          This notification was sent by QUFO.
        </p>
      </div>
    `,
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

    return this.sendSafely({
      to: data.recipientEmail,

      subject: `${data.quotationNumber} from ${data.businessName}`,

      html: `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 20px;
          color: #172033;
        "
      >
        <div
          style="
            margin-bottom: 28px;
            font-size: 20px;
            font-weight: 700;
          "
        >
          ${businessName}
        </div>

        <h2
          style="
            margin: 0 0 16px;
            font-size: 24px;
          "
        >
          Your quotation is ready
        </h2>

        <p
          style="
            margin: 0 0 16px;
            line-height: 1.7;
          "
        >
          Hi ${customerName},
        </p>

        <p
          style="
            margin: 0 0 20px;
            line-height: 1.7;
          "
        >
          ${businessName} has prepared quotation
          <strong>${quotationNumber}</strong>
          for you.
        </p>

        <p
          style="
            margin: 0 0 24px;
            line-height: 1.7;
          "
        >
          You can securely review the quotation,
          approve it, request changes, or decline it
          using the link below.
        </p>

        ${
          validUntil
            ? `
              <div
                style="
                  margin: 0 0 24px;
                  padding: 14px 16px;
                  border-radius: 10px;
                  background: #f6f8fa;
                  font-size: 14px;
                "
              >
                <strong>Valid until:</strong>
                ${validUntil}
              </div>
            `
            : ''
        }

        <p style="margin: 0 0 28px;">
          <a
            href="${data.publicUrl}"
            style="
              display: inline-block;
              padding: 13px 20px;
              border-radius: 9px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Review quotation
          </a>
        </p>

        <p
          style="
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            color: #98a2b3;
          "
        >
          This secure quotation was sent through QUFO.
        </p>
      </div>
    `,
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

    return this.sendSafely({
      to: data.recipientEmail,

      subject: this.getJobStatusEmailSubject(data.jobNumber, data.status),

      html: `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 32px 20px;
          color: #172033;
        "
      >
        <div
          style="
            margin-bottom: 28px;
            font-size: 20px;
            font-weight: 700;
          "
        >
          ${businessName}
        </div>

        <h2
          style="
            margin: 0 0 16px;
            font-size: 24px;
          "
        >
          Your job has been updated
        </h2>

        <p style="line-height: 1.7;">
          Hi ${customerName},
        </p>

        <p style="line-height: 1.7;">
          There's an update on job
          <strong>${jobNumber}</strong>.
        </p>

        <div
          style="
            margin: 24px 0;
            padding: 16px;
            border-radius: 10px;
            background: #f6f8fa;
          "
        >
          <div
            style="
              margin-bottom: 6px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #667085;
            "
          >
            New status
          </div>

          <div
            style="
              font-size: 18px;
              font-weight: 700;
            "
          >
            ${statusLabel}
          </div>

          ${
            message
              ? `
                <div
                  style="
                    margin-top: 12px;
                    line-height: 1.6;
                    color: #475467;
                  "
                >
                  ${message}
                </div>
              `
              : ''
          }
        </div>

        ${
          data.trackingUrl
            ? `
              <div style="margin-top: 24px;">
                <a
                  href="${data.trackingUrl}"
                  target="_blank"
                  style="
                    display: inline-block;
                    padding: 13px 20px;
                    border-radius: 9px;
                    background: #0f172a;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 600;
                  "
                >
                  Track your job
                </a>
              </div>
            `
            : ''
        }

        <p
          style="
            margin-top: 32px;
            font-size: 12px;
            color: #98a2b3;
          "
        >
          This update was sent through QUFO.
        </p>
      </div>
    `,
    });
  }
}
