import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://charityday-2026.vercel.app'),
  title: 'Make Their Day | Charity Day',
  description: 'NRC',
  openGraph: {
    title: 'Make Their Day | Charity Day',
    description: 'NRC',
    url: 'https://charityday-2026.vercel.app',
    siteName: 'Make Their Day',
    images: [
      {
        url: '/logo.png',
        width: 667,
        height: 667,
        alt: 'Make Their Day Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Make Their Day | Charity Day',
    description: 'NRC',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-brand-black text-white min-h-screen font-poppins selection:bg-brand-red selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
