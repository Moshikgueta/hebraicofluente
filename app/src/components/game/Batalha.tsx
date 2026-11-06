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

import { tocarResposta } from '@/lib/som-do-acerto';
import { useFocoDaRodada } from './foco-da-rodada';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { AudioButton } from '@/components/learn/AudioButton';
import type { Batalha as Dados, RodadaBatalha } from '@/lib/engine/jogos';
import { porQueErrou } from '@/lib/engine/jogos';
import type { ResultadoJogo } from './Match';
import { tx } from '@/i18n/telas/academia-batalha';

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
  const foco = useFocoDaRodada(i);

  const rodada = dados.rodadas[i];
  const total = dados.rodadas.length;

  /* As duas letras em jogo AGORA. Toda rodada tem um alvo; a outra metade é
     a que se parece com ele - e cada formato a guarda com outro nome. */
  const parDaRodada: [{ letter: string }, { letter: string }] = useMemo(() => {
    if (!rodada) return dados.par;
    if (rodada.tipo === 'todas') return [rodada.alvo, rodada.outra];
    if (rodada.tipo === 'intruso') return [rodada.alvo, rodada.intruso];
    const outra = rodada.opcoes.find(o => o.id !== rodada.alvo.id);
    return [rodada.alvo, outra ?? rodada.alvo];
  }, [rodada, dados.par]);

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
    foco.segurar();
    onResposta?.({ id, letterId, certo, escolhida });
    tocarResposta(certo);
    if (certo) setAcertos(n => n + 1);
    else { setErros(n => n + 1); setLetrasErradas(l => [...l, letterId]); }
    setMarca({ ok: certo, texto });
    /* O erro segura mais tempo na tela, porque ele traz a frase que ensina -
       e uma explicação que some em meio segundo não foi lida. */
    setTimeout(avancar, certo ? 560 : 1900);
  }, [avancar, onResposta, foco.segurar]);

  if (!rodada) return null;

  return (
    <div className="grid gap-5">
      {/* O par exibido é o da RODADA, e não o da partida: agora a partida
          percorre até quatro pares, e um cabeçalho fixo mentiria em três
          quartos dela. */}
      <Placar i={i} total={total} acertos={acertos} par={parDaRodada}
              meta={rodada.tipo === 'som' ? 'som' : 'desenho'} />

      <div ref={foco.ref} tabIndex={-1} role="group" aria-label={tx.rodadaDe(i + 1, total)}
           className="grid gap-5 outline-none">

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
      {rodada.tipo === 'relampago' && (
        <Relampago r={rodada} marca={marca} fechar={fechar} idx={i} />
      )}
      {rodada.tipo === 'som' && (
        <Som key={i} r={rodada} marca={marca} fechar={fechar} idx={i} />
      )}

      <Retorno marca={marca} />
      </div>
    </div>
  );
}

/* ── o cabeçalho: quem são as inimigas, e como vai a luta ──────────────── */
function Placar({
  i, total, acertos, par, meta
}: {
  i: number; total: number; acertos: number; par: [{ letter: string }, { letter: string }];
  /** Parecidas no desenho ou no som: duas metas diferentes, e a tela diz qual. */
  meta: 'desenho' | 'som';
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`rounded-full px-2.5 py-1 font-ui text-[12px] font-semibold
        ${meta === 'som' ? 'bg-[var(--gold-soft)] text-[var(--gold-ink)]' : 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'}`}>
        {meta === 'som' ? tx.parecidasSom : tx.parecidasDesenho}
      </span>
      <p className="font-ui text-[13px] uppercase tracking-[.08em] text-ink-muted flex-1 min-w-[160px]">
        {tx.inimigasDeHoje}{' '}
        <span className="inline-flex items-center gap-1.5 align-middle">
          <He size="inline" tone="teal" className="font-bold">{par[0].letter}</He>
          <span aria-hidden className="text-ink-muted">·</span>
          <He size="inline" tone="teal" className="font-bold">{par[1].letter}</He>
        </span>
      </p>
      <p className="font-ui text-[13px] text-ink-muted tabular-nums shrink-0" aria-live="polite">
        {tx.placar(Math.min(i + 1, total), total, acertos)}
      </p>
    </div>
  );
}

