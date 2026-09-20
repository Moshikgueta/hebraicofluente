/* O conteúdo do curso para quem renderiza no SERVIDOR.
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠ SÓ de componente de servidor. Um componente de cliente que importe isto
 * põe o curso inteiro de volta no pacote do navegador, que é o defeito que
 * este arquivo existe para consertar.
 *
 * A tranca não é o aviso acima, é o teste: `tests/conteudo.test.ts` abre
 * cada arquivo publicado em `out/_next/static/` e falha se achar material de
 * ensino. O pacote `server-only` faria o compilador cobrar isso e é o jeito
 * canônico - não está instalado aqui, e acrescentar dependência por uma
 * linha de guarda não se paga quando o teste já cobre o mesmo, contra o
 * resultado em vez de contra a intenção.
 *
 * Por que um componente de servidor PODE carregar o curso inteiro, sendo que
 * o de cliente não pode: porque ele não viaja. Numa build estática, o que o
 * componente de servidor produz é o HTML da rota - e as rotas de aluno
 * (`/licao/*`, `/inicio`, `/modulo/*`…) só saem do Worker para quem tem
 * cookie e direito de acesso. O conteúdo renderizado ali já está atrás do
 * portão de verdade.
 *
 * O que vazava era outra coisa: o JavaScript do navegador, que mora em
 * `/_next/static/` e não tem portão nenhum. Esse é o `content.ts`, e é ele
 * que passou a buscar de /api/content.
 */

import lettersJson from '@content/letters.json';
import nikudJson from '@content/nikud.json';
import extrasJson from '@content/extras.json';
import realWorldJson from '@content/real-world.json';
import strokeJson from '@content/stroke-paths.json';
import cultureJson from '@content/culture.json';
import type {
  CultureCard, Letter, NikudIntro, NikudSound, Scene, StrokeSet
} from './content-publico';

export type ConteudoPago = {
  letters: Letter[];
  nikud: { intro: NikudIntro; dagesh: { title?: string; body?: string } | null; sounds: NikudSound[] };
  extras: import('./engine/extras').Extras;
  scenes: Scene[];
  strokes: Record<string, StrokeSet>;
  culture: CultureCard[];
};

/**
 * Tudo que é pago, num objeto só.
 *
 * É esta mesma forma que `/api/content` devolve e que `hidratarConteudo`
 * consome - um contrato para os dois caminhos, para que o modo local e a
 * produção não possam divergir em silêncio.
 */
export const conteudoPago: ConteudoPago = {
  letters: (lettersJson as unknown as Letter[]).slice().sort((a, b) => a.order - b.order),
  nikud: nikudJson as unknown as ConteudoPago['nikud'],
  extras: extrasJson as unknown as ConteudoPago['extras'],
  scenes: (realWorldJson as unknown as { scenes: Scene[] }).scenes,
  strokes: (strokeJson as unknown as { box: number; letters: Record<string, StrokeSet> }).letters,
  culture: (cultureJson as unknown as { cards: CultureCard[] }).cards
};

/* ── as letras, para as rotas ─────────────────────────────────────────────
 * As mesmas três perguntas que `content.ts` responde no navegador, aqui
 * respondidas na build. Quem precisa delas é o `page.tsx` de cada rota paga:
 * ele roda no servidor, lista os endereços com `generateStaticParams` e passa
 * a letra pronta como propriedade para o componente de cliente.
 *
 * É de propósito que sejam funções separadas e não o depósito de
 * `content.ts`: o depósito começa vazio e se enche por busca, que é uma coisa
 * que só o navegador faz. Na build não há quem busque - e chamar `allLetters()`
 * de um `generateStaticParams` foi exatamente o erro que derrubou a primeira
 * tentativa desta mudança.
 */
export const letrasDoServidor = (): Letter[] => conteudoPago.letters;
export const letraDoServidor = (id: string): Letter | undefined =>
  conteudoPago.letters.find(l => l.id === id);
export const letrasDoModulo = (n: number): Letter[] =>
  conteudoPago.letters.filter(l => l.module === n);
