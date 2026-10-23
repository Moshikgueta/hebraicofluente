import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { PageHead, Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { course } from '@/lib/content-publico';
import { somPt } from '@/lib/som-pt';
import { FORMAS_FINAIS, letraPublica } from '@/lib/alfabeto-publico';
import { METODO_ORIGINAL } from '@/lib/credito';

export const metadata: Metadata = meta({
  rota: '/alfabeto-hebraico',
  title: 'Alfabeto hebraico: as 22 letras, o som e como ler - Hebraico Fluente',
  description:
    'As 22 letras do alfabeto hebraico com o nome e o som em português, as cinco formas finais e ' +
    'como funcionam as vogais. Teste grátis da primeira letra.'
});

/* A página principal do alfabeto (23/10/2026, plano de marketing, opção B de
 * marketing/seo/paginas-do-alfabeto.md). Só o que já é público: a forma, o
 * nome e o som de cada letra (lib/content-publico.ts) e as formas finais,
 * que são conhecimento geral do alfabeto. A explicação de cada letra continua
 * no curso. As letras com página própria (lib/alfabeto-publico.ts) ganham link. */
export default function AlfabetoHebraicoPage() {
  const letras = [...course.letters].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHead
        trilha={[{ nome: 'Aprender hebraico', href: '/aprender-hebraico' }, { nome: 'Alfabeto hebraico' }]}
        eyebrowPt="Alfabeto hebraico"
        titlePt="As 22 letras do hebraico, uma por uma."
        leadPt={
          <>
            O alfabeto hebraico tem 22 letras, e todas são consoantes. As vogais são sinais pequenos embaixo,
            em cima ou ao lado das letras: o nikud. E tudo se lê da direita para a esquerda.
          </>
        }
      />

      <Section labelledBy="tabela">
        <SectionHead
          id="tabela"
          eyebrowPt="A tabela"
          titlePt="O nome e o som de cada letra."
          leadPt={`Na ordem em que o curso as ensina, que vem do método do ${METODO_ORIGINAL.autor}. As cinco letras que mudam de forma no fim da palavra aparecem com a forma final ao lado.`}
        />
        <div className="overflow-x-auto">
          <table className="w-full font-ui text-[15px] border-collapse">
            <thead>
              <tr className="text-left text-ink-muted">
                <th className="py-2 pr-4">Letra</th>
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Som</th>
                <th className="py-2">Forma final</th>
              </tr>
            </thead>
            <tbody>
              {letras.map(l => {
                const pagina = letraPublica(l.id);
                const final = FORMAS_FINAIS[l.letter];
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="py-2.5 pr-4"><He size="lg">{l.letter}</He></td>
                    <td className="py-2.5 pr-4">
                      {pagina
                        ? <Link href={`/alfabeto-hebraico/${l.id}`} className="underline underline-offset-2 hover:text-[var(--accent)]">{l.namePt}</Link>
                        : l.namePt}
                    </td>
                    <td className="py-2.5 pr-4">{somPt(l.sound)}</td>
                    <td className="py-2.5">{final ? <He size="lg">{final}</He> : <span className="text-ink-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="surface" labelledBy="como">
        <SectionHead id="como" eyebrowPt="Como se lê" titlePt="Três coisas para saber antes da primeira letra." />
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">Da direita para a esquerda</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              A linha começa do lado direito da página, e o livro também abre pelo lado que, para nós, é o fim.
            </p>
          </div>
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">As letras são consoantes</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              Cada uma das 22 letras é uma consoante. Uma delas, o <He>א</He>, não tem som próprio: ela só segura a
              vogal.
            </p>
          </div>
          <div className="grid gap-2 content-start">
            <h3 className="font-display text-[20px] font-semibold text-ink m-0">As vogais são sinais</h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              Os pontos e traços embaixo ou em cima das letras são as vogais, o nikud. Com eles, dá para ler em voz
              alta qualquer palavra, mesmo sem saber o que ela quer dizer.
            </p>
          </div>
        </div>
      </Section>

      <Section labelledBy="cta">
        <FaixaCta
          titulo="Aprenda as 22 letras, uma por vez."
          linha={<>Comece pelo teste grátis do Álef, na página do curso: 6 exercícios curtos, sem cadastro.</>}
          onde="alfabeto-hebraico"
        />
      </Section>
    </>
  );
}
