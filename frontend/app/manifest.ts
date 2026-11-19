import type { MetadataRoute } from 'next';
import { asset } from '@/lib/basePath';

export const dynamic = 'force-static';

// Web app manifest: lets phones install the site to the home screen and open it
// full-screen, like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BUN & PATTY — Burger Bar Tbilisi',
    short_name: 'BUN & PATTY',
    description: 'Smash burgers in Tbilisi — order for pickup or delivery.',
    start_url: asset('/'),
    scope: asset('/'),
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2EBDF',
    theme_color: '#F2EBDF',
    icons: [
      { src: asset('/icon.svg'), sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: asset('/icon.svg'), sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
