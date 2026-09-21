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
 * ── o que esta tela NÃO é ───────────────────────────────────────────────
 * Aula de linguística. Nada aqui precisa ser memorizado, e o quadro completo
 * dos sinais de vogal - que existia solto no meio da página - foi para
 * dentro de um "Quer saber mais?" fechado: ele é excelente para consultar e
 * péssimo como terceira tela de quem nunca viu hebraico.
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
import { Prose } from '@/components/learn/Blocks';
import { Compreensao, type ItemCompreensao } from '@/components/learn/Compreensao';
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

      {/* ── 1 · o sistema é outro ─────────────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[19px] font-semibold">
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
        <h2 className="font-display text-[19px] font-semibold">
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
        <h2 className="font-display text-[19px] font-semibold">Então onde estão as vogais?</h2>
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
        <h2 className="font-display text-[19px] font-semibold">
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
        <h2 className="font-display text-[19px] font-semibold">
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
        <h2 className="font-display text-[19px] font-semibold">Da direita para a esquerda</h2>
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
          continuam sendo escritos e lidos da esquerda para a direita, como aqui. Num
          cardápio israelense o texto corre para um lado e o preço para o outro - e
          isso é normal, não é erro de impressão.
        </p>
      </Card>

      {/* ── 8, 9 e 10 · maiúscula, formas finais, letra muda ──────────── */}
      <Card className="p-6 grid gap-5">
        <div className="grid gap-3">
          <h2 className="font-display text-[19px] font-semibold">
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

      {/* ── 11 · o mapa ───────────────────────────────────────────────── */}
      <Card tone="wash" className="p-6 grid gap-4">
        <h2 className="font-display text-[19px] font-semibold">O caminho, do início ao fim</h2>
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
        titulo="E o resto? Seis perguntas"
        intro="A última conferência antes das letras, agora sobre tudo o que esta página explicou."
        perguntas={PERGUNTAS_GERAIS}
        fecho={{
          bom: 'O mapa está na cabeça. Pode começar pelas letras.',
          parcial: 'O que escapou está explicado acima - dá para reler agora, ou seguir e voltar aqui quando o assunto aparecer numa lição.'
        }}
      />

      {/* ── como o curso funciona ─────────────────────────────────────── */}
      <Card className="p-6 grid gap-4">
        <h2 className="font-display text-[19px] font-semibold">Como este curso funciona</h2>
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

/* ── as seis perguntas gerais ─────────────────────────────────────────────
   A conferência do fim, sobre a página inteira. Elas usam o mesmo componente
   da checagem do niqqud: um conceito novo nunca é seguido de "próximo" sem
   uma pergunta no meio, e isso vale em todo o curso - ver
   components/learn/Compreensao.tsx. */
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
  }
];
