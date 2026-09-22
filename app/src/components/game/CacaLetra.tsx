'use client';

/* Caça à letra: encontre todas as ocorrências.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma grade de letras e uma instrução: "encontre todas as {{מ}}". O aluno
 * toca em cada uma que achar.
 *
 * ── por que este jogo existe, e o que ele treina ────────────────────────
 * Todos os outros exercícios do curso mostram UMA letra e perguntam algo
 * sobre ela. Ler não é assim: ler é varrer uma linha cheia de formas
 * parecidas e achar a que importa, sem parar em cada uma. Este é o único
 * lugar do curso que treina a varredura.
 *
 * É também onde as formas finais fazem sentido de verdade. Procurar {{ם}}
 * numa grade que também tem {{מ}} e {{ס}} é exatamente o problema de quem lê
 * a primeira palavra real - e não há como ensaiar isso numa pergunta de
 * múltipla escolha.
 *
 * ── as regras de retorno, iguais às do resto do curso ───────────────────
 *   · acerto é teal, com um pop curto, e a célula fica marcada;
 *   · erro é gold, nunca vermelho, e a célula volta ao normal sozinha;
 *   · cor nunca sozinha: o acerto leva ✓ e o erro leva ✕, porque quem não
 *     distingue teal de gold precisa da mesma informação.
 *
 * Errar NÃO tira a rodada. O contador de enganos existe para o relatório do
 * fim, não para castigar - e a rodada só acaba quando as certas foram todas
 * encontradas, que é o que faz a pessoa continuar procurando em vez de
 * desistir.
 *
 * ── toque ───────────────────────────────────────────────────────────────
 * Cada célula tem 60px de altura mínima e a grade nunca passa de cinco
 * colunas num telefone: abaixo disso a letra fica pequena demais para
 * distinguir {{ד}} de {{ר}}, que é justamente o que o jogo pede.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import type { Caca } from '@/lib/engine/jogos';
import { porQueErrou } from '@/lib/engine/jogos';
import type { Letter } from '@/lib/content';
import type { ResultadoJogo } from './Match';

export function CacaLetra({
  caca, unlocked, onFim, onResposta
}: {
  caca: Caca;
  unlocked: readonly Letter[];
  onFim: (r: ResultadoJogo) => void;
  onResposta?: (a: { id: string; letterId: string; certo: boolean; escolhida?: string }) => void;
}) {
  const [achadas, setAchadas] = useState<string[]>([]);
  const [enganos, setEnganos] = useState<string[]>([]);
  const [erros, setErros] = useState(0);
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [dica, setDica] = useState<string | null>(null);
  const inicio = useRef(Date.now());

  const faltam = caca.quantas - achadas.length;
  const acabou = faltam <= 0;

  useEffect(() => {
    if (!acabou) return;
    const t = setTimeout(() => onFim({
      acertos: caca.quantas,
      erros,
      total: caca.quantas,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      letrasErradas: [...new Set(letrasErradas)]
    }), 700);
    return () => clearTimeout(t);
  }, [acabou, caca.quantas, erros, letrasErradas, onFim]);

  const tocar = useCallback((id: string) => {
    if (acabou) return;
    const cel = caca.celulas.find(c => c.id === id);
    if (!cel || achadas.includes(id)) return;

    onResposta?.({
      id: `caca:${caca.alvo.id}:${id}`, letterId: caca.alvo.id, certo: cel.certa,
      /* Qual letra ele tocou por engano é o dado que vira par treinável: sem
         ele, o erro é genérico e a revisão não sabe o que oferecer. */
      escolhida: cel.certa ? undefined : cel.glifo
    });

    if (cel.certa) {
      setAchadas(a => [...a, id]);
      setDica(null);
      return;
    }

    /* O engano some sozinho, e leva junto a marca visual. Deixá-lo aceso
       transformaria a grade num mapa do que já foi tentado, e a segunda
       varredura deixaria de ser uma varredura. */
    setErros(n => n + 1);
    setLetrasErradas(l => [...l, cel.letterId]);
    setEnganos(e => [...e, id]);
    setTimeout(() => setEnganos(e => e.filter(x => x !== id)), 520);

    /* E a frase que ensina, quando existe para este par. */
    const outra = unlocked.find(l => l.id === cel.letterId);
    setDica(outra ? porQueErrou(caca.alvo, outra) : null);
  }, [acabou, achadas, caca, onResposta, unlocked]);

  return (
    <div className="grid gap-4">
      {/* O alvo GRANDE, e não uma letra de corpo de texto.
          ──────────────────────────────────────────────────────────────────
          Na primeira captura ele saiu do tamanho do texto ao redor, ao lado
          de doze células enormes: a única coisa que o aluno precisa fixar na
          memória antes de varrer a grade era a menor coisa da tela. Agora
          ele é uma placa, no mesmo corpo das células - comparar alvo e
          célula passa a ser comparar dois desenhos do mesmo tamanho, que é o
          que o jogo pede. */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <span className="w-[56px] h-[56px] shrink-0 rounded-[var(--r-md)]
                           border border-[color:var(--edge-teal)] bg-[var(--teal-soft)]
                           grid place-items-center">
            <He size="word" tone="teal">{caca.glifo}</He>
          </span>
          <p className="font-ui text-[15px] leading-snug text-ink-body">
            Encontre todas as letras iguais a esta.
          </p>
        </div>
        <p className="font-ui text-[13px] text-ink-muted tabular-nums shrink-0" aria-live="polite">
          {achadas.length} de {caca.quantas}
        </p>
      </div>

      {/* A grade. `auto-fit` com um mínimo de 58px dá cinco colunas num
          telefone de 390 e sete num desktop - sem media query, e sem nunca
          espremer a letra abaixo do tamanho em que ela é legível. */}
      <ul className="grid gap-2 list-none p-0 m-0
                     [grid-template-columns:repeat(auto-fit,minmax(58px,1fr))]">
        {caca.celulas.map(c => {
          const achada = achadas.includes(c.id);
          const enganou = enganos.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => tocar(c.id)}
                disabled={achada || acabou}
                aria-pressed={achada}
                aria-label={achada ? 'encontrada' : 'letra'}
                className={`w-full min-h-[60px] rounded-[var(--r-md)] border grid place-items-center
                  relative transition-[background-color,border-color,transform] duration-150
                  ${achada
                    ? 'border-[var(--teal)] bg-[var(--teal-soft)] scale-[.96]'
                    : enganou
                      ? 'border-[var(--gold)] bg-[var(--gold-soft)]'
                      : 'border-line bg-surface hover:bg-surface-2 active:scale-[.97]'}`}
              >
                <He size="word" tone={achada ? 'teal' : 'ink'} dim={achada}>{c.glifo}</He>
                {/* Nunca só a cor. */}
                {(achada || enganou) && (
                  <span aria-hidden
                        className={`absolute top-1 right-1.5 font-ui text-[12px] font-bold
                          ${achada ? 'text-[var(--teal-ink)]' : 'text-[var(--gold-ink)]'}`}>
                    {achada ? '✓' : '✕'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* O retorno educativo. Ocupa lugar fixo para a grade não saltar quando
          ele aparece - uma grade que se mexe faz o dedo errar a próxima. */}
      <div className="min-h-[52px]">
        {dica && (
          <p role="status"
             className="rounded-[var(--r-md)] border border-[color:var(--edge-gold)]
                        bg-[var(--gold-soft)] px-4 py-2.5
                        font-ui text-[13.5px] leading-relaxed text-[var(--gold-body)]">
            {dica}
          </p>
        )}
        {acabou && (
          <p role="status"
             className="rounded-[var(--r-md)] border border-[color:var(--edge-teal)]
                        bg-[var(--teal-soft)] px-4 py-2.5
                        font-ui text-[14px] font-semibold text-[var(--teal-ink)]">
            Perfeito! Você encontrou {caca.quantas}{' '}
            {caca.quantas === 1 ? 'letra' : 'letras'}{' '}
            <He size="inline" tone="teal">{caca.glifo}</He>.
          </p>
        )}
      </div>
    </div>
  );
}

/** O cabeçalho da rodada, para a tela que hospeda o jogo. */
export function CacaResumo({ caca }: { caca: Caca }) {
  return (
    <Button variant="ghost" size="sm" disabled className="pointer-events-none">
      {caca.celulas.length} letras
    </Button>
  );
}
