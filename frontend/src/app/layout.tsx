import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { I18nProvider } from '@/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeetingMind — Never Lose a Commitment',
  description: 'AI-powered meeting intelligence that extracts every commitment — who promised what, by when, and for how much.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('meetingmind-theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-dark-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