/* ── formato 4: o relâmpago ────────────────────────────────────────────
   A letra aparece e some; a pergunta vem depois.

   É o único formato em que não dá para COMPARAR - e comparar é a muleta que
   faz alguém achar que distingue {{ד}} de {{ר}} quando na verdade sabe é
   olhar as duas lado a lado. Na leitura real a letra não fica esperando.

   Três decisões:

   · O aluno DISPARA o relâmpago. Um flash que começa sozinho pega quem ainda
     estava lendo o enunciado, e aí o que se mede é a atenção ao carregamento
     da tela. Aqui ele toca «mostrar» quando estiver pronto.

   · Com `prefers-reduced-motion`, a letra fica na tela até ele responder. O
     formato perde a graça e mantém a pergunta - que é melhor do que excluir
     do jogo quem pediu menos movimento. O mesmo vale para quem usa leitor de
     tela: o glifo tem rótulo, e o rótulo não pisca.

   · Depois de responder, a letra VOLTA junto do retorno. Errar sem poder
     rever o que passou não ensina nada. */
function Relampago({
  r, marca, fechar, idx
}: {
  r: Extract<RodadaBatalha, { tipo: 'relampago' }>;
  marca: Marca; idx: number;
  fechar: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  const [fase, setFase] = useState<'espera' | 'piscou'>('espera');
  const [visivel, setVisivel] = useState(false);
  const tempo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (tempo.current) clearTimeout(tempo.current); }, []);

  const mostrar = () => {
    if (fase !== 'espera') return;
    const reduz = typeof window !== 'undefined'
      && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setFase('piscou');
    setVisivel(true);
    if (reduz) return;
    if (tempo.current) clearTimeout(tempo.current);
    tempo.current = setTimeout(() => setVisivel(false), r.ms);
  };

  /* Depois do veredito a letra reaparece, para o erro poder ser estudado. */
  const naTela = visivel || !!marca;

  return (
    <div className="grid gap-4 justify-items-center">
      <p className="font-ui text-[14px] text-ink-muted text-center max-w-[36ch]">
        {fase === 'espera'
          ? tx.relampagoEspera
          : tx.relampagoPergunta}
      </p>

      <div className="grid place-items-center min-h-[128px] w-full max-w-[420px]
                      rounded-[var(--r-lg)] bg-[var(--sand)]">
        {naTela ? (
          <He size="display" tone={marca ? (marca.ok ? 'teal' : 'ink') : 'ink'}>{r.glifo}</He>
        ) : fase === 'espera' ? (
          <button
            type="button"
            onClick={mostrar}
            className="min-h-[56px] px-7 rounded-[var(--r-md)] border border-line bg-surface
                       font-ui text-[16px] font-semibold text-ink hover:bg-surface-2
                       active:scale-[.98] transition-[background-color,transform]"
          >
            {tx.mostrarLetra}
          </button>
        ) : (
          <span aria-hidden className="font-ui text-[15px] text-ink-muted">{tx.passou}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full max-w-[420px]">
        {r.opcoes.map(o => {
          const certa = o.id === r.alvo.id;
          const mostra = !!marca;
          return (
            <button
              key={o.id}
              type="button"
              /* Antes do relâmpago não há o que responder: responder aqui
                 seria chutar entre duas, e o placar registraria o chute. */
              disabled={mostra || fase === 'espera'}
              onClick={() => fechar(
                certa,
                certa ? null : porQueErrou(r.alvo, o) ?? tx.eraA(r.alvo.namePt),
                r.alvo.id, `batalha:${r.alvo.id}:l${idx}`,
                certa ? undefined : o.letter
              )}
              className={`min-h-[56px] rounded-[var(--r-md)] border px-4 font-ui text-[16px] font-semibold
                transition-colors disabled:opacity-60
                ${mostra && certa
                  ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                  : mostra
                    ? 'border-line bg-surface text-ink-muted'
                    : 'border-line bg-surface text-ink enabled:hover:bg-surface-2 enabled:active:scale-[.98]'}`}
            >
              {tx.nomeDaOpcao(o.namePt, !!r.final)}
              {mostra && certa && <span aria-hidden className="ml-1.5">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── formato 5: o ouvido (12/10/2026) ───────────────────────────────────
   Toca a sílaba com A de uma das duas, e o aluno escolhe a letra. É a outra
   metade da confusão: {{ה}} e {{ח}} se parecem no desenho E no som, mas
   {{ז}} e {{ס}} só no som. O áudio toca quando ele pedir, quantas vezes
   quiser; a rodada só existe com gravação (rodadasDeSom). A resposta errada
   não vira "troca de letra" na lista que a Batalha lê para o DESENHO. */
function Som({
  r, marca, fechar, idx
}: {
  r: Extract<RodadaBatalha, { tipo: 'som' }>;
  marca: Marca; idx: number;
  fechar: (certo: boolean, texto: string | null, letterId: string, id: string, escolhida?: string) => void;
}) {
  const [ouviu, setOuviu] = useState(false);
  return (
    <div className="grid gap-4 justify-items-center">
      <p className="font-ui text-[14px] text-ink-muted text-center max-w-[36ch]">
        {tx.somInstrucao}
      </p>
      <div className="grid place-items-center min-h-[96px]" onClickCapture={() => setOuviu(true)}>
        <AudioButton audioId={r.audioId} label={tx.ouvir} ariaLabel={tx.ouvirSilaba} size="lg" slow />
      </div>
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-[420px]" dir="rtl">
        {r.opcoes.map(o => {
          const certa = o.id === r.alvo.id;
          const mostrar = !!marca;
          return (
            <button
              key={o.id}
              type="button"
              disabled={mostrar || !ouviu}
              onClick={() => fechar(certa, certa ? null : r.notaPt, r.alvo.id, `som:batalha:${r.alvo.id}:${idx}`)}
              className={`min-h-[72px] rounded-[var(--r-md)] border px-4 grid place-items-center gap-0.5
                transition-colors disabled:opacity-60
                ${mostrar && certa
                  ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                  : mostrar ? 'border-line bg-surface text-ink-muted'
                  : 'border-line bg-surface text-ink enabled:hover:bg-surface-2 enabled:active:scale-[.98]'}`}
            >
              <He size="lg">{o.letter}</He>
              <span dir="ltr" className="font-ui text-[13px]">{o.namePt}</span>
            </button>
          );
        })}
      </div>
      {!ouviu && !marca && (
        <p className="font-ui text-[13px] text-ink-muted m-0">{tx.ouvirPrimeiro}</p>
      )}
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
      <p className="font-ui text-[14px] text-ink-muted">{tx.qualLetra}</p>
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
                certa ? null : porQueErrou(r.alvo, o) ?? tx.estaEA(r.alvo.namePt),
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
              {tx.nomeDaOpcao(o.namePt, !!r.final)}
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
      /* A outra forma da MESMA letra: o retorno diz qual forma é qual, e não
         a diferença entre as duas letras do par. */
      const mesma = cel.letterId === r.alvo.id;
      const texto = !mesma ? porQueErrou(r.alvo, r.outra)
        : r.glifo === r.alvo.finalForm
          ? tx.pediaFinal(r.alvo.namePt)
          : tx.pediaComeco(r.alvo.namePt);
      fechar(false, texto, r.alvo.id, `batalha:${r.alvo.id}:t${idx}`, mesma ? undefined : cel.glifo);
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
        {tx.toqueEmTodas(<He size="inline" tone="teal" className="font-bold">{r.glifo}</He>)}
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
      <p className="font-ui text-[15px] text-ink-body text-center">{tx.qualDiferente}</p>
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
          {marca.ok ? tx.isso : marca.texto ?? tx.olheComCalma}
        </p>
      )}
    </div>
  );
}
