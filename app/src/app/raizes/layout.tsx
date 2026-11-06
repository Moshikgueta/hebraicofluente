import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { RaizesShell } from '@/components/raizes/RaizesShell';
import { CourseGate } from '@/components/shell/CourseGate';
import './raizes.css';

/* O layout de Raízes Sefarditas (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Raízes é um produto à parte, com a estética da coleção editorial (Israel
 * Além do Roteiro, hebraicofluente-editorial/templates/web.css): serifa
 * Literata nos títulos e no texto, rubricas em versalete com fio, números em
 * Bricolage. A Literata entra SÓ aqui: carregada no layout raiz, ela pesaria
 * em toda página do curso de hebraico, que não a usa.
 *
 * O latin-ext vem numa segunda face, empilhada depois da primeira em
 * `--rz-serif`: o navegador cai nela letra por letra, e só baixa o arquivo se
 * a página tiver uma letra dele (ā, ḥ, ʾ, de "Dalālat al-ḥāʾirīn").
 * Literata: SIL Open Font License (assets/fonts/LICENSE-literata.txt).
 */
const literata = localFont({
  variable: '--rz-literata',
  display: 'swap',
  src: [
    { path: '../../../../assets/fonts/literata-latin-opsz-normal.woff2', weight: '200 900', style: 'normal' },
    { path: '../../../../assets/fonts/literata-latin-opsz-italic.woff2', weight: '200 900', style: 'italic' }
  ]
});
const literataExt = localFont({
  variable: '--rz-literata-ext',
  display: 'swap',
  preload: false,
  src: [{ path: '../../../../assets/fonts/literata-latin-ext-opsz-normal.woff2', weight: '200 900', style: 'normal' }]
});

export default function RaizesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`rz ${literata.variable} ${literataExt.variable}`}>
      <RaizesShell>
        <CourseGate>{children}</CourseGate>
      </RaizesShell>
    </div>
  );
}
