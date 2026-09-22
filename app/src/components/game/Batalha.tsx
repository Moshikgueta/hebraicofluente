'use client';

/* Batalha das letras parecidas.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas letras por rodada, e só elas. "As inimigas de hoje: {{ד}} e {{ר}}."
 *
 * ── por que um par, e não uma lista ─────────────────────────────────────
 * Discriminação visual não se treina misturando vinte letras: se treina
 * pondo as DUAS que se parecem lado a lado, muitas vezes seguidas, até a
 * diferença virar automática. Um exercício com vinte alternativas ensina a
 * eliminar dezoito; um com duas ensina a olhar para o traço que separa.
 *
 * O par vem de `confusionPair` (lib/engine/gym.ts), que prefere o que ESTE
 * aluno realmente trocou e cai no `confusableWith` do conteúdo quando ele
 * ainda não errou nada. Quem escolhe não é este arquivo, de propósito: duas
 * regras decidindo o mesmo par seriam duas regras para manter iguais.
 *
 * ── os três formatos, e o que cada um mede ──────────────────────────────
 *   qual     - a letra sozinha e dois nomes. Mede se ele sabe qual é.
 *   todas    - uma fileira misturada, toque em todas as que forem X. Mede se
 *              ele SEPARA as duas quando estão encostadas, que é o caso da
 *              palavra de verdade.
 *   intruso  - cinco iguais e uma diferente. Mede se ele NOTA sozinho, sem
 *              ninguém apontar para onde olhar.
 *
 * ── o arco ──────────────────────────────────────────────────────────────
 * No fim, quando o par saiu dos erros dele, a tela diz o que mudou: "você
 * confundia {{ד}} e {{ר}} - agora acertou 9 de 10". É a única frase do jogo
 * que compara passado e presente, e ela só aparece quando há um passado de
 * verdade registrado. Inventá-la para todo mundo a esvaziaria.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import type { Batalha as Dados, RodadaBatalha } from '@/lib/engine/jogos';
import { porQueErrou } from '@/lib/engine/jogos';
import type { ResultadoJogo } from './Match';

type Marca = { ok: boolean; texto: string | null } | null;

export function Batalha({
  dados, onFim, onResposta
}: {
  dados: Dados;
  onFim: (r: ResultadoJogo) => void;
  onResposta?: (a: { id: string; letterId: string; certo: boolean; escolhida?: string }) => void;
}) {
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [letrasErradas, setLetrasErradas] = useState<string[]>([]);
  const [marca, setMarca] = useState<Marca>(null);
  /* Para os formatos de fileira: o que já foi tocado nesta rodada. */
  const [tocadas, setTocadas] = useState<string[]>([]);
  const travado = useRef(false);
  const inicio = useRef(Date.now());

  const rodada = dados.rodadas[i];
  const total = dados.rodadas.length;

  const avancar = useCallback(() => {
    travado.current = false;
    setMarca(null);
    setTocadas([]);
    setI(n => n + 1);
  }, []);

  useEffect(() => {
    if (i < total) return;
    const t = setTimeout(() => onFim({
      acertos, erros, total,
      segundos: Math.round((Date.now() - inicio.current) / 1000),
      letrasErradas: [...new Set(letrasErradas)]
    }), 250);
    return () => clearTimeout(t);
  }, [i, total, acertos, erros, letrasErradas, onFim]);

  /** Fecha uma rodada: marca, registra e anda. */
  const fechar = useCallback((certo: boolean, texto: string | null, letterId: string,
                              id: string, escolhida?: string) => {
    if (travado.current) return;
    travado.current = true;
    onResposta?.({ id, letterId, certo, escolhida });
    if (certo) setAcertos(n => n + 1);
    else { setErros(n => n + 1); setLetrasErradas(l => [...l, letterId]); }
    setMarca({ ok: certo, texto });
    /* O erro segura mais tempo na tela, porque ele traz a frase que ensina -
       e uma explicação que some em meio segundo não foi lida. */
    setTimeout(avancar, certo ? 560 : 1900);
  }, [avancar, onResposta]);

  if (!rodada) return null;

  return (
    <div className="grid gap-5">
      <Placar i={i} total={total} acertos={acertos} par={dados.par} />

      {rodada.tipo === 'qual' && (
        <Qual r={rodada} marca={marca} fechar={fechar} idx={i} />
      )}
      {rodada.tipo === 'todas' && (
        <Todas r={rodada} marca={marca} tocadas={tocadas} setTocadas={setTocadas}
               travado={travado} fechar={fechar} idx={i} />
      )}
      {rodada.tipo === 'intruso' && (
        <Intruso r={rodada} marca={marca} fechar={fechar} idx={i} />
      )}

      <Retorno marca={marca} />
    </div>
  );
}

