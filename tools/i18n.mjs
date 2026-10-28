/* i18n.mjs - o inglês do conteúdo do curso (data/en/)
 * ─────────────────────────────────────────────────────────────────────────
 * data/*.json continua sendo a fonte, em português. O inglês mora ao lado,
 * em data/en/<arquivo>.json, um registro por texto:
 *
 *   "alef/ensino/funcaoPt": { "pt": "<o texto de hoje>", "en": "<o inglês>" }
 *
 * O caminho sai da estrutura do arquivo: objeto de lista com `id` (ou `slug`)
 * entra pelo id, e não pela posição, para uma letra nova no meio da lista não
 * embaralhar as traduções. O `pt` guardado é o texto que foi traduzido: se a
 * fonte mudar depois, o registro fica desatualizado e a build estrita recusa.
 *
 * Três regras que o exportador cobra na build em inglês:
 *   1. o hebraico não muda: os trechos em hebraico e as marcas {{...}} do
 *      inglês são os mesmos do português, na mesma quantidade;
 *   2. texto sem tradução, ou com tradução de um português antigo, entra na
 *      lista de faltas; com HF_I18N_ESTRITO=1 a build para;
 *   3. na build em português nada disto roda: o curso de hoje sai igual.
 *
 * A transliteração fica de fora de propósito: a do inglês é outro sistema
 * (etapa 3 do PLANO-INGLES.md), não tradução palavra a palavra.
 *
 * Uso (da raiz):
 *   node tools/i18n.mjs extrair     atualiza data/en/ com os textos de hoje
 *   node tools/i18n.mjs relatorio   quanto falta, por arquivo
 *   node tools/i18n.mjs planilha    CSV (caminho, pt, en) para os revisores
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PASTA = join(ROOT, 'data/en');

/** O idioma da build: `NEXT_PUBLIC_LOCALE=en` faz o site em inglês. */
export const LOCALE = process.env.NEXT_PUBLIC_LOCALE === 'en' ? 'en' : 'pt';

/** Os arquivos do curso de alfabetização que o aluno lê. Fora: o catálogo e
    a empresa (o site em inglês terá os seus), o A1 e o Raízes. */
export const ARQUIVOS = [
  'letters', 'modules', 'nikud', 'extras', 'real-world', 'sentences',
  'eras', 'culture', 'missoes', 'textos', 'bonus', 'biblia', 'fotos-missoes'
];

/* Chaves de texto que não terminam em Pt. Toda chave terminada em Pt é texto
   (menos a transliteração). Uma letra hebraica como chave é o quadro de
   contraste (`contrastes: { "ו": "..." }`). */
const CHAVES = new Set([
  'pt', 'q', 'porque', 'why', 'wrong', 'right', 'use', 'ptApprox', 'lead',
  'title', 'correction', 'sources', 'didYouKnow', 'didYouKnowTitle', 'note'
]);

/* Notas internas, que nunca chegam à tela. */
const INTERNOS = new Set(['culture:note', 'real-world:note']);

const LETRA_HEBRAICA = /^[\u05D0-\u05EA]$/;
const TEM_PALAVRA = /[a-zà-úA-ZÀ-Ú]{2}/;

export function traduzivel(nome, caminho, chave, valor) {
  if (typeof valor !== 'string' || chave.startsWith('_')) return false;
  if (chave.toLowerCase().startsWith('translit')) return false;
  if (INTERNOS.has(`${nome}:${caminho}`)) return false;
  if (!(chave.endsWith('Pt') || CHAVES.has(chave) || LETRA_HEBRAICA.test(chave))) return false;
  return TEM_PALAVRA.test(valor);
}

/* O segmento de um item de lista: o id, o slug, ou a posição. Dois itens com
   o mesmo id na mesma lista fariam duas traduções disputarem um caminho, e
   aí a lista inteira volta para a posição. */
function segmentos(lista) {
  const ids = lista.map(x => (x && typeof x === 'object' && !Array.isArray(x)
    ? (typeof x.id === 'string' ? x.id : typeof x.slug === 'string' ? x.slug : null)
    : null));
  const unicos = ids.every(Boolean) && new Set(ids).size === ids.length;
  return lista.map((_, i) => (unicos ? ids[i] : `#${i}`));
}

/** Chama `fn(caminho, chave, valor, trocar)` em cada texto traduzível. */
export function percorrer(nome, json, fn) {
  const ir = (no, caminho) => {
    if (Array.isArray(no)) {
      const seg = segmentos(no);
      no.forEach((x, i) => ir(x, caminho ? `${caminho}/${seg[i]}` : seg[i]));
      return;
    }
    if (!no || typeof no !== 'object') return;
    for (const [k, v] of Object.entries(no)) {
      const c = caminho ? `${caminho}/${k}` : k;
      if (typeof v === 'string') {
        if (traduzivel(nome, c, k, v)) fn(c, k, v, novo => { no[k] = novo; });
      } else ir(v, c);
    }
  };
  ir(json, '');
}

