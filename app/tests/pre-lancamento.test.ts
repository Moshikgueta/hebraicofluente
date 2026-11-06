/* A data do pré-lançamento, vigiada (auditoria de 01/10/2026, PAY-B-001).
 * ─────────────────────────────────────────────────────────────────────────
 * `estadoDoPreLancamento` decide se o check-legal fica calado, avisa ou
 * falha. A regra de preço não muda aqui (decisão do dono); o que se testa é
 * a decisão sobre a DATA: hoje, o dia do fim, o dia seguinte, a janela de
 * aviso, e os casos em que não há o que vigiar.
 *
 * O check-legal.mjs não monta TypeScript e carrega uma cópia da função. A
 * cópia é lida daquele arquivo, entre dois marcadores, e posta à prova com
 * a MESMA tabela: se alguém mexer numa e não na outra, este teste é quem
 * nota.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DIAS_DE_AVISO, diaIso, estadoDoPreLancamento } from '@/lib/pre-lancamento';

type Preco = { listBrl: number | null; preLancamentoAte?: string | null };
type Fn = (price: Preco, hoje: string | Date) => string;

const FIM = '2026-10-31';
const comData: Preco = { listBrl: 297, preLancamentoAte: FIM };

/* [preço, hoje, estado esperado, por quê] */
const TABELA: [Preco, string, string, string][] = [
  [comData, '2026-10-01', 'ok',      '30 dias antes: nada a dizer'],
  [comData, '2026-10-20', 'ok',      '11 dias antes: ainda fora da janela'],
  [comData, '2026-10-21', 'avisa',   'exatamente 10 dias antes: começa o aviso'],
  [comData, '2026-10-30', 'avisa',   'véspera'],
  [comData, '2026-10-31', 'avisa',   'o próprio dia do fim ainda não venceu'],
  [comData, '2026-11-01', 'vencido', 'o dia seguinte: a data anunciada já passou'],
  [comData, '2027-03-15', 'vencido', 'meses depois: continua vencido'],
  [{ listBrl: null, preLancamentoAte: FIM }, '2026-12-01', 'ok', 'sem preço cheio não há pré-lançamento'],
  [{ listBrl: 297 }, '2026-12-01', 'ok', 'sem data não há o que vencer'],
  [{ listBrl: 297, preLancamentoAte: null }, '2026-12-01', 'ok', 'data nula idem'],
  [{ listBrl: 297, preLancamentoAte: '31/10/2026' }, '2026-12-01', 'ok', 'data fora do formato conta como ausente']
];

function copiaDoCheck(): Fn {
  const fonte = readFileSync(new URL('../check-legal.mjs', import.meta.url), 'utf8');
  const m = fonte.match(/\/\* inicio estadoDoPreLancamento \*\/([\s\S]*?)\/\* fim estadoDoPreLancamento \*\//);
  if (!m) throw new Error('check-legal.mjs: marcadores de estadoDoPreLancamento não encontrados');
  return new Function(`${m[1]}\nreturn estadoDoPreLancamento;`)() as Fn;
}

describe('estadoDoPreLancamento', () => {
  it.each(TABELA)('%o em %s -> %s (%s)', (preco, hoje, esperado) => {
    expect(estadoDoPreLancamento(preco, hoje)).toBe(esperado);
  });

  it('aceita um Date e o lê em UTC', () => {
    expect(estadoDoPreLancamento(comData, new Date('2026-11-01T00:00:00Z'))).toBe('vencido');
    expect(estadoDoPreLancamento(comData, new Date('2026-10-31T23:59:59Z'))).toBe('avisa');
    expect(diaIso(new Date('2026-10-31T23:59:59Z'))).toBe('2026-10-31');
  });

  it('a janela de aviso é de 10 dias', () => {
    expect(DIAS_DE_AVISO).toBe(10);
  });

  it('a cópia em check-legal.mjs decide igual, caso a caso', () => {
    const copia = copiaDoCheck();
    for (const [preco, hoje, esperado] of TABELA) {
      expect(copia(preco, hoje), `${JSON.stringify(preco)} em ${hoje}`).toBe(esperado);
    }
  });

  it('o catálogo publicado ainda não venceu (se falhar, ver PAY-B-001)', () => {
    const cursos = JSON.parse(readFileSync(new URL('../content/courses.json', import.meta.url), 'utf8'));
    const lista: { slug: string; price: Preco }[] = cursos.courses ?? cursos;
    for (const c of lista) {
      expect(estadoDoPreLancamento(c.price, new Date()), c.slug).not.toBe('vencido');
    }
  });
});