/* ── o cabeçalho: quem são as inimigas, e como vai a luta ──────────────── */
function Placar({
  i, total, acertos, par
}: { i: number; total: number; acertos: number; par: [{ letter: string }, { letter: string }] }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <p className="font-ui text-[13px] uppercase tracking-[.08em] text-ink-muted flex-1 min-w-[160px]">
        Inimigas de hoje{' '}
        <span className="inline-flex items-center gap-1.5 align-middle">
          <He size="inline" tone="teal" className="font-bold">{par[0].letter}</He>
          <span aria-hidden className="text-ink-muted">·</span>
          <He size="inline" tone="teal" className="font-bold">{par[1].letter}</He>
        </span>
      </p>
      <p className="font-ui text-[13px] text-ink-muted tabular-nums shrink-0" aria-live="polite">
        {Math.min(i + 1, total)} / {total} · {acertos} {acertos === 1 ? 'acerto' : 'acertos'}
      </p>
    </div>
  );
}

/* ── formato 1: qual é esta? ───────────────────────────────────────────── */
function Qual({
  r, marca, fechar, idx
}: {
  r: Extract<RodadaBatalha, { tipo: 'qual' }>;
  marca: Marca; idx: number;
  fechar: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  return (
    <div className="grid gap-4 justify-items-center">
      <p className="font-ui text-[14px] text-ink-muted">Qual letra é esta?</p>
      <div className="grid place-items-center min-h-[128px]">
        <He size="display" tone={marca ? (marca.ok ? 'teal' : 'ink') : 'ink'}>{r.glifo}</He>
      </div>
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-[420px]">
        {r.opcoes.map(o => {
          const certa = o.id === r.alvo.id;
          const mostrar = !!marca;
          return (
            <button
              key={o.id}
              type="button"
              disabled={mostrar}
              onClick={() => fechar(
                certa,
                certa ? null : porQueErrou(r.alvo, o) ?? `Esta é a ${r.alvo.namePt}.`,
                r.alvo.id, `batalha:${r.alvo.id}:q${idx}`,
                certa ? undefined : o.letter
              )}
              className={`min-h-[56px] rounded-[var(--r-md)] border px-4 font-ui text-[16px] font-semibold
                transition-colors
                ${mostrar && certa
                  ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                  : mostrar
                    ? 'border-line bg-surface text-ink-muted'
                    : 'border-line bg-surface text-ink hover:bg-surface-2 active:scale-[.98]'}`}
            >
              {o.namePt}
              {mostrar && certa && <span aria-hidden className="ml-1.5">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── formato 2: toque em todas ─────────────────────────────────────────── */
function Todas({
  r, marca, tocadas, setTocadas, travado, fechar, idx
}: {
  r: Extract<RodadaBatalha, { tipo: 'todas' }>;
  marca: Marca; tocadas: string[]; setTocadas: (f: (t: string[]) => string[]) => void;
  travado: React.MutableRefObject<boolean>; idx: number;
  fechar: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  const certas = useMemo(() => r.fila.filter(c => c.certa).map(c => c.id), [r.fila]);
  const faltam = certas.filter(id => !tocadas.includes(id)).length;

  const tocar = (id: string) => {
    if (travado.current || tocadas.includes(id)) return;
    const cel = r.fila.find(c => c.id === id)!;
    if (!cel.certa) {
      /* Tocar na errada encerra a rodada: aqui a pergunta é "você distingue",
         e continuar depois de um engano transformaria o jogo em tentativa e
         erro, que é exatamente o que ele existe para desfazer. */
      fechar(false, porQueErrou(r.alvo, r.outra), r.alvo.id,
             `batalha:${r.alvo.id}:t${idx}`, cel.glifo);
      return;
    }
    setTocadas(t => [...t, id]);
    if (faltam === 1) {
      fechar(true, null, r.alvo.id, `batalha:${r.alvo.id}:t${idx}`);
    }
  };

  return (
    <div className="grid gap-4">
      <p className="font-ui text-[15px] text-ink-body text-center">
        Toque em todas as letras{' '}
        <He size="inline" tone="teal" className="font-bold">{r.glifo}</He>
      </p>
      <ul className="grid gap-2 list-none p-0 m-0
                     [grid-template-columns:repeat(auto-fit,minmax(58px,1fr))]">
        {r.fila.map(c => {
          const feita = tocadas.includes(c.id);
          const revelar = !!marca && !marca.ok;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => tocar(c.id)}
                disabled={feita || !!marca}
                className={`w-full min-h-[60px] rounded-[var(--r-md)] border grid place-items-center
                  relative transition-[background-color,border-color,transform] duration-150
                  ${feita
                    ? 'border-[var(--teal)] bg-[var(--teal-soft)] scale-[.96]'
                    : revelar && c.certa
                      ? 'border-[var(--teal)] bg-surface'
                      : 'border-line bg-surface hover:bg-surface-2 active:scale-[.97]'}`}
              >
                <He size="word" tone={feita ? 'teal' : 'ink'}>{c.glifo}</He>
                {feita && (
                  <span aria-hidden className="absolute top-1 right-1.5 font-ui text-[12px]
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

/* ── formato 3: qual é diferente? ──────────────────────────────────────── */
function Intruso({
  r, marca, fechar, idx
}: {
  r: Extract<RodadaBatalha, { tipo: 'intruso' }>;
  marca: Marca; idx: number;
  fechar: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <p className="font-ui text-[15px] text-ink-body text-center">Qual é diferente?</p>
      <ul className="grid gap-2 list-none p-0 m-0
                     [grid-template-columns:repeat(auto-fit,minmax(58px,1fr))]">
        {r.fila.map(c => (
          <li key={c.id}>
            <button
              type="button"
              disabled={!!marca}
              onClick={() => fechar(
                c.intruso,
                c.intruso ? null : porQueErrou(r.intruso, r.alvo) ?? null,
                r.intruso.id, `batalha:${r.intruso.id}:x${idx}`,
                c.intruso ? undefined : c.glifo
              )}
              className={`w-full min-h-[60px] rounded-[var(--r-md)] border grid place-items-center
                relative transition-[background-color,border-color,transform] duration-150
                ${marca && c.intruso
                  ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                  : 'border-line bg-surface hover:bg-surface-2 active:scale-[.97]'}`}
            >
              <He size="word" tone={marca && c.intruso ? 'teal' : 'ink'}>{c.glifo}</He>
              {marca && c.intruso && (
                <span aria-hidden className="absolute top-1 right-1.5 font-ui text-[12px]
                                             font-bold text-[var(--teal-ink)]">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── o retorno ─────────────────────────────────────────────────────────── */
function Retorno({ marca }: { marca: Marca }) {
  /* Altura reservada: sem ela, a grade sobe e desce a cada resposta e o dedo
     erra o alvo seguinte. */
  return (
    <div className="min-h-[58px]">
      {marca && (
        <p role="status"
           className={`rounded-[var(--r-md)] border px-4 py-2.5 font-ui text-[13.5px] leading-relaxed
             ${marca.ok
               ? 'border-[color:var(--edge-teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)] font-semibold'
               : 'border-[color:var(--edge-gold)] bg-[var(--gold-soft)] text-[var(--gold-body)]'}`}>
          {marca.ok ? 'Isso!' : marca.texto ?? 'Olhe o desenho com calma e tente a próxima.'}
        </p>
      )}
    </div>
  );
}
