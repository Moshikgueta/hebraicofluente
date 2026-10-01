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
import { execFileSync } from 'node:child_process';
import { DOCUMENTOS, textoDe, trechoDoDocumento, versaoDe } from './versoes.mjs';

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
  /* ME: dispensada de indicar encarregado (Resolução CD/ANPD nº 2/2022). */
  ['privacidade.encarregadoNome', empresa.privacidade?.encarregadoNome || empresa.privacidade?.agentePequenoPorte]
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
    ['/suporte/', 'Suporte'],
    /* LBI art. 63: a Declaração de Acessibilidade também (LEGAL-123). */
    ['/acessibilidade/', 'Declaração de Acessibilidade']
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

/* ── 3b. a desistência, onde se decide ──────────────────────────────────── */
console.log('\n  A DESISTÊNCIA NA VITRINE\n');

/* O direito de desistir em N dias com 100% de volta (CDC art. 49) é o maior
   redutor de risco do site, e até 01/10/2026 ele só aparecia depois do clique:
   checkout, /suporte e um acordeão de /faq (auditoria, CONV-001). Agora a
   frase mora na caixa de preço da capa e na da página do curso, com o N de
   data/empresa.json - o mesmo que a Política de Reembolso lê. Conferir no
   HTML, e não no componente: é a frase que o visitante recebe. */
{
  const N = empresa.politicas?.arrependimentoDias;
  if (!N) {
    falha('politicas.arrependimentoDias está vazio em data/empresa.json');
  } else {
    /* O React separa `{N}` do texto ao lado com um comentário vazio no HTML
       gerado ("7<!-- --> dias"); a frase lida pelo visitante é a mesma. */
    const FRASE = new RegExp(`\\b${N}(?:<!-- -->)? dias para desistir e receber 100% de volta, sem justificar\\.`);
    for (const [rota, onde] of [['/', 'a caixa de preço da capa'], ['/cursos/alfabetizacao/', 'a caixa de preço do curso']]) {
      const p = html(rota);
      if (!p) { falha(`${rota} não foi gerada`); continue; }
      if (FRASE.test(p)) ok(`${onde} diz "${N} dias para desistir e receber 100% de volta, sem justificar."`);
      else falha(`${onde} (${rota}) não diz "${N} dias para desistir e receber 100% de volta, sem justificar."`);
    }
  }
}

/* ── 3c. a data do pré-lançamento ───────────────────────────────────────── */
console.log('\n  O PRÉ-LANÇAMENTO\n');

/* O site escreve "Preço de pré-lançamento até 31/10/2026. Depois, R$ 297" a
   partir de `price.preLancamentoAte` e `price.listBrl`, e nada no código
   compara essa data com hoje (auditoria de 01/10/2026, PAY-B-001). Passada a
   data, a frase vira um preço de referência que nunca chegou. A regra de
   preço é decisão do dono e não muda aqui: este bloco só impede publicar com
   a data vencida, e avisa quando ela se aproxima.

   A função é CÓPIA de src/lib/pre-lancamento.ts (este script não monta
   TypeScript). tests/pre-lancamento.test.ts lê o trecho entre os marcadores
   e o põe à prova com a mesma tabela que o módulo. */
