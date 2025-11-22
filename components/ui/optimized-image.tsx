import Image, { ImageProps } from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  wrapperClassName?: string;
  enableBlur?: boolean;
  priorityLoad?: boolean;
  lazyBoundary?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallback = '/images/placeholder.jpg',
  enableBlur = true,
  priorityLoad = false,
  lazyBoundary = '200px',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priorityLoad);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priorityLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: lazyBoundary,
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priorityLoad, lazyBoundary]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-200 animate-pulse',
          wrapperClassName
        )}
        style={{
          width: props.width || '100%',
          height: props.height || 'auto',
          aspectRatio: props.style?.aspectRatio || 'auto'
        }}
      />
    );
  }

  return (
    <div className={cn('relative', wrapperClassName)}>
      {isLoading && enableBlur && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      <Image
        src={hasError ? fallback : src}
        alt={alt}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
          hasError && 'opacity-50',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priorityLoad}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        quality={85}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}