import type { Metadata } from 'next';
import { Fira_Code, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { CursorTrail } from '@/components/custom/cursor-trail';
import { AnimatedBackground } from '@/components/custom/animated-background';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rx ❤️ Suha | 11 Month Anniversary',
  description: 'A love story in motion, coded from the heart.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          firaCode.variable,
          playfairDisplay.variable,
          'antialiased min-h-screen flex flex-col'
        )}
      >
        <AnimatedBackground />
        <CursorTrail />
        <main className="flex-grow relative z-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
