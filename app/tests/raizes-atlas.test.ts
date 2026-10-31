/* Raízes: o Atlas, a página de Lisboa e a árvore da família (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O que este arquivo segura:
 *   1. O ATLAS só afirma o que a matriz sustenta: todo lugar e rota cita
 *      afirmação VERIFICADA ou CONTESTADA; rota "documentada" só cita
 *      VERIFICADO, e rota "hipótese" cita pelo menos um CONTESTADO.
 *   2. LISBOA segue as regras do texto dos módulos (marca depois da
 *      pontuação, ano sempre com marca) e não põe foto sem licença.
 *   3. A ÁRVORE fica no aparelho, desfaz ciclos, protege pessoa viva nas
 *      cópias e só desenha linha onde a mudança é documentada.
 *   4. O PORTÃO cobre as rotas novas.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath, cursoDaRota } from '../../worker/src/gate.js';
import { LUGARES_COM_PAGINA, marcasDe, type Atlas, type DesenhoDoMapa, type PaginaDeLugar } from '@/lib/raizes';
import { curvaEntre, fracaoDaRota, janelaDaVista, limitar, zoom, caminhoDaRota } from '@/lib/raizes-atlas';
import {
  ARVORE_VAZIA, adicionarPessoa, anoDe, arvoreDeExemplo, exportarGedcom, exportarJson, geracoes, normalizar,
  removerPessoa, trechosDocumentados, type Pessoa
} from '@/lib/raizes-familia';

const RAIZ = new URL('../../', import.meta.url).pathname;
const RAIZES = process.env.HF_RAIZES || join(RAIZ, 'raizes');
const TEM_ATLAS = existsSync(join(RAIZES, 'data/atlas.json'));
const lerRaizes = (p: string) => JSON.parse(readFileSync(join(RAIZES, p), 'utf8'));

type Afirmacao = { id: string; status: string };
const afirmacoes: Afirmacao[] = TEM_ATLAS ? lerRaizes('data/afirmacoes.json').afirmacoes : [];
const status = new Map(afirmacoes.map(a => [a.id, a.status]));
const NO_TEXTO = new Set(['VERIFICADO', 'CONTESTADO']);
const atlas: Atlas | null = TEM_ATLAS ? lerRaizes('data/atlas.json') : null;
const desenho: DesenhoDoMapa | null = TEM_ATLAS ? lerRaizes('data/mapa-atlantico.json') : null;

describe('o portão cobre as rotas do Atlas, de Lisboa e da árvore', () => {
  it.each(['/raizes/atlas/', '/raizes/lugar/lisboa/', '/raizes/familia/'])('%s', rota => {
    expect(isGatedPath(rota)).toBe(true);
    expect(cursoDaRota(rota)).toBe('raizes-sefarditas');
  });
});

describe.skipIf(!TEM_ATLAS)('o Atlas só afirma o que a matriz sustenta', () => {
  const a = atlas!;
  const d = desenho!;

  it('todo lugar, período e rota cita afirmações que existem e podem ir ao texto', () => {
    const ruins: string[] = [];
    const conferir = (onde: string, ids: string[]) => ids.forEach(id => {
      if (!NO_TEXTO.has(status.get(id) ?? '')) ruins.push(`${onde}: ${id} (${status.get(id) ?? 'não existe'})`);
    });
    a.lugares.forEach(l => conferir(l.id, l.afirmacoes));
    a.periodos.forEach(p => conferir(p.id, p.afirmacoes));
    a.rotas.forEach(r => conferir(r.id, r.afirmacoes));
    expect(ruins).toEqual([]);
    for (const r of a.rotas) expect(r.afirmacoes.length, r.id).toBeGreaterThan(0);
    for (const l of a.lugares.filter(x => !x.area)) expect(l.afirmacoes.length, l.id).toBeGreaterThan(0);
  });

  it('o nível de evidência da rota bate com a matriz', () => {
    const permitidos = new Set(a.evidencias.map(e => e.id));
    expect([...permitidos].sort()).toEqual(['corredor', 'documentado', 'hipotese']);
    for (const r of a.rotas) {
      expect(permitidos.has(r.evidencia), r.id).toBe(true);
      if (r.evidencia === 'documentado') for (const id of r.afirmacoes) expect(status.get(id), `${r.id} → ${id}`).toBe('VERIFICADO');
      if (r.evidencia === 'hipotese') expect(r.afirmacoes.some(id => status.get(id) === 'CONTESTADO'), r.id).toBe(true);
    }
  });

  it('rotas ligam lugares que existem, com grupo e data; lugares cabem no desenho', () => {
    const ids = new Set(a.lugares.map(l => l.id));
    const grupos = new Set(a.grupos.map(g => g.id));
    const periodos = new Set(a.periodos.map(p => p.id));
    const tipos = new Set(a.tipos.map(t => t.id));
    for (const r of a.rotas) {
      expect(r.pontos.length, r.id).toBeGreaterThanOrEqual(2);
      for (const p of r.pontos) expect(ids.has(p), `${r.id} → ${p}`).toBe(true);
      expect(grupos.has(r.grupo), r.id).toBe(true);
      expect(r.de, r.id).toBeGreaterThan(1300);
      expect(r.ate, r.id).toBeGreaterThanOrEqual(r.de);
    }
    for (const l of a.lugares) {
      expect(l.lon, l.id).toBeGreaterThan(d.quadro.oeste);
      expect(l.lon, l.id).toBeLessThan(d.quadro.leste);
      expect(l.lat, l.id).toBeGreaterThan(d.quadro.sul);
      expect(l.lat, l.id).toBeLessThan(d.quadro.norte);
      for (const p of l.periodos) expect(periodos.has(p), `${l.id} → ${p}`).toBe(true);
      for (const t of l.tipos) expect(tipos.has(t), `${l.id} → ${t}`).toBe(true);
    }
    expect(new Set(a.lugares.map(l => l.id)).size).toBe(a.lugares.length);
  });

  it('o desenho é só terra, sem fronteira', () => {
    expect((d as unknown as { _: string[] })._.join(' ')).toMatch(/land/);
  });

  it('a curva de uma rota passa por todos os seus lugares', () => {
    for (const r of a.rotas) {
      const c = caminhoDaRota(r, a, d);
      expect(c.match(/Q/g)?.length, r.id).toBe(r.pontos.length - 1);
    }
  });
});

describe.skipIf(!TEM_ATLAS)('a página de Lisboa', () => {
  const arquivos = TEM_ATLAS ? readdirSync(join(RAIZES, 'data/lugares')).filter(f => f.endsWith('.json')) : [];
  const paginas: PaginaDeLugar[] = arquivos.map(f => lerRaizes(`data/lugares/${f}`));

  it('as páginas geradas são as dos lugares que têm arquivo, e o Atlas aponta para elas', () => {
    expect(paginas.map(p => p.id).sort()).toEqual([...LUGARES_COM_PAGINA].sort());
    for (const p of paginas) expect(atlas!.lugares.find(l => l.id === p.id)?.pagina, p.id).toBe(p.id);
  });

  it('toda citação existe e pode ir ao texto; parágrafo com ano tem marca, depois da pontuação', () => {
    for (const p of paginas) {
      const ids = [
        ...p.secoes.flatMap(s => s.paragrafos.flatMap(marcasDe)),
        ...p.cronologia.flatMap(c => c.afirmacoes), ...p.vestigios.flatMap(v => v.afirmacoes),
        ...p.personagens.flatMap(x => x.afirmacoes), ...p.documentos.flatMap(x => x.afirmacoes),
        ...p.diaspora.flatMap(x => x.afirmacoes)
      ];
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(NO_TEXTO.has(status.get(id) ?? ''), `${p.id} → ${id}`).toBe(true);
      for (const par of p.secoes.flatMap(s => s.paragrafos)) {
        if (/\b\d{3,4}\b/.test(par.replace(/\[\[[^\]]*\]\]/g, ''))) expect(marcasDe(par).length, par.slice(0, 60)).toBeGreaterThan(0);
        for (const x of par.matchAll(/(.)\[\[/g)) expect('.?!)', par.slice(0, 50)).toContain(x[1]);
      }
      for (const c of p.cronologia) expect(c.afirmacoes.length, c.quando).toBeGreaterThan(0);
      for (const r of p.diaspora.map(x => x.rota).filter(Boolean)) expect(atlas!.rotas.some(rt => rt.id === r), r).toBe(true);
    }
  });

  it('foto só com autor e licença; a ilustração se diz interpretativa', () => {
    for (const p of paginas) {
      for (const f of p.fotografias) {
        expect(f.autor, f.src).toBeTruthy();
        expect(f.licenca, f.src).toMatch(/CC|domínio público|Domínio público|licen/i);
      }
      if (!p.fotografias.length) expect(p.fotografiasNota).toBeTruthy();
      expect(p.ilustracao.legenda).toMatch(/^Ilustração interpretativa/);
    }
  });
});

describe('as janelas do mapa', () => {
  const d = { largura: 1000, altura: 800, quadro: { oeste: -76, leste: 32, sul: -25, norte: 56 }, projecao: { latitudePadrao: 25, escala: 10 }, terra: '' } as unknown as DesenhoDoMapa;

  it('limitar nunca deixa a janela sair do desenho nem passar dele', () => {
    const j = limitar({ x: -500, y: 900, w: 5000, h: 4000 }, d);
    expect(j.x).toBeGreaterThanOrEqual(0);
    expect(j.y).toBeGreaterThanOrEqual(0);
    expect(j.x + j.w).toBeLessThanOrEqual(1000.0001);
    expect(j.y + j.h).toBeLessThanOrEqual(800.0001);
    expect(j.w / j.h).toBeCloseTo(1.25);
  });

  it('aproximar e afastar mantém o ponto do centro e a proporção', () => {
    const j0 = { x: 200, y: 200, w: 400, h: 320 };
    const j1 = zoom(j0, 2, 400, 360, d);
    expect(j1.w).toBeCloseTo(200);
    expect(j1.x + j1.w / 2).toBeCloseTo(400);
    expect(j1.w / j1.h).toBeCloseTo(1.25);
  });

  it('a vista sai na proporção pedida', () => {
    const j = janelaDaVista('peninsula', d, 1.25);
    expect(j.w / j.h).toBeCloseTo(1.25);
  });

  it('a curva sempre se arqueia para o norte (para cima), nos dois sentidos', () => {
    const controle = (s: string) => Number(s.match(/Q[\d.-]+ ([\d.-]+)/)![1]);
    expect(controle(curvaEntre([0, 100], [100, 100]))).toBeLessThan(100);
    expect(controle(curvaEntre([100, 100], [0, 100]))).toBeLessThan(100);
  });

  it('a rota aparece aos poucos e fica inteira depois de dez anos', () => {
    const r = { de: 1492 } as Parameters<typeof fracaoDaRota>[0];
    expect(fracaoDaRota(r, 1480)).toBe(0);
    expect(fracaoDaRota(r, 1497)).toBeCloseTo(0.5);
    expect(fracaoDaRota(r, 1530)).toBe(1);
  });
});

describe('a árvore da família', () => {
  const pessoa = (nome: string, extra: Partial<Pessoa> = {}): Omit<Pessoa, 'id'> =>
    ({ nome, nomesAlternativos: '', viva: false, evidencia: 'documentado', pais: [], eventos: [], fontes: '', notas: '', ...extra });

  it('o exemplo é fictício e diz isso', () => {
    const a = arvoreDeExemplo();
    expect(a.exemplo).toBe(true);
    const fontes = a.pessoas.flatMap(p => p.eventos.map(e => e.fonte)).filter(Boolean);
    expect(fontes.length).toBeGreaterThan(0);
    for (const f of fontes) expect(f).toMatch(/exemplo fictício/);
    expect(normalizar(JSON.parse(JSON.stringify(a)))).toEqual(a);
  });

  it('ninguém é antepassado de si mesmo, e ligação para quem não existe some', () => {
    const a = normalizar({ pessoas: [
      { id: 'a', nome: 'A', pais: ['b', 'fantasma', 'a'] },
      { id: 'b', nome: 'B', pais: ['a'] }
    ] });
    const temCiclo = a.pessoas.find(p => p.id === 'a')!.pais.includes('b') && a.pessoas.find(p => p.id === 'b')!.pais.includes('a');
    expect(temCiclo).toBe(false);
    for (const p of a.pessoas) expect(p.pais).not.toContain('fantasma');
    expect(a.pessoas.find(p => p.id === 'a')!.pais).not.toContain('a');
  });

  it('pai ou mãe: até dois; apagar a pessoa desfaz a ligação', () => {
    let a = adicionarPessoa(ARVORE_VAZIA, pessoa('Eu'), 'eu');
    a = adicionarPessoa(a, pessoa('Mãe'), 'm', 'eu');
    a = adicionarPessoa(a, pessoa('Pai'), 'p', 'eu');
    a = adicionarPessoa(a, pessoa('Terceiro'), 't', 'eu');
    expect(a.pessoas.find(p => p.id === 'eu')!.pais).toEqual(['m', 'p']);
    expect(geracoes(a, 'eu').map(g => g.length)).toEqual([1, 2]);
    a = removerPessoa(a, 'm');
    expect(a.pessoas.find(p => p.id === 'eu')!.pais).toEqual(['p']);
  });

  it('o ano sai do texto livre', () => {
    expect(anoDe('por volta de 1880')).toBe(1880);
    expect(anoDe('12/03/1905')).toBe(1905);
    expect(anoDe('sem data')).toBeNull();
  });

  it('linha no mapa só onde a mudança é documentada', () => {
    const base = (evidencia: 'documentado' | 'oral') => normalizar({ pessoas: [{ id: 'x', nome: 'X', eventos: [
      { id: '1', tipo: 'nascimento', data: '1880', lugarId: 'porto', evidencia: 'documentado' },
      { id: '2', tipo: 'migracao', data: '1905', lugarId: 'rio', evidencia }
    ] }] });
    expect(trechosDocumentados(base('documentado'))).toHaveLength(1);
    expect(trechosDocumentados(base('oral'))).toHaveLength(0);
  });

  it('a pessoa viva sai protegida das cópias, a menos que se peça', () => {
    const a = normalizar({ pessoas: [{ id: 'v', nome: 'Maria Viva Souza', viva: true, notas: 'segredo', eventos: [
      { id: '1', tipo: 'nascimento', data: '1990', lugar: 'Recife', evidencia: 'documentado' }] }] });
    const json = exportarJson(a, '2026-10-22T00:00:00Z');
    const ged = exportarGedcom(a);
    for (const s of [json, ged]) {
      expect(s).not.toContain('Souza');
      expect(s).not.toContain('1990');
      expect(s).not.toContain('segredo');
    }
    expect(exportarGedcom(a, true)).toContain('2 DATE 1990');
  });

  it('o GEDCOM é bem formado: cabeçalho, uma família por par de pais e fim', () => {
    const ged = exportarGedcom(arvoreDeExemplo(), true);
    const linhas = ged.trim().split('\n');
    expect(linhas[0]).toBe('0 HEAD');
    expect(linhas.at(-1)).toBe('0 TRLR');
    for (const l of linhas) expect(l).toMatch(/^\d (@[A-Z]\d+@ )?[A-Z]{3,5}( .*)?$/);
    const indis = linhas.filter(l => / INDI$/.test(l)).length;
    expect(indis).toBe(arvoreDeExemplo().pessoas.length);
    expect(linhas.filter(l => / FAM$/.test(l)).length).toBeGreaterThan(0);
  });
});
