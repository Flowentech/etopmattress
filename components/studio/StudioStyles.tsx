'use client';

import { useEffect } from 'react';

export default function StudioStyles(): null {
  useEffect(() => {
    // Suppress EventSource errors in console
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      if (
        errorMessage.includes('EventSource') ||
        errorMessage.includes('Could not establish') ||
        errorMessage.includes('event-source-polyfill')
      ) {
        // Silently ignore EventSource errors
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Intercept problematic API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];

      if (typeof url === 'string') {
        // Block problematic font files
        if (url.includes('inter_Inter')) {
          return Promise.resolve(new Response('', { status: 200 }));
        }

        // Handle Sanity listen endpoints
        if (url.includes('/listen') || url.includes('/events')) {
          return Promise.resolve(new Response('data: {"type": "welcome"}\n\n', {
            status: 200,
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            }
          }));
        }
      }

      return originalFetch.apply(this, args);
    };

    // Font loading fixes
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

      @font-face {
        font-family: 'Inter';
        src: local('Inter'), local('Inter Regular');
        font-weight: 400;
        font-display: swap;
      }

      @font-face {
        font-family: 'Inter';
        src: local('Inter Medium');
        font-weight: 500;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      window.fetch = originalFetch;
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}