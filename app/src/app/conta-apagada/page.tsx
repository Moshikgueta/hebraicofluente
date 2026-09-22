import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/platform/Section';
import { LinkButton } from '@/components/ui/Button';
import { empresa } from '@/lib/empresa';

export const metadata: Metadata = meta({
  rota: '/conta-apagada',
  title: 'Conta apagada - Hebraico Fluente',
  description: 'A confirmação de que a conta e os dados pessoais foram apagados.'
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
            Conta apagada
          </h1>
          <p className="font-ui text-[16px] leading-relaxed text-ink-body">
            Está feito, e não é preciso fazer mais nada.
          </p>
        </header>

        <Card className="p-5 sm:p-6 grid gap-5">
          <div className="grid gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">O que foi apagado</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              Seu e-mail, seu nome, sua senha, todo o seu progresso e o seu acesso
              ao curso. Você já foi desconectado de todos os aparelhos onde
              estivesse logado.
            </p>
          </div>

          <div className="grid gap-2">
            <h2 className="font-display text-[17px] font-bold text-ink">O que ficou, e por quê</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              O registro das suas compras, sem o seu nome e sem o seu e-mail.
              Guardar nota de venda é obrigação legal de quem vende, e a própria
              LGPD prevê essa guarda. O que sobrou é valor, data e situação do
              pagamento - nada que aponte para você.
            </p>
          </div>

          <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
            <h2 className="font-display text-[17px] font-bold text-ink">Se um dia quiser voltar</h2>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
              É só criar uma conta nova com o mesmo e-mail. Ela começa do zero,
              porque não sobrou nada para recuperar - nem as letras que você já
              tinha aprendido.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkButton href="/">Ir para a página inicial</LinkButton>
            <LinkButton href="/suporte" variant="ghost">Falar com a gente</LinkButton>
          </div>
        </Card>

        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          Ficou alguma dúvida sobre os seus dados? Escreva para{' '}
          <a href={`mailto:${empresa.contato.emailSuporte}`}
             className="text-[var(--accent)] underline underline-offset-4">
            {empresa.contato.emailSuporte}
          </a>.
        </p>
      </div>
    </Section>
  );
}
