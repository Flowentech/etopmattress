import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function LazySection({
  children,
  className,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  as: Component = 'div',
  ...props
}: LazySectionProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  const ComponentToRender = Component as React.ElementType;

  return (
    <ComponentToRender
      ref={ref}
      className={cn('transition-all duration-300', className)}
      {...props}
    >
      {isInView ? (
        <div className={cn(!hasLoaded && 'animate-fade-in')}>
          {children}
        </div>
      ) : (
        placeholder || (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        )
      )}
    </ComponentToRender>
  );
}