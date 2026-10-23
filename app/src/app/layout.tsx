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
  /* Sem preload desde 23/10/2026 (ver a nota acima de `cursive`). */
  preload: false,
  src: [
    { path: '../../../assets/fonts/bricolage-grotesque-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../assets/fonts/bricolage-grotesque-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../assets/fonts/bricolage-grotesque-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../assets/fonts/bricolage-grotesque-latin-700-normal.woff2', weight: '700', style: 'normal' }
  ]
});
const ui = localFont({
  variable: '--font-ui-loaded',
  display: 'swap',
  src: [
    { path: '../../../assets/fonts/instrument-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../assets/fonts/instrument-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../assets/fonts/instrument-sans-latin-600-normal.woff2', weight: '600', style: 'normal' }
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
  /* `block`, e não `swap` (23/10/2026): sem preload, a fonte chega uma volta
     de rede depois, e com `swap` o navegador pintaria o hebraico antes numa
     fonte reserva - com o nikud fora do lugar, que é exatamente o erro que
     esta família existe para evitar. Com `block` o hebraico espera a fonte
     certa (no máximo uns 3 s, depois a reserva) e nunca aparece errado. */
  display: 'block',
  preload: false,
  src: [
    { path: '../../../assets/fonts/noto-serif-hebrew-hebrew-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../assets/fonts/noto-serif-hebrew-hebrew-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../assets/fonts/noto-serif-hebrew-hebrew-600-normal.woff2', weight: '600', style: 'normal' }
  ]
});
/* Preload só da fonte do texto corrido (23/10/2026).
   ─────────────────────────────────────────────────────────────────────────
   Eram 10 `<link rel=preload>` em toda página (4 pesos de Bricolage, 3 de
   Instrument, 3 de Noto Serif Hebrew), 165 KB disputando banda com o CSS e
   o JavaScript antes da primeira pintura. O Lighthouse de celular media a
   maior pintura (LCP) em 3,2 a 3,9 s, e o elemento dela é um parágrafo em
   Instrument Sans. Ficou o preload só dessa família; títulos (Bricolage) e
   hebraico (Noto Serif Hebrew) são pedidos quando o CSS os usa, uma volta de
   rede depois, cada família inteira, sem partir pesos (partir faria o
   navegador sintetizar o negrito). A cursiva já não tinha preload
   (auditoria de 01/10/2026, PERF-006): só aparece nas telas de escrita. */
const cursive = localFont({
  variable: '--font-he-cursive-loaded',
  display: 'swap',
  preload: false,
  src: [{ path: '../../../assets/fonts/gveret-levin-hebrew-400-normal.woff2', weight: '400', style: 'normal' }]
});
import { ProgressoQuandoPrecisa } from '@/components/shell/ProgressoQuandoPrecisa';
import { AccountProvider } from '@/lib/account/store';
import { Chrome } from '@/components/shell/Chrome';
import { BotaoAcessibilidade } from '@/components/shell/BotaoAcessibilidade';
import { EnvioDeEstatisticas } from '@/components/shell/EnvioDeEstatisticas';
import { RegistroDeOrigem } from '@/components/shell/RegistroDeOrigem';
import { SCRIPT_DE_ARRANQUE } from '@/lib/acessibilidade';
import { course } from '@/lib/content-publico';
import { ORIGEM } from '@/lib/seo';

export const metadata: Metadata = {
  /* `metadataBase` é o que transforma "/media/og.jpg" em uma URL absoluta.
     Sem ele o Next emite o caminho relativo, e um caminho relativo num
     `og:image` não é resolvido por nenhum leitor de cartão - o link continua
     chegando sem imagem no WhatsApp, que é o problema que esta camada existe
     para resolver. Ver lib/seo.ts. */
  metadataBase: new URL(ORIGEM),
  title: 'Hebraico Fluente - a plataforma de hebraico para brasileiros',
  /* Sem "do alfabeto à conversa" nem a lista A1/A2/B1: o que se vende hoje é a
     alfabetização, e os outros são cursos à parte, ainda em produção
     (auditoria de 01/10, CONV-011). */
  description:
    'Hebraico para brasileiros, começando pelo alfabeto: aulas interativas, correção na ' +
    'hora e progresso que continua de onde você parou.',
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
      <head>
        {/* Antes da primeira pintura: carimba no <html> a preferência de
            acessibilidade guardada no aparelho. Sem isto, quem escolheu alto
            contraste vê um lampejo do tema claro a cada navegação - um
            defeito pequeno para quem não usa o recurso, e cansativo para o
            público inteiro que usa. Ver lib/acessibilidade.ts. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DE_ARRANQUE }} />
      </head>
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
        {/* `#hf-zoom` envolve TUDO o que o leitor lê: é este contêiner que
            recebe o zoom da preferência de tamanho de texto. O botão de
            acessibilidade fica de fora dele de propósito - um controle de
            zoom que cresce junto com o zoom sai da tela em 150% e prende a
            pessoa no ajuste que ela acabou de fazer. */}
        {/* De onde veio a visita (lib/origem.ts): antes do conteúdo, para o
            efeito rodar antes de a página limpar o endereço. */}
        <RegistroDeOrigem />
        <div id="hf-zoom">
          <AccountProvider>
            {/* As estatísticas de aprendizagem, só com sessão (lib/estatisticas.ts). */}
            <EnvioDeEstatisticas />
            {/* Modules 6 and 7 count toward completion: a bar that reads 100%
                while the reader still cannot handle an unpointed word would be
                lying about the thing the course exists to teach. */}
            <ProgressoQuandoPrecisa
              totalLetters={course.totalLetters}
              extraModuleIds={course.modules.filter(m => !m.letterIds.length).map(m => m.id)}
              somIds={course.modules.flatMap(m => m.lessons.filter(l => l.som).map(l => `som-${l.som}`))}
            >
              <Chrome>
                <div id="conteudo" tabIndex={-1} className="outline-none">{children}</div>
              </Chrome>
            </ProgressoQuandoPrecisa>
          </AccountProvider>
        </div>
        <BotaoAcessibilidade />
      </body>
    </html>
  );
}
