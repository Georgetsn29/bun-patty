import type { MetadataRoute } from 'next';

// Web app manifest: lets phones install the site to the home screen and open it
// full-screen, like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BUN & PATTY — Burger Bar Tbilisi',
    short_name: 'BUN & PATTY',
    description: 'Smash burgers in Tbilisi — order for pickup or delivery.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2EBDF',
    theme_color: '#F2EBDF',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
