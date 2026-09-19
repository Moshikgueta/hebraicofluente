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
import { getCourse } from '@/lib/catalog';
import type { OrderStatus } from '@/lib/account/types';
import { empresa } from '@/lib/empresa';

const POLL_MS = 3_000;
const GIVE_UP_MS = 3 * 60_000;

type Phase = 'checking' | 'paid' | 'pending' | 'failed' | 'unknown';

export function ObrigadoClient({ slug }: { slug: string }) {
  const account = useAccount();
  const params = useSearchParams();
  const c = getCourse(slug)!;
  const orderId = params.get('order');

  const [phase, setPhase] = useState<Phase>('checking');
  const started = useRef(Date.now());

  useEffect(() => {
    if (!account.ready) return;

    /* Sem id de pedido não há o que conferir. Mesmo assim vale reler a sessão:
       o webhook pode já ter liberado o acesso enquanto o navegador voltava. */
    if (!orderId) {
      void account.refresh().then(() => {
        setPhase(account.can(slug) ? 'paid' : 'unknown');
      });
      return;
    }

    let stop = false;
    const check = async () => {
      if (stop) return;
      try {
        const order = await account.orderStatus(orderId);
        if (stop) return;
        const map: Record<OrderStatus, Phase> = {
          paid: 'paid', pending: 'pending',
          failed: 'failed', expired: 'failed', refunded: 'failed'
        };
        if (order.status === 'paid') {
          await account.refresh();
          if (!stop) setPhase('paid');
          return true;
        }
        setPhase(Date.now() - started.current > GIVE_UP_MS ? map[order.status] : 'checking');
      } catch {
        if (Date.now() - started.current > GIVE_UP_MS) setPhase('unknown');
      }
      return false;
    };

    void check();
    const timer = setInterval(async () => {
      if (await check() || Date.now() - started.current > GIVE_UP_MS) clearInterval(timer);
    }, POLL_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [account, account.ready, orderId, slug]);

  if (!account.ready || phase === 'checking') {
    return (
      <Wrap>
        <Card className="p-8 grid gap-4 justify-items-center text-center" aria-busy="true">
          <Skeleton className="h-[52px] w-[52px] rounded-full" />
          <p className="font-display text-[19px] font-bold text-ink">
            Confirmando seu pagamento…
          </p>
          <p className="font-ui text-[14px] leading-relaxed text-ink-muted max-w-[40ch]">
            Isso costuma levar alguns segundos. Não feche esta página.
          </p>
        </Card>
      </Wrap>
    );
  }

  if (phase === 'paid') {
    return (
      <Wrap>
        <Card tone="mint" className="p-8 grid gap-4 justify-items-center text-center">
          <He size="lg" dim>ע</He>
          <Badge tone="mint">Pagamento confirmado</Badge>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-ink max-w-[20ch]">
            Pronto. O curso é seu.
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[44ch]">
            {c.titlePt}, liberado por {c.accessMonths} meses. A primeira lição
            leva dez minutos.
          </p>
          <LinkButton href="/meu-hebraico" size="lg">Começar agora</LinkButton>
        </Card>
      </Wrap>
    );
  }

  if (phase === 'pending') {
    return (
      <Wrap>
        <Card tone="amber" className="p-8 grid gap-4">
          <h1 className="font-display text-[23px] font-bold text-ink">
            O pagamento ainda está em análise.
          </h1>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            Acontece com alguns cartões e com boleto: o banco leva um tempo para
            responder. Você não precisa fazer nada - assim que a confirmação
            chegar, o acesso entra sozinho e o curso aparece em Meu Hebraico.
          </p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
            Se em algumas horas nada acontecer, escreva para{' '}
            <a href={`mailto:${empresa.contato.emailSuporte}`}
               className="text-[var(--accent)] hover:underline">
              {empresa.contato.emailSuporte}
            </a>{' '}
            com o e-mail da compra.
          </p>
          <LinkButton href="/meu-hebraico" variant="secondary" className="justify-self-start">
            Ir para Meu Hebraico
          </LinkButton>
        </Card>
      </Wrap>
    );
  }

  /* failed e unknown caem aqui. A diferença entre "recusado" e "não consegui
     descobrir" importa para o texto, mas a saída é a mesma: tentar de novo,
     sem acusar o comprador de nada. */
  return (
    <Wrap>
      <Card className="p-8 grid gap-4">
        <h1 className="font-display text-[23px] font-bold text-ink">
          {phase === 'failed' ? 'O pagamento não foi concluído.' : 'Não consegui confirmar por aqui.'}
        </h1>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {phase === 'failed'
            ? 'Nada foi cobrado. Pode ter sido o limite, um dado digitado errado ou uma recusa do banco - dá para tentar de novo com outro cartão ou por PIX.'
            : 'Se você já pagou, o acesso entra sozinho assim que a confirmação chegar: abra Meu Hebraico daqui a alguns minutos. Se não pagou, é só refazer.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/checkout/${slug}`}>Tentar de novo</LinkButton>
          <LinkButton href="/meu-hebraico" variant="secondary">Meu Hebraico</LinkButton>
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
