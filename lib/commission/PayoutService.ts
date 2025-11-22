import { client } from '@/sanity/lib/client';
import Stripe from 'stripe';
import { PayoutRequest, StoreEarnings, BankDetails } from '@/types/commission';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class PayoutService {
  private static instance: PayoutService;

  public static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  async requestPayout(
    storeId: string,
    amount: number,
    bankDetails?: BankDetails
  ): Promise<PayoutRequest> {
    try {
      // Check store available balance
      const storeEarnings = await client.fetch(`
        *[_type == "storeEarnings" && store._ref == $storeId][0]
      `, { storeId });

      if (!storeEarnings || storeEarnings.availableBalance < amount) {
        throw new Error('Insufficient available balance');
      }

      // Create payout request
      const payoutRequest = await client.create({
        _type: 'payoutRequest',
        store: { _type: 'reference', _ref: storeId },
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        bankDetails: bankDetails || null
      });

      // Deduct from available balance immediately (reserved for payout)
      await client
        .patch(storeEarnings._id)
        .set({
          availableBalance: storeEarnings.availableBalance - amount
        })
        .commit();

      return {
        _id: payoutRequest._id,
        storeId,
        amount,
        status: 'pending',
        requestedAt: new Date(),
        bankDetails
      };
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw new Error('Failed to create payout request');
    }
  }

  async processAutomaticPayout(storeId: string): Promise<boolean> {
    try {
      const storeEarnings = await client.fetch(`
        *[_type == "storeEarnings" && store._ref == $storeId][0] {
          ...,
          "store": store-> {
            _id,
            name,
            stripeAccountId
          }
        }
      `, { storeId });

      if (!storeEarnings?.store?.stripeAccountId || storeEarnings.availableBalance <= 0) {
        return false;
      }

      if (storeEarnings.payoutSchedule !== 'automatic') {
        return false;
      }

      // Create Stripe transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(storeEarnings.availableBalance * 100), // Convert to cents
        currency: 'usd',
        destination: storeEarnings.store.stripeAccountId,
        description: `Marketplace payout for ${storeEarnings.store.name}`,
      });

      // Create payout record
      await client.create({
        _type: 'payoutRequest',
        store: { _type: 'reference', _ref: storeId },
        amount: storeEarnings.availableBalance,
        status: 'completed',
        requestedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        transferId: transfer.id
      });

      // Update store earnings
      await client
        .patch(storeEarnings._id)
        .set({
          availableBalance: 0,
          lastPayoutDate: new Date().toISOString(),
          nextPayoutDate: this.calculateNextPayoutDate().toISOString()
        })
        .commit();

      return true;
    } catch (error) {
      console.error('Error processing automatic payout:', error);
      return false;
    }
  }

  async processManualPayout(payoutRequestId: string): Promise<boolean> {
    try {
      const payoutRequest = await client.fetch(`
        *[_type == "payoutRequest" && _id == $id][0] {
          ...,
          "store": store-> {
            _id,
            name,
            stripeAccountId
          }
        }
      `, { id: payoutRequestId });

      if (!payoutRequest || payoutRequest.status !== 'pending') {
        throw new Error('Invalid payout request');
      }

      // Update status to processing
      await client
        .patch(payoutRequestId)
        .set({
          status: 'processing',
          processedAt: new Date().toISOString()
        })
        .commit();

      try {
        let transferId: string | undefined;

        if (payoutRequest.store?.stripeAccountId) {
          // Process via Stripe Connect
          const transfer = await stripe.transfers.create({
            amount: Math.round(payoutRequest.amount * 100),
            currency: 'usd',
            destination: payoutRequest.store.stripeAccountId,
            description: `Manual payout for ${payoutRequest.store.name}`,
          });
          transferId = transfer.id;
        } else if (payoutRequest.bankDetails) {
          // Process via bank transfer (would need additional implementation)
          // This is a placeholder - actual bank transfer would require integration
          // with a service like Plaid, ACH, or wire transfer service
          transferId = `bank_${Date.now()}`;
        } else {
          throw new Error('No payout method available');
        }

        // Mark as completed
        await client
          .patch(payoutRequestId)
          .set({
            status: 'completed',
            transferId
          })
          .commit();

        // Update store earnings
        const storeEarnings = await client.fetch(`
          *[_type == "storeEarnings" && store._ref == $storeId][0]
        `, { storeId: payoutRequest.store._id });

        if (storeEarnings) {
          await client
            .patch(storeEarnings._id)
            .set({
              lastPayoutDate: new Date().toISOString()
            })
            .commit();
        }

        return true;
      } catch (transferError) {
        // Mark as failed
        await client
          .patch(payoutRequestId)
          .set({
            status: 'failed',
            failureReason: transferError instanceof Error ? transferError.message : 'Unknown error'
          })
          .commit();

        // Restore available balance
        const storeEarnings = await client.fetch(`
          *[_type == "storeEarnings" && store._ref == $storeId][0]
        `, { storeId: payoutRequest.store._id });

        if (storeEarnings) {
          await client
            .patch(storeEarnings._id)
            .set({
              availableBalance: storeEarnings.availableBalance + payoutRequest.amount
            })
            .commit();
        }

        return false;
      }
    } catch (error) {
      console.error('Error processing manual payout:', error);
      return false;
    }
  }

  async getStorePayoutHistory(storeId: string): Promise<PayoutRequest[]> {
    try {
      const payouts = await client.fetch(`
        *[_type == "payoutRequest" && store._ref == $storeId] | order(requestedAt desc) {
          _id,
          amount,
          status,
          requestedAt,
          processedAt,
          transferId,
          failureReason
        }
      `, { storeId });

      return payouts.map((payout: any) => ({
        ...payout,
        storeId,
        requestedAt: new Date(payout.requestedAt),
        processedAt: payout.processedAt ? new Date(payout.processedAt) : undefined
      }));
    } catch (error) {
      console.error('Error fetching payout history:', error);
      return [];
    }
  }

  async setupStripeConnect(storeId: string, email: string): Promise<string> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Update store with Stripe account ID
      await client
        .patch(storeId)
        .set({
          stripeAccountId: account.id
        })
        .commit();

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/dashboard?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/dashboard?connected=true`,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error setting up Stripe Connect:', error);
      throw new Error('Failed to setup Stripe Connect');
    }
  }

  async runAutomaticPayouts(): Promise<void> {
    try {
      const storesWithAutomaticPayouts = await client.fetch(`
        *[_type == "storeEarnings" && payoutSchedule == "automatic" && availableBalance > 0] {
          "storeId": store._ref,
          availableBalance,
          nextPayoutDate
        }
      `);

      const now = new Date();

      for (const store of storesWithAutomaticPayouts) {
        if (!store.nextPayoutDate || new Date(store.nextPayoutDate) <= now) {
          await this.processAutomaticPayout(store.storeId);
        }
      }
    } catch (error) {
      console.error('Error running automatic payouts:', error);
    }
  }

  private calculateNextPayoutDate(): Date {
    const nextPayout = new Date();
    nextPayout.setDate(nextPayout.getDate() + 7); // Weekly payouts
    return nextPayout;
  }
}