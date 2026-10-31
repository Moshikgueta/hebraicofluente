'use client';

import { PERFIL_LINKEDIN } from '@/lib/professor';
import { He } from '@/components/hebrew/He';
import { Container, Reveal, Rubrica } from './base';
import { tx } from '@/i18n/telas/venda-trajetoria';
import { LOCALE } from '@/i18n';

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
  tx.padrao1,
  tx.padrao2,
  tx.padrao3,
  tx.padrao4,
  tx.padrao5
];

/* O site em inglês não fala do Brasil (decisão do dono, 29/10/2026): a parada
   do caminho sai inteira, e a sala de aula vem logo depois de Israel. */
const CAMINHO: readonly { t: string; d: string }[] = [
  { t: tx.caminhoIsraelT, d: tx.caminhoIsraelD },
  ...(LOCALE === 'en' ? [] : [{ t: tx.caminhoBrasilT, d: tx.caminhoBrasilD }]),
  { t: tx.caminhoSalaT, d: tx.caminhoSalaD },
  { t: tx.caminhoIdiomasT, d: tx.caminhoIdiomasD },
  { t: tx.caminhoMetodologiaT, d: tx.caminhoMetodologiaD },
  { t: tx.caminhoHfT, d: tx.caminhoHfD }
];

const REUNE = [
  tx.reune1,
  tx.reune2,
  tx.reune3,
  tx.reune4,
  tx.reune5
];

