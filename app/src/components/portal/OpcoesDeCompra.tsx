'use client';

/* As opções de compra: dois produtos e um combo só (23/10/2026, decisão do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Alfabetização em Hebraico, Israel Além do Óbvio e o combo "Descubra Israel +
 * Aprenda Hebraico". Nenhuma outra edição ou combo. Tudo que é número sai do
 * catálogo (data/courses.json), o mesmo que o servidor cobra:
 *
 *  - o preço é o `brl`; "depois, R$ X" é o `listBrl`, o preço oficial que o dono
 *    vira à mão (sem data na tela: decisão de 23/10/2026, nada de escassez);
 *  - a economia do combo é calculada aqui: os dois separados menos o combo;
 *  - nada riscado: o preço oficial é dito com palavras, nunca como um "de".
 *
 * Produto fora de venda (`aVenda: false`) aparece "Em breve", sem preço e sem
 * botão de compra (a regra do portal, tests/portal.test.ts). Quem já tem o
 * produto vê "Na sua conta" e o caminho para abrir. Quem tem uma parte do combo
 * não recebe a oferta dele (o servidor recusaria com 409 `ja-tem-parte`): vê a
 * compra só da parte que falta.
 */

import Link from 'next/link';
import { useAccount } from '@/lib/account/store';
import { ancora, brl, estaAVenda, getCourse, paginaDeVenda, parcelasMax, pixPrice, type CatalogCourse } from '@/lib/catalog';
import { parcelasCurto, soPix, temPix } from '@/lib/empresa';
import { proximoPasso } from '@/lib/cta';

export const CURSO = 'alfabetizacao';
export const LIVRO = 'israel-alem-do-roteiro';
export const COMBO = 'alfabetizacao-e-israel';

/** O que cada produto abre, para o botão de quem já tem. */
const ABRIR: Record<string, string> = { [LIVRO]: '/israel/' };

/** O nome como a vitrine escreve: o livro leva o subtítulo junto. */
export const nomeNaVitrine = (c: CatalogCourse): string =>
  c.slug === LIVRO && c.taglinePt ? `${c.titlePt}: ${c.taglinePt}` : c.titlePt;

/** Os dois separados, a economia do combo, e se ela existe. Só com tudo à venda. */
export function economiaDoCombo(): { separados: number; combo: number; economia: number } | null {
  const combo = getCourse(COMBO);
  if (!estaAVenda(combo)) return null;
  const partes = (combo.componentes ?? []).map(s => getCourse(s));
  if (!partes.length || partes.some(p => !p)) return null;
  const separados = partes.reduce((n, p) => n + p!.price.brl, 0);
  const economia = separados - combo.price.brl;
  return economia > 0 ? { separados, combo: combo.price.brl, economia } : null;
}

const DESCRICAO: Record<string, { chamada: string; inclui: string[] }> = {
  [CURSO]: {
    chamada: 'Ler e escrever hebraico do zero, letra por letra, com a voz do professor.',
    inclui: ['As 22 letras e os sinais de vogal', 'Escrita cursiva com o dedo na tela', 'Exercícios corrigidos na hora']
  },
  [LIVRO]: {
    chamada: 'Uma experiência digital interativa pela história, a cultura e os lugares de Israel.',
    inclui: ['Mapas interativos e ilustrações', 'Exercícios no fim de cada capítulo', 'Um diário de viagem para preencher']
  },
  [COMBO]: {
    chamada: 'Descubra Israel pelos olhos de um israelense e aprenda a ler o idioma que faz parte dessa história.',
    inclui: ['Acesso completo ao Israel Além do Óbvio', 'Acesso completo ao curso de Alfabetização', 'Uma compra só, o mesmo login']
  }
};

export function OpcoesDeCompra({ slugs = [CURSO, LIVRO, COMBO], titulo = 'Escolha como começar.', id = 'opcoes', aqui }: {
  slugs?: string[]; titulo?: string; id?: string;
  /** O produto da página em que a vitrine está: o cartão dele não leva a ela mesma. */
  aqui?: string;
}) {
  const produtos = slugs.map(s => getCourse(s)).filter((c): c is CatalogCourse => !!c);
  return (
    <section aria-labelledby={`${id}-titulo`} className="grid gap-6">
      <h2 id={`${id}-titulo`}
          className="m-0 font-display font-semibold text-[clamp(26px,3.4vw,38px)] leading-[1.08] tracking-[-0.03em] text-ink">
        {titulo}
      </h2>
      <ul className={`grid gap-4 list-none p-0 m-0 ${produtos.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} lg:items-stretch`}>
        {produtos.map(c => <li key={c.slug} className="grid"><Opcao c={c} detalhes={c.slug !== aqui} /></li>)}
      </ul>
    </section>
  );
}

