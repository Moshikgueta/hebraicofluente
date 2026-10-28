'use client';

/* A Aula 0 em passos curtos (28/10/2026, pedido do dono: "está muito fraca
 * e não chamativa").
 * ─────────────────────────────────────────────────────────────────────────
 * Eram dezesseis quadros que abriam com um clique, numa página de mais de
 * quatro mil pixels no celular: quem chegava empolgado depois de pagar
 * encontrava uma apostila. Agora a aula tem quatro modos:
 *
 *   capa    - a abertura, com o que a aula entrega e um botão só;
 *   passos  - onze telas, uma ideia por vez, com a barra de progresso no
 *             alto e Voltar/Próximo embaixo, como a etapa 1 da lição;
 *   fim     - a comemoração, quando a checagem final passa;
 *   pagina  - a página inteira de antes, com o índice, para consultar.
 *
 * O CONTEÚDO não mudou: cada passo mostra partes que já existiam
 * (StartHereClient.tsx), e todas continuam no HTML em qualquer modo. Um link
 * com `#parte` (as lições apontam para cá) abre direto a página inteira.
 *
 * O passo em que o aluno parou fica no aparelho (`hf-aula0-passo`): é
 * conveniência, e sem ele a capa só não oferece "continuar".
 */

import { useCallback, useEffect, useState } from 'react';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Yael } from '@/components/aventura/Yael';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-aula0-passos';

export type ModoDaAula0 = 'capa' | 'passos' | 'pagina' | 'fim';

/* Onze passos. A ordem é a da página, e cada id é o de uma <Parte>. */
export const PASSOS_DA_AULA0: { nome: string; partes: ReadonlySet<string> }[] = [
  { nome: tx.passo1, partes: new Set(['o-sistema', 'a-comparacao']) },
  { nome: tx.passo2, partes: new Set(['as-vogais']) },
  { nome: tx.passo3, partes: new Set(['o-niqqud']) },
  { nome: tx.passo4, partes: new Set(['checagem-niqqud']) },
  { nome: tx.passo5, partes: new Set(['as-quatro-letras']) },
  { nome: tx.passo6, partes: new Set(['a-direcao', 'duas-direcoes']) },
  { nome: tx.passo7, partes: new Set(['maiuscula-e-finais']) },
  { nome: tx.passo8, partes: new Set(['impressa-e-cursiva']) },
  { nome: tx.passo9, partes: new Set(['que-hebraico']) },
  { nome: tx.passo10, partes: new Set(['o-caminho', 'como-funciona', 'como-praticar']) },
  { nome: tx.passo11, partes: new Set(['atividade']) }
];

const CHAVE = 'hf-aula0-passo';

function lerPasso(): number {
  try {
    const n = Number(localStorage.getItem(CHAVE));
    return Number.isInteger(n) && n > 0 && n < PASSOS_DA_AULA0.length ? n : 0;
  } catch { return 0; }
}

export function useModoDaAula0() {
  const [modo, setModo] = useState<ModoDaAula0>('capa');
  const [passo, setPasso] = useState(0);
  const [guardado, setGuardado] = useState(0);

  useEffect(() => {
    setGuardado(lerPasso());
    /* Um endereço com #parte vem de um link de lição: é consulta. */
    if (window.location.hash.length > 1) setModo('pagina');
  }, []);

  const irAoPasso = useCallback((n: number) => {
    setPasso(n);
    setModo('passos');
    try { localStorage.setItem(CHAVE, String(n)); } catch { /* sem aparelho, sem memória */ }
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.getElementById('aula0-topo')?.focus({ preventScroll: true });
    });
  }, []);

  const mudarModo = useCallback((m: ModoDaAula0) => {
    setModo(m);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }, []);

  return { modo, setModo: mudarModo, passo, guardado, irAoPasso };
}

/* ── a capa ────────────────────────────────────────────────────────────── */

