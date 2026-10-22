#!/usr/bin/env node
/* Monta a cauda da marca d'água do PDF do e-book (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Uso: node scripts/pdf-marca.mjs app/public/israel/israel-alem-do-roteiro.pdf
 * Escreve, ao lado do PDF, `<pdf>.cauda` (os bytes da atualização
 * incremental, com o campo do texto em branco) e `<pdf>.cauda.json` (o
 * tamanho do PDF original e onde ficam os campos). O Worker preenche os
 * campos por pedido: ver worker/src/lib/pdf-marca.js, que explica a ideia.
 *
 * O que o gerador aceita é o que o Chromium (Skia) escreve: uma tabela xref
 * clássica, sem fluxos de objetos, com /Resources e /Font dentro da página.
 * Qualquer outra forma faz o gerador parar com erro, e a publicação junto:
 * melhor que um PDF que abre quebrado na mão de quem comprou.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { LARGURA } from '../worker/src/lib/pdf-marca.js';

const latin1 = b => Buffer.from(b).toString('latin1');
const bytes = s => Buffer.from(s, 'latin1');

function falha(msg) { throw new Error('pdf-marca: ' + msg); }

/** A tabela xref do original: número do objeto → posição. */
function lerXref(pdf) {
  const fim = latin1(pdf.subarray(Math.max(0, pdf.length - 1024)));
  const m = fim.match(/startxref\s+(\d+)\s+%%EOF\s*$/);
  if (!m) falha('sem startxref no fim do arquivo');
  const inicio = Number(m[1]);
  const texto = latin1(pdf.subarray(inicio));
  if (!texto.startsWith('xref')) falha('a xref não é uma tabela clássica');
  const corpo = texto.slice(4, texto.indexOf('trailer'));
  const trailer = texto.slice(texto.indexOf('trailer'), texto.indexOf('startxref'));
  if (/\/Prev\b/.test(trailer)) falha('o original já tem atualização incremental');
  if (/\/Encrypt\b/.test(trailer)) falha('PDF cifrado');
  const posicoes = new Map();
  const linhas = corpo.trim().split(/\r?\n/);
  for (let i = 0; i < linhas.length;) {
    const [primeiro, quantos] = linhas[i++].trim().split(/\s+/).map(Number);
    for (let k = 0; k < quantos; k++) {
      const [pos, , tipo] = linhas[i++].trim().split(/\s+/);
      if (tipo === 'n') posicoes.set(primeiro + k, Number(pos));
    }
  }
  const size = Number((trailer.match(/\/Size\s+(\d+)/) || falha('trailer sem /Size'))[1]);
  const root = (trailer.match(/\/Root\s+(\d+ \d+ R)/) || falha('trailer sem /Root'))[1];
  const info = (trailer.match(/\/Info\s+(\d+) \d+ R/) || [])[1];
  return { inicio, posicoes, size, root, info: info ? Number(info) : null };
}

/** O texto de "N 0 obj ... endobj" (só para objetos sem stream). */
function lerObjeto(pdf, pos, num) {
  const ate = pdf.indexOf('endobj', pos, 'latin1');
  const s = latin1(pdf.subarray(pos, ate));
  const cab = s.match(/^(\d+) 0 obj\s*/);
  if (!cab || Number(cab[1]) !== num) falha(`objeto ${num} fora do lugar`);
  if (/\bstream\b/.test(s)) return null;
  return s.slice(cab[0].length).trim();
}

