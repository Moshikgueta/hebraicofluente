'use client';

/* O mapa do curso: uma linha do tempo vertical.
 * ─────────────────────────────────────────────────────────────────────────
 * Um marcador por módulo, ligado ao seguinte por um fio, e ao lado um cartão
 * com as letras daquele módulo. O caminho inteiro é visível desde o começo -
 * esconder a estrada é o que faz um curso parecer infinito -, mas o peso é
 * desigual de propósito: o módulo concluído tem o marcador cheio, o atual
 * tem borda teal e barra de progresso, e o que vem tem cadeado e 72% de
 * opacidade.
 *
 * Uma forma só, do telefone ao desktop. Antes eram duas - uma espinha no
 * telefone e um quadro de painéis no desktop -, dois desenhos para o mesmo
 * dado, e cada mudança de conteúdo tinha de ser feita nos dois. Os cartões
 * de letra são uma grade que embrulha sozinha, então a linha do tempo cabe
 * em 390px sem virar outra tela.
 *
 * Nada aqui é bloqueado de verdade: o cadeado diz "você ainda não chegou",
 * não "não pode entrar". Um adulto que quer espiar o módulo 6 pode.
 */

import { IconeCadeado } from '@/components/shell/NavIcons';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, getLetter, type CourseModule } from '@/lib/content';
import { totalLicoes } from '@/lib/content-publico';
import { Prose } from '@/components/learn/Blocks';
import { OrdemPedagogica } from '@/components/learn/OrdemPedagogica';
import { isLessonComplete, letraLiberada, STAGE_COUNT } from '@/lib/state/rules';
import { flagship } from '@/lib/catalog';
import { idDoSom, ordemDeEnsino } from '@/lib/sons';

/* Uma lição do caminho dentro do módulo: uma letra ou um som (Vet, Tch...). */
type Item = { id: string; he: string; nome: string; href: string };

function itensDoModulo(m: CourseModule): Item[] {
  /* Bet, Kaf, Pe e Shin têm, no mesmo módulo, a lição do outro som: o
     cartão da letra mostra o lado dela (בּ "Bet", שׁ "Shin") e o do som
     mostra o outro (ב "Vet", שׂ "Sin"). Sem isso eram dois cartões com o
     mesmo desenho. Os sons modernos ficam fora: a letra sem gerech está em
     outro módulo. */
  const ladoDe = (letra: string) =>
    m.lessons.find(l => l.som && l.parHe && [...l.parHe][0] === letra)?.parHe;
  return m.lessons.flatMap(ls => {
    if (ls.som) {
      return [{ id: idDoSom(ls.som), he: ls.he ?? '', nome: ls.nomePt ?? ls.som, href: `/som/${ls.som}` }];
    }
    return (ls.letters ?? []).map(getLetter).filter(l => !!l)
      .map(L => {
        const lado = ladoDe(L!.letter);
        return {
          id: L!.id,
          he: lado ?? L!.letter,
          nome: lado ? L!.namePt.split('/')[0]!.trim() : L!.namePt,
          href: `/licao/${L!.id}`
        };
      });
  });
}

type Estado = 'feito' | 'agora' | 'adiante';

export function CourseMapClient() {
  const p = useProgress();
  const modulos = course.modules;
  const licoes = totalLicoes();

  /* O módulo atual é o primeiro que ainda não fechou. */
  const indiceAtual = modulos.findIndex(m => !moduloCompleto(p.state, m));

  return (
    <div className="lg:rounded-[24px] lg:bg-[var(--card)] lg:border lg:border-line lg:shadow-[var(--sh)]
                    lg:p-10 lg:pb-11">
      <header className="flex items-end gap-5 flex-wrap mb-8">
        <div className="flex-1 min-w-[240px]">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)] mb-2">
            Meu curso
          </p>
          <h1 className="font-display text-[27px] sm:text-[31px] font-semibold leading-[1.1]
                         tracking-[-0.028em] mb-1">
            {flagship().titlePt}
          </h1>
          <p className="font-ui text-[16px] text-ink-muted">
            {modulos.length} módulos · {licoes} lições · {course.totalLetters} letras
          </p>
        </div>
        <p className="text-right">
          <span className="block font-display text-[34px] sm:text-[38px] font-semibold
                           tracking-[-0.03em] leading-none text-[var(--teal-ink)] tabular-nums">
            {Math.round(p.progress * 100)}%
          </span>
          <span className="block font-ui text-[14px] text-ink-muted">concluído</span>
        </p>
      </header>

      <ol className="list-none p-0 m-0">
        {modulos.map((m, i) => {
          const estado: Estado = i < indiceAtual ? 'feito'
            : i === indiceAtual || indiceAtual === -1 ? 'agora'
            : 'adiante';
          return (
            <Trecho key={m.id} module={m} estado={estado} ultimo={i === modulos.length - 1} />
          );
        })}
      </ol>

      {/* Depois do caminho inteiro, e não antes: a pergunta "por que {{מ}}
          vem antes de {{ב}}?" só existe para quem acabou de VER a ordem.
          Pô-la em cima seria responder algo que o aluno ainda não perguntou,
          e empurrar o mapa - que é o assunto desta tela - para baixo. */}
      <div className="mt-8">
        <OrdemPedagogica />
      </div>
    </div>
  );
}

