'use client';

/* Sua conta.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro blocos e nenhuma configuração inventada: dados, cursos, números e
 * compras. Uma página de perfil cheia de interruptor que não liga nada é pior
 * do que uma página curta.
 *
 * Duas coisas que esta página diz e quase nenhuma diz:
 *
 *   · até quando vai o acesso, em data, por curso;
 *   · que o progresso é deste aparelho. Isso é uma limitação real de hoje
 *     (ver lib/account/store.tsx) e o lugar de contá-la é aqui, onde a pessoa
 *     está olhando os próprios números - não numa nota de rodapé que ela
 *     descobre no dia em que troca de celular.
 *
 * "Sair" pede confirmação porque, como o progresso é local e a sessão é o que
 * dá acesso, sair no aparelho errado é chato de desfazer sem a senha.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { useProgress } from '@/lib/state/store';
import { daysLeft, type Order } from '@/lib/account/types';
import { allCourses, brl, FLAGSHIP, getCourse } from '@/lib/catalog';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { course } from '@/lib/content';
import { api } from '@/lib/account/api';

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function PerfilClient() {
  const account = useAccount();
  const p = useProgress();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!account.signedIn) return;
    let stop = false;
    void (async () => {
      const list = await (await api()).orders().catch(() => []);
      if (!stop) setOrders(list);
    })();
    return () => { stop = true; };
  }, [account.signedIn]);

  if (!account.ready || !account.session) return null;
  const me = account.session.account;

  return (
    <div className="focus-col grid gap-6 py-2">
      <header className="grid gap-2">
        <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">Sua conta</h1>
        <p className="font-ui text-[15px] text-ink-muted">
          Seus dados, seus cursos e o que você já fez.
        </p>
      </header>

      {/* ── dados ─────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Dados</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row k="Nome" v={me.name || '-'} />
          <Row k="E-mail" v={me.email} />
          <Row k="Conta criada em" v={date(me.createdAt)} />
        </dl>
        <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                      border-t border-[color:var(--line-soft)] pt-3">
          Para trocar o e-mail ou a senha, escreva para{' '}
          <a href="mailto:contato@hebraicofluente.com.br"
             className="text-[var(--accent)] hover:underline">
            contato@hebraicofluente.com.br
          </a>
          . A edição pela própria tela ainda não está no ar - e dizer isso é
          melhor do que um botão que não faz nada.
        </p>
      </Card>

      {/* ── cursos ────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Seus cursos</h2>
        <ul className="grid gap-3 list-none p-0 m-0">
          {allCourses().map(c => {
            const ent = account.session!.entitlements.find(e => e.courseSlug === c.slug);
            const left = daysLeft(account.session, c.slug);
            const owned = account.can(c.slug);
            return (
              <li key={c.slug}
                  className="flex flex-wrap items-center gap-3 border-b border-[color:var(--line-soft)]
                             pb-3 last:border-0 last:pb-0">
                <span className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-ui text-[15px] font-medium text-ink">{c.titlePt}</span>
                  <span className="font-ui text-[12.5px] text-ink-muted">
                    {owned && ent?.expiresAt
                      ? `Acesso até ${date(ent.expiresAt)}${left !== null && left <= 30 ? ` · ${left} ${left === 1 ? 'dia' : 'dias'}` : ''}`
                      : ent
                        ? 'Acesso encerrado'
                        : c.status === 'soon' ? 'Ainda não lançado' : 'Não está na sua conta'}
                  </span>
                </span>
                {owned
                  ? <Badge tone="mint">Ativo</Badge>
                  : c.status === 'soon'
                    ? <Badge>Em breve</Badge>
                    : <LinkButton href={`/cursos/${c.slug}`} variant="secondary" size="sm">
                        Ver o curso
                      </LinkButton>}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ── números ───────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Seu progresso</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            ['Letras', `${p.mastered}/${course.totalLetters}`],
            ['Curso', `${Math.round(p.progress * 100)}%`],
            ['Sequência', p.streak === 0 ? '-' : `${p.streak} d`],
            ['Conquistas', `${p.state.achievements.length}/${ACHIEVEMENTS.length}`]
          ] as const).map(([k, v]) => (
            <div key={k} className="grid gap-0.5">
              <dt className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
              <dd className="font-display text-[20px] font-bold text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                      border-t border-[color:var(--line-soft)] pt-3">
          Estes números são deste aparelho. Hoje o progresso é guardado no
          navegador e não viaja com a conta - se você abrir o curso no
          computador, o acesso vai junto, o progresso não. A sincronização está
          no plano.
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/conquistas" variant="secondary" size="sm">Ver conquistas</LinkButton>
          {p.state.finalChallenge.passedAt && (
            <LinkButton href="/certificado" variant="secondary" size="sm">Meu certificado</LinkButton>
          )}
        </div>
      </Card>

      {/* ── compras ───────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Compras</h2>
        {orders === null ? (
          <p className="font-ui text-[14px] text-ink-muted">Carregando…</p>
        ) : orders.length === 0 ? (
          <p className="font-ui text-[14px] leading-relaxed text-ink-muted">
            Nenhuma compra registrada nesta conta.
          </p>
        ) : (
          <ul className="grid gap-3 list-none p-0 m-0">
            {orders.map(o => (
              <li key={o.id}
                  className="flex flex-wrap items-center gap-3 border-b border-[color:var(--line-soft)]
                             pb-3 last:border-0 last:pb-0">
                <span className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-ui text-[14.5px] text-ink">
                    {getCourse(o.courseSlug)?.titlePt ?? o.courseSlug}
                  </span>
                  <span className="font-ui text-[12.5px] text-ink-muted tabular-nums">
                    {date(o.createdAt)} · {o.method === 'pix' ? 'PIX' : 'Cartão'} ·{' '}
                    {brl(o.amountCents / 100)}
                  </span>
                </span>
                <Badge tone={o.status === 'paid' ? 'mint' : o.status === 'pending' ? 'neutral' : 'ember'}>
                  {{ paid: 'Pago', pending: 'Aguardando', failed: 'Não concluído',
                     refunded: 'Estornado', expired: 'Expirado' }[o.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── sair ──────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-bold text-ink">Sair</h2>
        {confirming ? (
          <>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Você vai precisar do e-mail e da senha para voltar. Seu progresso
              neste aparelho continua onde está.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={async () => { await account.signOut(); router.replace('/'); }}
              >
                Sair mesmo assim
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Button>
            </div>
          </>
        ) : (
          <Button variant="secondary" className="justify-self-start"
                  onClick={() => setConfirming(true)}>
            Sair da conta
          </Button>
        )}
      </Card>

      {!account.can(FLAGSHIP) && (
        <p className="font-ui text-[13px] text-ink-muted">
          Você está logado, mas ainda não tem nenhum curso ativo.{' '}
          <LinkButton href={`/cursos/${FLAGSHIP}`} variant="ghost" size="sm">Ver os cursos</LinkButton>
        </p>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
      <dd className="font-ui text-[14.5px] text-ink break-words">{v}</dd>
    </div>
  );
}
