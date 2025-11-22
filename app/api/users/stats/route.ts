import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { cache } from '@/lib/cache/service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const cacheKey = cache.generateKey('user:stats', { userId });

    const fetchUserStats = async () => {

      // Calculate shopping stats
      const orders = await client.fetch(`
        *[_type == "order" && customer.userId == $userId] {
          total,
          status,
          itemCount,
          orderDate
        }
      `, { userId });

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      const pendingOrders = orders.filter((order: any) =>
        ['pending', 'processing', 'shipped'].includes(order.status)
      ).length;
      const completedOrders = orders.filter((order: any) =>
        ['delivered', 'completed'].includes(order.status)
      ).length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        totalOrders,
        totalSpent,
        pendingOrders,
        completedOrders,
        averageOrderValue,
        wishlistItems: 0, // Will be updated separately
      };
    };

    return api.withCache(cacheKey, fetchUserStats, {
      cache: { ttl: 600, tags: [`user:${userId}:stats`] }, // 10 minutes cache
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return api.error('Failed to fetch user stats', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}