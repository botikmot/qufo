export type PayMongoCheckoutPaidWebhook = {
  event_type: 'send.webhook';

  data: {
    type: 'checkout_session.payment.paid';

    resource: 'checkout_session';

    livemode: boolean;

    data: {
      id: string;

      type: 'checkout_session';

      attributes: {
        reference_number: string | null;

        metadata?: {
          subscription_payment_id?: string;
        };

        payments?: Array<{
          id: string;

          attributes: {
            amount: number;

            currency: string;

            status: string;
          };
        }>;
      };
    };
  };
};
