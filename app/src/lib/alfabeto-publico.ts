/* As páginas do alfabeto para a busca (23/10/2026, plano de marketing, opção B
 * escolhida pelo dono em marketing/seo/paginas-do-alfabeto.md).
 * ─────────────────────────────────────────────────────────────────────────
 * O que cada página de letra mostra ALÉM do que já é público (forma, nome e
 * som, de lib/content-publico.ts): uma palavra de exemplo com a gravação do
 * professor, o erro comum do brasileiro (só o "errado" e o "certo"; o "porquê"
 * continua só no curso, e é ele que `pacote.mjs` amostra) e as letras
 * parecidas. O resto da lição (sílabas, as outras palavras, exercícios,
 * escrita, fixação) fica atrás do portão.
 *
 * Os textos são cópias de data/letters.json, com as marcas {{ }} do curso
 * (o hebraico que a página desenha com <He>). tests/alfabeto-publico.test.ts
 * confere cada campo contra a fonte: se a lição mudar, o teste avisa.
 * Letra nova aqui precisa da gravação em AMOSTRA_AUDIO (lib/amostra-audio.ts).
 */
import type { NomeAmostra } from '@/lib/amostra-audio';

export type LetraPublica = {
  id: string;
  /** A gravação do nome da letra, em /amostra-audio/. */
  audioNome: NomeAmostra;
  exemplo: { he: string; translit: string; pt: string; audio: NomeAmostra };
  erro: { errado: string; certo: string };
  /** As letras que o curso marca como fáceis de confundir com esta. */
  parecidas: string[];
};

export const LETRAS_PUBLICAS: readonly LetraPublica[] = [
  {
    id: 'alef', audioNome: 'alef',
    exemplo: { he: 'אַבָּא', translit: 'ába', pt: 'pai', audio: 'aba' },
    erro: {
      errado: 'Tentar produzir algum som para o {{א}}, ou tratá-lo como um A fixo.',
      certo: 'Ler apenas a vogal marcada: {{אוֹ}} é "o", {{אִ}} é "i".'
    },
    parecidas: ['ע']
  },
  {
    id: 'mem', audioNome: 'mem',
    exemplo: { he: 'אִמָא', translit: 'íma', pt: 'mãe', audio: 'ima' },
    erro: {
      errado: 'Ler {{אֵם}} como o "em" do português, com a vogal anasalada e o M sumindo.',
      certo: 'Ler {{אֵם}} com a vogal oral, como o E de "mesa", e fechar os lábios de verdade no M do fim.'
    },
    parecidas: ['ס']
  },
  {
    id: 'tav', audioNome: 'tav',
    exemplo: { he: 'אֶמֶת', translit: 'émet', pt: 'verdade', audio: 'emet' },
    erro: {
      errado: 'Ler {{תִי}} como "tchi" e {{תֵ}} como "tche".',
      certo: 'Ler {{תִי}} como "ti" e {{תֵ}} como "te", com o T seco.'
    },
    parecidas: ['ח', 'ה']
  },
  {
    id: 'shin', audioNome: 'shin',
    exemplo: { he: 'שָׁלוֹם', translit: 'shalóm', pt: 'paz / olá / tchau', audio: 'shalom' },
    erro: {
      errado: 'Ler {{ש}} como S: "salóm", "sem".',
      certo: 'Ler {{ש}} como o X de "xícara" ou o CH de "chave" (transliterado "sh"): "shalóm", "shem".'
    },
    parecidas: ['ע']
  },
  {
    id: 'lamed', audioNome: 'lamed',
    exemplo: { he: 'לַיְלָה', translit: 'láyla', pt: 'noite', audio: 'laila' },
    erro: {
      errado: 'Ler {{שֶׁל}} como "sheu", transformando o L final em U.',
      certo: 'Ler {{שֶׁל}} como "shel", com o L bem apoiado na ponta da língua.'
    },
    parecidas: ['ן', 'ו']
  }
];

export const letraPublica = (id: string): LetraPublica | undefined => LETRAS_PUBLICAS.find(l => l.id === id);

/** As cinco formas finais: conhecimento geral do alfabeto, não lição do curso. */
export const FORMAS_FINAIS: Record<string, string> = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

/** Divide um texto do curso nas partes em português e nas marcas {{hebraico}}. */
export function partes(texto: string): { he: boolean; t: string }[] {
  return texto.split(/\{\{([^}]*)\}\}/).map((t, i) => ({ he: i % 2 === 1, t })).filter(p => p.t);
}
