/* Os dados estruturados da capa (JSON-LD), gerados dos dados.
 * ─────────────────────────────────────────────────────────────────────────
 * Até 01/10/2026 o site não tinha nenhum (auditoria, SEO-001). Quatro
 * blocos, e nenhum valor escrito aqui à mão:
 *
 *   Organization  nome, razão social e CNPJ de data/empresa.json;
 *   Course        o curso do catálogo, com a oferta: o preço é o mesmo da
 *                 caixa de preço (`precoDeVitrine`), e `priceValidUntil` é o
 *                 `preLancamentoAte` enquanto houver preço de pré-lançamento
 *                 - senão o Google mostraria em novembro um preço vencido;
 *   FAQPage       as perguntas que a FAQ da capa MOSTRA (faq-capa.ts);
 *   Person        o professor, só com o que /sobre já afirma (Trajetoria.tsx).
 *                 Nada de cargo, número ou credencial que não esteja lá.
 *
 * `app/checa-seo.mjs` lê o HTML publicado e confere: JSON válido, preço igual
 * ao catálogo, validade igual à data do pré-lançamento, CNPJ igual ao
 * empresa.json. O script `type="application/ld+json"` não executa, então não
 * precisa de hash na CSP (tools/csp-hashes.mjs já o pula).
 */

import { INSTAGRAM, PERFIL_LINKEDIN } from './professor';
import { ancora, flagship } from '@/lib/catalog';
import { empresa, nomeLegal } from '@/lib/empresa';
import { ORIGEM, url } from '@/lib/seo';
import { precoDeVitrine } from '@/lib/vitrine';
import { perguntasDaCapa } from '@/components/landing/faq-capa';

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
    url: url(`/cursos/${c.slug}`),
    provider: { '@id': ID_ORG },
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      price: precoDeVitrine().toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: url(`/cursos/${c.slug}`),
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
    description: 'Israelense, professor de idiomas e educador, criador do Hebraico Fluente.',
    url: url('/sobre'),
    knowsLanguage: ['he', 'pt', 'en', 'es', 'it'],
    worksFor: { '@id': ID_ORG },
    sameAs: [PERFIL_LINKEDIN],
    ...(retrato ? { image: `${ORIGEM}/${retrato.replace(/^\/+/, '')}` } : {})
  };
}

/** O grafo da capa, num bloco só. */
export function grafoDaCapa(retrato: string | null): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizacao(), curso(), faq(), professor(retrato)]
  };
}

/** O texto do <script type="application/ld+json">. `<` vira `<` para
 *  que nenhum texto de dado feche a tag por engano. */
export const jsonLdTexto = (dado: Json): string =>
  JSON.stringify(dado).replace(/</g, '\\u003c');
