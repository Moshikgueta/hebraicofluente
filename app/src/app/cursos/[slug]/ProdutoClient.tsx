'use client';

/* A página de um produto que NÃO é curso: o e-book e o pacote (21/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Mesma rota (/cursos/<slug>) e mesmo catálogo que os cursos, para que o
 * preço da página seja o preço do checkout. O desenho é outro: um e-book não
 * tem módulos, lições nem ritmo, tem capítulos e um formato. Tudo que é número
 * aqui sai de data/courses.json; a soma "os dois separados" é feita na hora.
 *
 * O e-book abre em /israel/, uma página estática atrás do portão. Por isso o
 * botão de quem já comprou é um link comum, e não o do roteador do Next.
 */

import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { ancora, brl, fimDoPreLancamento, getCourse, parcelasMax, pixPrice, tipoDe, type CatalogCourse } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';
import { confirmaSozinho, empresa, parcelasTexto, prazoResposta, soPix, temCartao, temPix } from '@/lib/empresa';

const LIVRO = 'israel-alem-do-roteiro';
const PACOTE = 'alfabetizacao-e-israel';

function Preco({ c }: { c: CatalogCourse }) {
  const parcelas = parcelasMax(c.price);
  return soPix() ? (
    <div className="grid gap-1">
      <p className="font-display text-[38px] font-bold text-ink leading-none">{brl(pixPrice(c.price))}</p>
      <p className="font-ui text-[13.5px] text-ink-body">
        no PIX{c.price.pixDiscountPct > 0 && ` · ${c.price.pixDiscountPct}% de desconto sobre ${brl(c.price.brl)}`}
      </p>
    </div>
  ) : (
    <div className="grid gap-1">
      <p className="font-display text-[38px] font-bold text-ink leading-none">{brl(c.price.brl)}</p>
      <p className="font-ui text-[13.5px] text-ink-body">ou {parcelasTexto(parcelas)} no cartão</p>
      {c.price.pixDiscountPct > 0 && temPix() && (
        <p className="font-ui text-[13.5px] font-medium text-[var(--accent)]">
          {c.price.pixDiscountPct}% de desconto no PIX: {brl(pixPrice(c.price))}
        </p>
      )}
    </div>
  );
}

function Condicoes({ c }: { c: CatalogCourse }) {
  const parcelas = parcelasMax(c.price);
  return (
    <ul className="grid gap-1.5 list-none p-0 m-0 font-ui text-[13px] text-ink-muted">
      <li>
        {soPix()
          ? 'Pagamento por PIX, pelo aplicativo do seu banco.'
          : temPix() && temCartao()
            ? `PIX, cartão ou parcelado ${parcelasTexto(parcelas)}.`
            : temCartao() ? `Cartão de crédito, ou parcelado ${parcelasTexto(parcelas)}.` : 'Pagamento por PIX.'}
      </li>
      <li>
        {confirmaSozinho() ? 'Acesso liberado automaticamente.' : `Acesso liberado à mão, ${prazoResposta()} depois do pagamento.`}
      </li>
      <li>
        {tipoDe(c) === 'livro'
          ? `Versão interativa por ${c.accessMonths} meses; o PDF baixado fica com você.`
          : `${c.accessMonths} meses de curso e de e-book, do celular ao computador.`}
      </li>
      <li>O e-book recebe atualizações, e o PDF para baixar é sempre o da edição mais recente.</li>
      <li>{empresa.politicas.arrependimentoDias} dias para desistir e receber 100% de volta, sem justificar.</li>
    </ul>
  );
}

function CaixaDeCompra({ c }: { c: CatalogCourse }) {
  const account = useAccount();
  const tipo = tipoDe(c);
  const componentes = (c.componentes ?? []).map(s => getCourse(s)).filter((x): x is CatalogCourse => !!x);
  const owned = tipo === 'pacote' ? componentes.every(x => account.can(x.slug)) : account.can(c.slug);

  if (owned) {
    return (
      <Card tone="mint" className="p-6 grid gap-3 content-start">
        <Badge tone="mint">Na sua conta</Badge>
        <p className="font-display text-[19px] font-bold text-ink leading-snug">
          {tipo === 'livro' ? 'Você já tem este e-book.' : 'Você já tem o curso e o e-book.'}
        </p>
        <a href="/israel/" className="inline-flex justify-center items-center min-h-[48px] px-5 rounded-full
                                    bg-[var(--accent-bg)] text-white font-ui font-semibold">
          Abrir o e-book
        </a>
      </Card>
    );
  }

  const separados = componentes.reduce((n, x) => n + x.price.brl, 0);
  return (
    <Card className="p-6 grid gap-4 content-start">
      {/* Preço de pré-lançamento: o rótulo e o preço de depois andam juntos,
          como na caixa do curso (ver `ancora()` em lib/catalog.ts). */}
      {ancora(c.price) && (
        <div className="grid gap-1">
          <p className="font-ui text-[12px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
            Preço de pré-lançamento
          </p>
          <p className="font-ui text-[13px] text-ink-muted">
            {fimDoPreLancamento(c.price) ? `Até ${fimDoPreLancamento(c.price)}. ` : ''}Depois, {brl(ancora(c.price)!)}.
          </p>
        </div>
      )}
      <Preco c={c} />
      {tipo === 'pacote' && separados > c.price.brl && (
        <p className="font-ui text-[13.5px] text-ink-body">
          Separados, os dois custam {brl(separados)}.
        </p>
      )}
      <LinkButton href={`/checkout/${c.slug}`} size="lg" full>
        {tipo === 'livro' ? 'Comprar o e-book' : 'Comprar o pacote'}
      </LinkButton>
      <Condicoes c={c} />
      {!account.signedIn && (
        <p className="font-ui text-[12.5px] text-ink-muted border-t border-[color:var(--line-soft)] pt-3">
          Já comprou? <Link href="/entrar" className="text-[var(--accent)] hover:underline">Entre na sua conta</Link>
        </p>
      )}
    </Card>
  );
}

