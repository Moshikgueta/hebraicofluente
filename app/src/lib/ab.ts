/* O teste A/B do hero da capa (28/09 a 01/10/2026): ENCERRADO.
 * ─────────────────────────────────────────────────────────────────────────
 * A: o híbrido - "Ler e escrever hebraico, do zero." com os três desejos
 * como selos. B: as perguntas ("Quer viajar para Israel? Ler as letras da
 * Bíblia no original?"). Em 01/10/2026 ficou a A, por clareza: com o volume
 * do pré-lançamento o teste não chegaria a significância antes de 31/10
 * (auditoria de 01/10, CONV-009). O Hero não sorteia mais nada.
 *
 * `contarAB` continua exportada, e não faz nada, só porque o checkout e a
 * tela de obrigado (outra frente de trabalho) ainda a chamam. O resto do
 * desmonte - apagar este arquivo e essas chamadas, a rota /api/ab
 * (worker/src/api/ab.js) e o workflow "Relatório do teste A/B" - está
 * listado no CLAUDE.md ("Teste A/B do hero"). A tabela `ab_contagens` fica,
 * com os números do período.
 */

export const EXP_HERO = 'hero-2026-09';

export type EventoAB = 'visto' | 'clique' | 'checkout' | 'compra';

/** Não conta mais nada: o teste acabou. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function contarAB(_evento: EventoAB): void { /* encerrado em 01/10/2026 */ }
