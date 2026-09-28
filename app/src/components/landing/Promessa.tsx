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

import { Container, Check, Reveal } from './base';
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
      <Container className="py-14 sm:py-[72px] grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <Reveal>
          <h2 id="promessa" className="font-ui text-[13px] font-semibold uppercase tracking-[.08em] text-ink-muted m-0 mb-4">
            O que você aprende no Hebraico Fluente
          </h2>
          <ul className="grid gap-2.5 list-none p-0 m-0 mb-6">
            {APRENDE.map(t => (
              <li key={t} className="flex items-center gap-3 font-display text-[clamp(19px,1.7vw,21px)]
                                     font-medium tracking-[-0.015em] text-ink">
                <span aria-hidden className="w-7 h-7 rounded-[9px] bg-[var(--teal-soft)] grid place-items-center shrink-0">
                  <Check size={14} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="font-ui text-[16.5px] sm:text-[17px] leading-[1.6] text-ink-muted max-w-[46ch] m-0">
            Com exercícios interativos e correção imediata em cada etapa, em português, feito para
            brasileiros.
          </p>
          <p className="font-ui text-[14px] text-ink-body font-medium m-0 mt-4">
            {course.totalLetters} letras em {totalLicoes()} lições · progresso salvo na sua conta ·
            acesso por {flagship().accessMonths} meses
          </p>
        </Reveal>

        <Reveal delay={120} className="grid gap-4 content-start">
          {NADA_DE.map(t => (
            <div key={t} className="flex items-start gap-3.5 rounded-[18px] bg-[var(--card)] border border-line p-5">
              <span aria-hidden className="w-8 h-8 rounded-full bg-[var(--sand)] grid place-items-center shrink-0
                                           font-ui font-bold text-[15px] text-ink-muted">
                ✕
              </span>
              <p className="font-ui text-[17px] leading-[1.45] font-semibold text-ink m-0 pt-1">{t}</p>
            </div>
          ))}
          <div className="flex gap-3.5 items-stretch mt-2">
            <span aria-hidden className="w-[3px] rounded-full bg-[var(--teal)] shrink-0" />
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
