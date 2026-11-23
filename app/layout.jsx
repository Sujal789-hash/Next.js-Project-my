import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
  title: 'PitchConnect – Where Ambitious Startups Meet Visionary Investors',
  description: 'The institutional venture matching, pitch deck due diligence, and investor calendar booking platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ivory text-charcoal antialiased selection:bg-emerald selection:text-white min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

