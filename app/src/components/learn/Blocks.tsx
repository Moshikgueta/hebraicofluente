'use client';

/* The teaching blocks: the pieces of a lesson that present rather than test. */

import { useState } from 'react';
import { He, HeSeq } from '@/components/hebrew/He';
import { Prose } from '@/components/hebrew/Prose';
import { somPt } from '@/lib/som-pt';
import { AudioButton } from './AudioButton';
import { GravacaoDoProfessor } from './GravacaoDoProfessor';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Letter, Scene, Syllable, Word } from '@/lib/content';
import { supportLabel, supportLevel } from '@/lib/state/rules';
import { useProgress } from '@/lib/state/store';
import { REGRA_CURSIVA } from '@/lib/cursiva';
import { SELOS, type Selo } from '@/lib/selos';

/* ── o cabeçalho de um bloco com selo ──────────────────────────────────────
   Um componente, e não cinco títulos escritos à mão: o símbolo e o texto
   vêm de lib/selos.ts, e é assim que ⚠️ continua querendo dizer uma coisa
   só. O `aria-hidden` no emoji é deliberado - um leitor de tela anunciando
   "emoji de livro aberto Curiosidade" atrapalha em vez de informar. */
export function TituloComSelo({ selo, className = '' }: {
  selo: Selo;
  className?: string;
}) {
  const { emoji, titulo } = SELOS[selo];
  return (
    <h3 className={`font-ui text-[13px] font-bold uppercase tracking-[.07em] ${className}`}>
      <span aria-hidden>{emoji} </span>{titulo}
    </h3>
  );
}

/* ── a regra da cursiva, em duas linhas ─────────────────────────
   Aparece no módulo 0, onde o aluno encontra a ideia, e na etapa "Escrever"
   de cada uma das 22 lições, onde ela vira ação. Um componente, e não duas
   cópias do mesmo markup: texto compartilhado com a marcação duplicada é a
   mesma drift de sempre, só que mais difícil de ver. */
export function RegraCursiva() {
  return (
    <div className="rounded-[var(--r-md)] border border-[color:var(--edge-teal)]
                    bg-[var(--teal-soft)] p-4 grid sm:grid-cols-2 gap-3">
      {[['Para ler', REGRA_CURSIVA.ler], ['Para escrever à mão', REGRA_CURSIVA.escrever]].map(
        ([o_que, forma]) => (
          <p key={o_que} className="font-ui text-[15px] leading-snug text-[var(--teal-ink)]">
            <span className="font-semibold">{o_que}</span>
            <span aria-hidden> → </span>
            <span className="font-bold">{forma}</span>
          </p>
        ))}
    </div>
  );
}

/* ── the Brazilian interference note ─────────────────────────────────────
   Not a generic study tip: every letter carries the specific way Portuguese
   pushes a learner toward the wrong sound. It is the clearest thing this
   course has that a generic app does not, so it gets a strong treatment. */
export function BrazilianTip({ mistake }: { mistake: Letter['brazilianMistake'] }) {
  return (
    <Card tone="amber" className="p-5 sm:p-6">
      {/* ⚠️, e não 🇧🇷: esta caixa e o bloco "Para quem fala português"
          usavam a mesma bandeira, e um selo que marca duas coisas não
          marca nenhuma. Aqui o assunto é o erro que vai acontecer; lá é a
          comparação entre os dois idiomas. */}
      <div className="mb-3">
        <TituloComSelo selo="erro" className="text-[var(--amber)] text-[15px]" />
      </div>
      <dl className="grid gap-3">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start">
          <dt className="font-ui text-xs font-semibold text-ink-muted pt-[3px] uppercase tracking-wider">Sai</dt>
          <dd className="text-[15px] leading-relaxed text-ink-body"><Prose text={mistake.wrong} /></dd>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start">
          <dt className="font-ui text-xs font-semibold text-[var(--teal-ink)] pt-[3px] uppercase tracking-wider">Certo</dt>
          <dd className="text-[15px] leading-relaxed text-ink"><Prose text={mistake.right} /></dd>
        </div>
      </dl>
      <p className="mt-3 pt-3 border-t border-[color:var(--line-soft)] text-[13.5px] leading-relaxed text-ink-muted">
        <Prose text={mistake.why} />
      </p>
    </Card>
  );
}

/* Prose moved to components/hebrew/Prose.tsx, so public pages can use it
   without this module; re-exported here for the lesson screens. */
export { Prose };

/* ── syllables ──────────────────────────────────────────────────────────
   Learning mode, explicitly: the reading is on screen. The testing version of
   the same content is a generated exercise, and keeping the two apart is what
   the brief means by "do not show every answer immediately". */
