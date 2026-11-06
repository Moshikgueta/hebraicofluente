import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { GravarClient } from './GravarClient';

/* O painel de gravação do dono do curso. Fora de busca: /admin está em
   NAO_LISTADAS (lib/seo.ts e seo.mjs) e o Worker manda `noindex`. Sem dado
   nenhum no HTML: o catálogo e as gravações vêm de /api/admin/audio, que
   confere a conta de administrador. */
export const metadata: Metadata = meta({
  rota: '/admin/gravar',
  title: 'Gravar pronúncias - Hebraico Fluente',
  description: 'Painel do dono do curso para gravar as pronúncias.'
});

export default function GravarPage() { return <GravarClient />; }
