/* O depoimento do aluno, a parte que não precisa de navegador (29/09/2026).
 * O servidor confere tudo de novo (worker/src/api/depoimentos.js); isto é o
 * que a página usa para mostrar a prévia e o contador, e os dois lados são
 * conferidos um contra o outro em tests/depoimentos.test.ts. */

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
  if (forma === 'anonimo') return 'Aluno do curso';
  const nome = forma === 'iniciais'
    ? n.split(' ').filter(Boolean).map(p => `${[...p][0]!.toUpperCase()}.`).join(' ')
    : n;
  return [nome || 'Aluno do curso', c].filter(Boolean).join(', ');
}

export const tamanho = (texto: string) => [...texto.trim()].length;

export const ERROS: Record<string, string> = {
  'texto-curto': `Escreva pelo menos ${TEXTO_MIN} caracteres.`,
  'texto-longo': `O texto passou de ${TEXTO_MAX} caracteres. Corte um pouco.`,
  'nome-faltando': 'Escreva o nome que deve aparecer, ou escolha outra forma de assinar.',
  'rate-limited': 'Muitas alterações seguidas. Tente de novo daqui a uma hora.',
  'no-access': 'O depoimento é só para quem tem o curso liberado.',
  'not-signed-in': 'Sua sessão terminou. Entre de novo para enviar.'
};
