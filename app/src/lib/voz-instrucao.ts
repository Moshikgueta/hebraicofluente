/** O texto que a voz das instruções lê (components/learn/OuvirInstrucao.tsx):
 *  sem o hebraico e sem as marcações do curso. O hebraico citado vira "o
 *  hebraico mostrado" - a voz em português o leria errado, e ouvir a palavra
 *  certa é trabalho das gravações. */
export function textoParaVoz(enunciado: string): string {
  return enunciado
    .replace(/\{\{[^}]*\}\}/g, 'o hebraico mostrado')
    .replace(/[֐-׿יִ-ﭏ]+(?:[\s־־-]+[֐-׿יִ-ﭏ]+)*/g, 'o hebraico mostrado')
    .replace(/(o hebraico mostrado)(\s*\1)+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