/** O convite ao pacote, na página do e-book. */
function OfertaDoPacote() {
  const account = useAccount();
  const p = getCourse(PACOTE);
  if (!p || (p.componentes ?? []).some(s => account.can(s))) return null;
  const separados = (p.componentes ?? []).map(s => getCourse(s)).reduce((n, x) => n + (x?.price.brl ?? 0), 0);
  return (
    <Card tone="wash" className="p-5 grid gap-2.5">
      <p className="font-display text-[17px] font-bold text-ink leading-snug">
        Quer ler as placas sozinho?
      </p>
      <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
        Leve junto o curso Alfabetização em Hebraico: os dois por {brl(p.price.brl)}
        {separados > p.price.brl ? ` (separados, ${brl(separados)})` : ''}
        {fimDoPreLancamento(p.price) ? `, até ${fimDoPreLancamento(p.price)}` : ''}.
      </p>
      <LinkButton href={`/cursos/${PACOTE}`} variant="secondary" size="sm" className="justify-self-start">
        Ver o pacote
      </LinkButton>
    </Card>
  );
}

export function ProdutoClient({ slug }: { slug: string }) {
  const c = getCourse(slug);
  if (!c) return null;
  const tipo = tipoDe(c);
  const livro = getCourse(LIVRO)!;

  return (
    <>
      <div className="border-b border-line">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20
                        grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="grid gap-4 min-w-0">
            <nav aria-label="Você está em" className="font-ui text-[13px] text-ink-muted">
              <Link href="/cursos" className="hover:text-[var(--accent)]">Cursos</Link>
              <span aria-hidden> · </span>
              <span>{tipo === 'livro' ? 'E-book' : 'Pacote'}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{tipo === 'livro' ? 'E-book' : 'Curso + e-book'}</Badge>
            </div>
            <h1 className="font-display font-semibold text-[clamp(32px,4.2vw,52px)] leading-[1.05]
                           tracking-[-0.034em] text-ink m-0 [text-wrap:balance]">
              {c.titlePt}
            </h1>
            <p className="font-display text-[clamp(19px,1.9vw,23px)] leading-[1.35] font-medium text-ink max-w-[40ch] m-0">
              {c.taglinePt}
            </p>
            <p className="font-ui text-[16.5px] leading-[1.6] text-ink-muted max-w-[60ch] m-0">{c.summaryPt}</p>
            <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-5 mt-2 border-t border-line max-w-[560px]">
              {([
                ['Capítulos', String(livro.modules.length)],
                ['Formato', 'Web + PDF'],
                ['Acesso', `${c.accessMonths} meses`]
              ] as const).map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted">{k}</dt>
                  <dd className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink tabular-nums m-0">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-4 content-start">
            <CaixaDeCompra c={c} />
            {tipo === 'livro' && <OfertaDoPacote />}
          </div>
        </div>
      </div>

      {tipo === 'livro' && (
        <Section labelledBy="leva">
          <SectionHead id="leva" eyebrowPt="Depois da leitura" titlePt="O que você leva deste livro." />
          <ul className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
            {c.outcomesPt.map(o => (
              <li key={o} className="py-5 border-b border-line font-ui text-[15.5px] leading-relaxed text-ink-body">{o}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section labelledBy="capitulos">
        <SectionHead id="capitulos" eyebrowPt="Por dentro" titlePt={`Os ${livro.modules.length} capítulos do e-book.`} />
        <ol className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
          {livro.modules.map(m => (
            <li key={m.n} className="flex gap-4 py-4 border-b border-line min-w-0">
              <span className="font-display text-[20px] font-semibold text-[var(--accent)] tabular-nums w-7 shrink-0">{m.n}</span>
              <span className="grid gap-0.5 min-w-0">
                <span className="font-display text-[17px] font-semibold text-ink">{m.titlePt}</span>
                <span className="font-ui text-[13.5px] text-ink-muted">{m.subPt}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[62ch] mt-6">
          Na versão interativa, os mapas se tocam, cada capítulo termina com exercícios de compreensão
          corrigidos na hora, e o diário guarda o que você escreve. O PDF tem o mesmo texto, para ler e imprimir.
        </p>
      </Section>

      {tipo === 'livro' && livro.forWhomPt.length > 0 && (
        <Section labelledBy="para-quem">
          <SectionHead id="para-quem" eyebrowPt="Para quem" titlePt="Para quem é este livro." />
          <ul className="grid gap-2 list-none p-0 m-0">
            {livro.forWhomPt.map(f => (
              <li key={f} className="font-ui text-[15.5px] leading-relaxed text-ink-body">{f}</li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
