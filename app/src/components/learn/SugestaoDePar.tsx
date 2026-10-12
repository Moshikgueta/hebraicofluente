'use client';

/* "Vamos praticar a diferença entre ד e ר?" (12/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quando o aluno troca as mesmas duas letras duas vezes ou mais
 * (`topConfusions`, que já ignora o deslize de uma vez só), o fim de uma
 * lição, de uma revisão ou de um checkpoint oferece treinar SÓ esse par: a
 * Batalha abre com ele primeiro (`/academia?jogo=batalha&par=דר`). Sem
 * troca repetida, não aparece nada. Sem modelo de IA: é a lista de trocas
 * que o próprio aluno fez. */
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';

export const linkDoPar = (a: string, b: string): string =>
  `/academia?jogo=batalha&par=${encodeURIComponent(a + b)}`;

export function SugestaoDePar() {
  const p = useProgress();
  const c = p.confusions[0];
  if (!c) return null;
  return (
    <Card tone="wash" className="p-5 grid gap-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div className="grid gap-1 min-w-0">
        <p className="font-display text-[17px] font-semibold text-ink m-0">
          Vamos praticar a diferença entre <He size="inline">{c.correct}</He> e <He size="inline">{c.chosen}</He>?
        </p>
        <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
          {`Você trocou estas duas letras ${c.n} vezes. Uma rodada curta só com elas ajuda a separar uma da outra.`}
        </p>
      </div>
      <LinkButton href={linkDoPar(c.correct, c.chosen)} className="shrink-0">Praticar agora</LinkButton>
    </Card>
  );
}
