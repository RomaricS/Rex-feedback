import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Disable worker threads that were causing issues after removing Turbopack
    workerThreads: false,
  },
  // Configure webpack to be more stable with workers
  webpack: (config, { dev, isServer }) => {
    // Disable webpack's internal Jest worker usage in development
    if (dev) {
      config.cache = false;
      // Reduce memory usage and worker conflicts
      config.parallelism = 1;
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
