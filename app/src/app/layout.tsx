import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';

/* Loaded through next/font/local rather than @font-face in CSS: Next then owns
   the URLs and rewrites them for whatever base path the site is served from.
   A hand-written url('/fonts/…') would 404 on a project page. */
/* As três famílias do design (design/README.md, "Tipografia"). Servidas do
   nosso próprio domínio em vez de fonts.googleapis.com: uma folha de estilo
   de terceiro no caminho crítico atrasa a primeira pintura e entrega o IP de
   cada leitor a outro servidor - e num curso de leitura a fonte não é enfeite
   que pode chegar atrasado.

   Bricolage Grotesque nos títulos. Quatro pesos, só latino: o hebraico nunca
   passa por esta fonte (ver `hebrew` abaixo). */
const display = localFont({
  variable: '--font-display-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/bricolage-grotesque-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/bricolage-grotesque-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/bricolage-grotesque-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/bricolage-grotesque-latin-700-normal.woff2', weight: '700', style: 'normal' }
  ]
});
const ui = localFont({
  variable: '--font-ui-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/instrument-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/instrument-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/instrument-sans-latin-600-normal.woff2', weight: '600', style: 'normal' }
  ]
});
/* Noto SERIF Hebrew - e a troca foi conferida ANTES de ser feita.
   ─────────────────────────────────────────────────────────────────────────
   A face hebraica não se troca por gosto: uma fonte que posiciona mal os
   pontos de vogal torna ERRADO cada exercício de leitura do curso. Então o
   binário foi aberto e comparado com o da Noto Sans Hebrew que estava aqui:

     · 19 de 19 sinais de nikud no cmap, nas duas;
     · 57 glifos classificados como marca no GDEF, nas duas;
     · ccmp no GSUB e mark + mkmk no GPOS, nas duas (a serif ainda traz calt).

   E depois renderizada num navegador de verdade, a 64px e a 104px: שָׁלוֹם,
   מַיִם, מִשְׁפָּחָה e a coluna בָּ בֵּ בִּ בֹּ בֻּ בְּ שׁ שׂ saem com o ponto do shin à
   direita, o daguesh dentro da letra e cada sinal centrado sob a sua
   consoante. A troca é segura. */
const hebrew = localFont({
  variable: '--font-he-loaded',
  display: 'swap',
  src: [
    { path: '../../public/fonts/noto-serif-hebrew-hebrew-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/noto-serif-hebrew-hebrew-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/noto-serif-hebrew-hebrew-600-normal.woff2', weight: '600', style: 'normal' }
  ]
});
const cursive = localFont({
  variable: '--font-he-cursive-loaded',
  display: 'swap',
  src: [{ path: '../../public/fonts/gveret-levin-hebrew-400-normal.woff2', weight: '400', style: 'normal' }]
});
import { ProgressProvider } from '@/lib/state/store';
import { AccountProvider } from '@/lib/account/store';
import { Chrome } from '@/components/shell/Chrome';
import { course } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Hebraico Fluente - a plataforma de hebraico para brasileiros',
  description:
    'Do alfabeto à conversa, numa plataforma só. Alfabetização, A1, A2 e B1 - ' +
    'aulas interativas, correção na hora e progresso que continua de onde você parou.',
  /* No Hebrew in <title> or <meta>: those cannot carry a direction span, so a
     Hebrew run there reorders with no way to isolate it. */
  applicationName: 'Hebraico Fluente'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  /* Uma cor só: o design é uma identidade clara, e a barra do navegador
     acompanha o papel creme em qualquer preferência de sistema. */
  themeColor: '#FBF9F5'
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
        {/* A conta por fora do progresso, e não o contrário: quem decide se
            esta rota pode ser vista é a sessão, e o progresso é o que se
            mostra depois de ela ter deixado passar. O progresso continua
            sendo do APARELHO - ver a nota em lib/account/store.tsx. */}
        <AccountProvider>
          {/* Modules 6 and 7 count toward completion: a bar that reads 100%
              while the reader still cannot handle an unpointed word would be
              lying about the thing the course exists to teach. */}
          <ProgressProvider
            totalLetters={course.totalLetters}
            extraModuleIds={course.modules.filter(m => !m.letterIds.length).map(m => m.id)}
          >
            <Chrome>
              <div id="conteudo">{children}</div>
            </Chrome>
          </ProgressProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
