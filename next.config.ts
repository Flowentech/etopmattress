import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "@/lib/security/config";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  compress: true,
  poweredByHeader: false,

  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    const headers = [
      {
        source: '/((?!studio).*)',
        headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
          key,
          value,
        })),
      },
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];

    if (isDev) {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      });
    }

    return headers;
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const modulePath = module.context || '';
              const packageName = modulePath.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
              return packageName ? `npm.${packageName.replace('@', '')}` : 'vendor';
            },
            priority: -10,
            chunks: 'all',
          },
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            priority: 20,
            chunks: 'all',
          },
          clerk: {
            test: /[\\/]node_modules[\\/]@clerk[\\/]/,
            name: 'clerk',
            priority: 15,
            chunks: 'all',
          },
          ai: {
            test: /[\\/]components[\\/]ai[\\/]/,
            name: 'ai',
            priority: 25,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  output: 'standalone',
};

export default nextConfig;