/* inicio estadoDoPreLancamento */
const DIAS_DE_AVISO = 10;
function estadoDoPreLancamento(price, hoje) {
  const fim = price.preLancamentoAte;
  if (price.listBrl === null || price.listBrl === undefined) return 'ok';
  if (!fim || !/^\d{4}-\d{2}-\d{2}$/.test(fim)) return 'ok';
  const dia = typeof hoje === 'string' ? hoje : hoje.toISOString().slice(0, 10);
  const faltam = Math.round((Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${dia}T00:00:00Z`)) / 86_400_000);
  if (faltam < 0) return 'vencido';
  if (faltam <= DIAS_DE_AVISO) return 'avisa';
  return 'ok';
}
/* fim estadoDoPreLancamento */
{
  const brDe = iso => iso.split('-').reverse().join('/');
  const hoje = new Date().toISOString().slice(0, 10);
  const { courses } = JSON.parse(readFileSync('content/courses.json', 'utf8'));
  let comData = 0;
  for (const c of courses) {
    if (!c.price?.preLancamentoAte || c.price.listBrl == null) continue;
    comData++;
    const fim = c.price.preLancamentoAte;
    const estado = estadoDoPreLancamento(c.price, hoje);
    if (estado === 'vencido') {
      falha(`O pré-lançamento de ${c.slug} terminou em ${brDe(fim)} e o site ainda anuncia a data e o preço cheio. ` +
            'A virada automática (workflow virar-preco.yml) não rodou: rode-o à mão em Actions. Ver audit/2026-10-01 PAY-B-001.');
    } else if (estado === 'avisa') {
      aviso(`o pré-lançamento de ${c.slug} termina em ${brDe(fim)} (hoje é ${brDe(hoje)}): ` +
            'decida antes o que acontece com o preço - subir para listBrl, estender preLancamentoAte ou tirar os dois. ' +
            'Ver audit/2026-10-01 PAY-B-001.');
    } else {
      ok(`${c.slug}: pré-lançamento até ${brDe(fim)}, ainda em vigor`);
    }
  }
  if (!comData) ok('nenhum curso anuncia data de fim de pré-lançamento');
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

/* ── 5. o crédito ao método de origem ───────────────────────────────────── */
console.log('\n  O CRÉDITO AO MÉTODO DE ORIGEM\n');

/* O curso parte do método do autor de בא לי עברית, e o site reconhece isso no
   rodapé de toda página pública. Um crédito assim não pode depender de
   ninguém lembrar dele: some num refatoramento de rodapé sem que nenhum teste
   de unidade note, e some em silêncio - que é a única forma de sumir que
   importa aqui. Então é conferido no HTML publicado, página por página.

   O nome sai de src/lib/credito.ts, lido aqui como texto: este script não
   monta o TypeScript, e um segundo lugar com o nome digitado à mão é
   exatamente o que a última regra abaixo existe para impedir. */
const credito = readFileSync('src/lib/credito.ts', 'utf8');
const AUTOR = credito.match(/autor:\s*'([^']+)'/)?.[1];
const OBRA = credito.match(/obraHe:\s*'([^']+)'/)?.[1];

if (!AUTOR || !OBRA) {
  falha('não consegui ler autor/obraHe de src/lib/credito.ts');
} else {
  /* As mesmas páginas livres do numeros.mjs: a vitrine, que é onde o rodapé
     público aparece. As pagas ficam de fora porque usam outra casca. */
  const LIVRES = [
    '/', '/metodo/', '/cursos/', '/cursos/alfabetizacao/', '/sobre/', '/faq/',
    '/biblia/', '/termos/', '/privacidade/', '/reembolso/', '/suporte/'
  ];
  const sem = LIVRES.filter(r => { const p = html(r); return p && !p.includes(AUTOR); });
  if (sem.length) falha(`o crédito a ${AUTOR} não aparece em: ${sem.join(' ')}`);
  else ok(`o crédito a ${AUTOR} aparece nas ${LIVRES.length} páginas livres`);

  /* A página Sobre é onde o crédito é explicado, e não só assinado. */
  const sobre = html('/sobre/');
  if (sobre && sobre.includes(OBRA)) ok('/sobre/ nomeia a obra de origem em hebraico');
  else falha('a página /sobre/ não nomeia a obra de origem em hebraico');

  /* E o nome mora num arquivo só. Escrevê-lo direto numa tela é o mesmo
     defeito do CNPJ em dois lugares, com o agravante de ser o nome de uma
     pessoa. */
  const copias = fontes.filter(f =>
    !f.endsWith('lib/credito.ts') && readFileSync(f, 'utf8').includes(AUTOR));
  if (copias.length) falha(`o nome do autor está escrito à mão em: ${copias.join(' ')}`);
  else ok('o nome do autor vem de src/lib/credito.ts, e de lugar nenhum mais');
}

/* ── 6. o parcelamento, sempre com os juros (LEGAL-102) ──────────────────── */
console.log('\n  O PARCELAMENTO\n');

/* "Em até 12x" sozinho é lido como "sem juros", e aqui há juros (da Mercado
   Pago, pagos pelo comprador). Toda página do export, no texto que o
   visitante lê (sem os <script>): cada "12x" precisa ter "juros" a até 120
   caracteres. A frase sai de `parcelasTexto()`/`parcelasCurto()` em
   src/lib/empresa.ts. */
const paginasDoExport = [];
(function varrerOut(dir) {
  if (!existsSync(dir)) return;
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) { if (nome !== '_next') varrerOut(p); }
    else if (nome.endsWith('.html')) paginasDoExport.push(p);
  }
})(OUT);
const visivel = h => textoDe(h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' '));
{
  const semJuros = [];
  let vistos = 0;
  for (const f of paginasDoExport) {
    const t = visivel(readFileSync(f, 'utf8'));
    for (const m of t.matchAll(/\b\d{1,2} ?[x×](?![a-zà-ú])/gi)) {
      vistos++;
      const perto = t.slice(Math.max(0, m.index - 120), m.index + m[0].length + 120);
      if (!/juros/i.test(perto)) { semJuros.push(`${f.slice(OUT.length)}: "...${t.slice(Math.max(0, m.index - 40), m.index + 40)}..."`); }
    }
  }
  if (semJuros.length) {
    for (const x of semJuros.slice(0, 10)) falha(`parcelamento sem "juros" no mesmo trecho - ${x}`);
  } else ok(`${vistos} menção(ões) a parcelas no export, todas com "juros" no mesmo trecho`);
}

/* ── 7. a versão de cada política (LEGAL-104 e LEGAL-123) ──────────────────── */
console.log('\n  A VERSÃO DE CADA POLÍTICA\n');

/* A versão aceita no cadastro e gravada no pedido é o código do TEXTO
   publicado (app/versoes.mjs). Três perguntas por documento: o código de
   data/politicas-versoes/atual.json é o do texto deste export? A cópia fixa
   dessa versão existe e foi publicada em /<doc>/v/<versao>/? Ela está no git
   (é o que a faz durar mais do que esta publicação)? */
{
  const ATUAL = '../data/politicas-versoes/atual.json';
  const atual = existsSync(ATUAL) ? JSON.parse(readFileSync(ATUAL, 'utf8')) : {};
  const emCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
  for (const [doc] of DOCUMENTOS) {
    const p = html(`/${doc}/`);
    const trecho = p && trechoDoDocumento(p, doc);
    if (!trecho) { falha(`/${doc}/ sem <article data-politica="${doc}"> - a versão não tem de onde sair`); continue; }
    const v = versaoDe(textoDe(trecho));
    if (atual[doc] !== v) {
      falha(`${doc}: o texto publicado é a versão ${v}, e atual.json diz ${atual[doc] || '(nada)'} - rode \`npm run build\` (versoes.mjs)`);
      continue;
    }
    const guardado = `../data/politicas-versoes/${doc}-${v}.html`;
    if (!existsSync(guardado)) { falha(`${doc}: falta a cópia fixa ${guardado}`); continue; }
    if (!existsSync(`${OUT}/${doc}/v/${v}/index.html`)) { falha(`${doc}: a cópia fixa não foi publicada em /${doc}/v/${v}/`); continue; }
    let noGit = true;
    try { execFileSync('git', ['ls-files', '--error-unmatch', guardado], { stdio: 'ignore' }); }
    catch { noGit = false; }
    if (noGit) ok(`${doc}: versão ${v}, com cópia fixa em /${doc}/v/${v}/ e no git`);
    else if (emCI) aviso(`${doc}: a versão ${v} desta publicação não está no git - ver RUNBOOK-ATENDIMENTO.md`);
    else falha(`${doc}: a versão ${v} é nova - faça commit de ${guardado.slice(3)} e de data/politicas-versoes/atual.json`);
  }
}

