'use client';

/* O nome do aluno em hebraico: o editor, o cartão e a regra de quando abre.
 * ─────────────────────────────────────────────────────────────────────────
 * TRÊS DECISÕES.
 *
 * 1. Abre quando as letras do nome já foram ENSINADAS, e não antes. Mostrar a
 *    grafia de "Gabriel" na terceira lição seria mostrar ב, ר e ל antes da
 *    hora - a regra que o curso inteiro guarda. Antes disso, o cartão diz só
 *    QUANTAS letras faltam, nunca quais.
 *
 * 2. O editor é por TOQUE, e não pelo teclado. O aluno edita a sugestão
 *    tocando nas letras que já conhece (e o ׳ do gerech, para o J e o G de
 *    "Gisele"); nada de trocar de teclado para uma atividade de celebração.
 *
 * 3. Nada é gravado sem o aluno CONFIRMAR a grafia. Nome tem mais de uma
 *    transliteração possível, e só ele sabe qual é a dele.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { He } from '@/components/hebrew/He';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { letrasConcluidas } from '@/lib/leitura';
import { GERESH, disponibilidade } from '@/lib/nome-hebraico';

/** O nome do aluno como ele o deu: o do onboarding, se houver; senão, o
 *  primeiro nome da conta (o cadastro já pediu). Pedir de novo, em branco,
 *  era o terceiro pedido do mesmo dado (auditoria de 01/10/2026, UXQA-008). */
export function nomeDoAluno(onboardingName?: string | null, nomeDaConta?: string | null): string {
  const dado = (onboardingName ?? '').trim();
  if (dado) return dado;
  return primeiroNome(nomeDaConta);
}

/** A primeira palavra do nome da conta: "Maria Souza" → "Maria". */
export const primeiroNome = (nome?: string | null): string =>
  (nome ?? '').trim().split(/\s+/)[0] ?? '';

export { disponibilidade, type Disponibilidade } from '@/lib/nome-hebraico';

/* ── o editor ───────────────────────────────────────────────────────────── */

