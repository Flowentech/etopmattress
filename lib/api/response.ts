import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/lib/validation/schemas';

// Simple cache interface to avoid dependency issues
interface CacheOptions {
  ttl?: number;
}

// Temporary disabled cache to avoid errors
const cache = {
  get: async (key: string) => null,
  set: async (key: string, value: any, options?: CacheOptions) => {},
  wrap: async (key: string, fetchFn: () => Promise<any>, options?: CacheOptions) => await fetchFn()
};

// Temporary disabled performance monitor to avoid errors
const performanceMonitor = {
  recordApiResponse: (endpoint: string, responseTime: number, isError?: boolean) => {},
  recordCacheHit: (key: string, isHit: boolean) => {}
};

export interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  cache?: CacheOptions;
  enablePerformanceMonitoring?: boolean;
}

export class ApiResponse {
  static success<T>(
    data: T,
    options: ApiResponseOptions = {}
  ): NextResponse {
    const { status = 200, headers = {}, cache: cacheOptions } = options;

    const response = NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(cacheOptions && {
          'Cache-Control': `public, max-age=${cacheOptions.ttl || 3600}, s-maxage=${cacheOptions.ttl || 3600}`,
        }),
      },
    });

    return response;
  }

  static error(
    message: string,
    options: ApiResponseOptions & { code?: string } = {}
  ): NextResponse {
    const { status = 500, code, headers = {} } = options;

    return NextResponse.json({
      success: false,
      error: {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
    }, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  static paginated<T>(
    data: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    },
    options: ApiResponseOptions = {}
  ): NextResponse {
    const { status = 200, headers = {}, cache: cacheOptions } = options;

    return NextResponse.json({
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    }, {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(cacheOptions && {
          'Cache-Control': `public, max-age=${cacheOptions.ttl || 300}, s-maxage=${cacheOptions.ttl || 300}`,
        }),
      },
    });
  }

  static withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: ApiResponseOptions = {}
  ): Promise<NextResponse> {
    return cache.wrap(key, async () => {
      const { enablePerformanceMonitoring = true } = options;
      const endpoint = key.split(':')[0]; // Extract endpoint from cache key

      if (enablePerformanceMonitoring) {
        performanceMonitor.recordApiResponse(endpoint, 0);
      }

      try {
        const data = await fetchFn();
        return ApiResponse.success(data, options);
      } catch (error) {
        if (enablePerformanceMonitoring) {
          performanceMonitor.recordApiResponse(endpoint, 0, true);
        }
        throw error;
      }
    }, options.cache);
  }

  static streaming(
    data: any,
    options: ApiResponseOptions = {}
  ): Response {
    const { headers = {} } = options;

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        ...headers,
      },
    });
  }
}

// Middleware factory for API routes with caching and monitoring
export function withApiHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    cacheKey?: string;
    cacheOptions?: CacheOptions;
    enablePerformanceMonitoring?: boolean;
    enableCors?: boolean;
    rateLimit?: {
      windowMs: number;
      maxRequests: number;
    };
  } = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = options.cacheKey?.split(':')[0] || new URL(req.url).pathname;
    let isError = false;

    try {
      // Check cache first if cache key is provided
      if (options.cacheKey) {
        const cached = await cache.get(options.cacheKey);
        if (cached) {
          performanceMonitor.recordCacheHit(options.cacheKey, true);
          return ApiResponse.success(cached, { cache: options.cacheOptions });
        }
        performanceMonitor.recordCacheHit(options.cacheKey, false);
      }

      // Execute handler
      const response = await handler(req, context);

      // Cache successful responses
      if (options.cacheKey && response.status === 200) {
        const responseData = await response.json();
        await cache.set(options.cacheKey, responseData, options.cacheOptions);
      }

      return response;

    } catch (error) {
      isError = true;
      console.error('API Handler Error:', error);

      // Handle validation errors specifically
      if (error instanceof ValidationError) {
        return ApiResponse.error('Validation failed', {
          code: 'VALIDATION_ERROR',
          status: 400,
          details: error.errors
        });
      }

      if (error instanceof Error) {
        return ApiResponse.error(error.message, {
          code: 'INTERNAL_ERROR',
          status: 500
        });
      }

      return ApiResponse.error('An unexpected error occurred', {
        status: 500
      });

    } finally {
      // Record performance metrics
      if (options.enablePerformanceMonitoring) {
        const responseTime = Date.now() - startTime;
        performanceMonitor.recordApiResponse(endpoint, responseTime, isError);
      }
    }
  };
}

// Common API response helpers
export const api = {
  success: ApiResponse.success,
  error: ApiResponse.error,
  paginated: ApiResponse.paginated,
  withCache: ApiResponse.withCache,
  streaming: ApiResponse.streaming,
  withHandler: withApiHandler,
};

// Error codes for consistent API responses
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
} as const;