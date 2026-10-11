'use client';

/* A Fixação guiada: a etapa 4 de toda lição do alfabeto (11/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui a etapa 4 ("Praticar") e a etapa 5 ("Fixação") eram a MESMA
 * coisa: dois blocos de perguntas de múltipla escolha, dos mesmos geradores,
 * com sementes diferentes. Nas lições de som era literalmente a mesma função
 * chamada duas vezes. O aluno fazia o teste duas vezes seguidas e a primeira
 * não ensinava nada que a segunda não cobrasse.
 *
 * Agora as duas etapas têm papéis diferentes:
 *
 *   · FIXAÇÃO (aqui) é aprender e lembrar, com apoio: ouvir e repetir,
 *     observar a forma, ligar a letra ao som com dica, a memória visual e a
 *     comparação com as letras de antes. Não tem nota, não tem erro que
 *     conte: quem escolhe errado recebe uma dica e tenta de novo.
 *   · EXERCÍCIOS (etapa 5) é aplicar sozinho, com nota: o mini-teste de
 *     sempre, que decide se a letra está dominada e se a próxima abre.
 *
 * O componente não sabe de letras nem de sons: recebe um `AlvoFixacao`
 * montado pela lição (de letra ou de som) e anda por cinco passos curtos,
 * um por tela. Dois a quatro minutos.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AudioButton } from '@/components/learn/AudioButton';
import { Prose } from '@/components/learn/Blocks';
import { rng, shuffled } from '@/lib/engine/rng';

export type PalavraDaFixacao = { he: string; translit: string; pt: string; audioId?: string | null };

export type ComparacaoDaFixacao = {
  glifo: string;
  nome: string;
  som: string;
  audioId?: string | null;
  /** O traço que separa as duas, quando o curso tem essa frase. */
  notaPt?: string | null;
};

export type AlvoFixacao = {
  /** Uma chave estável, para a ordem das alternativas não mudar a cada render. */
  id: string;
  glifo: string;
  /** A forma final, quando existe. */
  final?: string | null;
  nome: string;
  /** O som como o curso o escreve: "/m/", "(mudo)". */
  som: string;
  audioId?: string | null;
  /** A frase que fica, se tudo o mais sumir (o "Lembre" da lição). */
  lembrePt: string;
  /** Mostrar a cursiva no passo de observar. */
  cursiva: boolean;
  /** Duas ou três palavras curtas, já legíveis neste ponto do curso. */
  palavras: PalavraDaFixacao[];
  /** Os glifos destacados dentro das palavras (a letra e a final). */
  destaque: string[];
  /** Letras anteriores ou parecidas, para a revisão rápida. Pode ser vazio. */
  comparar: ComparacaoDaFixacao[];
  /** Outros glifos, para a memória visual. Pelo menos dois. */
  outrosGlifos: string[];
  /** Outros sons, para "letra + som". Pelo menos dois. */
  outrosSons: string[];
};

export type Passo = 'ouvir' | 'observar' | 'som' | 'memoria' | 'revisao';

const NOMES: Record<Passo, string> = {
  ouvir: 'Ouça e repita',
  observar: 'Observe e reconheça',
  som: 'Letra e som',
  memoria: 'Memória visual',
  revisao: 'Revisão rápida'
};

const TODOS: readonly Passo[] = ['ouvir', 'observar', 'som', 'memoria', 'revisao'];
const NUMERO = ['zero', 'um', 'Dois', 'Três', 'Quatro', 'Cinco'];