const HEBRAICO = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
const MARCA = /\{\{[^}]*\}\}/g;
const assinatura = (s, re) => (s.match(re) || []).slice().sort().join('|');

/** O inglês leva exatamente o hebraico e as marcas {{...}} do português. */
export function mesmoHebraico(pt, en) {
  return assinatura(pt, HEBRAICO) === assinatura(en, HEBRAICO)
    && assinatura(pt, MARCA) === assinatura(en, MARCA);
}

export function carregar(nome) {
  const p = join(PASTA, `${nome}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

/**
 * Troca, em `json`, cada texto pelo inglês de data/en/. Devolve o próprio
 * objeto (alterado). Cada problema vai para `faltas` como
 * { arquivo, caminho, motivo }, com motivo 'sem-traducao', 'desatualizado'
 * ou 'hebraico'. Sem inglês válido, o texto fica em português: quem decide
 * se isso pode ir ao ar é o modo estrito do exportador.
 */
export function traduzir(nome, json, faltas = [], reg = carregar(nome)) {
  percorrer(nome, json, (caminho, _k, pt, trocar) => {
    const r = reg[caminho];
    if (!r || typeof r.en !== 'string' || !r.en.trim()) {
      faltas.push({ arquivo: nome, caminho, motivo: 'sem-traducao' });
      return;
    }
    if (!mesmoHebraico(pt, r.en)) {
      faltas.push({ arquivo: nome, caminho, motivo: 'hebraico' });
      return;
    }
    if (r.pt !== pt) faltas.push({ arquivo: nome, caminho, motivo: 'desatualizado' });
    trocar(r.en);
  });
  return json;
}

const lerFonte = nome => JSON.parse(readFileSync(join(ROOT, 'data', `${nome}.json`), 'utf8'));

/** Os registros de data/en/<nome>.json refeitos a partir da fonte de hoje:
    caminho novo entra com en null, caminho que sumiu sai, e o inglês de um
    português que mudou fica, marcado `revisar`. */
export function extrair(nome) {
  const antigo = carregar(nome);
  const novo = {};
  percorrer(nome, lerFonte(nome), (caminho, _k, pt) => {
    const a = antigo[caminho];
    if (!a) { novo[caminho] = { pt, en: null }; return; }
    const r = { pt, en: a.en ?? null };
    if (a.pt !== pt && r.en) r.revisar = true;
    else if (a.revisar) r.revisar = true;
    if (a.comentario) r.comentario = a.comentario;
    novo[caminho] = r;
  });
  return novo;
}

export function relatorio() {
  return ARQUIVOS.map(nome => {
    const faltas = [];
    let total = 0;
    percorrer(nome, lerFonte(nome), () => { total++; });
    traduzir(nome, lerFonte(nome), faltas);
    const conta = m => faltas.filter(f => f.motivo === m).length;
    return {
      arquivo: nome, total,
      prontos: total - faltas.length,
      semTraducao: conta('sem-traducao'), desatualizados: conta('desatualizado'), hebraico: conta('hebraico')
    };
  });
}

const csv = s => (s == null ? '' : /[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

function principal(cmd) {
  if (cmd === 'extrair') {
    mkdirSync(PASTA, { recursive: true });
    for (const nome of ARQUIVOS) {
      writeFileSync(join(PASTA, `${nome}.json`), JSON.stringify(extrair(nome), null, 2) + '\n');
    }
    console.log(`data/en/: ${ARQUIVOS.length} arquivos atualizados.`);
  } else if (cmd === 'relatorio') {
    const linhas = relatorio();
    console.table(linhas);
    const soma = k => linhas.reduce((n, l) => n + l[k], 0);
    console.log(`Prontos: ${soma('prontos')} de ${soma('total')} textos.`);
  } else if (cmd === 'planilha') {
    const saida = ['arquivo,caminho,pt,en,comentario'];
    for (const nome of ARQUIVOS) {
      for (const [c, r] of Object.entries(carregar(nome))) {
        saida.push([nome, c, r.pt, r.en, r.comentario].map(csv).join(','));
      }
    }
    process.stdout.write(saida.join('\n') + '\n');
  } else {
    console.error('Uso: node tools/i18n.mjs extrair | relatorio | planilha');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) principal(process.argv[2]);
