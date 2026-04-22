import type { Metadata } from 'next';
import '../public/styles/global.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Cosplay Portfolio',
  description: 'Professional cosplay photography and portfolio',
  openGraph: {
    type: 'website',
    url: 'https://cosplay-portfolio.vercel.app',
    siteName: 'Cosplay Portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
