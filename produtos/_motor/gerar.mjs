// Gera os PDFs de um guia, do conteúdo estruturado até o arquivo final.
// ─────────────────────────────────────────────────────────────────────────
//   node produtos/_motor/gerar.mjs sobrevivencia-israel            os dois formatos
//   node produtos/_motor/gerar.mjs sobrevivencia-israel celular    só um
//   ... --previa                                                   + PNG de cada página
//
// Ordem, e cada passo para o seguinte se falhar:
//   1. conferir.mjs: 100 itens, campos, hebraico, travessão;
//   2. montar.mjs: o HTML;
//   3. Chromium: carrega as fontes do repositório (assets/fonts), recusa se
//      alguma não carregou, roda o paginador;
//   4. confere o paginador: bloco estourado, página vazia, âncora sem
//      destino. Qualquer um é erro;
//   5. imprime o PDF (marcado e com marcadores de navegação) e confere com
//      pdffonts que só as nossas fontes foram embutidas, todas embutidas;
//   6. regenera audio/manifesto.json e REVISAO.md.
//
// O Chromium é o que já vem na máquina: HF_CHROMIUM, ou o do Playwright em
// /opt/pw-browsers. Nunca `playwright install`.

import { mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { carregar } from './dados.mjs';
import { conferir } from './conferir.mjs';
import { montar } from './montar.mjs';
import { gerarDerivados } from './derivados.mjs';

const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('-') && !['celular', 'a4'].includes(a));
const soFormato = args.find(a => ['celular', 'a4'].includes(a));
const comPrevia = args.includes('--previa');
if (!slug) { console.error('uso: node produtos/_motor/gerar.mjs <slug> [celular|a4] [--previa]'); process.exit(2); }

const produto = await carregar(slug);
const { erros, avisos } = conferir(produto);
avisos.forEach(a => console.log(`aviso: ${a}`));
if (erros.length) { erros.forEach(e => console.error(`ERRO: ${e}`)); process.exit(1); }

const saida = path.join(produto.dir, 'saida');
const build = path.join(saida, '.build');
await mkdir(build, { recursive: true });

const { chromium } = await carregarPlaywright();
const browser = await chromium.launch({ executablePath: acharChromium() });
const paginador = await readFile(new URL('./paginar.js', import.meta.url), 'utf8');
const FONTES = ['700 10pt Bricolage', '600 10pt Bricolage', '400 10pt Instrument', '600 10pt Instrument',
  '500 10pt HeSerif', '400 10pt HeSans', '700 10pt HeSans'];

let falhou = false;
const resumo = [];
for (const formato of soFormato ? [soFormato] : produto.meta.formatos) {
  const html = montar(produto, formato);
  const arqHtml = path.join(build, `${formato}.html`);
  await writeFile(arqHtml, html);

  const page = await browser.newPage();
  await page.goto(`file://${arqHtml}`);
  await page.evaluate(async fs => { await Promise.all(fs.map(f => document.fonts.load(f, 'aשׁ'))); await document.fonts.ready; }, FONTES);
  const semFonte = await page.evaluate(fs => fs.filter(f => !document.fonts.check(f, 'aשׁ')), FONTES);
  if (semFonte.length) { console.error(`ERRO [${formato}]: fontes não carregaram: ${semFonte.join(', ')}`); falhou = true; }

  const rel = await page.evaluate(paginador);
  const problemas = [
    ...rel.estouros.map(e => `bloco maior que a página: ${e}`),
    ...rel.vazias.map(p => `página ${p} vazia`),
    ...rel.ancorasSemDestino.map(a => `link interno sem destino: ${a}`)
  ];
  problemas.forEach(p => console.error(`ERRO [${formato}]: ${p}`));
  if (problemas.length) falhou = true;

  // Ocupação de cada página de conteúdo: a meta editorial é 70% a 90%.
  // Abaixo de 55%, aviso; o olho decide se é respiro (fim de seção) ou buraco.
  const ocup = rel.ocupacao.map((o, k) => [k + 1, o]).filter(([, o]) => o !== null);
  const baixas = ocup.filter(([, o]) => o < 0.55);
  const media = ocup.reduce((a, [, o]) => a + o, 0) / (ocup.length || 1);
  if (baixas.length) console.log(`aviso [${formato}]: páginas com menos de 55% ocupadas: ${baixas.map(([p, o]) => `${p} (${Math.round(o * 100)}%)`).join(', ')}`);
  await writeFile(path.join(saida, `paginacao-${formato}.json`), JSON.stringify({ paginas: rel.paginas, ocupacao: rel.ocupacao, capitulos: rel.capitulos, mediaOcupacao: +media.toFixed(3) }, null, 1));

  const pdf = path.join(saida, `${slug}-${formato}.pdf`);
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
  await page.close();
  metadados(pdf, produto, marcadores(produto, rel));

  const fontes = execFileSync('pdffonts', [pdf], { encoding: 'utf8' }).trim().split('\n').slice(2);
  const estranhas = fontes.filter(l => !/(Bricolage|Instrument|NotoSerifHebrew|NotoSansHebrew)/i.test(l));
  // Colunas do pdffonts: nome tipo codificação emb sub uni obj ger.
  const naoEmbutidas = fontes.filter(l => l.trim().split(/\s+/).at(-5) !== 'yes');
  if (estranhas.length) { console.error(`ERRO [${formato}]: fonte que não é nossa no PDF (glifo fora das fontes do guia?):\n  ${estranhas.join('\n  ')}`); falhou = true; }
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  const paginas = +info.match(/Pages:\s+(\d+)/)[1];
  resumo.push(`${formato}: ${paginas} páginas, ${rel.externos.length} link(s) externo(s), ocupação média ${Math.round(media * 100)}% -> ${path.relative(process.cwd(), pdf)}`);
  if (naoEmbutidas.length) { console.error(`ERRO [${formato}]: fonte não embutida:\n  ${naoEmbutidas.join('\n  ')}`); falhou = true; }

  if (comPrevia) {
    const dir = path.join(saida, `previa-${formato}`);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    execFileSync('pdftoppm', ['-png', '-r', formato === 'a4' ? '60' : '110', pdf, path.join(dir, 'p')]);
    resumo.push(`  prévias: ${path.relative(process.cwd(), dir)} (${(await readdir(dir)).length} imagens)`);
  }
  if (formato === (soFormato ?? produto.meta.formatos[0])) resumo.push(`  links externos: ${rel.externos.join(', ') || 'nenhum'}`);
}
await browser.close();

