'use client';

/* Além do alfabeto - o que o curso tem e a página de vendas não mostrava.
 * ─────────────────────────────────────────────────────────────────────────
 * O produto ganhou duas coisas que aumentam muito o valor percebido e que a
 * capa ignorava por completo: a viagem pela história do hebraico (/historia,
 * com as cartas de cultura e o lado a lado das duas eras) e a página que
 * responde "vou conseguir ler a Bíblia?" (/biblia). Quem chegava aqui não
 * ficava sabendo de nenhuma das duas.
 *
 * ── a distinção que esta seção tem de fazer ─────────────────────────────
 * As duas NÃO têm o mesmo estatuto, e tratá-las igual seria um erro nos dois
 * sentidos:
 *
 *   /biblia    é PÚBLICA. Existe para quem ainda não comprou, e por isso
 *              vira link de verdade - inclusive com o versículo aqui, que
 *              sai de `bibleVerses()`, público de propósito;
 *   /historia  é do CURSO, atrás do portão. Mandar um visitante para lá é
 *              mandá-lo para um 302 de login, que é a pior coisa que um
 *              link de página de vendas pode fazer. Então ela é descrita,
 *              e não linkada.
 *
 * ── e a promessa que a seção não pode quebrar ───────────────────────────
 * Nada disto é obrigatório para concluir o curso, e a seção diz isso em voz
 * alta. Um aluno que quer só aprender a ler não pode sentir que comprou uma
 * aula de história; um que quer a história não pode achar que ela está
 * trancada atrás de um teste. As duas leituras estão certas, e a frase que
 * abre a seção existe para que as duas sejam possíveis.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { bibleVerses } from '@/lib/content-publico';
import { Container, H2, Lead, Reveal } from './base';

/* O que existe, descrito sem citar título nem frase de carta: culture.json é
   conteúdo pago e não chega ao pacote público - copiá-lo para cá criaria duas
   fontes para o mesmo texto, e a que fica velha é sempre esta. Aqui vai o
   ASSUNTO, que não muda quando uma carta é reescrita.

   Isto não é teoria: a primeira versão deste array trazia a `leadPt` do
   ben-yehuda copiada palavra por palavra, e quem pegou foi o `pacote.mjs`,
   que confere amostra por amostra o HTML das rotas livres. O texto pago sai
   do site de quem não comprou, mesmo quando é uma frase só. */
const EXTRAS = [
  {
    t: 'De onde vem este alfabeto',
    d: 'As 22 letras têm cerca de três mil anos, e não nasceram em Israel. O mesmo alfabeto que deu origem ao grego e ao nosso.'
  },
  {
    t: 'Como o hebraico voltou a ser falado',
    d: 'Por séculos ele foi lido e rezado, mas quase ninguém o usava para pedir um café. A história de como isso virou, em uma geração.'
  },
  {
    t: 'O hebraico de hoje e o antigo, lado a lado',
    d: 'A mesma raiz numa linha escrita há mais de dois mil anos e numa frase que se ouve hoje na fila do supermercado.'
  }
];

export function AlemDoAlfabeto() {
  const v = bibleVerses()[0];

  return (
    /* `mt` na seção e `py` no container, como a Jornada: a seção anterior só
       tem padding em cima, então a margem daqui é que abre o respiro antes da
       faixa tingida começar. */
    <section aria-labelledby="alem" className="mt-16 sm:mt-24 bg-[var(--sand)] border-y border-line">
      <Container className="py-16 sm:py-[88px]">
        <Reveal>
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal)] mb-3.5">
            Conteúdo extra, e opcional
          </p>
        </Reveal>
        <Reveal delay={60}><H2 id="alem" className="max-w-[18ch] mb-3">Além do alfabeto.</H2></Reveal>
        <Reveal delay={100}><Lead className="mb-10 sm:mb-12 max-w-[58ch]">
          Nada disto é necessário para concluir o curso, e nada disto tranca nada. É o
          contrário: são as coisas que ficam interessantes depois que você já consegue ler.
        </Lead></Reveal>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.92fr)] lg:items-start">
          <ul className="grid gap-3.5 list-none p-0 m-0">
            {EXTRAS.map((x, i) => (
              <Reveal as="li" key={x.t} delay={i * 80}
                      className="rounded-[18px] bg-[var(--card)] border border-line p-6">
                <p className="font-display text-[19px] font-semibold tracking-[-0.02em] text-ink mb-1.5">
                  {x.t}
                </p>
                <p className="font-ui text-[15px] leading-[1.55] text-ink-muted m-0">{x.d}</p>
              </Reveal>
            ))}
          </ul>

          {/* O versículo de verdade, e o único link: /biblia é pública. */}
          {v && (
            <Reveal delay={120}>
              <div className="rounded-[22px] bg-[var(--card)] border border-line p-6 sm:p-8 grid gap-5">
                <div>
                  <p className="font-ui text-[12px] font-bold uppercase tracking-[.1em] text-ink-muted mb-1">
                    {v.fontePt}
                  </p>
                  <p className="font-display text-[19px] font-semibold tracking-[-0.02em] text-ink m-0">
                    Vou conseguir ler a Bíblia?
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-baseline gap-x-2.5 gap-y-1"
                     dir="rtl" lang="he">
                  {v.words.map((w, k) => <He key={k} size="word">{w.he}</He>)}
                </div>

                <p className="font-ui text-[15px] leading-[1.6] text-ink-muted m-0">
                  Ler em voz alta, sim - as letras e os sinais de vogal do texto bíblico são
                  exatamente os que este curso ensina. Entender o que leu é outra conversa, e
                  a página inteira explica a diferença antes de você comprar.
                </p>

                <Link
                  href="/biblia"
                  className="group inline-flex items-center gap-2 justify-self-start font-ui
                             font-semibold text-[15.5px] text-[var(--teal-ink)] min-h-[44px]"
                >
                  Ver o versículo palavra por palavra
                  <span aria-hidden
                        className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
