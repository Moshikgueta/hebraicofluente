import type { Metadata } from 'next';
import { GravarClient } from './GravarClient';

/* O painel de gravação do dono do curso. Fora de busca (o Worker manda
   `noindex` em /admin), e sem dado nenhum no HTML: o catálogo e as gravações
   vêm de /api/admin/audio, que confere a conta de administrador. */
export const metadata: Metadata = {
  title: 'Gravar pronúncias - Hebraico Fluente',
  robots: { index: false, follow: false }
};

export default function GravarPage() { return <GravarClient />; }
