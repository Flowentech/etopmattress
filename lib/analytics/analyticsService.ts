import { client } from '@/sanity/lib/client';

export interface PlatformAnalytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    activeStores: number;
    aiGenerations: number;
    commissionEarned: number;
  };
  trends: {
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
    storeGrowth: number;
  };
  topStores: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  recentActivity: Array<{
    type: 'store_application' | 'order' | 'user_registration' | 'ai_generation' | 'payout';
    description: string;
    timestamp: Date;
    metadata?: any;
  }>;
  charts: {
    revenueChart: Array<{ date: string; revenue: number; orders: number }>;
    storePerformance: Array<{ storeId: string; storeName: string; revenue: number; commission: number }>;
    userGrowth: Array<{ date: string; customers: number; storeOwners: number }>;
    aiUsage: Array<{ date: string; generations: number; revenue: number; cost: number }>;
  };
}

export class AnalyticsService {
  async getPlatformAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<PlatformAnalytics> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const [overview, topStores, recentActivity, chartData] = await Promise.all([
      this.getOverviewMetrics(),
      this.getTopStores(timeRange),
      this.getRecentActivity(),
      this.getChartData(timeRange)
    ]);

    const trends = await this.getTrends(timeRange);

    return {
      overview,
      trends,
      topStores,
      recentActivity,
      charts: chartData
    };
  }

  private async getOverviewMetrics() {
    const metrics = await client.fetch(`{
      "totalRevenue": sum(*[_type == "commissionTransaction"].amounts.orderTotal),
      "totalOrders": count(*[_type == "platformOrder"]),
      "activeUsers": count(*[_type == "userRole" && role != "customer"]),
      "activeStores": count(*[_type == "store" && settings.isActive == true]),
      "aiGenerations": count(*[_type == "aiDesign"]),
      "commissionEarned": sum(*[_type == "commissionTransaction"].amounts.platformFee)
    }`);

    return {
      totalRevenue: metrics.totalRevenue || 0,
      totalOrders: metrics.totalOrders || 0,
      activeUsers: metrics.activeUsers || 0,
      activeStores: metrics.activeStores || 0,
      aiGenerations: metrics.aiGenerations || 0,
      commissionEarned: metrics.commissionEarned || 0
    };
  }

  private async getTrends(timeRange: string) {
    const endDate = new Date();
    const startDate = new Date();
    const compareStartDate = new Date();
    
    // Set current period
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        compareStartDate.setDate(endDate.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        compareStartDate.setDate(endDate.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        compareStartDate.setDate(endDate.getDate() - 180);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        compareStartDate.setFullYear(endDate.getFullYear() - 2);
        break;
    }

    const currentPeriod = await client.fetch(`{
      "revenue": sum(*[_type == "commissionTransaction" && dates.processedAt >= $startDate].amounts.orderTotal),
      "orders": count(*[_type == "platformOrder" && orderDate >= $startDate]),
      "users": count(*[_type == "userRole" && createdAt >= $startDate]),
      "stores": count(*[_type == "store" && _createdAt >= $startDate])
    }`, { startDate: startDate.toISOString() });

    const previousPeriod = await client.fetch(`{
      "revenue": sum(*[_type == "commissionTransaction" && dates.processedAt >= $compareStartDate && dates.processedAt < $startDate].amounts.orderTotal),
      "orders": count(*[_type == "platformOrder" && orderDate >= $compareStartDate && orderDate < $startDate]),
      "users": count(*[_type == "userRole" && createdAt >= $compareStartDate && createdAt < $startDate]),
      "stores": count(*[_type == "store" && _createdAt >= $compareStartDate && _createdAt < $startDate])
    }`, { 
      compareStartDate: compareStartDate.toISOString(),
      startDate: startDate.toISOString()
    });

    return {
      revenueGrowth: this.calculateGrowth(currentPeriod.revenue, previousPeriod.revenue),
      orderGrowth: this.calculateGrowth(currentPeriod.orders, previousPeriod.orders),
      userGrowth: this.calculateGrowth(currentPeriod.users, previousPeriod.users),
      storeGrowth: this.calculateGrowth(currentPeriod.stores, previousPeriod.stores)
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async getTopStores(timeRange: string) {
    const stores = await client.fetch(`
      *[_type == "store"] {
        _id,
        name,
        financials.totalEarnings,
        stats.totalOrders,
        "recentRevenue": sum(*[_type == "commissionTransaction" && storeId == ^._id].amounts.orderTotal)
      } | order(recentRevenue desc)[0...5]
    `);

    return stores.map((store: any) => ({
      id: store._id,
      name: store.name,
      revenue: store.recentRevenue || 0,
      orders: store.stats?.totalOrders || 0,
      growth: 0 // Calculate based on time comparison
    }));
  }

  private async getRecentActivity() {
    const activities = await Promise.all([
      // Store applications
      client.fetch(`
        *[_type == "storeApplication"] | order(submittedAt desc)[0...3] {
          _id,
          storeInfo.storeName,
          status,
          submittedAt
        }
      `).then(apps => apps.map((app: any) => ({
        type: 'store_application' as const,
        description: `New store application: ${app.storeInfo.storeName} (${app.status})`,
        timestamp: new Date(app.submittedAt),
        metadata: { applicationId: app._id }
      }))),

      // Recent orders
      client.fetch(`
        *[_type == "platformOrder"] | order(orderDate desc)[0...3] {
          _id,
          storeName,
          amounts.total,
          orderDate
        }
      `).then(orders => orders.map((order: any) => ({
        type: 'order' as const,
        description: `New order from ${order.storeName}: $${order.amounts.total}`,
        timestamp: new Date(order.orderDate),
        metadata: { orderId: order._id }
      }))),

      // AI generations
      client.fetch(`
        *[_type == "aiDesign"] | order(_createdAt desc)[0...2] {
          _id,
          style,
          _createdAt
        }
      `).then(designs => designs.map((design: any) => ({
        type: 'ai_generation' as const,
        description: `AI design generated: ${design.style} style`,
        timestamp: new Date(design._createdAt),
        metadata: { designId: design._id }
      })))
    ]);

    return activities
      .flat()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  private async getChartData(timeRange: string) {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    // Generate date range
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const [revenueData, storePerformance, userGrowthData, aiUsageData] = await Promise.all([
      this.getRevenueChartData(dates),
      this.getStorePerformanceData(),
      this.getUserGrowthData(dates),
      this.getAIUsageData(dates)
    ]);

    return {
      revenueChart: revenueData,
      storePerformance,
      userGrowth: userGrowthData,
      aiUsage: aiUsageData
    };
  }

  private async getRevenueChartData(dates: string[]) {
    const data = await Promise.all(
      dates.map(async (date) => {
        const dayStart = `${date}T00:00:00.000Z`;
        const dayEnd = `${date}T23:59:59.999Z`;
        
        const metrics = await client.fetch(`{
          "revenue": sum(*[_type == "commissionTransaction" && dates.processedAt >= $dayStart && dates.processedAt <= $dayEnd].amounts.orderTotal),
          "orders": count(*[_type == "platformOrder" && orderDate >= $dayStart && orderDate <= $dayEnd])
        }`, { dayStart, dayEnd });

        return {
          date,
          revenue: metrics.revenue || 0,
          orders: metrics.orders || 0
        };
      })
    );

    return data;
  }

  private async getStorePerformanceData() {
    return await client.fetch(`
      *[_type == "store"] {
        _id,
        name,
        "revenue": financials.totalEarnings,
        "commission": sum(*[_type == "commissionTransaction" && storeId == ^._id].amounts.platformFee)
      } | order(revenue desc)[0...10]
    `).then(stores => stores.map((store: any) => ({
      storeId: store._id,
      storeName: store.name,
      revenue: store.revenue || 0,
      commission: store.commission || 0
    })));
  }

  private async getUserGrowthData(dates: string[]) {
    return await Promise.all(
      dates.map(async (date) => {
        const dayEnd = `${date}T23:59:59.999Z`;
        
        const metrics = await client.fetch(`{
          "customers": count(*[_type == "userRole" && role == "customer" && createdAt <= $dayEnd]),
          "storeOwners": count(*[_type == "userRole" && role == "store_owner" && createdAt <= $dayEnd])
        }`, { dayEnd });

        return {
          date,
          customers: metrics.customers || 0,
          storeOwners: metrics.storeOwners || 0
        };
      })
    );
  }

  private async getAIUsageData(dates: string[]) {
    return await Promise.all(
      dates.map(async (date) => {
        const dayStart = `${date}T00:00:00.000Z`;
        const dayEnd = `${date}T23:59:59.999Z`;
        
        const metrics = await client.fetch(`{
          "generations": count(*[_type == "aiDesign" && _createdAt >= $dayStart && _createdAt <= $dayEnd]),
          "credits": sum(*[_type == "aiCredit" && purchasedAt >= $dayStart && purchasedAt <= $dayEnd].amount)
        }`, { dayStart, dayEnd });

        return {
          date,
          generations: metrics.generations || 0,
          revenue: (metrics.credits || 0) * 0.1, // Assuming $0.10 per credit
          cost: (metrics.generations || 0) * 0.05 // Assuming $0.05 cost per generation
        };
      })
    );
  }
}

export const analyticsService = new AnalyticsService();