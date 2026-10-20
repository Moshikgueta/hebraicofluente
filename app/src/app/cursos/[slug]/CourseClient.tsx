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
                ['Módulos', String(c.stats.modules)],
                ...(c.stats.lessons ? [['Lições', String(c.stats.lessons)] as const] : []),
                ['Acesso', `${c.accessMonths} meses`],
                ['Ritmo', 'Seu']
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
          eyebrowPt="No fim deste curso"
          titlePt="O que você vai conseguir fazer."
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
          eyebrowPt="O caminho"
          titlePt={`${c.stats.modules} módulos, nesta ordem.`}
          leadPt={open
            ? 'A ordem não é alfabética nem histórica: é a ordem em que cada peça abre mais palavras para você ler.'
            : 'O plano do curso. Pode mudar de nome até a publicação; a sequência, não.'}
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
                  {m.letters} {m.letters === 1 ? 'letra' : 'letras'}
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
            <SectionHead id="paraquem" eyebrowPt="Para quem é" titlePt="Este curso é para você se…" />
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
              E se não for para mim?
            </h3>
            {/* O título é a objeção, e a resposta começa por ela: a
                desistência do CDC (art. 49), com o prazo de data/empresa.json
                e o caminho pelo site (Decreto 7.962/2013, art. 5º). Até
                01/10/2026 o cartão respondia só com o prazo de estudo
                (auditoria, CONV-001). */}
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              Você tem {empresa.politicas.arrependimentoDias} dias, contados da liberação
              do acesso, para desistir e receber 100% de volta, sem justificar; é só um
              botão em Sua conta. Depois disso, você tem {c.accessMonths} meses de acesso
              e nenhum prazo interno.{' '}
              {tempoDoCursoPt()} O curso guarda onde você parou e volta
              exatamente ali.
            </p>
            <Link href="/faq" className="font-ui text-[15px] font-semibold text-[var(--teal-ink)] hover:underline
                                          inline-flex items-center min-h-[36px]">
              Ver as dúvidas mais comuns →
            </Link>
          </aside>
        </div>
      </Section>

      {/* ── repete a decisão no fim ─────────────────────────────────── */}
      <Section tone="wash">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="grid gap-3">
            <h2 className="font-display font-semibold text-[clamp(28px,3.4vw,40px)] leading-[1.08] tracking-[-0.03em] text-ink max-w-[22ch] m-0">
              {open ? 'Comece hoje, na primeira lição.' : 'Ainda não, mas está vindo.'}
            </h2>
            <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[52ch]">
              {/* A promessa de "sem liberação manual" só pode ser feita onde
                  ela é verdade. No PIX direto a liberação É manual, e prometer
                  o contrário na página de venda é o pior lugar possível para
                  errar: a pessoa compra por causa da frase e descobre a
                  diferença depois de pagar. */}
              {open
                ? confirmaSozinho()
                  ? 'O acesso é liberado assim que o pagamento é confirmado - sem espera, sem liberação manual, sem e-mail para procurar na caixa de spam.'
                  : `Você paga no PIX pelo aplicativo do seu banco e entra com o mesmo e-mail e senha. Conferimos o pagamento e liberamos o acesso à mão, ${prazoResposta()}.`
                : 'Este curso está em produção. Quando sair, entra na mesma conta e continua de onde o anterior parou.'}
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

  /* Pagou, e o acesso venceu: o aviso diz isso com a data, acima do preço,
     no lugar do "esta conta ainda não tem o curso" (PAY-B-004). */
  const aviso = venceuEm ? (
        <Card tone="wash" className="p-5 grid gap-2.5">
          <p className="font-display text-[17px] font-bold text-ink leading-snug">
            {fraseDeVencido(venceuEm)}
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
            Seu progresso continua guardado na sua conta e volta inteiro quando
            você renovar.
          </p>
          <LinkButton href={`/checkout/${c.slug}`} size="sm" className="justify-self-start">
            Renovar por mais {c.accessMonths} meses
          </LinkButton>
        </Card>
      ) : account.signedIn ? (
        <Card tone="wash" className="p-5 grid gap-2.5">
          <p className="font-display text-[17px] font-bold text-ink leading-snug">
            Esta conta ainda não tem o curso
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
            Você está conectado como{' '}
            <strong className="break-all">{account.session?.account.email}</strong>.
            Se a compra foi feita com outro e-mail, entre com ele: o acesso
            fica na conta do e-mail que pagou.
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/entrar" variant="secondary" size="sm">
              Entrar com outro e-mail
            </LinkButton>
          </div>
          <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                        border-t border-[color:var(--line-soft)] pt-3">
            Já pagou e continua vendo esta tela? <strong>Não pague de novo.</strong>{' '}
            Escreva para{' '}
            <a href={`mailto:${empresa.contato.emailSuporte}`}
               className="text-[var(--accent)] hover:underline break-all">
              {empresa.contato.emailSuporte}
            </a>{' '}
            com o e-mail da compra que a gente libera.
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
            Preço de pré-lançamento
          </p>
        )}
        {cheio && (
          <p className="font-ui text-[13px] text-ink-muted">
            {fimDoPreLancamento(c.price) ? `Até ${fimDoPreLancamento(c.price)}. ` : ''}Depois, {brl(cheio)}.
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
              no PIX
              {c.price.pixDiscountPct > 0
                && ` · ${c.price.pixDiscountPct}% de desconto sobre ${brl(c.price.brl)}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-[38px] font-bold text-ink leading-none">{brl(c.price.brl)}</p>
            <p className="font-ui text-[13.5px] text-ink-body">
              ou {parcelasTexto(parcelas)} no cartão
            </p>
            {/* O preço do PIX some junto com a possibilidade de pagar no
                PIX - ver a nota de `temPix` em app/src/lib/empresa.ts. */}
            {c.price.pixDiscountPct > 0 && temPix() && (
              <p className="font-ui text-[13.5px] font-medium text-[var(--accent)]">
                {c.price.pixDiscountPct}% de desconto no PIX: {brl(pixPrice(c.price))}
              </p>
            )}
          </>
        )}
      </div>

      <LinkButton href={`/checkout/${c.slug}`} size="lg" full>Desbloquear curso</LinkButton>

      <ul className="grid gap-1.5 list-none p-0 m-0 font-ui text-[13px] text-ink-muted">
        <li>
          {soPix()
            ? 'Pagamento por PIX, pelo aplicativo do seu banco.'
            : temPix() && temCartao()
              ? `PIX, cartão ou parcelado ${parcelasTexto(parcelas)}.`
              : temCartao()
                ? `Cartão de crédito, ou parcelado ${parcelasTexto(parcelas)}.`
                : 'Pagamento por PIX, pelo aplicativo do seu banco.'}
        </li>
        <li>
          {confirmaSozinho()
            ? 'Acesso liberado automaticamente.'
            : `Acesso liberado à mão, ${prazoResposta()} depois do pagamento.`}
        </li>
        <li>{c.accessMonths} meses, do celular ao computador.</li>
        {/* A mesma linha da caixa de preço da capa (CONV-001); o prazo vem de
            data/empresa.json e `check-legal.mjs` confere que ela saiu. */}
        <li>{empresa.politicas.arrependimentoDias} dias para desistir e receber 100% de volta, sem justificar.</li>
      </ul>

      {!account.signedIn && (
        <p className="font-ui text-[12.5px] text-ink-muted border-t border-[color:var(--line-soft)] pt-3">
          Já comprou?{' '}
          <Link href="/entrar" className="text-[var(--accent)] hover:underline">Entre na sua conta</Link>
        </p>
      )}
      </Card>
      {contaNova && aviso}
    </div>
  );
}
