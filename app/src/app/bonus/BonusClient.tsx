'use client';

/* As leituras bônus do aluno: textos e versículos bíblicos (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Abertas com XP em Recompensas (lib/loja.ts). Sem `?l=`, a lista das que o
 * aluno já tem; com `?l=<id>`, a leitura, com as mesmas ajudas do texto do
 * módulo. Uma página só, com o id na busca, porque o conteúdo é pago e chega
 * por /api/content: a lista de ids não pode ir para a build de rotas.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge, Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { LinhasDeLeitura } from '@/components/learn/LinhasDeLeitura';
import { guiaNikud, leiturasBonus } from '@/lib/content';
import { leiturasCompradas } from '@/lib/loja';
import { He } from '@/components/hebrew/He';
import { stripNikud } from '@/lib/hebrew';
import { useProgress } from '@/lib/state/store';
import { tx } from '@/i18n/telas/academia-bonus-client';

export function BonusClient() {
  const p = useProgress();
  const id = useSearchParams()?.get('l') ?? null;
  if (!p.ready) return null;

  const minhas = leiturasCompradas(p.state);
  const todas = leiturasBonus();
  const abertas = todas.filter(l => minhas.has(l.id));
  const leitura = id ? todas.find(l => l.id === id) : undefined;

  if (id) {
    if (!leitura || !minhas.has(leitura.id)) {
      return (
        <div className="focus-col grid gap-5">
          <p className="text-[16px] text-ink-body m-0">
            {leitura ? tx.naoESua : tx.naoExiste}
          </p>
          <LinkButton href="/loja" variant="secondary" className="justify-self-start">{tx.irRecompensas}</LinkButton>
        </div>
      );
    }
    return (
      <div className="focus-col grid gap-6">
        <header className="grid gap-3">
          <Link href="/bonus"
                className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
            {tx.voltarBonus}
          </Link>
          <Badge tone="accent">{leitura.fontePt}</Badge>
          <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{leitura.tituloPt}</h1>
          <p className="text-[16px] leading-relaxed text-ink-body m-0">{leitura.introPt}</p>
        </header>

        {/* 30/09/2026: a troca é livre (ver app/loja), então a leitura pode
            chegar antes das letras. Dizer isso aqui, onde a pessoa tenta ler. */}
        {p.mastered < leitura.after && (
          <Card tone="wash" className="p-4 grid gap-1">
            <p className="font-ui text-[14.5px] font-semibold text-ink m-0">{tx.aFrente}</p>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
              {tx.aFrenteTexto(leitura.after, p.mastered)}
            </p>
          </Card>
        )}

        {/* O Nome (27/09/2026). O dono do curso grava «Hashém» onde está
            escrito יְהוָה: o costume de não dizer o Nome fora da reza. Sem
            este aviso, o aluno ouve uma palavra que não está no texto. */}
        {temONome(leitura.linhas) && (
          <Card tone="wash" className="p-4 grid gap-1">
            <p className="font-ui text-[14.5px] font-semibold text-ink m-0">{tx.porQueHashem}</p>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
              {tx.hashemTexto(<He size="inline">יְהוָה</He>,
                <Link href="/nikud-biblico#nome" className="underline">{tx.maisNoGuia}</Link>)}
            </p>
          </Card>
        )}

        <LinhasDeLeitura linhas={leitura.linhas} rotulo={leitura.fontePt}
                         heClassName="!text-[24px] sm:!text-[30px] !leading-[1.7]" />

        <GravarLeitura
          titulo={tx.leiaEmVozAlta}
          instrucao={tx.leiaInstrucao}
        />

        <p className="font-ui text-[13.5px] text-ink-muted m-0">
          {tx.traducaoLiteral}
        </p>
        <GuiaCartao />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <h1 className="text-[27px] sm:text-[33px] font-bold m-0">{tx.titulo}</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          {tx.intro}
        </p>
      </header>
      <GuiaCartao />
      {abertas.length === 0 ? (
        <Card tone="wash" className="p-5 grid gap-3">
          <p className="font-ui text-[15px] text-ink-body m-0">{tx.nenhuma}</p>
          <LinkButton href="/loja" variant="secondary" className="justify-self-start">{tx.verRecompensas}</LinkButton>
        </Card>
      ) : (
        <ul className="grid gap-3 list-none p-0 m-0">
          {abertas.map(l => (
            <li key={l.id}>
              <Link href={`/bonus?l=${l.id}`}
                    className="block rounded-[var(--r-lg)] border border-line bg-surface p-4 hover:bg-surface-2">
                <span className="block font-display text-[18px] font-semibold text-ink">{l.tituloPt}</span>
                <span className="block font-ui text-[13.5px] text-ink-muted">{l.fontePt}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* O guia opcional, oferecido e nunca exigido: um cartão para quem quiser. */
function GuiaCartao() {
  const guia = guiaNikud();
  if (!guia) return null;
  return (
    <Link href="/nikud-biblico"
          className="block rounded-[var(--r-lg)] border border-line bg-[var(--accent-wash)] p-4 hover:bg-surface-2">
      <span className="block font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.guiaOpcional}</span>
      <span className="block font-display text-[18px] font-semibold text-ink">{tx.guiaSeta(guia.tituloPt)}</span>
      <span className="block font-ui text-[13.5px] text-ink-body">
        {tx.guiaTexto}
      </span>
    </Link>
  );
}

/** A leitura tem o Nome (יהוה, com qualquer prefixo: לַיהוָה)? */
const temONome = (linhas: readonly { he: string }[]): boolean =>
  linhas.some(l => stripNikud(l.he).includes('יהוה'));
