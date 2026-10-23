import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { CursoDeHebraicoClient } from './CursoDeHebraicoClient';
import { CANDIDATOS } from '@/components/landing/media';
import { primeiroQueExiste } from '@/lib/midia-publica';
import { grafoDoCurso, jsonLdTexto } from '@/lib/jsonld';

/* A página de venda do curso. Até 23/10/2026 era a capa: o título continua
   começando pelo que a pessoa digita na busca - "aprender a ler hebraico". */
export const metadata: Metadata = meta({
  rota: '/curso-de-hebraico',
  title: 'Aprenda a ler hebraico do zero - Hebraico Fluente',
  /* Até 155 caracteres: o resultado da busca corta o resto (auditoria de
     01/10, SEO-003). `checa-seo.mjs` confere o limite. */
  description:
    'Curso interativo para brasileiros aprenderem a ler hebraico do zero: as 22 letras, os ' +
    'sinais de vogal e palavras reais, com correção na hora.'
});

/* Página de SERVIDOR que renderiza um cliente, como a capa era: só aqui dá
   para olhar o disco (a atmosfera do hero e o retrato existem quando o
   ARQUIVO existe). Ver lib/midia-publica.ts. */
export default function CursoDeHebraicoPage() {
  const retrato = primeiroQueExiste(['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg']);
  return (
    <>
    {/* Dados estruturados (Organization, Course, FAQPage, Person), gerados
        dos dados em lib/jsonld.ts. Não executa: não precisa de hash na CSP. */}
    <script type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdTexto(grafoDoCurso(retrato)) }} />
    <CursoDeHebraicoClient
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
