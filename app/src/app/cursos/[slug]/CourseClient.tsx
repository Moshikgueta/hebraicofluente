'use client';

/* A página de um curso - a mesma para o que está à venda e para o que não está.
 * ─────────────────────────────────────────────────────────────────────────
 * É aqui que cai quem clica num curso trancado, e o desenho parte de uma
 * escolha: a página de um curso "em breve" mostra TUDO - o que ensina, os
 * módulos, o resultado no fim - e no lugar do botão de compra diz o que
 * acontece quando ele sair. O contrário (uma página vazia com "aguarde")
 * desperdiça a única visita em que a pessoa estava interessada.
 *
 * O botão muda com o estado da conta e nunca mente:
 *   já tem      → Continuar (vai para o painel)
 *   à venda     → Desbloquear curso (vai para o checkout)
 *   em breve    → Avise-me - que hoje é um link para a página de dúvidas,
 *                 porque prometer aviso por e-mail sem ter a lista montada
 *                 é uma promessa que ninguém cumpre.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Prose } from '@/components/hebrew/Prose';
import { Card, Badge } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { ancora, brl, fimDoPreLancamento, FLAGSHIP, getCourse, isPlayable, parcelasMax, pixPrice } from '@/lib/catalog';
import { useAccount } from '@/lib/account/store';
import { tempoDoCursoPt } from '@/lib/content-publico';
import { confirmaSozinho, empresa, O_QUE_O_CURSO_ENSINA, parcelasTexto, prazoResposta, soPix, temCartao, temPix } from '@/lib/empresa';
import { api } from '@/lib/account/api';
import type { AcessoVencido } from '@/lib/account/types';
import { fraseDeVencido, vencidoDe } from '@/app/perfil/compras';
import { tx } from '@/i18n/telas/venda-course-client';

/* Os acessos vencidos da conta, uma pergunta por página (a caixa de compra
   aparece duas vezes). Só para quem está logado e não tem o curso: é o aluno
   que pagou, venceu, e o portão mandou para cá (PAY-B-004). */
let vencidosDaPagina: Promise<AcessoVencido[]> | null = null;
function useVencido(slug: string, perguntar: boolean): string | null {
  const [vencidos, setVencidos] = useState<AcessoVencido[] | null>(null);
  useEffect(() => {
    if (!perguntar) return;
    let stop = false;
    vencidosDaPagina ??= api().then(a => a.compras()).then(r => r.vencidos).catch(() => []);
    void vencidosDaPagina.then(v => { if (!stop) setVencidos(v); });
    return () => { stop = true; };
  }, [perguntar]);
  return perguntar ? vencidoDe(vencidos, slug) : null;
}

