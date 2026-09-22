'use client';

/* Impressa × Cursiva.
 * ─────────────────────────────────────────────────────────────────────────
 * O mesmo caractere em duas famílias tipográficas, e a pergunta é qual é
 * qual. Pedagogicamente este é o jogo mais importante dos três, por um
 * motivo que quase ninguém antecipa:
 *
 * O aluno aprende a ler no alfabeto IMPRESSO e vai encontrar o CURSIVO na
 * primeira coisa escrita à mão que cruzar o caminho dele - um bilhete, um
 * quadro-negro, a letra de um israelense. São dois alfabetos que ele precisa
 * saber que são o mesmo, e a descoberta tardia disso é onde muita gente
 * conclui que "não aprendeu nada".
 *
 * ── a cursiva é a MESMA do curso, e isso é uma regra ────────────────────
 * As duas formas são o mesmo codepoint, trocando a família pela classe
 * `he-cursive` - exatamente o que a etapa de escrita da lição faz e o que o
 * gerador `exPrintVsCursive` já usava. Não há aqui uma segunda fonte cursiva
 * escolhida por estética: ela desenharia letras que o aluno nunca viu, e um
 * jogo que ensina um desenho diferente do da aula é pior do que nenhum jogo.
 *
 * ── os três modos ───────────────────────────────────────────────────────
 *   paraCursiva   - vê impressa, escolhe a cursiva
 *   paraImpressa  - vê cursiva, escolhe a impressa
 *   pares         - quatro de cada lado, ligar uma a uma
 *
 * O modo `pares` é POR TOQUE e não por arrastar. Arrastar numa grade pequena
 * erra mais do que acerta num telefone, e um jogo que pune a mão não ensina
 * a letra: toca na impressa, toca na cursiva, e pronto. No teclado é a mesma
 * coisa - são botões, então Tab e Enter percorrem tudo sem nenhum código a
 * mais.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import type { RodadaCursiva } from '@/lib/engine/jogos';
import { porQueErrou } from '@/lib/engine/jogos';
import type { Letter } from '@/lib/content';
import type { ResultadoJogo } from './Match';

type Marca = { ok: boolean; texto: string | null } | null;

export function ImpressaCursiva({
  rodadas, onFim, onResposta
}: {
  rodadas: readonly RodadaCursiva[];
  onFim: (r: ResultadoJogo) => void;
  onResposta?: (a: { id: string; letterId: string; certo: boolean; escolhida?: string }) => void;
}) {
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [marca, setMarca] = useState<Marca>(null);
  const travado = useRef(false);
  const inicio = useRef(Date.now());

  const r = rodadas[i];
  const total = rodadas.length;

  useEffect(() => {
    if (i < total) return;
    const t = setTimeout(() => onFim({
      acertos, erros, total,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      letrasErradas: [...new Set(letrasErradas)]
    }), 250);
    return () => clearTimeout(t);
  }, [i, total, acertos, erros, letrasErradas, onFim]);

  const responder = useCallback((
    certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string
  ) => {
    if (travado.current) return;
    travado.current = true;
    onResposta?.({ id, letterId, certo, escolhida });
    if (certo) setAcertos(n => n + 1);
    else { setErros(n => n + 1); setLetrasErradas(l => [...l, letterId]); }
    setMarca({ ok: certo, texto });
    setTimeout(() => {
      travado.current = false;
      setMarca(null);
      setI(n => n + 1);
    }, certo ? 560 : 1700);
  }, [onResposta]);

  if (!r) return null;

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="font-ui text-[13px] uppercase tracking-[.08em] text-ink-muted flex-1">
          Impressa e cursiva
        </p>
        <p className="font-ui text-[13px] text-ink-muted tabular-nums" aria-live="polite">
          {Math.min(i + 1, total)} / {total} · {acertos} {acertos === 1 ? 'acerto' : 'acertos'}
        </p>
      </div>

      {r.tipo === 'pares'
        ? <Pares key={i} r={r} idx={i} responder={responder} />
        : <Escolha key={i} r={r} idx={i} marca={marca} responder={responder} />}

      <div className="min-h-[58px]">
        {marca && (
          <p role="status"
             className={`rounded-[var(--r-md)] border px-4 py-2.5 font-ui text-[13.5px] leading-relaxed
               ${marca.ok
                 ? 'border-[color:var(--edge-teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)] font-semibold'
                 : 'border-[color:var(--edge-gold)] bg-[var(--gold-soft)] text-[var(--gold-body)]'}`}>
            {marca.ok ? 'Exatamente.' : marca.texto ?? 'Compare os dois desenhos com calma.'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── modos 1 e 2: uma letra, três ou quatro opções ─────────────────────── */
