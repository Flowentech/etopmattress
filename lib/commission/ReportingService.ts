import { client } from '@/sanity/lib/client';
import { CommissionReport } from '@/types/commission';

export class ReportingService {
  private static instance: ReportingService;

  public static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  async generateCommissionReport(
    startDate: Date,
    endDate: Date
  ): Promise<CommissionReport> {
    try {
      // Get transaction data for the period
      const transactionData = await client.fetch(`
        {
          "transactions": *[_type == "commissionTransaction" && dateTime(_createdAt) >= dateTime($startDate) && dateTime(_createdAt) <= dateTime($endDate)] {
            _id,
            amount,
            platformFee,
            netAmount,
            commissionRate,
            status,
            "storeId": store._ref,
            "storeName": store->name,
            _createdAt
          },
          "totalRevenue": sum(*[_type == "commissionTransaction" && dateTime(_createdAt) >= dateTime($startDate) && dateTime(_createdAt) <= dateTime($endDate) && status == "completed"].amount),
          "totalCommissions": sum(*[_type == "commissionTransaction" && dateTime(_createdAt) >= dateTime($startDate) && dateTime(_createdAt) <= dateTime($endDate) && status == "completed"].platformFee),
          "transactionCount": count(*[_type == "commissionTransaction" && dateTime(_createdAt) >= dateTime($startDate) && dateTime(_createdAt) <= dateTime($endDate)])
        }
      `, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Get payout data for the period
      const payoutData = await client.fetch(`
        {
          "storePayouts": sum(*[_type == "payoutRequest" && status == "completed" && dateTime(processedAt) >= dateTime($startDate) && dateTime(processedAt) <= dateTime($endDate)].amount),
          "pendingPayouts": sum(*[_type == "payoutRequest" && status == "pending"].amount)
        }
      `, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Calculate top stores
      const storeMap = new Map<string, { 
        storeId: string; 
        storeName: string; 
        revenue: number; 
        commission: number;
        transactionCount: number;
      }>();

      transactionData.transactions.forEach((tx: any) => {
        if (tx.status === 'completed') {
          const existing = storeMap.get(tx.storeId) || {
            storeId: tx.storeId,
            storeName: tx.storeName || 'Unknown Store',
            revenue: 0,
            commission: 0,
            transactionCount: 0
          };

          existing.revenue += tx.amount;
          existing.commission += tx.platformFee;
          existing.transactionCount += 1;

          storeMap.set(tx.storeId, existing);
        }
      });

      const topStores = Array.from(storeMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(store => ({
          storeId: store.storeId,
          storeName: store.storeName,
          revenue: store.revenue,
          commission: store.commission
        }));

      return {
        period: {
          start: startDate,
          end: endDate
        },
        totalRevenue: transactionData.totalRevenue || 0,
        totalCommissions: transactionData.totalCommissions || 0,
        storePayouts: payoutData.storePayouts || 0,
        pendingPayouts: payoutData.pendingPayouts || 0,
        transactionCount: transactionData.transactionCount || 0,
        topStores
      };
    } catch (error) {
      console.error('Error generating commission report:', error);
      throw new Error('Failed to generate commission report');
    }
  }

  async getStorePerformanceReport(storeId: string, months: number = 12): Promise<{
    monthlyData: Array<{
      month: string;
      sales: number;
      commission: number;
      netEarnings: number;
      transactionCount: number;
    }>;
    summary: {
      totalSales: number;
      totalCommissions: number;
      totalEarnings: number;
      averageCommissionRate: number;
      totalTransactions: number;
    };
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const transactions = await client.fetch(`
        *[_type == "commissionTransaction" && store._ref == $storeId && dateTime(_createdAt) >= dateTime($startDate)] {
          amount,
          platformFee,
          netAmount,
          commissionRate,
          status,
          _createdAt
        } | order(_createdAt asc)
      `, {
        storeId,
        startDate: startDate.toISOString()
      });

      // Group by month
      const monthlyData = new Map<string, {
        sales: number;
        commission: number;
        netEarnings: number;
        transactionCount: number;
      }>();

      let totalSales = 0;
      let totalCommissions = 0;
      let totalEarnings = 0;
      let totalTransactions = 0;
      let commissionSum = 0;

      transactions.forEach((tx: any) => {
        if (tx.status === 'completed') {
          const date = new Date(tx._createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          const existing = monthlyData.get(monthKey) || {
            sales: 0,
            commission: 0,
            netEarnings: 0,
            transactionCount: 0
          };

          existing.sales += tx.amount;
          existing.commission += tx.platformFee;
          existing.netEarnings += tx.netAmount;
          existing.transactionCount += 1;

          monthlyData.set(monthKey, existing);

          // Summary totals
          totalSales += tx.amount;
          totalCommissions += tx.platformFee;
          totalEarnings += tx.netAmount;
          totalTransactions += 1;
          commissionSum += tx.commissionRate;
        }
      });

      // Convert to array and sort by month
      const monthlyArray = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          ...data
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        monthlyData: monthlyArray,
        summary: {
          totalSales,
          totalCommissions,
          totalEarnings,
          averageCommissionRate: totalTransactions > 0 ? commissionSum / totalTransactions : 0,
          totalTransactions
        }
      };
    } catch (error) {
      console.error('Error generating store performance report:', error);
      throw new Error('Failed to generate store performance report');
    }
  }

  async getCommissionAnalytics(): Promise<{
    commissionRateDistribution: Array<{ rate: number; count: number; revenue: number }>;
    topCategories: Array<{ categoryId: string; categoryName: string; revenue: number; commission: number }>;
    payoutStatus: { pending: number; processing: number; completed: number; failed: number };
    recentTrends: Array<{ date: string; revenue: number; commissions: number }>;
  }> {
    try {
      // Get commission rate distribution
      const rateDistribution = await client.fetch(`
        *[_type == "commissionTransaction" && status == "completed"] {
          commissionRate,
          amount
        }
      `);

      const rateMap = new Map<number, { count: number; revenue: number }>();
      rateDistribution.forEach((tx: any) => {
        const rate = Math.round(tx.commissionRate);
        const existing = rateMap.get(rate) || { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += tx.amount;
        rateMap.set(rate, existing);
      });

      const commissionRateDistribution = Array.from(rateMap.entries())
        .map(([rate, data]) => ({ rate, ...data }))
        .sort((a, b) => a.rate - b.rate);

      // Get top categories by revenue
      const categoryData = await client.fetch(`
        *[_type == "commissionTransaction" && status == "completed"] {
          amount,
          platformFee,
          "categoryId": select(
            defined(store->products[0]->category._ref) => store->products[0]->category._ref,
            "uncategorized"
          ),
          "categoryName": select(
            defined(store->products[0]->category->name) => store->products[0]->category->name,
            "Uncategorized"
          )
        }
      `);

      const categoryMap = new Map<string, { 
        categoryId: string; 
        categoryName: string; 
        revenue: number; 
        commission: number;
      }>();

      categoryData.forEach((tx: any) => {
        const existing = categoryMap.get(tx.categoryId) || {
          categoryId: tx.categoryId,
          categoryName: tx.categoryName,
          revenue: 0,
          commission: 0
        };
        existing.revenue += tx.amount;
        existing.commission += tx.platformFee;
        categoryMap.set(tx.categoryId, existing);
      });

      const topCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Get payout status summary
      const payoutStatus = await client.fetch(`
        {
          "pending": count(*[_type == "payoutRequest" && status == "pending"]),
          "processing": count(*[_type == "payoutRequest" && status == "processing"]),
          "completed": count(*[_type == "payoutRequest" && status == "completed"]),
          "failed": count(*[_type == "payoutRequest" && status == "failed"])
        }
      `);

      // Get recent trends (last 30 days, grouped by day)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = await client.fetch(`
        *[_type == "commissionTransaction" && status == "completed" && dateTime(_createdAt) >= dateTime($startDate)] {
          amount,
          platformFee,
          _createdAt
        } | order(_createdAt asc)
      `, { startDate: thirtyDaysAgo.toISOString() });

      const trendMap = new Map<string, { revenue: number; commissions: number }>();
      recentTransactions.forEach((tx: any) => {
        const date = new Date(tx._createdAt).toISOString().split('T')[0];
        const existing = trendMap.get(date) || { revenue: 0, commissions: 0 };
        existing.revenue += tx.amount;
        existing.commissions += tx.platformFee;
        trendMap.set(date, existing);
      });

      const recentTrends = Array.from(trendMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        commissionRateDistribution,
        topCategories,
        payoutStatus,
        recentTrends
      };
    } catch (error) {
      console.error('Error generating commission analytics:', error);
      throw new Error('Failed to generate commission analytics');
    }
  }

  async exportCommissionData(
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      const transactions = await client.fetch(`
        *[_type == "commissionTransaction" && dateTime(_createdAt) >= dateTime($startDate) && dateTime(_createdAt) <= dateTime($endDate)] {
          _id,
          orderId,
          amount,
          platformFee,
          netAmount,
          commissionRate,
          status,
          "storeName": store->name,
          _createdAt
        } | order(_createdAt desc)
      `, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (format === 'json') {
        return JSON.stringify(transactions, null, 2);
      }

      // CSV format
      if (transactions.length === 0) {
        return 'No data available for the selected period';
      }

      const headers = [
        'Transaction ID',
        'Order ID',
        'Amount',
        'Platform Fee',
        'Net Amount',
        'Commission Rate (%)',
        'Status',
        'Store Name',
        'Date'
      ];

      const csvData = transactions.map((tx: any) => [
        tx._id,
        tx.orderId,
        tx.amount.toFixed(2),
        tx.platformFee.toFixed(2),
        tx.netAmount.toFixed(2),
        tx.commissionRate.toFixed(2),
        tx.status,
        tx.storeName || 'Unknown',
        new Date(tx._createdAt).toISOString().split('T')[0]
      ]);

      return [headers, ...csvData]
        .map(row => row.map((cell: any) => `"${cell}"`).join(','))
        .join('\n');

    } catch (error) {
      console.error('Error exporting commission data:', error);
      throw new Error('Failed to export commission data');
    }
  }
}