'use client';

/* Módulo 0 - "Como o alfabeto hebraico funciona", antes da primeira letra.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta tela responde, ANTES do alef, às perguntas que todo brasileiro traz e
 * que nenhuma lição responde sozinha: por que esse alfabeto parece não ter
 * vogais, para que lado se lê, por que uma letra muda de desenho no fim da
 * palavra, o que quer dizer "letra muda", e o que o curso vai fazer com ele.
 *
 * Sem isso, a lição 1 começa a ensinar o alef para alguém que ainda está
 * tentando entender por que o texto corre ao contrário - e a primeira aula
 * vira a aula em que se aprende a ter medo.
 *
 * ── três decisões de conteúdo ───────────────────────────────────────────
 * 1. O TERMO VEM DEPOIS DO CONCEITO. "Abjad" e "nikud" aparecem, mas sempre
 *    depois da frase que explica a coisa. Um termo técnico apresentado antes
 *    do conceito é uma palavra para decorar; depois, é uma etiqueta para uma
 *    coisa que a pessoa já entendeu.
 *
 * 2. A FRASE "O HEBRAICO NÃO TEM VOGAIS" É DESMONTADA DE PROPÓSITO. Ela é o
 *    resumo que circula na internet e é falsa do jeito que importa: a língua
 *    tem os sons, o que muda é como eles são escritos. Um aluno que acredita
 *    na versão curta trava na primeira palavra que ouve e não sabe escrever.
 *
 * 3. AS QUATRO LETRAS ESPECIAIS (א ה ו י) SÃO ANUNCIADAS AQUI, sem regra
 *    nenhuma. O objetivo é que ninguém pense, na lição 3, "mas você disse
 *    que todas as letras são consoantes" - a contradição aparente é
 *    prevista, nomeada, e adiada para o lugar onde ela é ensinada.
 *
 * 4. O ALUNO PRECISA SABER QUE HEBRAICO ELE ESTÁ APRENDENDO. "Bíblico ou
 *    moderno?" é uma dúvida que quase ninguém faz em voz alta e quase todo
 *    mundo tem - e as duas versões dela são medo: quem quer ler a Torah teme
 *    estar aprendendo uma língua que não serve para isso, e quem quer falar
 *    com a família teme o contrário. A resposta é a mesma para os dois: o
 *    alfabeto é um só. Descobrir isso na lição 12 é descobrir tarde.
 *
 * ── o que esta tela NÃO é ───────────────────────────────────────────────
 * Aula de linguística. Nada aqui precisa ser memorizado, e o quadro completo
 * dos sinais de vogal - que existia solto no meio da página - foi para
 * dentro de um "Quer saber mais?" fechado: ele é excelente para consultar e
 * péssimo como terceira tela de quem nunca viu hebraico.
 *
 * ── índice, porque ela é longa ──────────────────────────────────────────
 * Onze quadros, e num telefone isso passa de dezessete mil pixels. Uma
 * página de "leia antes de começar" também é uma página para VOLTAR - o
 * próprio texto convida a isso quando um assunto reaparece numa lição -, e
 * voltar sem índice é rolar procurando. Os destinos dos itens são conferidos
 * num navegador por `varrer-curso.mjs`: um item apontando para um id que não
 * existe não quebra nada, e é por isso que ninguém o encontraria.
 *
 * ── e ela não pode voltar a ser órfã ────────────────────────────────────
 * Esta página existiu desde o começo e nenhuma tela linkava para ela. O fim
 * do onboarding e o painel agora trazem para cá; `varrer-curso.mjs` recusa a
 * volta do estado anterior.
 */

