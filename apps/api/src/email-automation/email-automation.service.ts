import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

type EmailAutomationWithRelations = Prisma.EmailAutomationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        marketingEmailsEnabled: true;
      };
    };
    organization: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
@Injectable()
export class EmailAutomationService {
  private readonly logger = new Logger(EmailAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Enroll a user into the first-quote onboarding sequence.
   *
   * Call this after a user joins an organization
   * or after organization creation.
   */
  async enrollFirstQuoteOnboarding(params: {
    userId: string;
    organizationId: string;
  }) {
    const { userId, organizationId } = params;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        marketingEmailsEnabled: true,
      },
    });

    if (!user) {
      this.logger.warn(`Cannot enroll automation. User ${userId} not found.`);

      return null;
    }

    if (!user.marketingEmailsEnabled) {
      this.logger.log(`Marketing emails disabled for user ${userId}.`);

      return null;
    }

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!organization) {
      this.logger.warn(
        `Cannot enroll automation. Organization ${organizationId} not found.`,
      );

      return null;
    }

    const existingQuotation = await this.prisma.quotation.count({
      where: {
        organizationId,
      },
    });

    if (existingQuotation > 0) {
      this.logger.log(
        `Organization ${organizationId} already has quotations. Skipping onboarding.`,
      );

      return null;
    }

    const existingAutomation = await this.prisma.emailAutomation.findUnique({
      where: {
        userId_organizationId_type: {
          userId,
          organizationId,
          type: 'FIRST_QUOTE_ONBOARDING',
        },
      },
    });

    if (existingAutomation) {
      return existingAutomation;
    }

    const now = new Date();

    const automation = await this.prisma.emailAutomation.create({
      data: {
        userId,
        organizationId,
        type: 'FIRST_QUOTE_ONBOARDING',
        status: 'ACTIVE',
        currentStep: 0,
        nextRunAt: now,
      },
    });

    this.logger.log(
      `First-quote onboarding enrolled for user ${userId}, organization ${organizationId}.`,
    );

    return automation;
  }

  /**
   * Runs every 15 minutes.
   */
  @Cron('*/15 * * * *')
  async processScheduledAutomations() {
    this.logger.log('Processing scheduled email automations...');

    const now = new Date();

    const automations = await this.prisma.emailAutomation.findMany({
      where: {
        status: 'ACTIVE',
        nextRunAt: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            marketingEmailsEnabled: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 50,
    });

    for (const automation of automations) {
      const claimed = await this.claimAutomation(automation.id);

      if (!claimed) {
        this.logger.debug(`Automation ${automation.id} is already locked.`);

        continue;
      }

      try {
        await this.processAutomation(automation);
      } catch (error) {
        this.logger.error(
          `Failed to process automation ${automation.id}.`,
          error instanceof Error ? error.stack : String(error),
        );
      } finally {
        await this.prisma.emailAutomation.updateMany({
          where: {
            id: automation.id,
          },
          data: {
            lockedAt: null,
          },
        });
      }
    }
  }

  /**
   * Process one onboarding automation.
   */
  private async processAutomation(automation: EmailAutomationWithRelations) {
    const { id, user, organization, currentStep } = automation;

    if (!user.marketingEmailsEnabled) {
      await this.stopAutomation(id);

      return;
    }

    const quotationCount = await this.prisma.quotation.count({
      where: {
        organizationId: organization.id,
      },
    });

    if (quotationCount > 0) {
      await this.stopAutomation(id);

      this.logger.log(`Automation ${id} stopped because a quotation exists.`);

      return;
    }

    switch (currentStep) {
      case 0:
        await this.sendWelcomeStep(automation);
        break;

      case 1:
        await this.sendFirstQuoteReminderStep(automation);
        break;

      case 2:
        await this.sendGettingStartedStep(automation);
        break;

      case 3:
        await this.sendFinalReminderStep(automation);
        break;

      case 4:
        await this.completeAutomation(id);
        break;

      default:
        await this.completeAutomation(id);
        break;
    }
  }

  private async sendWelcomeStep(automation: EmailAutomationWithRelations) {
    const { id, user } = automation;

    await this.emailService.sendWelcomeEmail({
      to: user.email,
      name: user.name ?? 'there',
      dashboardUrl: 'https://qufo.im/dashboard',
    });

    await this.prisma.emailDelivery.create({
      data: {
        automationId: id,
        recipient: user.email,
        templateKey: 'WELCOME',
        subject: 'Welcome to QUFO',
        type: 'MARKETING',
        status: 'SENT',
        sequenceStep: 0,
        scheduledAt: new Date(),
        sentAt: new Date(),
      },
    });

    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        currentStep: 1,
        nextRunAt: this.addDays(new Date(), 1),
      },
    });
  }

  private async sendFirstQuoteReminderStep(
    automation: EmailAutomationWithRelations,
  ) {
    const { id, user, organization } = automation;

    await this.emailService.sendFirstQuoteReminder({
      to: user.email,
      name: user.name ?? 'there',
      organizationName: organization.name,
      createQuotationUrl: 'https://qufo.im/dashboard/quotations/new',
    });

    await this.prisma.emailDelivery.create({
      data: {
        automationId: id,
        recipient: user.email,
        templateKey: 'FIRST_QUOTE_REMINDER',
        subject: 'Ready to create your first quotation?',
        type: 'MARKETING',
        status: 'SENT',
        sequenceStep: 1,
        scheduledAt: new Date(),
        sentAt: new Date(),
      },
    });

    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        currentStep: 2,
        nextRunAt: this.addDays(new Date(), 2),
      },
    });
  }

  private async sendGettingStartedStep(
    automation: EmailAutomationWithRelations,
  ) {
    const { id, user, organization } = automation;

    await this.emailService.sendGettingStartedEmail({
      to: user.email,
      name: user.name ?? 'there',
      organizationName: organization.name,
      createQuotationUrl: 'https://qufo.im/dashboard/quotations/new',
      dashboardUrl: 'https://qufo.im/dashboard',
    });

    await this.prisma.emailDelivery.create({
      data: {
        automationId: id,
        recipient: user.email,
        templateKey: 'GETTING_STARTED',
        subject: 'Get started with your first QUFO quotation',
        type: 'MARKETING',
        status: 'SENT',
        sequenceStep: 2,
        scheduledAt: new Date(),
        sentAt: new Date(),
      },
    });

    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        currentStep: 3,
        nextRunAt: this.addDays(new Date(), 4),
      },
    });
  }

  private async stopAutomation(id: string) {
    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        status: 'STOPPED',
        stoppedAt: new Date(),
        nextRunAt: null,
      },
    });
  }

  private async completeAutomation(id: string) {
    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        nextRunAt: null,
      },
    });

    this.logger.log(`Automation ${id} completed.`);
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
  }

  private async sendFinalReminderStep(
    automation: EmailAutomationWithRelations,
  ) {
    const { id, user, organization } = automation;

    await this.emailService.sendFinalReminderEmail({
      to: user.email,
      name: user.name ?? 'there',
      organizationName: organization.name,
      createQuotationUrl: 'https://qufo.im/dashboard/quotations/new',
    });

    await this.prisma.emailDelivery.create({
      data: {
        automationId: id,
        recipient: user.email,
        templateKey: 'FINAL_REMINDER',
        subject: 'Your first QUFO quotation is waiting',
        type: 'MARKETING',
        status: 'SENT',
        sequenceStep: 3,
        scheduledAt: new Date(),
        sentAt: new Date(),
      },
    });

    await this.prisma.emailAutomation.update({
      where: {
        id,
      },
      data: {
        currentStep: 4,
        nextRunAt: this.addDays(new Date(), 1),
      },
    });
  }

  private async claimAutomation(automationId: string): Promise<boolean> {
    const now = new Date();

    // A lock older than 30 minutes is considered stale.
    const staleLockTime = new Date(now.getTime() - 30 * 60 * 1000);

    const result = await this.prisma.emailAutomation.updateMany({
      where: {
        id: automationId,
        status: 'ACTIVE',
        nextRunAt: {
          lte: now,
        },
        OR: [
          {
            lockedAt: null,
          },
          {
            lockedAt: {
              lt: staleLockTime,
            },
          },
        ],
      },
      data: {
        lockedAt: now,
      },
    });

    return result.count === 1;
  }
}
