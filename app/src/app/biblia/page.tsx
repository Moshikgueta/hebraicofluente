import type { Metadata } from 'next';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { Versiculo } from '@/components/landing/Versiculo';
import { bibleVerses, course } from '@/lib/content-publico';

export const metadata: Metadata = {
  title: 'Vou conseguir ler a Bíblia em hebraico? - Hebraico Fluente',
  description:
    'A resposta honesta tem duas metades: sim, você vai decodificar o texto em voz ' +
    'alta; não, você não vai entender o que leu sem vocabulário e gramática. Aqui ' +
    'está Gênesis 1:1, palavra por palavra, para você julgar por si.'
};

/* «Vou conseguir ler a Bíblia?»
 * ─────────────────────────────────────────────────────────────────────────
 * É a pergunta que mais chega antes da compra, e por isso a página é PÚBLICA:
 * quem pergunta ainda não pagou, e uma expectativa só pode ser ajustada antes
 * do pagamento. Deixá-la do lado de dentro seria contar o limite do produto
 * para quem já não pode mais mudar de ideia.
 *
 * A resposta tem duas metades e elas só valem juntas. Dar só o "sim" vende
 * mais hoje e devolve o dinheiro depois; dar só o "não" é honesto e inútil.
 * Então as duas aparecem lado a lado, do mesmo tamanho, e o versículo no meio
 * é o que deixa a pessoa decidir se aquilo basta para ela.
 *
 * O número da lição em que o versículo fica legível é CALCULADO (o `after` que
 * o exportador escreve a partir da ordem real das letras), e não escrito aqui:
 * mudar a ordem do alfabeto não pode deixar esta página prometendo uma lição
 * que não existe mais.
 *
 * Página de servidor, exceto o versículo, que precisa de toque.
 */

