/* As peças comuns às três políticas.
 * ─────────────────────────────────────────────────────────────────────────
 * Termos, Privacidade e Reembolso têm a mesma forma: um cabeçalho com a data
 * da última atualização, seções numeradas, e um bloco de identificação do
 * fornecedor no fim. Três páginas com três layouts parecem três documentos de
 * origens diferentes - que é exatamente a impressão que um documento legal
 * não pode dar.
 *
 * O texto é em português claro e curto de propósito. Uma política que ninguém
 * lê não informa ninguém, e o objetivo aqui é informar: o Decreto 7.962/2013
 * fala em informações "claras e ostensivas", não em volume.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { cidadeUf, empresa, enderecoLinha, nomeLegalCompleto, whatsappUrl } from '@/lib/empresa';

/** A data de atualização, por extenso, como se lê em português. */
export function dataPt(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  if (!a || !m || !d) return iso;
  /* `Date.UTC` e não `new Date(iso)`: uma string de data pura é interpretada
     como UTC, e formatar em fuso local move o dia para trás no Brasil. */
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

export function LegalPage({
  titulo, resumo, children
}: { titulo: string; resumo: string; children: ReactNode }) {
  return (
    <Section>
      <div className="mx-auto w-full max-w-[760px] grid gap-6">
        <header className="grid gap-3">
          <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
            {empresa.nomeFantasia}
          </p>
          <h1 className="font-display text-[30px] sm:text-[38px] font-bold leading-[1.12] text-ink">
            {titulo}
          </h1>
          <p className="font-ui text-[16px] leading-relaxed text-ink-body">{resumo}</p>
          <p className="font-ui text-[13px] text-ink-muted">
            Última atualização: {dataPt(empresa.politicas.atualizadoEm)}
          </p>
        </header>

        <div className="grid gap-6">{children}</div>

        <Identificacao />

        {/* Um CTA no fim de uma política não é oportunismo: quem chegou aqui
            estava decidindo, e leu justamente a parte que responde "e se eu me
            arrepender?". Sair dessa leitura sem ter para onde ir é perder a
            pessoa no momento em que ela mais confia. Some sozinho para quem já
            comprou - ver lib/cta.ts. */}
        <FaixaCta
          onde="legal"
          titulo="Tudo isso respondido? Então comece."
          linha="A primeira letra leva dez minutos, e você tem sete dias para desistir sem precisar explicar por quê."
        />

        <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
          {[
            ['/termos', 'Termos de Uso'],
            ['/privacidade', 'Política de Privacidade'],
            ['/reembolso', 'Reembolso e Cancelamento'],
            ['/faq', 'Dúvidas frequentes']
          ].map(([href, label]) => (
            <Link key={href} href={href!}
                  className="font-ui text-[13.5px] text-[var(--accent)] hover:underline">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </Section>
  );
}

export function Artigo({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-2.5">
      <h2 className="font-display text-[19px] sm:text-[21px] font-bold text-ink">
        {n}. {titulo}
      </h2>
      <div className="grid gap-2.5 font-ui text-[15.5px] leading-[1.65] text-ink-body">
        {children}
      </div>
    </section>
  );
}

/** Uma lista simples, com o espaçamento das políticas. */
export const Lista = ({ itens }: { itens: ReactNode[] }) => (
  <ul className="grid gap-1.5 list-none p-0 m-0">
    {itens.map((x, i) => (
      <li key={i} className="flex gap-2.5">
        <span aria-hidden className="text-[var(--accent)] shrink-0">·</span>
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

/**
 * Quem está vendendo.
 *
 * Fecha as três políticas e aparece também no rodapé. Cada linha só existe se
 * o dado existir - ver a nota em lib/empresa.ts sobre por que um campo vazio
 * some em vez de virar um travessão.
 */
export function Identificacao() {
  const endereco = enderecoLinha();
  const zap = whatsappUrl();
  const { contato, atendimento } = empresa;

  return (
    <Card tone="wash" className="p-5 sm:p-6 grid gap-2.5">
      <h2 className="font-display text-[17px] font-bold text-ink">Quem oferece este serviço</h2>
      <dl className="grid gap-1.5 font-ui text-[14.5px] leading-relaxed text-ink-body m-0">
        <Linha rotulo="Fornecedor" valor={nomeLegalCompleto()} />
        <Linha rotulo="CNPJ" valor={empresa.cnpj} />
        <Linha rotulo="Endereço" valor={endereco} />
        <Linha rotulo="Atendimento" valor={
          <a href={`mailto:${contato.emailSuporte}`}
             className="text-[var(--accent)] hover:underline break-all">{contato.emailSuporte}</a>
        } />
        {contato.telefone && <Linha rotulo="Telefone" valor={contato.telefone} />}
        {contato.whatsapp && <Linha rotulo="WhatsApp" valor={
          zap
            ? <a href={zap} target="_blank" rel="noopener noreferrer"
                 className="text-[var(--accent)] hover:underline">{contato.whatsapp}</a>
            : contato.whatsapp
        } />}
        <Linha rotulo="Horário" valor={atendimento.horarioPt} />
        <Linha rotulo="Prazo de resposta" valor={
          `até ${atendimento.prazoRespostaUteis} dias úteis`
        } />
      </dl>
    </Card>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  if (valor === null || valor === undefined || valor === '') return null;
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-x-3 gap-y-0.5">
      <dt className="font-ui text-[13px] text-ink-muted">{rotulo}</dt>
      <dd className="m-0 min-w-0 break-words">{valor}</dd>
    </div>
  );
}

export { cidadeUf };
