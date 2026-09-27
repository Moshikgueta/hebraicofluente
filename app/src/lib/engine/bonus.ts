/* As leituras bônus: textos e versículos bíblicos (27/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Trocadas por XP em Recompensas (lib/loja.ts), fora do caminho do curso. O
 * conteúdo mora em data/bonus.json, que explica as escolhas (o Nome, os
 * te'amim, por que o passado bíblico entra aqui e não no curso).
 *
 * Como os mini-textos, cada leitura só aparece depois de revisada por quem
 * fala hebraico: `leiturasPublicadas` filtra.
 */

export type LinhaBonus = { he: string; translit: string; pt: string; audioId?: string };

export type LeituraBonus = {
  id: string;
  /** "texto" (um trecho, 200 XP) ou "curto" (versículo, 100 XP). */
  tipo: 'texto' | 'curto';
  revisado: boolean;
  tituloPt: string;
  fontePt: string;
  introPt: string;
  /** A ordem da letra mais tardia: a loja só oferece o que o aluno lê. */
  after: number;
  linhas: LinhaBonus[];
};

/** O guia «O nikud da Bíblia» (/nikud-biblico): opcional, fora da trilha. */
export type ExemploNikud = { he: string; translit: string; pt: string; ouvir?: string; audioId?: string };
export type GuiaNikud = {
  revisado: boolean;
  tituloPt: string;
  introPt: string;
  secoes: { id: string; tituloPt: string; textoPt: string; exemplos: ExemploNikud[] }[];
};

export const leiturasPublicadas = (ls: readonly LeituraBonus[]): LeituraBonus[] =>
  ls.filter(l => l.revisado);

/** O item da loja que abre esta leitura. */
export const itemDaLeitura = (l: Pick<LeituraBonus, 'tipo'>): 'texto-bonus' | 'bencao' =>
  l.tipo === 'texto' ? 'texto-bonus' : 'bencao';
