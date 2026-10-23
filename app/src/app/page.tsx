import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { PortalClient } from './PortalClient';
import { primeiroQueExiste } from '@/lib/midia-publica';
import { grafoDaCapa, jsonLdTexto } from '@/lib/jsonld';

/* A capa é o portal das três jornadas desde 23/10/2026 (PortalClient.tsx).
   A página de venda do curso, que morava aqui, está em /curso-de-hebraico. */
export const metadata: Metadata = meta({
  rota: '/',
  title: 'Hebraico Fluente | Aprenda hebraico e descubra Israel',
  /* Até 155 caracteres (checa-seo.mjs). */
  description:
    'Aprenda a ler hebraico, conheça Israel e a história sefardita, em experiências digitais ' +
    'feitas para brasileiros por um educador israelense.'
});

export default function HomePage() {
  const retrato = primeiroQueExiste(['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg']);
  return (
    <>
    {/* Dados estruturados da capa (Organization, WebSite, Person): quem é o
        site e quem o faz. O Course e a FAQPage moram na página do curso. */}
    <script type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdTexto(grafoDaCapa(retrato)) }} />
    <PortalClient retrato={retrato} />
    </>
  );
}
