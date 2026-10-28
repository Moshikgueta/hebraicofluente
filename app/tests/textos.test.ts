/* Os mini-textos de leitura corrida (data/textos.json).
 * São as únicas frases escritas para o curso, então as regras que o resto do
 * conteúdo herda da fonte aqui são conferidas à mão:
 *   · um texto por módulo, do 3 ao 7;
 *   · nenhuma letra que o aluno ainda não viu naquele módulo;
 *   · toda palavra hebraica pontuada (menos as emprestadas, com gerech, que
 *     o curso já escreve sem pontos);
 *   · nada aparece para o aluno antes de `revisado: true`. */

import { describe, expect, it } from 'vitest';
import { course } from '@/lib/content-publico';
import { conteudoPago } from '@/lib/content-servidor';
import { textosPublicados, type Texto } from '@/lib/engine/textos';
import { alfabetoDe, palavrasLegiveis, vocabularioDoCurso } from '@/lib/engine/palavras';

const todos: Texto[] = conteudoPago.textos;
/* As leituras de revisão (05/10/2026) têm as regras delas, no fim. */
const textos = todos.filter(t => !t.revisao);
const revisoes = todos.filter(t => t.revisao);
const L = conteudoPago.letters;
const FINAL: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const letrasDe = (he: string) => [...he.normalize('NFD')].filter(c => /[א-ת]/.test(c)).map(c => FINAL[c] ?? c);
const hebraicoEm = (t: string) => [...t.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]!);

describe('os mini-textos', () => {
  /* O do módulo 2 entrou em 28/10/2026 como rascunho (revisado: false). Ele
     segue a mesma régua das letras: sem o Vav, nem como sinal de vogal. */
  it('há um texto em cada módulo do 2 ao 7', () => {
    expect(textos.map(t => t.modulo).sort()).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it('não usam letra que o aluno ainda não viu naquele módulo', () => {
    const culpados: string[] = [];
    for (const t of textos) {
      const upTo = course.modules.find(m => m.n === t.modulo)!.checkpoint?.upTo ?? 22;
      const vistas = new Set(L.filter(l => l.order <= upTo).map(l => l.letter));
      const todo = [
        ...t.linhas.map(l => l.he), ...t.novas.map(l => l.he),
        ...t.perguntas.flatMap(p => hebraicoEm(p.q + ' ' + p.porque))
      ];
      for (const he of todo) for (const c of letrasDe(he)) if (!vistas.has(c)) culpados.push(`${t.modulo}: ${c} em ${he}`);
    }
    expect(culpados).toEqual([]);
  });

  it('toda palavra hebraica vem pontuada, menos as emprestadas com gerech', () => {
    const semPonto: string[] = [];
    for (const t of textos) {
      for (const l of [...t.linhas, ...t.novas]) {
        for (const palavra of l.he.split(/[\s,.!?:]+/).filter(p => /[א-ת]/.test(p))) {
          if (palavra.includes('׳')) continue;
          /* Uma palavra de uma letra só com o traço do prefixo ("הַ־") ou
             uma mater lectionis não conta: o que se procura é a palavra
             inteira esquecida sem nenhum sinal. */
          if (!/[ְ-ׇּׁׂ]/.test(palavra)) semPonto.push(`${t.modulo}: ${palavra}`);
        }
      }
    }
    expect(semPonto).toEqual([]);
  });

  it('cada linha tem transliteração e tradução, e cada pergunta tem o porquê', () => {
    for (const t of textos) {
      for (const l of [...t.linhas, ...t.novas]) {
        expect(l.translit.trim(), `${t.modulo}: ${l.he}`).not.toBe('');
        expect(l.pt.trim(), `${t.modulo}: ${l.he}`).not.toBe('');
      }
      for (const p of t.perguntas) {
        expect(p.porque.trim(), p.q).not.toBe('');
        if (p.t === 'escolha') {
          expect(p.certa, p.q).toBeGreaterThanOrEqual(0);
          expect(p.certa, p.q).toBeLessThan(p.opcoes.length);
        }
      }
    }
  });

  it('o aluno só vê o texto depois de revisado', () => {
    const base = textos[0]!;
    expect(textosPublicados([{ ...base, revisado: false }])).toEqual([]);
    expect(textosPublicados([{ ...base, revisado: true }])).toHaveLength(1);
  });
});

/* As leituras de revisão (05/10/2026): um texto por módulo, do 1 ao 7, que
 * NÃO ensina palavra nenhuma. Cada palavra é uma que o aluno já lê naquele
 * ponto (as das lições, as do ponto e das finais a partir do 6, as do gerech
 * no 7, e as dos textos dos módulos anteriores), um nome declarado ou uma
 * delas com um prefixo declarado (הַ־, וְ־, לְ־, בְּ־) grudado. */
describe('as leituras de revisão', () => {
  const tira = (he: string) => he.normalize('NFD').replace(/[^א-ת׳]/g, '');
  /* O ו vogal (יוֹם, אוֹכֶל) vem e vai conforme a grafia: não decide nada. */
  const chave = (he: string) => tira(he).replace(/ו/g, '');

  it('há uma em cada módulo, do 1 ao 7', () => {
    expect(revisoes.map(t => t.modulo).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('só usam palavras que o aluno já acumulou', () => {
    const ex = conteudoPago.extras;
    const culpados: string[] = [];
    for (const t of revisoes) {
      const upTo = course.modules.find(m => m.n === t.modulo)!.checkpoint?.upTo ?? 22;
      const alfabeto = alfabetoDe(L.filter(l => l.order <= upTo));
      const conhecidas = new Set(palavrasLegiveis(vocabularioDoCurso(L), alfabeto).map(w => chave(w.he)));
      if (t.modulo >= 6) {
        for (const D of ex.dagesh.letters) for (const w of [...D.hardWords, ...D.softWords]) conhecidas.add(chave(w.he));
        for (const F of ex.finals) conhecidas.add(chave(F.word));
      }
      if (t.modulo >= 7) for (const g of ex.gerech.letters) for (const w of g.words) conhecidas.add(chave(w.he));
      for (const o of textos.filter(o => o.modulo < t.modulo)) for (const w of o.novas) conhecidas.add(chave(w.he));
      const nomes = new Set(t.novas.filter(w => /\(nome\)\s*$/.test(w.pt)).map(w => chave(w.he)));
      const prefixos = new Set(t.novas.filter(w => w.he.includes('־')).map(w => tira(w.he)[0]));
      const ok = (k: string) => conhecidas.has(k) || nomes.has(k);
      for (const l of t.linhas) {
        for (const palavra of l.he.split(/[\s,.!?:]+/).filter(p => /[א-ת]/.test(p))) {
          const k = chave(palavra);
          const semPrefixo = prefixos.has(tira(palavra)[0]!) && ok(chave(tira(palavra).slice(1)));
          if (!ok(k) && !semPrefixo) culpados.push(`${t.modulo}: ${palavra}`);
        }
      }
    }
    expect(culpados).toEqual([]);
  });

  it('a página só mostra o que é de cada uma', () => {
    for (const t of revisoes) {
      expect(t.novas.every(w => w.he.includes('־') || /\(nome\)\s*$/.test(w.pt)), `${t.modulo}`).toBe(true);
      expect(t.linhas.length).toBeGreaterThanOrEqual(4);
      expect(t.perguntas.length).toBeGreaterThanOrEqual(3);
    }
  });
});