function Opcao({ c, detalhes }: { c: CatalogCourse; detalhes: boolean }) {
  const account = useAccount();
  const combo = c.slug === COMBO;
  const aVenda = estaAVenda(c);
  const partes = (c.componentes ?? []).filter(s => account.can(s));
  const tem = combo ? partes.length === (c.componentes ?? []).length && partes.length > 0 : account.can(c.slug);
  const temParte = combo && partes.length > 0 && !tem;
  const eco = combo ? economiaDoCombo() : null;
  const d = DESCRICAO[c.slug] ?? { chamada: c.taglinePt, inclui: [] };
  const oficial = ancora(c.price);

  const tom = combo
    ? 'bg-[var(--navy)] text-white border-transparent shadow-[0_28px_60px_-34px_rgba(6,42,48,.75)]'
    : 'bg-[var(--card)] text-ink border-line';
  const suave = combo ? 'text-white/80' : 'text-ink-muted';
  const forte = combo ? 'text-white' : 'text-ink';

  return (
    <article aria-labelledby={`opcao-${c.slug}`}
             className={`relative grid content-start gap-5 rounded-[20px] border p-6 sm:p-7 ${tom}`}>
      {combo && (
        <p className="m-0 justify-self-start rounded-full bg-[var(--gold-soft)] px-3 py-1 font-ui text-[12.5px] font-semibold text-[var(--gold-ink)]">
          Para conhecer Israel e ler hebraico
        </p>
      )}
      <div className="grid gap-2">
        <h3 id={`opcao-${c.slug}`}
            className={`m-0 font-display text-[22px] sm:text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] ${forte}`}>
          {nomeNaVitrine(c)}
        </h3>
        <p className={`m-0 font-ui text-[15.5px] leading-[1.55] ${suave}`}>{d.chamada}</p>
      </div>
      {d.inclui.length > 0 && (
        <ul className="grid gap-2 list-none p-0 m-0">
          {d.inclui.map(i => (
            <li key={i} className={`flex gap-2.5 font-ui text-[15px] leading-[1.45] ${combo ? 'text-white/90' : 'text-ink-body'}`}>
              <span aria-hidden className={`mt-[7px] w-[6px] h-[6px] rounded-full shrink-0 ${combo ? 'bg-[var(--gold)]' : 'bg-[var(--teal)]'}`} />
              <span className="min-w-0">{i}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={`grid gap-3 pt-4 border-t ${combo ? 'border-white/15' : 'border-line'} mt-auto`}>
        {tem ? (
          <>
            <p className={`m-0 font-ui text-[14px] font-semibold ${combo ? 'text-[var(--teal-lite)]' : 'text-[var(--teal-ink)]'}`}>Na sua conta</p>
            <Abrir c={c} combo={combo} />
          </>
        ) : !aVenda ? (
          <p className="m-0 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center min-h-[26px] px-2.5 rounded-full font-ui text-[12.5px] font-semibold
                              ${combo ? 'bg-white/10 text-white' : 'bg-[var(--gold-soft)] text-[var(--gold-ink)] border border-[#EADCC0]'}`}>
              Em breve
            </span>
            <span className={`font-ui text-[14px] ${suave}`}>Ainda não está à venda.</span>
          </p>
        ) : temParte ? (
          <p className={`m-0 font-ui text-[14.5px] leading-[1.5] ${suave}`}>
            Você já tem {(c.componentes ?? []).filter(s => account.can(s)).map(s => getCourse(s)?.titlePt).join(' e ')}.
            Compre só o que falta, pela opção ao lado.
          </p>
        ) : (
          <>
            <div className="grid gap-1">
              <p className={`m-0 font-display text-[34px] font-bold leading-none tabular-nums ${forte}`}>
                {brl(soPix() ? pixPrice(c.price) : c.price.brl)}
              </p>
              <p className={`m-0 font-ui text-[13.5px] ${suave}`}>
                {soPix()
                  ? 'no PIX'
                  : `ou ${parcelasCurto(parcelasMax(c.price))} no cartão${temPix() && c.price.pixDiscountPct > 0 ? ` · ${brl(pixPrice(c.price))} no PIX (${c.price.pixDiscountPct}% a menos)` : ''}`}
              </p>
              {eco && (
                <p className="m-0 font-ui text-[14px] font-semibold text-[var(--gold)]">
                  Separados, {brl(eco.separados)}. No combo, {brl(eco.economia)} a menos
                  ({(Math.round(eco.economia / eco.separados * 1000) / 10).toLocaleString('pt-BR')}%).
                </p>
              )}
              {oficial && (
                <p className={`m-0 font-ui text-[12.5px] ${suave}`}>Preço de pré-lançamento. Depois, {brl(oficial)}.</p>
              )}
            </div>
            <Link href={`/checkout/${c.slug}`}
                  className={`inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
                              font-ui text-[15.5px] font-semibold transition-[background-color,transform] duration-[var(--dur)]
                              active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                              ${combo
                                ? 'bg-white text-[var(--navy)] hover:bg-[var(--teal-soft)] focus-visible:outline-white'
                                : 'bg-[var(--navy)] text-white hover:bg-[var(--navy-2)] focus-visible:outline-[var(--teal)]'}`}>
              {combo ? 'Garantir o combo' : 'Garantir meu acesso'}
            </Link>
            {!combo && detalhes && (
              <Link href={paginaDeVenda(c.slug)}
                    className={`justify-self-center font-ui text-[14.5px] font-semibold underline underline-offset-[3px] ${suave}`}>
                Ver os detalhes
              </Link>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function Abrir({ c, combo }: { c: CatalogCourse; combo: boolean }) {
  const account = useAccount();
  const classe = `inline-flex items-center justify-center min-h-[48px] px-5 rounded-[var(--r-md)] font-ui text-[15px] font-semibold
                  ${combo ? 'bg-white text-[var(--navy)]' : 'bg-[var(--navy)] text-white'}`;
  if (combo) return <Link href="/minha-biblioteca" className={classe}>Abrir a Minha Biblioteca</Link>;
  /* O livro é uma página estática atrás do portão: link comum, não o do Next. */
  if (ABRIR[c.slug]) return <a href={ABRIR[c.slug]} className={classe}>Abrir</a>;
  const passo = proximoPasso(account);
  return <Link href={passo.href} className={classe}>{passo.label}</Link>;
}
