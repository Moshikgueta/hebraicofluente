'use client';

/* A página de um curso — a mesma para o que está à venda e para o que não está.
 * ─────────────────────────────────────────────────────────────────────────
 * É aqui que cai quem clica num curso trancado, e o desenho parte de uma
 * escolha: a página de um curso "em breve" mostra TUDO — o que ensina, os
 * módulos, o resultado no fim — e no lugar do botão de compra diz o que
 * acontece quando ele sair. O contrário (uma página vazia com "aguarde")
 * desperdiça a única visita em que a pessoa estava interessada.
 *
 * O botão muda com o estado da conta e nunca mente:
 *   já tem      → Continuar (vai para o painel)
 *   à venda     → Desbloquear curso (vai para o checkout)
 *   em breve    → Avise-me — que hoje é um link para a página de dúvidas,
 *                 porque prometer aviso por e-mail sem ter a lista montada
 *                 é uma promessa que ninguém cumpre.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { brl, getCourse, installment, isPlayable, pixPrice } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';

export function CourseClient({ slug }: { slug: string }) {
  const account = useAccount();
  const c = getCourse(slug);
  if (!c) return null;

  const owned = account.can(c.slug);
  const open = isPlayable(c);

  return (
    <>
      {/* ── cabeçalho ───────────────────────────────────────────────── */}
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-12 sm:py-16
                        grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="grid gap-4">
            <nav aria-label="Você está em" className="font-ui text-[13px] text-ink-muted">
              <Link href="/cursos" className="hover:text-[var(--accent)]">Cursos</Link>
              <span aria-hidden> · </span>
              <span>Curso {c.code}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {owned ? <Badge tone="mint">Seu curso</Badge>
                : open ? <Badge tone="accent">Disponível</Badge>
                : <Badge>Em breve</Badge>}
              <span className="font-ui text-[12.5px] text-ink-muted">
                {c.levelPt}{c.cefr ? ` · ${c.cefr}` : ''}
              </span>
            </div>

            <h1 className="font-display text-[32px] sm:text-[42px] font-bold leading-[1.12] text-ink">
              {c.titlePt}
            </h1>
            <p className="text-[17px] leading-relaxed text-ink-body max-w-[54ch]">
              {c.taglinePt}
            </p>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body max-w-[62ch]">
              {c.summaryPt}
            </p>

            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-3">
              {([
                ['Módulos', String(c.stats.modules)],
                ...(c.stats.lessons ? [['Lições', String(c.stats.lessons)] as const] : []),
                ['Acesso', `${c.accessMonths} meses`],
                ['Ritmo', 'Seu']
              ] as const).map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="font-ui text-[10.5px] uppercase tracking-[.08em] text-ink-muted">{k}</dt>
                  <dd className="font-display text-[19px] font-bold text-ink tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <BuyBox slug={slug} />
        </div>
      </div>

      {/* ── o que você vai conseguir ────────────────────────────────── */}
      <Section labelledBy="resultado">
        <SectionHead
          id="resultado"
          eyebrowPt="No fim deste curso"
          titlePt="O que você vai conseguir fazer."
          leadPt="Escrito como coisa que se faz, não como tema que se estuda — é assim que dá para conferir se aconteceu."
        />
        <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
          {c.outcomesPt.map(o => (
            <li key={o}>
              <Card className="p-4 flex gap-3 h-full">
                <span aria-hidden className="text-[var(--accent)] text-[15px] mt-[2px]">✓</span>
                <span className="font-ui text-[14.5px] leading-relaxed text-ink-body">{o}</span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── os módulos ──────────────────────────────────────────────── */}
      <Section tone="surface" labelledBy="modulos">
        <SectionHead
          id="modulos"
          eyebrowPt="O caminho"
          titlePt={`${c.stats.modules} módulos, nesta ordem.`}
          leadPt={open
            ? 'A ordem não é alfabética nem histórica: é a ordem em que cada peça abre mais palavras para você ler.'
            : 'O plano do curso. Pode mudar de nome até a publicação; a sequência, não.'}
        />
        <ol className="grid gap-3 list-none p-0 m-0">
          {c.modules.map(m => (
            <li key={m.n}>
              <Card className="p-4 sm:p-5 flex items-start gap-4">
                <span aria-hidden
                      className="w-[34px] h-[34px] shrink-0 rounded-full bg-[var(--accent-wash)]
                                 text-[var(--accent)] font-ui text-[14px] font-bold
                                 grid place-items-center tabular-nums">
                  {m.n}
                </span>
                <div className="grid gap-0.5 min-w-0">
                  <h3 className="font-display text-[16.5px] font-bold text-ink">{m.titlePt}</h3>
                  <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">{m.subPt}</p>
                </div>
                {m.letters ? (
                  <span className="ml-auto shrink-0 font-ui text-[12px] text-ink-muted tabular-nums">
                    {m.letters} {m.letters === 1 ? 'letra' : 'letras'}
                  </span>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── para quem ───────────────────────────────────────────────── */}
      <Section labelledBy="paraquem">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-4">
            <SectionHead id="paraquem" eyebrowPt="Para quem é" titlePt="Este curso é para você se…" />
            <ul className="grid gap-2.5 list-none p-0 m-0">
              {c.forWhomPt.map(f => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden className="text-[var(--accent)] text-[14px] mt-[3px]">→</span>
                  <span className="font-ui text-[14.5px] leading-relaxed text-ink-body">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card tone="wash" className="p-6 grid gap-3 content-start">
            <He size="lg" dim>א</He>
            <h3 className="font-display text-[18px] font-bold text-ink">
              E se não for para mim?
            </h3>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Você tem {c.accessMonths} meses de acesso e nenhum prazo interno: dá para
              fazer em três semanas ou em três meses. O curso guarda onde você
              parou e volta exatamente ali.
            </p>
            <Link href="/faq" className="font-ui text-[13.5px] text-[var(--accent)] hover:underline
                                          inline-flex items-center min-h-[36px]">
              Ver as dúvidas mais comuns →
            </Link>
          </Card>
        </div>
      </Section>

      {/* ── repete a decisão no fim ─────────────────────────────────── */}
      <Section tone="wash">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="grid gap-3">
            <h2 className="font-display text-[26px] sm:text-[30px] font-bold leading-tight text-ink max-w-[22ch]">
              {open ? 'Comece hoje, na primeira lição.' : 'Ainda não, mas está vindo.'}
            </h2>
            <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[52ch]">
              {open
                ? 'O acesso é liberado assim que o pagamento é confirmado — sem espera, sem liberação manual, sem e-mail para procurar na caixa de spam.'
                : 'Este curso está em produção. Quando sair, entra na mesma conta e continua de onde o anterior parou.'}
            </p>
          </div>
          <BuyBox slug={slug} />
        </div>
      </Section>
    </>
  );
}

/* A caixa de decisão, repetida no topo e no fim — o mesmo componente nos dois
   lugares, para que nunca discordem de preço. */
function BuyBox({ slug }: { slug: string }) {
  const account = useAccount();
  const c = getCourse(slug)!;
  const owned = account.can(c.slug);
  const open = isPlayable(c);
  const parcela = installment(c.price);

  if (owned) {
    return (
      <Card tone="mint" className="p-6 grid gap-3 content-start">
        <Badge tone="mint">Na sua conta</Badge>
        <p className="font-display text-[19px] font-bold text-ink leading-snug">
          Você já tem este curso.
        </p>
        <LinkButton href="/meu-hebraico" size="lg" full>Continuar</LinkButton>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card className="p-6 grid gap-3 content-start">
        <Badge>Em breve</Badge>
        <p className="font-display text-[19px] font-bold text-ink leading-snug">
          Ainda não está à venda.
        </p>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
          Enquanto isso, o caminho para chegar até aqui começa na alfabetização.
        </p>
        <LinkButton href="/cursos/alfabetizacao" variant="secondary" size="lg" full>
          Ver o curso 01
        </LinkButton>
      </Card>
    );
  }

  return (
    <Card className="p-6 grid gap-4 content-start">
      <div className="grid gap-1">
        {c.price.listBrl && (
          <p className="font-ui text-[14px] text-ink-muted line-through">{brl(c.price.listBrl)}</p>
        )}
        <p className="font-display text-[38px] font-bold text-ink leading-none">{brl(c.price.brl)}</p>
        <p className="font-ui text-[13.5px] text-ink-body">
          ou {parcela.n}x de {brl(parcela.brl)} sem juros
        </p>
        {c.price.pixDiscountPct > 0 && (
          <p className="font-ui text-[13.5px] font-medium text-[var(--accent)]">
            {brl(pixPrice(c.price))} no PIX ({c.price.pixDiscountPct}% off)
          </p>
        )}
      </div>

      <LinkButton href={`/checkout/${c.slug}`} size="lg" full>Desbloquear curso</LinkButton>

      <ul className="grid gap-1.5 list-none p-0 m-0 font-ui text-[13px] text-ink-muted">
        <li>PIX, cartão ou parcelado em até {parcela.n}x.</li>
        <li>Acesso liberado automaticamente.</li>
        <li>{c.accessMonths} meses, do celular ao computador.</li>
      </ul>

      {!account.signedIn && (
        <p className="font-ui text-[12.5px] text-ink-muted border-t border-[color:var(--line-soft)] pt-3">
          Já comprou?{' '}
          <Link href="/entrar" className="text-[var(--accent)] hover:underline">Entre na sua conta</Link>
        </p>
      )}
    </Card>
  );
}