const ATIVIDADES = [
  tx.atividade1, tx.atividade2, tx.atividade3,
  tx.atividade4, tx.atividade5, tx.atividade6, tx.atividade7,
  tx.atividade8
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
                alt={tx.retratoAlt}
                width={680} height={850} loading="lazy" decoding="async"
                className="aspect-[4/5] w-full max-w-[260px] sm:max-w-[420px] rounded-[16px]
                           shadow-[0_0_0_1px_rgba(27,33,31,.06)] object-cover object-top bg-[var(--sand)]"
              />
            ) : (
              <div className="aspect-[4/5] max-w-[260px] sm:max-w-[420px] rounded-[16px] bg-[var(--sand)]
                              grid place-items-center">
                <span className="grid place-items-center w-24 h-24 rounded-[26px] bg-[var(--navy)]">
                  <span style={{ fontSize: 46, marginTop: -3, lineHeight: 1 }}>
                    <He size="inline" tone="lite" className="leading-none">ע</He>
                  </span>
                </span>
              </div>
            )}
            <p className="mt-4 font-display text-[20px] font-semibold tracking-[-0.015em] text-ink m-0">{tx.nome}</p>
            <p className="font-ui text-[14.5px] text-ink-muted m-0">{tx.descricao}</p>
          </Reveal>

          <Reveal delay={100}>
            <Rubrica className="mb-5">{tx.rubrica}</Rubrica>
            <Titulo id="trajetoria-titulo"
                className="font-display font-semibold text-[clamp(26px,3vw,38px)] leading-[1.12]
                           tracking-[-0.03em] text-balance m-0 mb-5 max-w-[26ch]">
              {tx.titulo}
            </Titulo>
            {/* Primeira pessoa: ninguém confia numa biografia em terceira
                pessoa escrita pela própria pessoa. */}
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[58ch] mb-4">
              {tx.p1}
            </p>
            <p className="font-ui text-[17px] sm:text-[18px] leading-[1.65] text-ink-muted max-w-[58ch] mb-5">
              {tx.p2}
            </p>
            {/* Os cinco pontos eram selos com borda; viraram uma lista sob
                fios, que se lê como lista e não como etiquetas. */}
            <ul className="grid sm:grid-cols-2 gap-x-8 list-none p-0 m-0 mb-6 border-t border-line max-w-[680px]">
              {PADROES.map(t => (
                <li key={t} className="flex items-center gap-3 py-3 border-b border-line
                                       font-ui text-[15.5px] text-ink-body">
                  <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="font-display text-[19px] sm:text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-ink m-0">
              {tx.decisao}
            </p>
          </Reveal>
        </div>

        {/* 2 · o caminho, com as credenciais dentro dos passos */}
        <Reveal>
          <Rubrica as="h3" className="mb-6">{tx.caminho}</Rubrica>
          {/* Colunas sob um fio, como as etapas do método na capa: o traço
              teal marca o começo de cada passo, e o último (o próprio
              Hebraico Fluente) leva o traço inteiro. */}
          <ol className="list-none p-0 m-0 grid gap-x-6 gap-y-7 border-t border-line sm:grid-cols-3 lg:grid-cols-6">
            {CAMINHO.map((c, i) => {
              const ultimo = i === CAMINHO.length - 1;
              return (
                <li key={c.t} className="relative pt-5 min-w-0">
                  <span aria-hidden className={`absolute -top-px left-0 h-[2px] bg-[var(--teal)] ${ultimo ? 'right-0' : 'w-10'}`} />
                  <span aria-hidden className="block font-display text-[15px] font-semibold tracking-[-0.01em]
                                               text-[var(--teal-ink)] tabular-nums mb-2.5">
                    {String(i + 1).padStart(2, '0')}
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
        {/* Duas colunas abertas sob fio, sem cartão: são dois textos, não
            dois produtos. */}
        <div className="grid gap-10 lg:gap-14 lg:grid-cols-2">
          <Reveal className="min-w-0 border-t border-line pt-7 grid gap-4 content-start">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] m-0">{tx.ensinandoTitulo}</h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-muted m-0">
              {tx.ensinandoTexto}
            </p>
            <Citacao>
              {tx.ensinandoCitacao}
            </Citacao>
          </Reveal>
          <Reveal className="min-w-0 border-t border-line pt-7 grid gap-4 content-start">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] m-0">{tx.ladosTitulo}</h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-ink-muted m-0">
              {tx.ladosTexto}
            </p>
            <Citacao>
              {tx.ladosCitacao}
            </Citacao>
          </Reveal>
        </div>

        {/* 4 · como nasceu, e a combinação que sustenta a plataforma */}
        <Reveal className="rounded-[22px] bg-[var(--navy)] text-white p-6 sm:p-10
                           grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 grid gap-4 content-start">
            <h3 className="font-display text-[clamp(22px,2.3vw,28px)] font-semibold tracking-[-0.02em] text-white m-0">
              {tx.nasceuTitulo}
            </h3>
            <p className="font-ui text-[16.5px] leading-[1.65] text-white/80 m-0">
              {tx.nasceuP1}
            </p>
            <p className="font-ui text-[16.5px] leading-[1.65] text-white m-0">
              {tx.nasceuP2}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 list-none p-0 m-0">
              {ATIVIDADES.map(t => (
                <li key={t} className="inline-flex items-center gap-2.5 font-ui text-[15px] text-white/90">
                  <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-[var(--gold)]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="font-display text-[19px] leading-[1.45] font-medium tracking-[-0.015em] text-white m-0">
              {tx.nasceuFecho}
            </p>
          </div>
          <div className="min-w-0 lg:self-start content-start grid gap-5 lg:pl-10 lg:border-l lg:border-white/15">
            <Rubrica tom="lite">{tx.junta}</Rubrica>
            <ul className="list-none p-0 m-0 border-t border-white/15">
              {REUNE.map(t => (
                <li key={t} className="py-3 border-b border-white/15 font-ui text-[16px] font-semibold text-white">
                  {t}
                </li>
              ))}
            </ul>
            <a href={PERFIL_LINKEDIN} target="_blank" rel="noopener noreferrer me"
               className="inline-flex items-center gap-1.5 font-ui text-[15px] font-semibold text-white
                          underline underline-offset-[3px] decoration-[1.5px] decoration-white/60">
              {tx.linkedin}
              <span aria-hidden>↗</span>
              <span className="sr-only">{tx.abreAba}</span>
            </a>
          </div>
        </Reveal>

      </Container>
    </section>
  );
}

function Citacao({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="m-0 flex gap-3.5 items-stretch">
      <span aria-hidden className="w-[2px] bg-[var(--teal)] shrink-0" />
      <p className="font-display text-[19px] sm:text-[20px] leading-[1.45] font-medium tracking-[-0.015em] text-ink m-0">
        “{children}”
      </p>
    </blockquote>
  );
}
