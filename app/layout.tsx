import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { QueryClientProvider } from '@/components/providers/QueryClientProvider';
import { Toaster } from 'sonner';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'VaultIQ - Financial Document Intelligence',
  description: 'Privacy-first, RBAC-enforced financial document intelligence platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <QueryClientProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0F1629',
                border: '1px solid #1E2A45',
                color: '#E8EDF5',
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
