'use client';

/* A volta da Mercado Pago.
 * ─────────────────────────────────────────────────────────────────────────
 * O comprador digitou o cartão lá e foi devolvido para cá com parâmetros na
 * query: `?order=…&status=approved&payment_id=…`.
 *
 * ESSES PARÂMETROS NÃO VALEM NADA. Qualquer pessoa pode digitá-los na barra
 * de endereço, e uma plataforma que libera acesso a partir deles está dando o
 * curso para quem souber escrever `status=approved`. O único uso legítimo
 * deles aqui é o `order`: qual pedido conferir.
 *
 * Quem responde se foi pago é o servidor, que por sua vez reconfere com a
 * Mercado Pago pelo id do pagamento. É a mesma regra do projeto irmão em
 * espanhol, que a aprendeu com um provedor sem webhook assinado.
 *
 * Esta tela também é a rede de segurança do caso chato: o pagamento cai mas a
 * confirmação demora. Ela espera, com limite, e explica o que fazer quando
 * desiste - nunca gira para sempre.
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { useAccount } from '@/lib/account/store';
import { getCourse, tipoDe } from '@/lib/catalog';
import { empresa } from '@/lib/empresa';
import { decidirFase, DESISTE_MS, FINAL, type Fase } from './fase';
import { tx } from '@/i18n/telas/conta-obrigado';

const POLL_MS = 3_000;

export function ObrigadoClient({ slug }: { slug: string }) {
  const account = useAccount();
  const params = useSearchParams();
  const c = getCourse(slug)!;
  const orderId = params.get('order');
  /* O que a Mercado Pago escreveu na volta. Só TEXTO (ver ./fase.ts). */
  const dica = params.get('collection_status') ?? params.get('status');

  const [phase, setPhase] = useState<Fase>('conferindo');
  const started = useRef(Date.now());

  useEffect(() => {
    if (!account.ready) return;

    /* Sem id de pedido não há o que conferir. Mesmo assim vale reler a sessão:
       o webhook pode já ter liberado o acesso enquanto o navegador voltava. */
    if (!orderId) {
      void account.refresh().then(() => {
        setPhase(account.can(slug) ? 'pago' : 'desconhecido');
      });
      return;
    }

    let stop = false;
    /* Devolve true quando não adianta mais perguntar. */
    const check = async (): Promise<boolean> => {
      if (stop) return true;
      const passou = Date.now() - started.current;
      try {
        const order = await account.orderStatus(orderId);
        if (stop) return true;
        const fase = decidirFase({
          status: order.status, ultimoPagamento: order.ultimoPagamento,
          metodo: order.method, passouMs: passou, dica
        });
        if (fase === 'pago') {
          await account.refresh();
        }
        if (!stop) setPhase(fase);
        return FINAL.has(fase);
      } catch {
        if (passou > DESISTE_MS) setPhase('desconhecido');
      }
      return false;
    };

    void check();
    /* Continua perguntando nas fases que ainda podem mudar (em análise, sem
       pagamento): um cartão aprovado depois troca a tela sozinho. */
    const timer = setInterval(async () => {
      if (await check() || Date.now() - started.current > DESISTE_MS) clearInterval(timer);
    }, POLL_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [account, account.ready, orderId, slug, dica]);

  const suporte = (
    <a href={`mailto:${empresa.contato.emailSuporte}`}
       className="text-[var(--accent)] hover:underline">
      {empresa.contato.emailSuporte}
    </a>
  );

  if (!account.ready || phase === 'conferindo') {
    return (
      <Wrap>
        <Card className="p-8 grid gap-4 justify-items-center text-center" aria-busy="true">
          <Skeleton className="h-[52px] w-[52px] rounded-full" />
          <p className="font-display text-[19px] font-bold text-ink">
            {tx.confirmando}
          </p>
          <p className="font-ui text-[14px] leading-relaxed text-ink-muted max-w-[40ch]">
            {tx.naoFeche}
          </p>
        </Card>
      </Wrap>
    );
  }

  if (phase === 'pago') {
    return (
      <Wrap>
        <Card tone="mint" className="p-8 grid gap-4 justify-items-center text-center">
          <He size="lg" dim>ע</He>
          <Badge tone="mint">{tx.pagamentoConfirmado}</Badge>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-ink max-w-[20ch]">
            {tipoDe(c) === 'livro' ? tx.prontoLivro : tipoDe(c) === 'pacote' ? tx.prontoCombo : tx.prontoCurso}
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[44ch]">
            {tipoDe(c) === 'livro'
              ? tx.livroLiberado(c.titlePt, c.accessMonths)
              : tipoDe(c) === 'pacote'
                ? tx.comboLiberado
                : tx.cursoLiberado(c.titlePt, c.accessMonths)}
          </p>
          {tipoDe(c) === 'livro'
            /* /israel/ é uma página estática fora do app: link comum, sem o roteador. */
            ? <a href={c.abre ?? '/israel/'} className="inline-flex items-center min-h-[48px] px-5 rounded-full bg-[var(--accent-bg)] text-white font-ui font-semibold">{tx.abrirLivro}</a>
            : tipoDe(c) === 'pacote'
              ? <LinkButton href="/minha-biblioteca" size="lg">{tx.abrirBiblioteca}</LinkButton>
              : <LinkButton href="/meu-hebraico" size="lg">{tx.comecarAgora}</LinkButton>}
        </Card>
      </Wrap>
    );
  }

  /* Um cartão em análise pela operadora (antifraude). Só aparece quando o
     servidor SABE que existe um pagamento esperando - nunca para um pedido
     sem pagamento nenhum. Continua perguntando por trás. */
  if (phase === 'em-analise') {
    return (
      <Wrap>
        <Card tone="amber" className="p-8 grid gap-4">
          <h1 className="font-display text-[23px] font-bold text-ink">
            {tx.emAnalise}
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            {tx.emAnaliseTexto}
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
            {tx.emAnalisePrazoAntes}{suporte}{tx.emAnalisePrazoDepois}
          </p>
          <LinkButton href="/meu-hebraico" variant="secondary" className="justify-self-start">
            {tx.irParaMeuHebraico}
          </LinkButton>
        </Card>
      </Wrap>
    );
  }

  /* Houve pagamento, e ele foi devolvido. "Nada foi cobrado" seria falso. */
  if (phase === 'devolvido') {
    return (
      <Wrap>
        <Card className="p-8 grid gap-4">
          <h1 className="font-display text-[23px] font-bold text-ink">
            {tx.devolvido}
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            {tx.devolvidoTextoAntes}{suporte}{tx.devolvidoTextoDepois}
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/perfil" variant="secondary">{tx.verMinhasCompras}</LinkButton>
          </div>
        </Card>
      </Wrap>
    );
  }

  if (phase === 'recusado') {
    return (
      <Wrap>
        <Card className="p-8 grid gap-4">
          <h1 className="font-display text-[23px] font-bold text-ink">
            {tx.recusado}
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            {tx.recusadoTexto}
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/checkout/${slug}`}>{tx.tentarDeNovo}</LinkButton>
          </div>
        </Card>
      </Wrap>
    );
  }

  /* O pedido existe e nenhum pagamento apareceu: quem saiu da tela da
     Mercado Pago sem concluir. Sem "em análise" - não há nada
     sendo analisado. */
  if (phase === 'sem-pagamento' || phase === 'expirado') {
    return (
      <Wrap>
        <Card className="p-8 grid gap-4">
          <h1 className="font-display text-[23px] font-bold text-ink">
            {phase === 'expirado'
              ? tx.expirado
              : tx.semPagamento}
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            {phase === 'expirado'
              ? tx.expiradoTexto
              : tx.semPagamentoTexto}
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/checkout/${slug}`}>{tx.tentarDeNovo}</LinkButton>
            <LinkButton href="/meu-hebraico" variant="secondary">{tx.meuHebraico}</LinkButton>
          </div>
        </Card>
      </Wrap>
    );
  }

  /* nao-concluido e desconhecido. A saída é a mesma: tentar de novo, sem
     acusar o comprador de nada. */
  return (
    <Wrap>
      <Card className="p-8 grid gap-4">
        <h1 className="font-display text-[23px] font-bold text-ink">
          {phase === 'nao-concluido' ? tx.naoConcluido : tx.naoConsegui}
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {phase === 'nao-concluido'
            ? tx.naoConcluidoTexto
            : tx.naoConseguiTexto}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/checkout/${slug}`}>{tx.tentarDeNovo}</LinkButton>
          <LinkButton href="/meu-hebraico" variant="secondary">{tx.meuHebraico}</LinkButton>
        </div>
      </Card>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 sm:px-6 py-12 sm:py-16">
      {children}
    </div>
  );
}