export function SyllableTrainer({ letter }: { letter: Letter }) {
  const [active, setActive] = useState<number | null>(null);
  const shown: Syllable[] = letter.syllables;

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shown.map((s, i) => (
          <button
            key={s.he}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            aria-expanded={active === i}
            className={`group rounded-[var(--r-lg)] border p-4 text-center transition-all
              duration-[var(--dur)] ease-[var(--ease)] min-h-[108px]
              flex flex-col items-center justify-center gap-1.5
              ${active === i
                ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]'
                : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}
          >
            <He size="lg">{s.he}</He>
            <span className="font-ui text-[15px] font-semibold text-[var(--accent)] tracking-wide">
              {s.translit || '-'}
            </span>
            {/* A instrução vive uma vez, acima da grade. Repetida em baixo de
                cada uma das seis sílabas ela virava ruído - seis linhas de
                texto idêntico numa tela em que o assunto é a letra. */}
            {active === i && (
              <span className="font-ui text-[12px] text-ink-muted leading-snug">
                {s.ptApprox}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <AudioButton audioId={letter.audioId} label={`Ouvir ${letter.namePt}`} slow />
        <p className="font-ui text-[13px] text-ink-muted">
          Leia cada sílaba em voz alta três vezes. É a repetição falada que fixa o som.
        </p>
      </div>
    </div>
  );
}

/* ── word discovery ─────────────────────────────────────────────────────
   Hebrew first, always. The learner attempts the decoding before any support
   appears, and the support arrives in two steps so that "como se lê" and "o
   que quer dizer" are separate acts. */
export function WordReveal({ word, mark }: { word: Word; mark?: string | null }) {
  const { mastered } = useProgress();
  const level = supportLevel(mastered);
  /* Early on the reading is simply printed: a learner who cannot decode
     anything yet gains nothing from a hidden answer. Later it costs a tap, and
     at the far end it has to be asked for. */
  const [step, setStep] = useState<0 | 1 | 2>(level === 'always' ? 1 : 0);

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 min-h-[64px]">
        <He size="xl" mark={mark ?? null}>{word.he}</He>
        <AudioButton audioId={word.audioId} label="Ouvir" size="sm" />
      </div>

      <div className="grid gap-2" aria-live="polite">
        {step >= 1 ? (
          <p className="font-ui text-[17px] font-semibold text-[var(--accent)] tracking-wide">
            {word.translit}
          </p>
        ) : null}
        {step >= 2 ? (
          <p className="text-[17px] text-ink">{word.pt}</p>
        ) : null}
      </div>

      {step < 2 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStep(s => (s === 0 ? 1 : 2))}
          className="self-start"
        >
          {step === 0 ? supportLabel(level) : 'Mostrar significado'}
        </Button>
      )}
    </Card>
  );
}

/* ── the bridge words ───────────────────────────────────────────────────
   The teacher's-guide device: meet the letter inside a loanword you already
   know. Recognition only - these are full of letters not yet taught, and the
   copy says so, because a learner who tries to read them and fails learns the
   wrong lesson. */
export function BridgeWords({ letter }: { letter: Letter }) {
  if (!letter.bridgeWords.length) return null;
  return (
    <Card tone="wash" className="p-5 sm:p-6">
      <Badge tone="accent">Você já conhece estas palavras</Badge>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-body">
        O hebraico moderno importou centenas de palavras. Você já sabe o que elas
        querem dizer - só nunca as viu escritas assim. Ache o{' '}
        <He size="inline">{letter.letter}</He> dentro de cada uma.
      </p>
      <ul className="mt-4 grid gap-2">
        {letter.bridgeWords.map(b => (
          <li key={b.he}
              className="flex items-center justify-between gap-4 rounded-[var(--r-md)]
                         bg-surface px-4 py-3 border border-[color:var(--line-soft)]">
            <He size="word" mark={letter.letter}>{b.he}</He>
            <span className="flex items-center gap-3">
              <span className="font-ui text-[14px] text-ink-muted text-right">{b.pt}</span>
              {/* A pronúncia hebraica, quando gravada: sem gravação, nada. */}
              <AudioButton audioId={b.audioId} size="sm" label="" ariaLabel={`Ouvir ${b.pt} em hebraico`} />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <GravacaoDoProfessor id="international-words-pronunciation"
          textoPt="O acento e as vogais são os do hebraico, não os do português. Ouça antes de ler." />
      </div>
      <p className="mt-3 font-ui text-[12.5px] text-ink-muted">
        Não tente ler a palavra inteira ainda - ela usa letras que você ainda não aprendeu.
      </p>
    </Card>
  );
}

/* ── Hebrew in the world ────────────────────────────────────────────────
   Only ever built from words the learner can already decode, so this reads as
   a reward rather than a wall. */
const SCENE_ICON: Record<string, string> = {
  placa: '▭', rotulo: '▤', cardapio: '▥', recibo: '▦', mensagem: '▣',
  jornal: '▨', etiqueta: '▧', anuncio: '▩', vitrine: '▢', conversa: '❝'
};

export function RealWorldHebrew({ scene }: { scene: Scene }) {
  const { mastered } = useProgress();
  const level = supportLevel(mastered);
  const [shown, setShown] = useState(false);
  const word: Word = {
    he: scene.he, translit: scene.translit, pt: scene.pt, use: null, audioId: scene.audioId
  };
  const contextPt = scene.contextPt;
  const sceneLabel = scene.labelPt;
  const icon = SCENE_ICON[scene.sceneType] ?? '▭';
  return (
    <Card tone="surface" className="overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[color:var(--line-soft)]">
        <span aria-hidden>🇮🇱</span>
        <h3 className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink-muted">
          Hebraico no mundo real
        </h3>
        <span aria-hidden className="ml-auto text-ink-muted">{icon}</span>
      </div>
      <div className="p-5 sm:p-6 grid gap-4">
        <p className="font-ui text-[13.5px] text-ink-muted">{sceneLabel}</p>
        {/* The word alone, big, on a plain surface - the closest a screen gets
            to seeing it on a sign. */}
        <div className="rounded-[var(--r-md)] bg-surface-2 py-9 px-5 flex items-center justify-center">
          <He size="display">{word.he}</He>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[15px] leading-relaxed text-ink-body flex-1 min-w-[16ch]">
            <Prose text={contextPt} />
          </p>
          <AudioButton audioId={word.audioId} label="Ouvir" size="sm" />
        </div>
        {shown ? (
          <div className="grid gap-1 animate-rise border-t border-[color:var(--line-soft)] pt-4">
            <p className="font-ui text-[16px] font-semibold text-[var(--accent)]">{word.translit}</p>
            <p className="text-[16px] text-ink">{word.pt}</p>
          </div>
        ) : (
          <Button variant="secondary" size="sm" className="self-start" onClick={() => setShown(true)}>
            {level === 'on-request' ? 'Você consegue ler? Conferir' : 'Você consegue ler? Mostrar resposta'}
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ── o workbook impresso saiu daqui, e o motivo fica escrito ────────────
   Aqui morava `WorkbookLink`, um cartão que aparecia cinco vezes dentro do
   curso - na lição, no módulo, no checkpoint e nos extras - dizendo «quer
   praticar à mão? Workbook impresso, páginas N-M», e levando a uma página que
   descrevia um livro de 331 páginas.

   Esse livro não existe para o aluno. A própria página /workbook admitia
   isso no rodapé: «o arquivo ainda não está publicado nesta versão». Ou
   seja, o curso apontava cinco vezes para uma porta que não abre, e o aviso
   de que ela não abre só aparecia depois do clique.

   Prometer material que não se entrega é o defeito mais caro que uma página
   de curso pode ter, e ele não melhora por estar escrito em letra pequena
   três telas adiante. Então saiu inteiro: a página, os cinco cartões e o
   evento de analytics.

   Em 26/09/2026 o livro em PDF saiu do projeto inteiro, com o gerador e o
   campo `workbookPages`: o curso é a plataforma. */

/* ── a letter, big ──────────────────────────────────────────────────────── */
export function HebrewLetterCard({ letter }: { letter: Letter }) {
  return (
    <div className="grid sm:grid-cols-[1fr_auto] items-center gap-6">
      <div className="grid gap-3">
        <div className="flex items-baseline gap-4 flex-wrap">
          <He size="hero">{letter.letter}</He>
          {letter.finalForm && (
            <span className="flex items-baseline gap-2">
              <He size="xl" dim>{letter.finalForm}</He>
              <span className="font-ui text-[12px] text-ink-muted">no fim da palavra</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[28px] sm:text-[34px] font-bold">{letter.namePt}</h1>
          {/* O som em português; o IPA fica como detalhe (CONT-003). */}
          <span className="font-ui text-[17px] text-[var(--accent)] font-semibold">{somPt(letter.sound)}</span>
          <span className="font-ui text-[12px] text-ink-muted" title="Transcrição fonética (IPA)">
            {letter.sound.startsWith('/') ? `IPA ${letter.sound}` : null}
          </span>
          <He size="word" dim>{letter.nameHe}</He>
        </div>
      </div>
      <div className="grid gap-2 justify-items-start sm:justify-items-end">
        <AudioButton audioId={letter.audioId} label="Ouvir a letra" slow />
      </div>
    </div>
  );
}

/* ── the sequence strip used all over the lesson ─────────────────────────── */
export function ReadAloudRow({ items, label }: { items: string[]; label: string }) {
  return (
    <Card className="p-5 grid gap-3">
      <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">{label}</p>
      <HeSeq items={items} size="word" />
    </Card>
  );
}
