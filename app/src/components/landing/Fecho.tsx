'use client';

/* Professor · Recursos · Aula de amostra · Depoimentos · Preço · FAQ · CTA.
 * ─────────────────────────────────────────────────────────────────────────
 * A metade de baixo da landing, onde a página deixa de mostrar e passa a
 * pedir. Três lugares em que o texto do protótipo foi corrigido contra o
 * produto, e o motivo importa mais que a mudança:
 *
 * · PREÇO. O protótipo mostra "R$ XXX" porque foi desenhado antes de haver
 *   preço. Aqui ele sai de data/courses.json, que é o mesmo arquivo que o
 *   checkout cobra - a página de vendas não pode anunciar um número e a
 *   cobrança fazer outro.
 * · ÁUDIO. O texto do protótipo promete "gravado por falante nativo" em
 *   quatro lugares. As gravações ainda não existem (AUDIO_MANIFEST vazio, e
 *   o curso mostra "áudio em breve" em vez de usar voz sintética). Prometer
 *   na venda o que a lição não entrega é o começo de um pedido de reembolso,
 *   então a frase tem duas versões e quem escolhe é o manifesto: no dia em
 *   que as gravações entrarem, a landing passa a prometê-las sozinha.
 * · ACESSO. O protótipo diz "vitalício". O catálogo concede 12 meses. Vale o
 *   catálogo.
 */

import Link from 'next/link';
import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { audioAvailable } from '@/components/learn/AudioButton';
import { ancora, brl, flagship, parcelasMax, pixPrice } from '@/lib/catalog';
import { course, totalLicoes } from '@/lib/content-publico';
import { METODO_ORIGINAL } from '@/lib/credito';
import { DEPOIMENTOS } from '@/lib/testimonials';
import { confirmaSozinho, soPix, temPix } from '@/lib/empresa';
import { Container, H2, Reveal, Check, CheckList, Chevron } from './base';

const TEM_AUDIO = audioAvailable();

/* ── 8 · quem está por trás ───────────────────────────────────────────────
   Reescrita em 28/09/2026, a pedido do dono do curso: a seção deixa de ser
   só uma apresentação e passa a responder «por que existe uma metodologia
   por trás disto?». As regras de antes continuam valendo, e mais uma:

   1. só entra fato que o dono do curso deu: os anos (2021, 2021-2023), as
      instituições, o CELTA, Letras - Inglês (UNINTER, em curso), os cinco
      idiomas. Nenhum número de alunos, nenhum "anos de experiência" contado,
      nenhum "método comprovado";
   2. trajetória, e não currículo: as credenciais moram DENTRO dos passos do
      caminho (Israel → … → Hebraico Fluente), e não numa lista de cargos;
   3. os cinco idiomas nunca como garantia de qualidade: aparecem como o
      lado de ALUNO do professor, que é o que explica os exercícios;
   4. as dificuldades dos alunos brasileiros explicam decisões do curso, e
      não criticam outros professores nem outros materiais;
   5. o fecho volta ao aluno: o que a plataforma faz com ele. */

const PADROES = [
  'um alfabeto inteiramente novo',
  'a dependência da transliteração',
  'letras parecidas que se confundem',
  'o salto de reconhecer letras para ler palavras',
  'materiais que presumem o que o aluno ainda não sabe'
];

const CAMINHO: readonly { t: string; d: string }[] = [
  { t: 'Israel', d: 'O hebraico como língua materna.' },
  { t: 'Brasil', d: 'Desde 2021, vivendo e ensinando aqui.' },
  { t: 'Sala de aula', d: 'Professor de hebraico na Escola Israelita de Curitiba (2021-2023) e shaliach na comunidade judaica.' },
  { t: 'Idiomas', d: 'Hebraico, português, inglês, espanhol e italiano.' },
  { t: 'Metodologia', d: 'Gerente Pedagógico da New School, em Tel Aviv, e professor na Universidad Isaac Abarbanel, em Buenos Aires.' },
  { t: 'Hebraico Fluente', d: 'Tudo isso numa plataforma pensada para brasileiros.' }
];

const REUNE = [
  'O hebraico como língua materna',
  'Sala de aula com alunos brasileiros',
  'A experiência de aprender cinco línguas',
  'Formação em ensino de idiomas: CELTA e Letras',
  'O trabalho diário de criar cursos de idiomas'
];

const ATIVIDADES = [
  'aprende as letras aos poucos', 'pratica o reconhecimento', 'diferencia letras parecidas',
  'aprende o nikud', 'pratica a leitura', 'conhece a escrita cursiva', 'monta palavras',
  'recebe correção na hora'
];