await gerarDerivados(produto);
resumo.push('derivados: audio/manifesto.json, REVISAO.md');
console.log('\n' + resumo.join('\n'));
process.exit(falhou ? 1 : 0);

// O Chromium só grava o título. Autor, assunto, palavras-chave e idioma
// entram depois, com pypdf, sem reescrever o conteúdo (estrutura marcada,
// marcadores e links continuam os mesmos). Sem pypdf, só avisa.
// Marcadores: um por seção, com o título limpo. Os automáticos do Chromium
// saem de todo título da página (90 entradas) e colam as linhas quebradas.
function marcadores(produto, rel) {
  const a = rel.ancoras, n2 = n => String(n).padStart(2, '0');
  const cap = Object.fromEntries(rel.capitulos.map(c => [c.id, c.pagina]));
  return [
    ['Capa', 1], ['Sumário', a.sumario], [produto.textos.emergencia.titulo.split(':')[0], a.emergencia], ['Introdução', a.introducao],
    ...produto.capitulos.map(c => [`${n2(c.n)} · ${c.titulo}`, cap[`cap-${c.n}`]]),
    [produto.textos.gabarito.titulo, a.gabarito], [produto.textos.indice.titulo, a.indice]
  ].filter(([, p]) => p);
}

function metadados(pdf, produto, marcas) {
  const m = produto.meta;
  const py = `
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
r = PdfReader(sys.argv[1]); w = PdfWriter(clone_from=r)
w.add_metadata({'/Title': sys.argv[2], '/Author': sys.argv[3], '/Subject': sys.argv[4], '/Keywords': sys.argv[5], '/Creator': 'Hebraico Fluente', '/Producer': 'Hebraico Fluente (Chromium + pypdf)'})
w._root_object[NameObject('/Lang')] = TextStringObject('pt-BR')
import json
for titulo, pagina in json.loads(sys.argv[6]):
    w.add_outline_item(titulo, pagina - 1)
w.page_mode = '/UseOutlines'
w.write(sys.argv[1])`;
  try {
    execFileSync('python3', ['-c', py, pdf, `${m.titulo}: ${m.subtitulo}`, produto.textos.capa.autor, m.descricaoCurta, 'hebraico, Israel, viagem, guia, pronúncia, Hebraico Fluente', JSON.stringify(marcas)]);
  } catch (e) { console.log(`aviso: metadados não gravados (${String(e.message).split('\n')[0]})`); }
}

async function carregarPlaywright() {
  try { return await import('playwright'); } catch {}
  const global = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  return import(path.join(global, 'playwright/index.mjs'));
}
function acharChromium() {
  if (process.env.HF_CHROMIUM) return process.env.HF_CHROMIUM;
  for (const p of ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome']) if (existsSync(p)) return p;
  return undefined; // o próprio Playwright procura
}
