import type {Metadata, Viewport} from 'next';
import {Suspense} from 'react';
import '@fontsource/firago/400.css';
import '@fontsource/firago/500.css';
import '@fontsource/firago/600.css';
import '@fontsource/firago/700.css';
import '@fontsource/fira-sans-extra-condensed/latin-800.css';
import fs from 'node:fs';
import path from 'node:path';
import { IntroCover } from '@/components/layout/IntroCover';
import { introCoverScript } from '@/components/layout/introCoverScript';
import { INTRO_COVER_SETTINGS } from '@/data/settings';
import '../src/styles/main.scss';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'BUN & PATTY | ბურგერ-ბარი თბილისში · Burger Bar Tbilisi',
  description: 'დამოუკიდებელი ბურგერ-ბარი თბილისში. 260°C ნახშირბადოვან ფოლადზე შემწვარი დაძველებული სმაშ-ბურგერები და რძიანი ბრიოში.',
  openGraph: {
    title: 'BUN & PATTY | ბურგერ-ბარი თბილისში · Burger Bar Tbilisi',
    description: 'დამოუკიდებელი ბურგერ-ბარი თბილისში. 260°C ნახშირბადოვან ფოლადზე შემწვარი დაძველებული სმაშ-ბურგერები და რძიანი ბრიოში.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUN & PATTY | ბურგერ-ბარი თბილისში · Burger Bar Tbilisi',
    description: 'დამოუკიდებელი ბურგერ-ბარი თბილისში. 260°C ნახშირბადოვან ფოლადზე შემწვარი დაძველებული სმაშ-ბურგერები და რძიანი ბრიოში.',
  },
};

/** Use an SVG logo from /public/images/brand for the intro cover if one exists. */
function findBrandLogo(): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'brand');
    const svgs = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.svg'));
    const pick = svgs.find((f) => f.toLowerCase().includes('logo')) ?? svgs[0];
    return pick ? `/images/brand/${pick}` : null;
  } catch {
    return null;
  }
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  const introEnabled = INTRO_COVER_SETTINGS.enabled;

  return (
    <html lang="ka" suppressHydrationWarning>
      <head>
        {introEnabled && (
          <script dangerouslySetInnerHTML={{__html: introCoverScript()}} />
        )}
      </head>
      <body suppressHydrationWarning>
        {introEnabled && (
          <IntroCover durationMs={INTRO_COVER_SETTINGS.durationMs} logoSrc={findBrandLogo()} />
        )}
        {/* Boundary keeps hydration-mismatch recovery (e.g. saved English language) inside the
            page, so React never re-renders <html>/<body> and wipes the intro cover's state. */}
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
