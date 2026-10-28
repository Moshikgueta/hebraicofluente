'use client';

/* Minha Biblioteca (23/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Tudo que a conta tem, num lugar só: o curso de Alfabetização, o Israel Além
 * do Óbvio, o A1 e o Raízes Sefarditas, cada um com "Abrir" e a data em que o
 * acesso termina. Quem comprou o combo vê os dois, no mesmo login: o combo não
 * é um direito, ele libera os direitos das partes (itensDoPedido, worker).
 *
 * Mora na casca PÚBLICA, e não na do curso: quem comprou só o Israel Além do
 * Óbvio não tem o curso, e a casca do curso o mandaria para a página de venda.
 * Por isso a própria página pede o login. Ela não mostra conteúdo pago: só
 * nomes e links, e cada link passa pelo portão do servidor, que decide.
 */

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useAccount } from '@/lib/account/store';
import { api } from '@/lib/account/api';
import { entitlementFor, type Compras } from '@/lib/account/types';
import { FLAGSHIP, getCourse, paginaDeVenda } from '@/lib/catalog';
import { empresa, whatsappUrl } from '@/lib/empresa';
import { proximoPasso } from '@/lib/cta';
import { Container, Rubrica } from '@/components/landing/base';
import { nomeNaVitrine } from '@/components/portal/OpcoesDeCompra';
import { tx } from '@/i18n/telas/conta-biblioteca';

/** Os produtos que viram direito na conta, na ordem da estante, e onde abrem.
 *  `html`: página estática atrás do portão, aberta com link comum. */
const ESTANTE: { slug: string; abre: string; html?: boolean; nome?: string; resumo: string }[] = [
  { slug: FLAGSHIP, abre: '', resumo: tx.resumoCurso },
  { slug: 'israel-alem-do-roteiro', abre: '/israel/', html: true, resumo: tx.resumoLivro },
  { slug: 'hebraico-a1', abre: '/a1/', resumo: tx.resumoA1 },
  { slug: 'raizes-sefarditas', abre: '/raizes/', nome: tx.nomeRaizes, resumo: tx.resumoRaizes }
];

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }); // etapa 1: data em pt-BR

