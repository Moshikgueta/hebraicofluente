import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Card className="p-8 grid gap-4">
      <h1 className="text-[23px] font-bold">Esta página não existe</h1>
      <p className="text-[15px] text-ink-body">Talvez o link esteja antigo.</p>
      <LinkButton href="/" className="justify-self-start">Voltar ao início</LinkButton>
    </Card>
  );
}
