import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { He } from '@/components/hebrew/He';
import { Itens, PageHead, Section, SectionHead } from '@/components/platform/Section';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { Versiculo } from '@/components/landing/Versiculo';
import { bibleVerses, course, licaoDaLetra, totalLicoes } from '@/lib/content-publico';

export const metadata: Metadata = meta({
  rota: '/biblia',
  title: 'Hebraico bíblico: vou conseguir ler a Bíblia? - Hebraico Fluente',
  description:
    'Sim, você vai ler o texto em voz alta; não, não vai entender sem vocabulário e gramática. ' +
    'Gênesis 1:1, palavra por palavra, para você julgar.'
});

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
  /* `after` é a ORDEM da letra mais tardia, não a lição: a 20ª letra (Bet)
     entra na lição 14 das 27. Os dois números, calculados (CONV-006). */
  const licao = licaoDaLetra(v.after);

  return (
    <>
      <PageHead
        eyebrowPt="A pergunta que mais chega"
        titlePt="Vou conseguir ler a Bíblia em hebraico?"
        leadPt="A resposta tem duas metades, e as duas importam."
      />

      <Section labelledBy="resposta">
        <SectionHead
          id="resposta"
          eyebrowPt="A resposta curta"
          titlePt="Sim para ler. Não para entender."
          leadPt="São duas habilidades diferentes, e confundir as duas é o que faz alguém comprar um curso de alfabetização achando que comprou um curso de língua."
        />
        {/* As duas metades lado a lado, do mesmo tamanho, sob o mesmo fio. O
            "Sim" e o "Não" eram dois selos pequenos; agora são a palavra que
            abre cada coluna, em teal e em dourado, e não só pela cor: a
            palavra está escrita. */}
        <div className="grid gap-10 sm:gap-12 sm:grid-cols-2">
          <div className="border-t-2 border-[var(--teal)] pt-6 grid gap-3 content-start">
            <p className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] text-[var(--teal-ink)] m-0">Sim.</p>
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">
              Você vai ler em voz alta.
            </h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              O texto hebraico da Bíblia usado hoje vem com os sinais de vogal
              - o nikud que os massoretas de Tiberíades fixaram para registrar
              a pronúncia. São exatamente as 22 letras e os sinais que este
              curso ensina. Com eles você decodifica qualquer versículo, sem
              transliteração e sem ajuda.
            </p>
          </div>
          <div className="border-t-2 border-[var(--gold)] pt-6 grid gap-3 content-start">
            <p className="font-display text-[44px] leading-none font-semibold tracking-[-0.04em] text-[var(--gold-ink)] m-0">Não.</p>
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink m-0">
              Você não vai entender o que leu.
            </h3>
            <p className="font-ui text-[16px] leading-[1.65] text-ink-body m-0">
              Entender pede vocabulário e gramática, e o hebraico da Bíblia tem
              construções que o hebraico de hoje não usa. Este é um curso de
              alfabetização: ele te dá a porta, não a casa. Quem promete a casa
              em oito semanas está vendendo outra coisa.
            </p>
          </div>
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
          Todas as letras deste versículo são ensinadas até a letra {v.after} das{' '}
          {course.totalLetters}
          {licao !== null && <> (lição {licao} das {totalLicoes()})</>}. Ou seja: ele fica
          legível antes de o curso acabar, e não no fim dele.
        </p>
      </Section>

      <Section labelledBy="muda">
        <SectionHead
          id="muda"
          eyebrowPt="Mesmo assim"
          titlePt="O que muda quando você lê as letras."
          leadPt="Decodificar sem entender parece pouco escrito assim. Na prática é a diferença entre depender inteiramente de uma tradução e poder conferir."
        />
        <Itens itens={[
          { t: 'Você acompanha o original',
            b: 'Uma Bíblia interlinear ou com o hebraico ao lado deixa de ser decoração na página. Você segue a linha em vez de pular para a coluna em português.' },
          { t: 'Você procura no léxico',
            b: 'Dicionários, léxicos e concordâncias de hebraico são organizados pelo alfabeto hebraico. Sem as letras você não acha a palavra; com elas, acha.' },
          { t: 'Você confere uma tradução',
            b: 'Quando duas versões discordam num versículo, a discordância está numa palavra. Saber ler é o que permite ir olhar essa palavra.' },
          { t: 'Você reconhece o que já conhece',
            b: 'Nomes, lugares e palavras que você ouve a vida inteira param de ser som e viram texto - a começar por esta, na terceira posição do versículo acima.',
            extra: <p className="pt-1 m-0"><He size="word">{v.words[2]!.he}</He></p> }
        ]} />
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
        <div className="rounded-[20px] bg-[var(--card)] p-6 sm:p-8 grid gap-4
                        shadow-[0_0_0_1px_var(--line),0_1px_2px_rgba(27,33,31,.04)]">
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
        </div>
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
