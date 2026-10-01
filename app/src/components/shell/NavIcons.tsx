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

/** Aula 0: o livro aberto. O que se lê antes, e se relê depois. */
export const IconeAula0 = (p: P) => wrap(
  <>
    <path d="M10 5.9C8.7 4.7 7 4.2 4.7 4.2a.8.8 0 0 0-.8.8v8.6c0 .45.35.8.8.8 2.3 0 4 .5 5.3 1.7
             1.3-1.2 3-1.7 5.3-1.7a.8.8 0 0 0 .8-.8V5a.8.8 0 0 0-.8-.8c-2.3 0-4 .5-5.3 1.7Z"
          stroke="currentColor" />
    <path d="M10 5.9v10.2" stroke="currentColor" />
  </>, p);

/** Palavras: duas fichas de vocabulário, uma sobre a outra. */
export const IconePalavras = (p: P) => wrap(
  <>
    <rect x="3.4" y="6" width="10.6" height="10.6" rx="1.2" stroke="currentColor" />
    <path d="M6.6 3.4h8.8a1.2 1.2 0 0 1 1.2 1.2v8.8" stroke="currentColor" />
    <path d="M6.2 10h5M6.2 12.8h3.2" stroke="currentColor" />
  </>, p);

/** Recompensas: um presente. Onde o XP vira alguma coisa. */
export const IconeRecompensas = (p: P) => wrap(
  <>
    <rect x="3.4" y="7.6" width="13.2" height="3.2" rx=".8" stroke="currentColor" />
    <path d="M4.6 10.8v5a.8.8 0 0 0 .8.8h9.2a.8.8 0 0 0 .8-.8v-5M10 7.6v9" stroke="currentColor" />
    <path d="M10 7.6C9.2 5.2 7.9 4 6.7 4.1c-1 .1-1.5 1-1.1 1.9.5 1 2 1.6 4.4 1.6Zm0 0c.8-2.4 2.1-3.6 3.3-3.5 1 .1 1.5 1 1.1 1.9-.5 1-2 1.6-4.4 1.6Z"
          stroke="currentColor" />
  </>, p);

/** Perfil: a pessoa. */
export const IconePerfil = (p: P) => wrap(
  <>
    <circle cx="10" cy="7.2" r="3.2" stroke="currentColor" />
    <path d="M3.8 16.6c.6-3.1 3.2-4.8 6.2-4.8s5.6 1.7 6.2 4.8" stroke="currentColor" />
  </>, p);

/* ── ícones de estado (01/10/2026, auditoria VIS-018) ─────────────────────
   Substituem emojis coloridos (🔒 🔊 🔥 🛡️ 📜 ✨) que destoavam deste sistema
   de traço. Os selos da lição (⚠️ 💡 🧠 📖) ficam: são um vocabulário à parte,
   descrito em lib/selos.ts. */

/** Trancado: o cadeado. */
export const IconeCadeado = (p: P) => wrap(
  <>
    <rect x="4.6" y="9" width="10.8" height="7.8" rx="1.4" stroke="currentColor" />
    <path d="M7 9V6.6a3 3 0 0 1 6 0V9" stroke="currentColor" />
  </>, p);

/** Ouvir: o alto-falante. */
export const IconeSom = (p: P) => wrap(
  <>
    <path d="M3.6 8v4h2.8l4 3.2V4.8l-4 3.2H3.6Z" stroke="currentColor" />
    <path d="M13.2 7.4a3.6 3.6 0 0 1 0 5.2M15.4 5.4a6.6 6.6 0 0 1 0 9.2" stroke="currentColor" />
  </>, p);

/** Sequência: a chama. */
export const IconeChama = (p: P) => wrap(
  <path d="M10 17c-3 0-5-2-5-4.8 0-2.6 2-4.2 2.6-6.6.9 1 1.3 2 1.3 3 1.2-1.3 2.1-3.4 1.6-5.6 2.9 1.6 4.5 4.6 4.5 7.4C15 15 13 17 10 17Z" stroke="currentColor" />,
  p);

/** Folga: o escudo. */
export const IconeEscudo = (p: P) => wrap(
  <path d="M10 2.8 4.2 5v4.6c0 3.6 2.5 6.3 5.8 7.6 3.3-1.3 5.8-4 5.8-7.6V5L10 2.8Z" stroke="currentColor" />,
  p);

/** Leitura bônus: o pergaminho. */
export const IconePergaminho = (p: P) => wrap(
  <>
    <path d="M6 3.6h8.4a1.6 1.6 0 0 1 1.6 1.6v.8h-2.4M6 3.6a1.6 1.6 0 0 0-1.6 1.6v9.6a1.6 1.6 0 0 0 1.6 1.6h7.6a1.6 1.6 0 0 0 1.6-1.6V6" stroke="currentColor" />
    <path d="M7.4 8h5.2M7.4 10.6h5.2M7.4 13.2h3.2" stroke="currentColor" />
  </>, p);

/** Nome decorado: o brilho. */
export const IconeBrilho = (p: P) => wrap(
  <>
    <path d="M9 3.4 10.3 7.7 14.6 9 10.3 10.3 9 14.6 7.7 10.3 3.4 9 7.7 7.7 9 3.4Z" stroke="currentColor" />
    <path d="M15 13.4v3.2M13.4 15h3.2" stroke="currentColor" />
  </>, p);
