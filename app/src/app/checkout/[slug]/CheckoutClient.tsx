'use client';

/* O checkout.
 * ─────────────────────────────────────────────────────────────────────────
 * Três passos numa página só, com o resumo do pedido sempre à vista:
 *
 *   1. conta      - entrar ou criar, sem sair daqui;
 *   2. pagamento  - PIX, cartão à vista ou parcelado;
 *   3. confirmação- o servidor diz que o acesso saiu, e só ele.
 *
 * Decisões que valem a pena registrar:
 *
 * · Criar conta acontece ANTES de pagar, e não depois. O inverso é comum e é
 *   pior: alguém paga, o navegador fecha no meio, e existe um pagamento sem
 *   dono. Com a conta primeiro, todo pedido nasce ligado a alguém.
 *
 * · Quem já tem o curso não vê formulário de pagamento. Vender duas vezes a
 *   mesma coisa para a mesma pessoa é um estorno garantido e uma avaliação
 *   ruim.
 *
 * · O acesso é confirmado perguntando ao servidor (`orderStatus`), nunca pelo
 *   que volta na URL. A Mercado Pago manda o comprador de volta com
 *   parâmetros na query - e qualquer pessoa consegue digitar esses parâmetros
 *   na barra de endereço. É exatamente o erro que o projeto irmão em espanhol
 *   documenta no IMPLEMENTATION.md dele.
 *
 * · A consulta tem limite. Se o pagamento não cair em cinco minutos, a tela
 *   para de perguntar e explica o que fazer - em vez de girar para sempre e
 *   deixar a pessoa achando que travou.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { useAccount } from '@/lib/account/store';
import { AuthError, MESSAGES, daysLeft, type Order, type PaymentMethod } from '@/lib/account/types';
import { brl, getCourse, parcelasMax, pixPrice, type CatalogCourse } from '@/lib/catalog';
import { confirmaSozinho, empresa, formasAtivas, soPix, temPix } from '@/lib/empresa';
import { AuthForm } from '@/components/platform/AuthForm';
import { track } from '@/lib/analytics';

/** De quanto em quanto tempo perguntar, e por quanto tempo insistir. */
const POLL_MS = 3_000;
const GIVE_UP_MS = 5 * 60_000;

