/* O Laboratório de Leitura: o banco de palavras e a decomposição de uma
 * palavra em letras e vogais (11/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O banco NÃO é uma lista nova escrita à mão. É o vocabulário que o curso já
 * ensina (`vocabularioDoCurso`, as 177 palavras de letters.json), com os
 * campos que a leitura guiada precisa calculados a partir dele. Assim uma
 * palavra corrigida na lição sai corrigida aqui, e nenhuma palavra entra no
 * laboratório sem ter passado pela validação do curso (V1: só letras já
 * ensinadas; V3: transliteração).
 *
 * ── sem nikud, só onde é seguro ───────────────────────────────────────────
 * A forma sem pontos (`semNikud`) existe só para as palavras da lista do
 * módulo 6 (data/extras.json → unpointed), que o dono do curso escolheu
 * como legíveis sem os pontos, e só para quem já fez aquela etapa. Tirar o
 * nikud de qualquer palavra seria fácil e errado: sem os pontos, שֵׁם e שָׁם
 * são o mesmo desenho, e a palavra vira adivinhação.
 *
 * ── a decomposição só aparece quando é confiável ──────────────────────────
 * Dizer "este sinal é um A" parece simples e não é: o kamats às vezes soa O,
 * o pátach do fim se lê antes da consoante (תַּפּוּחַ), o shva às vezes some.
 * Em vez de uma tabela de exceções, a função confere o que calculou contra a
 * transliteração que o curso já aprovou: se a sequência de vogais dos sinais
 * não bate com a das letras latinas, a palavra mostra as letras sem afirmar
 * o som de cada vogal. Ver `vogaisConferem`.
 */

import type { Letter } from '@/lib/content';
import { FINAL_TO_BASE, clean, clusters, stripNikud } from '@/lib/hebrew';
import { letrasDaGrafia, vocabularioDoCurso, consegueLer, type PalavraDoCurso } from '@/lib/engine/palavras';

export type NivelDeApoio = 'guiada' | 'menos-ajuda' | 'independente';

export const NIVEIS: readonly { id: NivelDeApoio; tituloPt: string; resumoPt: string }[] = [
  { id: 'guiada', tituloPt: 'Leitura guiada',
    resumoPt: 'Com nikud, as letras uma a uma e o áudio quando você quiser.' },
  { id: 'menos-ajuda', tituloPt: 'Leitura com menos ajuda',
    resumoPt: 'Você tenta primeiro. A ajuda fica guardada, a um toque.' },
  { id: 'independente', tituloPt: 'Leitura independente',
    resumoPt: 'Só a palavra. Você lê e depois confere.' }
];

/** Uma vogal como o curso a ensina, pelo SOM. */
export type Vogal = 'a' | 'e' | 'i' | 'o' | 'u';

export type PedacoDaPalavra = {
  /** A letra com os sinais que estão nela, como aparece na palavra. */
  grafia: string;
  /** A letra base (a final vira a de meio), para achar o nome. */
  letra: string;
  /** O nome da letra no curso ("Mem"), ou da forma final ("Mem final"). */
  nomePt: string;
  /** O som da letra como o curso o escreve ("/m/"), já resolvido para
   *  בּ/ב, כּ/כ, פּ/פ e שׁ/שׂ. Vazio quando a letra é só apoio de vogal. */
  somPt: string;
  /** A vogal que os sinais desta letra marcam, quando marcam uma. */
  vogal: Vogal | null;
  /** Os nomes dos sinais de vogal desta letra ("pátach"). */
  sinaisPt: string[];
  /** Esta letra é só apoio de vogal: o ו de וֹ e de וּ. */
  apoioDeVogal: boolean;
  /** Uma observação curta, quando a letra tem uma particularidade aqui. */
  notaPt: string | null;
};

export type PalavraDoBanco = {
  /** Estável: o id do áudio, que é o hash da palavra. */
  id: string;
  he: string;
  /** A grafia sem pontos, só quando o curso a considera legível assim. */
  semNikud: string | null;
  translit: string;
  pt: string;
  letras: string[];
  /** Os sinais de vogal que a palavra usa, pelo nome do curso. */
  sinais: string[];
  dificuldade: 1 | 2 | 3;
  audioId: string;
  /** A ordem da letra em cuja lição a palavra aparece. */
  desde: number;
  pedacos: PedacoDaPalavra[];
  /** A decomposição confere com a transliteração: pode dizer o som das vogais. */
  vogaisConferem: boolean;
};

