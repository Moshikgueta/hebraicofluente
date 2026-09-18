import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';

/* Loaded through next/font/local rather than @font-face in CSS: Next then owns
   the URLs and rewrites them for whatever base path the site is served from.
   A hand-written url('/fonts/…') would 404 on a project page. */
const display = localFont({
  variable: '--font-display-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/dm-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/dm-sans-latin-700-normal.woff2', weight: '700', style: 'normal' }
  ]
});
const ui = localFont({
  variable: '--font-ui-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' }
  ]
});
/* Noto Sans Hebrew carries 55 nikud marks and a ccmp table — chosen over the
   alternatives by inspecting the binaries, because a font that positions the
   vowel points badly makes every reading exercise in the course wrong. */
const hebrew = localFont({
  variable: '--font-he-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/noto-sans-hebrew-hebrew-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/noto-sans-hebrew-hebrew-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/noto-sans-hebrew-hebrew-700-normal.woff2', weight: '700', style: 'normal' }
  ]
});
const cursive = localFont({
  variable: '--font-he-cursive-loaded',
  display: 'swap',
  src: [{ path: '../../public/fonts/gveret-levin-hebrew-400-normal.woff2', weight: '400', style: 'normal' }]
});
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
    <html
      lang="pt-BR"
      dir="ltr"
      className={`${display.variable} ${ui.variable} ${hebrew.variable} ${cursive.variable}`}
    >
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3
                     focus:bg-surface focus:text-ink focus:px-4 focus:py-2 focus:rounded-md"
        >
          Pular para o conteúdo
        </a>
        {/* Modules 6 and 7 count toward completion: a bar that reads 100%
            while the reader still cannot handle an unpointed word would be
            lying about the thing the course exists to teach. */}
        <ProgressProvider
          totalLetters={course.totalLetters}
          extraModuleIds={course.modules.filter(m => !m.letterIds.length).map(m => m.id)}
        >
          <AppShell>
            <div id="conteudo">{children}</div>
          </AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