export function CheckoutClient({ slug }: { slug: string }) {
  const account = useAccount();
  const router = useRouter();
  const c = getCourse(slug)!;

  /* Lidos uma vez: vêm de data/empresa.json, que é fixo no momento da build. */
  const CONFIRMA_SOZINHO = confirmaSozinho();
  /* O que a conta da Mercado Pago aceita NESTA build - resolvido na
     publicação (scripts/pagamento-ativo.mjs), não escrito à mão. Sobrando uma
     forma só, a tela para de perguntar e passa a informar: uma escolha com
     uma opção não é uma escolha, e dá ao comprador a impressão de que ele
     perdeu alguma coisa. */
  const FORMAS = formasAtivas();
  const UMA_FORMA = FORMAS.length === 1;
  const SO_CARTAO = UMA_FORMA && FORMAS[0] === 'card';

  const [method, setMethod] = useState<PaymentMethod>(FORMAS[0] ?? 'pix');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [copied, setCopied] = useState(false);
  /* Estado próprio, e não uma mensagem de erro vermelha: a plataforma pode
     estar no ar antes da conta da Mercado Pago existir, e isso não é falha. */
  const [paymentsOff, setPaymentsOff] = useState(false);

  /* "Já é dono" só bloqueia a compra fora da janela de renovação: nos últimos
     45 dias o servidor aceita um pedido novo e ESTENDE o prazo, e esta tela
     precisa deixar a pessoa chegar até ele - era daqui que o botão "Renovar
     acesso" do painel saía para bater num "nada a pagar". */
  const restam = daysLeft(account.session, slug);
  const owned = account.can(slug) && (restam === null || restam > 45);
  const parcelas = parcelasMax(c.price);
  const total = method === 'pix' ? pixPrice(c.price) : c.price.brl;

  /* ── a consulta ──────────────────────────────────────────────────── */
  const startedAt = useRef<number>(0);
  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    /* No PIX direto ninguém vai responder esta pergunta: o dinheiro cai na
       conta do recebedor sem avisar o site, e a liberação é feita à mão. Uma
       consulta que roda cinco minutos para depois dizer "não apareceu" não
       informa nada - só ensina que o site não funciona. Ver `pagamento.modo`
       em data/empresa.json. */
    if (!CONFIRMA_SOZINHO) return;
    startedAt.current = startedAt.current || Date.now();
    let stop = false;

    const timer = setInterval(async () => {
      if (stop) return;
      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        setGaveUp(true);
        clearInterval(timer);
        return;
      }
      try {
        const fresh = await account.orderStatus(order.id);
        if (stop) return;
        setOrder(fresh);
        if (fresh.status === 'paid') {
          clearInterval(timer);
          /* A sessão tem de ser relida: é ela que passa a carregar o direito
             de acesso, e o portão do curso lê dela. */
          await account.refresh();
          track('course_completed', { id: `compra-${slug}` });
        }
      } catch {
        /* Uma falha de rede no meio de uma espera não é motivo para desistir:
           a próxima volta tenta de novo, e o prazo acima é quem desiste. */
      }
    }, POLL_MS);

    return () => { stop = true; clearInterval(timer); };
  }, [order, account, slug, CONFIRMA_SOZINHO]);

  const pay = useCallback(async () => {
    setBusy(true);
    setError(null);
    setGaveUp(false);
    startedAt.current = 0;
    try {
      const created = await account.startOrder({
        courseSlug: slug, method,
        ...(method === 'card' ? { installments: parcelas } : {})
      });
      /* O cartão sai daqui: quem coleta o número é a Mercado Pago, e é assim
         que esta plataforma nunca vê um dado de cartão. */
      if (created.redirectUrl) {
        window.location.href = created.redirectUrl;
        return;
      }
      setOrder(created);
    } catch (e) {
      if (e instanceof AuthError && e.code === 'payments-off') setPaymentsOff(true);
      else setError(e instanceof AuthError ? e.message : MESSAGES.server);
    } finally {
      setBusy(false);
    }
  }, [account, slug, method, parcelas]);

  /* ── o pagamento ainda não foi ligado ────────────────────────────── */
  if (paymentsOff) {
    return (
      <Shell course={c}>
        <Card tone="amber" className="p-6 grid gap-3">
          <Badge>Em configuração</Badge>
          <h2 className="font-display text-[21px] font-bold text-ink">
            O pagamento ainda não está ativado.
          </h2>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            A plataforma já está no ar, mas o meio de pagamento está sendo
            configurado. Sua conta ficou criada - escreva para o endereço abaixo
            com este e-mail e liberamos o acesso na mão enquanto isso.
          </p>
          <p className="font-ui text-[14px] text-ink">
            <a href={`mailto:${empresa.contato.emailSuporte}`}
               className="text-[var(--accent)] font-medium hover:underline">
              {empresa.contato.emailSuporte}
            </a>
          </p>
          <LinkButton href={`/cursos/${c.slug}`} variant="secondary" className="justify-self-start">
            Voltar ao curso
          </LinkButton>
        </Card>
      </Shell>
    );
  }

  /* ── já é dono ───────────────────────────────────────────────────── */
  if (account.ready && owned && order?.status !== 'paid') {
    return (
      <Shell course={c}>
        <Card tone="mint" className="p-6 grid gap-3">
          <Badge tone="mint">Já é seu</Badge>
          <h2 className="font-display text-[21px] font-bold text-ink">
            Este curso já está na sua conta.
          </h2>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            Nada a pagar. Continue de onde você parou.
          </p>
          <LinkButton href="/meu-hebraico" size="lg" className="justify-self-start">
            Ir para Meu Hebraico
          </LinkButton>
        </Card>
      </Shell>
    );
  }

  /* ── pago ────────────────────────────────────────────────────────── */
  if (order?.status === 'paid') {
    return (
      <Shell course={c}>
        <Card tone="mint" className="p-6 sm:p-8 grid gap-4 justify-items-center text-center">
          <He size="lg" dim>ע</He>
          <Badge tone="mint">Pagamento confirmado</Badge>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold text-ink max-w-[20ch]">
            Pronto. O curso é seu.
          </h2>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[44ch]">
            Acesso liberado por {c.accessMonths} meses. A primeira lição leva dez minutos.
          </p>
          <Button size="lg" onClick={() => router.push('/meu-hebraico')}>Começar agora</Button>
        </Card>
      </Shell>
    );
  }

  /* ── precisa de conta ────────────────────────────────────────────── */
  if (account.ready && !account.signedIn) {
    return (
      <Shell course={c}>
        <Card className="p-5 grid gap-2">
          <Badge tone="accent">Passo 1 de 2</Badge>
          <h2 className="font-display text-[19px] font-bold text-ink">
            Primeiro, sua conta.
          </h2>
          <p className="font-ui text-[14px] leading-relaxed text-ink-body">
            É ela que guarda o acesso. Leva quinze segundos e o pagamento vem logo
            em seguida, nesta mesma página.
          </p>
        </Card>
        {/* O mesmo formulário do /criar-conta, com o retorno apontando de volta
            para cá - quem cria a conta no meio da compra volta para a compra. */}
        <div className="-mx-4 sm:-mx-6">
          <AuthFormInline slug={slug} />
        </div>
      </Shell>
    );
  }

  /* ── pagamento ───────────────────────────────────────────────────── */
  return (
    <Shell course={c}>
      <Card className="p-5 sm:p-6 grid gap-5">
        <div className="grid gap-1">
          <Badge tone="accent">Passo 2 de 2</Badge>
          <h2 className="font-display text-[19px] font-bold text-ink mt-1">Como você quer pagar?</h2>
        </div>

        {/* A escolha só aparece quando existe escolha.
            ──────────────────────────────────────────────────────────────
            Duas coisas diferentes podem deixar uma forma só de pé, e as duas
            caem aqui:

            · o modo `pix-direto`, em que o cartão não tem como funcionar
              porque não há adquirente nenhum;
            · a conta da Mercado Pago não ter aquele meio habilitado, o que
              a publicação descobre perguntando a eles e grava em
              `pagamento.formas` (scripts/pagamento-ativo.mjs).

            Em ambos, oferecer a opção que falha é pior do que oferecer só a
            que funciona: quem escolhe e recebe erro conclui que o site está
            quebrado, e não volta para tentar a outra. E, em ambos, a escolha
            volta SOZINHA na publicação seguinte ao dia em que a forma voltar
            a existir - não há nada comentado no código esperando alguém
            lembrar de descomentar. */}
        {UMA_FORMA ? (
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body
                        bg-surface-2 rounded-[var(--r-md)] px-4 py-3">
            {SO_CARTAO ? (
              <>
                <strong>Cartão de crédito</strong> · {brl(c.price.brl)} à vista,
                ou parcelado em até {parcelas}x.
              </>
            ) : (
              <>
                <strong>PIX</strong> · {brl(total)}
                {c.price.pixDiscountPct > 0 && ` (${c.price.pixDiscountPct}% de desconto)`}.
                Você paga pelo aplicativo do seu banco.
              </>
            )}
          </p>
        ) : (
          <fieldset className="grid gap-3" disabled={order?.status === 'pending'}>
            <legend className="sr-only">Forma de pagamento</legend>

            <MethodOption
              checked={method === 'pix'} onSelect={() => setMethod('pix')}
              titlePt="PIX"
              detailPt={c.price.pixDiscountPct > 0
                ? `${brl(pixPrice(c.price))} - ${c.price.pixDiscountPct}% de desconto. Cai em segundos.`
                : `${brl(c.price.brl)}. Cai em segundos.`}
            />

            <MethodOption
              checked={method === 'card'} onSelect={() => setMethod('card')}
              titlePt="Cartão de crédito"
              detailPt={`${brl(c.price.brl)} à vista, ou parcelado em até ${parcelas}x.`}
            />
          </fieldset>
        )}

        {method === 'card' && (
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted
                        bg-surface-2 rounded-[var(--r-md)] px-4 py-3">
            O número do cartão é digitado na tela da Mercado Pago, não aqui. Esta
            plataforma nunca recebe os dados do seu cartão. É lá também que você
            escolhe em quantas vezes pagar e vê o valor de cada parcela, com os
            juros da operadora, antes de confirmar.
          </p>
        )}

        {error && (
          <p role="alert"
             className="font-ui text-[13.5px] leading-relaxed text-[var(--ember)]
                        bg-[var(--ember-wash)] rounded-[var(--r-md)] px-4 py-3">
            {error}
          </p>
        )}

        {/* ── esperando o PIX ──────────────────────────────────────── */}
        {order?.status === 'pending' && order.pix ? (
          <PixPanel
            order={order} copied={copied} gaveUp={gaveUp} automatico={CONFIRMA_SOZINHO}
            onCopy={async () => {
              try {
                await navigator.clipboard.writeText(order.pix!.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              } catch { setCopied(false); }
            }}
            onRetry={() => { setOrder(null); setGaveUp(false); }}
          />
        ) : order?.status === 'pending' ? (
          <p aria-live="polite" className="font-ui text-[14px] text-ink-body">
            Aguardando a confirmação do pagamento…
          </p>
        ) : (
          <>
            <CondicoesDaCompra curso={c} />
            <Button size="lg" full onClick={pay} disabled={busy}>
              {busy ? 'Gerando…' : `Pagar ${brl(total)}`}
            </Button>
            <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted text-center">
              Ao continuar você concorda com os{' '}
              <Link href="/termos" className="text-[var(--accent)] hover:underline">
                Termos de Uso
              </Link>{' '}
              e com a{' '}
              <Link href="/privacidade" className="text-[var(--accent)] hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </>
        )}
      </Card>
    </Shell>
  );
}

