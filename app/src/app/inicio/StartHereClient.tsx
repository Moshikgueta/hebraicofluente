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
 * 1. O TERMO VEM DEPOIS DO CONCEITO. "Abjad" e "niqqud" aparecem, mas sempre
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

import Link from 'next/link';
import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { AudioButton } from '@/components/learn/AudioButton';
import { Prose, RegraCursiva } from '@/components/learn/Blocks';
import { Compreensao, type ItemCompreensao } from '@/components/learn/Compreensao';
import {
  ANALOGIA_CURSIVA, CURSIVA_NO_CURSO, MESMA_LETRA,
  ONDE_CURSIVA, ONDE_IMPRESSA
} from '@/lib/cursiva';
import type { NikudIntro, NikudSound } from '@/lib/content';

/* ── as oito perguntas do niqqud ──────────────────────────────────────────
   Cada uma existe contra um mal-entendido específico, e não para cobrir o
   texto: o que se confere é o que costuma sair torto da leitura.

   O círculo pontilhado (◌) é a convenção tipográfica para mostrar um sinal
   que não existe sozinho: ele se agarra à letra anterior, e sem um portador
   o navegador o pendura em qualquer coisa que estiver do lado. */
const PERGUNTAS_NIQQUD: ItemCompreensao[] = [
  {
    t: 'escolha',
    q: 'O que é o niqqud?',
    opcoes: [
      'Um conjunto de letras novas do alfabeto',
      'Um sistema de sinais que ajuda a indicar a pronúncia e os sons de vogal',
      'A forma cursiva do hebraico'
    ],
    certa: 1,
    porque: 'O niqqud não é feito de letras novas. São pequenos sinais colocados junto às letras para mostrar como a palavra se pronuncia.'
  },
  {
    t: 'visual',
    q: 'Qual destes exemplos tem niqqud?',
    opcoes: ['בַ', 'ב'],
    certa: 0,
    porque: 'A letra é a mesma nos dois. O que muda é o traço embaixo dela, que marca o som de vogal.'
  },
  {
    t: 'visual',
    q: 'Nesta dupla, qual é o SINAL de niqqud - e não a letra?',
    opcoes: ['◌ַ', 'ב'],
    certa: 0,
    porque: 'A letra é בּ. O traço sozinho aparece aqui pendurado num círculo pontilhado porque um sinal de niqqud não existe sozinho: ele sempre se apoia numa letra.'
  },
  {
    t: 'vf',
    q: 'Sem niqqud é impossível ler hebraico.',
    certa: false,
    porque: 'No hebraico moderno a maior parte dos textos é escrita sem niqqud. Quem fala a língua reconhece as palavras pelo contexto, pelo vocabulário e pelos padrões da língua - como você lê "casa" sem precisar soletrar.'
  },
  {
    t: 'vf',
    q: 'Quando um texto não tem niqqud, a palavra é falada sem som de vogal.',
    certa: false,
    porque: 'Os sons continuam lá na fala. O que some é a marcação escrita deles - a palavra é pronunciada igual, com niqqud ou sem.'
  },
  {
    t: 'escolha',
    q: 'Como um israelense lê uma placa sem niqqud?',
    opcoes: [
      'Ele adivinha a pronúncia letra por letra',
      'Ele reconhece a palavra pelo contexto e pelos padrões que já conhece',
      'Ele só consegue ler palavras curtas'
    ],
    certa: 1,
    porque: 'É reconhecimento, não adivinhação: quem já tem o vocabulário identifica a palavra inteira de uma vez. É por isso que ler sem niqqud vem DEPOIS de conhecer as palavras, e não antes.'
  },
  {
    t: 'vf',
    q: 'Todo ponto que aparece dentro ou perto de uma letra hebraica é uma vogal.',
    certa: false,
    porque: 'Existem outros sinais com aparência parecida: o daguesh, o ponto dentro da letra que muda o som da consoante, e o ponto que distingue שׁ de שׂ. Nenhum dos dois é vogal.'
  },
  {
    t: 'assoc',
    q: 'Onde você espera encontrar niqqud?',
    rotulos: ['Costuma ter', 'Costuma não ter'],
    linhas: [
      { item: 'Livro para quem está aprendendo', certa: 0 },
      { item: 'Livro infantil e texto religioso', certa: 0 },
      { item: 'Jornal, site e placa de rua', certa: 1 },
      { item: 'Mensagem de celular', certa: 1 }
    ],
    porque: 'Material de aprendizagem e texto infantil ou religioso usam os sinais; o hebraico do dia a dia, quase nunca. É por isso que o curso começa com eles e vai tirando: o objetivo é você depender cada vez menos do apoio.'
  }
];

/* ── o índice da página ────────────────────────────────────
   Cada `id` é o id de um <h2> lá embaixo, e a ordem é a ordem em que os
   quadros aparecem. O que NÃO está aqui é o que está fechado num "Quer
   saber mais?": listar conteúdo opcional num índice é a maneira mais rápida
   de ele deixar de ser opcional. */
