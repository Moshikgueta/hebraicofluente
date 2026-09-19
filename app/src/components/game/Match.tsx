'use client';

/* Match: juntar os pares.
 * ─────────────────────────────────────────────────────────────────────────
 * Um tabuleiro com os dois lados do baralho embaralhados. Toca num cartão,
 * toca no que combina, e o par sai do tabuleiro. É o exercício mais antigo
 * que existe, e funciona por um motivo específico: obriga a COMPARAR - a
 * pessoa não responde "מ é mem", ela decide qual dos seis é o mem, e é essa
 * decisão que separa ד de ר na cabeça de quem está começando.
 *
 * As regras de retorno são as mesmas do resto do curso, e não mudam porque
 * isto é um jogo:
 *   · acerto é teal, com pop curto, e o par some;
 *   · erro é gold, nunca vermelho, e não tira ponto nem bloqueia nada - a
 *     dupla só se solta e a pessoa tenta de novo;
 *   · cor nunca sozinha: o par certo leva um ✓ e o errado um ↻.
 *
 * O cronômetro existe e começa DESLIGADO. Um adulto aprendendo a ler não
 * precisa de pressa; quem quiser corrida liga no botão.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { cartasDoMatch, type Par } from '@/lib/engine/deck';

type Estado = 'parado' | 'certo' | 'errado';

export type ResultadoJogo = {
  acertos: number;
  erros: number;
  total: number;
  segundos: number;
  /** As letras que custaram, para o painel e para a revisão. */
  letrasErradas: string[];
};

export function Match({
  baralho, semente, cronometro = false, onFim, onResposta
}: {
  baralho: readonly Par[];
  semente: string;
  cronometro?: boolean;
  onFim: (r: ResultadoJogo) => void;
  /** Cada tentativa, para o motor de revisão aprender com ela. */
  onResposta?: (a: { parId: string; letterId: string; certo: boolean }) => void;
}) {
  const cartas = useMemo(() => cartasDoMatch(baralho, semente), [baralho, semente]);

  const [feitos, setFeitos] = useState<string[]>([]);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [marca, setMarca] = useState<{ indices: number[]; estado: Estado }>({ indices: [], estado: 'parado' });
  const [erros, setErros] = useState(0);
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [ligado, setLigado] = useState(cronometro);
  const [segundos, setSegundos] = useState(0);
  const inicio = useRef(Date.now());
  const travado = useRef(false);

  useEffect(() => {
    if (!ligado) return;
    const t = setInterval(() => setSegundos(Math.round((Date.now() - inicio.current) / 1000)), 250);
    return () => clearInterval(t);
  }, [ligado]);

  const acabou = feitos.length === baralho.length && baralho.length > 0;
  useEffect(() => {
    if (!acabou) return;
    const t = setTimeout(() => onFim({
      acertos: baralho.length,
      erros,
      total: baralho.length,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      letrasErradas: [...new Set(letrasErradas)]
    }), 650);
    return () => clearTimeout(t);
  }, [acabou, baralho.length, erros, letrasErradas, onFim]);

  const tocar = useCallback((i: number) => {
    if (travado.current) return;
    const carta = cartas[i]!;
    if (feitos.includes(carta.parId)) return;

    if (escolhida === null) { setEscolhida(i); return; }
    if (escolhida === i) { setEscolhida(null); return; }

    const outra = cartas[escolhida]!;
    const certo = outra.parId === carta.parId && outra.lado !== carta.lado;
    onResposta?.({ parId: carta.parId, letterId: baralho.find(p => p.id === carta.parId)?.letterId ?? '', certo });

    if (certo) {
      setMarca({ indices: [escolhida, i], estado: 'certo' });
      setEscolhida(null);
      travado.current = true;
      setTimeout(() => {
        setFeitos(f => [...f, carta.parId]);
        setMarca({ indices: [], estado: 'parado' });
        travado.current = false;
      }, 320);
      return;
    }

    /* Erro: as duas piscam em gold e se soltam. Sem penalidade - o contador
       de erros existe para o relatório, não para castigar. */
    setErros(n => n + 1);
    const errada = baralho.find(p => p.id === carta.parId)?.letterId;
    if (errada) setLetrasErradas(l => [...l, errada]);
    setMarca({ indices: [escolhida, i], estado: 'errado' });
    travado.current = true;
    setTimeout(() => {
      setMarca({ indices: [], estado: 'parado' });
      setEscolhida(null);
      travado.current = false;
    }, 480);
  }, [cartas, escolhida, feitos, baralho, onResposta]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="font-ui text-[14px] text-ink-muted flex-1 min-w-[180px]">
          Toque num cartão e depois no que combina com ele.
        </p>
        <p className="font-ui text-[13px] text-ink-muted tabular-nums">
          {feitos.length} / {baralho.length}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setLigado(v => !v); inicio.current = Date.now(); setSegundos(0); }}
          aria-pressed={ligado}
        >
          {ligado ? `${segundos}s` : 'Cronômetro'}
        </Button>
      </div>

      <ul className="grid gap-2.5 list-none p-0 m-0
                     [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        {cartas.map((c, i) => {
          const fora = feitos.includes(c.parId);
          const marcada = marca.indices.includes(i);
          const ativa = escolhida === i;
          return (
            <li key={`${c.parId}-${c.lado}`}>
              <button
                type="button"
                onClick={() => tocar(i)}
                disabled={fora}
                aria-pressed={ativa}
                className={`w-full min-h-[76px] sm:min-h-[92px] rounded-[16px] border-2 px-3 py-3
                  grid place-items-center gap-1 text-center
                  transition-[background-color,border-color,opacity,transform] duration-[220ms]
                  ${fora ? 'opacity-0 pointer-events-none scale-95'
                    : marcada && marca.estado === 'certo'
                      ? 'border-[var(--teal)] bg-[var(--teal-soft)] animate-pop'
                    : marcada
                      ? 'border-[#D9B872] bg-[var(--gold-soft)]'
                    : ativa
                      ? 'border-[var(--navy)] bg-[var(--card)]'
                      : 'border-line bg-[var(--card)] hover:border-[var(--teal)]'}`}
              >
                {c.lado === 'he'
                  ? <He size="lg" tone={marcada && marca.estado === 'certo' ? 'teal' : 'navy'}>{c.texto}</He>
                  : <span className="font-ui text-[15px] sm:text-[16px] font-medium text-ink leading-snug">
                      {c.texto}
                    </span>}
                {marcada && (
                  <span aria-hidden className={`font-ui text-[13px] font-bold
                    ${marca.estado === 'certo' ? 'text-[var(--teal-ink)]' : 'text-[var(--gold-ink)]'}`}>
                    {marca.estado === 'certo' ? '✓' : '↻'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="sr-only">
        {marca.estado === 'certo' ? 'Par correto.' : marca.estado === 'errado' ? 'Esses dois não combinam.' : ''}
      </p>
    </div>
  );
}