import { IconeSom } from '@/components/shell/NavIcons';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useProgress } from '@/lib/state/store';
import { He } from '@/components/hebrew/He';
import { Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { hasAudio, tocarClipe, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { Prose, RegraCursiva } from '@/components/learn/Blocks';
import { Compreensao, type ItemCompreensao } from '@/components/learn/Compreensao';
import { GravacaoDoProfessor } from '@/components/learn/GravacaoDoProfessor';
import { AULA0_CONCLUIDA, AULA0_MINIMO, AULA0_PERGUNTAS, aula0Feita } from '@/lib/state/rules';
import { AbrirTodas, Parte, Partes, SoNaPagina, useAbrirParte } from '@/components/learn/Partes';
import {
  Aula0BarraDoPasso, Aula0Capa, Aula0Fim, Aula0NavDoPasso, PASSOS_DA_AULA0, useModoDaAula0
} from './Aula0Passos';
import {
  ANALOGIA_CURSIVA, CURSIVA_NO_CURSO, MESMA_LETRA,
  ONDE_CURSIVA, ONDE_IMPRESSA
} from '@/lib/cursiva';
import type { NikudIntro, NikudSound } from '@/lib/content';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-start-here-client';
import { tx as tq } from '@/i18n/telas/painel-start-here-perguntas';
import { translit as grafia } from '@/i18n/translit';

/* ── as oito perguntas do nikud ──────────────────────────────────────────
   Cada uma existe contra um mal-entendido específico, e não para cobrir o
   texto: o que se confere é o que costuma sair torto da leitura.

   O círculo pontilhado (◌) é a convenção tipográfica para mostrar um sinal
   que não existe sozinho: ele se agarra à letra anterior, e sem um portador
   o navegador o pendura em qualquer coisa que estiver do lado. */
const PERGUNTAS_NIQQUD: ItemCompreensao[] = [
  {
    t: 'escolha',
    q: tq.n1q,
    opcoes: [tq.n1o1, tq.n1o2, tq.n1o3],
    certa: 1,
    porque: tq.n1p
  },
  {
    t: 'visual',
    q: tq.n2q,
    opcoes: ['בַ', 'ב'],
    certa: 0,
    porque: tq.n2p
  },
  {
    t: 'visual',
    q: tq.n3q,
    opcoes: ['◌ַ', 'ב'],
    certa: 0,
    porque: tq.n3p
  },
  {
    t: 'vf',
    q: tq.n4q,
    certa: false,
    porque: tq.n4p
  },
  {
    t: 'vf',
    q: tq.n5q,
    certa: false,
    porque: tq.n5p
  },
  {
    t: 'escolha',
    q: tq.n6q,
    opcoes: [tq.n6o1, tq.n6o2, tq.n6o3],
    certa: 1,
    porque: tq.n6p
  },
  {
    t: 'vf',
    q: tq.n7q,
    certa: false,
    porque: tq.n7p
  },
  {
    t: 'assoc',
    q: tq.n8q,
    rotulos: [tq.n8r1, tq.n8r2],
    linhas: [
      { item: tq.n8l1, certa: 0 },
      { item: tq.n8l2, certa: 0 },
      { item: tq.n8l3, certa: 1 },
      { item: tq.n8l4, certa: 1 }
    ],
    porque: tq.n8p
  }
];

/* ── o índice da página ────────────────────────────────────
   Cada `id` é o id de um <h2> lá embaixo, e a ordem é a ordem em que os
   quadros aparecem. O que NÃO está aqui é o que está fechado num "Quer
   saber mais?": listar conteúdo opcional num índice é a maneira mais rápida
   de ele deixar de ser opcional. */
const INDICE: { id: string; t: string }[] = [
  { id: 'o-sistema',         t: tx.iSistema },
  { id: 'a-comparacao',      t: tx.iComparacao },
  { id: 'as-vogais',         t: tx.iVogais },
  { id: 'o-niqqud',          t: tx.iNikud },
  { id: 'checagem-niqqud',   t: tx.iChecagemNikud },
  { id: 'as-quatro-letras',  t: tx.iQuatro },
  { id: 'a-direcao',         t: tx.iDirecao },
  { id: 'duas-direcoes',     t: tx.iDuas },
  { id: 'maiuscula-e-finais', t: tx.iMaiuscula },
  { id: 'impressa-e-cursiva', t: tx.iCursiva },
  { id: 'que-hebraico',      t: tx.iQueHebraico },
  { id: 'o-caminho',         t: tx.iCaminho },
  { id: 'atividade',         t: tx.iAtividade },
  { id: 'como-funciona',     t: tx.iComoFunciona }
];

/* As partes que abrem com um clique (components/learn/Partes.tsx): as do
   índice, mais "Como praticar", que fica fora dele. */
const PARTES = [...INDICE.map(i => i.id), 'como-praticar'];

const VAZIO: ReadonlySet<string> = new Set();

const SOUND_LABEL: Record<string, string> = {
  a: tx.somA, e: tx.somE, i: tx.somI, o: tx.somO, u: tx.somU,
  sheva: tx.semVogal
};

export type AlfabetoProps = {
  total: number;
  finais: { base: string; final: string; nome: string }[];
  especiais: { letra: string; nome: string }[];
  exemplo: string;
};
export type CursoProps = { licoes: number; modulos: number; primeiraLicao: string };

export function StartHereClient({ sounds, intro, alfabeto, curso }: {
  sounds: NikudSound[];
  intro: NikudIntro;
  alfabeto: AlfabetoProps;
  curso: CursoProps;
}) {
  /* Abrir a Aula 0 fica anotado: até isso, o painel oferece ela como a ação
     principal, antes da lição 1 (auditoria de 01/10/2026, CONV-020). */
  const progresso = useProgress();
  useEffect(() => {
    if (progresso.ready && !progresso.state.firsts['aula-0']) progresso.markFirst('aula-0');
  }, [progresso]);

  /* A lista das vogais sabe quais têm gravação só depois que o manifesto
     chega; isto a redesenha quando chega. */
  useRegistroDeAudio();

  /* A capa, os passos, a página inteira e o fim (28/10/2026): ver
     Aula0Passos.tsx. As partes continuam todas no HTML em qualquer modo. */
  const { modo, setModo, passo, guardado, irAoPasso } = useModoDaAula0();
  const aula0FeitaJa = progresso.ready && aula0Feita(progresso.state);
  const passoVisivel = modo === 'pagina' ? null
    : modo === 'passos' ? PASSOS_DA_AULA0[passo]!.partes
    : VAZIO;
  return (
    <div className="grid gap-6 reading">
      {modo === 'capa' && (
        <Aula0Capa feita={aula0FeitaJa} guardado={guardado}
                   comecar={irAoPasso} paginaInteira={() => setModo('pagina')} />
      )}
      {modo === 'fim' && (
        <Aula0Fim primeiraLicao={curso.primeiraLicao} letra={alfabeto.exemplo}
                  paginaInteira={() => setModo('pagina')} />
      )}
      {modo === 'passos' && <Aula0BarraDoPasso passo={passo} sair={() => setModo('capa')} />}

      <header hidden={modo !== 'pagina'} className="grid gap-3">
        <Link href="/mapa"
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          {tx.voltarMapa}
        </Link>
        {/* O nome aparece aqui porque agora ele também está na navegação:
            quem toca em "Aula 0" na barra de baixo precisa chegar numa tela
            que se chama assim, ou o rótulo é de outra coisa. */}
        <Badge tone="accent">{tx.badge}</Badge>
        <h1 className="text-[27px] sm:text-[34px] font-bold leading-tight">
          {tx.titulo}
        </h1>
        <p className="text-[16.5px] leading-relaxed text-ink-body max-w-[54ch]">
          {tx.lead}
        </p>
        <Aula0Situacao />
      </header>

      <Partes ids={PARTES} abertaDeInicio="o-sistema" passo={passoVisivel}>
      {/* ── o índice ────────────────────────────────────────
          Esta página passou de oito quadros para onze, e num telefone isso é
          um rolo de dúzias de telas. Uma página de "leia antes de começar"
          também é uma página para VOLTAR - o próprio texto convida a isso
          quando um assunto reaparece numa lição - e voltar sem índice é
          rolar procurando.

          Os destinos são conferidos por varrer-curso.mjs: um item de índice
          que aponta para um id que não existe leva a lugar nenhum e não
          quebra nada, que é a definição do defeito que ninguém encontra. */}
      <SoNaPagina>
      <nav aria-labelledby="indice"
           className="rounded-[var(--r-lg)] border border-line bg-surface p-5 grid gap-3">
        <h2 id="indice" className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-ink-muted">
          {tx.indiceTitulo}
        </h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-0.5 list-none p-0 m-0">
          {INDICE.map((it, i) => (
            <li key={it.id}>
              <LinkDoIndice id={it.id}
                 className="flex items-baseline gap-2.5 min-h-[36px] py-1 font-ui text-[14.5px]
                            leading-snug text-ink-body hover:text-[var(--accent)]">
                <span aria-hidden className="font-ui text-[12px] text-ink-muted tabular-nums w-4 shrink-0">
                  {i + 1}
                </span>
                <span>{it.t}</span>
              </LinkDoIndice>
            </li>
          ))}
        </ol>
      </nav>

      <p className="font-ui text-[14.5px] text-ink-muted -mb-3">
        {tx.abreComClique}
      </p>
      <AbrirTodas />
      </SoNaPagina>

      {/* ── 1 · o sistema é outro ─────────────────────────────────────── */}
      <Parte id="o-sistema" titulo={<>{tx.iSistema}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.sistemaP1}
        </p>
        <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
          <p className="font-display text-[30px] font-bold tracking-[.12em] text-ink">{tx.palavraCasa}</p>
          <p className="font-ui text-[14px] text-ink-muted">
            {tx.casaLegenda(v => <span className="text-[var(--accent)]">{v}</span>)}
          </p>
        </div>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.sistemaP2()}
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          {tx.sistemaP3()}
        </p>
      </Parte>

      {/* ── 2 · a analogia, marcada como analogia ─────────────────────── */}
      <Parte id="a-comparacao" titulo={<>{tx.iComparacao}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.comparacaoP1()}
        </p>
        <CasaSemVogais />
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          {tx.comparacaoP2()}
        </p>
      </Parte>

      {/* ── 3 e 5 · onde estão as vogais, e o que NÃO dizer ───────────── */}
      <Parte id="as-vogais" titulo={<>{tx.iVogais}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.vogaisP1(<He size="inline">שָׁלוֹם</He>)}
        </p>
        <ol className="grid gap-3 list-none p-0 m-0 text-[15.5px] leading-relaxed text-ink-body">
          {[
            [tx.vogal1T, tx.vogal1D],
            [tx.vogal2T, tx.vogal2D],
            [tx.vogal3T, tx.vogal3D]
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden
                    className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent-wash)]
                               text-[var(--teal-ink)] font-ui text-[13px] font-bold
                               grid place-items-center">{i + 1}</span>
              <span>
                <strong className="font-semibold text-ink">{t}.</strong> {d}
              </span>
            </li>
          ))}
        </ol>
        {/* O item 5 do pedido: desmontar a frase que circula por aí. */}
        <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-2">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
            {tx.cuidadoTitulo}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.cuidadoP()}
          </p>
        </div>
      </Parte>

      {/* ── 4 · o nikud ──────────────────────────────────────────────── */}
      <Parte id="o-niqqud" titulo={<>{tx.tNikud}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.nikudP1(<He size="inline">נִקוּד</He>)}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שָׁלוֹם</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">
              {tx.comNikud}
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שלום</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">
              {tx.semNikud}
            </p>
          </div>
        </div>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[
            tx.nikudL1, tx.nikudL2, tx.nikudL3
          ].map(t => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="text-[var(--accent)] shrink-0">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <MesmasConsoantes />
        <GravacaoDoProfessor id="intro-nikud-vowels"
          textoPt={tx.gravacaoNikud} />
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          {tx.nikudP2}
        </p>
        {/* Nem todo pontinho é vogal. Esta ressalva fica AQUI, colada na
            explicação, porque é o mal-entendido que a explicação cria: quem
            acabou de aprender "pontos = vogais" lê o daguesh de בּ e o ponto
            do shin como vogal, e depois não entende por que a conta não
            fecha. A pergunta 7 da checagem cobra exatamente isto. */}
        <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-2">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
            {tx.ressalvaTitulo}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.ressalvaP(<He size="inline">בּ</He>, <He size="inline">שׁ</He>, <He size="inline">שׂ</He>,
              <He size="inline">ו</He>, <He size="inline">וּ</He>)}
          </p>
        </div>
      </Parte>

      {/* ── a checagem do nikud ──────────────────────────────────────────
          Explicação → exemplo → PERGUNTAS → prática. O conceito acima é o
          mais importante desta página inteira, e também o mais fácil de
          "achar que entendeu": ele é simples de ler e difícil de acreditar,
          porque contraria o que a pessoa acha que sabe sobre escrita. Então
          o curso não segue sem perguntar. */}
      <Parte id="checagem-niqqud" titulo={<>{tx.tChecagemNikud}</>}>
      <Compreensao
        id="checagem-niqqud-perguntas"
        tituloOculto
        titulo={tx.checagemNikudTitulo}
        intro={tx.checagemNikudIntro}
        perguntas={PERGUNTAS_NIQQUD}
        fecho={{
          bom: tx.checagemNikudBom,
          parcial: tx.checagemNikudParcial
        }}
      />
      </Parte>

      {/* ── 6 · as quatro letras especiais ────────────────────────────── */}
      <Parte id="as-quatro-letras" titulo={<>{tx.tQuatro}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.quatroP1}
        </p>
        <ul className="flex flex-wrap gap-2.5 list-none p-0 m-0">
          {alfabeto.especiais.map(e => (
            <li key={e.letra}
                className="flex items-center gap-2.5 rounded-[var(--r-sm)] bg-surface-2 px-4 py-2.5">
              <He size="word">{e.letra}</He>
              <span className="font-ui text-[13px] text-ink-muted">{e.nome}</span>
            </li>
          ))}
        </ul>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.quatroP2}
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          {tx.quatroP3()}
        </p>
      </Parte>

      {/* ── 7 · a direção, com atividade ──────────────────────────────── */}
      <Parte id="a-direcao" titulo={<>{tx.iDirecao}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.direcaoP1}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <p className="font-display text-[22px] font-bold tracking-[.1em] text-ink">{tx.bomDia}</p>
            <p className="font-ui text-[12px] uppercase tracking-[.1em] text-ink-muted">
              {tx.comecaAquiEsq}
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שָׁלוֹם</He>
            <p className="font-ui text-[12px] uppercase tracking-[.1em] text-ink-muted">
              {tx.comecaAquiDir}
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed text-ink-body">
          {tx.direcaoP2}
        </p>

        <PorOndeComeca />
        <PrimeiraEUltima />
        <GravacaoDoProfessor id="intro-rtl-reading"
          textoPt={tx.gravacaoDirecao} />

        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          {tx.direcaoP3()}
        </p>
      </Parte>

      {/* ── 7b · a linha com duas direções ─────────────────────────
          "Os números vão para o outro lado" era uma frase solta, e frase solta
          sobre direção não ensina nada: a pessoa só entende quando VÊ o
          endereço com o número parado na ponta ESQUERDA de uma linha que corre
          para a direita. E ela vai ver isso antes de terminar o curso - numa
          placa, num preço, num site. Sem este quadro, o primeiro encontro com
          uma linha assim parece erro de impressão ou defeito da tela. */}
      <Parte id="duas-direcoes" titulo={<>{tx.iDuas}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.duasP1}
        </p>
        <ul className="grid gap-3 list-none p-0 m-0">
          {LINHAS_MISTAS.map(l => (
            <li key={l.nota} className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-2">
              <LinhaMista partes={l.partes} />
              <p className="font-ui text-[13px] leading-snug text-ink-muted">{l.nota}</p>
            </li>
          ))}
        </ul>
        <p className="font-ui text-[13px] text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="w-3 h-3 rounded-[3px] bg-[var(--accent-wash)]
                                         border border-[color:var(--accent-soft)]" />
            {tx.legendaTrecho}
          </span>
        </p>
        <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-4">
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.duasP2()}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.duasP3}
          </p>
        </div>
      </Parte>

      {/* ── 8, 9 e 10 · maiúscula, formas finais, letra muda ──────────── */}
      <Parte id="maiuscula-e-finais" titulo={<>{tx.iMaiuscula}</>}>
        <div className="grid gap-3">
          <h3 className="font-display text-[17px] font-semibold">
            {tx.semMaiusculaT}
          </h3>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            {tx.semMaiusculaP}
          </p>
        </div>

        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-5">
          <h3 className="font-display text-[17px] font-semibold">
            {fmt(tx.finaisT, { n: alfabeto.finais.length })}
          </h3>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            {tx.finaisP}
          </p>
          <ul className="flex flex-wrap gap-2.5 list-none p-0 m-0">
            {alfabeto.finais.map(f => (
              <li key={f.base}
                  className="flex items-center gap-2 rounded-[var(--r-sm)] bg-surface-2 px-3 py-2">
                <He size="word">{f.base}</He>
                <span aria-hidden className="text-ink-muted text-[15px]">→</span>
                <He size="word">{f.final}</He>
                <span className="font-ui text-[12px] text-ink-muted">{f.nome}</span>
              </li>
            ))}
          </ul>
          <p className="font-ui text-[13.5px] text-ink-muted">
            {tx.finaisNota}
          </p>
        </div>

        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-5">
          <h3 className="font-display text-[17px] font-semibold">
            {tx.mudaT}
          </h3>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            {tx.mudaP1()}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.mudaP2()}
          </p>
        </div>
      </Parte>

      {/* ── 10d · impressa e cursiva ────────────────────────────────────
          O aluno brasileiro não desconfia que isto exista. Ele vai estudar
          a forma impressa a lição inteira e, na etapa de escrever, ser
          mandado treinar um desenho que nunca viu - e a lição dizia só a
          conclusão ("ninguém escreve à mão em letra de imprensa"), que sem
          o argumento soa a capricho.

          Fica ANTES do quadro do hebraico moderno porque é sobre o mesmo
          assunto que os dois anteriores: o que muda de forma sem mudar de
          letra. Maiúscula não existe, a forma final existe, e a cursiva é
          a terceira peça dessa mesma ideia.

          O texto vem de lib/cursiva.ts, que é o mesmo que a etapa
          "Escrever" de cada lição lê. */}
      <Parte id="impressa-e-cursiva" titulo={<>{tx.tCursiva}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.cursivaP1()}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">{alfabeto.exemplo}</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">{tx.impressa}</p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg" cursive>{alfabeto.exemplo}</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">{tx.cursiva}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              {tx.impressaEm}
            </p>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {ONDE_IMPRESSA.join(', ')}.
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              {tx.cursivaEm}
            </p>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {ONDE_CURSIVA.join(', ')}.
            </p>
          </div>
        </div>
        <p className="text-[15.5px] leading-relaxed text-ink-body">{ANALOGIA_CURSIVA}</p>

        <RegraCursiva />

        <p className="text-[15px] leading-relaxed text-ink-body">{MESMA_LETRA}</p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          {CURSIVA_NO_CURSO}
        </p>

        <NoCaderno />
      </Parte>
      {/* ── 10b · que hebraico é este ──────────────────────────────────
          A pergunta que quase todo aluno traz e quase nunca faz em voz alta:
          "o hebraico da Torah e o hebraico de Tel Aviv são a mesma coisa?
          Estou aprendendo o certo?". Quem quer ler a Torah teme estar
          aprendendo uma língua moderna que não serve para isso; quem quer
          falar com a família teme estar aprendendo uma língua antiga que
          ninguém usa. Os dois medos têm a mesma resposta - as letras são as
          mesmas -, e ela é melhor dada aqui do que descoberta na lição 12.

          O que NENHUMA linha aqui faz é prometer compreensão: ler e entender
          são trabalhos diferentes, e um curso de alfabetização entrega o
          primeiro. Dizer o contrário venderia melhor e seria mentira. */}
      <Parte id="que-hebraico" titulo={<>{tx.tQueHebraico}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.queP1(alfabeto.total)}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              {tx.igualT}
            </p>
            <ul className="grid gap-1.5 text-[14.5px] leading-relaxed text-ink-body">
              {[tx.igual1, tx.igual2, tx.igual3].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              {tx.mudouT}
            </p>
            <ul className="grid gap-1.5 text-[14.5px] leading-relaxed text-ink-body">
              {[tx.mudou1, tx.mudou2, tx.mudou3].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {tx.queP2()}
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          {tx.queP3()}
        </p>
      </Parte>

      {/* ── 10c · a história, fechada ──────────────────────────────────
          Fechada porque é história, e história não é pré-requisito de ler:
          quem quer começar pelas letras não deve ter de rolar por cima dela.
          E fica AQUI porque é onde a pergunta nasce - quem acabou de ler que
          os dois hebraicos são fases da mesma língua quer saber o que
          aconteceu no meio.

          O texto é curto de propósito, e escrito daqui: a versão da aula
          mora em data/culture.json e aparece em /historia/, que é conteúdo
          do curso. Os FATOS são os mesmos - as datas daqui são as de lá -,
          a redação não, e isso não é estilo: um chunk de /_next/static não
          tem portão, e `pacote.mjs` recusa a build que leva a prosa paga
          para dentro dele. A primeira versão deste quadro copiava a frase
          de abertura da carta e derrubou o deploy 93, que é exatamente o
          trabalho daquele verificador. */}
      <SoNaPagina noPasso="que-hebraico">
      <details className="rounded-[var(--r-lg)] border border-line bg-surface overflow-hidden">
        <summary className="cursor-pointer list-none p-5 font-ui text-[15px] font-semibold text-ink
                            hover:bg-surface-2 flex items-center justify-between gap-3">
          <span>{tx.historiaResumo}</span>
          <span aria-hidden className="text-ink-muted">▾</span>
        </summary>
        <div className="px-5 pb-5 grid gap-3 border-t border-[color:var(--line-soft)] pt-4
                        text-[15px] leading-relaxed text-ink-body">
          <p>
            {tx.historia1}
          </p>
          <p>
            {tx.historia2}
          </p>
          <p>
            {tx.historia3}
          </p>
          <p className="border-t border-[color:var(--line-soft)] pt-3">
            {tx.historia4}
          </p>
          <Link href="/historia"
                className="font-ui text-[14px] font-semibold text-[var(--accent)]
                           underline underline-offset-4 min-h-[44px] inline-flex items-center">
            {tx.historiaLink}
          </Link>
        </div>
      </details>
      </SoNaPagina>
      {/* ── 11 · o mapa ───────────────────────────────────────────────── */}
      <Parte id="o-caminho" tone="wash" titulo={<>{tx.iCaminho}</>}>
        {/* Uma CORRENTE, e não dez cartões empilhados.
            ──────────────────────────────────────────────────────────────
            Eram cinco cartões, e o caminho de verdade tem dez passos - os
            dois que faltavam são os que mais interessam a quem está
            começando: reconhecer padrões, e ir precisando cada vez menos
            do nikud. Dez cartões custariam meia tela numa página que já é
            a mais longa do curso; em corrente, os dez ocupam menos que os
            cinco de antes e leem como o que são: um percurso. */}
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 list-none p-0 m-0">
          {[
            tx.caminho1, tx.caminho2, tx.caminho3,
            tx.caminho4, tx.caminho5, tx.caminho6,
            tx.caminho7, tx.caminho8, tx.caminho9,
            tx.caminho10
          ].map((t, i, todos) => (
            <li key={t} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface
                               px-3 py-1.5 font-ui text-[13.5px] text-ink">
                <span aria-hidden className="font-bold text-[11px] text-[var(--teal-ink)] tabular-nums">
                  {i + 1}
                </span>
                {t}
              </span>
              {i < todos.length - 1 && (
                <span aria-hidden className="text-ink-muted text-[13px]">→</span>
              )}
            </li>
          ))}
        </ol>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          {tx.caminhoNota}
        </p>
        {/* ── 12 · a mensagem que acalma, sem promessa de venda ──────────
            Era um parágrafo dizendo "você não precisa entender tudo agora".
            Virou a lista do que especificamente parece estranho, porque a
            tranquilização genérica não tranquiliza: quem está com medo de
            uma coisa concreta precisa ver a SUA coisa escrita ali, e as
            cinco abaixo são as que este módulo acabou de apresentar. */}
        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-4">
          <h3 className="font-ui text-[15px] font-semibold text-ink">
            {tx.estranhasT}
          </h3>
          <ul className="grid gap-2 list-none p-0 m-0">
            {[tx.estranha1, tx.estranha2, tx.estranha3, tx.estranha4, tx.estranha5].map(t => (
              <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-ink-body">
                <span aria-hidden className="text-[var(--accent)] shrink-0">→</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.estranhasP}
          </p>
        </div>

        {/* A ordem das letras é a última coisa que o aluno estranha, e ele
            estranha DEPOIS - quando abre o mapa e vê {{מ}} em segundo. A
            resposta mora lá, e aqui fica o aviso de que ela existe. */}
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          {tx.ordemP(t => (
            <Link href="/mapa"
                  className="font-semibold text-[var(--accent)] underline underline-offset-4">
              {t}
            </Link>
          ))}
        </p>
      </Parte>

      {/* ── 13 · a atividade rápida, agora sobre a página inteira ─────── */}
      <Parte id="atividade" titulo={<>{tx.iAtividade}</>}>
      <ChecagemFinal aoPassar={() => { if (modo === 'passos') setModo('fim'); }} />
      </Parte>

      {/* ── como o curso funciona ─────────────────────────────────────── */}
      <Parte id="como-funciona" titulo={<>{tx.tComoFunciona}</>}>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          {fmt(tx.comoP1, { licoes: curso.licoes, modulos: curso.modulos })}
        </p>
        <ol className="grid gap-3 list-none p-0 m-0 text-[15.5px] leading-relaxed text-ink-body">
          {[
            [tx.como1T, tx.como1D],
            [tx.como2T, tx.como2D],
            [tx.como3T, tx.como3D],
            [tx.como4T, tx.como4D],
            [tx.como5T, tx.como5D]
          ].map(([t, d]) => (
            <li key={t} className="grid gap-0.5">
              <span className="font-ui text-[14.5px] font-bold text-ink">{t}</span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          {tx.comoP2}
        </p>
      </Parte>

      <Parte id="como-praticar" tone="wash" titulo={<>{tx.tPraticar}</>}>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[tx.praticar1, tx.praticar2, tx.praticar3, tx.praticar4].map(t => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="text-[var(--accent)]">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Parte>

      {/* ── o quadro completo dos sinais, FECHADO ─────────────────────────
          Ele é excelente para consultar e péssimo como terceira tela de quem
          nunca viu hebraico: doze sinais de uma vez, antes da primeira letra,
          é a definição de sobrecarga. Fica aqui, a um clique, e o curso
          ensina cada sinal na hora certa. */}
      <SoNaPagina noPasso="o-niqqud">
      <details className="rounded-[var(--r-lg)] border border-line bg-surface overflow-hidden">
        <summary className="cursor-pointer list-none p-5 font-ui text-[15px] font-semibold text-ink
                            hover:bg-surface-2 flex items-center justify-between gap-3">
          <span>{tx.quadroResumo}</span>
          <span aria-hidden className="text-ink-muted">▾</span>
        </summary>
        <div className="px-5 pb-5 grid gap-4 border-t border-[color:var(--line-soft)] pt-4">
          <div className="grid gap-1">
            <h3 className="font-display text-[17px] font-semibold">{intro.title}</h3>
            <p className="text-[15px] leading-relaxed text-ink-body">
              <Prose text={intro.lead} />
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink-body pt-2">
              <Prose text={intro.correction} />
            </p>
          </div>
          <p className="font-ui text-[13.5px] text-ink-muted">
            {tx.quadroNota}
          </p>
          {sounds.map(s => (
            <div key={s.sound} className="grid gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[20px] font-bold text-[var(--accent)]">
                  {s.sound === 'sheva' ? '-' : s.sound}
                </span>
                <span className="font-ui text-[13.5px] text-ink-muted">
                  {SOUND_LABEL[s.sound] ?? s.sound}
                </span>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 list-none p-0 m-0">
                {s.signs.map(g => (
                  <li key={g.demo}>
                    {/* Tocar na vogal é ouvir (27/09/2026), sem botão à parte. */}
                    <button type="button" onClick={() => tocarClipe(g.audioId)}
                            disabled={!hasAudio(g.audioId)}
                            aria-label={`${g.namePt}${hasAudio(g.audioId) ? tx.ouvirSufixo : ''}`}
                            className="w-full text-left flex items-center gap-4 rounded-[var(--r-md)] bg-surface-2 px-4 py-3
                                       min-h-[56px] enabled:hover:bg-[var(--accent-wash)] enabled:active:scale-[.99] transition">
                      <He size="lg">{g.demo}</He>
                      <span className="min-w-0 grid gap-0.5">
                        <span className="font-ui text-[14px] text-ink">{g.namePt}</span>
                        <span className="font-ui text-[12.5px] text-ink-muted leading-snug">
                          <Prose text={g.position} />
                        </span>
                      </span>
                      {hasAudio(g.audioId) && <span aria-hidden className="ml-auto text-[var(--accent)]"><IconeSom size={16} /></span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
      </SoNaPagina>
      </Partes>

      {modo === 'passos' && <Aula0NavDoPasso passo={passo} irPara={irAoPasso} />}

      {/* O destino sai do CURSO, e não escrito à mão.
          Escrito à mão ele estava - e apontava para a SEGUNDA letra. A tela
          que existe para não assustar ninguém mandava o iniciante pular a
          primeira lição, e nada nunca reclamou: o endereço existe, a página
          abre, e só quem conhece a ordem do alfabeto perceberia. */}
      <div hidden={modo !== 'pagina'} className="contents">
      <LinkButton href={`/licao/${curso.primeiraLicao}`} size="lg" full>
        {tx.irPrimeira}
      </LinkButton>
      </div>
    </div>
  );
}

/* A analogia, vista (28/10/2026): as vogais de CASA se apagam e voltam, e
   sobra C S. Com movimento reduzido, a palavra fica inteira e a legenda diz. */
function CasaSemVogais() {
  return (
    <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
      <p aria-label={tx.casaAria}
         className="m-0 font-display text-[34px] font-bold tracking-[.18em] text-ink">
        {tx.casaSome(v => <span aria-hidden className="vogal-some">{v}</span>)}
      </p>
      <p className="m-0 font-ui text-[13.5px] text-ink-muted">{tx.casaSobra}</p>
    </div>
  );
}

/* ── a linha que tem duas direções ──────────────────────────────
   As partes vêm em ORDEM DE LEITURA: a primeira da lista é a que aparece mais
   à DIREITA. O contêiner é `he-seq`, que é um isolado rtl - então a ordem do
   DOM é a ordem em que um leitor de hebraico encontra os pedaços, e quem
   escreve o dado escreve do jeito que se lê.

   Cada pedaço latino é o seu próprio isolado, marcado com `dir="ltr"`. É o
   que o <He> já faz do lado hebraico, e pelo mesmo motivo: sem isolar, um
   hífen ou um ponto entre os dois se junta ao trecho errado e a linha se
   remonta sozinha na tela - foi assim que a referência impressa deste curso
   publicou uma lista de palavras invertida. Aqui seria pior: a tela que
   ENSINA direção mostrando a direção errada. */
type PedacoLinha = { t: 'he' | 'lat'; s: string };

/* Um item do índice: abre a parte antes de o navegador rolar até o título
   dela (o título fica sempre à vista, então a rolagem acha o lugar). */
function LinkDoIndice({ id, className, children }: { id: string; className: string; children: ReactNode }) {
  const abrir = useAbrirParte();
  return <a href={`#${id}`} onClick={() => abrir(id)} className={className}>{children}</a>;
}

function LinhaMista({ partes }: { partes: readonly PedacoLinha[] }) {
  return (
    <p className="he-seq justify-center gap-x-3 py-1">
      {partes.map((p, i) => p.t === 'he'
        ? <He key={i} size="word">{p.s}</He>
        : (
          <span key={i} dir="ltr"
                className="font-ui text-[22px] sm:text-[24px] font-semibold text-ink
                           rounded-[4px] bg-[var(--accent-wash)] px-1.5
                           [unicode-bidi:isolate]">
            {p.s}
          </span>
        ))}
    </p>
  );
}

/* Três linhas que qualquer pessoa encontra em Israel na primeira semana: uma
   placa de rua, um preço e um contato. O número é sempre o pedaço marcado. */
const LINHAS_MISTAS: { partes: PedacoLinha[]; nota: string }[] = [
  {
    partes: [{ t: 'he', s: 'רחוב הרצל' }, { t: 'lat', s: '42' }],
    nota: tx.linhaRua
  },
  {
    /* Um letreiro de ônibus, e não um preço: o preço pedia a preposição
       {{ב}}, que em hebraico gruda no que vem depois e antes de número se
       escreve com traço. Ela apareceria solta na linha, e a tela que ensina
       direção estaria ensinando ortografia errada de passagem. */
    partes: [{ t: 'he', s: 'קו' }, { t: 'lat', s: '18' }, { t: 'he', s: 'לתל אביב' }],
    nota: tx.linhaOnibus
  },
  {
    partes: [{ t: 'he', s: 'טלפון' }, { t: 'lat', s: '050-1234567' }],
    nota: tx.linhaTelefone
  }
];

/* ── a micro-atividade da direção ──────────────────────────────────────────
   Uma pergunta só, respondida com o dedo: em qual ponta desta palavra a
   leitura começa? Ler sobre a direção e APONTAR a direção são coisas
   diferentes, e a segunda é a que fica. */
/* ── a Aula 0 é obrigatória (11/10/2026) ───────────────────────────────
   A primeira letra abre quando a checagem final passa com AULA0_MINIMO
   acertos (lib/state/rules.ts). Quem já tinha progresso em alguma lição
   conta como tendo feito: ninguém perde o acesso que já tinha. */
function Aula0Situacao() {
  const p = useProgress();
  if (!p.ready) return null;
  const feita = aula0Feita(p.state);
  return (
    <p className={`font-ui text-[14.5px] leading-relaxed rounded-[var(--r-md)] px-4 py-3 max-w-[60ch]
                   ${feita ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]' : 'bg-surface-2 text-ink-body'}`}>
      {feita
        ? tx.situacaoFeita
        : fmt(tx.situacaoObrigatoria, { minimo: AULA0_MINIMO, total: AULA0_PERGUNTAS })}
    </p>
  );
}

function ChecagemFinal({ aoPassar }: { aoPassar: () => void }) {
  const p = useProgress();
  const [tentativa, setTentativa] = useState(0);
  const [certas, setCertas] = useState<number | null>(null);
  const passou = certas !== null && certas >= AULA0_MINIMO;
  return (
    <div className="grid gap-4">
      <Compreensao
        key={tentativa}
        id="atividade-perguntas"
        tituloOculto
        titulo={tx.finalTitulo}
        intro={fmt(tx.finalIntro, { minimo: AULA0_MINIMO, total: AULA0_PERGUNTAS })}
        perguntas={PERGUNTAS_GERAIS}
        fecho={{
          bom: tx.finalBom,
          parcial: tx.finalParcial
        }}
        aoCompletar={n => {
          setCertas(n);
          if (n >= AULA0_MINIMO) {
            p.markFirst(AULA0_CONCLUIDA);
            /* Nos passos, o resultado fica à vista um instante e a
               comemoração entra no lugar. */
            setTimeout(aoPassar, 1400);
          }
        }}
      />
      {certas !== null && (
        <div role="status"
             className={`rounded-[var(--r-md)] px-4 py-4 grid gap-3
                         ${passou ? 'bg-[var(--teal-soft)]' : 'bg-[var(--gold-soft)]'}`}>
          <p className={`font-ui text-[15px] leading-relaxed m-0 ${passou ? 'text-[var(--teal-ink)]' : 'text-[var(--gold-ink)]'}`}>
            {passou
              ? fmt(tx.finalPassou, { certas, total: AULA0_PERGUNTAS })
              : fmt(tx.finalNaoPassou, { certas, total: AULA0_PERGUNTAS, minimo: AULA0_MINIMO })}
          </p>
          <div className="flex flex-wrap gap-2">
            {passou
              ? <LinkButton href="/licao/alef" size="lg">{tx.comecarAlef}</LinkButton>
              : <button type="button"
                        onClick={() => { setCertas(null); setTentativa(n => n + 1); }}
                        className="min-h-[44px] px-4 rounded-[var(--r-md)] border border-line bg-surface font-ui text-[15px] text-ink hover:bg-surface-2">
                  {tx.refazerChecagem}
                </button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── a primeira e a última letra ─────────────────────────────────────────
   Saber que a leitura começa pela direita é uma coisa; achar a primeira
   letra de uma palavra de verdade é outra. As letras aparecem separadas,
   na mesma ordem visual da palavra (a primeira à direita), e o leitor de
   tela as lê na ordem de leitura: a lista está em `dir="rtl"`. */
const PALAVRA_DEMO = { he: 'שָׁלוֹם', letras: [
  { g: 'שׁ', nome: tx.letraPrimeiraNome }, { g: 'ל', nome: '' }, { g: 'ו', nome: '' }, { g: 'ם', nome: tx.letraUltimaNome }
] };

function PrimeiraEUltima() {
  const [pergunta, setPergunta] = useState<'primeira' | 'ultima' | 'fim'>('primeira');
  const [erro, setErro] = useState<number | null>(null);
  const alvo = pergunta === 'primeira' ? 0 : PALAVRA_DEMO.letras.length - 1;
  const tocar = (k: number) => {
    if (pergunta === 'fim') return;
    if (k !== alvo) { setErro(k); return; }
    setErro(null);
    setPergunta(pergunta === 'primeira' ? 'ultima' : 'fim');
  };
  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-3">
      <p className="font-ui text-[14px] font-semibold text-ink">
        {pergunta === 'primeira' ? tx.toquePrimeira
          : pergunta === 'ultima' ? tx.toqueUltima
          : tx.toqueFim}
      </p>
      <div className="grid justify-items-center gap-1">
        <He size="lg">{PALAVRA_DEMO.he}</He>
        {/* A seta corre da direita para a esquerda, no sentido da leitura. */}
        <div aria-hidden className="relative w-40 h-4 overflow-hidden">
          <span className="seta-rtl absolute top-0 font-ui text-[14px] text-[var(--accent)]">{tx.setaLeitura}</span>
        </div>
      </div>
      <ol dir="rtl" className="flex justify-center gap-2 list-none p-0 m-0" aria-label={tx.letrasAria}>
        {PALAVRA_DEMO.letras.map((l, k) => {
          const acertada = (pergunta !== 'primeira' && k === 0)
            || (pergunta === 'fim' && k === PALAVRA_DEMO.letras.length - 1);
          return (
            <li key={k}>
              <button type="button" onClick={() => tocar(k)}
                      aria-label={fmt(tx.letraAria, { n: k + 1, total: PALAVRA_DEMO.letras.length })}
                      className={`min-w-[52px] min-h-[56px] rounded-[var(--r-sm)] border grid place-items-center
                        ${acertada ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                          : erro === k ? 'border-[var(--gold)] bg-[var(--gold-soft)]'
                          : 'border-line bg-surface hover:bg-surface-2'}`}>
                <He size="word">{l.g}</He>
              </button>
            </li>
          );
        })}
      </ol>
      <p role="status" className="font-ui text-[14px] leading-relaxed min-h-[1.5em] m-0">
        {erro !== null && (
          <span className="text-[var(--gold-ink)]">
            {tx.aindaNao} {pergunta === 'primeira'
              ? tx.erroPrimeira
              : tx.erroUltima}
          </span>
        )}
        {pergunta === 'fim' && (
          <span className="text-[var(--teal-ink)]">
            {tx.fimComparacao}
          </span>
        )}
      </p>
    </div>
  );
}

/* ── as mesmas consoantes, três palavras ─────────────────────────────────
   O nikud não é enfeite: as mesmas três letras, com sinais diferentes,
   são três palavras diferentes. E os sinais ficam embaixo, em cima ou
   dentro da letra, conforme o sinal. */
const MESMAS = [
  { he: 'סֵפֶר', translit: grafia('séfer'), pt: tx.sentidoLivro }, // i18n-ok: transliteração (etapa 3)
  { he: 'סָפַר', translit: grafia('safár'), pt: tx.sentidoContou }, // i18n-ok: transliteração (etapa 3)
  { he: 'סַפָּר', translit: grafia('sapár'), pt: tx.sentidoBarbeiro } // i18n-ok: transliteração (etapa 3)
];

function MesmasConsoantes() {
  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-3">
      <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
        {tx.mesmasT}
      </p>
      <p className="text-[15px] leading-relaxed text-ink-body">
        {tx.mesmasP1(<He size="inline">ספר</He>)}
      </p>
      <ul className="grid grid-cols-3 gap-2 list-none p-0 m-0">
        {MESMAS.map(w => (
          <li key={w.he} className="rounded-[var(--r-md)] bg-surface-2 p-3 grid gap-1 justify-items-center text-center">
            <He size="word">{w.he}</He>
            <span className="font-ui text-[14px] text-ink">{w.translit}</span>
            <span className="font-ui text-[13px] text-ink-muted">{w.pt}</span>
          </li>
        ))}
      </ul>
      <p className="text-[14.5px] leading-relaxed text-ink-body">
        {tx.mesmasP2(<He size="inline">פּ</He>, <He size="inline">שָׁלוֹם</He>)}
      </p>
    </div>
  );
}

function PorOndeComeca() {
  const [escolha, setEscolha] = useState<'dir' | 'esq' | null>(null);

  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-3">
      <p className="font-ui text-[14px] font-semibold text-ink">
        {tx.comecaPergunta}
      </p>
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={() => setEscolha('esq')}
          aria-label={tx.comecaAriaEsq}
          className="min-h-[44px] px-3 rounded-[var(--r-sm)] border border-line
                     font-ui text-[13px] text-ink-body hover:bg-surface-2"
        >
          {tx.porAqui}
        </button>
        <He size="lg">מַיִם</He>
        <button
          type="button"
          onClick={() => setEscolha('dir')}
          aria-label={tx.comecaAriaDir}
          className="min-h-[44px] px-3 rounded-[var(--r-sm)] border border-line
                     font-ui text-[13px] text-ink-body hover:bg-surface-2"
        >
          {tx.porAqui}
        </button>
      </div>
      {escolha && (
        <p role="status"
           className={`font-ui text-[14px] leading-relaxed rounded-[var(--r-sm)] px-4 py-3
                       ${escolha === 'dir'
                         ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                         : 'bg-[var(--gold-soft)] text-[var(--gold-ink)]'}`}>
          {escolha === 'dir'
            ? tx.comecaCerto
            : tx.comecaErrado}
        </p>
      )}
    </div>
  );
}

/* ── a microatividade da cursiva ───────────────────────────────
   Uma pergunta só, logo depois da explicação, do mesmo jeito que a da
   direção: o aluno escolhe uma das duas formas e descobre na hora se a
   regra ficou. Ler a regra e APLICAR a regra são coisas diferentes. */
function NoCaderno() {
  const [escolha, setEscolha] = useState<'imp' | 'cur' | null>(null);

  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-3">
      <p className="font-ui text-[14px] font-semibold text-ink">
        {tx.cadernoPergunta}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {([['imp', tx.impressa], ['cur', tx.cursiva]] as const).map(([k, rotulo]) => (
          <button
            key={k}
            type="button"
            onClick={() => setEscolha(k)}
            aria-pressed={escolha === k}
            className={`min-h-[48px] px-4 rounded-[var(--r-sm)] border-2 font-ui
                        text-[14.5px] font-semibold transition-colors
                        ${escolha === k
                          ? (k === 'cur'
                             ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                             : 'border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold-ink)]')
                          : 'border-line bg-surface hover:bg-surface-2 text-ink-body'}`}
          >
            {rotulo}
          </button>
        ))}
      </div>
      {escolha && (
        <p role="status"
           className={`font-ui text-[14px] leading-relaxed rounded-[var(--r-sm)] px-4 py-3
                       ${escolha === 'cur'
                         ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                         : 'bg-[var(--gold-soft)] text-[var(--gold-ink)]'}`}>
          {escolha === 'cur'
            ? tx.cadernoCerto
            : tx.cadernoErrado}
        </p>
      )}
    </div>
  );
}

/* ── as dezessete perguntas gerais ──────────────────────────────────────────
   A conferência do fim, sobre a página inteira. Elas usam o mesmo componente
   da checagem do nikud: um conceito novo nunca é seguido de "próximo" sem
   uma pergunta no meio, e isso vale em todo o curso - ver
   components/learn/Compreensao.tsx.

   Eram seis para uma página de oito quadros, e seis perguntas cobrindo oito
   assuntos significa que dois passam sem ser conferidos - que é o mesmo que
   não ter conferido, porque não dá para saber QUAIS dois. Agora há pelo
   menos uma por quadro do caminho principal.

   Nenhuma delas cobra o que está dentro de um "Quer saber mais?". Conferir
   conteúdo opcional é transformá-lo em obrigatório pela porta dos fundos, e
   quem não abriu o quadro erraria uma pergunta sobre algo que o curso disse
   que ele não precisava ler. */
const PERGUNTAS_GERAIS: ItemCompreensao[] = [
  {
    t: 'escolha',
    q: tq.g1q,
    opcoes: [tq.g1o1, tq.g1o2, tq.g1o3],
    certa: 0,
    porque: tq.g1p
  },
  {
    t: 'escolha',
    q: tq.g2q,
    opcoes: [tq.g2o1, tq.g2o2, tq.g2o3],
    certa: 1,
    porque: tq.g2p
  },
  {
    t: 'escolha',
    q: tq.g3q,
    opcoes: [tq.g3o1, tq.g3o2, tq.g3o3],
    certa: 0,
    porque: tq.g3p
  },
  {
    t: 'vf',
    q: tq.g4q,
    certa: false,
    porque: tq.g4p
  },
  {
    t: 'visual',
    q: tq.g5q,
    opcoes: ['ם', 'מ'],
    certa: 0,
    porque: tq.g5p
  },
  {
    t: 'escolha',
    q: tq.g6q,
    opcoes: [tq.g6o1, tq.g6o2, tq.g6o3],
    certa: 1,
    porque: tq.g6p
  },
  {
    t: 'vf',
    q: tq.g7q,
    certa: false,
    porque: tq.g7p
  },
  {
    t: 'escolha',
    q: tq.g8q,
    opcoes: [tq.g8o1, tq.g8o2, tq.g8o3],
    certa: 1,
    porque: tq.g8p
  },
  {
    t: 'vf',
    q: tq.g9q,
    certa: false,
    porque: tq.g9p
  },
  {
    t: 'escolha',
    q: tq.g10q,
    opcoes: [tq.g10o1, tq.g10o2, tq.g10o3],
    certa: 0,
    porque: tq.g10p
  },
  {
    t: 'vf',
    q: tq.g11q,
    certa: true,
    porque: tq.g11p
  },
  {
    t: 'escolha',
    q: tq.g12q,
    opcoes: [tq.g12o1, tq.g12o2, tq.g12o3],
    certa: 0,
    porque: tq.g12p
  },
  {
    t: 'escolha',
    q: tq.g13q,
    opcoes: [tq.g13o1, tq.g13o2, tq.g13o3],
    certa: 1,
    porque: tq.g13p
  },
  {
    t: 'vf',
    q: tq.g14q,
    certa: false,
    porque: tq.g14p
  },
  {
    t: 'escolha',
    q: tq.g15q,
    opcoes: [tq.g15o1, tq.g15o2, tq.g15o3],
    certa: 0,
    porque: tq.g15p
  },
  {
    t: 'vf',
    q: tq.g16q,
    certa: false,
    porque: tq.g16p
  },
  {
    t: 'escolha',
    q: tq.g17q,
    opcoes: [tq.g17o1, tq.g17o2, tq.g17o3],
    certa: 0,
    porque: tq.g17p
  }
];