export function BibliotecaClient() {
  const account = useAccount();
  const passo = proximoPasso(account);

  if (!account.ready) {
    return <Moldura><p className="m-0 font-ui text-[16px] text-ink-muted">{tx.abrindo}</p></Moldura>;
  }
  if (!account.signedIn) {
    return (
      <Moldura>
        <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[52ch]">
          {tx.entreNaConta}
        </p>
        <Link href={`/entrar?next=${encodeURIComponent('/minha-biblioteca')}`}
              className="justify-self-start inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                         bg-[var(--navy)] text-white font-ui text-[15.5px] font-semibold">
          {tx.entrar}
        </Link>
      </Moldura>
    );
  }

  const itens = ESTANTE
    .map(i => ({ ...i, direito: entitlementFor(account.session, i.slug) }))
    .filter(i => i.direito);

  return (
    <Moldura>
      {itens.length === 0 ? (
        <Vazia email={account.session!.account.email} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0">
          {itens.map(i => {
            const c = getCourse(i.slug);
            const nome = i.nome ?? (c ? nomeNaVitrine(c) : i.slug);
            const href = i.slug === FLAGSHIP ? passo.href : i.abre;
            const rotulo = i.slug === FLAGSHIP ? passo.label : tx.abrir;
            const classe = `justify-self-start inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[var(--r-md)]
                            bg-[var(--navy)] text-white font-ui text-[15px] font-semibold
                            transition-[background-color,transform] duration-[var(--dur)] hover:bg-[var(--navy-2)] active:scale-[.98]`;
            return (
              <li key={i.slug} className="grid content-start gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6">
                <h2 className="m-0 font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">{nome}</h2>
                <p className="m-0 font-ui text-[15px] leading-[1.55] text-ink-body">{i.resumo}</p>
                <p className="m-0 font-ui text-[13.5px] text-ink-muted">
                  {i.direito!.expiresAt ? tx.acessoAte(data(i.direito!.expiresAt)) : tx.acessoSemFim}
                </p>
                {i.html
                  ? <a href={href} className={classe}>{rotulo}<span aria-hidden>→</span></a>
                  : <Link href={href} className={classe}>{rotulo}<span aria-hidden>→</span></Link>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="m-0 font-ui text-[14px] text-ink-muted">
        {tx.comprasEmSuaContaAntes}<Link href="/perfil" className="underline underline-offset-[3px]">{tx.suaConta}</Link>.
      </p>
    </Moldura>
  );
}

/* A biblioteca VAZIA (27/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Uma aluna entrou, viu "Sua biblioteca ainda está vazia" e um link miúdo, e
 * escreveu ao dono: "não consegui...". A tela não dizia em qual conta ela
 * estava, nem se havia um pagamento esperando, nem como começar o curso. É o
 * mesmo estado que a página do curso já trata ("Esta conta ainda não tem o
 * curso", CourseClient): conta conectada sem direito nenhum. Então a tela
 * lê as compras da conta e diz a coisa certa para cada caso:
 *
 *   · pagamento AGUARDANDO: conferir o pagamento (e o código PIX em Sua conta);
 *   · acesso VENCIDO: renovar (vem antes do pago: o pedido de um acesso
 *     vencido continua `paid`);
 *   · pedido PAGO sem acesso: não pagar de novo, falar com a gente;
 *   · nada disso: o botão do curso, em destaque.
 *
 * Em todos, o e-mail da conta (comprar com outro e-mail é o caso mais comum)
 * e o caminho do atendimento. */
function Vazia({ email }: { email: string }) {
  const [compras, setCompras] = useState<Compras | null>(null);
  useEffect(() => {
    let parar = false;
    void (async () => {
      const r = await (await api()).compras().catch(() => ({ orders: [], vencidos: [] }) as Compras);
      if (!parar) setCompras(r);
    })();
    return () => { parar = true; };
  }, []);

  const pendente = compras?.orders.find(o => o.status === 'pending');
  const pago = compras?.orders.find(o => o.status === 'paid');
  const vencido = compras?.vencidos[0];
  const zap = whatsappUrl();
  const nomeDe = (slug: string) => {
    const c = getCourse(slug);
    return c ? nomeNaVitrine(c) : slug;
  };
  const botao = `justify-self-start inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-[var(--r-md)]
                 bg-[var(--navy)] text-white font-ui text-[15.5px] font-semibold
                 transition-[background-color,transform] duration-[var(--dur)] hover:bg-[var(--navy-2)] active:scale-[.98]`;
  const link = 'font-ui font-semibold text-[var(--teal-ink)] underline underline-offset-[3px]';

  return (
    <div className="grid gap-5">
      <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[56ch]">
        {tx.conectadoComo}<strong className="break-all text-ink">{email}</strong>{tx.semNenhumCurso}
      </p>

      {compras === null ? null : pendente ? (
        <div className="grid gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6">
          <h2 className="m-0 font-display text-[20px] font-semibold leading-[1.25] text-ink">
            {tx.pagamentoEsperando}
          </h2>
          <p className="m-0 font-ui text-[15px] leading-[1.6] text-ink-body">
            {tx.pendente(nomeDe(pendente.courseSlug), pendente.method === 'pix')}
          </p>
          <Link href={`/checkout/${pendente.courseSlug}/obrigado?order=${encodeURIComponent(pendente.id)}`} className={botao}>
            {tx.conferirPagamento}<span aria-hidden>→</span>
          </Link>
          <Link href="/perfil" className={`justify-self-start text-[15px] ${link}`}>{tx.verCodigoPix}</Link>
        </div>
      ) : vencido ? (
        <div className="grid gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6">
          <h2 className="m-0 font-display text-[20px] font-semibold leading-[1.25] text-ink">
            {tx.acessoTerminou(data(vencido.expiredAt))}
          </h2>
          <p className="m-0 font-ui text-[15px] leading-[1.6] text-ink-body">
            {tx.vencido(nomeDe(vencido.courseSlug))}
          </p>
          <Link href={`/checkout/${vencido.courseSlug}`} className={botao}>{tx.renovar}<span aria-hidden>→</span></Link>
        </div>
      ) : pago ? (
        <div className="grid gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6">
          <h2 className="m-0 font-display text-[20px] font-semibold leading-[1.25] text-ink">
            {tx.constaComoPago}
          </h2>
          <p className="m-0 font-ui text-[15px] leading-[1.6] text-ink-body">
            <strong>{tx.naoPagueDeNovo}</strong>{tx.pagoSemAcesso}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <Link href={paginaDeVenda(FLAGSHIP)} className={botao}>
            {tx.comecarCurso}<span aria-hidden>→</span>
          </Link>
          <Link href="/cursos/" className={`justify-self-start text-[15px] ${link}`}>
            {tx.verTudo}
          </Link>
        </div>
      )}

      <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5 max-w-[60ch]">
        <p className="m-0 font-ui text-[15px] leading-[1.6] text-ink-body">
          {tx.outroEmail}{' '}
          <Link href={`/entrar?next=${encodeURIComponent('/minha-biblioteca')}`} className={link}>{tx.entrarComOutro}</Link>
        </p>
        <p className="m-0 font-ui text-[15px] leading-[1.6] text-ink-body">
          {tx.jaPagou}<strong>{tx.naoPagueDeNovo}</strong>{tx.faleComAGente}
          {zap ? <>{tx.pelo}<a href={zap} target="_blank" rel="noopener noreferrer" className={link}>{tx.whatsapp}</a>{tx.ou}</> : null}
          {' '}{tx.por}<a href={`mailto:${empresa.contato.emailSuporte}`} className={`break-all ${link}`}>{empresa.contato.emailSuporte}</a>
          {tx.comEmailDaCompra}
        </p>
      </div>
    </div>
  );
}

function Moldura({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="biblioteca-titulo">
      <Container className="py-12 sm:py-16 grid gap-6 max-w-[920px]">
        <Rubrica>{tx.suaConta}</Rubrica>
        <h1 id="biblioteca-titulo"
            className="m-0 font-display font-semibold text-[clamp(32px,4.6vw,48px)] leading-[1.05] tracking-[-0.03em] text-ink">
          {tx.minhaBiblioteca}
        </h1>
        {children}
      </Container>
    </section>
  );
}
