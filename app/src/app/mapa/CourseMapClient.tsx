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

import { useEffect, useRef, useState } from 'react';
import { Cenario, LUGAR, type IdDoCenario } from '@/components/aventura/Cenarios';
import { Yael } from '@/components/aventura/Yael';
import { anotarVisto, lerVisto, moduloParaAnunciar } from '@/lib/desbloqueio';
import { IconeCadeado } from '@/components/shell/NavIcons';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, getLetter, type CourseModule } from '@/lib/content';
import { totalLicoes } from '@/lib/content-publico';
import { Prose } from '@/components/learn/Blocks';
import { OrdemPedagogica } from '@/components/learn/OrdemPedagogica';
import { aula0Feita, isLessonComplete, isLessonMastered, letraLiberada, STAGE_COUNT } from '@/lib/state/rules';
import { ETAPA_AULA0, ETAPA_DO_MODULO, ETAPA_FINAL } from '@/lib/jornada';
import { flagship } from '@/lib/catalog';
import { idDoSom, ordemDeEnsino } from '@/lib/sons';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-course-map-client';

/* Uma lição do caminho dentro do módulo: uma letra ou um som (Vet, Tch...). */
type Item = { id: string; he: string; nome: string; href: string };

function itensDoModulo(m: CourseModule): Item[] {
  /* Bet, Kaf, Pe e Shin têm, no mesmo módulo, a lição do outro som: o
     cartão da letra mostra o lado dela (בּ "Bet", שׁ "Shin") e o do som
     mostra o outro (ב "Vet", שׂ "Sin"). Sem isso eram dois cartões com o
     mesmo desenho. Os sons modernos ficam fora: a letra sem guéresh está em
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

  /* O módulo atual é o primeiro que ainda não fechou. Antes da Aula 0
     nenhum: o passo atual é ela (12/10/2026). */
  const a0 = aula0Feita(p.state);
  const indiceAtual = a0 ? modulos.findIndex(m => !moduloCompleto(p.state, m)) : -2;
  /* O lugar que abriu desde a última visita (lib/desbloqueio.ts). Só depois
     de o progresso carregar: antes dele o mapa inteiro parece trancado, e
     anotar isso apagaria a lembrança certa. */
  const atualN = indiceAtual >= 0 ? modulos[indiceAtual]!.n : indiceAtual === -2 ? 0 : null;
  const [novo, setNovo] = useState<number | null>(null);
  useEffect(() => {
    if (!p.ready || atualN == null) return;
    const n = moduloParaAnunciar(atualN, lerVisto());
    if (n != null) setNovo(n);
    anotarVisto(atualN);
  }, [p.ready, atualN]);

  return (
    <div className="lg:rounded-[24px] lg:bg-[var(--card)] lg:border lg:border-line lg:shadow-[var(--sh)]
                    lg:p-10 lg:pb-11">
      <header className="flex items-end gap-5 flex-wrap mb-8">
        <div className="flex-1 min-w-[240px]">
          <p className="font-ui text-[13px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)] mb-2">
            {tx.meuCurso}
          </p>
          <h1 className="font-display text-[27px] sm:text-[31px] font-semibold leading-[1.1]
                         tracking-[-0.028em] mb-1">
            {flagship().titlePt}
          </h1>
          <p className="font-ui text-[16px] text-ink-muted">
            {fmt(tx.resumo, { modulos: modulos.length, licoes, letras: course.totalLetters })}
          </p>
        </div>
        <p className="text-right">
          <span className="block font-display text-[34px] sm:text-[38px] font-semibold
                           tracking-[-0.03em] leading-none text-[var(--teal-ink)] tabular-nums">
            {Math.round(p.progress * 100)}%
          </span>
          <span className="block font-ui text-[14px] text-ink-muted">{tx.concluido}</span>
        </p>
      </header>

      <ol className="list-none p-0 m-0">
        <TrechoAula0 feita={a0} />
        {modulos.map((m, i) => {
          const estado: Estado = indiceAtual === -2 ? 'adiante'
            : i < indiceAtual ? 'feito'
            : i === indiceAtual || indiceAtual === -1 ? 'agora'
            : 'adiante';
          return (
            <Trecho key={m.id} module={m} estado={estado} ultimo={false} novo={novo === m.n} />
          );
        })}
        <TrechoFinal />
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

/* ── a Aula 0, o primeiro passo do caminho (12/10/2026) ──────────────────
   Ela abre a primeira letra (lib/state/rules.ts, `aula0Feita`), então mora
   no mapa como qualquer etapa: concluída com o marcador cheio, ou o passo
   atual, com a borda teal. Depois de feita continua aqui, para consulta. */
function TrechoAula0({ feita }: { feita: boolean }) {
  return (
    <li className="grid grid-cols-[38px_minmax(0,1fr)] sm:grid-cols-[52px_minmax(0,1fr)] gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span aria-hidden
              className={`w-[38px] h-[38px] sm:w-11 sm:h-11 rounded-[14px] border-2 grid place-items-center shrink-0
                ${feita ? 'bg-[var(--teal)] border-[var(--teal)]' : 'bg-[var(--card)] border-[var(--teal)]'}`}>
          {feita ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.6 9.4 7 12.8 14.4 5.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : <span className="w-[11px] h-[11px] rounded-full bg-[var(--teal)]" />}
        </span>
        <span aria-hidden className="flex-1 w-[2px] min-h-[26px]"
              style={{ background: feita ? 'var(--teal)' : 'var(--line)' }} />
      </div>
      <div className="pb-6 sm:pb-[26px]">
        <div className={`relative rounded-[18px] border p-5 sm:px-6 sm:py-[22px] transition-shadow duration-[250ms]
                         hover:shadow-[var(--sh)] bg-[var(--card)] ${feita ? 'border-line' : 'border-[var(--teal)]'}`}>
          <div className="flex items-center gap-3.5 flex-wrap mb-2.5">
            <span className="font-ui text-[12.5px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)]">
              {feita ? tx.tagConcluido : tx.comeceAqui}
            </span>
            <span className="font-ui text-[13.5px] text-ink-muted">{tx.aula0Rotulo}</span>
          </div>
          <p className="font-ui text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-muted m-0 mb-1">
            {ETAPA_AULA0}
          </p>
          <p className="font-display text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] mb-2 text-ink">
            <Link href="/inicio" className="after:absolute after:inset-0 after:rounded-[18px] after:content-['']">
              {tx.comoFunciona}
            </Link>
          </p>
          <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted m-0">
            {feita
              ? tx.aula0Feita
              : tx.aula0Falta}
          </p>
        </div>
      </div>
    </li>
  );
}

function moduloCompleto(state: Parameters<typeof isLessonComplete>[0], m: CourseModule): boolean {
  const itens = itensDoModulo(m).every(i => isLessonComplete(state, i.id));
  if (m.letterIds.length === 0) return itens && (state.lessons[m.id]?.stagesDone.length ?? 0) >= 3;
  const letras = itens;
  const cp = m.checkpoint ? !!state.checkpoints[m.checkpoint.id]?.passedAt : true;
  return letras && cp;
}

function Trecho({ module: m, estado, ultimo, novo = false }: {
  module: CourseModule; estado: Estado; ultimo: boolean;
  /** O lugar acabou de abrir: o cartão se anuncia (ver lib/desbloqueio.ts). */
  novo?: boolean;
}) {
  const p = useProgress();
  const cartao = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!novo) return;
    const calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    cartao.current?.scrollIntoView({ block: 'center', behavior: calmo ? 'auto' : 'smooth' });
  }, [novo]);
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
  /* As letras todas feitas e o checkpoint ainda não (27/10/2026): o cartão
     dizia "Em andamento" ao lado de 100%, e levava de volta à primeira
     letra. Agora diz o que falta e leva até lá. */
  const faltaCheckpoint = estado === 'agora' && !extra && !pendente && !!m.checkpoint
    && !p.state.checkpoints[m.checkpoint.id]?.passedAt;
  const destino = faltaCheckpoint ? `/checkpoint/${m.n}`
    : pendente ? pendente.href : extra ? `/modulo/${m.n}` : itens[0]?.href ?? `/modulo/${m.n}`;
  /* A próxima letra a estudar, a única que ganha o anel (`hf-chama`). */
  const proxima = estado === 'agora' ? pendente?.id ?? null : null;

  const TAG = {
    feito: { texto: tx.tagConcluido, cor: 'text-[var(--teal-ink)]' },
    agora: { texto: faltaCheckpoint ? tx.faltaCheckpoint : tx.emAndamento, cor: 'text-[var(--teal-ink)]' },
    /* `--locked` e não um cinza escrito à mão: o cinza literal era o mesmo
       nos dois temas, e no escuro ele nem é o cinza certo nem acompanha o
       alto contraste. */
    /* "Em breve" sugeria conteúdo ainda não lançado, quando o módulo só
       espera o anterior (auditoria de 01/10/2026, VIS-010). */
    adiante: { texto: m.n === 1 ? tx.abreDepoisAula0 : fmt(tx.abreDepoisModulo, { n: m.n - 1 }), cor: 'text-ink-muted' }  // texto, não controle: 4,5:1 (UX-009)
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
          ref={cartao}
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
          {/* O lugar do módulo (28/10/2026, a aventura ilustrada). Só o
              módulo em que o aluno está se mexe; o trancado aparece
              desbotado, e o concluído ganha o selo. O desenho é decorativo:
              o que ele diz está no texto do cartão. */}
          {m.n >= 1 && m.n <= 7 && (
            <div className={`relative -mx-5 -mt-5 sm:-mx-6 sm:-mt-[22px] mb-4 h-[104px] sm:h-[132px]
                            overflow-hidden rounded-t-[17px] border-b border-line ${novo ? 'hf-desbloqueio' : ''}`}>
              <Cenario n={m.n as IdDoCenario} vivo={estado === 'agora'} trancado={estado === 'adiante'} />
              {/* O lugar que acabou de abrir: o cadeado balança e some, a cor
                  volta ao desenho, a Yael chega pulando e o selo aparece. Só
                  transform, opacidade e filtro, uma vez; com "reduzir
                  movimento" tudo já nasce no estado final. */}
              {novo && (
                <>
                  <span aria-hidden className="hf-cadeado-abre absolute inset-0 grid place-items-center">
                    <span className="grid place-items-center w-14 h-14 rounded-full bg-[var(--card)] shadow-[var(--sh)]">
                      <IconeCadeado size={26} />
                    </span>
                  </span>
                  <span aria-hidden className="hf-yael-chega absolute right-2 bottom-0 w-[64px] sm:w-[76px]">
                    <Yael pulando />
                  </span>
                  <span className="hf-selo-novo absolute right-3 top-3 rounded-full bg-[var(--gold-solid)] px-3 py-1
                                   font-ui text-[12.5px] font-bold text-white shadow-[var(--sh)]">
                    {tx.lugarNovo}
                  </span>
                  <span className="sr-only" role="status">{tx.lugarNovoAberto(LUGAR[m.n as IdDoCenario].pt)}</span>
                </>
              )}
              {/* O nome do lugar é uma palavra que o aluno já lê neste módulo. */}
              <span className="absolute left-3 bottom-2.5 inline-flex items-baseline gap-2 rounded-full
                               bg-[var(--card)]/92 pl-3 pr-3 py-0.5 shadow-[var(--sh)]">
                <span className="text-[17px] text-ink"><He size="inline">{LUGAR[m.n as IdDoCenario].he}</He></span>
                <span className="font-ui text-[12px] text-ink-muted">
                  {LUGAR[m.n as IdDoCenario].translit} · {LUGAR[m.n as IdDoCenario].pt}
                </span>
              </span>
              {estado === 'feito' && (
                <span aria-hidden
                      className="absolute right-3 top-3 grid place-items-center w-9 h-9 rounded-full
                                 bg-[var(--gold-solid)] text-white text-[17px] font-bold shadow-[var(--sh)]">✓</span>
              )}
            </div>
          )}
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
              {tx.moduloLicoes(m.n, m.lessons.length)}
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

          {ETAPA_DO_MODULO[m.n] && (
            <p className="font-ui text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-muted m-0 mb-1">
              {ETAPA_DO_MODULO[m.n]}
            </p>
          )}
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
            /* As letras do módulo da direita para a esquerda, na ordem em
               que se aprendem (11/10/2026): `dir` no contêiner, e a ordem do
               HTML continua a do curso, para o teclado e o leitor de tela. */
            <div dir="rtl" className="flex flex-wrap gap-2">
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
                const ehAProxima = p.ready && L.id === proxima && liberada;
                const estadoDaLetra = feita ? tx.letraConcluida
                  : comecada ? fmt(tx.letraEtapas, { n: etapasFeitas, total: STAGE_COUNT })
                  : bloqueada ? tx.letraBloqueada : ehAProxima ? tx.letraProxima : '';
                const classe = `relative z-[1] min-w-[46px] px-1.5 h-[50px] rounded-[12px] border grid place-items-center gap-px
                  ${liberada ? 'hover:shadow-[var(--sh)] hover:border-[var(--teal)] transition-[box-shadow,border-color]' : ''}
                  ${feita ? 'bg-[var(--teal-soft)] border-[var(--edge-teal)]'
                    : comecada || ehAProxima ? 'bg-[var(--card)] border-[var(--teal)] border-2'
                    : 'bg-[var(--sand)] border-line'}
                  ${ehAProxima ? 'hf-chama' : ''}`;
                const miolo = (
                  <>
                    {bloqueada && (
                      <span aria-hidden className="absolute -top-2 -right-2 leading-none text-ink-muted bg-[var(--card)] rounded-full"><IconeCadeado size={14} /></span>
                    )}
                    {/* A letra concluída leva um selo, e não só outra cor: dá
                        para ver de relance, inclusive sem distinguir cores. */}
                    {feita && (
                      <span aria-hidden className="absolute -top-1.5 -right-1.5 w-[17px] h-[17px] rounded-full bg-[var(--teal)]
                                                  grid place-items-center shadow-[0_1px_2px_rgba(0,0,0,.18)]">
                        <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                          <path d="M3.6 9.4 7 12.8 14.4 5.4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
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
                        aria-current={ehAProxima ? 'step' : undefined}
                        title={`${L.nome}${estadoDaLetra}`}
                        aria-label={`${fmt(tx.abrirLicao, { nome: L.nome })}${estadoDaLetra}`}>
                    {miolo}
                  </Link>
                ) : (
                  <span key={L.id} className={classe} title={`${L.nome}${estadoDaLetra}`}
                        aria-label={`${L.nome}${estadoDaLetra}`}>
                    {miolo}
                  </span>
                );
              })}
              {/* O checkpoint do módulo, a última peça do caminho (28/10/2026,
                  pedido do dono). Aprovado: dourado, com a melhor nota. Com as
                  letras feitas: o anel da vez. Antes disso fica quieto, mas
                  abre - o checkpoint nunca foi trancado (ver ModuleClient). */}
              {m.checkpoint && estado !== 'adiante' && (() => {
                const cp = p.state.checkpoints[m.checkpoint!.id];
                const aprovado = !!cp?.passedAt;
                const pronto = !aprovado && !pendente;
                const estadoDoCp = aprovado
                  ? tx.checkpointAprovado(cp?.best != null ? Math.round(cp.best * 100) : null)
                  : pronto ? tx.checkpointPronto : tx.checkpointDepois;
                return (
                  <Link href={`/checkpoint/${m.n}`}
                        title={`${tx.checkpointRotulo}${estadoDoCp}`}
                        aria-label={`${tx.abrirCheckpoint(m.n)}${estadoDoCp}`}
                        className={`relative z-[1] min-w-[58px] px-1.5 h-[50px] rounded-[12px] border grid place-items-center gap-px
                                    hover:shadow-[var(--sh)] transition-[box-shadow,border-color]
                                    ${aprovado ? 'bg-[var(--gold-soft)] border-[var(--gold)]'
                                      : pronto ? 'bg-[var(--card)] border-[var(--gold)] border-2 hf-chama'
                                      : 'bg-[var(--sand)] border-line border-dashed'}`}>
                    {aprovado && (
                      <span aria-hidden className="absolute -top-1.5 -right-1.5 w-[17px] h-[17px] rounded-full bg-[var(--gold-solid)]
                                                  grid place-items-center text-white text-[10px] font-bold shadow-[0_1px_2px_rgba(0,0,0,.18)]">✓</span>
                    )}
                    <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none"
                         className={aprovado || pronto ? 'text-[var(--gold)]' : 'text-ink-muted'}>
                      <path d="M5 17V3.5M5 4h9l-2 3 2 3H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-ui text-[9.5px] tracking-[.04em] text-ink-muted">
                      {aprovado && cp?.best != null ? `${Math.round(cp.best * 100)}%` : tx.checkpointRotulo}
                    </span>
                  </Link>
                );
              })()}
            </div>
          )}
          {m.milestonePt && (
            <p className={`relative mt-3 font-ui text-[14px] leading-relaxed m-0
                           ${estado === 'feito' ? 'text-[var(--teal-ink)]' : 'text-ink-muted'}`}>
              <strong className="font-semibold">{estado === 'feito' ? tx.metaAlcancada : tx.meta}</strong>
              <Prose text={m.milestonePt} />
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/* ── o fim do caminho: Meu desafio final (12/10/2026) ────────────────────
   Abre com as lições das 22 letras concluídas, que é a régua do exame
   (FinalChallengeClient); feito quando o exame foi aprovado. */
function TrechoFinal() {
  const p = useProgress();
  const ids = allLetters().map(l => l.id);
  const aprovado = !!p.state.finalChallenge?.passedAt;
  const aberto = ids.every(id => isLessonMastered(p.state, id));
  const estado: Estado = aprovado ? 'feito' : aberto ? 'agora' : 'adiante';
  return (
    <li className="grid grid-cols-[38px_minmax(0,1fr)] sm:grid-cols-[52px_minmax(0,1fr)] gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span aria-hidden
              className={`w-[38px] h-[38px] sm:w-11 sm:h-11 rounded-[14px] border-2 grid place-items-center shrink-0
                ${estado === 'feito' ? 'bg-[var(--teal)] border-[var(--teal)]'
                  : estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]' : 'bg-[var(--sand)] border-line'}`}>
          {estado === 'feito' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.6 9.4 7 12.8 14.4 5.4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : estado === 'agora' ? <span className="w-[11px] h-[11px] rounded-full bg-[var(--teal)]" /> : null}
        </span>
      </div>
      <div className="pb-2">
        <div className={`relative rounded-[18px] border p-5 sm:px-6 sm:py-[22px] transition-shadow duration-[250ms] hover:shadow-[var(--sh)]
          ${estado === 'agora' ? 'bg-[var(--card)] border-[var(--teal)]'
            : estado === 'adiante' ? 'bg-[var(--paper)] border-line border-dashed' : 'bg-[var(--card)] border-line'}`}>
          <p className="font-ui text-[12.5px] font-bold uppercase tracking-[.1em] text-[var(--teal-ink)] m-0 mb-2">
            {estado === 'feito' ? tx.aprovado : estado === 'agora' ? tx.disponivel : tx.abreQuando}
          </p>
          <p className="font-display text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] mb-2 text-ink">
            <Link href={estado === 'feito' ? '/certificado' : '/desafio-final'}
                  className="after:absolute after:inset-0 after:rounded-[18px] after:content-['']">
              {ETAPA_FINAL}
            </Link>
          </p>
          <p className="font-ui text-[14.5px] leading-[1.5] text-ink-muted m-0">
            {estado === 'feito'
              ? tx.finalFeito
              : tx.finalFalta}
          </p>
        </div>
      </div>
    </li>
  );
}

export function CourseMapNotFound() {
  return <p className="font-ui text-[15px] text-ink-muted">{tx.naoEncontrado}</p>;
}
