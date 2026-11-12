import type {Metadata, Viewport} from 'next';
import '@fontsource/firago/400.css';
import '@fontsource/firago/500.css';
import '@fontsource/firago/600.css';
import '@fontsource/firago/700.css';
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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ka">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
