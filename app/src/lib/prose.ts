/* O texto do conteúdo, com o hebraico marcado como {{…}}, em pedaços: o que é
   português e o que é hebraico. Puro, para o teste poder provar que nada com
   chave sobra na tela (auditoria de 01/10/2026, CONT-002). <Prose> desenha. */
export type PedacoDeProse = { he: boolean; texto: string };

export function partesDaProse(text: string): PedacoDeProse[] {
  const parts: PedacoDeProse[] = [];
  let i = 0;
  for (;;) {
    const open = text.indexOf('{{', i);
    if (open < 0) { parts.push({ he: false, texto: text.slice(i) }); break; }
    const close = text.indexOf('}}', open);
    if (close < 0) { parts.push({ he: false, texto: text.slice(i) }); break; }
    parts.push({ he: false, texto: text.slice(i, open) });
    parts.push({ he: true, texto: text.slice(open + 2, close).trim() });
    i = close + 2;
  }
  return parts;
}
