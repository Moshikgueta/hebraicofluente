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
import { tx } from '@/i18n/telas/venda-suporte';

export const metadata: Metadata = meta({
  rota: '/suporte',
  title: tx.metaTitulo,
  description: tx.metaDescricao
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
      titulo: tx.pagueiTitulo,
      /* No PIX direto a liberação é À MÃO, no prazo do atendimento: "em
         alguns minutos" aqui desmentia o checkout (auditoria de 01/10/2026,
         LEGAL-103). Com a Mercado Pago, o texto segue as formas ativas. */
      corpo: !confirmaSozinho()
        ? <>{tx.pagueiAMao(prazoResposta())}</>
        : <>{tx.pagueiAutomatico([
             temPix() ? tx.pagueiPix : '',
             temCartao() ? tx.pagueiCartao : ''
           ].filter(Boolean).join(' '))}</>,
      acao: <a href={mail(tx.pagueiAssunto)}
               className="font-ui font-semibold text-[var(--accent)] hover:underline">
               {tx.pagueiAcao}</a>
    },
    {
      titulo: tx.reembolsoTitulo,
      corpo: tx.reembolsoCorpo(
             politicas.arrependimentoDias,
             <Link href="/perfil" className="text-[var(--accent)] hover:underline">{tx.suaConta}</Link>,
             confirmacaoDaDesistencia(),
             <Link href="/reembolso" className="text-[var(--accent)] hover:underline">
               {tx.politicaCompleta}
             </Link>
           ),
      acao: <a href={mail(tx.reembolsoAssunto)}
               className="font-ui font-semibold text-[var(--accent)] hover:underline">
               {tx.reembolsoAcao}</a>
    },
    {
      titulo: tx.dadosTitulo,
      corpo: tx.dadosCorpo(
             privacidade.prazoLgpdDias,
             <Link href="/privacidade" className="text-[var(--accent)] hover:underline">
               {tx.politicaPrivacidade}
             </Link>
           ),
      acao: <a href={`mailto:${contato.emailPrivacidade}?subject=${encodeURIComponent(tx.dadosAssunto)}`}
               className="font-ui font-semibold text-[var(--accent)] hover:underline break-all">
               {tx.dadosAcao}</a>
    }
  ];

  return (
    <Section>
      <div className="mx-auto w-full max-w-[760px] grid gap-6">
        <header className="grid gap-4">
          <Rubrica>{tx.rubrica}</Rubrica>
          <h1 className="font-display font-semibold text-[clamp(32px,4vw,46px)] leading-[1.05]
                         tracking-[-0.034em] text-ink m-0">
            {tx.titulo}
          </h1>
          <p className="font-ui text-[17px] leading-[1.6] text-ink-muted max-w-[54ch] m-0">
            {tx.lead(atendimento.horarioPt, prazoResposta())}
          </p>
        </header>

        {/* O canal, como uma ficha: fio em cima e embaixo, o e-mail grande. */}
        <div className="grid gap-2 justify-items-start py-6 border-y border-line">
          <p className="font-ui text-[11.5px] font-semibold uppercase tracking-[.12em] text-ink-muted m-0">
            {tx.emailAtendimento}
          </p>
          <a href={`mailto:${contato.emailSuporte}`}
             className="font-display text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-ink
                        hover:text-[var(--teal-ink)] break-all">
            {contato.emailSuporte}
          </a>
          {contato.telefone && (
            <p className="font-ui text-[15px] text-ink-body">{tx.telefone(contato.telefone)}</p>
          )}
          {contato.whatsapp && (
            <p className="font-ui text-[15px] text-ink-body">
              {tx.whatsapp}{' '}
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
            {tx.antesTitulo}
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
            {tx.cursoTitulo}
          </h2>
          <p className="font-ui text-[16px] leading-[1.6] text-ink-body m-0">
            {tx.cursoTexto(
              <Link href="/faq" className="text-[var(--accent)] hover:underline">
                {tx.duvidasFrequentes}
              </Link>,
              DUVIDAS_DE_CONTEUDO
            )}
          </p>
        </div>

        <Identificacao />

        <FaixaCta
          onde="suporte"
          titulo={tx.ctaTitulo}
          linha={tx.ctaLinha}
        />
      </div>
    </Section>
  );
}
