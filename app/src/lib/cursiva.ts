/* Impressa e cursiva: a fonte única do que o curso diz sobre as duas formas.
 * ─────────────────────────────────────────────────────────────────────────
 * A regra aparece em dois lugares - no módulo 0, onde o aluno encontra a
 * ideia pela primeira vez, e na etapa "Escrever" de cada uma das 22 lições,
 * onde ela vira ação. Duas telas dizendo a mesma coisa com palavras
 * ligeiramente diferentes é como um curso começa a parecer descuidado, e
 * como uma delas fica para trás quando a outra muda.
 *
 * Até aqui a lição resumia tudo numa frase - "ninguém escreve hebraico à mão
 * em letra de imprensa" - que é a CONCLUSÃO sem o argumento. Quem lê aquilo
 * antes de entender a diferença ou obedece sem entender, ou desconfia: ele
 * acabou de passar duas etapas lendo a forma impressa e agora é mandado
 * treinar outro desenho, sem motivo declarado.
 *
 * O motivo está aqui.
 */

/** Onde cada forma é usada de verdade. */
export const ONDE_IMPRESSA = [
  'livros', 'sites', 'jornais', 'aplicativos',
  'placas', 'legendas', 'documentos', 'material de estudo'
] as const;

export const ONDE_CURSIVA = [
  'caderno', 'anotações', 'listas', 'recados',
  'formulários', 'quadro da sala', 'qualquer coisa escrita à mão'
] as const;

/** A regra, em duas linhas. É o que fica quando tudo o mais sumir. */
export const REGRA_CURSIVA = {
  ler: 'letra impressa',
  escrever: 'letra cursiva'
} as const;

/** Por que não basta copiar a forma impressa à mão. */
export const ANALOGIA_CURSIVA =
  'Dá para desenhar as letras impressas à mão, sim. Só que ninguém faz isso - '
  + 'seria como escrever um bilhete em português tentando copiar exatamente a '
  + 'fonte de um livro, letra por letra, toda vez.';

/** A ressalva que evita o medo de "então são dois alfabetos?". */
export const MESMA_LETRA =
  'São duas representações da MESMA letra, e não dois alfabetos. O nome é o '
  + 'mesmo, o som é o mesmo, o lugar no alfabeto é o mesmo - muda o desenho, '
  + 'como entre a letra de forma e a letra de mão em português.';

/** O que o curso cobra de cursiva, e quando - a expectativa, dita cedo. */
export const CURSIVA_NO_CURSO =
  'No começo, ler continua sendo com a forma impressa: é ela que está nos '
  + 'livros e nas placas. A cursiva entra como escrita e como reconhecimento, '
  + 'uma letra de cada vez, junto com a lição dessa letra.';
