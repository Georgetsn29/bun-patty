import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // Sub-path the static site is served from, e.g. "/bun-patty" on GitHub Pages.
  const basePath = isDev ? '' : (process.env.PAGES_BASE_PATH ?? '');

  return {
    distDir: isDev ? '.next-dev' : '.next',
    // Static HTML export (written to ./out) so it can be hosted on GitHub Pages.
    output: isDev ? undefined : 'export',
    basePath,
    trailingSlash: true,
    env: {
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
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
      unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**', // This allows any path under the hostname
        },
      ],
    },

    // Note: redirects() is not supported with a static export. Old /journal, /blog
    // and /faq URLs fall through to the 404 page, which links back home.

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
