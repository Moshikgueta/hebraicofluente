/* Os ícones da navegação do curso.
 * ─────────────────────────────────────────────────────────────────────────
 * SVG de traço, 17px, `stroke-width` 1.5, pontas arredondadas - o mesmo peso
 * do resto do sistema. Herdam `currentColor`, então o mesmo desenho serve na
 * sidebar navy e na barra inferior clara sem uma segunda versão.
 *
 * Substituem os caracteres geométricos (◉ ◎ ↻ ◈ ◆) que estavam aqui. Glifo
 * de fonte como ícone tem dois problemas: o desenho muda de sistema para
 * sistema, e nenhum deles quer dizer nada - um losango não é "conquistas".
 */

type P = { size?: number; className?: string };

const wrap = (d: React.ReactNode, { size = 17, className = '' }: P) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden
       className={`shrink-0 ${className}`} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

/** Hoje: uma casa. O que fazer agora. */
export const IconeHoje = (p: P) => wrap(
  <>
    <path d="M3.2 8.6 10 3.2l6.8 5.4V16a.8.8 0 0 1-.8.8H4a.8.8 0 0 1-.8-.8V8.6Z" stroke="currentColor" />
    <path d="M8 16.8v-4.4h4v4.4" stroke="currentColor" />
  </>, p);

/** Mapa: o caminho inteiro. */
export const IconeMapa = (p: P) => wrap(
  <>
    <path d="M3 5.6 7.4 4l5.2 1.8L17 4.2v10.2l-4.4 1.6-5.2-1.8L3 15.8V5.6Z" stroke="currentColor" />
    <path d="M7.4 4v11.8M12.6 5.8v10.2" stroke="currentColor" />
  </>, p);

/** Revisão: a seta que volta. */
export const IconeRevisao = (p: P) => wrap(
  <>
    <path d="M16.6 7A7 7 0 1 0 17.4 10.4" stroke="currentColor" />
    <path d="M16.6 3v4h-4" stroke="currentColor" />
  </>, p);

/** Praticar: o alvo. */
export const IconePraticar = (p: P) => wrap(
  <>
    <circle cx="10" cy="10" r="6.8" stroke="currentColor" />
    <circle cx="10" cy="10" r="2.6" stroke="currentColor" />
  </>, p);

/** Conquistas: os números que sobem. */
export const IconeConquistas = (p: P) => wrap(
  <>
    <path d="M4 16V9.2M10 16V4M16 16v-4.6" stroke="currentColor" />
  </>, p);

/** Perfil: a pessoa. */
export const IconePerfil = (p: P) => wrap(
  <>
    <circle cx="10" cy="7.2" r="3.2" stroke="currentColor" />
    <path d="M3.8 16.6c.6-3.1 3.2-4.8 6.2-4.8s5.6 1.7 6.2 4.8" stroke="currentColor" />
  </>, p);
