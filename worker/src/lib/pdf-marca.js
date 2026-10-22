/* A marca d'água no PDF do e-book (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Refazer um PDF de 380 páginas por pedido não cabe nos 10 ms de CPU do
 * Workers gratuito. O que cabe: uma "atualização incremental", que o formato
 * PDF prevê - bytes acrescentados ao FIM do arquivo que substituem objetos
 * do original. A publicação (scripts/pdf-marca.mjs) monta essa cauda uma vez:
 * cada página ganha, por cima do que já tinha, um texto em pé na margem
 * esquerda, e os metadados ganham um Assunto. O texto mora num campo de
 * largura FIXA, então nenhum endereço da tabela xref muda quando ele muda.
 *
 * Por pedido, o Worker só escreve "Licenciado para mo•••@dominio · cópia
 * XXXXXXXX" nesses campos e manda o PDF original seguido da cauda, sem ler o
 * original (passa direto do servidor de ativos para a resposta).
 *
 * Este arquivo é o lado do Worker e também o que o gerador usa para codificar
 * o campo, para que os dois lados nunca discordem da largura.
 */

/** A largura do campo de texto, em bytes, dentro dos parênteses. */
export const LARGURA = 120;

/* WinAnsiEncoding: o ASCII imprimível passa; estes são os de fora que a
   marca usa ou que um e-mail pode ter. O resto vira "?". */
const WIN_ANSI = { '•': 0x95, '·': 0xb7, 'ó': 0xf3, 'á': 0xe1, 'é': 0xe9, 'í': 0xed, 'ú': 0xfa, 'ã': 0xe3, 'õ': 0xf5, 'ç': 0xe7, 'â': 0xe2, 'ê': 0xea, 'ô': 0xf4 };

/** O texto da marca em bytes de string literal PDF (já escapados),
 *  completado com espaços até LARGURA. Corta o que passar. */
export function campoDaMarca(texto, metadado = false) {
  const out = [];
  for (const ch of String(texto)) {
    const c = ch.codePointAt(0);
    let b = c >= 0x20 && c < 0x7f ? c : (WIN_ANSI[ch] ?? 0x3f);
    /* Os metadados (Assunto) usam a PDFDocEncoding, igual à WinAnsi
       nestes caracteres menos no "•". */
    if (metadado && ch === '•') b = 0x80;
    const esc = b === 0x28 || b === 0x29 || b === 0x5c;
    if (out.length + (esc ? 2 : 1) > LARGURA) break;
    if (esc) out.push(0x5c);
    out.push(b);
  }
  while (out.length < LARGURA) out.push(0x20);
  return Uint8Array.from(out);
}

export function textoDaMarca(emailEscondido, copia) {
  return `Licenciado para ${emailEscondido}` + (copia ? ` · cópia ${copia}` : '');
}

/** A cauda com o texto nos campos. `meta.campos` são os inícios de cada
 *  campo dentro da cauda (`[inicio, metadado]`). Devolve uma cópia; o
 *  molde não muda. */
export function caudaMarcada(molde, meta, texto) {
  const cauda = new Uint8Array(molde);
  for (const [inicio, metadado] of meta.campos) cauda.set(campoDaMarca(texto, metadado), inicio);
  return cauda;
}
