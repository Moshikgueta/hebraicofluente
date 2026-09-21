import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';
import { CANDIDATOS } from '@/components/landing/media';
import { primeiroQueExiste } from '@/lib/midia-publica';

/* O título começa pelo que a pessoa digitou na busca - "aprender a ler
   hebraico" -, e não pelo nome da marca, que ninguém procura ainda. */
export const metadata: Metadata = {
  title: 'Aprenda a ler hebraico do zero - Hebraico Fluente',
  description:
    'Curso interativo de alfabetização em hebraico para brasileiros: as 22 letras, os sons e a ' +
    'leitura de palavras reais, com explicações em português, exercícios corrigidos na hora e ' +
    'progresso salvo na sua conta.'
};

/* A capa é uma página de SERVIDOR que renderiza um cliente.
 * ─────────────────────────────────────────────────────────────────────────
 * O motivo é um só: só aqui dá para olhar o disco. A camada de atmosfera do
 * hero e o retrato do professor existem quando o ARQUIVO existe, e quem
 * responde isso é o `existsSync` da build - nunca uma constante que alguém
 * precisa lembrar de editar junto com o upload. Ver lib/midia-publica.ts.
 */
export default function HomePage() {
  return (
    <HomeClient
      midia={{
        imagem: primeiroQueExiste(CANDIDATOS.imagem),
        imagemMobile: primeiroQueExiste(CANDIDATOS.imagemMobile),
        video: primeiroQueExiste(CANDIDATOS.video),
        poster: primeiroQueExiste(CANDIDATOS.poster)
      }}
      retrato={primeiroQueExiste(['media/moshik.avif', 'media/moshik.webp', 'media/moshik.jpg'])}
    />
  );
}
