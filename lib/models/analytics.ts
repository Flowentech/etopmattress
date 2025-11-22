import { backendClient } from '@/sanity/lib/backendClient';
import { StoreAnalytics, StoreTransaction, StorePerformance } from '@/types/analytics';

export class AnalyticsService {
  // Store Analytics Methods
  static async createStoreAnalytics(data: Omit<StoreAnalytics, 'id' | 'createdAt' | 'updatedAt'>) {
    const analytics = {
      _type: 'storeAnalytics',
      storeId: data.storeId,
      date: data.date,
      periodType: data.periodType,
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders,
      totalItemsSold: data.totalItemsSold,
      commissionTotal: data.commissionTotal,
      commissionRate: data.commissionRate,
      netRevenue: data.netRevenue,
      avgOrderValue: data.avgOrderValue,
      conversionRate: data.conversionRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await backendClient.create(analytics);
    return result;
  }

  static async getStoreAnalytics(storeId: string, filters: {
    startDate: string;
    endDate: string;
    periodType?: string;
  }) {
    const query = `
      *[
        _type == "storeAnalytics" &&
        storeId == $storeId &&
        date >= $startDate &&
        date <= $endDate
        ${filters.periodType ? '&& periodType == $periodType' : ''}
      ] | order(date desc)
    `;

    const params = {
      storeId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.periodType && { periodType: filters.periodType }),
    };

    const analytics = await backendClient.fetch(query, params);
    return analytics;
  }

