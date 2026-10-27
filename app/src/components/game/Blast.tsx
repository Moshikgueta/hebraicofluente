'use client';

/* Blast: rápido, uma pergunta por vez.
 * ─────────────────────────────────────────────────────────────────────────
 * Mostra um lado do par e pede o outro entre quatro alternativas. O que ele
 * treina não é a mesma coisa que a lição treina: a lição ensina a DEDUZIR a
 * letra, e o Blast ensina a RECONHECER sem deduzir - que é o que acontece
 * quando alguém lê de verdade uma placa na rua.
 *
 * Por isso o ritmo é curto: acerto avança sozinho em meio segundo, erro
 * segura um pouco mais e mostra qual era a certa. Não há cronômetro global e
 * não há tempo por questão - pressa aqui viraria chute, e chute não ensina.
 *
 * A sequência de acertos é o único número que sobe na tela, e ela zera sem
 * drama: quem erra volta para zero e continua jogando. Nada é perdido, nada
 * é bloqueado.
 */

import { useFocoDaRodada } from './foco-da-rodada';
import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import type { Pergunta } from '@/lib/engine/deck';
import type { ResultadoJogo } from './Match';

const ELOGIO: readonly [number, string][] = [
  [3, '3 acertos seguidos!'],
  [5, 'Você está pegando o jeito!'],
  [8, '8 seguidos - isso é leitura automática.'],
  [12, 'Doze. Pode parar quando quiser, você já provou.']
];

