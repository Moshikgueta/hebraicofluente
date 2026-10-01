/* Quando o checkout procura um PIX já gerado para reabrir (auditoria de
 * 01/10/2026, PAY-B-002). Separado do componente para ser testado sem
 * navegador (tests/estado-pagamento.test.ts).
 *
 * Só com a conta carregada e logada, sem o curso valendo (quem já é dono vê
 * "Já é seu"), sem pedido na tela, e uma vez por visita: depois de "Gerar
 * outro código" a busca não pode reabrir o código que a pessoa descartou.
 */
export function deveRetomarPix(e: {
  pronto: boolean; logado: boolean; dono: boolean; temPedido: boolean; jaProcurou: boolean;
}): boolean {
  return e.pronto && e.logado && !e.dono && !e.temPedido && !e.jaProcurou;
}