function Escolha({
  r, idx, marca, responder
}: {
  r: Extract<RodadaCursiva, { tipo: 'paraCursiva' | 'paraImpressa' }>;
  idx: number; marca: Marca;
  responder: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  const mostrarCursiva = r.tipo === 'paraCursiva';
  return (
    <div className="grid gap-4 justify-items-center">
      <p className="font-ui text-[15px] text-ink-body text-center">
        {mostrarCursiva ? 'Qual é esta letra em cursiva?' : 'Qual é esta letra na forma impressa?'}
      </p>

      {/* O enunciado: a letra na forma OPOSTA à das alternativas. */}
      <div className="grid place-items-center min-h-[132px]">
        <He size="display" cursive={!mostrarCursiva}>{r.alvo.letter}</He>
      </div>

      <ul className="grid gap-2.5 list-none p-0 m-0 w-full max-w-[460px]
                     [grid-template-columns:repeat(auto-fit,minmax(88px,1fr))]">
        {r.opcoes.map(o => {
          const certa = o.id === r.alvo.id;
          const revelar = !!marca;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={revelar}
                aria-label={o.namePt}
                onClick={() => responder(
                  certa,
                  certa ? null : porQueErrou(r.alvo, o)
                    ?? `Esta é a ${o.namePt}. A que você procura é a ${r.alvo.namePt}.`,
                  r.alvo.id, `cursiva:${r.alvo.id}:${idx}`,
                  certa ? undefined : o.letter
                )}
                className={`w-full min-h-[96px] rounded-[var(--r-md)] border grid place-items-center
                  relative transition-[background-color,border-color,transform] duration-150
                  ${revelar && certa
                    ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                    : 'border-line bg-surface hover:bg-surface-2 active:scale-[.97]'}`}
              >
                <He size="lg" cursive={mostrarCursiva} tone={revelar && certa ? 'teal' : 'ink'}>
                  {o.letter}
                </He>
                {revelar && certa && (
                  <span aria-hidden className="absolute top-1.5 right-2 font-ui text-[12px]
                                               font-bold text-[var(--teal-ink)]">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── modo 3: ligar os pares, por toque ─────────────────────────────────── */
function Pares({
  r, idx, responder
}: {
  r: Extract<RodadaCursiva, { tipo: 'pares' }>;
  idx: number;
  responder: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  const [escolhida, setEscolhida] = useState<Letter | null>(null);
  const [feitos, setFeitos] = useState<string[]>([]);
  const [errou, setErrou] = useState<string | null>(null);
  const fechado = useRef(false);

  /* A rodada de pares vale UMA resposta, e não quatro: se cada ligação
     contasse, esta rodada sozinha pesaria como quatro das outras no placar. */
  useEffect(() => {
    if (feitos.length !== r.esquerda.length || fechado.current) return;
    fechado.current = true;
    responder(true, null, r.esquerda[0]!.id, `cursiva:pares:${idx}`);
  }, [feitos.length, r.esquerda, responder, idx]);

  const tocarCursiva = (o: Letter) => {
    if (!escolhida || feitos.includes(o.id)) return;
    if (o.id === escolhida.id) {
      setFeitos(f => [...f, o.id]);
      setEscolhida(null);
      setErrou(null);
      return;
    }
    /* Erro aqui não encerra: a pessoa está comparando desenhos, e obrigá-la a
       recomeçar a grade por um engano é o que faz ela fechar o jogo. Só se
       solta, e o par errado pisca em gold. */
    setErrou(o.id);
    setEscolhida(null);
    setTimeout(() => setErrou(null), 520);
  };

  return (
    <div className="grid gap-3">
      <p className="font-ui text-[15px] text-ink-body text-center">
        Toque numa letra impressa e depois na mesma letra em cursiva.
      </p>
      <p className="font-ui text-[13px] text-ink-muted text-center tabular-nums">
        {feitos.length} de {r.esquerda.length}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Coluna titulo="Impressa">
          {r.esquerda.map(o => {
            const feito = feitos.includes(o.id);
            const ativa = escolhida?.id === o.id;
            return (
              <Peca
                key={o.id} letra={o} cursiva={false} feito={feito} ativa={ativa} errou={false}
                onClick={() => !feito && setEscolhida(ativa ? null : o)}
              />
            );
          })}
        </Coluna>
        <Coluna titulo="Cursiva">
          {r.direita.map(o => (
            <Peca
              key={o.id} letra={o} cursiva feito={feitos.includes(o.id)}
              ativa={false} errou={errou === o.id}
              onClick={() => tocarCursiva(o)}
            />
          ))}
        </Coluna>
      </div>
    </div>
  );
}

function Coluna({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 content-start">
      <p className="font-ui text-[11.5px] uppercase tracking-[.08em] text-ink-muted text-center">
        {titulo}
      </p>
      <ul className="grid grid-cols-2 gap-2 list-none p-0 m-0">{children}</ul>
    </div>
  );
}

function Peca({
  letra, cursiva, feito, ativa, errou, onClick
}: {
  letra: Letter; cursiva: boolean; feito: boolean; ativa: boolean; errou: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={feito}
        aria-pressed={ativa}
        aria-label={`${letra.namePt}${cursiva ? ' em cursiva' : ' impressa'}`}
        className={`w-full min-h-[72px] rounded-[var(--r-md)] border grid place-items-center
          relative transition-[background-color,border-color,transform] duration-150
          ${feito
            ? 'border-[var(--teal)] bg-[var(--teal-soft)] opacity-70'
            : errou
              ? 'border-[var(--gold)] bg-[var(--gold-soft)]'
              : ativa
                ? 'border-[var(--teal)] bg-surface ring-2 ring-[var(--teal)] ring-offset-2 ring-offset-[var(--paper)]'
                : 'border-line bg-surface hover:bg-surface-2 active:scale-[.97]'}`}
      >
        <He size="word" cursive={cursiva} tone={feito ? 'teal' : 'ink'}>{letra.letter}</He>
        {feito && (
          <span aria-hidden className="absolute top-1 right-1.5 font-ui text-[12px]
                                       font-bold text-[var(--teal-ink)]">✓</span>
        )}
      </button>
    </li>
  );
}
