import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/platform/Section';
import { Identificacao } from '@/components/legal/Legal';
import { empresa, whatsappUrl } from '@/lib/empresa';

export const metadata: Metadata = {
  title: 'Suporte - Hebraico Fluente',
  description:
    'Como falar com quem faz o curso: e-mail de atendimento, horário, prazo de ' +
    'resposta, e os atalhos para os problemas mais comuns.'
};

/* O canal de atendimento.
 * ─────────────────────────────────────────────────────────────────────────
 * Uma página inteira para uma coisa que caberia numa linha do rodapé, e o
 * motivo é o que ela faz ANTES do e-mail: os três atalhos resolvem sozinhos
 * a maioria dos motivos pelos quais alguém escreve. Quem chega ao formulário
 * depois deles tem um problema de verdade, e é atendido mais rápido porque a
 * fila está menor.
 *
 * Os `mailto` já vêm com assunto preenchido. Parece detalhe e não é: um
 * assunto padronizado é o que permite responder pedido de reembolso no prazo
 * sem precisar ler a caixa inteira todo dia.
 */
export default function Page() {
  const { contato, atendimento, privacidade, politicas } = empresa;

  const mail = (assunto: string) =>
    `mailto:${contato.emailSuporte}?subject=${encodeURIComponent(assunto)}`;

  const ATALHOS: { titulo: string; corpo: React.ReactNode; acao: React.ReactNode }[] = [
    {
      titulo: 'Paguei e o acesso não liberou',
      corpo: <>No PIX o acesso costuma sair em minutos; no cartão, assim que a operadora
             aprova. Passou disso, é falha nossa e resolvemos sem custo - escreva do
             e-mail que você usou na compra.</>,
      acao: <a href={mail('Paguei e o acesso não liberou')}
               className="font-ui font-semibold text-[var(--accent)] hover:underline">
               Avisar sobre acesso não liberado →</a>
    },
    {
      titulo: 'Quero meu dinheiro de volta',
      corpo: <>Você tem {politicas.arrependimentoDias} dias para desistir, sem precisar
             explicar por quê e sem taxa. A{' '}
             <Link href="/reembolso" className="text-[var(--accent)] hover:underline">
               política completa
             </Link>{' '}
             diz em quanto tempo o valor retorna.</>,
      acao: <a href={mail('Pedido de reembolso')}
               className="font-ui font-semibold text-[var(--accent)] hover:underline">
               Pedir reembolso →</a>
    },
    {
      titulo: 'Quero acessar, corrigir ou apagar meus dados',
      corpo: <>É um direito seu, e respondemos em até {privacidade.prazoLgpdDias} dias.
             O que cada pedido significa está na{' '}
             <Link href="/privacidade" className="text-[var(--accent)] hover:underline">
               Política de Privacidade
             </Link>.</>,
      acao: <a href={`mailto:${contato.emailPrivacidade}?subject=${encodeURIComponent('Pedido LGPD - titular de dados')}`}
               className="font-ui font-semibold text-[var(--accent)] hover:underline break-all">
               Fazer um pedido sobre meus dados →</a>
    }
  ];

  return (
    <Section>
      <div className="mx-auto w-full max-w-[760px] grid gap-6">
        <header className="grid gap-3">
          <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
            Atendimento
          </p>
          <h1 className="font-display text-[30px] sm:text-[38px] font-bold leading-[1.12] text-ink">
            Fale com a gente
          </h1>
          <p className="font-ui text-[16px] leading-relaxed text-ink-body max-w-[54ch]">
            Um e-mail, respondido por quem faz o curso. {atendimento.horarioPt},
            em até {atendimento.prazoRespostaUteis} dias úteis - normalmente bem antes.
          </p>
        </header>

        <Card tone="mint" className="p-5 sm:p-6 grid gap-2 justify-items-start">
          <p className="font-ui text-[12px] uppercase tracking-[.08em] text-[var(--mint-ink)]">
            E-mail de atendimento
          </p>
          <a href={`mailto:${contato.emailSuporte}`}
             className="font-display text-[20px] sm:text-[24px] font-bold text-ink
                        hover:text-[var(--accent)] break-all">
            {contato.emailSuporte}
          </a>
          {contato.telefone && (
            <p className="font-ui text-[15px] text-ink-body">Telefone: {contato.telefone}</p>
          )}
          {contato.whatsapp && (
            <p className="font-ui text-[15px] text-ink-body">
              WhatsApp:{' '}
              {whatsappUrl()
                ? <a href={whatsappUrl()!} target="_blank" rel="noopener noreferrer"
                     className="font-semibold text-[var(--accent)] hover:underline">
                    {contato.whatsapp}
                  </a>
                : contato.whatsapp}
            </p>
          )}
        </Card>

        <section className="grid gap-3">
          <h2 className="font-display text-[20px] font-bold text-ink">
            Antes de escrever, veja se é um destes
          </h2>
          {ATALHOS.map(a => (
            <Card key={a.titulo} className="p-5 grid gap-2">
              <h3 className="font-display text-[17px] font-bold text-ink">{a.titulo}</h3>
              <p className="font-ui text-[15px] leading-relaxed text-ink-body">{a.corpo}</p>
              <p className="pt-1">{a.acao}</p>
            </Card>
          ))}
        </section>

        <Card className="p-5 grid gap-2">
          <h2 className="font-display text-[17px] font-bold text-ink">
            Dúvida sobre o curso em si
          </h2>
          <p className="font-ui text-[15px] leading-relaxed text-ink-body">
            As perguntas que aparecem antes da compra - preço, prazo, celular, áudio,
            certificado - estão respondidas nas{' '}
            <Link href="/faq" className="text-[var(--accent)] hover:underline">
              dúvidas frequentes
            </Link>. O que não estiver lá, escreva: a lista cresce com o que vocês
            perguntam.
          </p>
        </Card>

        <Identificacao />
      </div>
    </Section>
  );
}
