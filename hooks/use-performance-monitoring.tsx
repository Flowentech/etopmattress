import { useEffect, useState } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Only monitor in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    setIsMonitoring(true);

    const handleMetric = (metric: any) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric.value,
      }));

      // Log performance metrics to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Send to your analytics service
        console.log('Performance Metric:', metric.name, metric.value);
      }
    };

    const vitalsHandler = getCLS(handleMetric);
    const vitalsHandlerFID = getFID(handleMetric);
    const vitalsHandlerFCP = getFCP(handleMetric);
    const vitalsHandlerLCP = getLCP(handleMetric);
    const vitalsHandlerTTFB = getTTFB(handleMetric);

    return () => {
      vitalsHandler();
      vitalsHandlerFID();
      vitalsHandlerFCP();
      vitalsHandlerLCP();
      vitalsHandlerTTFB();
    };
  }, []);

  const measureComponentLoad = (componentName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      }

      return loadTime;
    };
  };

  const measureImageLoad = (imageSrc: string) => {
    const startTime = performance.now();

    const img = new Image();
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image ${imageSrc} loaded in ${loadTime.toFixed(2)}ms`);
      }
    };
    img.src = imageSrc;

    return img;
  };

  const getPerformanceScore = () => {
    const { LCP, FID, CLS, TTFB } = metrics;

    if (!LCP || !FID || !CLS || !TTFB) return null;

    let score = 100;

    // LCP scoring (0-2.5 is good)
    if (LCP > 4) score -= 25;
    else if (LCP > 2.5) score -= 15;

    // FID scoring (0-100ms is good)
    if (FID > 300) score -= 25;
    else if (FID > 100) score -= 15;

    // CLS scoring (0-0.1 is good)
    if (CLS > 0.25) score -= 25;
    else if (CLS > 0.1) score -= 15;

    // TTFB scoring (0-800ms is good)
    if (TTFB > 1800) score -= 25;
    else if (TTFB > 800) score -= 15;

    return Math.max(0, score);
  };

  const getPerformanceGrade = () => {
    const score = getPerformanceScore();
    if (!score) return 'Unknown';

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return {
    metrics,
    isMonitoring,
    measureComponentLoad,
    measureImageLoad,
    getPerformanceScore,
    getPerformanceGrade,
  };
}