/** O nome em peças: cada letra (com o ׳ colado nela) e cada espaço. */
export function pecasDoNome(grafia: string): string[] {
  const out: string[] = [];
  for (const ch of grafia) {
    if (ch === GERESH && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

export function EditorDeNome({
  valor, onChange, letras
}: {
  valor: string;
  onChange: (v: string) => void;
  /** As letras que o aluno pode usar - as que ele já concluiu. */
  letras: readonly { letter: string; finalForm?: string | null; namePt: string }[];
}) {
  const pecas = pecasDoNome(valor);
  const tirar = (i: number) => onChange(pecas.filter((_, k) => k !== i).join(''));
  const por = (g: string) => onChange(valor + g);
  const podeGeresh = pecas.length > 0 && /[זגצ]$/.test(pecas[pecas.length - 1]!);

  return (
    <div className="grid gap-4">
      <div
        className="he-seq min-h-[80px] rounded-[var(--r-lg)] border-2 border-dashed border-line
                   bg-surface-2 px-3 py-3 justify-center"
        aria-label="O seu nome em hebraico. Toque numa letra para tirá-la."
      >
        {pecas.length === 0 ? (
          <span className="font-ui text-[13px] text-ink-muted" dir="ltr">toque nas letras abaixo</span>
        ) : pecas.map((g, i) => g === ' ' ? (
          <button key={i} type="button" onClick={() => tirar(i)} aria-label="Tirar o espaço"
                  className="min-h-[52px] min-w-[44px] rounded-md border border-dashed border-line" />
        ) : (
          <button key={i} type="button" onClick={() => tirar(i)} aria-label={`Tirar a letra ${g}`}
                  className="min-h-[52px] min-w-[44px] px-1.5 rounded-[var(--r-md)] bg-surface
                             border border-line grid place-items-center">
            <He size="word">{g}</He>
          </button>
        ))}
      </div>
      <ul className="flex flex-wrap gap-2 justify-center list-none p-0 m-0" dir="rtl" aria-label="Letras disponíveis">
        {letras.flatMap(l => [l.letter, ...(l.finalForm ? [l.finalForm] : [])]).map(g => (
          <li key={g}>
            <button type="button" onClick={() => por(g)} aria-label={`Pôr a letra ${g}`}
                    className="min-h-[48px] min-w-[46px] rounded-[var(--r-md)] border-2 border-line bg-surface
                               hover:border-[var(--accent-soft)] grid place-items-center">
              <He size="lg">{g}</He>
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => por(GERESH)} disabled={!podeGeresh}
                  aria-label="Pôr o gerech, o sinal do J" title="O ׳ transforma ז em J, ג em DJ e צ em TCH"
                  className="min-h-[48px] min-w-[46px] rounded-[var(--r-md)] border-2 border-line bg-surface
                             grid place-items-center disabled:opacity-35">
            <He size="lg">{GERESH}</He>
          </button>
        </li>
        <li>
          <button type="button" onClick={() => por(' ')} disabled={!pecas.length || pecas[pecas.length - 1] === ' '}
                  className="min-h-[48px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface
                             font-ui text-[14px] disabled:opacity-35">
            espaço
          </button>
        </li>
      </ul>
    </div>
  );
}

/* ── o cartão do painel e do fim da lição ──────────────────────────────── */

/**
 * `contexto`:
 *   · 'painel' - sempre que houver nome: o convite quando abre, "faltam N
 *     letras" antes disso, e o nome escrito depois de feito;
 *   · 'licao'  - SÓ no momento em que abre, e só se ainda não foi feito. É o
 *     "agora você já consegue escrever o seu nome", no fim da letra que o
 *     tornou possível.
 */
export function CartaoMeuNome({ contexto = 'painel' }: { contexto?: 'painel' | 'licao' }) {
  const p = useProgress();
  const nome = nomeDoAluno(p.state.onboarding?.name);
  const aprendidas = useMemo(() => letrasConcluidas(p.state).map(l => l.letter), [p.state]);
  const disp = useMemo(() => disponibilidade(nome, aprendidas), [nome, aprendidas]);
  const feito = p.state.nomeHebraico;

  if (!nome && !feito) return null;

  if (feito && contexto === 'painel') {
    return (
      <section aria-label="O seu nome em hebraico"
               className="rounded-[var(--r-lg)] border border-line bg-surface px-5 py-4
                          flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-1">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">O seu nome</p>
          <div className="flex flex-wrap items-center gap-4">
            <He size="xl">{feito.texto}</He>
            <He size="xl" cursive>{feito.texto}</He>
          </div>
        </div>
        <Link href="/meu-nome" className="font-ui text-[14px] underline">Praticar ou mudar</Link>
      </section>
    );
  }
  if (feito) return null;

  if (disp.escrevivel) {
    return (
      <section aria-label="Escreva o seu nome em hebraico"
               className="rounded-[var(--r-lg)] bg-[var(--gold-soft)] px-5 py-4 grid gap-2">
        <p className="font-ui text-[17px] font-semibold text-ink m-0">
          Agora você já consegue escrever o seu nome em hebraico.
        </p>
        <p className="font-ui text-[14px] text-ink-body m-0">
          Todas as letras de “{nome}” já passaram pelas suas lições.
        </p>
        <LinkButton href="/meu-nome" size="md" className="w-fit">Escrever o meu nome</LinkButton>
      </section>
    );
  }

  if (contexto === 'licao' || !Number.isFinite(disp.faltam) || aprendidas.length < 3) return null;
  return (
    <p className="font-ui text-[14px] text-ink-muted m-0">
      {disp.faltam === 1
        ? `Falta 1 letra para você escrever “${nome}” em hebraico.`
        : `Faltam ${disp.faltam} letras para você escrever “${nome}” em hebraico.`}
    </p>
  );
}
