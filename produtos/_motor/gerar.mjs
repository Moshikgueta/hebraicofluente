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

  // Páginas de fluxo muito vazias (mais de 45% livre e não são a última do
  // capítulo) são aviso: o olho decide se o respiro é bom ou é buraco.
  const buracos = rel.sobraPorPagina.map((s, i) => [i + 1, s]).filter(([, s]) => s !== null && s > 0.45);
  if (buracos.length) console.log(`aviso [${formato}]: páginas com mais de 45% livre: ${buracos.map(([p, s]) => `${p} (${Math.round(s * 100)}%)`).join(', ')}`);

  const pdf = path.join(saida, `${slug}-${formato}.pdf`);
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  await page.close();

  const fontes = execFileSync('pdffonts', [pdf], { encoding: 'utf8' }).trim().split('\n').slice(2);
  const estranhas = fontes.filter(l => !/(Bricolage|Instrument|NotoSerifHebrew|NotoSansHebrew)/i.test(l));
  // Colunas do pdffonts: nome tipo codificação emb sub uni obj ger.
  const naoEmbutidas = fontes.filter(l => l.trim().split(/\s+/).at(-5) !== 'yes');
  if (estranhas.length) { console.error(`ERRO [${formato}]: fonte que não é nossa no PDF (glifo fora das fontes do guia?):\n  ${estranhas.join('\n  ')}`); falhou = true; }
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  const paginas = +info.match(/Pages:\s+(\d+)/)[1];
  resumo.push(`${formato}: ${paginas} páginas, ${rel.externos.length} link(s) externo(s), sobra média ${Math.round(rel.sobraMedia * 100)}% -> ${path.relative(process.cwd(), pdf)}`);
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