/* ── 8. os Termos e a FAQ dizem o que o checkout cobra (LEGAL-103/123) ────── */
console.log('\n  AS FORMAS DE PAGAMENTO NO TEXTO\n');

/* O build reescreve `pagamento.formas` com o que a Mercado Pago aceita (e o
   modo, quando a credencial cai). Cada página que fala de pagamento tem de
   acompanhar - inclusive o contrato. Mesma regra de src/lib/empresa.ts. */
{
  const pg = empresa.pagamento || {};
  const soPix = pg.modo === 'pix-direto';
  const temPix = soPix ? true : (pg.formas ? !!pg.formas.pix : true);
  const temCartao = soPix ? false : (pg.formas ? !!pg.formas.cartao : true);
  const confirma = pg.modo === 'mercadopago';
  const REGRAS = [
    ...(temPix ? [] : [[/\bno PIX\b|pelo PIX|pagando por PIX/i, 'oferece PIX, que esta publicação não tem']]),
    ...(temCartao ? [] : [[/parcelad|\b\d{1,2} ?[x×](?![a-zà-ú])/i, 'oferece parcelamento, que esta publicação não tem']]),
    ...(confirma ? [] : [[/Acesso imediato|normalmente em minutos|em alguns minutos|liberado automaticamente|Acesso liberado na hora/i,
                          'promete liberação imediata, e no PIX direto a liberação é à mão']])
  ];
  const ROTAS = ['/', '/cursos/alfabetizacao/', '/checkout/alfabetizacao/', '/termos/', '/faq/', '/suporte/', '/reembolso/'];
  let achados = 0;
  for (const rota of ROTAS) {
    const p = html(rota);
    if (!p) continue;
    const t = visivel(p);
    for (const [re, oQue] of REGRAS) {
      const m = t.match(re);
      if (m) { falha(`${rota} ${oQue}: "...${t.slice(Math.max(0, m.index - 40), m.index + 50)}..."`); achados++; }
    }
  }
  if (!achados) ok(`modo ${pg.modo}, PIX ${temPix ? 'sim' : 'não'}, cartão ${temCartao ? 'sim' : 'não'}: ` +
                   `${ROTAS.length} páginas de venda e de contrato coerentes`);
}

/* ── o veredito ─────────────────────────────────────────────────────────── */
console.log('');
if (erros) {
  console.log(`  ${erros} problema(s) e ${avisos} aviso(s).`);
  console.log('  Os ✗ impedem vender com segurança no Brasil. Ver data/empresa.json.\n');
  process.exit(1);
}
console.log(`  Camada de confiança completa${avisos ? `, com ${avisos} aviso(s)` : ''}.\n`);
