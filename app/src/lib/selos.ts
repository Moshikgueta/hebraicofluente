/* Os cinco selos do curso, num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * Um selo é uma promessa: quando o aluno vê ⚠️, ele sabe, antes de ler a
 * primeira palavra, que aquilo ali é um erro que ele provavelmente vai
 * cometer. Isso só funciona enquanto cada símbolo quiser dizer UMA coisa.
 *
 * Não estava funcionando. Medido antes desta lista existir:
 *
 *   · 🇧🇷 marcava DUAS caixas diferentes - o bloco "Para quem fala
 *     português", que compara os dois idiomas, e a caixa ✕/✓ do erro
 *     típico. Duas promessas no mesmo símbolo é nenhuma;
 *   · ⚠️, 🧠 e 📖 não existiam em lugar nenhum, embora o conteúdo de dois
 *     deles já estivesse escrito nas 22 letras - o erro comum e a
 *     curiosidade estavam lá, sem selo;
 *   · 💡 marcava "o que você precisa lembrar", que é o FECHO da explicação,
 *     e não uma dica de leitura.
 *
 * Agora cada símbolo tem um dono. O fecho da explicação continua existindo,
 * com o mesmo destaque, e sem selo: ele não é um dos cinco tipos, é o
 * resumo do que veio antes, e o título dele já diz isso.
 *
 * ── por que os títulos moram aqui e não nas telas ───────────────────────
 * Porque a tela da lição, a do módulo 0 e a do checkpoint mostram os mesmos
 * blocos, e três cópias do título é uma que vai divergir. `tests/selos`
 * recusa o símbolo escrito à mão fora deste arquivo.
 */

import { tx } from '@/i18n/telas/motor-selos';

export type Selo = 'dica' | 'brasileiro' | 'erro' | 'padrao' | 'curiosidade';

export const SELOS: Record<Selo, { emoji: string; titulo: string }> = {
  /** Como LER uma coisa que se repete: o {{ה}} no fim da palavra, o {{וֹ}}. */
  dica: { emoji: '💡', titulo: tx.dica },
  /** A comparação com o português, quando ela ajuda. */
  brasileiro: { emoji: '🇧🇷', titulo: tx.brasileiro },
  /** O que sai errado da boca de um brasileiro, e o que sai certo. */
  erro: { emoji: '⚠️', titulo: tx.erro },
  /** O padrão que volta o curso inteiro, e que vale reconhecer de uma vez. */
  padrao: { emoji: '🧠', titulo: tx.padrao },
  /** História, cultura, a origem do desenho. Nunca é pré-requisito de nada. */
  curiosidade: { emoji: '📖', titulo: tx.curiosidade }
};

/** Os cinco símbolos, para quem precisa conferir que ninguém os escreveu à mão. */
export const EMOJIS_DE_SELO = Object.values(SELOS).map(s => s.emoji);
