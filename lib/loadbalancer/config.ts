// Load balancing and caching configuration for optimal performance

export interface LoadBalancerConfig {
  // CDN Configuration
  cdn: {
    enabled: boolean;
    provider: 'cloudflare' | 'aws-cloudfront';
    cacheTtl: {
      static: number; // Static assets (images, CSS, JS)
      api: number;    // API responses
      pages: number;  // Rendered pages
    };
    bypassRules: string[] // Paths to bypass CDN
  };

  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    windowMs: number; // Time window in ms
    maxRequests: number; // Max requests per window
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
    apiEndpoints: {
      [endpoint: string]: {
        windowMs: number;
        maxRequests: number;
      };
    };
  };

  // Caching Strategy
  caching: {
    enabled: boolean;
    defaultTtl: number; // Default cache TTL in seconds
    maxTtl: number; // Maximum cache TTL
    staleWhileRevalidate: number; // SWR duration
    strategies: {
      [pattern: string]: {
        ttl: number;
        strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
        tags?: string[];
      };
    };
  };

  // Health Checks
  healthCheck: {
    enabled: boolean;
    interval: number; // Health check interval in ms
    timeout: number; // Health check timeout in ms
    retries: number; // Number of retries before marking as unhealthy
    endpoints: string[]; // Health check endpoints
  };

  // Load Distribution
  loadDistribution: {
    strategy: 'round-robin' | 'least-connections' | 'weighted-round-robin';
    stickySessions: boolean;
    sessionAffinity: {
      enabled: boolean;
      cookieName: string;
      ttl: number;
    };
  };

  // Compression
  compression: {
    enabled: boolean;
    level: number; // 1-9
    threshold: number; // Minimum size to compress in bytes
    types: string[]; // MIME types to compress
  };

  // Security Headers
  security: {
    enabled: boolean;
    headers: {
      'X-Frame-Options': string;
      'X-Content-Type-Options': string;
      'X-XSS-Protection': string;
      'Strict-Transport-Security': string;
      'Content-Security-Policy': string;
    };
  };
}

export const defaultLoadBalancerConfig: LoadBalancerConfig = {
  cdn: {
    enabled: true,
    provider: 'cloudflare',
    cacheTtl: {
      static: 31536000,    // 1 year
      api: 300,           // 5 minutes
      pages: 60,          // 1 minute
    },
    bypassRules: [
      '/api/admin/*',
      '/api/auth/*',
      '/api/webhooks/*',
      '/dashboard/*',
    ]
  },

  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,         // 1000 requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    apiEndpoints: {
      '/api/stores': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
      },
      '/api/products': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500,
      },
      '/api/orders': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 200,
      },
      '/api/admin/*': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 50,
      },
      '/api/auth/*': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 20,
      },
    }
  },

  caching: {
    enabled: true,
    defaultTtl: 300,      // 5 minutes
    maxTtl: 86400,       // 24 hours
    staleWhileRevalidate: 60, // 1 minute
    strategies: {
      // Public pages
      '/': { ttl: 60, strategy: 'stale-while-revalidate', tags: ['home'] },
      '/stores': { ttl: 300, strategy: 'cache-first', tags: ['stores'] },
      '/products': { ttl: 300, strategy: 'cache-first', tags: ['products'] },
      '/architecture': { ttl: 300, strategy: 'cache-first', tags: ['architecture'] },

      // API endpoints
      '/api/stores': { ttl: 300, strategy: 'cache-first', tags: ['stores'] },
      '/api/products': { ttl: 300, strategy: 'cache-first', tags: ['products'] },
      '/api/reviews': { ttl: 600, strategy: 'cache-first', tags: ['reviews'] },

      // Static assets
      '/_next/static/*': { ttl: 31536000, strategy: 'cache-first' },
      '/images/*': { ttl: 86400, strategy: 'cache-first' },
      '/favicon*': { ttl: 86400, strategy: 'cache-first' },

      // Admin and authenticated routes (no caching)
      '/dashboard/*': { ttl: 0, strategy: 'network-first' },
      '/api/admin/*': { ttl: 0, strategy: 'network-first' },
      '/api/auth/*': { ttl: 0, strategy: 'network-first' },
    }
  },

  healthCheck: {
    enabled: true,
    interval: 30000,      // 30 seconds
    timeout: 5000,        // 5 seconds
    retries: 3,
    endpoints: [
      '/api/health',
      '/api/admin/health',
      '/api/stores/health',
    ]
  },

  loadDistribution: {
    strategy: 'least-connections',
    stickySessions: true,
    sessionAffinity: {
      enabled: true,
      cookieName: '_interiowale_affinity',
      ttl: 3600, // 1 hour
    }
  },

  compression: {
    enabled: true,
    level: 6,
    threshold: 1024, // 1KB
    types: [
      'text/*',
      'application/json',
      'application/javascript',
      'text/css',
      'text/html',
      'text/xml',
      'application/xml+rss',
      'application/atom+xml',
      'image/svg+xml',
    ]
  },

  security: {
    enabled: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://*.clerk.accounts.dev",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.sanity.io https://*.clerk.accounts.dev",
        "font-src 'self' data:",
        "connect-src 'self' https://api.stripe.com https://*.sanity.io https://resend.com https://*.clerk.accounts.dev",
        "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    }
  }
};

