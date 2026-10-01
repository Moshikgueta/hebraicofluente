'use client';

import { He } from '@/components/hebrew/He';
import { Container, Reveal } from './base';

/* A trajetória do professor, na versão LONGA (28/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Mora na página /sobre, e não na capa: a pedido do dono do curso, a capa
 * ficou com um resumo (Professor, em Fecho.tsx) e um link para cá. Um
 * componente só, para que as duas páginas nunca contem histórias diferentes.
 *
 * Ela deixa de ser só uma apresentação e responde «por que existe uma
 * metodologia por trás disto?». As regras:
 *
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
  'Formação em ensino de idiomas: CELTA e Letras em andamento',
  'O trabalho diário de criar cursos de idiomas'
];

const ATIVIDADES = [
  'aprende as letras aos poucos', 'pratica o reconhecimento', 'diferencia letras parecidas',
  'aprende o nikud', 'pratica a leitura', 'conhece a escrita cursiva', 'monta palavras',
  'recebe correção na hora'
];

export function Trajetoria({ retrato, nivel = 'h2' }: { retrato: string | null; nivel?: 'h1' | 'h2' }) {
  const Titulo = nivel;
  return (
    <section aria-labelledby="trajetoria-titulo">
      <Container className="pt-14 sm:pt-20 pb-16 sm:pb-24 grid gap-12 sm:gap-16">
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
            <p className="font-ui text-[13px] font-bold uppercase tracking-[.11em] text-[var(--teal-ink)] mb-3.5">
              Quem está por trás do Hebraico Fluente
            </p>
            <Titulo id="trajetoria-titulo"
                className="font-display font-semibold text-[clamp(26px,3vw,38px)] leading-[1.12]
                           tracking-[-0.03em] text-balance m-0 mb-5 max-w-[26ch]">
              De Israel ao Brasil: anos ensinando, aprendendo e pensando idiomas, transformados em uma
              metodologia para brasileiros.
            </Titulo>
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
                          ${ultimo ? 'bg-[var(--teal-solid)] text-white' : 'bg-[var(--teal-soft)] text-[var(--teal-ink)]'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-display text-[18px] font-semibold tracking-[-0.015em] m-0 mb-1
                                   ${ultimo ? 'text-[var(--teal-ink)]' : 'text-ink'}`}>{c.t}</p>
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
