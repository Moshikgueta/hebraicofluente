/* O pré-lançamento tem data, e a data tem de ser vigiada.
 * ─────────────────────────────────────────────────────────────────────────
 * `data/courses.json` diz `preLancamentoAte: "2026-10-31"` e `listBrl: 297`,
 * e o site inteiro escreve "Preço de pré-lançamento até 31/10/2026. Depois,
 * R$ 297". Nada no código compara essa data com hoje: `fimDoPreLancamento`
 * (lib/catalog.ts) só a formata, e o Worker cobra `price.brl` sem olhar
 * data nenhuma. No dia 01/11 a frase continua no ar, com a data vencida, e
 * o "depois R$ 297" vira o preço de referência que nunca chega - que é
 * publicidade enganosa, e não um esquecimento (auditoria de 01/10/2026,
 * PAY-B-001).
 *
 * A regra de preço NÃO mora aqui. Decisão do dono em 01/10/2026: o preço
 * SOBE para `listBrl` quando o pré-lançamento acaba, e quem faz a virada é
 * tools/virar-preco.mjs, rodado pelo workflow agendado virar-preco.yml em
 * 01/11 às 00:05 de Brasília. Este módulo só DIZ EM QUE PÉ a data está, e `app/check-legal.mjs` transforma
 * isso em aviso (faltam 10 dias ou menos) ou em falha (venceu) antes de
 * publicar. O check não monta TypeScript, então ele repete estas linhas, com
 * um comentário apontando para cá; o teste em tests/pre-lancamento.test.ts
 * cobre as duas cópias com as mesmas datas.
 */

export type EstadoDoPreLancamento = 'ok' | 'avisa' | 'vencido';

/** A partir de quantos dias antes do fim o check avisa. */
export const DIAS_DE_AVISO = 10;

/** `YYYY-MM-DD` em UTC: a mesma régua do arquivo, sem fuso. */
export const diaIso = (d: Date): string => d.toISOString().slice(0, 10);

const diasEntre = (de: string, ate: string): number =>
  Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000);

/**
 * Em que pé está o pré-lançamento de um preço, visto de `hoje` (`YYYY-MM-DD`,
 * UTC, ou um Date).
 *
 *   'ok'      não há pré-lançamento com data (sem `listBrl` ou sem
 *             `preLancamentoAte`), ou o fim está a mais de DIAS_DE_AVISO;
 *   'avisa'   o fim é hoje ou está a até DIAS_DE_AVISO dias;
 *   'vencido' `preLancamentoAte` é ANTERIOR a hoje e `listBrl` continua lá:
 *             o site anuncia uma data passada e um preço cheio que não
 *             chegou.
 *
 * Uma data fora do formato conta como ausente: o defeito de digitação já é
 * recusado por `fimDoPreLancamento`, que não a mostra.
 */
export function estadoDoPreLancamento(
  price: { listBrl: number | null; preLancamentoAte?: string | null },
  hoje: string | Date
): EstadoDoPreLancamento {
  const fim = price.preLancamentoAte;
  if (price.listBrl === null || price.listBrl === undefined) return 'ok';
  if (!fim || !/^\d{4}-\d{2}-\d{2}$/.test(fim)) return 'ok';
  const dia = typeof hoje === 'string' ? hoje : diaIso(hoje);
  const faltam = diasEntre(dia, fim);
  if (faltam < 0) return 'vencido';
  if (faltam <= DIAS_DE_AVISO) return 'avisa';
  return 'ok';
}
