import { tx } from '@/i18n/telas/licao-ouvir-instrucao';

/** O texto que a voz das instruções lê (components/learn/OuvirInstrucao.tsx):
 *  sem o hebraico e sem as marcações do curso. O hebraico citado vira "o
 *  hebraico mostrado" ("the Hebrew shown" no site em inglês) - a voz do
 *  idioma do site o leria errado, e ouvir a palavra certa é trabalho das
 *  gravações. */
export function textoParaVoz(enunciado: string): string {
  const no = tx.hebraicoMostrado;
  const repetido = new RegExp(`(${no})(\\s*\\1)+`, 'g');
  return enunciado
    .replace(/\{\{[^}]*\}\}/g, no)
    .replace(/[\u0590-\u05FF\uFB1D-\uFB4F]+(?:[\s\u05BE\u05BE-]+[\u0590-\u05FF\uFB1D-\uFB4F]+)*/g, no)
    .replace(repetido, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