export function Blast({
  perguntas, onFim, onResposta
}: {
  perguntas: readonly Pergunta[];
  onFim: (r: ResultadoJogo) => void;
  onResposta?: (a: { id: string; letterId: string; certo: boolean; escolhida: string }) => void;
}) {
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const [elogio, setElogio] = useState<string | null>(null);
  const [erradas, setErradas] = useState<string[]>([]);
  const inicio = useRef(Date.now());
  const avanco = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* A TRAVA, e o defeito que ela conserta.
     ─────────────────────────────────────────────────────────────────────
     `responder` guardava com `if (escolha !== null) return`, e `escolha` vem
     do FECHO do render. Dois toques dentro do mesmo quadro - em alternativas
     DIFERENTES, que é o que acontece num toque duplo de polegar - veem os
     dois o mesmo fecho, com `escolha` ainda nula. O segundo passava:

       · gravava um segundo `onResposta` para a MESMA carta, com a letra
         errada, sujando o registro de confusões que a revisão usa depois;
       · marcava mais um acerto, porque `setAcertos(n => n + 1)` é funcional
         e roda as duas vezes;
       · e agendava um SEGUNDO temporizador por cima do primeiro sem limpá-lo,
         então os dois disparavam e o jogo pulava uma carta.

     O `disabled` do botão não salva: ele também é do render anterior.

     Estado de React é assíncrono por contrato; um `ref` é síncrono. A trava
     guarda o índice já respondido, e não um booleano, para se soltar sozinha
     na carta seguinte. */
  const respondido = useRef(-1);

  /** Um temporizador por vez: agendar sem limpar o anterior era o outro meio
   *  do pulo de carta. */
  const agendar = useCallback((fn: () => void, ms: number) => {
    if (avanco.current) clearTimeout(avanco.current);
    avanco.current = setTimeout(fn, ms);
  }, []);

  useEffect(() => () => { if (avanco.current) clearTimeout(avanco.current); }, []);

  const q = perguntas[i];
  const foco = useFocoDaRodada(i);

  const seguinte = useCallback(() => {
    setEscolha(null);
    setElogio(null);
    if (i + 1 >= perguntas.length) {
      onFim({
        acertos, erros: perguntas.length - acertos, total: perguntas.length,
        segundos: Math.round((Date.now() - inicio.current) / 1000),
        letrasErradas: [...new Set(erradas)]
      });
      return;
    }
    setI(n => n + 1);
  }, [i, perguntas.length, acertos, erradas, onFim]);

  const responder = useCallback((idx: number) => {
    if (escolha !== null || !q) return;
    if (respondido.current === i) return;
    respondido.current = i;
    foco.segurar();
    const certo = idx === q.resposta;
    setEscolha(idx);
    onResposta?.({ id: q.id, letterId: q.letterId, certo, escolhida: q.opcoes[idx] ?? '' });

    if (certo) {
      const nova = sequencia + 1;
      setAcertos(n => n + 1);
      setSequencia(nova);
      const marco = ELOGIO.filter(([n]) => n === nova).map(([, t]) => t)[0];
      if (marco) setElogio(marco);
      agendar(() => {
        setEscolha(null);
        setElogio(null);
        if (i + 1 >= perguntas.length) {
          onFim({
            acertos: acertos + 1, erros: perguntas.length - acertos - 1, total: perguntas.length,
            segundos: Math.round((Date.now() - inicio.current) / 1000),
            letrasErradas: [...new Set(erradas)]
          });
        } else setI(n => n + 1);
      }, marco ? 900 : 520);
      return;
    }

    setSequencia(0);
    setErradas(l => [...l, q.letterId]);
    agendar(seguinte, 1400);
  }, [escolha, q, sequencia, i, perguntas.length, acertos, erradas, onFim, onResposta, seguinte, agendar, foco.segurar]);

  /* Teclado: 1-4 respondem. O mesmo atalho do resto do curso. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || escolha !== null) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.opcoes.length) { e.preventDefault(); responder(n - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, escolha, responder]);

  if (!q) return null;
  const emHebraico = q.sentido === 'he';

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <span className="flex-1 h-1.5 rounded-full bg-[var(--sand)] overflow-hidden">
          <span className="block h-full rounded-full bg-[var(--teal)] transition-[width] duration-300"
                style={{ width: `${(i / perguntas.length) * 100}%` }} />
        </span>
        <span className="font-ui text-[13px] tabular-nums text-ink-muted">{i + 1} / {perguntas.length}</span>
        <span className={`font-ui text-[13px] font-bold tabular-nums transition-colors
          ${sequencia >= 3 ? 'text-[var(--gold-ink)]' : 'text-ink-muted'}`}>
          {sequencia > 0 ? `${sequencia} seguidos` : `${acertos} acertos`}
        </span>
      </div>

      <div ref={foco.ref} tabIndex={-1} role="group" aria-label={`Pergunta ${i + 1} de ${perguntas.length}`}
           className="grid gap-4 outline-none">
      <div className="rounded-[20px] bg-[var(--sand)] px-5 py-7 text-center relative overflow-hidden">
        <p className="font-ui text-[14.5px] text-ink-muted mb-3">{q.enunciadoPt}</p>
        {emHebraico
          ? <div><He size="plate" tone="navy" className="animate-pop">{q.alvo}</He></div>
          : <p className="font-display text-[34px] sm:text-[40px] font-semibold tracking-[-0.02em]
                          text-[var(--navy)] animate-pop">{q.alvo}</p>}
        {elogio && (
          <p role="status"
             className="absolute inset-x-0 bottom-2 font-ui text-[14px] font-bold text-[var(--teal-ink)] animate-rise">
            {elogio}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-2.5 list-none p-0 m-0" role="list">
        {q.opcoes.map((op, idx) => {
          const estado = escolha === null ? 'neutro'
            : idx === q.resposta ? 'certo'
            : idx === escolha ? 'errado' : 'apagado';
          return (
            <li key={`${q.id}-${idx}`}>
              <button
                type="button"
                onClick={() => responder(idx)}
                disabled={escolha !== null}
                data-resposta={estado === 'certo' ? 'right' : undefined}
                className={`w-full min-h-[64px] rounded-[16px] border-2 px-3 py-3
                  grid place-items-center gap-1 transition-[border-color,background-color,opacity,translate,scale] duration-[180ms] enabled:active:scale-[.98]
                  ${estado === 'certo' ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                    : estado === 'errado' ? 'border-[#D9B872] bg-[var(--gold-soft)]'
                    : estado === 'apagado' ? 'border-line bg-[var(--card)] opacity-50'
                    : 'border-line bg-[var(--card)] hover:border-[var(--teal)] hover:-translate-y-[2px]'}`}
              >
                {emHebraico
                  ? <span className="font-ui text-[16px] font-medium text-ink">{op}</span>
                  : <He size="lg" tone={estado === 'certo' ? 'teal' : 'navy'}>{op}</He>}
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="min-h-[22px] font-ui text-[14px] text-center">
        {escolha === null ? '' : escolha === q.resposta
          ? <span className="text-[var(--teal-ink)] font-semibold">Boa!</span>
          : <span className="text-[var(--gold-ink)] font-semibold">
              Quase. A resposta era {q.opcoes[q.resposta]}.
            </span>}
      </p>
      </div>
    </div>
  );
}
