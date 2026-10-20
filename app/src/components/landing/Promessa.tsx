/* A faixa logo abaixo do hero: o que o curso ensina, e o que ele NÃO faz.
 * ─────────────────────────────────────────────────────────────────────────
 * Nasceu em 28/09/2026, quando o hero passou a abrir pelos desejos de quem
 * chega (Israel, a Bíblia, as letras "impossíveis"). A explicação que vinha
 * junto não cabia na primeira tela sem enterrar o botão, então ela mora
 * aqui, a um rolar de distância:
 *
 *   à esquerda   o que se aprende, em itens curtos, e os números do curso
 *                (lidos do CURSO e do CATÁLOGO, como antes no hero);
 *   à direita    os dois "nada de" - as duas coisas que fazem gente desistir
 *                de outros métodos - e a frase que fecha: alfabetização como
 *                BASE, sem prometer fluência.
 *
 * Os números não são escritos à mão: um "21 lições" que vira 24 no dia em
 * que um módulo entra seria uma oferta que não bate com o produto
 * (numeros.mjs confere a página publicada contra o course.json).
 */

import { Container, Check, Reveal, Rubrica } from './base';
import { course, totalLicoes } from '@/lib/content-publico';
import { flagship } from '@/lib/catalog';

const APRENDE = [
  `as ${course.totalLetters} letras`,
  'os sons',
  'o nikud, os sinais de vogal',
  'a escrita cursiva',
  'palavras reais, passo a passo'
];

const NADA_DE = [
  'Nada de decorar uma tabela inteira no primeiro dia.',
  'Nada de depender eternamente de transliteração.'
];

export function Promessa() {
  return (
    <section aria-labelledby="promessa" className="border-t border-line">
      <Container className="pt-16 sm:pt-24 grid gap-10 lg:gap-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <Reveal>
          <Rubrica as="h2" id="promessa" letra="א" className="mb-6">
            O que você aprende no Hebraico Fluente
          </Rubrica>
          <ul className="grid gap-3 list-none p-0 m-0 mb-7">
            {APRENDE.map(t => (
              <li key={t} className="flex items-center gap-3.5 font-display text-[clamp(21px,2vw,25px)] leading-[1.2]
                                     font-medium tracking-[-0.022em] text-ink">
                <Check size={17} />
                {t}
              </li>
            ))}
          </ul>
          <p className="font-ui text-[16.5px] sm:text-[17px] leading-[1.6] text-ink-muted max-w-[46ch] m-0">
            Com exercícios interativos e correção imediata em cada etapa, em português, feito para
            brasileiros.
          </p>
          <p className="font-ui text-[14px] text-ink-body font-medium m-0 mt-5 pt-5 border-t border-line tabular-nums">
            {course.totalLetters} letras em {totalLicoes()} lições · progresso salvo na sua conta ·
            acesso por {flagship().accessMonths} meses
          </p>
        </Reveal>

        {/* Os dois "nada de" eram dois cartões com borda, iguais a todos os
            outros cartões da página. Viraram linhas separadas por fio: são
            duas frases, e frase não precisa de caixa. */}
        <Reveal className="grid content-start lg:pt-[52px]">
          <ul className="list-none p-0 m-0 mb-8 border-t border-line">
            {NADA_DE.map(t => (
              <li key={t} className="flex items-start gap-4 py-5 border-b border-line">
                <span aria-hidden className="w-7 h-7 rounded-full grid place-items-center shrink-0 mt-[1px]
                                             shadow-[0_0_0_1px_var(--line)] text-ink-muted">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="font-ui text-[17px] leading-[1.45] font-semibold text-ink m-0">{t}</p>
              </li>
            ))}
          </ul>
          <div className="flex gap-4 items-stretch">
            <span aria-hidden className="w-[2px] bg-[var(--teal)] shrink-0" />
            <p className="font-display text-[19px] sm:text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-ink m-0">
              Você aprende a entender o alfabeto de verdade e constrói a base para ler hebraico em
              Israel, estudar o idioma e se aproximar dos textos na língua original.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