const O_QUE_ENTREGA = [
  tx.entrega1,
  tx.entrega2,
  tx.entrega3
];

export function Aula0Capa({ feita, guardado, comecar, paginaInteira }: {
  feita: boolean;
  guardado: number;
  comecar: (passo: number) => void;
  paginaInteira: () => void;
}) {
  const continuar = !feita && guardado > 0;
  return (
    <section aria-labelledby="aula0-titulo"
             className="relative overflow-hidden rounded-[var(--r-lg)] bg-[var(--accent-bg)] text-white
                        px-6 py-8 sm:px-10 sm:py-12 grid gap-6 shadow-[var(--sh)]">
      {/* A Yael, protótipo da companheira da aventura (Yael.tsx). */}
      <Yael className="absolute right-2 top-2 w-[84px] sm:w-[110px]" />
      <p className="m-0 justify-self-start rounded-full bg-white/12 px-3 py-1 font-ui text-[12.5px]
                    font-semibold uppercase tracking-[.1em] text-white">
        {fmt(tx.capaSelo, { n: PASSOS_DA_AULA0.length })}
      </p>
      <h1 id="aula0-titulo" className="m-0 text-white text-[30px] sm:text-[40px] font-bold leading-[1.12]">
        {tx.capaTitulo}
      </h1>

      {/* A palavra se revela da direita para a esquerda, que é a primeira
          coisa que esta aula ensina; a seta corre no mesmo sentido. */}
      <div className="grid justify-items-center gap-1 py-2">
        <He size="plate" className="text-white hf-revela">שָׁלוֹם</He>
        <div aria-hidden className="relative w-[120px] h-5 overflow-hidden">
          <span className="seta-rtl absolute top-0 font-ui text-[16px] text-white/85">←</span>
        </div>
        <p className="m-0 font-ui text-[13.5px] text-white/85">
          {tx.capaLeitura}
        </p>
      </div>

      <ul className="grid gap-2.5 list-none p-0 m-0">
        {O_QUE_ENTREGA.map((t, i) => (
          <li key={t} className="flex gap-3 font-ui text-[15.5px] leading-snug text-white">
            <span aria-hidden
                  className="shrink-0 w-6 h-6 rounded-full bg-white text-[var(--navy)] font-bold
                             text-[13px] grid place-items-center tabular-nums">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3">
        <button type="button" onClick={() => comecar(continuar ? guardado : 0)}
                className="min-h-[56px] w-full rounded-[var(--r-md)] bg-white px-7 font-ui text-[16.5px]
                           font-semibold text-[var(--navy)] shadow-[var(--sh)]
                           transition-[transform,scale] duration-[var(--dur)] active:scale-[.97]">
          {feita ? tx.rever
            : continuar ? fmt(tx.continuarDo, { n: guardado + 1 })
            : tx.comecar}
        </button>
        <p className="m-0 text-center font-ui text-[13.5px] text-white/85">
          {feita
            ? tx.capaFeita
            : tx.capaDuracao}
        </p>
        <button type="button" onClick={paginaInteira}
                className="justify-self-center min-h-[44px] px-3 font-ui text-[14.5px] font-semibold
                           text-white underline underline-offset-4">
          {tx.verTudo}
        </button>
      </div>
    </section>
  );
}

/* ── a barra do passo ──────────────────────────────────────────────────── */

export function Aula0BarraDoPasso({ passo, sair }: { passo: number; sair: () => void }) {
  const total = PASSOS_DA_AULA0.length;
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={sair} aria-label={tx.sairAria}
                className="shrink-0 grid place-items-center w-11 h-11 -ml-2 rounded-full font-ui text-[20px]
                           text-ink-muted hover:bg-surface-2 active:scale-[.94]">
          ✕
        </button>
        {/* A barra é feita de um segmento por passo: o aluno vê quanto falta. */}
        <div aria-hidden className="flex-1 flex gap-1">
          {PASSOS_DA_AULA0.map((p, k) => (
            <span key={p.nome}
                  className={`h-2 flex-1 rounded-full transition-colors duration-[var(--dur-toque)]
                              ${k <= passo ? 'bg-[var(--teal)]' : 'bg-[var(--line)]'}`} />
          ))}
        </div>
        <span className="shrink-0 font-ui text-[13px] font-semibold text-ink-muted tabular-nums">
          {passo + 1}/{total}
        </span>
      </div>
      <p id="aula0-topo" tabIndex={-1}
         className="m-0 font-ui text-[12.5px] font-bold uppercase tracking-[.1em] text-[var(--accent)] outline-none">
        {fmt(tx.passoDe, { n: passo + 1, total })}
      </p>
    </div>
  );
}

export function Aula0NavDoPasso({ passo, irPara }: { passo: number; irPara: (n: number) => void }) {
  const ultimo = passo === PASSOS_DA_AULA0.length - 1;
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2">
      {passo > 0
        ? <Button variant="secondary" size="lg" onClick={() => irPara(passo - 1)}>{tx.voltar}</Button>
        : <span />}
      {ultimo
        ? <p className="m-0 self-center font-ui text-[14px] leading-snug text-ink-muted">
            {tx.respondaChecagem}
          </p>
        : <Button size="lg" full onClick={() => irPara(passo + 1)}>
            {fmt(tx.proximo, { nome: PASSOS_DA_AULA0[passo + 1]!.nome.toLowerCase() })}
          </Button>}
    </div>
  );
}

/* ── o fim ─────────────────────────────────────────────────────────────── */

/* As faíscas em volta do selo: posições fixas, para não pular entre renders. */
const FAISCAS = [
  { x: '8%', y: '18%', d: '0ms' }, { x: '86%', y: '12%', d: '120ms' },
  { x: '16%', y: '72%', d: '220ms' }, { x: '80%', y: '66%', d: '60ms' },
  { x: '50%', y: '4%', d: '180ms' }, { x: '94%', y: '40%', d: '260ms' }
];

export function Aula0Fim({ primeiraLicao, letra, paginaInteira }: {
  primeiraLicao: string;
  letra: string;
  paginaInteira: () => void;
}) {
  return (
    <section aria-labelledby="aula0-fim"
             className="relative overflow-hidden rounded-[var(--r-lg)] bg-[var(--accent-bg)] text-white
                        px-6 py-10 sm:px-10 sm:py-14 grid gap-5 justify-items-center text-center shadow-[var(--sh)]">
      {FAISCAS.map(f => (
        <span key={f.x + f.y} aria-hidden
              className="animate-spark absolute w-3 h-3 rounded-[2px] bg-[var(--gold)]"
              style={{ left: f.x, top: f.y, animationDelay: f.d }} />
      ))}
      <div className="flex items-end gap-2">
        <span aria-hidden
              className="animate-pop grid place-items-center w-20 h-20 rounded-full bg-white
                         text-[var(--navy)] text-[38px] font-bold">✓</span>
        <Yael pulando className="w-[84px]" />
      </div>
      <h1 id="aula0-fim" className="m-0 text-white text-[30px] sm:text-[38px] font-bold leading-tight">
        {tx.fimTitulo}
      </h1>
      <p className="m-0 max-w-[40ch] font-ui text-[16px] leading-relaxed text-white">
        {tx.fimTexto}
      </p>
      <He size="display" className="text-white hf-revela">{letra}</He>
      <LinkButton href={`/licao/${primeiraLicao}`} size="lg" full
                  className="!bg-white !text-[var(--navy)] max-w-[420px]">
        {tx.fimComecar}
      </LinkButton>
      <button type="button" onClick={paginaInteira}
              className="min-h-[44px] px-3 font-ui text-[14.5px] font-semibold text-white underline underline-offset-4">
        {tx.fimVerPagina}
      </button>
    </section>
  );
}
