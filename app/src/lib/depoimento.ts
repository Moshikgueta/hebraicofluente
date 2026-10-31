/* O depoimento do aluno, a parte que não precisa de navegador (29/09/2026).
 * O servidor confere tudo de novo (worker/src/api/depoimentos.js); isto é o
 * que a página usa para mostrar a prévia e o contador, e os dois lados são
 * conferidos um contra o outro em tests/depoimentos.test.ts. */

import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/motor-depoimento';

export const TEXTO_MIN = 20;
export const TEXTO_MAX = 1200;

export type Forma = 'nome' | 'iniciais' | 'anonimo';

export type Depoimento = {
  texto: string; forma: Forma; nomePublico: string; cidade: string;
  publicar: boolean; contato: boolean;
  estado?: 'novo' | 'aprovado' | 'recusado';
};

/** Como o depoimento aparece assinado: "Ana Souza, Recife", "A. S., Recife", "Aluno do curso". */
export function assinatura({ forma, nomePublico, cidade }: Pick<Depoimento, 'forma' | 'nomePublico' | 'cidade'>): string {
  const n = nomePublico.replace(/\s+/g, ' ').trim(), c = cidade.replace(/\s+/g, ' ').trim();
  if (forma === 'anonimo') return tx.anonimo;
  const nome = forma === 'iniciais'
    ? n.split(' ').filter(Boolean).map(p => `${[...p][0]!.toUpperCase()}.`).join(' ')
    : n;
  return [nome || tx.anonimo, c].filter(Boolean).join(', ');
}

export const tamanho = (texto: string) => [...texto.trim()].length;

export const ERROS: Record<string, string> = {
  'texto-curto': fmt(tx.textoCurto, { n: TEXTO_MIN }),
  'texto-longo': fmt(tx.textoLongo, { n: TEXTO_MAX }),
  'nome-faltando': tx.nomeFaltando,
  'rate-limited': tx.rateLimited,
  'no-access': tx.noAccess,
  'not-signed-in': tx.notSignedIn
};
