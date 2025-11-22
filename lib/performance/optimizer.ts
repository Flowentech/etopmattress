import Image from 'next/image';
import { PerformanceMetrics } from '@/hooks/use-performance-monitoring';

export class PerformanceOptimizer {
  // Image optimization utilities
  static getOptimizedImageProps(src: string, priority: boolean = false, sizes?: string) {
    return {
      src,
      priority,
      sizes: sizes || '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
      quality: 85,
      placeholder: 'blur',
      blurDataURL: this.generateBlurDataURL(src),
      loading: priority ? 'eager' : 'lazy',
      decoding: 'async',
    };
  }

  static generateBlurDataURL(src: string): string {
    // Generate a simple blur placeholder for external images
    const isUnsplash = src.includes('unsplash.com');

    if (isUnsplash) {
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMCAwAAAAAAAAAAAAAAAABAgMEBREhEjFBUWFxgf/aAAgBAQEBAAAAAAAAAAAAAAAAAAADAIBAQQL/xAAhEQEBAQACAwEAAAAAAAAAAAABEQISITFBUWFxgf/aAAgBAgEBAAAAAAAAAAAAAAAAAAADAIBAgT/xAAhEQEBAQEAAgAAAAAAAAAAAAABESESMUFRYXH/2gAIAQEAAgMBAAAAAAAAAAAAABESESMxQVFhcf/aAAwDAQACAQEBAAAAAAAAAAAAABEBIRITQVGFxof/aAAgBAgEBAAAAAAAAAAAAAAAAAAADAIBAgT/xAAlEAACAQMCBQAAAAAAAAAAAAABESESMUFRYXH/2gAIAQEAAgMBAAAAAAAAAAAAABESESMxQVFhcf/aAAwDAQACAQEBAAAAAAAAAAAAABEBIRITQVGFxof/2gAIAQEAAgMBAAAAAAAAAAAAABESESMxQVFhcf/aAAwDAQACAQEBAAAAAAAAAAAAABEBIRITQVGFxof/8AAEQgAFBQUAAAAAAAAAAAAAAAAAAEQMSESBFhcf/aAAgBAgEBAAAAAAAAAAAAAAAAAAADAIBAQQL';
    }
    return '';
  }

  // Preload critical images
  static preloadImage(src: string, priority: boolean = true) {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = priority ? 'high' : 'low';
      document.head.appendChild(link);
    }
  }

  // Preload fonts
  static preloadFont(fontUrl: string, fontFamily: string) {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }

  // Preconnect to external domains
  static preconnect(domain: string) {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    }
  }

  // DNS prefetch
  static dnsPrefetch(domain: string) {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    }
  }

  // Optimize bundle loading
  static loadComponentLazy(componentPath: string) {
    return import(componentPath);
  }

  // Performance measurement
  static measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T {
    return (...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Send to your analytics service
        gtag('event', 'performance_metric', {
          event_category: 'function_performance',
          event_label: name,
          value: Math.round(end - start),
        });
      }

      return result;
    };
  }

  // Optimize image loading for different contexts
  static getImagePropsForContext(
    src: string,
    context: 'hero' | 'product' | 'thumbnail' | 'avatar' | 'banner'
  ) {
    const baseProps = this.getOptimizedImageProps(src);

    switch (context) {
      case 'hero':
        return {
          ...baseProps,
          priority: true,
          quality: 90,
          sizes: '(max-width: 640px) 100vw, (max-width: 1920px) 100vw, 1200px',
        };

      case 'product':
        return {
          ...baseProps,
          priority: false,
          quality: 85,
          sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
        };

      case 'thumbnail':
        return {
          ...baseProps,
          priority: false,
          quality: 75,
          sizes: '(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 16vw',
        };

      case 'avatar':
        return {
          ...baseProps,
          priority: false,
          quality: 80,
          sizes: '64px',
          unoptimized: true,
        };

      case 'banner':
        return {
          ...baseProps,
          priority: true,
          quality: 85,
          sizes: '(max-width: 640px) 100vw, (max-width: 1920px) 100vw, 1200px',
        };

      default:
        return baseProps;
    }
  }

  // Optimize for Core Web Vitals
  static optimizeForCoreWebVitals() {
    // Preload critical resources
    this.preconnect('https://js.stripe.com');
    this.preconnect('https://api.clerk.dev');
    this.preconnect('https://fonts.googleapis.com');
    this.preconnect('https://fonts.gstatic.com');
    this.dnsPrefetch('https://cdn.sanity.io');
    this.dnsPrefetch('https://images.unsplash.com');

    // Preload critical images
    this.preloadImage('/images/Interio_AI.gif', true);
  }

  // Get performance score
  static getPerformanceScore(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      // Wait for page load
      if (document.readyState === 'complete') {
        this.calculateScore(resolve);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => this.calculateScore(resolve), 100);
        });
      }
    });
  }

  private static calculateScore(resolve: (score: number) => void) {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      const LCP = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
      const FCP = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const TTFB = navigation?.responseStart || 0;

      // Simple scoring algorithm
      let score = 100;

      // LCP scoring (0-2.5s is good)
      if (LCP > 4) score -= 25;
      else if (LCP > 2.5) score -= 15;

      // FCP scoring (0-1.8s is good)
      if (FCP > 3) score -= 20;
      else if (FCP > 1.8) score -= 10;

      // TTFB scoring (0-800ms is good)
      if (TTFB > 1800) score -= 20;
      else if (TTFB > 800) score -= 10;

      resolve(Math.max(0, score));
    } catch (error) {
      console.error('Error calculating performance score:', error);
      resolve(0);
    }
  }
}

export default PerformanceOptimizer;