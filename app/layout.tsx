import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rainbow Catcher Game',
  description: 'Catch the rainbow and win the game!',
  generator: 'Next.js',
  applicationName: 'Rainbow Catcher Game',
  keywords: ['Rainbow', 'Catcher', 'Game'],
  authors: [{ name: 'minhduc5a15', url: 'https://github.com/minhduc5a15' }],
  creator: 'Pham Duc',
  publisher: 'Pham Duc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
