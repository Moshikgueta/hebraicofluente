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

const textos: Texto[] = conteudoPago.textos;
const L = conteudoPago.letters;
const FINAL: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const letrasDe = (he: string) => [...he.normalize('NFD')].filter(c => /[א-ת]/.test(c)).map(c => FINAL[c] ?? c);
const hebraicoEm = (t: string) => [...t.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]!);

describe('os mini-textos', () => {
  it('há um texto em cada módulo do 3 ao 7', () => {
    expect(textos.map(t => t.modulo).sort()).toEqual([3, 4, 5, 6, 7]);
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