function moduloCompleto(state: Parameters<typeof isLessonComplete>[0], m: CourseModule): boolean {
  const itens = itensDoModulo(m).every(i => isLessonComplete(state, i.id));
  if (m.letterIds.length === 0) return itens && (state.lessons[m.id]?.stagesDone.length ?? 0) >= 3;
  const letras = itens;
  const cp = m.checkpoint ? !!state.checkpoints[m.checkpoint.id]?.passedAt : true;
  return letras && cp;
}

function Trecho({ module: m, estado, ultimo }: {
  module: CourseModule; estado: Estado; ultimo: boolean;
}) {
  const p = useProgress();
  const itens = itensDoModulo(m);
  /* A ordem de ensino, a mesma que a trava da lição usa. Calculada aqui e
     não no carregamento do arquivo: na plataforma o conteúdo das letras
     chega do servidor depois, e uma constante de módulo nasceria vazia. */
  const ordem = ordemDeEnsino(allLetters(), course.modules);
  const feitas = itens.filter(i => isLessonComplete(p.state, i.id)).length;
  const extra = m.letterIds.length === 0;
  /* O módulo 7 tem as três lições de som E o fecho de três etapas. */
  const etapas = feitas + (extra ? Math.min(3, p.state.lessons[m.id]?.stagesDone.length ?? 0) : 0);
  const total = itens.length + (extra ? 3 : 0);
  const pct = total ? Math.round((etapas / total) * 100) : 0;
  const pendente = itens.find(i => !isLessonComplete(p.state, i.id));
  const destino = pendente ? pendente.href : extra ? `/modulo/${m.n}` : itens[0]?.href ?? `/modulo/${m.n}`;

  const TAG = {
    feito: { texto: 'Concluído', cor: 'text-[var(--teal-ink)]' },
    agora: { texto: 'Em andamento', cor: 'text-[var(--teal-ink)]' },
    /* `--locked` e não um cinza escrito à mão: o cinza literal era o mesmo
       nos dois temas, e no escuro ele nem é o cinza certo nem acompanha o
       alto contraste. */
    /* "Em breve" sugeria conteúdo ainda não lançado, quando o módulo só
       espera o anterior (auditoria de 01/10/2026, VIS-010). */
    adiante: { texto: `Abre depois do módulo ${m.n - 1}`, cor: 'text-ink-muted' }  // texto, não controle: 4,5:1 (UX-009)
  }[estado];

  return (
    <li className="grid grid-cols-[38px_minmax(0,1fr)] sm:grid-cols-[52px_minmax(0,1fr)] gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span
          aria-hidden
          className={`w-[38px] h-[38px] sm:w-11 sm:h-11 rounded-[14px] border-2 grid place-items-center shrink-0
            ${estado === 'feito' ? 'bg-[var(--teal)] border-[var(--teal)]'
              : estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]'
              : 'bg-[var(--sand)] border-line'}`}
        >
          {estado === 'feito' && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.6 9.4 7 12.8 14.4 5.4" stroke="#fff" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {estado === 'agora' && <span className="w-[11px] h-[11px] rounded-full bg-[var(--teal)]" />}
          {estado === 'adiante' && (
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <rect x="3.6" y="7.8" width="10.8" height="7.4" rx="2" stroke="var(--locked)" strokeWidth="1.4" />
              <path d="M6.2 7.8V5.9a2.8 2.8 0 0 1 5.6 0v1.9" stroke="var(--locked)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </span>
        {!ultimo && (
          <span aria-hidden className="flex-1 w-[2px] min-h-[26px]"
                style={{ background: estado === 'feito' ? 'var(--teal)' : 'var(--line)' }} />
        )}
      </div>

      <div className="pb-6 sm:pb-[26px]">
        {/* O cartão inteiro leva ao próximo passo do módulo, e cada letra já
            feita (ou começada) leva à SUA lição. Um link não pode morar
            dentro de outro, então o do cartão é o título, esticado sobre o
            cartão todo por um `::after`, e as letras ficam por cima dele.
            Antes o cartão era um link só, e tocar num {{ש}} concluído abria
            sempre a primeira letra do grupo. */}
        <div
          className={`relative rounded-[18px] border p-5 sm:px-6 sm:py-[22px] transition-shadow duration-[250ms]
            hover:shadow-[var(--sh)]
            ${estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]'
              /* O módulo trancado RECUA, e é por isso que ele usa o papel e
                 não uma cor escrita à mão. O literal `#FBFAF7` que estava
                 aqui é quase o creme, então no tema claro ele fazia o certo
                 por acaso - e no escuro virou o bloco MAIS CLARO da tela: os
                 módulos que o aluno ainda não pode abrir gritavam, e o único
                 que ele podia estudar ficava mais quieto que eles.
                 Com `--paper` o cartão tem a cor do fundo nos dois temas, e
                 quem o separa é a borda. Que é o que "ainda não" deve ser.
                 Sem `opacity` (VIS-010): ela levava o texto do cartão a 3:1.
                 O recuo agora é só do cartão - papel, borda tracejada e o
                 cadeado -, e o texto fica em `--ink-muted`, que passa 4,5:1. */
              : estado === 'adiante' ? 'bg-[var(--paper)] border-line border-dashed'
              : 'bg-[var(--card)] border-line'}`}
        >
          <div className="flex items-center gap-3.5 flex-wrap mb-2.5">
            <span className={`inline-flex items-center gap-1.5 font-ui text-[12.5px] font-bold uppercase tracking-[.1em] ${TAG.cor}`}>
              {estado === 'adiante' && (
                <svg aria-hidden width="13" height="13" viewBox="0 0 18 18" fill="none">
                  <rect x="3.6" y="7.8" width="10.8" height="7.4" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M6.2 7.8V5.9a2.8 2.8 0 0 1 5.6 0v1.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
              {TAG.texto}
            </span>
            <span className="font-ui text-[13.5px] text-ink-muted">
              Módulo {m.n} · {m.lessons.length} {m.lessons.length === 1 ? 'lição' : 'lições'}
            </span>
            <span className="flex-1" />
            {estado !== 'adiante' && (
              <span className="flex items-center gap-2.5 min-w-[150px]">
                <span className="flex-1 h-1.5 rounded-full bg-[var(--sand)] overflow-hidden">
                  <span className="block h-full rounded-full bg-[var(--teal)] transition-[width] duration-500"
                        style={{ width: `${pct}%` }} />
                </span>
                <span className="font-ui text-[13px] font-semibold text-[var(--teal-ink)] tabular-nums">{pct}%</span>
              </span>
            )}
          </div>

          <p className={`font-display text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] mb-3.5
                         ${estado === 'adiante' ? 'text-ink-muted' : 'text-ink'}`}>
            <Link href={destino}
                  className="after:absolute after:inset-0 after:rounded-[18px] after:content-['']">
              {m.titlePt}
            </Link>
          </p>

          {itens.length === 0 ? (
            <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted">
              <Prose text={m.subPt} />
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {itens.map(L => {
                const feita = isLessonComplete(p.state, L.id);
                const etapasFeitas = p.state.lessons[L.id]?.stagesDone.length ?? 0;
                const comecada = etapasFeitas > 0 && !feita;

                const aberta = feita || comecada;
                /* 🔒 na letra que a trava de progressão ainda fecha (a mesma
                   regra da lição, `letraLiberada`). A próxima a estudar fica
                   SEM cadeado, e nada aparece antes de o progresso carregar -
                   senão o mapa inteiro piscaria trancado a cada abertura. */
                const bloqueada = p.ready && !aberta && !letraLiberada(p.state, ordem, L.id);
                /* A próxima a estudar também é link (05/10/2026): o Resh
                   concluído liberava a Sin, mas o cartão dela, sem cadeado,
                   não abria - parecia trancado sem dizer por quê. Antes de o
                   progresso carregar, nada que não foi aberto vira link. */
                const liberada = aberta || (p.ready && !bloqueada);
                const estadoDaLetra = feita ? ' - concluída' : comecada ? ` - ${etapasFeitas} de ${STAGE_COUNT} etapas`
                  : bloqueada ? ' - bloqueada' : '';
                const classe = `relative z-[1] min-w-[46px] px-1.5 h-[50px] rounded-[12px] border grid place-items-center gap-px
                  ${liberada ? 'hover:shadow-[var(--sh)] hover:border-[var(--teal)] transition-[box-shadow,border-color]' : ''}
                  ${feita ? 'bg-[var(--teal-soft)] border-[var(--edge-teal)]'
                    : comecada ? 'bg-[var(--card)] border-[var(--teal)]'
                    : 'bg-[var(--sand)] border-line'}`;
                const miolo = (
                  <>
                    {bloqueada && (
                      <span aria-hidden className="absolute -top-2 -right-2 leading-none text-ink-muted bg-[var(--card)] rounded-full"><IconeCadeado size={14} /></span>
                    )}
                    <He size="inline" tone={feita ? 'teal' : estado === 'adiante' ? 'muted' : 'navy'}
                        className="!text-[23px] !leading-[1.1]">
                      {L.he}
                    </He>
                    <span className={`font-ui text-[9.5px] tracking-[.04em]
                      ${feita ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
                      {L.nome}
                    </span>
                  </>
                );
                /* Ganha link a letra já aberta e a liberada; a trancada, com o
                   cadeado, continua sem link e é alcançada na ordem. */
                return liberada ? (
                  <Link key={L.id} href={L.href} className={classe}
                        title={`${L.nome}${estadoDaLetra}`}
                        aria-label={`Abrir a lição de ${L.nome}${estadoDaLetra}`}>
                    {miolo}
                  </Link>
                ) : (
                  <span key={L.id} className={classe} title={`${L.nome}${estadoDaLetra}`}
                        aria-label={`${L.nome}${estadoDaLetra}`}>
                    {miolo}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function CourseMapNotFound() {
  return <p className="font-ui text-[15px] text-ink-muted">Mapa não encontrado.</p>;
}
