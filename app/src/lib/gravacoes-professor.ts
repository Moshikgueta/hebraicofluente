/* As explicações gravadas pelo professor (data/gravacoes-professor.json).
 * O id é o nome com significado ("letter-het-pronunciation"); o clipe é o
 * do catálogo de áudio, gravado pelo painel /admin/gravar. */
import professorJson from '@content/professor.json';

export type GravacaoProfessor = { tituloPt: string; audioId: string };

const GRAVACOES = (professorJson as { gravacoes: Record<string, GravacaoProfessor> }).gravacoes;

export const gravacaoDoProfessor = (id: string): GravacaoProfessor | null => GRAVACOES[id] ?? null;
export const idsDoProfessor = (): string[] => Object.keys(GRAVACOES);
