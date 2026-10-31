import type { MetadataRoute } from 'next';
import { LANG_HTML } from '@/i18n';
import { tx } from '@/i18n/telas/geral';

/* O manifesto do app (28/10/2026, pedido do dono: "faz tudo", item 7).
   ─────────────────────────────────────────────────────────────────────
   É o que deixa "Instalar" ou "Adicionar à tela de início" abrir o curso
   em tela cheia, com o ícone do site. Sem service worker, de propósito:
   um service worker guardaria páginas e áudio do curso no aparelho, fora
   do portão, e o curso já guarda o progresso sem sinal pelo localStorage.
   Abre no painel (`/meu-hebraico/`): quem não tem o curso é levado pelo
   portão à página de venda, como no navegador. */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: tx.marca,
    short_name: tx.marca,
    description: tx.descricao,
    lang: LANG_HTML,
    start_url: '/meu-hebraico/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF9F5',
    theme_color: '#FBF9F5',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icone-mascara-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}
