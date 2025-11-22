import { CommissionService } from './CommissionService';
import { PayoutService } from './PayoutService';
import { client } from '@/sanity/lib/client';

export class BackgroundJobs {
  private static instance: BackgroundJobs;
  private commissionService: CommissionService;
  private payoutService: PayoutService;

  private constructor() {
    this.commissionService = CommissionService.getInstance();
    this.payoutService = PayoutService.getInstance();
  }

  public static getInstance(): BackgroundJobs {
    if (!BackgroundJobs.instance) {
      BackgroundJobs.instance = new BackgroundJobs();
    }
    return BackgroundJobs.instance;
  }

  /**
   * Daily job to settle pending funds and process automatic payouts
   */
  async runDailyPayoutJob(): Promise<{ settled: number; payouts: number; errors: string[] }> {
    const results = {
      settled: 0,
      payouts: 0,
      errors: [] as string[]
    };

    try {
      // Settle pending funds that have passed the 14-day holding period
      console.log('[BackgroundJob] Settling pending funds...');
      await this.commissionService.settlePendingFunds();
      
      // Get count of settled transactions for reporting
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 14);
      
      const settledCount = await client.fetch(`
        count(*[_type == "commissionTransaction" && status == "completed" && settledAt != null && dateTime(settledAt) >= dateTime($cutoffDate)])
      `, { cutoffDate: cutoffDate.toISOString() });
      
      results.settled = settledCount || 0;

      // Process automatic payouts for stores with available balance
      console.log('[BackgroundJob] Processing automatic payouts...');
      const storesForAutoPayout = await client.fetch(`
        *[_type == "storeEarnings" && payoutSchedule == "automatic" && availableBalance > 0] {
          "storeId": store._ref,
          availableBalance,
          nextPayoutDate
        }
      `);

      const now = new Date();
      let processedPayouts = 0;

      for (const store of storesForAutoPayout) {
        try {
          const nextPayoutDate = store.nextPayoutDate ? new Date(store.nextPayoutDate) : null;
          
          // Process payout if no next payout date or if it's time
          if (!nextPayoutDate || nextPayoutDate <= now) {
            const success = await this.payoutService.processAutomaticPayout(store.storeId);
            if (success) {
              processedPayouts++;
              console.log(`[BackgroundJob] Processed automatic payout for store ${store.storeId}`);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to process automatic payout for store ${store.storeId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`[BackgroundJob] ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }

      results.payouts = processedPayouts;

      console.log(`[BackgroundJob] Daily payout job completed. Settled: ${results.settled}, Payouts: ${results.payouts}, Errors: ${results.errors.length}`);

    } catch (error) {
      const errorMsg = `Daily payout job failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[BackgroundJob] ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    return results;
  }

  /**
   * Weekly job to update monthly sales figures and recalculate volume discounts
   */
  async runWeeklyMaintenanceJob(): Promise<{ updated: number; errors: string[] }> {
    const results = {
      updated: 0,
      errors: [] as string[]
    };

    try {
      console.log('[BackgroundJob] Running weekly maintenance...');

      // Update current month sales for all stores
      const stores = await client.fetch(`
        *[_type == "storeEarnings"] {
          _id,
          "storeId": store._ref
        }
      `);

      for (const store of stores) {
        try {
          const currentMonthSales = await this.commissionService.getStoreCurrentMonthSales(store.storeId);
          
          await client
            .patch(store._id)
            .set({ currentMonthSales })
            .commit();
          
          results.updated++;
        } catch (error) {
          const errorMsg = `Failed to update monthly sales for store ${store.storeId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`[BackgroundJob] ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }

      // Refresh commission settings cache
      this.commissionService.refreshSettings();

      console.log(`[BackgroundJob] Weekly maintenance completed. Updated: ${results.updated}, Errors: ${results.errors.length}`);

    } catch (error) {
      const errorMsg = `Weekly maintenance job failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[BackgroundJob] ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    return results;
  }

  /**
   * Monthly job to archive old data and generate reports
   */
  async runMonthlyArchiveJob(): Promise<{ archived: number; errors: string[] }> {
    const results = {
      archived: 0,
      errors: [] as string[]
    };

    try {
      console.log('[BackgroundJob] Running monthly archive job...');

      // Archive completed payout requests older than 6 months
      const archiveCutoff = new Date();
      archiveCutoff.setMonth(archiveCutoff.getMonth() - 6);

      const oldPayouts = await client.fetch(`
        *[_type == "payoutRequest" && status == "completed" && dateTime(processedAt) < dateTime($cutoff)] {
          _id
        }
      `, { cutoff: archiveCutoff.toISOString() });

      for (const payout of oldPayouts) {
        try {
          // Instead of deleting, we could move to an archive collection
          // For now, we'll just mark them as archived
          await client
            .patch(payout._id)
            .set({ archived: true, archivedAt: new Date().toISOString() })
            .commit();
          
          results.archived++;
        } catch (error) {
          const errorMsg = `Failed to archive payout ${payout._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`[BackgroundJob] ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }

      console.log(`[BackgroundJob] Monthly archive completed. Archived: ${results.archived}, Errors: ${results.errors.length}`);

    } catch (error) {
      const errorMsg = `Monthly archive job failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[BackgroundJob] ${errorMsg}`);
      results.errors.push(errorMsg);
    }

    return results;
  }

  /**
   * Health check job to verify system integrity
   */
  async runHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check for stuck transactions
      const stuckTransactions = await client.fetch(`
        count(*[_type == "commissionTransaction" && status == "pending" && dateTime(_createdAt) < dateTime(now()) - 3600])
      `);

      if (stuckTransactions > 0) {
        issues.push(`${stuckTransactions} transactions stuck in pending state for over 1 hour`);
      }

      // Check for failed payouts that need attention
      const failedPayouts = await client.fetch(`
        count(*[_type == "payoutRequest" && status == "failed" && dateTime(requestedAt) > dateTime(now()) - 86400])
      `);

      if (failedPayouts > 0) {
        issues.push(`${failedPayouts} payout requests failed in the last 24 hours`);
      }

      // Check for stores with high available balance but no payouts
      const highBalanceStores = await client.fetch(`
        count(*[_type == "storeEarnings" && availableBalance > 1000 && (lastPayoutDate == null || dateTime(lastPayoutDate) < dateTime(now()) - 604800)])
      `);

      if (highBalanceStores > 0) {
        issues.push(`${highBalanceStores} stores have high available balance (>$1000) with no recent payouts`);
      }

      return {
        healthy: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        healthy: false,
        issues
      };
    }
  }
}