/* A transliteração do site em inglês (PLANO-INGLES.md, etapa 3; decisões do
 * dono de 28/10/2026: sem acento na sílaba forte, ch para ח e כ).
 * A fonte continua sendo a transliteração para brasileiros; o inglês sai de
 * uma conversão só, com duas cópias (o exportador e o app) que têm de
 * concordar, e nenhum texto em inglês pode sobrar com a grafia de lá. */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { translitEn as doApp } from '@/i18n/translit';
import { MEU_NOME_EM_HEBRAICO } from '@/lib/recursos';
// @ts-expect-error - script de build, sem tipos
import { translitEn as doExportador, translitNoTexto } from '../../tools/translit-en.mjs';

const raiz = (p: string) => new URL(`../../${p}`, import.meta.url);
const ler = (p: string) => JSON.parse(readFileSync(raiz(p), 'utf8'));

/* Toda transliteração do curso, de todo arquivo de dados. */
function transliteracoes(): string[] {
  const todas = new Set<string>();
  const ir = (no: unknown, chave: string) => {
    if (typeof no === 'string') { if (/^translit/i.test(chave)) todas.add(no); return; }
    if (Array.isArray(no)) no.forEach(x => ir(x, chave));
    else if (no && typeof no === 'object') for (const [k, v] of Object.entries(no)) ir(v, k);
  };
  for (const f of readdirSync(raiz('data')).filter(f => f.endsWith('.json') && !f.startsWith('a1'))) ir(ler(`data/${f}`), '');
  return [...todas];
}

describe('a regra', () => {
  it('sai como o dono decidiu', () => {
    const casos: [string, string][] = [
      ['shalóm', 'shalom'], ['bóker tov', 'boker tov'], ['íma', 'ima'], ['mishpachá', 'mishpacha'],
      ['Álef', 'Alef'], ['késsef', 'kesef'], ['kissé', 'kise'], ['guéshem', 'geshem'], ['Guímel', 'Gimel'],
      ['djins', 'jins'], ['pidjáma', 'pijama'], ['jakét', 'zhaket'], ['massáj', 'masazh'],
      ['léchem', 'lechem'], ['tchips', 'tchips'], ['Hashém', 'Hashem'], ['São Paulo', 'São Paulo']
    ];
    for (const [pt, en] of casos) expect(doExportador(pt), pt).toBe(en);
  });

  it('o exportador e o app dão o mesmo resultado em toda transliteração do curso', () => {
    const lista = transliteracoes();
    expect(lista.length).toBeGreaterThan(500);
    for (const t of lista) expect(doApp(t), t).toBe(doExportador(t));
  });

  it('nenhuma transliteração convertida sobra com acento de sílaba forte, ss, dj ou gue/gui', () => {
    for (const t of transliteracoes()) {
      if (/^professor-/.test(t)) continue;
      expect(doExportador(t), t).not.toMatch(/[áéíóú]|ss|dj|gu[ei]/i);
    }
  });

  it('num texto em inglês, mexe só na transliteração', () => {
    expect(translitNoTexto('Read «shalóm», the daguesh and the class in Álef.'))
      .toBe('Read «shalom», the dagesh and the class in Alef.');
  });
});

describe('os textos em inglês', () => {
  /* O circunflexo também (28/10/2026): um "ô" passou para o Vav em inglês. */
  const AGUDO_LATINO = /[A-Za-z]*[áéíóúâêôÁÉÍÓÚÂÊÔ][A-Za-z]*/g;
  const PERMITIDOS = new Set(['São']);

  it('data/en não tem transliteração com a grafia do português', () => {
    for (const f of readdirSync(raiz('data/en'))) {
      for (const [caminho, r] of Object.entries(ler(`data/en/${f}`) as Record<string, { en: string | null }>)) {
        const sobra = (r.en?.match(AGUDO_LATINO) ?? []).filter(p => !PERMITIDOS.has(p));
        expect(sobra, `${f}:${caminho}`).toEqual([]);
      }
    }
  });

  it('o lado inglês dos dicionários de tela também não', () => {
    const pasta = raiz('app/src/i18n/telas/');
    for (const f of readdirSync(pasta)) {
      const s = readFileSync(new URL(f, pasta), 'utf8');
      const en = s.slice(s.indexOf('\nconst en'), s.indexOf('\nexport const DICIONARIO'))
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
      const sobra = (en.match(AGUDO_LATINO) ?? []).filter(p => !PERMITIDOS.has(p));
      expect(sobra, f).toEqual([]);
    }
  });
});

describe('o que o site em inglês não tem', () => {
  it('a "Meu nome em hebraico" (regras do português) existe só no site brasileiro', () => {
    // A build dos testes é a em português.
    expect(MEU_NOME_EM_HEBRAICO).toBe(true);
    const recursos = readFileSync(raiz('app/src/lib/recursos.ts'), 'utf8');
    expect(recursos).toContain("export const MEU_NOME_EM_HEBRAICO = LOCALE !== 'en';");
  });
});