/* ── as condições da compra ─────────────────────────────────────────────
 *
 * O Decreto 7.962/2013 pede que as condições da oferta apareçam de forma
 * clara ANTES de fechar a compra - não escondidas num link, não depois. São
 * quatro perguntas, e todas as respostas saem de data/: o que você leva, por
 * quanto tempo, quando o acesso abre, e como desistir.
 *
 * Fica logo acima do botão de propósito. Uma condição que o leitor teria de
 * rolar para trás para encontrar não foi informada; foi arquivada.
 */
function CondicoesDaCompra({ curso }: { curso: CatalogCourse }) {
  const LINHAS: [string, React.ReactNode][] = [
    ['O que você leva', `Acesso completo ao ${curso.titlePt}, dentro da plataforma, pelo navegador.`],
    ['Por quanto tempo', `${curso.accessMonths} meses, contados da confirmação do pagamento.`],
    /* O prazo prometido aqui é o prazo que a plataforma consegue cumprir, e
       ele muda com o trilho de cobrança: com confirmação automática o acesso
       abre sozinho; no PIX direto alguém confere o extrato e libera. Uma
       condição de oferta que promete o que o sistema não faz é justamente o
       que o Decreto 7.962 existe para impedir. */
    ['Quando abre', confirmaSozinho()
      ? (temPix()
        ? 'Na hora em que o pagamento for confirmado - em minutos, no PIX.'
        : 'Na hora em que o pagamento for confirmado.')
      : 'Depois que o pagamento cair, normalmente em alguns minutos. Você entra na plataforma com seu e-mail e senha.'],
    ['Se você desistir', <>
      {empresa.politicas.arrependimentoDias} dias para cancelar e receber 100% de volta,
      sem justificar.{' '}
      <Link href="/reembolso" className="text-[var(--accent)] hover:underline">
        Política de reembolso
      </Link>.
    </>]
  ];

  return (
    <div className="rounded-[var(--r-md)] bg-surface-2 px-4 py-3.5 grid gap-2">
      <p className="font-ui text-[11.5px] uppercase tracking-[.08em] text-ink-muted">
        Condições desta compra
      </p>
      <dl className="grid gap-1.5 m-0">
        {LINHAS.map(([rotulo, valor]) => (
          <div key={rotulo}
               className="grid sm:grid-cols-[minmax(0,130px)_minmax(0,1fr)] gap-x-3 gap-y-0.5">
            <dt className="font-ui text-[12.5px] text-ink-muted">{rotulo}</dt>
            <dd className="m-0 min-w-0 font-ui text-[13px] leading-[1.5] text-ink-body">
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── o painel do PIX ──────────────────────────────────────────────────────
 *
 * Tem dois textos porque tem dois mundos, e a diferença entre eles é grande o
 * bastante para justificar dizer coisas diferentes:
 *
 * · `automatico` (Mercado Pago)  o provedor avisa, a tela pergunta de três em
 *   três segundos, e o acesso abre com a pessoa olhando. Aí "pode deixar esta
 *   página aberta" é verdade, e é a melhor instrução.
 *
 * · PIX direto  nada avisa ninguém. Alguém olha o extrato e libera. Prometer
 *   que a página se atualiza sozinha seria uma mentira que a própria pessoa
 *   descobre em trinta segundos, e o que ela conclui não é "o pagamento
 *   demora", é "o site está quebrado".
 *
 * Por isso o segundo texto diz o prazo real e diz o que fazer com ele: fechar
 * a página e voltar entrando na conta. Prometer menos e entregar antes gera
 * menos suporte do que o contrário.
 */
function PixPanel({
  order, copied, gaveUp, automatico, onCopy, onRetry
}: {
  order: Order; copied: boolean; gaveUp: boolean; automatico: boolean;
  onCopy: () => void; onRetry: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
          PIX copia e cola
        </p>
        <code className="block break-all rounded-[var(--r-md)] border border-line bg-surface-2
                         px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink-body">
          {order.pix!.code}
        </code>
        <Button variant="secondary" onClick={onCopy} full>
          {copied ? 'Copiado ✓' : 'Copiar código'}
        </Button>
      </div>

      {!automatico ? (
        <div className="grid gap-2">
          <p aria-live="polite" className="font-ui text-[14px] leading-relaxed text-ink-body
                                           bg-surface-2 rounded-[var(--r-md)] px-4 py-3">
            Pague pelo aplicativo do seu banco. Assim que o pagamento cair,
            liberamos seu acesso - normalmente em alguns minutos. Você pode
            fechar esta página: para ver o curso, entre com o mesmo e-mail e a
            mesma senha que você acabou de usar.
          </p>
          <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
            Se demorar mais do que isso, escreva para{' '}
            <a href={`mailto:${empresa.contato.emailSuporte}`}
               className="text-[var(--accent)] hover:underline">
              {empresa.contato.emailSuporte}
            </a>{' '}
            com o número do pedido: <code className="font-mono">{order.id}</code>.
          </p>
        </div>
      ) : gaveUp ? (
        <div className="grid gap-3">
          <p role="alert" className="font-ui text-[14px] leading-relaxed text-ink-body
                                     bg-[var(--amber-wash)] rounded-[var(--r-md)] px-4 py-3">
            O pagamento ainda não apareceu por aqui. Se você já pagou, o acesso
            entra sozinho assim que o banco confirmar - recarregue esta página
            em alguns minutos. Se não pagou, dá para gerar um código novo.
          </p>
          <Button variant="secondary" onClick={onRetry} full>Gerar outro código</Button>
        </div>
      ) : (
        <p aria-live="polite" className="font-ui text-[14px] leading-relaxed text-ink-body">
          Esperando o pagamento cair. Pode deixar esta página aberta - ela se
          atualiza sozinha.
        </p>
      )}
    </div>
  );
}

/* ── peças ────────────────────────────────────────────────────────────── */

function MethodOption({
  checked, onSelect, titlePt, detailPt
}: { checked: boolean; onSelect: () => void; titlePt: string; detailPt: string }) {
  return (
    <label className={`flex items-start gap-3 rounded-[var(--r-md)] border-2 p-4 cursor-pointer
      transition-colors ${checked ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]'
                                  : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}>
      <input
        type="radio" name="metodo" checked={checked} onChange={onSelect}
        className="mt-1 w-[18px] h-[18px] accent-[var(--accent)]"
      />
      <span className="grid gap-0.5 min-w-0">
        <span className="font-ui text-[15px] font-semibold text-ink">{titlePt}</span>
        <span className="font-ui text-[13px] leading-relaxed text-ink-body">{detailPt}</span>
      </span>
    </label>
  );
}

/** O formulário de conta, apontando o retorno para o próprio checkout. */
function AuthFormInline({ slug }: { slug: string }) {
  /* AuthForm lê `?next=` da URL, e aqui a URL é a do checkout. Em vez de
     duplicar o formulário com outra prop, o link de retorno é o endereço
     atual - que é exatamente o que a pessoa quer: voltar para a compra. */
  return <AuthForm mode="signup" key={slug} />;
}

function Shell({ course, children }: {
  course: ReturnType<typeof getCourse>; children: React.ReactNode;
}) {
  const c = course!;
  const parcelas = parcelasMax(c.price);
  return (
    <div className="mx-auto w-full max-w-[880px] px-4 sm:px-6 py-10 sm:py-14
                    grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="grid gap-5">
        <nav aria-label="Você está em" className="font-ui text-[13px] text-ink-muted">
          <Link href={`/cursos/${c.slug}`} className="hover:text-[var(--accent)]">
            {c.titlePt}
          </Link>
          <span aria-hidden> · </span>
          <span>Pagamento</span>
        </nav>
        {children}
      </div>

      {/* O resumo fica visível o tempo todo, inclusive no celular, onde ele
          vai para cima do formulário e não para baixo dele - ninguém paga o
          que não consegue ver. */}
      <Card tone="wash" className="p-5 grid gap-3 content-start order-first lg:order-last">
        <p className="font-ui text-[11px] uppercase tracking-[.08em] text-[var(--accent)]">
          Seu pedido
        </p>
        <p className="font-display text-[17px] font-bold text-ink leading-snug">{c.titlePt}</p>
        <p className="font-ui text-[13px] text-ink-muted">
          {c.stats.modules} módulos
          {c.stats.lessons ? ` · ${c.stats.lessons} lições` : ''}
          {' · '}{c.accessMonths} meses de acesso
        </p>
        {/* O número grande é o número que vai ser cobrado.
            ──────────────────────────────────────────────────────────────
            Quando só existe PIX, o valor cheio em destaque e um "ou 12x" logo
            abaixo descrevem uma compra que não está à venda - e o resumo do
            pedido é justamente onde a pessoa confere quanto vai sair. Aqui o
            desconto do PIX deixa de ser uma alternativa e passa a ser o preço,
            com o valor cheio ficando como referência.

            E o inverso vale igual: sem PIX habilitado, a linha "R$ X no PIX"
            anuncia um desconto que o checkout não tem como dar. Um preço
            anunciado e não praticado não é detalhe de tela - é propaganda
            enganosa, e o lugar onde ela apareceria é exatamente onde a
            pessoa decide. */}
        {soPix() ? (
          <div className="border-t border-[color:var(--line-soft)] pt-3 grid gap-1">
            <p className="font-display text-[26px] font-bold text-ink leading-none">
              {brl(pixPrice(c.price))}
            </p>
            <p className="font-ui text-[12.5px] text-ink-body">
              no PIX
              {c.price.pixDiscountPct > 0
                && ` · ${c.price.pixDiscountPct}% de desconto sobre ${brl(c.price.brl)}`}
            </p>
          </div>
        ) : (
          <div className="border-t border-[color:var(--line-soft)] pt-3 grid gap-1">
            <p className="font-display text-[26px] font-bold text-ink leading-none">
              {brl(c.price.brl)}
            </p>
            <p className="font-ui text-[12.5px] text-ink-body">
              ou em até {parcelas}x no cartão
            </p>
            {c.price.pixDiscountPct > 0 && temPix() && (
              <p className="font-ui text-[12.5px] font-medium text-[var(--accent)]">
                {brl(pixPrice(c.price))} no PIX
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
