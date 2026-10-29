import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/platform/Section';
import { LinkButton } from '@/components/ui/Button';
import { empresa } from '@/lib/empresa';
import { tx } from '@/i18n/telas/conta-conta-apagada';

export const metadata: Metadata = meta({
  rota: '/conta-apagada',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

/* Depois do apagamento.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma página inteira para dizer "pronto", e ela é necessária por um motivo
 * estrutural: quem chega aqui NÃO TEM MAIS SESSÃO. A confirmação não pode
 * morar dentro do perfil, porque o portão do curso vê a sessão sumir e manda
 * a pessoa para /entrar no mesmo instante - foi exatamente o que aconteceu na
 * primeira versão, e o sintoma era a tela pular para a página de vendas sem
 * dizer nada. Apagar a conta é a operação em que o silêncio é mais caro: a
 * dúvida que ele gera ("será que apagou mesmo?") é o e-mail de suporte que
 * esta funcionalidade existe para não precisar responder.
 *
 * Diz as duas metades, e a segunda é a que ninguém espera: o que ficou, e por
 * quê. Uma pessoa que pediu exclusão e depois descobre sozinha que os pedidos
 * dela continuam registrados tem razão de desconfiar - a menos que isso tenha
 * sido dito na cara dela, aqui, antes de ela perguntar.
 *
 * Não é indexável (`NAO_LISTADAS`, em lib/seo.ts): "conta apagada" saindo
 * numa busca pelo nome do curso é a pior vitrine possível.
 */
export default function Page() {
  return (
    <Section>
      <div className="focus-col grid gap-6 py-6">
        <header className="grid gap-2">
          <h1 className="font-display text-[30px] sm:text-[38px] font-bold leading-[1.12] text-ink">
            {tx.titulo}
          </h1>
          <p className="font-ui text-[16px] leading-relaxed text-ink-body">
            {tx.feito}
          </p>
        </header>

        <Card className="p-5 sm:p-6 grid gap-5">
          <div className="grid gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">{tx.oQueFoiApagado}</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {tx.apagadoTexto}
            </p>
          </div>

          <div className="grid gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">{tx.oQueFicou}</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {tx.ficouTexto}
            </p>
          </div>

          <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
            <h2 className="font-display text-[17px] font-bold text-ink">{tx.voltar}</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              {tx.voltarTexto}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkButton href="/">{tx.paginaInicial}</LinkButton>
            <LinkButton href="/suporte" variant="ghost">{tx.falarComAGente}</LinkButton>
          </div>
        </Card>

        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          {tx.duvida}{' '}
          <a href={`mailto:${empresa.contato.emailSuporte}`}
             className="text-[var(--accent)] underline underline-offset-4">
            {empresa.contato.emailSuporte}
          </a>.
        </p>
      </div>
    </Section>
  );
}
