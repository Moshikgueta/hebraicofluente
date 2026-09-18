import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ProgressProvider } from '@/lib/state/store';
import { AppShell } from '@/components/shell/AppShell';
import { course } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Hebraico Fluente — aprenda a ler hebraico',
  description:
    'Curso interativo de alfabetização em hebraico moderno para brasileiros adultos. ' +
    'As 22 letras, os sinais de vogal, leitura e escrita — do zero.',
  /* No Hebrew in <title> or <meta>: those cannot carry a direction span, so a
     Hebrew run there reorders with no way to isolate it. */
  applicationName: 'Hebraico Fluente'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F6F4' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0F11' }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" dir="ltr">
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3
                     focus:bg-surface focus:text-ink focus:px-4 focus:py-2 focus:rounded-md"
        >
          Pular para o conteúdo
        </a>
        <ProgressProvider totalLetters={course.totalLetters}>
          <AppShell>
            <div id="conteudo">{children}</div>
          </AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
