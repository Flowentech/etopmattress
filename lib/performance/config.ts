// Performance optimization configurations
export const PERFORMANCE_CONFIG = {
  // Image optimization settings
  images: {
    // Quality settings for different image types
    quality: {
      hero: 90,        // Hero banners
      product: 85,     // Product images
      thumbnail: 75,   // Thumbnails
      placeholder: 30, // Blur placeholders
    },

    // Size breakpoints for responsive images
    sizes: {
      xs: 16,    // 16px - favicon size
      sm: 32,    // 32px - small icons
      md: 96,    // 96px - medium thumbnails
      lg: 256,   // 256px - large thumbnails
      xl: 512,   // 512px - small images
      xxl: 1024, // 1024px - medium images
      full: 2048, // 2048px - large images
    },

    // Supported formats (ordered by preference)
    formats: ['image/avif', 'image/webp', 'image/jpeg'],

    // Cache TTL in seconds
    cacheTTL: {
      static: 60 * 60 * 24 * 365,    // 1 year - static assets
      api: 60,                        // 1 minute - API responses
      images: 60 * 60 * 24 * 30,     // 30 days - optimized images
      fonts: 60 * 60 * 24 * 365,     // 1 year - fonts
    },
  },

  // Lazy loading settings
  lazy: {
    // Distance from viewport before loading (in pixels)
    rootMargin: '100px',

    // Intersection observer threshold
    threshold: 0.1,

    // Components that should be lazy loaded
    components: [
      'AI Showcase',
      'Testimonials',
      'FAQ',
      'Footer',
      'Recommended Products',
      'Related Items',
    ],
  },

  // Bundle splitting strategy
  bundles: {
    // Priority chunks that load first
    critical: [
      'layout',
      'navigation',
      'ui-components',
      'clerk-auth',
    ],

    // Chunks that can be lazy loaded
    lazy: [
      'ai-components',
      'product-components',
      'admin-panel',
      'analytics',
      'showcase',
    ],
  },

  // Caching strategies
  cache: {
    // Service worker cache settings
    serviceWorker: {
      // Routes to cache
      staticAssets: [
        '/_next/static/',
        '/images/',
        '/fonts/',
        '/favicon.ico',
      ],

      // Cache version
      version: '1.0.0',

      // Max cache size
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },

    // Browser cache headers
    headers: {
      // Immutable assets
      immutable: 'public, max-age=31536000, immutable',

      // Long-term cache
      longTerm: 'public, max-age=31536000',

      // Short-term cache
      shortTerm: 'public, max-age=86400',

      // API cache with stale-while-revalidate
      swr: 'public, max-age=60, stale-while-revalidate=300',
    },
  },

  // Network optimization
  network: {
    // Enable HTTP/2 push for critical resources
    http2Push: [
      '/_next/static/css/',
      '/_next/static/chunks/',
      '/fonts/',
    ],

    // Preload critical resources
    preload: [
      '/_next/static/css/app.css',
      '/images/Interio_AI.gif',
    ],

    // Prefetch likely resources
    prefetch: [
      '/api/user/profile',
      '/images/products/',
    ],
  },

  // Performance monitoring
  monitoring: {
    // Core Web Vitals thresholds
    webVitals: {
      LCP: 2.5, // Largest Contentful Paint (seconds)
      FID: 100, // First Input Delay (milliseconds)
      CLS: 0.1, // Cumulative Layout Shift
      TTFB: 800, // Time to First Byte (milliseconds)
    },

    // Custom performance metrics
    metrics: {
      imageLoadTime: 2000, // Max image load time (ms)
      apiResponseTime: 1000, // Max API response time (ms)
      bundleLoadTime: 3000, // Max bundle load time (ms)
    },
  },
} as const;

export default PERFORMANCE_CONFIG;