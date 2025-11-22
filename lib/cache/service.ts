// import { Redis } from '@upstash/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: number; // Revalidation time in seconds
}

class CacheService {
  private static instance: CacheService;
  private redis: Redis | null = null;
  private fallbackCache: Map<string, { data: any; expires: number }> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeRedis();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeRedis() {
    // Redis is optional - use memory cache fallback
    console.log('Using memory cache fallback for caching');
    this.isEnabled = false;
  }

  private getMemoryKey(key: string): { data: any; expires: number } | undefined {
    const item = this.fallbackCache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expires) {
      this.fallbackCache.delete(key);
      return undefined;
    }

    return item;
  }

  private setMemoryKey(key: string, data: any, ttl: number) {
    this.fallbackCache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    });

    // Clean up expired entries periodically
    if (this.fallbackCache.size > 1000) {
      this.cleanupMemoryCache();
    }
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.fallbackCache.entries()) {
      if (now > item.expires) {
        this.fallbackCache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const data = await this.redis.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
      } else {
        // Fallback to memory cache
        const item = this.getMemoryKey(key);
        if (item) {
          return item.data as T;
        }
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = 3600 } = options; // Default 1 hour
      const serializedData = JSON.stringify(data);

      if (this.redis) {
        await this.redis.setex(key, ttl, serializedData);

        // Store tags if provided
        if (options.tags && options.tags.length > 0) {
          const tagKey = `tags:${key}`;
          await this.redis.set(tagKey, JSON.stringify(options.tags), { ex: ttl });
        }
      } else {
        // Fallback to memory cache
        this.setMemoryKey(key, data, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
        // Also delete tag information
        await this.redis.del(`tags:${key}`);
      } else {
        this.fallbackCache.delete(key);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.redis) {
        // This is a simplified implementation
        // In production, you'd want to maintain a tag-to-keys mapping
        const keys = await this.redis.keys('*');
        const keysToInvalidate: string[] = [];

        for (const key of keys) {
          if (key.startsWith('tags:')) {
            const tags = await this.redis.get(key);
            if (tags && JSON.parse(tags).includes(tag)) {
              const dataKey = key.replace('tags:', '');
              keysToInvalidate.push(dataKey, key);
            }
          }
        }

        if (keysToInvalidate.length > 0) {
          await this.redis.del(...keysToInvalidate);
        }
      } else {
        // For memory cache, we need to iterate through all entries
        this.cleanupMemoryCache();
      }
    } catch (error) {
      console.error('Cache invalidate by tag error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Simple pattern matching for memory cache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.fallbackCache.keys()) {
          if (regex.test(key)) {
            this.fallbackCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  // Cache wrapper function for API responses
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, options);

    return result;
  }

  // Generate cache key with parameters
  static generateKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');

    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  // Check if cache is available
  isAvailable(): boolean {
    return this.isEnabled || this.fallbackCache.size > 0;
  }

  // Get cache statistics
  async getStats(): Promise<{
    redis: boolean;
    memoryCache: number;
    totalKeys: number;
  }> {
    let totalKeys = this.fallbackCache.size;

    if (this.redis) {
      try {
        const redisKeys = await this.redis.dbsize();
        totalKeys += redisKeys;
        return {
          redis: true,
          memoryCache: this.fallbackCache.size,
          totalKeys
        };
      } catch (error) {
        console.error('Failed to get Redis stats:', error);
      }
    }

    return {
      redis: false,
      memoryCache: this.fallbackCache.size,
      totalKeys
    };
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Convenience functions
export const cache = {
  get: <T>(key: string) => cacheService.get<T>(key),
  set: <T>(key: string, data: T, options?: CacheOptions) => cacheService.set(key, data, options),
  invalidate: (key: string) => cacheService.invalidate(key),
  invalidateByTag: (tag: string) => cacheService.invalidateByTag(tag),
  invalidatePattern: (pattern: string) => cacheService.invalidatePattern(pattern),
  wrap: <T>(key: string, fn: () => Promise<T>, options?: CacheOptions) =>
    cacheService.wrap(key, fn, options),
  generateKey: CacheService.generateKey,
  isAvailable: () => cacheService.isAvailable(),
  getStats: () => cacheService.getStats()
};