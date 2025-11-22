import { client } from '@/sanity/lib/client';
import { CommissionSettings, VolumeDiscount, StoreEarnings } from '@/types/commission';

export class CommissionService {
  private static instance: CommissionService;
  private commissionSettings: CommissionSettings | null = null;

  public static getInstance(): CommissionService {
    if (!CommissionService.instance) {
      CommissionService.instance = new CommissionService();
    }
    return CommissionService.instance;
  }

  async getCommissionSettings(): Promise<CommissionSettings> {
    if (this.commissionSettings) {
      return this.commissionSettings;
    }

    try {
      const settings = await client.fetch(`
        *[_type == "commissionSettings"][0] {
          globalCommissionRate,
          categoryCommissionRates[] {
            "categoryId": category._ref,
            rate
          },
          storeCommissionRates[] {
            "storeId": store._ref,
            rate
          },
          volumeDiscounts[] {
            threshold,
            discountRate
          }
        }
      `);

      if (!settings) {
        // Default commission settings
        this.commissionSettings = {
          globalCommissionRate: 10,
          categoryCommissionRates: {},
          storeCommissionRates: {},
          volumeDiscounts: [
            { threshold: 10000, discountRate: 1 },
            { threshold: 25000, discountRate: 2 },
            { threshold: 50000, discountRate: 3 }
          ]
        };
        return this.commissionSettings;
      }

      // Transform arrays to objects for easier lookup
      const categoryRates: { [key: string]: number } = {};
      settings.categoryCommissionRates?.forEach((item: any) => {
        if (item.categoryId) {
          categoryRates[item.categoryId] = item.rate;
        }
      });

      const storeRates: { [key: string]: number } = {};
      settings.storeCommissionRates?.forEach((item: any) => {
        if (item.storeId) {
          storeRates[item.storeId] = item.rate;
        }
      });

      this.commissionSettings = {
        globalCommissionRate: settings.globalCommissionRate || 10,
        categoryCommissionRates: categoryRates,
        storeCommissionRates: storeRates,
        volumeDiscounts: settings.volumeDiscounts || []
      };

      return this.commissionSettings;
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      // Return default settings
      return {
        globalCommissionRate: 10,
        categoryCommissionRates: {},
        storeCommissionRates: {},
        volumeDiscounts: []
      };
    }
  }

  async calculateCommission(
    amount: number,
    storeId: string,
    categoryId?: string,
    currentMonthSales?: number
  ): Promise<{ commissionRate: number; platformFee: number; netAmount: number }> {
    const settings = await this.getCommissionSettings();
    let commissionRate = settings.globalCommissionRate;

    // Check for store-specific rate
    if (settings.storeCommissionRates[storeId]) {
      commissionRate = settings.storeCommissionRates[storeId];
    }
    // Check for category-specific rate
    else if (categoryId && settings.categoryCommissionRates[categoryId]) {
      commissionRate = settings.categoryCommissionRates[categoryId];
    }

    // Apply volume discount if applicable
    if (currentMonthSales !== undefined) {
      const applicableDiscount = settings.volumeDiscounts
        .filter(discount => currentMonthSales >= discount.threshold)
        .sort((a, b) => b.threshold - a.threshold)[0]; // Get highest applicable discount

      if (applicableDiscount) {
        commissionRate = Math.max(0, commissionRate - applicableDiscount.discountRate);
      }
    }

    const platformFee = (amount * commissionRate) / 100;
    const netAmount = amount - platformFee;

    return {
      commissionRate,
      platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimal places
      netAmount: Math.round(netAmount * 100) / 100
    };
  }

  async getStoreCurrentMonthSales(storeId: string): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await client.fetch(`
        sum(*[_type == "commissionTransaction" && store._ref == $storeId && _createdAt >= $startDate && status == "completed"].amount)
      `, {
        storeId,
        startDate: startOfMonth.toISOString()
      });

      return result || 0;
    } catch (error) {
      console.error('Error fetching store monthly sales:', error);
      return 0;
    }
  }

  async updateStoreEarnings(storeId: string, transactionAmount: number, platformFee: number): Promise<void> {
    try {
      const netAmount = transactionAmount - platformFee;

      // Get existing earnings or create new
      const existingEarnings = await client.fetch(`
        *[_type == "storeEarnings" && store._ref == $storeId][0]
      `, { storeId });

      const settleDate = new Date();
      settleDate.setDate(settleDate.getDate() + 14); // 14-day holding period

      if (existingEarnings) {
        // Update existing earnings
        await client
          .patch(existingEarnings._id)
          .set({
            totalSales: existingEarnings.totalSales + transactionAmount,
            platformFee: existingEarnings.platformFee + platformFee,
            netEarnings: existingEarnings.netEarnings + netAmount,
            pendingBalance: existingEarnings.pendingBalance + netAmount,
            lifetimeEarnings: existingEarnings.lifetimeEarnings + netAmount,
            currentMonthSales: await this.getStoreCurrentMonthSales(storeId)
          })
          .commit();
      } else {
        // Create new earnings record
        await client.create({
          _type: 'storeEarnings',
          store: { _type: 'reference', _ref: storeId },
          totalSales: transactionAmount,
          platformFee: platformFee,
          netEarnings: netAmount,
          pendingBalance: netAmount,
          availableBalance: 0,
          lifetimeEarnings: netAmount,
          currentMonthSales: transactionAmount,
          payoutSchedule: 'manual'
        });
      }
    } catch (error) {
      console.error('Error updating store earnings:', error);
      throw new Error('Failed to update store earnings');
    }
  }

  async settlePendingFunds(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 14);

      // Find transactions that are ready to be settled
      const settlableTransactions = await client.fetch(`
        *[_type == "commissionTransaction" && status == "completed" && settledAt == null && _createdAt <= $cutoffDate] {
          _id,
          store._ref,
          netAmount
        }
      `, { cutoffDate: cutoffDate.toISOString() });

      for (const transaction of settlableTransactions) {
        // Move funds from pending to available
        const storeEarnings = await client.fetch(`
          *[_type == "storeEarnings" && store._ref == $storeId][0]
        `, { storeId: transaction.store._ref });

        if (storeEarnings) {
          await client
            .patch(storeEarnings._id)
            .set({
              pendingBalance: Math.max(0, storeEarnings.pendingBalance - transaction.netAmount),
              availableBalance: storeEarnings.availableBalance + transaction.netAmount
            })
            .commit();
        }

        // Mark transaction as settled
        await client
          .patch(transaction._id)
          .set({ settledAt: new Date().toISOString() })
          .commit();
      }
    } catch (error) {
      console.error('Error settling pending funds:', error);
      throw new Error('Failed to settle pending funds');
    }
  }

  // Refresh commission settings cache
  refreshSettings(): void {
    this.commissionSettings = null;
  }
}