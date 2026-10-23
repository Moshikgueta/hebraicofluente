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
import type { ReactNode } from 'react';
import { useAccount } from '@/lib/account/store';
import { entitlementFor } from '@/lib/account/types';
import { FLAGSHIP, getCourse } from '@/lib/catalog';
import { proximoPasso } from '@/lib/cta';
import { Container, Rubrica } from '@/components/landing/base';
import { nomeNaVitrine } from '@/components/portal/OpcoesDeCompra';

/** Os produtos que viram direito na conta, na ordem da estante, e onde abrem.
 *  `html`: página estática atrás do portão, aberta com link comum. */
const ESTANTE: { slug: string; abre: string; html?: boolean; nome?: string; resumo: string }[] = [
  { slug: FLAGSHIP, abre: '', resumo: 'Ler e escrever hebraico do zero, letra por letra.' },
  { slug: 'israel-alem-do-roteiro', abre: '/israel/', html: true, resumo: 'Uma experiência digital interativa pela história, a cultura e os lugares de Israel.' },
  { slug: 'hebraico-a1', abre: '/a1/', resumo: 'O hebraico do dia a dia, depois do alfabeto.' },
  { slug: 'raizes-sefarditas', abre: '/raizes/', nome: 'Raízes Sefarditas', resumo: 'A história, os caminhos e a memória sefardita.' }
];

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export function BibliotecaClient() {
  const account = useAccount();
  const passo = proximoPasso(account);

  if (!account.ready) {
    return <Moldura><p className="m-0 font-ui text-[16px] text-ink-muted">Abrindo a sua biblioteca...</p></Moldura>;
  }
  if (!account.signedIn) {
    return (
      <Moldura>
        <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[52ch]">
          Entre na sua conta para ver os cursos e as experiências que você tem.
        </p>
        <Link href={`/entrar?next=${encodeURIComponent('/minha-biblioteca')}`}
              className="justify-self-start inline-flex items-center justify-center min-h-[52px] px-6 rounded-[var(--r-md)]
                         bg-[var(--navy)] text-white font-ui text-[15.5px] font-semibold">
          Entrar
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
        <div className="grid gap-4">
          <p className="m-0 font-ui text-[17px] leading-[1.6] text-ink-body max-w-[52ch]">
            Sua biblioteca ainda está vazia. Se você pagou há pouco por PIX, o acesso aparece aqui assim que o
            pagamento for confirmado.
          </p>
          <Link href="/cursos/" className="justify-self-start font-ui text-[15.5px] font-semibold text-[var(--teal-ink)] underline underline-offset-[3px]">
            Ver o que o Hebraico Fluente oferece
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0">
          {itens.map(i => {
            const c = getCourse(i.slug);
            const nome = i.nome ?? (c ? nomeNaVitrine(c) : i.slug);
            const href = i.slug === FLAGSHIP ? passo.href : i.abre;
            const rotulo = i.slug === FLAGSHIP ? passo.label : 'Abrir';
            const classe = `justify-self-start inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[var(--r-md)]
                            bg-[var(--navy)] text-white font-ui text-[15px] font-semibold
                            transition-[background-color,transform] duration-[var(--dur)] hover:bg-[var(--navy-2)] active:scale-[.98]`;
            return (
              <li key={i.slug} className="grid content-start gap-3 rounded-[18px] border border-line bg-[var(--card)] p-6">
                <h2 className="m-0 font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">{nome}</h2>
                <p className="m-0 font-ui text-[15px] leading-[1.55] text-ink-body">{i.resumo}</p>
                <p className="m-0 font-ui text-[13.5px] text-ink-muted">
                  {i.direito!.expiresAt ? `Acesso até ${data(i.direito!.expiresAt)}` : 'Acesso sem data de fim'}
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
        Compras, recibos e desistência ficam em <Link href="/perfil" className="underline underline-offset-[3px]">Sua conta</Link>.
      </p>
    </Moldura>
  );
}

function Moldura({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="biblioteca-titulo">
      <Container className="py-12 sm:py-16 grid gap-6 max-w-[920px]">
        <Rubrica>Sua conta</Rubrica>
        <h1 id="biblioteca-titulo"
            className="m-0 font-display font-semibold text-[clamp(32px,4.6vw,48px)] leading-[1.05] tracking-[-0.03em] text-ink">
          Minha Biblioteca
        </h1>
        {children}
      </Container>
    </section>
  );
}