export function Professor({ retrato }: { retrato: string | null }) {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo">
      <Container className="pt-16 sm:pt-24 grid gap-12 sm:gap-16">
        {/* 1 · a conexão pessoal */}
        <div className="grid gap-10 lg:gap-[56px] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
          <Reveal>
            {/* O retrato aparece quando o arquivo existe (ver app/page.tsx);
                sem ele, o espaço mostra a marca em vez de um aviso interno.
                `object-top`: num retrato o rosto fica no terço de cima, e o
                corte centralizado o decapitaria no formato 4/5. */}
            {retrato ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={retrato}
                alt="Moshik Gueta, professor e criador do Hebraico Fluente"
                width={680} height={850} loading="lazy" decoding="async"
                className="aspect-[4/5] w-full max-w-[260px] sm:max-w-[420px] rounded-[22px] border border-line
                           object-cover object-top bg-[var(--sand)]"
              />
            ) : (
              <div className="aspect-[4/5] max-w-[260px] sm:max-w-[420px] rounded-[22px] border border-line bg-[var(--sand)]
                              grid place-items-center">
                <span className="grid place-items-center w-24 h-24 rounded-[26px] bg-[var(--navy)]">
                  <span style={{ fontSize: 46, marginTop: -3, lineHeight: 1 }}>
                    <He size="inline" tone="lite" className="leading-none">ע</He>
                  </span>
                </span>
              </div>
            )}
            <p className="mt-4 font-display text-[20px] font-semibold tracking-[-0.015em] text-ink m-0">Moshik Gueta</p>
            <p className="font-ui text-[14.5px] text-ink-muted m-0">Israelense, professor de idiomas e educador</p>
          </Reveal>

          <Reveal delay={100}>
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal)] mb-3.5">
              Quem está por trás do Hebraico Fluente
            </p>
            <h2 id="sobre-titulo"
                className="font-display font-semibold text-[clamp(26px,3vw,38px)] leading-[1.12]
                           tracking-[-0.03em] text-balance m-0 mb-5 max-w-[26ch]">
              De Israel ao Brasil: anos ensinando, aprendendo e pensando idiomas, transformados em uma
              metodologia para brasileiros.
            </h2>
            {/* Primeira pessoa: ninguém confia numa biografia em terceira
                pessoa escrita pela própria pessoa. */}
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[58ch] mb-4">
              Sou Moshik Gueta, israelense, professor de idiomas e educador. Quando vim morar no Brasil,
              em 2021, comecei a ensinar hebraico para brasileiros e logo percebi que aprender a língua
              começa muito antes da gramática.
            </p>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[58ch] mb-5">
              Para quem cresceu com o alfabeto latino, o primeiro contato com o hebraico é uma nova
              direção de leitura, novos símbolos, novos sons e outra lógica. Em sala de aula, alguns
              pontos voltavam sempre:
            </p>
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0 mb-5">
              {PADROES.map(t => (
                <li key={t} className="rounded-full border border-line bg-[var(--card)] px-3.5 py-1.5
                                       font-ui text-[14.5px] text-ink-body">{t}</li>
              ))}
            </ul>
            <p className="font-display text-[19px] sm:text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-ink m-0">
              Cada um desses pontos virou uma decisão do curso.
            </p>
          </Reveal>
        </div>

        {/* 2 · o caminho, com as credenciais dentro dos passos */}
        <Reveal>
          <h3 className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-ink-muted m-0 mb-5">
            O caminho até aqui
          </h3>
          <ol className="list-none p-0 m-0 grid gap-0 lg:grid-cols-6 lg:gap-4">
            {CAMINHO.map((c, i) => {
              const ultimo = i === CAMINHO.length - 1;
              return (
                <li key={c.t} className="relative grid content-start grid-cols-[28px_minmax(0,1fr)] gap-3 pb-5 lg:pb-0
                                         lg:grid-cols-1 lg:gap-3">
                  {/* O traço que liga os passos: vertical no telefone,
                      horizontal no desktop. */}
                  {!ultimo && (
                    <span aria-hidden className="absolute bg-line left-[13px] top-7 bottom-0 w-[2px]
                                                 lg:left-7 lg:right-[-16px] lg:top-[13px] lg:bottom-auto lg:w-auto lg:h-[2px]" />
                  )}
                  <span aria-hidden
                        className={`relative z-[1] w-7 h-7 rounded-full grid place-items-center font-ui font-bold text-[12.5px]
                          ${ultimo ? 'bg-[var(--teal)] text-white' : 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-display text-[18px] font-semibold tracking-[-0.015em] m-0 mb-1
                                   ${ultimo ? 'text-[var(--teal)]' : 'text-ink'}`}>{c.t}</p>
                    <p className="font-ui text-[14px] leading-[1.5] text-ink-muted m-0">{c.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* 3 · dois blocos: ensinar brasileiros, e o lado de aluno */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="min-w-0 rounded-[22px] bg-[var(--card)] border border-line p-6 sm:p-7 grid gap-4 content-start">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] m-0">Ensinando brasileiros</h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-muted m-0">
              Foi dando aulas em Curitiba, na Escola Israelita e junto à comunidade judaica como
              shaliach, que entendi quais dificuldades se repetiam e quais estratégias realmente
              ajudavam o aluno a começar a ler. O Hebraico Fluente não é um curso estrangeiro traduzido
              para o português: a metodologia nasceu desse contato direto com brasileiros aprendendo
              hebraico.
            </p>
            <Citacao>
              Ensinar hebraico no Brasil me mostrou que aprender o alfabeto não é apenas memorizar 22
              letras. É aprender uma nova lógica de leitura.
            </Citacao>
          </Reveal>
          <Reveal delay={100} className="min-w-0 rounded-[22px] bg-[var(--card)] border border-line p-6 sm:p-7 grid gap-4 content-start">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] m-0">Dos dois lados da sala de aula</h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-muted m-0">
              Além de ensinar, continuo sendo aluno de idiomas. Falo hebraico, português, inglês,
              espanhol e italiano, e cada língua me colocou de novo no começo: estruturas diferentes,
              vocabulário do zero, uma leitura que demora a engrenar, a vontade de traduzir tudo. É
              desse lado que eu penso cada exercício: o que ajuda a avançar, o que cria dependência e o
              que transforma conhecimento passivo em habilidade real.
            </p>
            <Citacao>
              Ensinar idiomas faz parte da minha profissão. Aprendê-los também faz parte da minha vida.
            </Citacao>
          </Reveal>
        </div>

        {/* 4 · como nasceu, e a combinação que sustenta a plataforma */}
        <Reveal className="rounded-[24px] bg-[var(--navy)] text-white p-6 sm:p-9
                           grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 grid gap-4 content-start">
            <h3 className="font-display text-[clamp(22px,2.3vw,28px)] font-semibold tracking-[-0.02em] text-white m-0">
              Como nasceu o Hebraico Fluente
            </h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-white/80 m-0">
              Com o tempo, meu trabalho passou a envolver cada vez mais metodologia. Hoje sou Gerente
              Pedagógico da New School, em Tel Aviv, onde trabalho na estruturação de cursos, materiais
              e experiências de aprendizagem de idiomas, e ensino hebraico na Universidad Isaac
              Abarbanel, em Buenos Aires. A formação em ensino de línguas, do CELTA aos estudos em
              Letras - Inglês (UNINTER), também está em cada decisão deste curso.
            </p>
            <p className="font-ui text-[16.5px] leading-[1.65] text-white m-0">
              O Hebraico Fluente nasceu dessa experiência: eu queria transformar o que funcionava nas
              minhas aulas em algo que qualquer brasileiro pudesse seguir no próprio ritmo. Não é uma
              sequência de vídeos nem um PDF digitalizado. É a metodologia virada em atividades, em
              que você:
            </p>
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {ATIVIDADES.map(t => (
                <li key={t} className="rounded-full bg-white/[.1] border border-white/[.16] px-3 py-1.5
                                       font-ui text-[14px] text-white">{t}</li>
              ))}
            </ul>
            <p className="font-display text-[19px] leading-[1.45] font-medium tracking-[-0.015em] text-white m-0">
              e avança aos poucos, até ler as suas primeiras palavras sozinho.
            </p>
          </div>
          <div className="min-w-0 lg:self-start rounded-[18px] bg-white/[.07] border border-white/[.14] p-5 sm:p-6 content-start grid gap-4">
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal-lite,#8FD3C6)] m-0">
              O que se junta nesta plataforma
            </p>
            <ul className="grid gap-3 list-none p-0 m-0">
              {REUNE.map((t, i) => (
                <li key={t} className="flex items-center gap-3 font-ui text-[16px] font-semibold text-white">
                  <span aria-hidden className="w-7 h-7 rounded-full bg-white/[.12] grid place-items-center shrink-0
                                               font-bold text-[14px] text-[var(--teal-lite,#8FD3C6)]">
                    {i === 0 ? '✓' : '+'}
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* O crédito ao método de origem continua nesta seção: é aqui que a
            página fala de quem fez o curso, e de onde o método veio faz parte
            da mesma resposta. Ver lib/credito.ts. */}
        <p className="-mt-4 font-ui text-[14.5px] leading-[1.6] text-ink-muted max-w-[70ch]">
          O método parte do trabalho de <strong className="font-semibold text-ink">
          {METODO_ORIGINAL.autor}</strong>, autor de{' '}
          <He size="inline">{METODO_ORIGINAL.obraHe}</He>{' '}
          ({METODO_ORIGINAL.obraTranslit}). O conteúdo do livro dele é a base do
          que esta plataforma ensina, e a adaptação para o aluno brasileiro -
          as comparações com o português, os exercícios e o que aparece na tela -
          é minha.
        </p>
      </Container>
    </section>
  );
}

function Citacao({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="m-0 flex gap-3.5 items-stretch">
      <span aria-hidden className="w-[3px] rounded-full bg-[var(--teal)] shrink-0" />
      <p className="font-display text-[19px] sm:text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-ink m-0">
        «{children}»
      </p>
    </blockquote>
  );
}

/* ── 9 · os recursos ────────────────────────────────────────────────────── */
type Recurso = { t: string; d: string; paths: string[] };

const RECURSOS: Recurso[] = [
  {
    t: TEM_AUDIO ? 'Áudio e pronúncia' : 'Pronúncia explicada',
    d: TEM_AUDIO
      ? 'Cada letra, sílaba e palavra gravada por falante nativo.'
      : 'Cada som comparado com um som que você já faz em português.',
    paths: ['M4 8v4M7 5.5v9M10 3v14M13 5.5v9M16 8v4']
  },
  { t: 'Correção imediata', d: 'Você sabe na hora se acertou - e por que errou.', paths: ['M4 10.5 8 14.5 16 5.5'] },
  { t: 'Sequência de estudos', d: 'Os dias seguidos contam, e faltar um não zera nada.', paths: ['M10 2.5c1.9 3 .8 4.5-.6 6-1.3 1.4-2.4 2.7-2.4 4.6a3 3 0 0 0 6 0c0-.9-.3-1.6-.7-2.3 2 1 3.2 2.6 3.2 4.6'] },
  { t: 'Progresso visual', d: 'Percentual por módulo e mapa de domínio das letras.', paths: ['M4 16V9M9 16V4M14 16v-5'] },
  { t: 'Revisão inteligente', d: 'O que escapa volta sozinho, no intervalo certo.', paths: ['M16 6.5A6.5 6.5 0 1 0 17 10', 'M16 3v3.5h-3.5'] },
  { t: 'Estude no celular', d: 'Uma atividade por tela, botão de continuar sempre à mão.', paths: ['M6.5 2.5h7a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16V4a1.5 1.5 0 0 1 1.5-1.5Z', 'M9 15h2'] },
  { t: 'Explicações em português', d: 'Comparações com o som que você já conhece, sempre.', paths: ['M3 10a7 7 0 1 1 7 7H3.5l1.8-2.1A6.97 6.97 0 0 1 3 10Z'] },
  { t: 'Hebraico desde o zero', d: 'Nenhum conhecimento prévio. Começa na primeira letra.', paths: ['M10 3.5 3 7l7 3.5L17 7l-7-3.5Z', 'M3 13l7 3.5L17 13'] }
];

export function Recursos() {
  return (
    <section>
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-8">O que vem junto com o curso.</H2></Reveal>
        <ul className="grid gap-3.5 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {RECURSOS.map((f, i) => (
            <Reveal as="li" key={f.t} delay={i * 55}
                    className="rounded-[18px] bg-[var(--card)] border border-line p-6
                               transition-[box-shadow,border-color] duration-[250ms]
                               hover:shadow-[var(--sh)] hover:border-[#D3CEC0]">
              <span aria-hidden className="mb-4 w-10 h-10 rounded-[12px] bg-[var(--teal-soft)] grid place-items-center">
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                  {f.paths.map((d, k) => (
                    <path key={k} d={d} stroke="var(--teal)" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                </svg>
              </span>
              <p className="font-display text-[18px] font-semibold tracking-[-0.015em] text-ink mb-1.5">{f.t}</p>
              <p className="font-ui text-[15px] leading-[1.55] text-ink-muted">{f.d}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 10 · a aula de amostra ─────────────────────────────────────────────── */
const AMOSTRA: readonly [string, string][] = [['ש', 'Shin'], ['מ', 'Mem'], ['ל', 'Lámed'], ['ב', 'Bet']];

export function AulaAmostra({ href }: { href: string }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const certo = escolha === 0;

  return (
    <section id="aula">
      <Container className="pt-16 sm:pt-24">
        <div className="rounded-[30px] bg-[var(--navy)] p-7 sm:p-[44px] sm:py-[52px]
                        grid gap-10 lg:gap-[52px] lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
          <div>
            <h2 className="font-display font-semibold text-[clamp(30px,3.6vw,42px)] leading-[1.08]
                           tracking-[-0.03em] text-white m-0 mb-4">
              Experimente antes de começar.
            </h2>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.6] text-white/70 max-w-[40ch] mb-6">
              Uma questão real da Lição 3, do jeito que ela aparece dentro da plataforma.
              Escolha uma opção.
            </p>
            <Link href={href}
                  className="inline-flex items-center rounded-[13px] bg-white text-[var(--navy)]
                             font-ui font-semibold text-[17px] px-7 py-[15px]
                             transition-transform duration-[180ms] hover:-translate-y-[2px]">
              Ver o curso por dentro
            </Link>
          </div>

          <div className="rounded-[22px] bg-[var(--card)] p-6 sm:px-[26px] sm:py-7">
            <p className="font-ui text-[13px] font-semibold uppercase tracking-[.08em] text-ink-muted mb-2">
              Lição 3 · Reconhecimento
            </p>
            <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink mb-5">
              Qual letra representa o som SH?
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4.5">
              {AMOSTRA.map(([he, nome], i) => {
                const marcada = escolha === i;
                const bom = marcada && i === 0;
                const ruim = marcada && i !== 0;
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => setEscolha(i)}
                    className="rounded-[16px] border-2 px-3 py-5 flex flex-col items-center gap-1.5
                               transition-all duration-[220ms] hover:-translate-y-[2px]"
                    style={{
                      background: bom ? 'var(--teal-soft)' : ruim ? 'var(--gold-soft)' : 'var(--card)',
                      borderColor: bom ? 'var(--teal)' : ruim ? '#D9B872' : 'var(--line)'
                    }}
                  >
                    <He size="lg" tone={bom ? 'teal' : 'navy'}>{he}</He>
                    <span className="font-ui text-[13px] font-semibold"
                          style={{ color: bom ? 'var(--teal-ink)' : ruim ? 'var(--gold-ink)' : 'var(--ink-muted)' }}>
                      {nome}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Altura reservada: sem ela o cartão salta 74px no primeiro toque. */}
            <div className="min-h-[74px]" aria-live="polite">
              {escolha === null && (
                <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted pt-1.5">
                  Escolha uma das quatro letras acima.
                </p>
              )}
              {escolha !== null && certo && (
                <div className="rounded-[14px] bg-[var(--teal-soft)] px-4 py-3.5 animate-pop">
                  <p className="flex items-center gap-2.5 mb-1">
                    <Check size={17} color="var(--teal-ink)" />
                    <span className="font-ui font-bold text-[16px] text-[var(--teal-ink)]">Muito bem!</span>
                    <span className="ml-auto font-ui font-bold text-[14px] text-[var(--teal)]">+10 XP</span>
                  </p>
                  <p className="font-ui text-[14.5px] leading-[1.55] text-[var(--teal-body)]">
                    Shin é a única com o ponto em cima à direita. É esse ponto que faz o som SH.
                  </p>
                </div>
              )}
              {escolha !== null && !certo && (
                <div className="rounded-[14px] bg-[var(--gold-soft)] px-4 py-3.5 animate-pop">
                  <p className="flex items-center gap-2.5 mb-1">
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path d="M9 4.6v5.2M9 12.9v.1" stroke="var(--gold-ink)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-ui font-bold text-[16px] text-[var(--gold-ink)]">Quase.</span>
                  </p>
                  <p className="font-ui text-[14.5px] leading-[1.55] text-[var(--gold-body)]">
                    {AMOSTRA[escolha]![1]} tem outro som. Procure a letra de três hastes, com um
                    ponto em cima à direita - pode tentar de novo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 11 · os depoimentos ────────────────────────────────────────────────── */
export function Depoimentos() {
  /* Enquanto não houver depoimento de verdade, a seção não existe. Ver a
     nota em lib/testimonials.ts. */
  if (DEPOIMENTOS.length === 0) return null;

  const fundos = ['var(--teal-soft)', 'var(--gold-soft)', '#EAEEF0'];
  const tintas = ['var(--teal-ink)', 'var(--gold-ink)', 'var(--navy)'];

  return (
    <section>
      <Container className="pt-16 sm:pt-24">
        <Reveal><H2 className="mb-8">Quem já está lendo.</H2></Reveal>
        {/* Um depoimento só não se estica pela largura toda: linha de texto
            longa demais cansa. `min(275px,100%)`: com o texto em 150% num
            telefone, sobram ~260px, e um mínimo fixo de 275 empurrava a página
            para o lado (npm run a11y). */}
        <ul className={`grid gap-4 list-none p-0 m-0 [grid-template-columns:repeat(auto-fit,minmax(min(275px,100%),1fr))]
                        ${DEPOIMENTOS.length === 1 ? 'max-w-[720px]' : ''}`}>
          {DEPOIMENTOS.map((t, i) => (
            <Reveal as="li" key={t.nome + i} delay={i * 80}
                    className="rounded-[18px] bg-[var(--card)] border border-line p-6">
              <span className="flex items-center gap-3 mb-4.5">
                <span aria-hidden
                      className="w-[42px] h-[42px] rounded-full grid place-items-center
                                 font-ui font-bold text-[15px]"
                      style={{ background: fundos[i % 3], color: tintas[i % 3] }}>
                  {t.iniciais}
                </span>
                <span className="grid">
                  <span className="font-ui text-[16px] font-semibold text-ink">{t.nome}</span>
                  <span className="font-ui text-[13.5px] text-ink-muted">{t.contexto}</span>
                </span>
              </span>
              {t.resultado && (
                <span className="inline-block rounded-full bg-[var(--teal-soft)] px-[11px] py-[5px]
                                 font-ui text-[13px] font-semibold text-[var(--teal-ink)] mb-3.5">
                  {t.resultado}
                </span>
              )}
              <blockquote className="m-0 grid gap-3">
                {t.citacao.split(/\n\s*\n/).map((par, j) => (
                  <p key={j} className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-muted">
                    {j === 0 ? '“' : ''}{par}{j === t.citacao.split(/\n\s*\n/).length - 1 ? '”' : ''}
                  </p>
                ))}
              </blockquote>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── 12 · o preço ───────────────────────────────────────────────────────── */
/* `owned` troca a coluna da direita inteira.
 * ─────────────────────────────────────────────────────────────────────────
 * Mostrar o preço e um "Começar agora" a quem já pagou é a plataforma
 * esquecendo o cliente na própria capa - e no lugar mais constrangedor
 * possível, a caixa de preço. Quem já tem o curso vê a porta dele. */
export function Preco({ href, label, owned }: { href: string; label: string; owned: boolean }) {
  const c = flagship();
  const parcelas = parcelasMax(c.price);
  const pix = pixPrice(c.price);
  const cheio = ancora(c.price);

  const inclui = [
    `Curso completo, ${totalLicoes()} lições`,
    'Exercícios interativos',
    TEM_AUDIO ? 'Áudios de todas as letras e palavras' : 'Explicação de som para cada letra',
    'Revisões liberadas automaticamente',
    'Acesso à plataforma, no celular e no computador',
    'Progresso salvo, retoma de onde parou'
  ];

  return (
    <section id="preco">
      <Container className="pt-16 sm:pt-24">
        <div className="rounded-[30px] bg-[var(--card)] border border-line shadow-[var(--sh-price)]
                        p-7 sm:p-[44px] sm:py-12
                        grid gap-10 lg:gap-[52px] lg:grid-cols-[minmax(0,1fr)_minmax(0,330px)] lg:items-center">
          <div>
            <p className="inline-block rounded-full bg-[var(--teal-soft)] px-3 py-1.5
                          font-ui text-[13px] font-bold uppercase tracking-[.06em] text-[var(--teal-ink)] mb-4.5">
              Curso 1 de uma trilha
            </p>
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08]
                           tracking-[-0.03em] m-0 mb-3.5">
              Curso de Alfabetização Hebraica
            </h2>
            <p className="font-ui text-[17px] sm:text-[17.5px] leading-[1.6] text-ink-muted max-w-[46ch] mb-6">
              Acesso completo à plataforma, com progresso salvo e revisões liberadas
              conforme você avança.
            </p>
            <CheckList items={inclui} columns={2} />
          </div>

          <div className="rounded-[22px] bg-[var(--sand)] px-7 py-8 text-center">
            {owned ? (
              <>
                <p className="font-ui text-[14.5px] text-ink-muted mb-1.5">Na sua conta</p>
                <p className="font-display text-[26px] sm:text-[29px] font-semibold tracking-[-0.025em]
                              leading-[1.15] text-ink mb-6">
                  Este curso já é seu.
                </p>
              </>
            ) : (
              <>
                {/* O rótulo diz POR QUE o preço é este. "Acesso completo" em
                    cima de um número riscado não explica nada; "preço de
                    pré-lançamento" explica, e é o que está sendo praticado. */}
                <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em]
                              text-[var(--teal-ink)] mb-1.5">
                  {cheio ? 'Preço de pré-lançamento' : 'Acesso completo'}
                </p>
                {cheio && (
                  <p className="font-ui text-[16px] text-ink-muted line-through leading-none mb-1">
                    {brl(cheio)}
                  </p>
                )}
                <p className="font-display text-[44px] sm:text-[48px] font-semibold tracking-[-0.035em]
                              leading-none text-ink mb-1">
                  {brl(soPix() ? pix : c.price.brl)}
                </p>
                <p className="font-ui text-[14.5px] text-ink-muted mb-6">
                  {/* Em quantas vezes, e não quanto por vez: a taxa do cartão
                      é repassada ao comprador, então quem fecha o valor da
                      parcela é a operadora. Ver `parcelasMax` em catalog.ts. */}
                  {soPix()
                    ? <>no PIX, à vista</>
                    : <>ou em até {parcelas}× no cartão</>}
                </p>
              </>
            )}
            <Link href={href}
                  className="group flex items-center justify-center gap-2 rounded-[13px] bg-[var(--navy)]
                             text-white font-ui font-semibold text-[17px] py-[15px] mb-3.5
                             transition-[background-color,transform] duration-[180ms]
                             hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0">
              {label}
              <span aria-hidden
                    className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
            </Link>
            {/* "No PIX sai por X" é a promessa de preço mais visível do site
                inteiro, e ela só pode existir enquanto o PIX puder ser
                cobrado. Sem PIX habilitado na conta do provedor (ver
                `pagamento.formas`), a frase some e fica o prazo de acesso,
                que continua verdadeiro. Anunciar um desconto que o checkout
                não dá é o erro que só aparece depois do clique. */}
            <p className="font-ui text-[13.5px] leading-[1.5] text-ink-muted">
              {owned
                ? 'Seu progresso continua exatamente onde você parou.'
                : !temPix()
                  ? <>Acesso liberado na hora da confirmação, por {c.accessMonths} meses.</>
                  : confirmaSozinho()
                    ? <>No PIX sai por {brl(pix)}. Acesso liberado na hora da confirmação,
                       por {c.accessMonths} meses.</>
                    : <>No PIX sai por {brl(pix)}. Acesso liberado em alguns minutos,
                       por {c.accessMonths} meses.</>}
            </p>
            {/* O número riscado diz "é mais barato"; esta linha diz o que ele
                É. Sem ela, o riscado vira preço de referência inventado - e no
                Brasil isso é publicidade enganosa, não licença poética. Some
                sozinha no dia em que o listBrl virar null. */}
            {!owned && cheio && (
              <p className="mt-2 font-ui text-[13.5px] leading-[1.5] font-medium text-[var(--teal-ink)]">
                Depois do pré-lançamento, o curso passa a custar {brl(cheio)}.
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── 13 · as dúvidas ────────────────────────────────────────────────────── */
export function Faq() {
  const c = flagship();
  const licoes = totalLicoes();

  const PERGUNTAS: readonly [string, string][] = [
    ['Preciso saber hebraico?',
     'Não. O curso começa do zero absoluto, na primeira letra, e assume que você nunca viu o alfabeto.'],
    ['É hebraico moderno ou bíblico?',
     'A leitura é a mesma: as letras e os sinais de vogal do texto bíblico são os que este curso ensina. O curso usa a pronúncia do hebraico moderno e vocabulário do dia a dia, o que abre os dois caminhos. Ler em voz alta e entender, porém, são coisas diferentes - a página /biblia responde isso por inteiro.'],
    ['Quanto tempo leva?',
     `São ${course.totalLetters} letras em ${licoes} lições, mais os checkpoints. Em vinte minutos por dia, a maioria termina em seis a oito semanas.`],
    ['O curso funciona no celular?',
     'Sim. A plataforma foi desenhada primeiro para o celular: uma atividade por tela e o botão de continuar sempre à mão.'],
    ['Tem áudio?',
     TEM_AUDIO
       ? 'Cada letra, sílaba e palavra tem áudio gravado por falante nativo, com repetição livre.'
       : 'As gravações estão em produção. Enquanto não entram, o curso não usa voz sintética: cada som é explicado por comparação com um som do português, e os exercícios de escuta ficam desativados em vez de virar adivinhação.'],
    ['Por quanto tempo tenho acesso?',
     `${c.accessMonths} meses a partir da confirmação do pagamento, incluindo as atualizações feitas no curso nesse período.`],
    ['Posso estudar no meu ritmo?',
     'Sim. Não há turmas nem prazos. O progresso fica salvo e você retoma exatamente de onde parou.'],
    ['O que acontece depois que termino?',
     'Você entra na trilha: Hebraico A1 é o próximo nível. Alunos da Alfabetização são avisados primeiro quando ele abre.']
  ];

  const [aberta, setAberta] = useState(-1);

  return (
    <section id="duvidas">
      <div className="mx-auto w-full max-w-[820px] px-5 sm:px-7 pt-16 sm:pt-24">
        <H2 className="mb-3">Dúvidas frequentes</H2>
        {/* Uma linha de apoio, e ela diz o ESCOPO - não pede desculpa por
            nada e não anuncia o que falta. Onde há limitação, ela está na
            resposta que a pergunta pede. */}
        <p className="font-ui text-[17px] leading-[1.6] text-ink-muted max-w-[48ch] mb-8">
          Antes de começar, vale saber: o que o curso cobre, como funciona o acesso e o
          que esperar por dentro da plataforma.
        </p>
        <div className="grid gap-2">
          {PERGUNTAS.map(([q, a], i) => {
            const open = aberta === i;
            return (
              <div key={q}
                   className={`rounded-[16px] bg-[var(--card)] border overflow-hidden
                               transition-colors duration-[250ms]
                               ${open ? 'border-[var(--teal)]' : 'border-line'}`}>
                <button
                  type="button"
                  onClick={() => setAberta(open ? -1 : i)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-4 px-5 sm:px-[22px] py-[19px] text-left"
                >
                  <span className="flex-1 font-ui text-[16px] sm:text-[17px] font-semibold text-ink">{q}</span>
                  <Chevron open={open} />
                </button>
                <div className="overflow-hidden transition-[max-height] duration-[320ms] ease-[var(--ease)]"
                     style={{ maxHeight: open ? 260 : 0 }}>
                  <p className="px-5 sm:px-[22px] pb-5 font-ui text-[15.5px] sm:text-[16px]
                                leading-[1.65] text-ink-muted">
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 14 · o fecho ───────────────────────────────────────────────────────── */
const PALAVRAS: readonly { he: string; tr: string; pt: string }[] = [
  { he: 'שָׁלוֹם', tr: 'shalom', pt: 'olá, paz' },
  { he: 'תּוֹדָה', tr: 'todá', pt: 'obrigado' },
  { he: 'מַיִם', tr: 'máyim', pt: 'água' }
];

/* O `id` não é para link nenhum: é o alvo que a barra fixa do celular
   observa para sumir de cima do último pedido da página. Ver BarraFixa.tsx. */
export function CtaFinal({ href, label }: { href: string; label: string }) {
  return (
    <section id="fecho">
      <Container className="mt-16 sm:mt-24">
        <div className="relative overflow-hidden rounded-[30px] bg-[var(--navy)] px-7 py-14 sm:px-12 sm:py-[72px] text-center">
          <span aria-hidden className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(90% 120% at 50% 0%, rgba(143,214,200,.15), transparent 62%)' }} />
          <div className="relative">
            <ul className="flex flex-wrap justify-center gap-x-[26px] gap-y-6 list-none p-0 m-0 mb-9">
              {PALAVRAS.map(w => (
                <li key={w.tr} className="text-center">
                  <He size="lg" tone="paper">{w.he}</He>
                  <p className="font-ui text-[13.5px] text-[var(--teal-lite)] mt-0.5">{w.tr}</p>
                  <p className="font-ui text-[14.5px] text-white/60">{w.pt}</p>
                </li>
              ))}
            </ul>
            <h2 className="font-display font-semibold text-[clamp(28px,3.9vw,46px)] leading-[1.1]
                           tracking-[-0.032em] text-white text-balance max-w-[19ch] mx-auto mb-7">
              A próxima palavra em hebraico pode ser a primeira que você realmente consegue ler.
            </h2>
            <Link href={href}
                  className="group inline-flex items-center gap-2 rounded-[14px] bg-white text-[var(--navy)]
                             font-ui font-semibold text-[18px] px-[34px] py-4
                             transition-transform duration-[180ms] hover:-translate-y-[2px]
                             active:translate-y-0">
              {label}
              <span aria-hidden
                    className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
