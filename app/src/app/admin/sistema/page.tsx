import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Container, H2, Lead, Rubrica } from '@/components/landing/base';
import { Emblema } from '@/components/portal/Emblemas';
import { AvisoEmBreve, CartaoDeProduto, Migalhas, SeloDoStatus } from '@/components/portal/Jornada';
import { produtos } from '@/lib/ecossistema';

/* A amostra viva do sistema visual do site público (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Todas as peças de components/portal/README.md numa página só, para conferir
 * de uma vez que elas conversam entre si e para o dono ver o conjunto. Fora
 * da busca como todo /admin (lib/seo.ts), e sem dado de ninguém: só as peças,
 * com o conteúdo de verdade do catálogo. */
export const metadata: Metadata = meta({
  rota: '/admin/sistema',
  title: 'Sistema visual - Hebraico Fluente',
  description: 'As peças do site público numa página só.'
});

const CORES = [
  ['--navy', 'bloco escuro e botão principal'], ['--teal', 'marca e foco'], ['--teal-ink', 'tinta de link'],
  ['--teal-soft', 'fundo de Aprender hebraico'], ['--gold', 'marcadores'], ['--gold-ink', 'tinta de Descobrir Israel'],
  ['--gold-soft', 'fundo de Descobrir Israel'], ['--sand', 'fundo de Raízes sefarditas'], ['--card', 'cartão']
] as const;

export default function SistemaPage() {
  const lista = produtos();
  return (
    <Container className="py-12 grid gap-16">
      <div className="grid gap-4">
        <Migalhas trilha={[{ nome: 'Sistema visual' }]} />
        <Rubrica letra="א">Sistema visual</Rubrica>
        <h1 className="m-0 font-display font-semibold text-[clamp(34px,5vw,56px)] leading-[1.04] tracking-[-0.035em]">
          As peças do site público.
        </h1>
        <Lead className="m-0">Cada uma está descrita em components/portal/README.md, com quando usar.</Lead>
      </div>

      <section className="grid gap-5" aria-labelledby="cores">
        <H2 id="cores" className="m-0">Cores</H2>
        <ul className="grid gap-3 sm:grid-cols-3 list-none p-0 m-0">
          {CORES.map(([v, uso]) => (
            <li key={v} className="flex items-center gap-3">
              <span aria-hidden className="w-12 h-12 rounded-[12px] border border-line shrink-0" style={{ background: `var(${v})` }} />
              <span className="grid font-ui text-[14px]"><code>{v}</code><span className="text-ink-muted">{uso}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5" aria-labelledby="tipo">
        <H2 id="tipo" className="m-0">Tipografia</H2>
        <Rubrica letra="ב">Rubrica com letra</Rubrica>
        <Rubrica>Rubrica sem letra</Rubrica>
        <H2 className="m-0">Título de seção (H2)</H2>
        <Lead className="m-0">Lead: o parágrafo que abre uma seção, em até 56 caracteres por linha.</Lead>
        <p className="m-0 font-ui text-[16px] leading-[1.6] text-ink-body max-w-[62ch]">
          Texto corrido, em ink-body. O texto de apoio usa ink-muted, e nunca um cinza solto.
        </p>
      </section>

      <section className="grid gap-5" aria-labelledby="botoes">
        <H2 id="botoes" className="m-0">Botões e selos</H2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center min-h-[52px] px-6 rounded-[var(--r-md)] bg-[var(--navy)] text-white font-ui text-[15.5px] font-medium">Principal</span>
          <span className="inline-flex items-center min-h-[52px] px-6 rounded-[var(--r-md)] bg-[var(--card)] text-ink border border-line font-ui text-[15.5px] font-medium">Secundário</span>
          <span className="inline-flex items-center min-h-[52px] px-6 rounded-[var(--r-md)] bg-[var(--navy)] p-1">
            <span className="inline-flex items-center min-h-[44px] px-5 rounded-[var(--r-md)] bg-white text-[var(--navy)] font-ui text-[15px] font-medium">Sobre navy</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SeloDoStatus status="disponivel" />
          <SeloDoStatus status="em-desenvolvimento" />
          <SeloDoStatus status="em-breve" />
        </div>
        <AvisoEmBreve texto="O aviso de produto fora de venda, sem data inventada." />
      </section>

      <section className="grid gap-5" aria-labelledby="emblemas">
        <H2 id="emblemas" className="m-0">Emblemas das jornadas</H2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-[18px] p-6 bg-[var(--teal-soft)] text-[var(--teal-ink)]"><Emblema jornada="hebraico" /></div>
          <div className="rounded-[18px] p-6 bg-[var(--gold-soft)] text-[var(--gold-ink)]"><Emblema jornada="israel" /></div>
          <div className="rounded-[18px] p-6 bg-[var(--sand)] text-[var(--navy)]"><Emblema jornada="raizes" /></div>
        </div>
      </section>

      <section className="grid gap-5" aria-labelledby="cartoes">
        <H2 id="cartoes" className="m-0">Cartões de produto</H2>
        <ul className="grid gap-5 md:grid-cols-2 list-none p-0 m-0">
          {lista.map(p => <li key={p.id}><CartaoDeProduto p={p} /></li>)}
        </ul>
      </section>
    </Container>
  );
}