export function FixacaoGuiada({ alvo, onDone, rotuloFim = 'Ir para os exercícios', so, rotuloDoGrupo }: {
  alvo: AlvoFixacao;
  onDone: () => void;
  rotuloFim?: string;
  /** Só estes passos, na ordem de sempre. A lição dos três pares usa três. */
  so?: readonly Passo[];
  /** "Par 1 de 3", quando a etapa percorre mais de um alvo. */
  rotuloDoGrupo?: string;
}) {
  const passos = useMemo<Passo[]>(
    () => TODOS.filter(p => (!so || so.includes(p)) && (p !== 'revisao' || alvo.comparar.length > 0)),
    [alvo, so]
  );
  const [i, setI] = useState(0);
  const passo = passos[i]!;
  const ultimo = i === passos.length - 1;
  const titulo = useRef<HTMLHeadingElement | null>(null);
  const primeiro = useRef(true);
  /* Trocar de passo leva o foco para o título do passo novo: quem usa
     teclado ou leitor de tela não fica preso no botão que sumiu. */
  useEffect(() => {
    if (primeiro.current) { primeiro.current = false; return; }
    titulo.current?.focus();
  }, [i]);

  const seguir = () => (ultimo ? onDone() : setI(n => n + 1));

  return (
    <div className="grid gap-5">
      <Card tone="wash" className="p-5 grid gap-1.5">
        <p className="font-display text-[17px] font-semibold text-ink">
          Fixação: aprender e lembrar, sem nota{rotuloDoGrupo ? ` · ${rotuloDoGrupo}` : ''}
        </p>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {NUMERO[passos.length] ?? passos.length} passos curtos com {alvo.nome}. Aqui não existe erro que conte: se escolher
          errado, aparece uma dica e você tenta de novo. Os exercícios com nota vêm depois.
        </p>
      </Card>

      <ol className="flex items-center gap-1.5 list-none p-0 m-0" aria-label="Passos da fixação">
        {passos.map((p, k) => (
          <li key={p} className="flex-1">
            <span aria-current={k === i ? 'step' : undefined}
                  className={`block h-1.5 rounded-full ${k < i ? 'bg-[var(--green)]' : k === i ? 'bg-[var(--accent)]' : 'bg-surface-2'}`} />
            <span className="sr-only">{`Passo ${k + 1} de ${passos.length}: ${NOMES[p]}`}</span>
          </li>
        ))}
      </ol>

      <Card className="p-6 sm:p-8 grid gap-5">
        <h2 ref={titulo} tabIndex={-1} className="text-[20px] font-semibold outline-none">
          <span className="font-ui text-[13px] text-ink-muted font-normal tabular-nums mr-2">
            {i + 1}/{passos.length}
          </span>
          {NOMES[passo]}
        </h2>
        {passo === 'ouvir' && <Ouvir alvo={alvo} />}
        {passo === 'observar' && <Observar alvo={alvo} />}
        {passo === 'som' && <LetraESom key={alvo.id} alvo={alvo} />}
        {passo === 'memoria' && <Memoria key={alvo.id} alvo={alvo} />}
        {passo === 'revisao' && <Revisao alvo={alvo} />}
      </Card>

      <div className="grid sm:grid-cols-[auto_1fr] gap-2">
        {i > 0 && (
          <Button variant="ghost" onClick={() => setI(n => n - 1)}>Voltar</Button>
        )}
        <Button size="lg" onClick={seguir} full>
          {ultimo ? rotuloFim : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}

/* ── 1 · ouça e repita ──────────────────────────────────────────────────── */
function Ouvir({ alvo }: { alvo: AlvoFixacao }) {
  return (
    <div className="grid gap-4">
      <p className="text-[15.5px] leading-relaxed text-ink-body">
        Ouça a letra e cada palavra, e repita em voz alta. Em cada palavra, a letra
        {' '}{alvo.nome} está destacada.
      </p>
      <div className="flex items-center justify-center gap-4 rounded-[var(--r-md)] bg-surface-2 py-6">
        <He size="xl">{alvo.glifo}</He>
        <AudioButton audioId={alvo.audioId ?? null} ariaLabel={`Ouvir ${alvo.nome}`} />
      </div>
      <ul className="grid gap-2.5 list-none p-0 m-0">
        {alvo.palavras.map(w => (
          <li key={w.he} className="flex items-center justify-between gap-3 rounded-[var(--r-md)] border border-line px-4 py-3">
            <div className="grid min-w-0">
              <span className="font-ui text-[14px] text-ink-muted">{w.translit} · {w.pt}</span>
            </div>
            <div className="flex items-center gap-3">
              <He size="word" marks={alvo.destaque}>{w.he}</He>
              <AudioButton audioId={w.audioId ?? null} size="sm" ariaLabel={`Ouvir ${w.translit}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 2 · observe e reconheça ────────────────────────────────────────────── */
function Observar({ alvo }: { alvo: AlvoFixacao }) {
  const formas: { rotulo: string; glifo: string; cursiva: boolean }[] = [
    { rotulo: 'impressa', glifo: alvo.glifo, cursiva: false },
    ...(alvo.cursiva ? [{ rotulo: 'cursiva (à mão)', glifo: alvo.glifo, cursiva: true }] : []),
    ...(alvo.final ? [{ rotulo: 'no fim da palavra', glifo: alvo.final, cursiva: false }] : [])
  ];
  return (
    <div className="grid gap-4">
      <p className="text-[15.5px] leading-relaxed text-ink-body">
        A mesma letra, nas formas em que você vai encontrá-la. Olhe com calma.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none p-0 m-0">
        {formas.map(f => (
          <li key={f.rotulo} className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-2 justify-items-center">
            <He size="xl" cursive={f.cursiva}>{f.glifo}</He>
            <span className="font-ui text-[13px] text-ink-muted text-center">{f.rotulo}</span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] leading-relaxed text-ink-body rounded-[var(--r-md)] border border-line px-4 py-3">
        <strong className="font-semibold text-ink">Repare: </strong>
        <Prose text={alvo.lembrePt} />
      </p>
    </div>
  );
}

/* ── 3 · letra e som, com dica ──────────────────────────────────────────── */
function LetraESom({ alvo }: { alvo: AlvoFixacao }) {
  const opcoes = useMemo(
    () => shuffled([alvo.som, ...alvo.outrosSons.filter(s => s !== alvo.som).slice(0, 2)], rng(`fix-som-${alvo.id}`)),
    [alvo]
  );
  const [errados, setErrados] = useState<string[]>([]);
  const [certo, setCerto] = useState(false);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-center gap-4 rounded-[var(--r-md)] bg-surface-2 py-6">
        <He size="xl">{alvo.glifo}</He>
        <AudioButton audioId={alvo.audioId ?? null} ariaLabel={`Ouvir ${alvo.nome}`} />
      </div>
      <p className="font-ui text-[15px] font-semibold text-ink">Que som esta letra faz?</p>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Escolha o som">
        {opcoes.map(o => {
          const errou = errados.includes(o);
          const acerto = certo && o === alvo.som;
          return (
            <button key={o} type="button" disabled={certo || errou}
                    onClick={() => (o === alvo.som ? setCerto(true) : setErrados(e => [...e, o]))}
                    className={`min-h-[48px] rounded-[var(--r-sm)] border font-ui text-[16px]
                      ${acerto ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                        : errou ? 'border-line bg-surface text-ink-muted opacity-60'
                        : 'border-line bg-surface hover:bg-surface-2 text-ink-body'}`}>
              {o}
            </button>
          );
        })}
      </div>
      <p role="status" className="font-ui text-[14.5px] leading-relaxed min-h-[1.5em]">
        {certo
          ? <span className="text-[var(--teal-ink)]">Isso: {alvo.nome} faz o som {alvo.som}.</span>
          : errados.length > 0
            ? <span className="text-[var(--gold-ink)]">Ainda não. Dica: <Prose text={alvo.lembrePt} /> Tente de novo.</span>
            : null}
      </p>
    </div>
  );
}

/* ── 4 · memória visual ─────────────────────────────────────────────────── */
const OLHAR_MS = 3000;

function Memoria({ alvo }: { alvo: AlvoFixacao }) {
  const [fase, setFase] = useState<'olhar' | 'escolher' | 'certo'>('olhar');
  const [errados, setErrados] = useState<string[]>([]);
  const [rodada, setRodada] = useState(0);
  useEffect(() => {
    if (fase !== 'olhar') return;
    const t = setTimeout(() => setFase('escolher'), OLHAR_MS);
    return () => clearTimeout(t);
  }, [fase, rodada]);
  const opcoes = useMemo(
    () => shuffled([alvo.glifo, ...alvo.outrosGlifos.filter(g => g !== alvo.glifo).slice(0, 3)], rng(`fix-mem-${alvo.id}-${rodada}`)),
    [alvo, rodada]
  );
  return (
    <div className="grid gap-4">
      {fase === 'olhar' ? (
        <>
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            Olhe bem para a letra. Em três segundos ela some, e você vai procurá-la.
          </p>
          <div className="grid place-items-center rounded-[var(--r-md)] bg-surface-2 py-8">
            <He size="display">{alvo.glifo}</He>
          </div>
          <Button variant="secondary" onClick={() => setFase('escolher')}>Já memorizei</Button>
        </>
      ) : (
        <>
          <p className="font-ui text-[15px] font-semibold text-ink">Qual era a letra?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Escolha a letra">
            {opcoes.map(g => {
              const errou = errados.includes(g);
              const acerto = fase === 'certo' && g === alvo.glifo;
              return (
                <button key={g} type="button" disabled={fase === 'certo' || errou}
                        onClick={() => (g === alvo.glifo ? setFase('certo') : setErrados(e => [...e, g]))}
                        className={`min-h-[72px] rounded-[var(--r-sm)] border grid place-items-center
                          ${acerto ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                            : errou ? 'border-line bg-surface opacity-50'
                            : 'border-line bg-surface hover:bg-surface-2'}`}>
                  <He size="lg">{g}</He>
                </button>
              );
            })}
          </div>
          <p role="status" className="font-ui text-[14.5px] leading-relaxed min-h-[1.5em]">
            {fase === 'certo'
              ? <span className="text-[var(--teal-ink)]">Isso, era {alvo.nome}.</span>
              : errados.length > 0
                ? <span className="text-[var(--gold-ink)]">Essa não. Quer ver a letra de novo?{' '}
                    <button type="button" className="underline min-h-[44px]"
                            onClick={() => { setErrados([]); setRodada(n => n + 1); setFase('olhar'); }}>
                      Ver de novo
                    </button>
                  </span>
                : null}
          </p>
        </>
      )}
    </div>
  );
}

/* ── 5 · revisão rápida ─────────────────────────────────────────────────── */
function Revisao({ alvo }: { alvo: AlvoFixacao }) {
  return (
    <div className="grid gap-4">
      <p className="text-[15.5px] leading-relaxed text-ink-body">
        A letra nova ao lado de letras que você já conhece. Ouça cada uma e compare.
      </p>
      <ul className="grid gap-3 list-none p-0 m-0">
        {[{ glifo: alvo.glifo, nome: alvo.nome, som: alvo.som, audioId: alvo.audioId, notaPt: null, nova: true },
          ...alvo.comparar.map(c => ({ ...c, nova: false }))].map(c => (
          <li key={c.glifo + c.nome}
              className={`flex items-center gap-4 rounded-[var(--r-md)] border px-4 py-3
                ${c.nova ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-line'}`}>
            <He size="lg">{c.glifo}</He>
            <div className="grid gap-0.5 min-w-0 flex-1">
              <span className="font-ui text-[15px] text-ink">
                <strong className="font-semibold">{c.nome}</strong> · {c.som}{c.nova ? ' · nova' : ''}
              </span>
              {c.notaPt && (
                <span className="font-ui text-[13.5px] leading-snug text-ink-muted"><Prose text={c.notaPt} /></span>
              )}
            </div>
            <AudioButton audioId={c.audioId ?? null} size="sm" ariaLabel={`Ouvir ${c.nome}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
