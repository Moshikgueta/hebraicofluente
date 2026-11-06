import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import CursoDeHebraicoPage from './curso-de-hebraico/page';
import { tx } from '@/i18n/telas/venda-curso-de-hebraico';

/* A capa é a página do curso de alfabetização (27/10/2026, decisão do dono:
   "por enquanto deixa o site só com o curso de alfabetização"). De 23 a
   27/10/2026 ela foi o portal das três jornadas: o PortalClient.tsx continua
   no código, para voltar quando o Israel Além do Óbvio e o Raízes abrirem.
   /curso-de-hebraico segue respondendo a mesma página: é para lá que vão os
   links de campanha, os e-mails e o portão. */
export const metadata: Metadata = meta({
  rota: '/',
  title: tx.metaTitulo,
  /* Até 155 caracteres (checa-seo.mjs). */
  description: tx.metaDescricao
});

export default function HomePage() {
  return <CursoDeHebraicoPage />;
}
