import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { Abertura, Ponte, ProdutosDaJornada } from '@/components/portal/Jornada';
import { jornadaAberta } from '@/lib/ecossistema';

export const metadata: Metadata = meta({
  rota: '/descobrir-israel',
  title: 'Descobrir Israel: cultura, história e viagem - Hebraico Fluente',
  description:
    'Lugares, história e o dia a dia de Israel, explicados para brasileiros por um educador ' +
    'israelense. Para viajar sabendo o que se vê.'
});

/* A jornada "Descobrir Israel" (23/10/2026, portal). O produto dela é o livro
   Israel Além do Óbvio: "Em breve", sem preço, enquanto estiver fora de venda
   (`aVenda` no catálogo). A ponte leva ao curso de hebraico. */
export default function DescobrirIsraelPage() {
  return (
    <>
      <Abertura
        jornada="israel"
        rubrica="Descobrir Israel"
        titulo="Uma viagem além do óbvio."
        trilha={[{ nome: 'Descobrir Israel' }]}
        lead={
          <>
            <p className="m-0">
              Entender o que se vê muda a viagem: por que aquele lugar importa, o que é história e o que é
              tradição, como o país funciona no dia a dia, o que dizem as placas.
            </p>
            <p className="m-0">
              Esta jornada reúne o que um educador israelense explicaria a um amigo brasileiro antes de
              ele embarcar.
            </p>
          </>
        }
      />

      <ProdutosDaJornada id="israel" titulo={jornadaAberta('israel') ? 'O que esta jornada tem' : 'O que esta jornada terá'} />

      <Ponte
        jornada="israel"
        titulo="As placas de Israel estão em hebraico."
        texto="Antes da viagem, dá para aprender a ler as letras. O curso de alfabetização ensina as 22, no seu ritmo, e termina com palavras como as que aparecem em placas, rótulos e cardápios."
        href="/curso-de-hebraico"
        rotulo="Conhecer o curso de hebraico"
      />
    </>
  );
}
