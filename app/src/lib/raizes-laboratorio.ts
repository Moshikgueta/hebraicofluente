/* O Laboratório de Memórias Familiares (Raízes Sefarditas, módulo 9).
 * ─────────────────────────────────────────────────────────────────────────
 * O que o aluno anota sobre a própria família fica SÓ neste aparelho
 * (localStorage, como a reflexão): não vai para /api/progress, não vai a
 * nenhuma API, não entra no certificado. Sincronizar entre aparelhos pediria
 * tabela própria, criptografia e uma linha nova na Política de Privacidade.
 *
 * Duas regras do produto moram aqui:
 *   · nenhum percentual e nenhuma conclusão automática: o resumo só CONTA as
 *     fichas por tipo de evidência, nunca estima ascendência;
 *   · o tipo de evidência é sempre um dos quatro, escolhido pelo aluno.
 */

export const CHAVE_LABORATORIO = 'hf-raizes-laboratorio-v1';

export const EVIDENCIAS = [
  { id: 'documentado', nome: 'Documentado', ajuda: 'Há um registro: certidão, assento de batismo, casamento ou óbito, processo.' },
  { id: 'oral', nome: 'Memória oral', ajuda: 'Alguém da família contou. Vale guardar quem, quando e o que disse.' },
  { id: 'hipotese', nome: 'Hipótese', ajuda: 'Uma ideia a testar: um sobrenome, um lugar, uma coincidência.' },
  { id: 'nao-verificado', nome: 'Não verificado', ajuda: 'Veio de algum lugar e ainda não foi conferido.' }
] as const;

export type Evidencia = (typeof EVIDENCIAS)[number]['id'];

export type Pessoa = {
  id: string; nome: string; relacao: string; quando: string; onde: string;
  evidencia: Evidencia; fonte: string; notas: string;
};
export type Anotacao = { id: string; em: string; texto: string };
export type Laboratorio = { pessoas: Pessoa[]; diario: Anotacao[] };

export const LABORATORIO_VAZIO: Laboratorio = { pessoas: [], diario: [] };

/** Limites: o aparelho guarda pouco, e um campo sem teto vira um depósito. */
export const LIMITES = { pessoas: 200, diario: 300, campo: 200, texto: 2000 } as const;

const ehEvidencia = (v: unknown): v is Evidencia => EVIDENCIAS.some(e => e.id === v);
const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Limpa o que veio do aparelho (pode ter sido mexido, ou ser de uma versão antiga). */
export function normalizar(bruto: unknown): Laboratorio {
  if (!bruto || typeof bruto !== 'object') return { pessoas: [], diario: [] };
  const b = bruto as { pessoas?: unknown; diario?: unknown };
  const pessoas = (Array.isArray(b.pessoas) ? b.pessoas : [])
    .map((p): Pessoa | null => {
      if (!p || typeof p !== 'object') return null;
      const x = p as Record<string, unknown>;
      const nome = texto(x.nome, LIMITES.campo);
      if (!nome || typeof x.id !== 'string') return null;
      return {
        id: x.id.slice(0, 40), nome,
        relacao: texto(x.relacao, LIMITES.campo), quando: texto(x.quando, LIMITES.campo),
        onde: texto(x.onde, LIMITES.campo),
        evidencia: ehEvidencia(x.evidencia) ? x.evidencia : 'nao-verificado',
        fonte: texto(x.fonte, LIMITES.texto), notas: texto(x.notas, LIMITES.texto)
      };
    })
    .filter((p): p is Pessoa => p !== null)
    .slice(0, LIMITES.pessoas);
  const diario = (Array.isArray(b.diario) ? b.diario : [])
    .map((a): Anotacao | null => {
      if (!a || typeof a !== 'object') return null;
      const x = a as Record<string, unknown>;
      const t = texto(x.texto, LIMITES.texto);
      if (!t || typeof x.id !== 'string' || typeof x.em !== 'string') return null;
      return { id: x.id.slice(0, 40), em: x.em.slice(0, 30), texto: t };
    })
    .filter((a): a is Anotacao => a !== null)
    .slice(0, LIMITES.diario);
  return { pessoas, diario };
}

export function adicionarPessoa(l: Laboratorio, p: Omit<Pessoa, 'id'>, id: string): Laboratorio {
  if (l.pessoas.length >= LIMITES.pessoas) return l;
  const nova = normalizar({ pessoas: [{ ...p, id }], diario: [] }).pessoas[0];
  return nova ? { ...l, pessoas: [...l.pessoas, nova] } : l;
}

export function anotar(l: Laboratorio, textoLivre: string, em: string, id: string): Laboratorio {
  if (l.diario.length >= LIMITES.diario) return l;
  const nova = normalizar({ pessoas: [], diario: [{ id, em, texto: textoLivre }] }).diario[0];
  return nova ? { ...l, diario: [nova, ...l.diario] } : l;
}

export const removerPessoa = (l: Laboratorio, id: string): Laboratorio => ({ ...l, pessoas: l.pessoas.filter(p => p.id !== id) });
export const removerAnotacao = (l: Laboratorio, id: string): Laboratorio => ({ ...l, diario: l.diario.filter(a => a.id !== id) });

/** Quantas fichas há de cada tipo de evidência. Só contagem, nunca estimativa. */
export function resumo(l: Laboratorio): { id: Evidencia; nome: string; n: number }[] {
  return EVIDENCIAS.map(e => ({ id: e.id, nome: e.nome, n: l.pessoas.filter(p => p.evidencia === e.id).length }));
}

/** O arquivo que o aluno baixa: os dados dele, e o lembrete do que eles não provam. */
export function exportar(l: Laboratorio, agora: string): string {
  return JSON.stringify({
    produto: 'Raízes Sefarditas - Laboratório de Memórias Familiares',
    exportadoEm: agora,
    aviso: 'Anotações pessoais, guardadas só no seu aparelho. Conhecer a história sefardita não é comprovar uma ascendência sefardita.',
    pessoas: l.pessoas,
    diario: l.diario
  }, null, 2);
}
