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
import { Rubrica } from '@/components/landing/base';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { cidadeUf, empresa, enderecoLinha, nomeLegalCompleto, prazoResposta, whatsappUrl } from '@/lib/empresa';
import { tx } from '@/i18n/telas/conta-legal';

/** A data de atualização, por extenso, como se lê em português. */
export function dataPt(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  if (!a || !m || !d) return iso;
  /* `Date.UTC` e não `new Date(iso)`: uma string de data pura é interpretada
     como UTC, e formatar em fuso local move o dia para trás no Brasil. */
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'
  }); // etapa 1: data em pt-BR
}

export function LegalPage({
  titulo, resumo, children, documento, cta = true
}: {
  titulo: string; resumo: string; children: ReactNode;
  /** O nome do documento para a VERSÃO (`app/versoes.mjs`): o texto dentro
   *  do `<article data-politica>` é o que se guarda e o que se resume no
   *  código da versão. O que fica fora (o convite para começar, a navegação)
   *  não é contrato e não muda a versão. */
  documento?: 'termos' | 'reembolso' | 'privacidade' | 'acessibilidade';
  /** O convite para começar no pé. Sai da Privacidade e da Acessibilidade
   *  (auditoria de 01/10/2026, LEGAL-119): num documento sobre dados ou
   *  sobre barreiras, um botão de venda soa deslocado. */
  cta?: boolean;
}) {
  return (
    <Section>
      <div className="mx-auto w-full max-w-[760px] grid gap-6">
        <article data-politica={documento} className="grid gap-6">
        <header className="grid gap-4 pb-8 border-b border-line">
          <Rubrica>{empresa.nomeFantasia}</Rubrica>
          <h1 className="font-display font-semibold text-[clamp(32px,4vw,46px)] leading-[1.05]
                         tracking-[-0.034em] text-ink m-0">
            {titulo}
          </h1>
          <p className="font-ui text-[17px] leading-[1.6] text-ink-muted m-0">{resumo}</p>
          <p className="font-ui text-[13px] text-ink-muted tabular-nums m-0">
            {tx.ultimaAtualizacao(dataPt(empresa.politicas.atualizadoEm))}
          </p>
        </header>

        <div className="grid gap-6">{children}</div>

        <Identificacao />
        </article>

        {/* Um CTA no fim de uma política não é oportunismo: quem chegou aqui
            estava decidindo, e leu justamente a parte que responde "e se eu me
            arrepender?". Sair dessa leitura sem ter para onde ir é perder a
            pessoa no momento em que ela mais confia. Some sozinho para quem já
            comprou - ver lib/cta.ts. */}
        {cta && (
          <FaixaCta
            onde="legal"
            titulo={tx.ctaTitulo}
            linha={tx.ctaLinha}
          />
        )}

        <nav className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
          {[
            ['/termos', tx.termosDeUso],
            ['/privacidade', tx.politicaDePrivacidade],
            ['/reembolso', tx.reembolso],
            ['/acessibilidade', tx.acessibilidade],
            ['/faq', tx.duvidasFrequentes]
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
    /* Só o desenho muda: o TEXTO do título fica exatamente "N. Título". A
       versão de cada política é o sha256 do texto lido (versoes.mjs), e um
       algarismo a mais por estética seria um contrato novo. */
    <section className="grid gap-3 pt-2">
      <h2 className="font-display text-[21px] sm:text-[23px] font-semibold tracking-[-0.02em] text-ink m-0">
        {n}. {titulo}
      </h2>
      <div className="grid gap-3 font-ui text-[16px] leading-[1.7] text-ink-body">
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
      <h2 className="font-display text-[17px] font-bold text-ink">{tx.quemOferece}</h2>
      <dl className="grid gap-1.5 font-ui text-[14.5px] leading-relaxed text-ink-body m-0">
        <Linha rotulo={tx.fornecedor} valor={nomeLegalCompleto()} />
        <Linha rotulo={tx.cnpj} valor={empresa.cnpj} />
        <Linha rotulo={tx.endereco} valor={endereco} />
        <Linha rotulo={tx.atendimento} valor={
          <a href={`mailto:${contato.emailSuporte}`}
             className="text-[var(--accent)] hover:underline break-all">{contato.emailSuporte}</a>
        } />
        {contato.telefone && <Linha rotulo={tx.telefone} valor={contato.telefone} />}
        {contato.whatsapp && <Linha rotulo={tx.whatsapp} valor={
          zap
            ? <a href={zap} target="_blank" rel="noopener noreferrer"
                 className="text-[var(--accent)] hover:underline">{contato.whatsapp}</a>
            : contato.whatsapp
        } />}
        <Linha rotulo={tx.horario} valor={atendimento.horarioPt} />
        <Linha rotulo={tx.prazoDeResposta} valor={prazoResposta()} />
      </dl>
    </Card>
  );
}

/**
 * Quem oferece, numa linha, para as telas de dentro da plataforma.
 *
 * A identificação completa fica no rodapé das páginas públicas, no cadastro e
 * no checkout; dentro da conta havia só os links das políticas - inclusive em
 * /perfil, onde ficam "Desistir da compra" e "Apagar minha conta"
 * (auditoria de 01/10/2026, LEGAL-118). Cada pedaço só sai se existir.
 */
export function IdentificacaoCurta() {
  const partes = [
    nomeLegalCompleto(),
    empresa.cnpj && tx.cnpjNumero(empresa.cnpj),
    enderecoLinha(),
    empresa.contato.emailSuporte
  ].filter(Boolean);
  return (
    <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted m-0">
      {tx.quemOfereceCurto(partes.join(' · '))}
    </p>
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