export function CourseClient({ slug }: { slug: string }) {
  const account = useAccount();
  const c = getCourse(slug);
  if (!c) return null;

  const owned = account.can(c.slug);
  const open = isPlayable(c);

  return (
    <>
      {/* ── cabeçalho ───────────────────────────────────────────────── */}
      <div className="border-b border-line">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20
                        grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="grid gap-4">
            <nav aria-label={tx.voceEstaEm} className="font-ui text-[13px] text-ink-muted">
              <Link href="/cursos" className="hover:text-[var(--accent)]">{tx.cursos}</Link>
              <span aria-hidden> · </span>
              <span>{tx.curso(c.code)}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {owned ? <Badge tone="mint">{tx.seuCurso}</Badge>
                : open ? <Badge tone="accent">{tx.disponivel}</Badge>
                : <Badge>{tx.emBreve}</Badge>}
              <span className="font-ui text-[12.5px] text-ink-muted">
                {c.levelPt}{c.cefr ? ` · ${c.cefr}` : ''}
              </span>
            </div>

            <h1 className="font-display font-semibold text-[clamp(36px,4.4vw,56px)] leading-[1.03]
                           tracking-[-0.036em] text-ink m-0">
              {c.titlePt}
            </h1>
            <p className="font-display text-[clamp(19px,1.9vw,23px)] leading-[1.35] font-medium tracking-[-0.018em]
                          text-ink max-w-[40ch] m-0">
              {c.taglinePt}
            </p>
            <p className="font-ui text-[16.5px] leading-[1.6] text-ink-muted max-w-[60ch] m-0">
              {c.summaryPt}
            </p>

            <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-5 mt-2 border-t border-line max-w-[560px]">
              {([
                [tx.modulos, String(c.stats.modules)],
                ...(c.stats.lessons ? [[tx.licoes, String(c.stats.lessons)] as const] : []),
                [tx.acesso, tx.nMeses(c.accessMonths)],
                [tx.ritmo, tx.seu]
              ] as const).map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted">{k}</dt>
                  <dd className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink tabular-nums m-0">{v}</dd>
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
          eyebrowPt={tx.resultadoEyebrow}
          titlePt={tx.resultadoTitulo}
        />
        {/* Resultados sob fios, em duas colunas: são frases, não produtos. */}
        <ul className="grid sm:grid-cols-2 gap-x-10 list-none p-0 m-0 border-t border-line">
          {c.outcomesPt.map(o => (
            <li key={o} className="flex gap-3.5 py-5 border-b border-line">
              <span aria-hidden className="text-[var(--teal)] text-[15px] mt-[3px]">✓</span>
              <span className="font-ui text-[16px] leading-[1.6] text-ink-body">{o}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── os módulos ──────────────────────────────────────────────── */}
      <Section tone="surface" labelledBy="modulos">
        <SectionHead
          id="modulos"
          eyebrowPt={tx.caminhoEyebrow}
          titlePt={tx.modulosNestaOrdem(c.stats.modules)}
          leadPt={open
            ? tx.ordemAberto
            : tx.ordemFechado}
        />
        {/* O sumário do curso, como o currículo da capa: linhas sob fio. */}
        <ol className="list-none p-0 m-0 border-t border-line">
          {c.modules.map(m => (
            <li key={m.n} className="flex items-start gap-4 sm:gap-6 py-5 sm:py-6 border-b border-line">
              <span aria-hidden
                    className="w-8 shrink-0 font-display text-[15px] font-semibold tabular-nums
                               text-[var(--teal-ink)] pt-1">
                {String(m.n).padStart(2, '0')}
              </span>
              <div className="grid gap-0.5 min-w-0">
                <h3 className="font-display text-[19px] sm:text-[21px] font-semibold tracking-[-0.02em] text-ink m-0">{m.titlePt}</h3>
                <p className="font-ui text-[14.5px] leading-relaxed text-ink-muted m-0"><Prose text={m.subPt} /></p>
              </div>
              {m.letters ? (
                <span className="ml-auto shrink-0 font-ui text-[13px] text-ink-muted tabular-nums pt-1.5">
                  {tx.nLetras(m.letters)}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      {/* ── para quem ───────────────────────────────────────────────── */}
      <Section labelledBy="paraquem">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-4">
            <SectionHead id="paraquem" eyebrowPt={tx.paraQuemEyebrow} titlePt={tx.paraQuemTitulo} />
            <ul className="grid gap-2.5 list-none p-0 m-0">
              {c.forWhomPt.map(f => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden className="text-[var(--teal)] text-[14px] mt-[3px]">→</span>
                  <span className="font-ui text-[16px] leading-[1.6] text-ink-body">{f}</span>
                </li>
              ))}
            </ul>
            {/* UXQA-010 (auditoria de 01/10/2026): ler e escrever, não conversar.
                Texto para aprovação, em lib/empresa.ts. */}
            {c.slug === FLAGSHIP && (
              <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">{O_QUE_O_CURSO_ENSINA}</p>
            )}
          </div>

          <aside className="grid gap-3 content-start pl-6 border-l-2 border-[var(--teal)] lg:mt-[76px]">
            <h3 className="font-display text-[24px] font-semibold tracking-[-0.022em] text-ink m-0">
              {tx.seNaoFor}
            </h3>
            {/* O título é a objeção, e a resposta começa por ela: a
                desistência do CDC (art. 49), com o prazo de data/empresa.json
                e o caminho pelo site (Decreto 7.962/2013, art. 5º). Até
                01/10/2026 o cartão respondia só com o prazo de estudo
                (auditoria, CONV-001). */}
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              {tx.seNaoForTexto(empresa.politicas.arrependimentoDias, c.accessMonths, tempoDoCursoPt())}
            </p>
            <Link href="/faq" className="font-ui text-[15px] font-semibold text-[var(--teal-ink)] hover:underline
                                          inline-flex items-center min-h-[36px]">
              {tx.verDuvidas}
            </Link>
          </aside>
        </div>
      </Section>

      {/* ── repete a decisão no fim ─────────────────────────────────── */}
      <Section tone="wash">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="grid gap-3">
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.03em] text-ink max-w-[22ch] m-0">
              {open ? tx.comeceHoje : tx.aindaNao}
            </h2>
            <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[52ch]">
              {/* A promessa de "sem liberação manual" só pode ser feita onde
                  ela é verdade. No PIX direto a liberação É manual, e prometer
                  o contrário na página de venda é o pior lugar possível para
                  errar: a pessoa compra por causa da frase e descobre a
                  diferença depois de pagar. */}
              {open
                ? confirmaSozinho()
                  ? tx.liberadoSozinho
                  : tx.liberadoAMao(prazoResposta())
                : tx.emProducao}
            </p>
          </div>
          <BuyBox slug={slug} />
        </div>
      </Section>
    </>
  );
}

/* A caixa de decisão, repetida no topo e no fim - o mesmo componente nos dois
   lugares, para que nunca discordem de preço. */
function BuyBox({ slug }: { slug: string }) {
  const account = useAccount();
  const c = getCourse(slug)!;
  const owned = account.can(c.slug);
  const open = isPlayable(c);
  const parcelas = parcelasMax(c.price);
  const cheio = ancora(c.price);
  const venceuEm = useVencido(c.slug, account.ready && account.signedIn && !owned && open);

  if (owned) {
    return (
      <Card tone="mint" className="p-6 grid gap-3 content-start">
        <Badge tone="mint">{tx.naSuaConta}</Badge>
        <p className="font-display text-[19px] font-bold text-ink leading-snug">
          {tx.jaTem}
        </p>
        <LinkButton href="/meu-hebraico" size="lg" full>{tx.continuar}</LinkButton>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card className="p-6 grid gap-3 content-start">
        <Badge>{tx.emBreve}</Badge>
        <p className="font-display text-[19px] font-bold text-ink leading-snug">
          {tx.naoAVenda}
        </p>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
          {tx.enquantoIsso}
        </p>
        <LinkButton href="/curso-de-hebraico" variant="secondary" size="lg" full>
          {tx.verCurso01}
        </LinkButton>
      </Card>
    );
  }

  /* Pagou, e o acesso venceu: o aviso diz isso com a data, acima do preço,
     no lugar do "esta conta ainda não tem o curso" (PAY-B-004). */
  const aviso = venceuEm ? (
        <Card tone="wash" className="p-5 grid gap-2.5">
          <p className="font-display text-[17px] font-bold text-ink leading-snug">
            {fraseDeVencido(venceuEm)}
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
            {tx.progressoGuardado}
          </p>
          <LinkButton href={`/checkout/${c.slug}`} size="sm" className="justify-self-start">
            {tx.renovar(c.accessMonths)}
          </LinkButton>
        </Card>
      ) : account.signedIn ? (
        <Card tone="wash" className="p-5 grid gap-2.5">
          <p className="font-display text-[17px] font-bold text-ink leading-snug">
            {tx.semCurso}
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
            {tx.conectadoComo(<strong className="break-all">{account.session?.account.email}</strong>)}
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/entrar" variant="secondary" size="sm">
              {tx.outroEmail}
            </LinkButton>
          </div>
          <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                        border-t border-[color:var(--line-soft)] pt-3">
            {tx.jaPagou(
              <a href={`mailto:${empresa.contato.emailSuporte}`}
                 className="text-[var(--accent)] hover:underline break-all">
                {empresa.contato.emailSuporte}
              </a>
            )}
          </p>
        </Card>
      ) : null;
  const criada = account.session?.account.createdAt ? Date.parse(account.session.account.createdAt) : NaN;
  /* Quem tem acesso vencido não é conta nova para este curso: o aviso com a
     data vem antes do preço. */
  const contaNova = !venceuEm && Number.isFinite(criada) && Date.now() - criada < 86_400_000;

  return (
    <div className="grid gap-4 content-start">
      {/* Conectado, e mesmo assim sem o curso.
          ──────────────────────────────────────────────────────────────────
          É o estado mais cruel da plataforma, e até agora ele era MUDO: o
          portão manda para cá quem tenta abrir uma aula sem ter o direito, e
          a pessoa via uma página de preço. Quem pagou e cai numa página de
          pagamento não conclui "falta liberar meu acesso" - conclui que foi
          cobrado por nada, ou que o site quebrou. E aí ou paga de novo, ou
          some.

          Então, havendo sessão sem curso, a página diz as três coisas que
          resolvem: COM QUAL CONTA a pessoa está conectada (o caso mais comum
          é ter comprado com outro e-mail), como trocar de conta, e para onde
          escrever. O preço continua logo abaixo, para quem de fato ainda não
          comprou. */}
      {/* Conta criada há menos de um dia (30/09/2026): quase sempre é quem
          acabou de se cadastrar PARA comprar, e abrir com "esta conta não tem
          o curso" parecia erro. Para ela, o preço vem primeiro e o aviso de
          "já pagou com outro e-mail?" vem depois. Conta mais antiga continua
          vendo o aviso antes: é o caso de quem pagou e caiu aqui. */}
      {!contaNova && aviso}

      <Card className="p-6 grid gap-4 content-start">
      <div className="grid gap-1">
        {/* O rótulo e o riscado andam juntos: um número riscado sozinho não
            diz o que é. Ver `ancora()` em lib/catalog.ts. */}
        {cheio && (
          <p className="font-ui text-[12px] font-bold uppercase tracking-[.08em] text-[var(--accent)]">
            {tx.precoPreLancamento}
          </p>
        )}
        {cheio && (
          <p className="font-ui text-[13px] text-ink-muted">
            {tx.depois(fimDoPreLancamento(c.price), brl(cheio))}
          </p>
        )}
        {/* O preço em destaque é o preço que vai ser cobrado. Com só PIX no ar,
            o desconto deixa de ser alternativa e passa a ser o preço, e o valor
            cheio fica como referência - anunciar parcelamento numa loja que
            não aceita cartão é oferecer o que não se entrega. */}
        {soPix() ? (
          <>
            <p className="font-display text-[38px] font-bold text-ink leading-none">
              {brl(pixPrice(c.price))}
            </p>
            <p className="font-ui text-[13.5px] text-ink-body">
              {tx.noPix}
              {c.price.pixDiscountPct > 0
                && tx.descontoSobre(c.price.pixDiscountPct, brl(c.price.brl))}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-[38px] font-bold text-ink leading-none">{brl(c.price.brl)}</p>
            <p className="font-ui text-[13.5px] text-ink-body">
              {tx.noCartao(parcelasTexto(parcelas))}
            </p>
            {/* O preço do PIX some junto com a possibilidade de pagar no
                PIX - ver a nota de `temPix` em app/src/lib/empresa.ts. */}
            {c.price.pixDiscountPct > 0 && temPix() && (
              <p className="font-ui text-[13.5px] font-medium text-[var(--accent)]">
                {tx.descontoNoPix(c.price.pixDiscountPct, brl(pixPrice(c.price)))}
              </p>
            )}
          </>
        )}
      </div>

      <LinkButton href={`/checkout/${c.slug}`} size="lg" full>{tx.desbloquear}</LinkButton>

      <ul className="grid gap-1.5 list-none p-0 m-0 font-ui text-[13px] text-ink-muted">
        <li>
          {soPix()
            ? tx.pagamentoPix
            : temPix() && temCartao()
              ? tx.pixCartao(parcelasTexto(parcelas))
              : temCartao()
                ? tx.cartao(parcelasTexto(parcelas))
                : tx.pagamentoPix}
        </li>
        <li>
          {confirmaSozinho()
            ? tx.automatico
            : tx.aMao(prazoResposta())}
        </li>
        <li>{tx.mesesAparelhos(c.accessMonths)}</li>
        {/* A mesma linha da caixa de preço da capa (CONV-001); o prazo vem de
            data/empresa.json e `check-legal.mjs` confere que ela saiu. */}
        <li>{tx.desistir(empresa.politicas.arrependimentoDias)}</li>
      </ul>

      {!account.signedIn && (
        <p className="font-ui text-[12.5px] text-ink-muted border-t border-[color:var(--line-soft)] pt-3">
          {tx.jaComprou}{' '}
          <Link href="/entrar" className="text-[var(--accent)] hover:underline">{tx.entre}</Link>
        </p>
      )}
      </Card>
      {contaNova && aviso}
    </div>
  );
}
