/* Os dados estruturados (JSON-LD) da capa e da página do curso, gerados dos dados.
 * ─────────────────────────────────────────────────────────────────────────
 * Até 01/10/2026 o site não tinha nenhum (auditoria, SEO-001). Quatro
 * blocos, e nenhum valor escrito aqui à mão:
 *
 *   Organization  nome, razão social e CNPJ de data/empresa.json;
 *   Course        o curso do catálogo, com a oferta: o preço é o mesmo da
 *                 caixa de preço (`precoDeVitrine`), e `priceValidUntil` é o
 *                 `preLancamentoAte` enquanto houver preço de pré-lançamento
 *                 - senão o Google mostraria em novembro um preço vencido;
 *   FAQPage       as perguntas que a FAQ da página do curso MOSTRA (faq-capa.ts);
 *   Person        o professor, só com o que /sobre já afirma (Trajetoria.tsx).
 *                 Nada de cargo, número ou credencial que não esteja lá.
 *
 * `app/checa-seo.mjs` lê o HTML publicado e confere: JSON válido, preço igual
 * ao catálogo, validade igual à data do pré-lançamento, CNPJ igual ao
 * empresa.json. O script `type="application/ld+json"` não executa, então não
 * precisa de hash na CSP (tools/csp-hashes.mjs já o pula).
 */

import { INSTAGRAM, PERFIL_LINKEDIN } from './professor';
import { ancora, flagship, paginaDeVenda } from '@/lib/catalog';
import { empresa, nomeLegal } from '@/lib/empresa';
import { ORIGEM, url } from '@/lib/seo';
import { precoDeVitrine } from '@/lib/vitrine';
import { perguntasDaCapa } from '@/components/landing/faq-capa';
import { tx } from '@/i18n/telas/motor-jsonld';

type Json = Record<string, unknown>;

const ID_ORG = `${ORIGEM}/#organizacao`;
const ID_PROFESSOR = `${ORIGEM}/sobre/#moshik`;

export function organizacao(): Json {
  const e = empresa.endereco;
  return {
    '@type': 'Organization',
    '@id': ID_ORG,
    name: empresa.nomeFantasia,
    legalName: nomeLegal(),
    ...(empresa.cnpj ? { taxID: empresa.cnpj } : {}),
    url: ORIGEM + '/',
    logo: `${ORIGEM}/apple-touch-icon.png`,
    sameAs: [INSTAGRAM],
    email: empresa.contato.emailSuporte,
    ...(e?.logradouro && e.cidade ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: e.logradouro,
        addressLocality: e.cidade,
        ...(e.uf ? { addressRegion: e.uf } : {}),
        ...(e.cep ? { postalCode: e.cep } : {}),
        addressCountry: 'BR'
      }
    } : {})
  };
}

export function curso(): Json {
  const c = flagship();
  const validade = ancora(c.price) && c.price.preLancamentoAte ? c.price.preLancamentoAte : null;
  return {
    '@type': 'Course',
    name: c.titlePt,
    description: c.taglinePt,
    inLanguage: 'pt-BR',
    url: url(paginaDeVenda(c.slug)),
    provider: { '@id': ID_ORG },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price: precoDeVitrine().toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: url(paginaDeVenda(c.slug)),
      ...(validade ? { priceValidUntil: validade } : {})
    }
  };
}

export function faq(): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: perguntasDaCapa().map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };
}

export function professor(retrato: string | null): Json {
  return {
    '@type': 'Person',
    '@id': ID_PROFESSOR,
    name: 'Moshik Gueta',
    description: tx.professorDescricao,
    url: url('/sobre'),
    knowsLanguage: ['he', 'pt', 'en', 'es', 'it'],
    worksFor: { '@id': ID_ORG },
    sameAs: [PERFIL_LINKEDIN],
    ...(retrato ? { image: `${ORIGEM}/${retrato.replace(/^\/+/, '')}` } : {})
  };
}

/** O grafo da página de venda do curso (/curso-de-hebraico), num bloco só.
 *  Foi o da capa até 23/10/2026: o Course e a FAQPage descrevem o que ESSA
 *  página mostra (a caixa de preço e as perguntas dela). */
export function grafoDoCurso(retrato: string | null): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizacao(), curso(), faq(), professor(retrato)]
  };
}

/** O grafo da capa (o portal, desde 23/10/2026): quem é o site e quem o faz.
 *  Sem Course nem FAQPage: a capa não mostra preço nem aquelas perguntas, e
 *  dado estruturado que descreve outra página é o que o Google pune. */
export function grafoDaCapa(retrato: string | null): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizacao(),
      { '@type': 'WebSite', '@id': `${ORIGEM}/#site`, name: empresa.nomeFantasia, url: ORIGEM + '/',
        inLanguage: 'pt-BR', publisher: { '@id': ID_ORG } },
      professor(retrato)
    ]
  };
}

/** As migalhas de uma página (BreadcrumbList), da capa até ela (26/10/2026, páginas do
 *  alfabeto). Só nome e rota: o que a própria página já mostra nas migalhas da tela. */
export function migalhas(itens: { nome: string; rota: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ nome: tx.inicio, rota: '/' }, ...itens].map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.nome, item: url(it.rota)
    }))
  };
}

/** O texto do <script type="application/ld+json">. `<` vira `<` para
 *  que nenhum texto de dado feche a tag por engano. */
export const jsonLdTexto = (dado: Json): string =>
  JSON.stringify(dado).replace(/</g, '\\u003c');