// Environment-specific configurations
export const environmentConfigs = {
  development: {
    ...defaultLoadBalancerConfig,
    cdn: {
      ...defaultLoadBalancerConfig.cdn,
      enabled: false, // Disable CDN in development
    },
    rateLimiting: {
      ...defaultLoadBalancerConfig.rateLimiting,
      enabled: false, // Disable rate limiting in development
    },
    caching: {
      ...defaultLoadBalancerConfig.caching,
      defaultTtl: 10, // Very short cache in development
      strategies: {
        // Disable caching for most routes in development
        '/': { ttl: 0, strategy: 'network-first' },
        '/api/*': { ttl: 0, strategy: 'network-first' },
      }
    }
  },

  staging: {
    ...defaultLoadBalancerConfig,
    cdn: {
      ...defaultLoadBalancerConfig.cdn,
      cacheTtl: {
        ...defaultLoadBalancerConfig.cdn.cacheTtl,
        static: 3600, // 1 hour in staging
        api: 60,      // 1 minute in staging
        pages: 30,    // 30 seconds in staging
      }
    },
    rateLimiting: {
      ...defaultLoadBalancerConfig.rateLimiting,
      maxRequests: 500, // Lower limit for staging
    }
  },

  production: defaultLoadBalancerConfig,
};

// Get configuration based on environment
export function getLoadBalancerConfig(): LoadBalancerConfig {
  const env = process.env.NODE_ENV || 'development';
  return environmentConfigs[env as keyof typeof environmentConfigs] || defaultLoadBalancerConfig;
}

// Generate CDN cache headers
export function generateCacheHeaders(config: LoadBalancerConfig, path: string): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!config.caching.enabled) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    return headers;
  }

  // Find matching strategy
  const strategy = Object.entries(config.caching.strategies).find(([pattern]) => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(path);
  });

  if (strategy) {
    const [, { ttl, strategy: cacheStrategy }] = strategy;

    if (ttl === 0) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
      switch (cacheStrategy) {
        case 'cache-first':
          headers['Cache-Control'] = `public, max-age=${ttl}`;
          break;
        case 'network-first':
          headers['Cache-Control'] = `public, max-age=${ttl}, must-revalidate`;
          break;
        case 'stale-while-revalidate':
          headers['Cache-Control'] = `public, max-age=${ttl}, stale-while-revalidate=${config.caching.staleWhileRevalidate}`;
          break;
      }
    }
  } else {
    // Default caching
    headers['Cache-Control'] = `public, max-age=${config.caching.defaultTtl}`;
  }

  return headers;
}

// Generate security headers
export function generateSecurityHeaders(config: LoadBalancerConfig): Record<string, string> {
  if (!config.security.enabled) {
    return {};
  }

  return { ...config.security.headers };
}