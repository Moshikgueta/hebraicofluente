import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { HomeClient } from './HomeClient';
import { CANDIDATOS } from '@/components/landing/media';
import { primeiroQueExiste } from '@/lib/midia-publica';
import { grafoDaCapa, jsonLdTexto } from '@/lib/jsonld';

/* O título começa pelo que a pessoa digitou na busca - "aprender a ler
   hebraico" -, e não pelo nome da marca, que ninguém procura ainda. */
export const metadata: Metadata = meta({
  rota: '/',
  title: 'Aprenda a ler hebraico do zero - Hebraico Fluente',
  /* Até 155 caracteres: o resultado da busca corta o resto (auditoria de
     01/10, SEO-003; tinha 208). `checa-seo.mjs` confere o limite. */
  description:
    'Curso interativo para brasileiros aprenderem a ler hebraico do zero: as 22 letras, os ' +
    'sinais de vogal e palavras reais, com correção na hora.'
});

/* A capa é uma página de SERVIDOR que renderiza um cliente.
 * ─────────────────────────────────────────────────────────────────────────
 * O motivo é um só: só aqui dá para olhar o disco. A camada de atmosfera do
 * hero e o retrato do professor existem quando o ARQUIVO existe, e quem
 * responde isso é o `existsSync` da build - nunca uma constante que alguém
 * precisa lembrar de editar junto com o upload. Ver lib/midia-publica.ts.
 */
export default function HomePage() {
  const retrato = primeiroQueExiste(['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg']);
  return (
    <>
    {/* Dados estruturados (Organization, Course, FAQPage, Person), gerados
        dos dados em lib/jsonld.ts. Não executa: não precisa de hash na CSP. */}
    <script type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdTexto(grafoDaCapa(retrato)) }} />
    <HomeClient
      midia={{
        imagem: primeiroQueExiste(CANDIDATOS.imagem),
        imagemMobile: primeiroQueExiste(CANDIDATOS.imagemMobile),
        video: primeiroQueExiste(CANDIDATOS.video),
        poster: primeiroQueExiste(CANDIDATOS.poster)
      }}
      retrato={retrato}
    />
    </>
  );
}