  static async getAllStoresAnalytics(filters: {
    storeIds?: string[];
    startDate: string;
    endDate: string;
    periodType?: string;
  }) {
    let storeFilter = '';
    if (filters.storeIds && filters.storeIds.length > 0) {
      storeFilter = `&& storeId in [$storeIds]`;
    }

    const query = `
      *[
        _type == "storeAnalytics" &&
        date >= $startDate &&
        date <= $endDate
        ${storeFilter}
        ${filters.periodType ? '&& periodType == $periodType' : ''}
      ] | order(date desc)
    `;

    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.storeIds && { storeIds: filters.storeIds }),
      ...(filters.periodType && { periodType: filters.periodType }),
    };

    const analytics = await backendClient.fetch(query, params);
    return analytics;
  }

  // Store Transaction Methods
  static async createStoreTransaction(data: Omit<StoreTransaction, 'id' | 'createdAt'>) {
    const transaction = {
      _type: 'storeTransaction',
      storeId: data.storeId,
      orderId: data.orderId,
      transactionType: data.transactionType,
      amount: data.amount,
      commissionAmount: data.commissionAmount,
      commissionRate: data.commissionRate,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
    };

    const result = await backendClient.create(transaction);
    return result;
  }

  static async getStoreTransactions(storeId: string, filters: {
    startDate: string;
    endDate: string;
    transactionType?: string;
  }) {
    let transactionTypeFilter = '';
    if (filters.transactionType) {
      transactionTypeFilter = `&& transactionType == $transactionType`;
    }

    const query = `
      *[
        _type == "storeTransaction" &&
        storeId == $storeId &&
        createdAt >= $startDate &&
        createdAt <= $endDate
        ${transactionTypeFilter}
      ] | order(createdAt desc)
    `;

    const params = {
      storeId,
      startDate: new Date(filters.startDate).toISOString(),
      endDate: new Date(filters.endDate).toISOString(),
      ...(filters.transactionType && { transactionType: filters.transactionType }),
    };

    const transactions = await backendClient.fetch(query, params);
    return transactions;
  }

  // Store Performance Methods
  static async createStorePerformance(data: Omit<StorePerformance, 'id' | 'createdAt'>) {
    const performance = {
      _type: 'storePerformance',
      storeId: data.storeId,
      date: data.date,
      periodType: data.periodType,
      percentageOfTotalSales: data.percentageOfTotalSales,
      rankingPosition: data.rankingPosition,
      totalStores: data.totalStores,
      growthRate: data.growthRate,
      createdAt: new Date().toISOString(),
    };

    const result = await backendClient.create(performance);
    return result;
  }

  static async getStorePerformance(storeId: string, filters: {
    startDate: string;
    endDate: string;
    periodType?: string;
  }) {
    const query = `
      *[
        _type == "storePerformance" &&
        storeId == $storeId &&
        date >= $startDate &&
        date <= $endDate
        ${filters.periodType ? '&& periodType == $periodType' : ''}
      ] | order(date desc)
    `;

    const params = {
      storeId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.periodType && { periodType: filters.periodType }),
    };

    const performance = await backendClient.fetch(query, params);
    return performance;
  }

  // Analytics Summary Methods
  static async getAnalyticsSummary(filters: {
    storeIds?: string[];
    startDate: string;
    endDate: string;
  }) {
    let storeFilter = '';
    if (filters.storeIds && filters.storeIds.length > 0) {
      storeFilter = `&& storeId in [$storeIds]`;
    }

    const query = `
      *[
        _type == "storeAnalytics" &&
        date >= $startDate &&
        date <= $endDate
        ${storeFilter}
      ] {
        totalRevenue,
        totalOrders,
        commissionTotal,
        commissionRate,
        totalItemsSold,
        avgOrderValue
      }
    `;

    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.storeIds && { storeIds: filters.storeIds }),
    };

    const analytics = await backendClient.fetch(query, params);

    if (!analytics || analytics.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCommission: 0,
        avgCommissionRate: 0,
        totalItemsSold: 0,
        avgOrderValue: 0,
      };
    }

    const summary = analytics.reduce((acc: any, item: any) => {
      acc.totalRevenue += item.totalRevenue || 0;
      acc.totalOrders += item.totalOrders || 0;
      acc.totalCommission += item.commissionTotal || 0;
      acc.totalItemsSold += item.totalItemsSold || 0;
      return acc;
    }, {
      totalRevenue: 0,
      totalOrders: 0,
      totalCommission: 0,
      avgCommissionRate: 0,
      totalItemsSold: 0,
      avgOrderValue: 0,
    });

    summary.avgCommissionRate = analytics.length > 0
      ? analytics.reduce((sum: number, item: any) => sum + (item.commissionRate || 0), 0) / analytics.length
      : 0;
    summary.avgOrderValue = summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0;

    return summary;
  }

  static async getTopPerformingStores(filters: {
    startDate: string;
    endDate: string;
    limit?: number;
  }) {
    let limitClause = '';
    if (filters.limit) {
      limitClause = `[0...${filters.limit}]`;
    }

    const query = `
      *[
        _type == "storeAnalytics" &&
        date >= $startDate &&
        date <= $endDate
      ] {
        storeId,
        totalRevenue,
        totalOrders,
        commissionTotal
      } | group(storeId) {
        "storeId": _key,
        "totalRevenue": sum(totalRevenue),
        "totalOrders": sum(totalOrders),
        "totalCommission": sum(commissionTotal)
      } | order(totalRevenue desc) ${limitClause}
    `;

    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };

    const topStores = await backendClient.fetch(query, params);
    return topStores;
  }

  // Data Aggregation Jobs
  static async aggregateDailyAnalytics(date: string) {
    const startDate = new Date(`${date}T00:00:00.000Z`).toISOString();
    const endDate = new Date(`${date}T23:59:59.999Z`).toISOString();

    const query = `
      *[
        _type == "storeTransaction" &&
        createdAt >= $startDate &&
        createdAt <= $endDate
      ] {
        storeId,
        amount,
        orderId,
        commissionAmount
      } | group(storeId) {
        "storeId": _key,
        "totalRevenue": sum(amount),
        "orders": unique(orderId),
        "totalCommission": sum(commissionAmount),
        "transactionCount": count()
      } {
        storeId,
        totalRevenue,
        "totalOrders": length(orders),
        totalCommission,
        transactionCount,
        "avgOrderValue": totalRevenue / length(orders)
      }
    `;

    const params = { startDate, endDate };
    const results = await backendClient.fetch(query, params);

    // Store the aggregated results
    for (const result of results) {
      await this.createStoreAnalytics({
        storeId: result.storeId,
        date,
        periodType: 'daily',
        totalRevenue: result.totalRevenue,
        totalOrders: result.totalOrders,
        totalItemsSold: result.transactionCount,
        commissionTotal: result.totalCommission,
        commissionRate: result.totalRevenue > 0 ? (result.totalCommission / result.totalRevenue) * 100 : 0,
        netRevenue: result.totalRevenue - result.totalCommission,
        avgOrderValue: result.avgOrderValue,
        conversionRate: 0, // Would need additional data for this
      });
    }

    return results;
  }

  static async updateStoreRankings(date: string) {
    // Get all stores with their revenue for the date
    const stores = await this.getTopPerformingStores({
      startDate: date,
      endDate: date,
      limit: 1000,
    });

    const totalStores = stores.length;

    // Update performance metrics for each store
    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      const percentage = totalStores > 0 && stores[0].totalRevenue > 0
        ? (store.totalRevenue / stores[0].totalRevenue) * 100
        : 0;

      await this.createStorePerformance({
        storeId: store.storeId,
        date,
        periodType: 'daily',
        percentageOfTotalSales: percentage,
        rankingPosition: i + 1,
        totalStores,
        growthRate: 0, // Would need previous period data for this
      });
    }

    return stores;
  }
}