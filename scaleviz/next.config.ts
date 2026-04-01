import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
