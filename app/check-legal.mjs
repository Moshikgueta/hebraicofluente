/* A camada de confiança, conferida.
   ────────────────────────────────────────────────────────────────────────
   Quatro perguntas, e nenhuma delas é de gosto:

     1. a identificação do fornecedor está completa? (CNPJ, razão social,
        endereço - sem isso não se vende no Brasil com segurança);
     2. as políticas existem e estão LINKADAS no rodapé? Uma política que só
        existe por URL direta não foi informada a ninguém;
     3. o checkout mostra as condições e os dois documentos antes do botão?
     4. sobrou algum dado de identificação escrito à mão fora de
        data/empresa.json? Um CNPJ em dois lugares vira dois CNPJs.

   Roda contra o EXPORT (app/out), porque é o que o visitante recebe - e não
   contra o código-fonte, que é o que o autor imagina ter escrito.

   `npm run check-legal` */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
let erros = 0, avisos = 0;

const ok = m => console.log(`  ✓ ${m}`);
const falha = m => { console.log(`  ✗ ${m}`); erros++; };
const aviso = m => { console.log(`  · ${m}`); avisos++; };

const html = rota => {
  const f = `${OUT}${rota}index.html`;
  return existsSync(f) ? readFileSync(f, 'utf8') : null;
};

/* ── 1. quem vende ──────────────────────────────────────────────────────── */
console.log('\n  IDENTIFICAÇÃO DO FORNECEDOR\n');

const empresa = JSON.parse(readFileSync('content/empresa.json', 'utf8'));

const OBRIGATORIOS = [
  ['cnpj', empresa.cnpj, 'é o que diz QUEM está vendendo'],
  ['razaoSocial', empresa.razaoSocial, 'o nome jurídico que acompanha o CNPJ'],
  ['endereco.cidade', empresa.endereco?.cidade, 'endereço do fornecedor'],
  ['contato.emailSuporte', empresa.contato?.emailSuporte, 'o canal de atendimento']
];
const DESEJAVEIS = [
  ['endereco.logradouro', empresa.endereco?.logradouro],
  ['endereco.cep', empresa.endereco?.cep],
  ['contato.telefone ou whatsapp', empresa.contato?.telefone || empresa.contato?.whatsapp],
  ['privacidade.encarregadoNome', empresa.privacidade?.encarregadoNome]
];

for (const [campo, valor, porQue] of OBRIGATORIOS) {
  if (valor) ok(`${campo}: ${valor}`);
  else falha(`${campo} está vazio - ${porQue}`);
}
for (const [campo, valor] of DESEJAVEIS) {
  if (!valor) aviso(`${campo} está vazio (não bloqueia, mas é esperado)`);
}

/* Um CNPJ tem 14 dígitos. O formato errado é o erro de digitação que passa
   despercebido justamente porque "tem cara de CNPJ". */
if (empresa.cnpj) {
  const digitos = String(empresa.cnpj).replace(/\D/g, '');
  if (digitos.length !== 14) falha(`o CNPJ tem ${digitos.length} dígitos, e não 14`);
  else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(empresa.cnpj)) {
    aviso('o CNPJ não está no formato 00.000.000/0001-00 - vai sair assim na tela');
  }
}

/* ── 2. as políticas ────────────────────────────────────────────────────── */
console.log('\n  AS PÁGINAS, E OS LINKS PARA ELAS\n');

const capa = html('/');
if (!capa) {
  falha('não achei out/index.html - rode `npm run build` antes');
} else {
  const PAGINAS = [
    ['/termos/', 'Termos de Uso'],
    ['/privacidade/', 'Política de Privacidade'],
    ['/reembolso/', 'Reembolso'],
    ['/suporte/', 'Suporte']
  ];
  for (const [rota, nome] of PAGINAS) {
    const p = html(rota);
    if (!p) { falha(`${rota} não foi gerada`); continue; }
    if (p.length < 3000) { falha(`${rota} saiu quase vazia (${p.length} bytes)`); continue; }
    /* Linkada no RODAPÉ da capa, e não só existindo: uma política que não
       aparece na página que vende não foi informada a quem compra. */
    if (!capa.includes(`href="${rota}"`)) falha(`${nome} existe, mas não está linkada na capa`);
    else ok(`${rota} gerada e linkada na capa`);
  }

  /* A identificação do fornecedor tem de aparecer no site público. */
  if (empresa.cnpj && !capa.includes(empresa.cnpj)) {
    falha('o CNPJ não aparece na capa - a identificação precisa estar visível');
  } else if (empresa.cnpj) {
    ok('o CNPJ aparece na capa');
  }
}

