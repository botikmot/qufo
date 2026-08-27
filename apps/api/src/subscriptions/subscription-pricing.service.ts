import { Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

export type SubscriptionPrice = {
  plan: 'STANDARD';

  amount: Prisma.Decimal;

  currency: 'PHP' | 'USD';

  periodMonths: number;
};

@Injectable()
export class SubscriptionPricingService {
  getStandardMonthlyPrice(countryCode: string | null): SubscriptionPrice {
    const normalizedCountry = countryCode?.trim().toUpperCase();

    if (normalizedCountry === 'PH') {
      return {
        plan: 'STANDARD',

        amount: new Prisma.Decimal(499),

        currency: 'PHP',

        periodMonths: 1,
      };
    }

    return {
      plan: 'STANDARD',

      amount: new Prisma.Decimal(9),

      currency: 'USD',

      periodMonths: 1,
    };
  }
}
