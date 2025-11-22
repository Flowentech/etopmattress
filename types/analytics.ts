export interface StoreAnalytics {
  id: string;
  storeId: string;
  date: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  commissionTotal: number;
  commissionRate: number;
  netRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreTransaction {
  id: string;
  storeId: string;
  orderId: string;
  transactionType: 'sale' | 'refund' | 'commission';
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StorePerformance {
  id: string;
  storeId: string;
  date: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  percentageOfTotalSales: number;
  rankingPosition: number;
  totalStores: number;
  growthRate: number;
  createdAt: string;
}

export interface AnalyticsFilters {
  storeIds?: string[];
  startDate: string;
  endDate: string;
  periodType?: 'daily' | 'weekly' | 'monthly';
  includeComparison?: boolean;
  comparisonStartDate?: string;
  comparisonEndDate?: string;
}

export interface StoreAnalyticsResponse {
  success: boolean;
  data: {
    analytics: StoreAnalytics[];
    transactions: StoreTransaction[];
    performance: StorePerformance[];
    summary: {
      totalRevenue: number;
      totalCommission: number;
      totalOrders: number;
      avgCommissionRate: number;
      topPerformingStore?: {
        storeId: string;
        storeName: string;
        revenue: number;
        percentage: number;
      };
    };
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface ComparisonAnalytics {
  storeId: string;
  storeName: string;
  currentPeriod: {
    revenue: number;
    orders: number;
    commission: number;
  };
  previousPeriod: {
    revenue: number;
    orders: number;
    commission: number;
  };
  growth: {
    revenue: number;
    orders: number;
    commission: number;
  };
}