const INDICE: { id: string; t: string }[] = [
  { id: 'o-sistema',         t: 'Não é o mesmo sistema do português' },
  { id: 'a-comparacao',      t: 'Uma comparação para sentir a diferença' },
  { id: 'as-vogais',         t: 'Então onde estão as vogais?' },
  { id: 'o-niqqud',          t: 'O niqqud, os pontinhos das vogais' },
  { id: 'checagem-niqqud',   t: 'Checagem: entendeu o niqqud?' },
  { id: 'as-quatro-letras',  t: 'Quatro letras especiais' },
  { id: 'a-direcao',         t: 'Da direita para a esquerda' },
  { id: 'duas-direcoes',     t: 'Quando a linha tem duas direções' },
  { id: 'maiuscula-e-finais', t: 'Maiúscula, formas finais e "letra muda"' },
  { id: 'impressa-e-cursiva', t: 'Impressa e cursiva: dois desenhos' },
  { id: 'que-hebraico',      t: 'Que hebraico é este?' },
  { id: 'o-caminho',         t: 'O caminho, do início ao fim' },
  { id: 'atividade',         t: 'Checagem final: dezesseis perguntas' },
  { id: 'como-funciona',     t: 'Como este curso funciona' }
];

const SOUND_LABEL: Record<string, string> = {
  a: 'o som A', e: 'o som E', i: 'o som I', o: 'o som O', u: 'o som U',
  sheva: 'sem vogal'
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
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/mapa"
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Mapa
        </Link>
        <Badge tone="accent">Antes da primeira letra</Badge>
        <h1 className="text-[27px] sm:text-[34px] font-bold leading-tight">
          Como o alfabeto hebraico funciona
        </h1>
        <p className="text-[16.5px] leading-relaxed text-ink-body max-w-[54ch]">
          Dez minutos de leitura, sem nada para decorar. A ideia é você entender a
          lógica da escrita antes de aprender a primeira letra - depois disso, cada
          lição vai parecer muito mais simples.
        </p>
      </header>

      {/* ── o índice ────────────────────────────────────────
          Esta página passou de oito quadros para onze, e num telefone isso é
          um rolo de dúzias de telas. Uma página de "leia antes de começar"
          também é uma página para VOLTAR - o próprio texto convida a isso
          quando um assunto reaparece numa lição - e voltar sem índice é
          rolar procurando.

          Os destinos são conferidos por varrer-curso.mjs: um item de índice
          que aponta para um id que não existe leva a lugar nenhum e não
          quebra nada, que é a definição do defeito que ninguém encontra. */}
      <nav aria-labelledby="indice"
           className="rounded-[var(--r-lg)] border border-line bg-surface p-5 grid gap-3">
        <h2 id="indice" className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-ink-muted">
          O que tem nesta página
        </h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-0.5 list-none p-0 m-0">
          {INDICE.map((it, i) => (
            <li key={it.id}>
              <a href={`#${it.id}`}
                 className="flex items-baseline gap-2.5 min-h-[36px] py-1 font-ui text-[14.5px]
                            leading-snug text-ink-body hover:text-[var(--accent)]">
                <span aria-hidden className="font-ui text-[12px] text-ink-muted tabular-nums w-4 shrink-0">
                  {i + 1}
                </span>
                <span>{it.t}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── 1 · o sistema é outro ─────────────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="o-sistema"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Não é o mesmo sistema do português
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Em português, consoantes e vogais são letras do mesmo tipo, e a gente
          escreve todas em fila:
        </p>
        <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
          <p className="font-display text-[30px] font-bold tracking-[.12em] text-ink">CASA</p>
          <p className="font-ui text-[14px] text-ink-muted">
            C <span className="text-[var(--accent)]">A</span> S{' '}
            <span className="text-[var(--accent)]">A</span> - duas consoantes e duas
            vogais, todas escritas
          </p>
        </div>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          O hebraico organiza isso de outro jeito: <strong className="font-semibold text-ink">
          as letras representam principalmente as consoantes</strong>, e os sons de
          vogal são marcados por fora delas - ou, em muitos textos, nem são marcados.
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          Um sistema de escrita assim tem nome: <strong className="font-semibold text-ink">abjad</strong>.
          A palavra não importa para ler nada - ela só é útil para você reconhecer o
          termo quando encontrar por aí. O que importa é a ideia: as letras são, em
          essência, as consoantes.
        </p>
      </Card>

      {/* ── 2 · a analogia, marcada como analogia ─────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="a-comparacao"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Uma comparação para sentir a diferença
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Imagine que em português a gente escrevesse só <strong className="font-semibold text-ink">
          C S</strong> e soubesse pelo contexto se ali está escrito <em>casa</em>,{' '}
          <em>coisa</em> ou <em>cisão</em>. Quem lê português reconheceria a palavra
          pelo resto da frase.
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          Isto é só uma <strong className="font-semibold text-ink">analogia</strong>, e
          não uma descrição do hebraico: o hebraico não é português sem vogais, e tem
          recursos próprios para marcar os sons - você vai ver os três logo abaixo. A
          comparação serve para uma coisa só: entender por que as vogais nem sempre
          aparecem escritas do mesmo jeito que aqui.
        </p>
      </Card>

      {/* ── 3 e 5 · onde estão as vogais, e o que NÃO dizer ───────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="as-vogais"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Então onde estão as vogais?
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Esta é a primeira pergunta de quase todo mundo, e ela tem resposta. O
          hebraico <strong className="font-semibold text-ink">tem sons de vogal como
          qualquer língua</strong> - as pessoas falam <He size="inline">שָׁלוֹם</He>{' '}
          com um "a" e um "o" bem audíveis. O que muda é a forma de representá-los na
          escrita, e há três:
        </p>
        <ol className="grid gap-3 list-none p-0 m-0 text-[15.5px] leading-relaxed text-ink-body">
          {[
            ['Sinais de vogal',
              'Pontos e traços colocados embaixo, dentro ou ao lado da consoante. É o niqqud, explicado no quadro seguinte - e é com ele que este curso começa.'],
            ['Algumas letras que ajudam',
              'Quatro letras podem, dependendo da palavra, participar da representação de um som de vogal em vez de soar como consoante. Você as conhece daqui a pouco.'],
            ['O contexto',
              'Quem já conhece a palavra a reconhece sem nenhum sinal - que é como israelense lê jornal, placa e mensagem de celular todo dia.']
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
            Cuidado com esta frase
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            Você vai ler por aí que <em>"o hebraico não tem vogais"</em>. É um resumo
            ruim, e atrapalha. O certo é: <strong className="font-semibold text-ink">a
            língua tem os sons de vogal</strong>; o que o alfabeto básico não tem são
            letras independentes para todas elas, do jeito que o português tem A, E, I,
            O, U.
          </p>
        </div>
      </Card>

      {/* ── 4 · o niqqud ──────────────────────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="o-niqqud"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          O niqqud: os pontinhos que marcam as vogais
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <strong className="font-semibold text-ink">Niqqud</strong>{' '}
          (<He size="inline">נִקּוּד</He>) é o sistema de pontos e traços colocados perto
          das letras para indicar os sons de vogal. A mesma palavra, com e sem eles:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שָׁלוֹם</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">
              com niqqud - dá para ler sem conhecer a palavra
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שלום</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">
              sem niqqud - é assim que aparece na rua
            </p>
          </div>
        </div>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[
            'Material para iniciante costuma trazer niqqud - inclusive este curso, no começo.',
            'Livro infantil, texto religioso e poesia também usam bastante.',
            'No hebraico do dia a dia, a maior parte dos textos vem sem: placa, jornal, site, mensagem de celular.'
          ].map(t => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="text-[var(--accent)] shrink-0">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          Por isso o curso faz os dois, nesta ordem: primeiro você lê com os sinais,
          que é o que permite ler sem adivinhar; depois eles vão saindo aos poucos, até
          você ler como se lê de verdade.
        </p>
        {/* Nem todo pontinho é vogal. Esta ressalva fica AQUI, colada na
            explicação, porque é o mal-entendido que a explicação cria: quem
            acabou de aprender "pontos = vogais" lê o daguesh de בּ e o ponto
            do shin como vogal, e depois não entende por que a conta não
            fecha. A pergunta 7 da checagem cobra exatamente isto. */}
        <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-2">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
            Uma ressalva importante
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            Nem todo ponto que aparece dentro ou perto de uma letra é vogal. Há outros
            sinais que usam a mesma aparência e fazem outra coisa: o ponto dentro de{' '}
            <He size="inline">בּ</He>, que muda o som da consoante, e o ponto que
            distingue <He size="inline">שׁ</He> de <He size="inline">שׂ</He>, que diz
            qual das duas letras está ali. Você aprende cada um no seu momento - por
            ora, só saiba que eles existem e não são vogais.
          </p>
        </div>
      </Card>

      {/* ── a checagem do niqqud ──────────────────────────────────────────
          Explicação → exemplo → PERGUNTAS → prática. O conceito acima é o
          mais importante desta página inteira, e também o mais fácil de
          "achar que entendeu": ele é simples de ler e difícil de acreditar,
          porque contraria o que a pessoa acha que sabe sobre escrita. Então
          o curso não segue sem perguntar. */}
      <Compreensao
        id="checagem-niqqud"
        titulo="Entendeu o niqqud? Oito perguntas"
        intro="Não vale nota e não tranca nada - é só para confirmar que a ideia ficou de pé antes de seguir. Se errar, a explicação aparece na hora."
        perguntas={PERGUNTAS_NIQQUD}
        fecho={{
          bom: 'Ótimo. Agora você já sabe o que é o niqqud e por que ele aparece. Vamos entender como esses sinais funcionam na prática.',
          parcial: 'Vale reler o quadro acima antes de seguir - são duas ou três ideias, e elas voltam em toda lição do curso.'
        }}
      />

      {/* ── 6 · as quatro letras especiais ────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="as-quatro-letras"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Quatro letras se comportam de um jeito especial
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Estas quatro merecem um aviso desde já:
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
          Dependendo da palavra e da posição, elas podem soar como consoante, podem
          participar da representação de um som de vogal, ou podem aparecer sem um som
          consonantal claro. Não é exceção esquisita: é o resultado de a escrita
          hebraica ter uns bons milhares de anos, e essas letras terem sido as
          primeiras a ganhar essa segunda função.
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          Você não precisa de nenhuma regra agora. Isto está aqui para que, lá na
          frente, você não pense <em>"mas você disse que todas as letras são
          consoantes"</em>. Cada uma dessas quatro tem a sua lição, e é lá que o
          assunto é ensinado.
        </p>
      </Card>

      {/* ── 7 · a direção, com atividade ──────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="a-direcao"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Da direita para a esquerda
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          O hebraico se lê e se escreve da direita para a esquerda. A primeira letra de
          uma palavra é a que está mais à direita - o contrário do português, e é a
          única coisa que você precisa desaprender.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <p className="font-display text-[22px] font-bold tracking-[.1em] text-ink">BOM DIA</p>
            <p className="font-ui text-[12px] uppercase tracking-[.1em] text-ink-muted">
              começa aqui →
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">שָׁלוֹם</He>
            <p className="font-ui text-[12px] uppercase tracking-[.1em] text-ink-muted">
              ← começa aqui
            </p>
          </div>
        </div>

        <PorOndeComeca />

        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          Os <strong className="font-semibold text-ink">números</strong> são a exceção:
          continuam sendo escritos e lidos da esquerda para a direita, como aqui. É o
          que faz uma linha ter duas direções ao mesmo tempo - e o próximo quadro
          mostra isso acontecendo.
        </p>
      </Card>

      {/* ── 7b · a linha com duas direções ─────────────────────────
          "Os números vão para o outro lado" era uma frase solta, e frase solta
          sobre direção não ensina nada: a pessoa só entende quando VÊ o
          endereço com o número parado na ponta ESQUERDA de uma linha que corre
          para a direita. E ela vai ver isso antes de terminar o curso - numa
          placa, num preço, num site. Sem este quadro, o primeiro encontro com
          uma linha assim parece erro de impressão ou defeito da tela. */}
      <Card className="p-6 grid gap-4">
        <h2 id="duas-direcoes"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Quando a linha tem duas direções
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Número, preço, telefone, endereço de site: tudo isso continua correndo da
          esquerda para a direita dentro de uma linha hebraica. Não é mistura errada
          nem defeito - é assim que se escreve. Veja onde cada pedaço vai parar:
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
            trecho que corre da esquerda para a direita
          </span>
        </p>
        <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-4">
          <p className="text-[15px] leading-relaxed text-ink-body">
            A regra é uma só: <strong className="font-semibold text-ink">cada trecho mantém
            a sua própria direção</strong>. O que a linha hebraica decide é a ORDEM em que
            os trechos entram nela - da direita para a esquerda. Por isso o número, que
            você lê normalmente, aparece na ponta que aqui pareceria a errada.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            Duas consequências práticas, para você não achar que quebrou alguma coisa.
            Digitando, o cursor pula de um lado para o outro quando você passa do
            hebraico para o número - é o normal. E copiando uma linha dessas para um
            lugar que não é hebraico, as peças podem aparecer noutra ordem na tela:
            o texto guardado continua o mesmo, só a montagem visual mudou.
          </p>
        </div>
      </Card>

      {/* ── 8, 9 e 10 · maiúscula, formas finais, letra muda ──────────── */}
      <Card className="p-6 grid gap-5">
        <div className="grid gap-3">
          <h2 id="maiuscula-e-finais"
              className="font-display text-[19px] font-semibold scroll-mt-4">
            Não existe maiúscula e minúscula
          </h2>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            Em português, a mesma letra tem duas formas: A e a, B e b. Em hebraico,
            não. Uma letra tem um desenho só, esteja ela no começo da frase, num nome
            próprio ou no meio de uma palavra qualquer.
          </p>
        </div>

        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-5">
          <h2 className="font-display text-[19px] font-semibold">
            Mas {alfabeto.finais.length} letras mudam de forma no fim da palavra
          </h2>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            É a mesma letra e normalmente o mesmo som. O que muda é o formato quando
            ela aparece no fim da palavra:
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
            As regras completas ficam nas lições de cada uma. Por ora basta saber que
            a letra não virou outra letra.
          </p>
        </div>

        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-5">
          <h2 className="font-display text-[19px] font-semibold">
            E o que é uma "letra muda"?
          </h2>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            Você vai encontrar esse termo já na primeira lição, então vale defini-lo
            agora: <strong className="font-semibold text-ink">uma letra muda é uma
            letra que aparece escrita na palavra, mas que naquele caso não tem um som
            próprio perceptível na pronúncia.</strong>
          </p>
          <p className="text-[15px] leading-relaxed text-ink-body">
            Duas coisas importantes. Primeira: isso não quer dizer que ela esteja
            sobrando - ela segura o sinal de vogal, marca o início da palavra, ou está
            ali por história da língua. Segunda:{' '}
            <strong className="font-semibold text-ink">uma letra não é "sempre
            muda"</strong>. O comportamento depende da palavra e da posição, e é por
            isso que cada caso é ensinado no seu lugar.
          </p>
        </div>
      </Card>

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
      <Card className="p-6 grid gap-4">
        <h2 id="impressa-e-cursiva"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          A mesma letra tem dois desenhos: impressa e cursiva
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Tudo o que você viu até aqui está em <strong className="font-semibold text-ink">letra
          impressa</strong> - a forma dos livros e das telas. Existe uma segunda forma, a{' '}
          <strong className="font-semibold text-ink">cursiva</strong>, que é a que os
          israelenses usam para escrever à mão. Elas não se parecem muito:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg">{alfabeto.exemplo}</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">impressa</p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-5 grid gap-2 justify-items-center">
            <He size="lg" cursive>{alfabeto.exemplo}</He>
            <p className="font-ui text-[12.5px] text-ink-muted text-center">cursiva</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              A impressa aparece em
            </p>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {ONDE_IMPRESSA.join(', ')}.
            </p>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              A cursiva aparece em
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
      </Card>
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
      <Card className="p-6 grid gap-4">
        <h2 id="que-hebraico"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Que hebraico é este que você vai aprender?
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Talvez você tenha ouvido falar em "hebraico bíblico" e "hebraico moderno" e
          esteja se perguntando qual dos dois está nesta tela. A resposta começa pela
          parte que resolve quase tudo:{' '}
          <strong className="font-semibold text-ink">o alfabeto é o mesmo</strong>. As
          {' '}{alfabeto.total} letras que aparecem num rolo da Torah são as mesmas
          {' '}{alfabeto.total} letras da placa de ônibus em Tel Aviv. Nenhuma foi
          criada, nenhuma se aposentou.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              O que é igual
            </p>
            <ul className="grid gap-1.5 text-[14.5px] leading-relaxed text-ink-body">
              {[
                'As letras, o desenho delas e a direção da escrita.',
                'O niqqud, quando aparece.',
                'A maior parte das raízes: as letras que carregam o sentido de uma família inteira de palavras.'
              ].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-1.5">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
              O que mudou
            </p>
            <ul className="grid gap-1.5 text-[14.5px] leading-relaxed text-ink-body">
              {[
                'Milhares de palavras que o mundo antigo não tinha - avião, computador, eletricidade.',
                'O sistema dos verbos, que funciona de outro jeito.',
                'A pronúncia, que se acomodou numa forma padrão no último século.'
              ].map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          Um e outro são a mesma língua em fases diferentes - como o português de
          Camões e o daqui, só que com um intervalo bem maior no meio.{' '}
          <strong className="font-semibold text-ink">Este curso ensina a LER</strong>: as
          letras, os sinais, e a juntada delas em palavras. As palavras dos exercícios
          são do hebraico de hoje, porque são as que você vai encontrar - mas a leitura
          que você ganha serve para os dois textos, porque o alfabeto é um só.
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)]
                      bg-surface-2 px-4 py-3">
          Uma honestidade, para você não se decepcionar depois:{' '}
          <strong className="font-semibold text-ink">ler e entender são dois
          trabalhos</strong>. Ao fim daqui você lê em voz alta o que estiver escrito -
          inclusive um versículo. Entender tudo o que leu é o passo seguinte, e a
          poesia bíblica é difícil até para quem nasceu falando hebraico - por isso as
          edições israelenses costumam vir com notas.
        </p>
      </Card>

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
      <details className="rounded-[var(--r-lg)] border border-line bg-surface overflow-hidden">
        <summary className="cursor-pointer list-none p-5 font-ui text-[15px] font-semibold text-ink
                            hover:bg-surface-2 flex items-center justify-between gap-3">
          <span>Quer saber mais? Como uma língua voltou a ser falada</span>
          <span aria-hidden className="text-ink-muted">▾</span>
        </summary>
        <div className="px-5 pb-5 grid gap-3 border-t border-[color:var(--line-soft)] pt-4
                        text-[15px] leading-relaxed text-ink-body">
          <p>
            Entre as duas fases há um intervalo de uns mil e setecentos anos em que
            ninguém crescia falando esta língua. Ela não sumiu: seguiu no livro, na
            reza e nas cartas entre comunidades distantes. O que ela não era é a língua
            em que se pede o almoço - essa era o iídiche, o ladino, o árabe ou o
            português, conforme o lugar.
          </p>
          <p>
            A virada começa no fim do século XIX. O nome mais lembrado é o de Eliezer
            Ben-Yehuda (1858-1922), que se instalou em Jerusalém em 1881 e criou o
            próprio filho ouvindo hebraico e mais nada; Itamar entrou para a história
            como a primeira criança em séculos a ter o hebraico como primeira língua.
          </p>
          <p>
            Só que uma língua não volta pela decisão de uma família. Voltou porque
            escolas resolveram dar aula assim, professores resolveram ensinar assim,
            jornais resolveram sair assim, e muita gente resolveu falar em casa um
            idioma que ninguém ali tinha como materno. Hoje há milhões de pessoas para
            quem ele é a primeira língua.
          </p>
          <p className="border-t border-[color:var(--line-soft)] pt-3">
            É daí que vem o que você leu no quadro de cima. A palavra para computador
            precisou ser inventada, porque não havia; as letras, não - ninguém desenhou
            um alfabeto novo, só voltou a falar em voz alta o que já estava escrito.
          </p>
          <Link href="/historia"
                className="font-ui text-[14px] font-semibold text-[var(--accent)]
                           underline underline-offset-4 min-h-[44px] inline-flex items-center">
            A história inteira, em cartas →
          </Link>
        </div>
      </details>
      {/* ── 11 · o mapa ───────────────────────────────────────────────── */}
      <Card tone="wash" className="p-6 grid gap-4">
        <h2 id="o-caminho"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          O caminho, do início ao fim
        </h2>
        <ol className="grid gap-2.5 list-none p-0 m-0">
          {[
            ['Aprender as letras', 'uma por vez, com a forma e o nome'],
            ['Reconhecer os sons', 'cada letra comparada com um som que você já faz'],
            ['Entender o niqqud', 'os sinais que marcam as vogais'],
            ['Juntar e ler palavras', 'sílabas primeiro, palavras inteiras depois'],
            ['Ler hebraico de verdade', 'sem niqqud, como aparece na rua']
          ].map(([t, d], i) => (
            <li key={t} className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface px-4 py-3">
              <span aria-hidden
                    className="shrink-0 w-7 h-7 rounded-full bg-[var(--accent)] text-white
                               font-ui text-[13px] font-bold grid place-items-center">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="font-ui text-[15px] font-semibold text-ink">{t}</span>
                <span className="font-ui text-[13.5px] text-ink-muted"> · {d}</span>
              </span>
            </li>
          ))}
        </ol>
        {/* ── 12 · a mensagem que acalma, sem promessa de venda ──────── */}
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          Você não precisa entender todas essas regras agora - nem é para entender. O
          objetivo desta introdução é mostrar o mapa: a escrita hebraica parece muito
          diferente do português à primeira vista, e tem uma lógica que se aprende aos
          poucos. Cada parte vem na sua vez.
        </p>
      </Card>

      {/* ── 13 · a atividade rápida, agora sobre a página inteira ─────── */}
      <Compreensao
        id="atividade"
        titulo="E o resto? Dezesseis perguntas"
        intro="A última conferência antes das letras, sobre tudo o que esta página explicou. Nada aqui vale nota nem tranca nada - errar só faz aparecer a explicação."
        perguntas={PERGUNTAS_GERAIS}
        fecho={{
          bom: 'O mapa está na cabeça. Pode começar pelas letras.',
          parcial: 'O que escapou está explicado acima - dá para reler agora, ou seguir e voltar aqui quando o assunto aparecer numa lição.'
        }}
      />

      {/* ── como o curso funciona ─────────────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 id="como-funciona"
            className="font-display text-[19px] font-semibold scroll-mt-4">
          Como este curso funciona
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          São {curso.licoes} lições em {curso.modulos} módulos, e uma regra que vale do
          começo ao fim: nada aparece na tela antes de ter sido ensinado. Você nunca vê
          uma palavra com uma letra que ainda não conhece.
        </p>
        <ol className="grid gap-3 list-none p-0 m-0 text-[15.5px] leading-relaxed text-ink-body">
          {[
            ['A lição', 'Uma letra por vez: o desenho, o som, como se escreve à mão e as primeiras palavras que ela forma. Dez minutos, mais ou menos.'],
            ['Os exercícios', 'Corrigem na hora e dizem POR QUE, e não só "errou".'],
            ['A revisão', 'O que escapa volta sozinho, no intervalo certo. Não é lição nova: é o que evita ter de recomeçar.'],
            ['O fim de cada módulo', 'Uma verificação curta do que aquele módulo ensinou - para você saber que pode seguir, não para dar nota.'],
            ['O fim do curso', 'Um desafio final com o alfabeto inteiro, e o certificado com o seu nome.']
          ].map(([t, d]) => (
            <li key={t} className="grid gap-0.5">
              <span className="font-ui text-[14.5px] font-bold text-ink">{t}</span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
        <p className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-4">
          Seu progresso fica salvo sozinho. Dá para parar no meio de uma lição, fechar
          o navegador e voltar semana que vem: a plataforma reabre onde você parou.
        </p>
      </Card>

      <Card tone="wash" className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">Como praticar de verdade</h2>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          {[
            'Leia em voz alta. Sempre. Ouvir o próprio som é metade do aprendizado.',
            'Pouco e todo dia bate muito de vez em quando.',
            'Errar faz parte: o que você erra volta na revisão, no dia certo.',
            'Escreva à mão. É o que fixa a forma da letra.'
          ].map(t => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="text-[var(--accent)]">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── o quadro completo dos sinais, FECHADO ─────────────────────────
          Ele é excelente para consultar e péssimo como terceira tela de quem
          nunca viu hebraico: doze sinais de uma vez, antes da primeira letra,
          é a definição de sobrecarga. Fica aqui, a um clique, e o curso
          ensina cada sinal na hora certa. */}
      <details className="rounded-[var(--r-lg)] border border-line bg-surface overflow-hidden">
        <summary className="cursor-pointer list-none p-5 font-ui text-[15px] font-semibold text-ink
                            hover:bg-surface-2 flex items-center justify-between gap-3">
          <span>Quer saber mais? O quadro completo dos sinais de vogal</span>
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
            Aprenda pelo SOM, não pelo nome: vários sinais diferentes fazem o mesmo som,
            e é essa a dificuldade de verdade.
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
                  <li key={g.demo}
                      className="flex items-center gap-4 rounded-[var(--r-md)] bg-surface-2 px-4 py-3">
                    <He size="lg">{g.demo}</He>
                    <span className="min-w-0 grid gap-0.5">
                      <span className="font-ui text-[14px] text-ink">{g.namePt}</span>
                      <span className="font-ui text-[12.5px] text-ink-muted leading-snug">
                        <Prose text={g.position} />
                      </span>
                    </span>
                    <span className="ml-auto"><AudioButton audioId={g.audioId} label="" size="sm" /></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      {/* O destino sai do CURSO, e não escrito à mão.
          Escrito à mão ele estava - e apontava para a SEGUNDA letra. A tela
          que existe para não assustar ninguém mandava o iniciante pular a
          primeira lição, e nada nunca reclamou: o endereço existe, a página
          abre, e só quem conhece a ordem do alfabeto perceberia. */}
      <LinkButton href={`/licao/${curso.primeiraLicao}`} size="lg" full>
        Ir para a primeira letra
      </LinkButton>
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
    nota: 'Uma placa de rua. O nome começa na direita; o número da casa fica na ponta esquerda, e continua sendo quarenta e dois.'
  },
  {
    /* Um letreiro de ônibus, e não um preço: o preço pedia a preposição
       {{ב}}, que em hebraico gruda no que vem depois e antes de número se
       escreve com traço. Ela apareceria solta na linha, e a tela que ensina
       direção estaria ensinando ortografia errada de passagem. */
    partes: [{ t: 'he', s: 'קו' }, { t: 'lat', s: '18' }, { t: 'he', s: 'לתל אביב' }],
    nota: 'Um letreiro de ônibus: linha 18 para Tel Aviv. O número fica no meio, com hebraico dos dois lados - e cada lado corre para onde é dele.'
  },
  {
    partes: [{ t: 'he', s: 'טלפון' }, { t: 'lat', s: '050-1234567' }],
    nota: 'Um telefone. O traço no meio não muda de lugar: o número inteiro é um bloco só, lido da esquerda para a direita.'
  }
];

/* ── a micro-atividade da direção ──────────────────────────────────────────
   Uma pergunta só, respondida com o dedo: em qual ponta desta palavra a
   leitura começa? Ler sobre a direção e APONTAR a direção são coisas
   diferentes, e a segunda é a que fica. */
function PorOndeComeca() {
  const [escolha, setEscolha] = useState<'dir' | 'esq' | null>(null);

  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--line)] p-4 grid gap-3">
      <p className="font-ui text-[14px] font-semibold text-ink">
        Rápido: por onde começa a leitura desta palavra?
      </p>
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          type="button"
          onClick={() => setEscolha('esq')}
          aria-label="Começa pela esquerda"
          className="min-h-[44px] px-3 rounded-[var(--r-sm)] border border-line
                     font-ui text-[13px] text-ink-body hover:bg-surface-2"
        >
          por aqui
        </button>
        <He size="lg">מַיִם</He>
        <button
          type="button"
          onClick={() => setEscolha('dir')}
          aria-label="Começa pela direita"
          className="min-h-[44px] px-3 rounded-[var(--r-sm)] border border-line
                     font-ui text-[13px] text-ink-body hover:bg-surface-2"
        >
          por aqui
        </button>
      </div>
      {escolha && (
        <p role="status"
           className={`font-ui text-[14px] leading-relaxed rounded-[var(--r-sm)] px-4 py-3
                       ${escolha === 'dir'
                         ? 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                         : 'bg-[var(--gold-soft)] text-[var(--gold-ink)]'}`}>
          {escolha === 'dir'
            ? 'Isso. Pela direita: a primeira letra é a que está mais à direita, e a leitura corre para a esquerda.'
            : 'Ainda não. Em hebraico a leitura começa pela DIREITA e corre para a esquerda - o contrário do português.'}
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
        Rápido: qual forma você usaria para escrever no caderno?
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {([['imp', 'impressa'], ['cur', 'cursiva']] as const).map(([k, rotulo]) => (
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
            ? 'Isso. Caderno, recado, formulário, lista: tudo o que é escrito à mão vai em cursiva.'
            : 'A impressa é a forma de LER - livro, site, placa. Para escrever à mão, a forma é a cursiva.'}
        </p>
      )}
    </div>
  );
}

/* ── as dezesseis perguntas gerais ──────────────────────────────────────────
   A conferência do fim, sobre a página inteira. Elas usam o mesmo componente
   da checagem do niqqud: um conceito novo nunca é seguido de "próximo" sem
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
    q: 'O hebraico é lido em qual direção?',
    opcoes: ['Da direita para a esquerda', 'Da esquerda para a direita', 'De cima para baixo'],
    certa: 0,
    porque: 'A primeira letra de uma palavra é a que está mais à direita. Os números são a exceção: continuam da esquerda para a direita.'
  },
  {
    t: 'escolha',
    q: 'Num sistema de escrita do tipo abjad, as letras representam principalmente:',
    opcoes: ['Vogais', 'Consoantes', 'Números'],
    certa: 1,
    porque: 'As letras são, em essência, as consoantes. Os sons de vogal são marcados por fora delas - ou não são marcados.'
  },
  {
    t: 'escolha',
    q: 'O hebraico tem sons de vogal?',
    opcoes: ['Tem, como qualquer língua', 'Não tem nenhum', 'Só em palavras estrangeiras'],
    certa: 0,
    porque: 'A língua tem os sons. O que muda é a representação na escrita: o alfabeto básico não tem uma letra independente para cada vogal, como o português tem.'
  },
  {
    t: 'vf',
    q: 'Existem letras maiúsculas e minúsculas em hebraico.',
    certa: false,
    porque: 'Uma letra tem um desenho só, no começo da frase ou no meio da palavra. O que existe é outra coisa: cinco letras mudam de forma quando aparecem no fim da palavra.'
  },
  {
    t: 'visual',
    q: 'Qual destas é a forma FINAL da mesma letra - a que aparece no fim da palavra?',
    opcoes: ['ם', 'מ'],
    certa: 0,
    porque: 'É a mesma letra e o mesmo som. Só o formato muda quando ela fecha a palavra.'
  },
  {
    t: 'escolha',
    q: 'O que quer dizer "letra muda"?',
    opcoes: [
      'Uma letra que foi escrita por engano e deveria ser apagada',
      'Uma letra que aparece escrita, mas que naquele caso não tem som próprio perceptível',
      'Uma letra que mudou de desenho'
    ],
    certa: 1,
    porque: 'Ela não está sobrando: pode estar segurando um sinal de vogal, marcando o início da palavra, ou ali por história da língua. E não é "sempre muda" - depende da palavra.'
  },
  {
    t: 'vf',
    q: 'Uma letra na forma final virou outra letra, com outro som.',
    certa: false,
    porque: 'É a mesma letra e normalmente o mesmo som. O que muda é o formato quando ela fecha a palavra - como um M que ganhasse outro desenho só no fim.'
  },
  {
    t: 'escolha',
    q: 'Por que {{א}}, {{ה}}, {{ו}} e {{י}} ganharam um aviso nesta página?',
    opcoes: [
      'Porque são as mais difíceis de desenhar à mão',
      'Porque, dependendo da palavra, podem participar de um som de vogal em vez de soar como consoante',
      'Porque só aparecem no fim da palavra'
    ],
    certa: 1,
    porque: 'O aviso existe para que, lá na frente, você não pense "mas você disse que todas as letras são consoantes". Cada uma dessas quatro tem a sua lição, e a regra é ensinada lá.'
  },
  {
    t: 'vf',
    q: 'Numa linha hebraica, um número também é lido da direita para a esquerda.',
    certa: false,
    porque: 'Cada trecho mantém a sua própria direção: o número continua da esquerda para a direita, e você o lê normalmente. O que a linha hebraica decide é a ORDEM em que os trechos entram nela.'
  },
  {
    t: 'escolha',
    q: 'Numa placa hebraica que diz "rua Herzl 42", onde aparece o 42?',
    opcoes: [
      'Na ponta esquerda da linha',
      'Na ponta direita da linha, que é onde a leitura começa',
      'Em cima do nome da rua'
    ],
    certa: 0,
    porque: 'O nome da rua começa na direita e corre para a esquerda, então o número, que vem depois, para na ponta esquerda. Continua sendo quarenta e dois.'
  },
  {
    t: 'vf',
    q: 'O alfabeto do hebraico antigo é diferente do alfabeto do hebraico de hoje.',
    certa: false,
    porque: 'São as mesmas letras num rolo da Torah e numa placa de ônibus em Tel Aviv. O que mudou de uma fase para a outra foi a língua por cima delas: palavras novas, outro sistema de verbos, a pronúncia.'
  },
  {
    t: 'escolha',
    q: 'O que você consegue fazer ao terminar este curso?',
    opcoes: [
      'Ler em voz alta o que estiver escrito, inclusive um versículo',
      'Entender qualquer texto bíblico sem ajuda nenhuma',
      'Conversar em hebraico sobre qualquer assunto'
    ],
    certa: 0,
    porque: 'Ler e entender são dois trabalhos. Este curso entrega o primeiro, que é a porta para os outros dois - e a poesia bíblica é difícil até para quem nasceu falando hebraico.'
  },
  {
    t: 'escolha',
    q: 'Por que o curso começa com niqqud e vai tirando os sinais aos poucos?',
    opcoes: [
      'Porque o niqqud é mais bonito no começo',
      'Porque com os sinais dá para ler sem adivinhar, e o hebraico do dia a dia vem sem eles',
      'Porque o niqqud só existe em material para criança'
    ],
    certa: 1,
    porque: 'Os sinais são o apoio que permite ler antes de conhecer a palavra. Como placa, jornal e mensagem vêm sem eles, o objetivo é você depender cada vez menos do apoio.'
  },
  {
    t: 'vf',
    q: 'Num exercício, pode aparecer uma palavra com uma letra que você ainda não estudou.',
    certa: false,
    porque: 'É uma regra do curso, do começo ao fim: nada aparece na tela antes de ter sido ensinado. Toda palavra de um exercício é feita só com as letras que já passaram.'
  },
  {
    t: 'escolha',
    q: 'Você vai anotar um telefone num papel, em hebraico. Que forma de letra você usa?',
    opcoes: [
      'A cursiva, que é a forma de escrever à mão',
      'A impressa, igual à do livro',
      'Tanto faz: as duas são usadas para escrever à mão'
    ],
    certa: 0,
    porque: 'Para ler, impressa; para escrever à mão, cursiva. Dá para desenhar a impressa à mão, mas ninguém faz - seria como copiar a fonte do livro letra por letra.'
  },
  {
    t: 'vf',
    q: 'A impressa e a cursiva são dois alfabetos diferentes, com nomes e sons diferentes.',
    certa: false,
    porque: 'São dois desenhos da MESMA letra. Mesmo nome, mesmo som, mesmo lugar no alfabeto - como a letra de forma e a letra de mão em português.'
  }
];