/* Os sinais, pelo ponto de código. Os nomes são os de data/nikud.json. */
const SINAIS: Record<string, { nome: string; vogal: Vogal | null }> = {
  'ַ': { nome: 'pátach', vogal: 'a' },
  'ָ': { nome: 'kamats', vogal: 'a' },
  'ֲ': { nome: 'chataf pátach', vogal: 'a' },
  'ֶ': { nome: 'segol', vogal: 'e' },
  'ֵ': { nome: 'tsere', vogal: 'e' },
  'ֱ': { nome: 'chataf segol', vogal: 'e' },
  'ִ': { nome: 'chirik', vogal: 'i' },
  'ֹ': { nome: 'cholam', vogal: 'o' },
  'ֺ': { nome: 'cholam', vogal: 'o' },
  'ֳ': { nome: 'chataf kamats', vogal: 'o' },
  'ֻ': { nome: 'kubuts', vogal: 'u' },
  'ְ': { nome: 'shva', vogal: null }
};
const DAGESH = 'ּ';
const PONTO_SHIN = 'ׁ';
const PONTO_SIN = 'ׂ';

/** Os dois sons de "/b/ ou /v/": o primeiro com daguesh, o segundo sem. */
function somResolvido(som: string, comDaguesh: boolean): string {
  const m = som.match(/^(\/[^/]+\/) ou (\/[^/]+\/)$/);
  return m ? (comDaguesh ? m[1]! : m[2]!) : som;
}

export function pedacosDe(he: string, letras: readonly Letter[]): PedacoDaPalavra[] {
  const porGlifo = new Map(letras.map(l => [l.letter, l]));
  const cl = clusters(clean(he));
  return cl.map((g, i): PedacoDaPalavra => {
    const base = g[0] ?? '';
    const letra = FINAL_TO_BASE[base] ?? base;
    const L = porGlifo.get(letra);
    const marcas = [...g.slice(1)];
    const sinais = marcas.map(m => SINAIS[m]).filter((s): s is { nome: string; vogal: Vogal | null } => !!s);
    const vogal = sinais.find(s => s.vogal)?.vogal ?? null;
    const daguesh = marcas.includes(DAGESH);
    const final = base !== letra;
    const ultima = i === cl.length - 1;

    /* O ו que é vogal: וֹ depois de uma consoante, e וּ sem outra vogal. */
    const cholamMale = letra === 'ו' && i > 0 && marcas.length === 1 && marcas[0] === 'ֹ';
    const shuruk = letra === 'ו' && i > 0 && marcas.length === 1 && marcas[0] === DAGESH;
    if (cholamMale || shuruk) {
      return {
        grafia: g, letra, nomePt: L?.namePt ?? 'Vav', somPt: '',
        vogal: cholamMale ? 'o' : 'u', sinaisPt: [cholamMale ? 'cholam malê' : 'shuruk'],
        apoioDeVogal: true,
        notaPt: cholamMale ? 'Aqui o Vav não é V: com o ponto em cima, ele é a vogal O.'
                           : 'Aqui o Vav não é V: com o ponto dentro, ele é a vogal U.'
      };
    }

    let nomePt = L?.namePt ?? letra;
    let somPt = L ? somResolvido(L.sound, daguesh) : '';
    let notaPt: string | null = null;
    if (letra === 'ש' && marcas.includes(PONTO_SIN)) { nomePt = 'Sin'; somPt = '/s/'; }
    else if (letra === 'ש' && marcas.includes(PONTO_SHIN)) { somPt = '/ʃ/'; }
    if (final) nomePt = `${nomePt} final`;
    /* O ה no fim, sem vogal própria, não se pronuncia. */
    if (letra === 'ה' && ultima && !vogal) { somPt = ''; notaPt = 'No fim da palavra, o He sem vogal não se pronuncia.'; }
    /* O ח e o ע no fim com pátach: o A vem ANTES da letra. */
    if ((letra === 'ח' || letra === 'ע') && ultima && marcas.includes('ַ')) {
      notaPt = 'No fim da palavra, este A se lê antes da letra.';
    }
    if (letra === 'א' && !vogal) notaPt = 'Sem vogal, o Álef não tem som: é só a letra.';
    /* O י sem sinal nenhum depois de uma vogal é apoio, e não o som /j/:
       מִי é "mi", עִיר é "ir". Depois do tsere ele forma o "ei" (אַחֲרֵי). */
    const anterior = i > 0 ? [...(cl[i - 1] ?? '')].map(m => SINAIS[m]?.vogal).find(Boolean) : null;
    if (letra === 'י' && !marcas.length && anterior) {
      somPt = '';
      notaPt = anterior === 'i' ? 'Depois do I, o Yud não tem som próprio: só acompanha o I.'
        : anterior === 'e' ? 'Depois deste E, o Yud forma o som "ei".'
        : 'Aqui o Yud não tem som próprio.';
    }

    return {
      grafia: g, letra, nomePt, somPt, vogal,
      sinaisPt: sinais.map(s => s.nome), apoioDeVogal: false, notaPt
    };
  });
}

/* As vogais da transliteração, na ordem, sem acento. "ei" conta como um E
   (o tsere antes do י), e o "ss" não interessa aqui. */
