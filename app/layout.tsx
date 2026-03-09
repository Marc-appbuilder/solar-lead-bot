import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monty',
  description: 'Embeddable AI chat widget, powered by Claude.',
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
