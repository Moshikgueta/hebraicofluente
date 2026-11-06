/* O nome do cadastro, e quando ele pode aparecer num e-mail.
 * ─────────────────────────────────────────────────────────────────────────
 * Auditoria de 01/10/2026, SEC-A-003. O campo nome é livre, e os e-mails que
 * saem do nosso domínio (assinados com DKIM) começavam com "Oi, <nome>.".
 * Quem cria uma conta com o e-mail de OUTRA pessoa escolhe esse nome, e a
 * dona do endereço recebia, de contato@hebraicofluente.com.br, uma mensagem
 * que abria com "Sua conta foi bloqueada. Regularize em https://...". O HTML
 * já era escapado; o texto puro e o link viravam clicáveis do mesmo jeito.
 *
 * A regra é de NOME de gente: letras (de qualquer alfabeto, com acento),
 * espaço, apóstrofo, hífen e o ponto de uma abreviação ("Ana M. Souza").
 * Fica de fora tudo que faz um link ou um golpe: `/`, `:`, `@`, dígito
 * (telefone, valor, chave PIX), e letra-ponto-letra, que é o desenho de um
 * domínio ("pagamento.com"). Teto de 60 caracteres e 6 palavras: cabe nome
 * composto com dois sobrenomes, não cabe um parágrafo.
 *
 * Isto não impede uma frase só de letras ("Sua conta foi bloqueada"). Por
 * isso os e-mails que chegam a um endereço AINDA NÃO CONFIRMADO (a
 * confirmação, e a senha de uma conta não confirmada) não usam o nome:
 * esses são exatamente os que um impostor manda para a vítima.
 */

export const NOME_MAX = 60;
const PALAVRAS_MAX = 6;

/** O nome limpo (espaços juntados), ou '' se ele não serve como nome. */
export function nomeSeguro(nome) {
  const v = String(nome === null || nome === undefined ? '' : nome)
    .normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!v || [...v].length > NOME_MAX) return '';
  /* Só letra, marca de acento, espaço, apóstrofo, hífen e ponto, e
     começando por letra. */
  if (!/^\p{L}[\p{L}\p{M} .'’-]*$/u.test(v)) return '';
  /* Desenho de domínio: letra, ponto, letra, sem espaço no meio. */
  if (/\p{L}\.\p{L}/u.test(v)) return '';
  /* Dois sinais seguidos (`..`, `--`, `.-`) não são nome. */
  if (/[.'’-]{2,}/u.test(v)) return '';
  if (v.split(' ').length > PALAVRAS_MAX) return '';
  return v;
}
