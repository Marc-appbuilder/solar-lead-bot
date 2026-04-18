import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SolarDesk',
  description: 'AI-powered solar lead capture widget.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