function vogaisDaTranslit(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/ei/g, 'e')
    .replace(/[^aeiou]/g, '');
}

/**
 * A sequência de vogais dos sinais bate com a da transliteração aprovada?
 * O shva não entra (às vezes some, às vezes é um E): por isso a conferência
 * aceita que a transliteração tenha um E a mais onde há shva.
 */
export function vogaisConferem(pedacos: readonly PedacoDaPalavra[], translit: string): boolean {
  const alvo = vogaisDaTranslit(translit);
  /* Cada letra dá uma vogal certa, nenhuma, ou (o shva) um E opcional. */
  const passos = pedacos.flatMap(p => p.vogal ? [{ v: p.vogal, opcional: false }]
    : p.sinaisPt.includes('shva') ? [{ v: 'e' as Vogal, opcional: true }] : []);
  const casa = (k: number, i: number): boolean => {
    if (k === passos.length) return i === alvo.length;
    const { v, opcional } = passos[k]!;
    if (alvo[i] === v && casa(k + 1, i + 1)) return true;
    return opcional && casa(k + 1, i);
  };
  return casa(0, 0);
}

function dificuldadeDe(letras: readonly string[], sinais: readonly string[]): 1 | 2 | 3 {
  const n = letras.length + (sinais.includes('shva') ? 1 : 0);
  return n <= 3 ? 1 : n <= 5 ? 2 : 3;
}

/** As palavras que o curso considera legíveis sem os pontos (módulo 6). */
export type ListaSemPontos = readonly { pointed: string; bare: string }[];

export function bancoDePalavras(
  letras: readonly Letter[],
  semPontos: ListaSemPontos = [],
  vocab: readonly PalavraDoCurso[] = vocabularioDoCurso(letras)
): PalavraDoBanco[] {
  const nua = new Map(semPontos.map(w => [clean(w.pointed), w.bare]));
  return vocab.map(w => {
    const pedacos = pedacosDe(w.he, letras);
    const sinais = [...new Set(pedacos.flatMap(p => p.sinaisPt))];
    const letrasDaPalavra = letrasDaGrafia(w.he);
    return {
      id: w.audioId || `w-${stripNikud(w.he)}`,
      he: w.he,
      semNikud: nua.get(clean(w.he)) ?? null,
      translit: w.translit,
      pt: w.pt,
      letras: letrasDaPalavra,
      sinais,
      dificuldade: dificuldadeDe(letrasDaPalavra, sinais),
      audioId: w.audioId,
      desde: w.desde,
      pedacos,
      vogaisConferem: vogaisConferem(pedacos, w.translit)
    };
  });
}

/**
 * As palavras para uma rodada: só as que o aluno lê com as letras que já
 * concluiu, e em ordem de dificuldade para o nível pedido. A guiada começa
 * pelas fáceis; a independente prefere as que ele viu há mais tempo (o
 * reconhecimento já teve tempo de assentar).
 */
export function palavrasDaRodada(
  banco: readonly PalavraDoBanco[], alfabeto: readonly string[], nivel: NivelDeApoio,
  rand: () => number, n = 5
): PalavraDoBanco[] {
  const legiveis = banco.filter(w => w.letras.length >= 2 && consegueLer(w.he, alfabeto));
  if (!legiveis.length) return [];
  const ultima = Math.max(...legiveis.map(w => w.desde));
  const pool = nivel === 'guiada'
    ? legiveis.filter(w => w.dificuldade <= 2)
    : nivel === 'menos-ajuda'
      ? legiveis
      : legiveis.filter(w => w.desde < ultima || legiveis.length < 8);
  const base = pool.length >= n ? pool : legiveis;
  const embaralhadas = [...base].map(w => ({ w, r: rand() })).sort((a, b) => a.r - b.r).map(x => x.w);
  return embaralhadas.slice(0, n);
}

/** O id do momento "Minha Primeira Leitura" de um módulo, em `firsts`. */
export const primeiraLeituraId = (modulo: number): string => `primeira-leitura-m${modulo}`;

/**
 * As palavras da Primeira Leitura de um módulo: as das letras DESTE módulo
 * que o aluno lê com tudo o que já concluiu, até cinco, das mais curtas para
 * as mais longas. Sem sorteio: é um marco, e todo aluno lê as mesmas.
 */
export function palavrasDaPrimeiraLeitura(
  banco: readonly PalavraDoBanco[], letrasDoModulo: readonly Letter[], alfabeto: readonly string[], n = 5
): PalavraDoBanco[] {
  const ordens = new Set(letrasDoModulo.map(l => l.order));
  return banco
    .filter(w => ordens.has(w.desde) && w.letras.length >= 2 && consegueLer(w.he, alfabeto))
    .sort((a, b) => a.letras.length - b.letras.length || a.desde - b.desde)
    .slice(0, n);
}
