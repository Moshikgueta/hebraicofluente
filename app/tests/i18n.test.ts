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

/* Montado pelo código do caractere: escrito no arquivo, o travessão faria a
   própria verificação do CLAUDE.md acusar este teste. */
const TRAVESSAO = new RegExp(`[${String.fromCodePoint(0x2014, 0x2013)}]`);
const HEBRAICO = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
const variaveis = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

/* Cada arquivo de app/src/i18n/telas/ exporta DICIONARIO = { pt, en, es } e o
   `tx` escolhido na build (o espanhol desde 04/11/2026, PLANO-ESPANHOL.md). */
type Dic = Record<string, unknown>;
const PASTA = new URL('../src/i18n/telas/', import.meta.url);
const TELAS = readdirSync(PASTA).filter(f => /\.tsx?$/.test(f));
const modulos = await Promise.all(TELAS.map(async f => ({
  arquivo: f,
  fonte: readFileSync(new URL(f, PASTA), 'utf8'),
  mod: await import(`../src/i18n/telas/${f.replace(/\.tsx?$/, '')}`) as { DICIONARIO: { pt: Dic; en: Dic; es: Dic }; tx: Dic }
})));

/* Palavras que denunciam um "inglês" que ficou em português. */
const PORTUGUES = /[ãõç]|(^|\s)(não|você|para|uma|com|está|também)(\s|$)/i;
/* No espanhol, só o que o espanhol não tem: "para" e "está" são das duas línguas. */
const PORTUGUES_NO_ESPANHOL = /[ãõç]|(^|\s)(não|você|uma|com|também|isso|muito|então)(\s|$)/i;

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
      expect(fonte, arquivo).toContain(
        "export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;");
      expect(mod.tx, arquivo).toBe(mod.DICIONARIO.pt);
    }
  });

  it('o inglês e o espanhol têm as mesmas chaves, as mesmas variáveis e o mesmo hebraico', () => {
    for (const { arquivo, mod: { DICIONARIO } } of modulos) for (const lado of ['en', 'es'] as const) {
      const { pt } = DICIONARIO;
      const outro = DICIONARIO[lado];
      expect(outro, `${arquivo} sem ${lado}`).toBeTruthy();
      expect(Object.keys(outro).sort(), `${arquivo} ${lado}`).toEqual(Object.keys(pt).sort());
      for (const [k, v] of Object.entries(pt)) {
        const e = outro[k];
        const onde = `${arquivo} ${lado}: ${k}`;
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

  it('nenhum espanhol traz travessão nem ficou em português', () => {
    for (const { arquivo, mod: { DICIONARIO: { es } } } of modulos) {
      for (const [k, v] of Object.entries(es)) {
        if (typeof v !== 'string') continue;
        expect(v, `${arquivo}: ${k}`).not.toMatch(TRAVESSAO);
        expect(v, `${arquivo}: ${k}`).not.toMatch(PORTUGUES_NO_ESPANHOL);
      }
    }
  });
});

describe('os nomes do curso são os mesmos em toda tela', () => {
  it('as abas da lição: o motor (etapas-da-licao) e as telas das lições dizem o mesmo', async () => {
    const etapas = (await import('@/i18n/telas/motor-etapas-da-licao')).DICIONARIO;
    for (const tela of ['licao-lesson-client', 'licao-som-lesson-client', 'licao-contraste-client']) {
      const d = (await import(`../src/i18n/telas/${tela}`)).DICIONARIO as { pt: Dic; en: Dic; es: Dic };
      for (const lado of ['pt', 'en', 'es'] as const) {
        for (const k of ['conhecer', 'palavras', 'escrever', 'fixacao', 'exercicios']) {
          if (k in d[lado]) expect(d[lado][k], `${tela} ${lado} ${k}`).toBe((etapas[lado] as Dic)[k]);
        }
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

  it('as listas de texto entram item por item; as notas internas, não', () => {
    const json = [{
      id: 'alef',
      ensino: { checagem: [{ q: 'Pergunta?', opcoes: ['Só o som "o"', 'אוֹ', 'Nada'], certa: 0 }] },
      note: ['nota interna do autor, nunca na tela']
    }];
    const reg = {
      'alef/ensino/checagem/#0/opcoes/#0': { pt: 'Só o som "o"', en: 'Just the "o" sound' },
      'alef/ensino/checagem/#0/opcoes/#2': { pt: 'Nada', en: 'Nothing' },
      'alef/ensino/checagem/#0/q': { pt: 'Pergunta?', en: 'Question?' }
    };
    const faltas: { caminho: string }[] = [];
    traduzir('letters', json, faltas, reg);
    expect(json[0]!.ensino.checagem[0]!.opcoes).toEqual(['Just the "o" sound', 'אוֹ', 'Nothing']);
    expect(json[0]!.note).toEqual(['nota interna do autor, nunca na tela']);
    expect(faltas).toEqual([]);
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

  it('data/es/ está em dia com data/*.json (rode: node tools/i18n.mjs extrair)', () => {
    for (const nome of ARQUIVOS as string[]) {
      expect(carregar(nome, 'es'), nome).toEqual(extrair(nome, 'es'));
    }
  });

  it('todo espanhol já escrito mantém o hebraico e não tem travessão', () => {
    for (const nome of ARQUIVOS as string[]) {
      for (const [caminho, r] of Object.entries(carregar(nome, 'es') as Record<string, { pt: string; es: string | null }>)) {
        if (!r.es) continue;
        expect(mesmoHebraico(r.pt, r.es), `${nome}:${caminho}`).toBe(true);
        expect(r.es, `${nome}:${caminho}`).not.toMatch(TRAVESSAO);
      }
    }
  });

  it('o espanhol do conteúdo está completo (a build estrita em espanhol pararia)', () => {
    const faltas: { arquivo: string; caminho: string; motivo: string }[] = [];
    for (const nome of ARQUIVOS as string[]) {
      const fonte = JSON.parse(readFileSync(new URL(`../../data/${nome}.json`, import.meta.url), 'utf8'));
      traduzir(nome, fonte, faltas, carregar(nome, 'es'), 'es');
    }
    expect(faltas.slice(0, 10)).toEqual([]);
  });

  it('a transliteração fica de fora: o inglês terá sistema próprio', () => {
    for (const nome of ARQUIVOS as string[]) {
      for (const idioma of ['en', 'es']) {
        const caminhos = Object.keys(carregar(nome, idioma));
        expect(caminhos.filter(c => /\/translit\w*$/i.test(c)), `${idioma} ${nome}`).toEqual([]);
      }
    }
  });
});

/* O "segundo Worker" do tempo em que os dois sites eram um repositório virou
   o wrangler.toml deste, com banco próprio: tests/isolamento.test.ts. */
