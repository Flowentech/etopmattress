import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { performanceMonitor } from '@/lib/performance/monitor';
import { cache } from '@/lib/cache/service';
import { api } from '@/lib/api/response';
import { getUserProfile } from '@/lib/auth/user-profile';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Verify admin access
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Insufficient permissions', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Get performance statistics
    const performance = performanceMonitor.getAggregatedStats();
    const alerts = performanceMonitor.getAlerts();
    const cacheStats = await cache.getStats();

    // Record system metrics
    performanceMonitor.recordSystemMetrics();

    return api.success({
      performance: {
        avgResponseTime: performance.avgResponseTime,
        errorRate: performance.errorRate,
        cacheHitRate: performance.cacheHitRate,
        totalRequests: performance.totalRequests,
        memoryUsage: performance.memoryUsage ? {
          heapUsed: Math.round(performance.memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(performance.memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(performance.memoryUsage.external / 1024 / 1024),
          rss: Math.round(performance.memoryUsage.rss / 1024 / 1024),
        } : undefined,
      },
      alerts: alerts.map(alert => ({
        type: alert.type,
        message: alert.message,
        currentValue: alert.currentValue,
        timestamp: alert.timestamp,
      })),
      cache: cacheStats,
      system: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      },
      timestamp: new Date().toISOString(),
    }, {
      cache: { ttl: 30 }, // Cache for 30 seconds
      enablePerformanceMonitoring: false, // Avoid infinite recursion
    });

  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return api.error('Failed to fetch performance statistics', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Verify admin access
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Insufficient permissions', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Clean up old metrics and alerts
    performanceMonitor.cleanup();

    return api.success({
      message: 'Performance data cleanup completed'
    });

  } catch (error) {
    console.error('Error cleaning performance data:', error);
    return api.error('Failed to cleanup performance data', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}