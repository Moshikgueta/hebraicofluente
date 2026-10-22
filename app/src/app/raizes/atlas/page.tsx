import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AtlasClient } from './AtlasClient';

export const metadata: Metadata = meta({
  rota: '/raizes/atlas',
  title: 'Atlas - Raízes Sefarditas',
  description: 'O Atlas histórico de Raízes Sefarditas: lugares, períodos e os Caminhos do Exílio.'
});

export default function AtlasPage() {
  return <AtlasClient />;
}
