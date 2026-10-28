/* O site em inglês (PLANO-INGLES.md, etapa 1): o dicionário da interface,
   o inglês do conteúdo em data/en/ e o segundo Worker. A regra que segura
   tudo: na build em português nada muda, e o inglês nunca mexe no hebraico. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { LOCALE, LANG_HTML, fmt } from '@/i18n';
import { tx as naoEncontrada } from '@/i18n/telas/nao-encontrada';
// @ts-expect-error - script de build, sem tipos
import { ARQUIVOS, carregar, extrair, mesmoHebraico, traduzir } from '../../tools/i18n.mjs';

const raiz = (p: string) => new URL(`../../${p}`, import.meta.url);
/* Montado pelo código do caractere: escrito no arquivo, o travessão faria a
   própria verificação do CLAUDE.md acusar este teste. */
const TRAVESSAO = new RegExp(`[${String.fromCodePoint(0x2014, 0x2013)}]`);
const HEBRAICO = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
const variaveis = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

/* Cada arquivo de app/src/i18n/telas/ exporta DICIONARIO = { pt, en } e o
   `tx` escolhido na build. */
type Dic = Record<string, unknown>;
const PASTA = new URL('../src/i18n/telas/', import.meta.url);
const TELAS = readdirSync(PASTA).filter(f => /\.tsx?$/.test(f));
const modulos = await Promise.all(TELAS.map(async f => ({
  arquivo: f,
  fonte: readFileSync(new URL(f, PASTA), 'utf8'),
  mod: await import(`../src/i18n/telas/${f.replace(/\.tsx?$/, '')}`) as { DICIONARIO: { pt: Dic; en: Dic }; tx: Dic }
})));

/* Palavras que denunciam um "inglês" que ficou em português. */
const PORTUGUES = /[ãõç]|(^|\s)(não|você|para|uma|com|está|também)(\s|$)/i;

describe('o dicionário da interface', () => {
  it('sem a variável, a build é a de hoje, em português', () => {
    expect(LOCALE).toBe('pt');
    expect(LANG_HTML).toBe('pt-BR');
    expect(naoEncontrada.titulo).toBe('Esta página não existe');
  });

  it('fmt troca as variáveis e deixa à vista a que falta', () => {
    expect(fmt('Oi, {nome}. {n} de {total}', { nome: 'Ana', n: 3 })).toBe('Oi, Ana. 3 de {total}');
  });

  it('todo arquivo escolhe o idioma na linha que a build consegue apagar', () => {
    for (const { arquivo, fonte, mod } of modulos) {
      expect(fonte, arquivo).toContain("export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;");
      expect(mod.tx, arquivo).toBe(mod.DICIONARIO.pt);
    }
  });

  it('o inglês tem as mesmas chaves, as mesmas variáveis e o mesmo hebraico', () => {
    for (const { arquivo, mod: { DICIONARIO: { pt, en } } } of modulos) {
      expect(Object.keys(en).sort(), arquivo).toEqual(Object.keys(pt).sort());
      for (const [k, v] of Object.entries(pt)) {
        const e = en[k];
        const onde = `${arquivo}: ${k}`;
        expect(typeof e, onde).toBe(typeof v);
        if (typeof v !== 'string' || typeof e !== 'string') continue;
        expect(e.trim(), onde).not.toBe('');
        expect(variaveis(e), onde).toBe(variaveis(v));
        expect((e.match(HEBRAICO) ?? []).sort(), onde).toEqual((v.match(HEBRAICO) ?? []).sort());
      }
    }
  });

  it('nenhum inglês traz travessão nem ficou em português', () => {
    for (const { arquivo, mod: { DICIONARIO: { en } } } of modulos) {
      for (const [k, v] of Object.entries(en)) {
        if (typeof v !== 'string') continue;
        expect(v, `${arquivo}: ${k}`).not.toMatch(TRAVESSAO);
        expect(v, `${arquivo}: ${k}`).not.toMatch(PORTUGUES);
      }
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
