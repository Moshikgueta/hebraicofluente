'use client';

/* Antes e depois - o cartão que devolve ao aluno o que ele não vê acontecer.
 * ─────────────────────────────────────────────────────────────────────────
 * A escolha da frase mora em lib/antes-depois.ts, pura e testada. Aqui só
 * mora a tela, e ela tem uma regra: o significado NÃO aparece sozinho.
 *
 * A pessoa lê primeiro. Se o português estivesse na tela junto do hebraico,
 * o olho iria nele - é o alfabeto que ela lê desde criança - e o cartão
 * viraria uma legenda em vez de uma leitura. O botão existe para segurar
 * esse meio segundo.
 *
 * Pelo mesmo motivo a transliteração só sai depois, junto do significado:
 * antes disso ela substitui a leitura em vez de ajudá-la.
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Prose } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { allLetters, sentencesUpTo } from '@/lib/content';
import { isLessonComplete } from '@/lib/state/rules';
import { antesEDepois, ordemCorrida } from '@/lib/antes-depois';
import { tx } from '@/i18n/telas/conta-plataforma-pecas';
import { LOCALE_INTL } from '@/i18n';

/** "14 de março" - sem o ano, que só envelhece o cartão. */
const emPortugues = (dia: string) => {
  const d = new Date(`${dia}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dia;
  return d.toLocaleDateString(LOCALE_INTL, { day: 'numeric', month: 'long', timeZone: 'UTC' });
};

export function AntesEDepois() {
  const p = useProgress();
  const [aberto, setAberto] = useState(false);

  const letras = allLetters();
  const ordem = ordemCorrida(letras, id => isLessonComplete(p.state, id));
  const inicio = p.state.onboarding?.completedAt?.slice(0, 10) ?? null;
  const achado = antesEDepois(sentencesUpTo(ordem), ordem, inicio, p.day);
  if (!achado) return null;

  const { frase, desde, dias, total } = achado;

  return (
    <Card tone="wash" className="p-5 sm:p-7 grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Badge tone="accent">{tx.antesEDepois}</Badge>
        <p className="font-ui text-[13px] text-ink-muted tabular-nums">
          {/* "destravadas" e não "lidas": o curso sabe quais frases estão ao
              alcance das letras que a pessoa fechou, e não quantas ela leu. */}
          {tx.frasesDestravadas(total)}
        </p>
      </div>

      <p className="font-display text-[19px] sm:text-[21px] font-semibold leading-[1.25] tracking-[-0.018em] text-ink">
        {tx.eraUmDesenho(emPortugues(desde), dias)}
      </p>

      <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-2 py-2"
           dir="rtl" lang="he">
        {frase.words.map((w, k) => (
          <He key={k} size={frase.words.length > 2 ? 'lg' : 'xl'}>{w.he}</He>
        ))}
      </div>

      {!aberto ? (
        <div className="grid gap-2 justify-items-center">
          <Button variant="ghost" onClick={() => setAberto(true)}>
            {tx.oQueEstaEscrito}
          </Button>
          <p className="font-ui text-[13px] text-ink-muted text-center">
            {tx.leiaAntes}
          </p>
        </div>
      ) : (
        <div className="grid gap-1.5 text-center">
          <p className="font-display text-[20px] sm:text-[22px] font-bold text-ink">{frase.pt}</p>
          <p className="font-ui text-[14px] text-ink-muted">{frase.translit}</p>
          <p className="font-ui text-[14px] leading-relaxed text-ink-body max-w-[46ch] mx-auto pt-1">
            {/* `Prose` e não um replace: o hebraico dentro da nota tem de sair
                em <He>, ou num parágrafo em português ele reordena sozinho. */}
            <Prose text={frase.notePt} />
          </p>
        </div>
      )}
    </Card>
  );
}
