import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { tx } from '@/i18n/telas/nao-encontrada';

/* Um título próprio: sem ele o 404 saía com o título genérico da raiz, igual
   ao das rotas pagas (auditoria de 01/10, SEO-003). Fora do índice. */
export const metadata: Metadata = {
  title: tx.tituloDaAba,
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <Card className="p-8 grid gap-4">
      <h1 className="text-[23px] font-bold">{tx.titulo}</h1>
      <p className="text-[15px] text-ink-body">{tx.texto}</p>
      <LinkButton href="/" className="justify-self-start">{tx.voltar}</LinkButton>
    </Card>
  );
}