export function montarCauda(pdf) {
  const { inicio, posicoes, size, root, info } = lerXref(pdf);
  let proximo = size;
  const fonte = proximo++, abre = proximo++, fecha = proximo++;
  const marcas = new Map(); // MediaBox → número do fluxo da marca
  const objetos = []; // [num, texto antes do campo, depois do campo | null, é metadado]

  const paginas = [];
  for (const [num, pos] of posicoes) {
    const corpo = lerObjeto(pdf, pos, num);
    if (corpo && /^<<\s*\/Type\s*\/Page\b(?!s)/.test(corpo)) paginas.push([num, corpo]);
  }
  if (!paginas.length) falha('nenhuma página');

  for (const [num, corpo] of paginas) {
    const caixa = (corpo.match(/\/MediaBox\s*\[([^\]]+)\]/) || falha(`página ${num} sem /MediaBox`))[1].trim();
    if (!marcas.has(caixa)) marcas.set(caixa, proximo++);
    const marca = marcas.get(caixa);
    if (!/\/Resources\s*<</.test(corpo)) falha(`página ${num}: /Resources fora da página`);
    let novo = /\/Font\s*<</.test(corpo)
      ? corpo.replace(/\/Font\s*<</, `/Font <</FHfMarca ${fonte} 0 R\n`)
      : corpo.replace(/\/Resources\s*<</, `/Resources <</Font <</FHfMarca ${fonte} 0 R>>\n`);
    const conteudo = corpo.match(/\/Contents\s*(\[[^\]]*\]|\d+ \d+ R)/);
    if (!conteudo) falha(`página ${num} sem /Contents`);
    const refs = conteudo[1].startsWith('[') ? conteudo[1].slice(1, -1).trim() : conteudo[1];
    novo = novo.replace(conteudo[0], `/Contents [${abre} 0 R ${refs} ${fecha} 0 R ${marca} 0 R]`);
    objetos.push([num, novo, null]);
  }

  objetos.push([fonte, '<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>', null]);
  objetos.push([abre, '<</Length 2>>\nstream\nq\n\nendstream', null]);
  objetos.push([fecha, '<</Length 2>>\nstream\nQ\n\nendstream', null]);
  for (const [caixa, num] of marcas) {
    const [x0, y0, , y1] = caixa.split(/\s+/).map(Number);
    /* Em pé, lendo de baixo para cima, perto da borda esquerda; cinza com
       contorno branco fino, para ler no papel e nas páginas escuras. */
    const antes = `q 0.45 g 1 G 0.3 w 2 Tr BT /FHfMarca 6.5 Tf 0 1 -1 0 ${x0 + 10} ${(y0 + (y1 - y0) * 0.12).toFixed(2)} Tm (`;
    const depois = ') Tj ET Q\n';
    const tamanho = bytes(antes).length + LARGURA + bytes(depois).length;
    objetos.push([num, `<</Length ${tamanho}>>\nstream\n${antes}`, `${depois}\nendstream`]);
  }
  if (info != null) {
    const corpo = lerObjeto(pdf, posicoes.get(info), info);
    if (corpo && corpo.endsWith('>>')) objetos.push([info, corpo.slice(0, -2) + '\n/Subject (', ')>>', true]);
  }

  /* A cauda: os objetos, a xref deles e o trailer que aponta o original. */
  const partes = [];
  let tam = 0;
  const pos = new Map();
  const campos = [];
  const add = s => { const b = typeof s === 'string' ? bytes(s) : s; partes.push(b); tam += b.length; };
  const base = pdf.length + 1; // o "\n" que separa o original da cauda
  add('\n');
  for (const [num, antes, depois, metadado = false] of objetos) {
    pos.set(num, base - 1 + tam);
    add(`${num} 0 obj\n${antes}`);
    if (depois !== null) { campos.push([tam, metadado]); add(Buffer.alloc(LARGURA, 0x20)); add(depois); }
    add('\nendobj\n');
  }
  const xref = pdf.length + tam;
  const nums = [...pos.keys()].sort((a, b) => a - b);
  add('xref\n0 1\n0000000000 65535 f \n');
  for (const n of nums) add(`${n} 1\n${String(pos.get(n)).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<</Size ${proximo}\n/Root ${root}${info != null ? `\n/Info ${info} 0 R` : ''}\n/Prev ${inicio}>>\nstartxref\n${xref}\n%%EOF\n`);
  return { cauda: Buffer.concat(partes), meta: { tamanho: pdf.length, campos, largura: LARGURA, paginas: paginas.length } };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const arquivo = process.argv[2] || falha('uso: node scripts/pdf-marca.mjs <arquivo.pdf>');
  const { cauda, meta } = montarCauda(readFileSync(arquivo));
  writeFileSync(arquivo + '.cauda', cauda);
  writeFileSync(arquivo + '.cauda.json', JSON.stringify(meta));
  console.log(`marca do PDF: ${meta.paginas} páginas, cauda de ${cauda.length} bytes`);
}