/* ── 3. o checkout ──────────────────────────────────────────────────────── */
console.log('\n  O CHECKOUT\n');

const checkout = html('/checkout/alfabetizacao/');
if (!checkout) {
  falha('/checkout/alfabetizacao/ não foi gerada');
} else {
  const PEDACOS = [
    ['Condições desta compra', 'o bloco de condições antes do botão'],
    ['href="/termos/"', 'o link para os Termos'],
    ['href="/privacidade/"', 'o link para a Política de Privacidade'],
    ['href="/reembolso/"', 'o link para a política de reembolso']
  ];
  for (const [agulha, oQue] of PEDACOS) {
    if (checkout.includes(agulha)) ok(oQue);
    else falha(`falta ${oQue} no checkout`);
  }
}

/* ── 4. nada escrito à mão ──────────────────────────────────────────────── */
console.log('\n  FONTE ÚNICA\n');

/* Um CNPJ ou um e-mail de suporte digitado direto num componente é o começo
   de dois valores diferentes para a mesma coisa. Estes padrões procuram
   exatamente isso no código-fonte. */
const fontes = [];
(function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) varrer(p);
    else if (/\.(tsx?|mjs)$/.test(nome)) fontes.push(p);
  }
})('src');

const CNPJ_SOLTO = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/;
/* Qualquer e-mail literal, e não um domínio específico: o endereço de contato
   já mudou uma vez nesta sessão, e um check preso a um domínio deixaria de
   cobrar exatamente quando o dado passasse a divergir. Os de teste ficam de
   fora - `.invalid` e `.test` são reservados para isso -, e `@exemplo.` também:
   é o texto-fantasma de um campo de formulário, não um canal de atendimento. */
const EMAIL_SOLTO = /[\w.%+-]+@[\w.-]+\.[a-z]{2,}/i;
const EMAIL_DE_TESTE = /@(?:[\w.-]*\.)?(?:invalid|test|example\.com)\b|@exemplo\./i;
let soltos = 0;
for (const f of fontes) {
  const txt = readFileSync(f, 'utf8');
  /* `lib/empresa.ts` fica de fora das duas buscas: é ele QUEM lê o dado, e o
     CNPJ de exemplo no comentário dele explica o formato. */
  if (f.endsWith('lib/empresa.ts')) continue;
  if (CNPJ_SOLTO.test(txt)) { falha(`CNPJ escrito à mão em ${f}`); soltos++; }
  /* O e-mail aparece legitimamente em data/ e no módulo que o lê. Em
     qualquer outro lugar é uma segunda fonte da verdade. */
  for (const linha of txt.split('\n')) {
    const m = linha.match(EMAIL_SOLTO);
    if (m && !EMAIL_DE_TESTE.test(m[0])) {
      aviso(`e-mail escrito à mão em ${f}: ${m[0]} - devia vir de lib/empresa.ts`);
      soltos++;
      break;
    }
  }
}
if (!soltos) ok('nenhum dado de identificação escrito à mão fora de data/empresa.json');

/* ── o veredito ─────────────────────────────────────────────────────────── */
console.log('');
if (erros) {
  console.log(`  ${erros} problema(s) e ${avisos} aviso(s).`);
  console.log('  Os ✗ impedem vender com segurança no Brasil. Ver data/empresa.json.\n');
  process.exit(1);
}
console.log(`  Camada de confiança completa${avisos ? `, com ${avisos} aviso(s)` : ''}.\n`);
