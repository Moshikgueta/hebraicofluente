'use client';

/* A abertura da lição dentro do lugar do módulo (28/10/2026, a aventura
 * ilustrada; a lição de referência é a do Mem).
 * ─────────────────────────────────────────────────────────────────────────
 * A letra nova chega no lugar do módulo dela: o Mem e o Álef no mar, o
 * Guímel no jardim, o Áyin na cidade. O cenário entra em camadas (céu,
 * depois o resto) e a letra se revela logo abaixo, como antes. Nada do
 * conteúdo da lição muda: isto é a moldura do passo "Descobrir".
 *
 * O nome do lugar em hebraico só aparece quando o aluno já conhece todas as
 * letras dele (no Mem, הַיָם ainda não: falta o Yod e o He). Antes disso o
 * selo diz só o lugar em português. Uma palavra com letra ainda não ensinada
 * nunca é apresentada como coisa para ler.
 */

import { He } from '@/components/hebrew/He';
import { Cenario, LUGAR, type IdDoCenario } from '@/components/aventura/Cenarios';

const FINAIS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** As letras-base de uma palavra, sem sinais e com as finais trocadas. */
export function letrasDe(he: string): string[] {
  return [...he.normalize('NFD')].filter(c => /[א-ת]/.test(c)).map(c => FINAIS[c] ?? c);
}

export function AberturaDoLugar({ modulo, ensinadas }: {
  modulo: number;
  /** As letras (glifo base) que o aluno já viu, contando a desta lição. */
  ensinadas: ReadonlySet<string>;
}) {
  if (modulo < 1 || modulo > 7) return null;
  const n = modulo as IdDoCenario;
  const lugar = LUGAR[n];
  const legivel = letrasDe(lugar.he).every(l => ensinadas.has(l));
  return (
    <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-1 h-[128px] sm:h-[168px] overflow-hidden
                    rounded-t-[inherit] border-b border-line il-entra">
      <Cenario n={n} vivo />
      <p className="absolute left-3 bottom-2.5 m-0 inline-flex items-baseline gap-2 rounded-full
                    bg-[var(--card)]/92 px-3 py-0.5 shadow-[var(--sh)]">
        <span className="font-ui text-[12px] font-semibold text-ink whitespace-nowrap">Módulo {modulo} · {lugar.pt}</span>
        {legivel && <span className="text-[16px] text-ink"><He size="inline">{lugar.he}</He></span>}
      </p>
    </div>
  );
}
