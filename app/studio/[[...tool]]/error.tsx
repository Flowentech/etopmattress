'use client';

import { useEffect } from 'react';

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Studio error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Studio Connection Issue
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Could not establish connection to Sanity Studio'}
        </p>
        <button
          onClick={reset}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
