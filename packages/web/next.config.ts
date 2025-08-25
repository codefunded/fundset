import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPostHogConfig } from '@posthog/nextjs-config';
import { env } from '@/env';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './src/i18n/locales/en.json',
  },
});

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      // rewrites to bundler for account abstraction in evm settlement layer due to CORS not being set by the bundler. ONLY IN DEV
      return [
        {
          source: '/api/bundler/:path*',
          destination: 'http://localhost:4337/1/:path*',
        },
      ];
    }

    return [];
  },
};

const withPostHog = (config: NextConfig) => {
  if (!env.NEXT_PUBLIC_POSTHOG_HOST || !env.POSTHOG_API_KEY || !env.POSTHOG_ENV_ID) {
    return config;
  }

  return withPostHogConfig(config, {
    personalApiKey: env.POSTHOG_API_KEY || '', // Personal API Key
    envId: env.POSTHOG_ENV_ID || '', // Environment ID
    host: env.NEXT_PUBLIC_POSTHOG_HOST, // (optional), defaults to https://us.posthog.com
    sourcemaps: {
      enabled: true,
      project: 'fundset',
      version: '1.0.0',
      deleteAfterUpload: true,
    },
  });
};

export default withPostHog(
  withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false }),
);
