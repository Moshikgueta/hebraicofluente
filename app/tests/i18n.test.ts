/* O site em inglês (PLANO-INGLES.md, etapa 1): o dicionário da interface,
   o inglês do conteúdo em data/en/ e o segundo Worker. A regra que segura
   tudo: na build em português nada muda, e o inglês nunca mexe no hebraico. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { pt } from '@/i18n/pt';
import { en } from '@/i18n/en';
import { t, LOCALE, LANG_HTML } from '@/i18n';
// @ts-expect-error - script de build, sem tipos
import { ARQUIVOS, carregar, extrair, mesmoHebraico, traduzir } from '../../tools/i18n.mjs';

const raiz = (p: string) => new URL(`../../${p}`, import.meta.url);
/* Montado pelo código do caractere: escrito no arquivo, o travessão faria a
   própria verificação do CLAUDE.md acusar este teste. */
const TRAVESSAO = new RegExp(`[${String.fromCodePoint(0x2014, 0x2013)}]`);
const HEBRAICO = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
const variaveis = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('o dicionário da interface', () => {
  it('sem a variável, a build é a de hoje, em português', () => {
    expect(LOCALE).toBe('pt');
    expect(LANG_HTML).toBe('pt-BR');
    expect(t('naoEncontrada.titulo')).toBe('Esta página não existe');
  });

  it('o inglês tem as mesmas chaves e as mesmas variáveis do português', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(pt).sort());
    for (const [k, v] of Object.entries(pt)) {
      expect(variaveis(en[k as keyof typeof en]), k).toBe(variaveis(v));
    }
  });

  it('nenhum texto em inglês traz travessão nem hebraico que o português não tem', () => {
    for (const [k, v] of Object.entries(en)) {
      expect(v, k).not.toMatch(TRAVESSAO);
      expect((v.match(HEBRAICO) ?? []).sort(), k)
        .toEqual((pt[k as keyof typeof pt].match(HEBRAICO) ?? []).sort());
    }
  });

});

describe('o inglês do conteúdo (tools/i18n.mjs)', () => {
  it('o hebraico e as marcas {{...}} têm de ser os mesmos', () => {
    expect(mesmoHebraico('{{א}} é um apoio', '{{א}} is a support')).toBe(true);
    expect(mesmoHebraico('{{א}} é um apoio', 'Aleph is a support')).toBe(false);
    expect(mesmoHebraico('Leia שָׁלוֹם', 'Read שָׁלוֹם and בַּיִת')).toBe(false);
  });

  it('troca o texto, e aponta o que falta, o desatualizado e o hebraico mexido', () => {
    const json = [{
      id: 'alef',
      namePt: 'Álef',
      soundNotePt: 'Não tem som. {{א}} é um apoio.',
      funcaoPt: 'Texto que mudou depois da tradução.',
      lembrePt: 'O {{א}} segura a vogal.',
      detalhePt: 'Ainda sem inglês.'
    }];
    const reg = {
      'alef/namePt': { pt: 'Álef', en: 'Aleph' },
      'alef/soundNotePt': { pt: 'Não tem som. {{א}} é um apoio.', en: 'It has no sound. {{א}} is a support.' },
      'alef/funcaoPt': { pt: 'Texto antigo.', en: 'Old text.' },
      'alef/lembrePt': { pt: 'O {{א}} segura a vogal.', en: 'Aleph holds the vowel.' }
    };
    const faltas: { caminho: string; motivo: string }[] = [];
    traduzir('letters', json, faltas, reg);
    expect(json[0]).toMatchObject({
      namePt: 'Aleph',
      soundNotePt: 'It has no sound. {{א}} is a support.',
      funcaoPt: 'Old text.',
      lembrePt: 'O {{א}} segura a vogal.',
      detalhePt: 'Ainda sem inglês.'
    });
    expect(faltas.map(f => `${f.caminho}:${f.motivo}`).sort()).toEqual([
      'alef/detalhePt:sem-traducao',
      'alef/funcaoPt:desatualizado',
      'alef/lembrePt:hebraico'
    ]);
  });

  it('data/en/ está em dia com data/*.json (rode: node tools/i18n.mjs extrair)', () => {
    for (const nome of ARQUIVOS as string[]) {
      expect(carregar(nome), nome).toEqual(extrair(nome));
    }
  });

  it('todo inglês já escrito mantém o hebraico e não tem travessão', () => {
    for (const nome of ARQUIVOS as string[]) {
      for (const [caminho, r] of Object.entries(carregar(nome) as Record<string, { pt: string; en: string | null }>)) {
        if (!r.en) continue;
        expect(mesmoHebraico(r.pt, r.en), `${nome}:${caminho}`).toBe(true);
        expect(r.en, `${nome}:${caminho}`).not.toMatch(TRAVESSAO);
      }
    }
  });

  it('a transliteração fica de fora: o inglês terá sistema próprio', () => {
    for (const nome of ARQUIVOS as string[]) {
      const caminhos = Object.keys(carregar(nome));
      expect(caminhos.filter(c => /\/translit\w*$/i.test(c)), nome).toEqual([]);
    }
  });
});

describe('o segundo Worker (wrangler.en.toml)', () => {
  const pt = readFileSync(raiz('wrangler.toml'), 'utf8');
  const en = readFileSync(raiz('wrangler.en.toml'), 'utf8');
  const lista = (toml: string) => toml.match(/run_worker_first\s*=\s*\[([\s\S]*?)\]/)?.[1]?.replace(/\s+/g, '');
  const banco = (toml: string) => toml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];

  it('usa o mesmo banco: a conta e o curso valem nos dois sites', () => {
    expect(banco(en)).toBe(banco(pt));
  });

  it('serve o export em inglês, com a mesma lista de exceções do portão', () => {
    expect(en).toMatch(/directory\s*=\s*"\.\/app\/out-en"/);
    expect(lista(en)).toBe(lista(pt));
  });

  it('não agenda nada (a varredura roda só no Worker brasileiro) e declara o idioma', () => {
    expect(en).not.toMatch(/^\s*\[triggers\]/m);
    expect(en).toMatch(/^LOCALE\s*=\s*"en"/m);
    expect(en).not.toMatch(/hebraicofluente\.com\.br",\s*custom_domain/);
  });
});
