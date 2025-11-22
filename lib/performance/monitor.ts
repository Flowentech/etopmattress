interface PerformanceMetrics {
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  requestCount: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

interface PerformanceAlert {
  type: 'response_time' | 'error_rate' | 'memory_usage' | 'cache_hit_rate';
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: Date;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private readonly maxMetricsHistory = 1000;
  private readonly alertThresholds = {
    apiResponseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.9, // 90% of available memory
    cacheHitRate: 0.8, // Below 80% is concerning
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record API response time
  recordApiResponse(endpoint: string, responseTime: number, isError: boolean = false) {
    const key = `api:${endpoint}`;
    const existing = this.metrics.get(key) || [];

    const newMetric: PerformanceMetrics = {
      apiResponseTime: responseTime,
      cacheHitRate: 0, // Will be calculated separately
      errorRate: isError ? 1 : 0,
      requestCount: 1,
    };

    existing.push(newMetric);

    // Keep only recent metrics
    if (existing.length > this.maxMetricsHistory) {
      existing.shift();
    }

    this.metrics.set(key, existing);

    // Check for alerts
    this.checkResponseTimeAlert(endpoint, responseTime);
  }

  // Record cache hit/miss
  recordCacheHit(key: string, isHit: boolean) {
    const cacheKey = `cache:${key}`;
    const existing = this.metrics.get(cacheKey) || [];

    // Update hit rate
    const hitCount = existing.filter(m => m.cacheHitRate > 0).length + (isHit ? 1 : 0);
    const totalRequests = existing.length + 1;
    const newHitRate = hitCount / totalRequests;

    existing.push({
      apiResponseTime: 0,
      cacheHitRate: newHitRate,
      errorRate: 0,
      requestCount: 1,
    });

    if (existing.length > this.maxMetricsHistory) {
      existing.shift();
    }

    this.metrics.set(cacheKey, existing);

    // Check for cache hit rate alert
    this.checkCacheHitRateAlert(key, newHitRate);
  }

  // Record system metrics
  recordSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const key = 'system';
    const existing = this.metrics.get(key) || [];

    existing.push({
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      requestCount: 1,
      memoryUsage,
      cpuUsage,
    });

    if (existing.length > this.maxMetricsHistory) {
      existing.shift();
    }

    this.metrics.set(key, existing);

    // Check for memory usage alert
    this.checkMemoryUsageAlert(memoryUsage);
  }

  // Get metrics for a specific endpoint or time period
  getMetrics(key?: string, timeWindow?: number): PerformanceMetrics[] {
    if (!key) {
      // Return aggregated metrics
      const allMetrics: PerformanceMetrics[] = [];
      for (const metrics of this.metrics.values()) {
        allMetrics.push(...metrics);
      }
      return this.filterByTimeWindow(allMetrics, timeWindow);
    }

    const metrics = this.metrics.get(key) || [];
    return this.filterByTimeWindow(metrics, timeWindow);
  }

  // Get aggregated statistics
  getAggregatedStats(key?: string): {
    avgResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    totalRequests: number;
    memoryUsage?: NodeJS.MemoryUsage;
  } {
    const metrics = this.getMetrics(key);

    if (metrics.length === 0) {
      return {
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        totalRequests: 0,
      };
    }

    const validResponseTimes = metrics.filter(m => m.apiResponseTime > 0);
    const avgResponseTime = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, m) => sum + m.apiResponseTime, 0) / validResponseTimes.length
      : 0;

    const errorCount = metrics.reduce((sum, m) => sum + m.errorRate, 0);
    const errorRate = errorCount / metrics.length;

    const validCacheMetrics = metrics.filter(m => m.cacheHitRate > 0);
    const cacheHitRate = validCacheMetrics.length > 0
      ? validCacheMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / validCacheMetrics.length
      : 0;

    const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);

    const latestMemoryUsage = metrics
      .filter(m => m.memoryUsage)
      .sort((a, b) => (b.memoryUsage?.heapUsed || 0) - (a.memoryUsage?.heapUsed || 0))[0]?.memoryUsage;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 10000) / 10000,
      cacheHitRate: Math.round(cacheHitRate * 10000) / 10000,
      totalRequests,
      memoryUsage: latestMemoryUsage,
    };
  }

  // Get active alerts
  getAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert =>
      alert.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
  }

  // Clear old metrics and alerts
  cleanup() {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Clear old metrics
    for (const [key, metrics] of this.metrics.entries()) {
      const recent = metrics.filter(m =>
        m.memoryUsage || // System metrics don't have timestamps, keep them
        true // For now, keep all metrics (implement timestamp tracking if needed)
      );
      this.metrics.set(key, recent);
    }

    // Clear old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  private filterByTimeWindow(metrics: PerformanceMetrics[], timeWindow?: number): PerformanceMetrics[] {
    if (!timeWindow) return metrics;

    const cutoffTime = Date.now() - timeWindow * 1000;
    return metrics.filter(m => true); // Implement timestamp filtering if needed
  }

  private checkResponseTimeAlert(endpoint: string, responseTime: number) {
    if (responseTime > this.alertThresholds.apiResponseTime) {
      this.addAlert({
        type: 'response_time',
        threshold: this.alertThresholds.apiResponseTime,
        currentValue: responseTime,
        message: `High response time detected for ${endpoint}: ${responseTime}ms`,
        timestamp: new Date(),
      });
    }
  }

  private checkCacheHitRateAlert(key: string, hitRate: number) {
    if (hitRate < this.alertThresholds.cacheHitRate) {
      this.addAlert({
        type: 'cache_hit_rate',
        threshold: this.alertThresholds.cacheHitRate,
        currentValue: hitRate,
        message: `Low cache hit rate for ${key}: ${Math.round(hitRate * 100)}%`,
        timestamp: new Date(),
      });
    }
  }

  private checkMemoryUsageAlert(memoryUsage: NodeJS.MemoryUsage) {
    const usedMemory = memoryUsage.heapUsed;
    const totalMemory = memoryUsage.heapTotal;
    const usageRatio = usedMemory / totalMemory;

    if (usageRatio > this.alertThresholds.memoryUsage) {
      this.addAlert({
        type: 'memory_usage',
        threshold: this.alertThresholds.memoryUsage,
        currentValue: usageRatio,
        message: `High memory usage: ${Math.round(usageRatio * 100)}% (${Math.round(usedMemory / 1024 / 1024)}MB / ${Math.round(totalMemory / 1024 / 1024)}MB)`,
        timestamp: new Date(),
      });
    }
  }

  private addAlert(alert: PerformanceAlert) {
    // Avoid duplicate alerts
    const recentSimilar = this.alerts.find(existing =>
      existing.type === alert.type &&
      existing.message === alert.message &&
      existing.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (!recentSimilar) {
      this.alerts.push(alert);
      console.warn('Performance Alert:', alert.message);
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Middleware helper for API routes
export function withPerformanceMonitoring(endpoint: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      let isError = false;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        isError = true;
        throw error;
      } finally {
        const responseTime = Date.now() - startTime;
        performanceMonitor.recordApiResponse(endpoint, responseTime, isError);
      }
    };

    return descriptor;
  };
}