export default function BibliaPage() {
  /* A V22 do validate.js exige pelo menos um versículo, e a build falha se o
     arquivo vier vazio - melhor aqui, em voz alta, do que uma página de
     vendas publicada sem o argumento que ela existe para fazer. */
  const v = bibleVerses()[0];
  if (!v) throw new Error('data/biblia.json não tem nenhum versículo');

  return (
    <>
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-18 grid gap-5">
          <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
            A pergunta que mais chega
          </p>
          <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.12] text-ink max-w-[20ch]">
            Vou conseguir ler a Bíblia em hebraico?
          </h1>
          <p className="text-[17px] leading-relaxed text-ink-body max-w-[58ch]">
            A resposta honesta tem duas metades, e as duas importam. Elas estão
            logo abaixo, do mesmo tamanho, antes de qualquer botão.
          </p>
        </div>
      </div>

      <Section labelledBy="resposta">
        <SectionHead
          id="resposta"
          eyebrowPt="A resposta curta"
          titlePt="Sim para ler. Não para entender."
          leadPt="São duas habilidades diferentes, e confundir as duas é o que faz alguém comprar um curso de alfabetização achando que comprou um curso de língua."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6 grid gap-3 content-start">
            <Badge tone="mint">Sim</Badge>
            <h3 className="font-display text-[20px] font-bold text-ink">
              Você vai ler em voz alta.
            </h3>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body">
              O texto hebraico da Bíblia usado hoje vem com os sinais de vogal
              - o nikud que os massoretas de Tiberíades fixaram para registrar
              a pronúncia. São exatamente as 22 letras e os sinais que este
              curso ensina. Com eles você decodifica qualquer versículo, sem
              transliteração e sem ajuda.
            </p>
          </Card>
          <Card className="p-6 grid gap-3 content-start">
            <Badge tone="ember">Não</Badge>
            <h3 className="font-display text-[20px] font-bold text-ink">
              Você não vai entender o que leu.
            </h3>
            <p className="font-ui text-[15px] leading-relaxed text-ink-body">
              Entender pede vocabulário e gramática, e o hebraico da Bíblia tem
              construções que o hebraico de hoje não usa. Este é um curso de
              alfabetização: ele te dá a porta, não a casa. Quem promete a casa
              em oito semanas está vendendo outra coisa.
            </p>
          </Card>
        </div>
      </Section>

      <Section tone="surface" labelledBy="versiculo">
        <SectionHead
          id="versiculo"
          eyebrowPt="Veja por si"
          titlePt="As sete primeiras palavras da Bíblia hebraica."
          leadPt="Toque em qualquer uma. Você vai ver as duas metades da resposta no mesmo lugar: como ela se lê, e o que ela quer dizer - que é a parte que alguém precisou trazer."
        />
        <Versiculo v={v} />
        <p className="font-ui text-[14px] leading-relaxed text-ink-muted max-w-[58ch] mt-5">
          Todas as letras deste versículo são ensinadas até a lição {v.after} das{' '}
          {course.totalLetters}. Ou seja: ele fica legível antes de o curso acabar,
          e não no fim dele.
        </p>
      </Section>

      <Section labelledBy="muda">
        <SectionHead
          id="muda"
          eyebrowPt="Mesmo assim"
          titlePt="O que muda quando você lê as letras."
          leadPt="Decodificar sem entender parece pouco escrito assim. Na prática é a diferença entre depender inteiramente de uma tradução e poder conferir."
        />
        <ol className="grid gap-4 sm:grid-cols-2 list-none p-0 m-0">
          {[
            ['Você acompanha o original',
             'Uma Bíblia interlinear ou com o hebraico ao lado deixa de ser decoração na página. Você segue a linha em vez de pular para a coluna em português.'],
            ['Você procura no léxico',
             'Dicionários, léxicos e concordâncias de hebraico são organizados pelo alfabeto hebraico. Sem as letras você não acha a palavra; com elas, acha.'],
            ['Você confere uma tradução',
             'Quando duas versões discordam num versículo, a discordância está numa palavra. Saber ler é o que permite ir olhar essa palavra.'],
            ['Você reconhece o que já conhece',
             'Nomes, lugares e palavras que você ouve a vida inteira param de ser som e viram texto - a começar por esta, na terceira posição do versículo acima.']
          ].map(([t, b], i) => (
            <li key={t}>
              <Card className="p-5 grid gap-2 h-full content-start">
                <span aria-hidden
                      className="w-[30px] h-[30px] rounded-full bg-[var(--accent-wash)]
                                 text-[var(--accent)] font-ui text-[13px] font-bold
                                 grid place-items-center tabular-nums">
                  {i + 1}
                </span>
                <h3 className="font-display text-[17px] font-bold text-ink">{t}</h3>
                <p className="font-ui text-[14px] leading-relaxed text-ink-body">{b}</p>
                {i === 3 && (
                  <p className="pt-1">
                    <He size="word">{v.words[2]!.he}</He>
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* A parte que quase nenhum material conta antes da compra, e que muda
          o que a pessoa deve esperar de uma sinagoga. */}
      <Section tone="wash" labelledBy="rolo">
        <SectionHead
          id="rolo"
          eyebrowPt="Uma coisa que ninguém avisa"
          titlePt="Num rolo de Torá não há um único ponto de vogal."
          leadPt="Os sinais são uma invenção posterior, feita para registrar a pronúncia. O rolo lido na sinagoga não os tem, e a Israel de hoje escreve sem eles também."
        />
        <Card className="p-6 sm:p-8 grid gap-4">
          <div className="grid gap-1.5">
            <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">
              Com os pontos, numa Bíblia impressa
            </p>
            <p dir="rtl" lang="he"><He size="word">{v.he}</He></p>
          </div>
          <div className="grid gap-1.5 border-t border-[color:var(--line-soft)] pt-4">
            <p className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted">
              Sem os pontos, como está no rolo
            </p>
            <p dir="rtl" lang="he"><He size="word">{v.bare}</He></p>
          </div>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[58ch]">
            É a mesma linha. Por isso o curso não termina no nikud: o módulo 6
            fecha com uma etapa inteira de leitura sem os pontos, que é a forma
            em que o hebraico existe na rua, no jornal e no rolo.
          </p>
        </Card>
      </Section>

      <Section>
        <FaixaCta
          onde="biblia"
          titulo="A porta primeiro."
          linha="As 22 letras, sem transliteração no fim. A primeira leva dez minutos e responde melhor do que esta página."
        />
      </Section>
    </>
  );
}
