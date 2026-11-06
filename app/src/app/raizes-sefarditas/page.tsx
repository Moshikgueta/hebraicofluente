import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Container, H2 } from '@/components/landing/base';
import { Abertura, AvisoEmBreve, Ponte } from '@/components/portal/Jornada';
import { FichaDoProduto } from '@/components/portal/FichaDoProduto';
import { ListaDeEspera } from '@/components/portal/ListaDeEspera';
import { produtos } from '@/lib/ecossistema';

export const metadata: Metadata = meta({
  rota: '/raizes-sefarditas',
  title: 'Raízes Sefarditas: história, cultura e memória (em breve) - Hebraico Fluente',
  description:
    'Uma jornada em dez módulos pela história dos judeus sefarditas, da Península Ibérica aos ' +
    'caminhos que chegaram ao Brasil. Em breve.'
});

/* Raízes Sefarditas, "Em breve" (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Fora do catálogo (sem preço, sem art. 1 dos Termos) e em revisão humana
 * (CLAUDE.md, Raízes). Decisão do dono: a página diz o que é, SEM preço e
 * sem compra. Nenhuma afirmação histórica nova aqui: o conteúdo de verdade,
 * com as marcas de evidência, mora no curso. O que esta página promete é o
 * cuidado com a diferença entre memória de família e prova documental. */
const COMO = [
  { t: 'Leitura com mapa', d: 'Cada módulo é um capítulo de leitura, com os lugares que o texto cita marcados num mapa.' },
  { t: 'Evidência à vista', d: 'O atlas separa o que é documentado, o que é corredor e o que é hipótese.' },
  { t: 'A sua história, só sua', d: 'O laboratório de memórias de família fica guardado no seu aparelho, sem ir para servidor nenhum.' }
];

export default function RaizesSefarditasPage() {
  const p = produtos().find(x => x.id === 'raizes-sefarditas')!;
  return (
    <>
      <Abertura
        jornada="raizes"
        rubrica="Explorar raízes sefarditas"
        titulo="Uma história de caminhos, documentos e memória."
        trilha={[{ nome: 'Raízes sefarditas' }]}
        lead={<p className="m-0">{p.descricao}</p>}
      >
        <AvisoEmBreve texto="O curso está em revisão e ainda não está à venda. Sem data marcada." />
        {/* A lista de espera (23/10/2026): só o aviso, com consentimento e confirmação. */}
        <ListaDeEspera interesse="raizes" produto="Raízes Sefarditas" />
      </Abertura>

      <section aria-label="A ficha do curso">
        <Container className="pb-14 sm:pb-20">
          <FichaDoProduto p={p} titulo="O curso em cinco linhas" />
        </Container>
      </section>

      <section aria-labelledby="como-titulo" className="bg-surface-2">
        <Container className="py-14 sm:py-20 grid gap-8">
          <H2 id="como-titulo" className="m-0 max-w-[22ch]">Como ele funciona.</H2>
          <ul className="grid gap-x-10 md:grid-cols-3 list-none p-0 m-0 border-t border-line">
            {COMO.map(c => (
              <li key={c.t} className="grid content-start gap-1.5 py-5 border-b border-line">
                <p className="m-0 font-display text-[19px] font-semibold text-ink">{c.t}</p>
                <p className="m-0 font-ui text-[15.5px] leading-[1.6] text-ink-muted">{c.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="cuidado-titulo">
        <Container className="py-14 sm:py-20 grid gap-4 max-w-[820px]">
          <H2 id="cuidado-titulo" className="m-0">Um cuidado antes de começar.</H2>
          <p className="m-0 font-ui text-[17px] leading-[1.65] text-ink-body">
            Um sobrenome, uma receita de família ou um costume passado de geração em geração podem ser um
            ponto de partida, mas não comprovam ascendência. O curso ensina a separar memória de
            documento, e não diz a ninguém de onde a família veio.
          </p>
        </Container>
      </section>

      <Ponte
        jornada="raizes"
        titulo="Comece pela língua."
        texto="Enquanto o curso não abre, dá para começar pelo alfabeto hebraico, no seu ritmo, com o curso de alfabetização."
        href="/curso-de-hebraico"
        rotulo="Conhecer o curso de hebraico"
      />
    </>
  );
}
