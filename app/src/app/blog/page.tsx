import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { PageHead, Section } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { artigos, semMarcas } from '@/lib/blog';
import { jsonLdTexto, migalhas } from '@/lib/jsonld';
import { tx } from '@/i18n/telas/blog';

/* Sem artigo aprovado, a lista existe mas não vai à busca (nem ao sitemap: seo.mjs). */
export const metadata: Metadata = {
  ...meta({ rota: '/blog', title: tx.metaTitulo, description: tx.metaDescricao }),
  ...(artigos().length ? {} : { robots: { index: false, follow: true } })
};

/* A lista do blog (29/10/2026). Só os artigos aprovados (lib/blog.ts). */
export default function BlogPage() {
  const lista = artigos();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdTexto(migalhas([
        { nome: tx.blog, rota: '/blog' }
      ])) }} />
      <PageHead trilha={[{ nome: tx.blog }]} eyebrowPt={tx.blog} titlePt={tx.titulo} leadPt={tx.lead} />
      <Section labelledBy="artigos">
        <h2 id="artigos" className="sr-only">{tx.blog}</h2>
        {lista.length === 0 ? (
          <p className="font-ui text-[17px] text-ink-muted m-0">{tx.vazio}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 list-none p-0 m-0">
            {lista.map(a => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}/`}
                      className="group grid gap-2 h-full rounded-[18px] bg-[var(--card)] p-5 sm:p-6
                                 shadow-[0_0_0_1px_var(--line),0_14px_30px_-24px_rgba(14,59,67,.35)]
                                 transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_#C9C3B4,0_18px_34px_-22px_rgba(14,59,67,.4)]">
                  <span className="font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.015em] text-ink text-balance">
                    {a.titulo}
                  </span>
                  <span className="font-ui text-[15.5px] leading-[1.55] text-ink-muted text-pretty">{semMarcas(a.descricao)}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 font-ui text-[15px] font-semibold text-[var(--teal-ink)]">
                    {tx.ler}<span aria-hidden className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section labelledBy="cta">
        <FaixaCta titulo={tx.ctaTitulo} linha={<>{tx.ctaLinha}</>} onde="blog" />
      </Section>
    </>
  );
}
