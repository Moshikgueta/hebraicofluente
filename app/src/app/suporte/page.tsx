import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import Link from 'next/link';
import { Rubrica } from '@/components/landing/base';
import { Section } from '@/components/platform/Section';
import { Identificacao } from '@/components/legal/Legal';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import {
  confirmaSozinho, confirmacaoDaDesistencia, DUVIDAS_DE_CONTEUDO, empresa, prazoResposta,
  temCartao, temPix, whatsappUrl
} from '@/lib/empresa';

export const metadata: Metadata = meta({
  rota: '/suporte',
  title: 'Suporte - Hebraico Fluente',
  description:
    'Como falar com quem faz o curso: e-mail de atendimento, horário, prazo de ' +
    'resposta, e os atalhos para os problemas mais comuns.'
});

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
      /* No PIX direto a liberação é À MÃO, no prazo do atendimento: "em
         alguns minutos" aqui desmentia o checkout (auditoria de 01/10/2026,
         LEGAL-103). Com a Mercado Pago, o texto segue as formas ativas. */
      corpo: !confirmaSozinho()
        ? <>Depois do PIX, conferimos o pagamento e liberamos o acesso à mão,{' '}
           {prazoResposta()}. Passou disso, escreva do e-mail que você usou na
           compra: resolvemos sem custo.</>
        : <>{[
             temPix() ? 'No PIX o acesso costuma sair em minutos.' : '',
             temCartao() ? 'No cartão, assim que a operadora aprova.' : ''
           ].filter(Boolean).join(' ')} Passou disso, é falha nossa e resolvemos sem
           custo - escreva do e-mail que você usou na compra.</>,
      acao: <a href={mail('Paguei e o acesso não liberou')}
               className="font-ui font-semibold text-[var(--accent)] hover:underline">
               Avisar sobre acesso não liberado →</a>
    },
    {
      titulo: 'Quero meu dinheiro de volta',
      corpo: <>Você tem {politicas.arrependimentoDias} dias para desistir, sem precisar
             explicar por quê e sem taxa. O caminho mais rápido é em{' '}
             <Link href="/perfil" className="text-[var(--accent)] hover:underline">Sua conta</Link>,
             na compra: <strong>Desistir da compra</strong>. {confirmacaoDaDesistencia()} A{' '}
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
        <header className="grid gap-4">
          <Rubrica>Atendimento</Rubrica>
          <h1 className="font-display font-semibold text-[clamp(32px,4vw,46px)] leading-[1.05]
                         tracking-[-0.034em] text-ink m-0">
            Fale com a gente
          </h1>
          <p className="font-ui text-[17px] leading-[1.6] text-ink-muted max-w-[54ch] m-0">
            Um e-mail, respondido por quem faz o curso. {atendimento.horarioPt}.
            Respondemos {prazoResposta()}.
          </p>
        </header>

        {/* O canal, como uma ficha: fio em cima e embaixo, o e-mail grande. */}
        <div className="grid gap-2 justify-items-start py-6 border-y border-line">
          <p className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted m-0">
            E-mail de atendimento
          </p>
          <a href={`mailto:${contato.emailSuporte}`}
             className="font-display text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-ink
                        hover:text-[var(--teal-ink)] break-all">
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
        </div>

        <section className="grid gap-4">
          <h2 className="font-display text-[23px] font-semibold tracking-[-0.02em] text-ink m-0">
            Antes de escrever, veja se é um destes
          </h2>
          <div className="border-t border-line">
            {ATALHOS.map(a => (
              <div key={a.titulo} className="py-5 border-b border-line grid gap-2">
                <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em] text-ink m-0">{a.titulo}</h3>
                <p className="font-ui text-[16px] leading-[1.6] text-ink-body m-0">{a.corpo}</p>
                <p className="pt-1 m-0">{a.acao}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-2 pl-6 border-l-2 border-[var(--teal)]">
          <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink m-0">
            Dúvida sobre o curso em si
          </h2>
          <p className="font-ui text-[16px] leading-[1.6] text-ink-body m-0">
            As perguntas que aparecem antes da compra - preço, prazo, celular, áudio,
            certificado - estão respondidas nas{' '}
            <Link href="/faq" className="text-[var(--accent)] hover:underline">
              dúvidas frequentes
            </Link>. O que não estiver lá, escreva: a lista cresce com o que vocês
            perguntam. {DUVIDAS_DE_CONTEUDO}
          </p>
        </div>

        <Identificacao />

        <FaixaCta
          onde="suporte"
          titulo="Ainda não é aluno?"
          linha="A primeira letra leva dez minutos, e você tem sete dias para desistir sem precisar explicar por quê."
        />
      </div>
    </Section>
  );
}
