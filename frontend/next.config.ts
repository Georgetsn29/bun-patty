import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDev ? '.next-dev' : '.next',
    output: isDev ? undefined : 'standalone',
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    sassOptions: {
      includePaths: ['./src/styles'],
    },
    // Allow access to remote image placeholder.
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // This allows any path under the hostname
        },
      ],
    },

    // Redirect old Journal, Blog, and FAQ paths to Home
    async redirects() {
      return [
        { source: '/journal', destination: '/', permanent: false },
        { source: '/journal/:slug*', destination: '/', permanent: false },
        { source: '/blog', destination: '/', permanent: false },
        { source: '/blog/:slug*', destination: '/', permanent: false },
        { source: '/faq', destination: '/', permanent: false },
        { source: '/faq/:slug*', destination: '/', permanent: false },
      ];
    },

    webpack: (config, {dev}) => {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
}
