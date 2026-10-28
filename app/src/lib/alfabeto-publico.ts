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
import { tx } from '@/i18n/telas/motor-alfabeto-publico';

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
    exemplo: { he: 'אַבָּא', translit: 'ába', pt: tx.alefSentido, audio: 'aba' }, // i18n-ok: transliteração, etapa 3
    erro: {
      errado: tx.alefErrado,
      certo: tx.alefCerto
    },
    parecidas: ['ע']
  },
  {
    id: 'mem', audioNome: 'mem',
    exemplo: { he: 'אִמָא', translit: 'íma', pt: tx.memSentido, audio: 'ima' }, // i18n-ok: transliteração, etapa 3
    erro: {
      errado: tx.memErrado,
      certo: tx.memCerto
    },
    parecidas: ['ס']
  },
  {
    id: 'tav', audioNome: 'tav',
    exemplo: { he: 'אֶמֶת', translit: 'émet', pt: tx.tavSentido, audio: 'emet' }, // i18n-ok: transliteração, etapa 3
    erro: {
      errado: tx.tavErrado,
      certo: tx.tavCerto
    },
    parecidas: ['ח', 'ה']
  },
  {
    id: 'shin', audioNome: 'shin',
    exemplo: { he: 'שָׁלוֹם', translit: 'shalóm', pt: tx.shinSentido, audio: 'shalom' }, // i18n-ok: transliteração, etapa 3
    erro: {
      errado: tx.shinErrado,
      certo: tx.shinCerto
    },
    parecidas: ['ע']
  },
  {
    id: 'lamed', audioNome: 'lamed',
    exemplo: { he: 'לַיְלָה', translit: 'láyla', pt: tx.lamedSentido, audio: 'laila' }, // i18n-ok: transliteração, etapa 3
    erro: {
      errado: tx.lamedErrado,
      certo: tx.lamedCerto
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
