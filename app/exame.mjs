/* O exame final, no navegador.
   ────────────────────────────────────────────────────────────────────────
   Abre com o alfabeto fechado, confere que as partes prometidas aparecem - a
   nova "As letras difíceis" entre elas - e responde questão a questão,
   sempre pela alternativa errada: o caminho da nota baixa é o que ninguém
   testa à mão e é o que mais gente vai percorrer.

   LIMITE CONHECIDO: o roteiro não vence os itens de PAREAMENTO ("Ligue cada
   letra ao seu som"). Eles só fecham quando todos os pares estão certos, e
   resolver isso às cegas exigiria ler o gabarito - um roteiro que sabe a
   resposta deixa de testar a tela e passa a testar a si mesmo. Quando ele
   para num pareamento, imprime onde parou: até ali, o que interessa é que
   nenhuma questão travou e que o console ficou limpo. A composição do exame
   em si é coberta por app/tests/exam.test.ts. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4411,r));
mkdirSync('.shots',{recursive:true});
const hoje=new Date().toISOString().slice(0,10);
const TODAS=['mem','tav','alef','nun','he','yod','gimel','dalet','shin','lamed','resh','vav','zayin','het','tet','samekh','ayin','tsadi','qof','bet','kaf','pe'];
const L={}; for(const id of TODAS) L[id]={letterId:id,stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()};
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'M',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:new Date().toISOString()},xp:900,lessons:L,checkpoints:{},srs:{},achievements:[],days:{[hoje]:{answered:0,units:0,xp:0,goalMet:false}},streak:{current:4,longest:5,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};

const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
const p=await ctx.newPage(); const erros=[];
p.on('console',m=>{if(m.type()==='error')erros.push(m.text())});
p.on('pageerror',e=>erros.push('pageerror: '+e.message));

await p.goto('http://127.0.0.1:4411/desafio-final/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);

const partes = await p.locator('h2, h3').allInnerTexts();
const temDificeis = partes.some(t=>/letras dif/i.test(t)) ||
  await p.locator('text=/As letras difíceis/').count() > 0;
console.log('\n  EXAME FINAL');
console.log('  parte "As letras difíceis" na abertura:', temDificeis ? 'sim' : 'NÃO');
await p.screenshot({path:'.shots/exame-abertura.png',fullPage:true});

/* Começa e responde tudo. Sempre a última alternativa; onde houver campo de
   texto, escreve uma bobagem; onde houver banco de palavras, clica no
   primeiro pedaço até dar para continuar. */
const comecar = p.getByRole('button',{name:/Começar|Iniciar|Fazer o exame|Começar o exame/}).first();
if (await comecar.count()) { await comecar.click(); await p.waitForTimeout(600); }

let passos = 0, questoes = 0;
/* Detector de tela parada. O sinal de vida é uma QUESTÃO respondida, e não o
   título da tela: dentro de uma parte o título é o mesmo em todas as
   questões, e olhar para ele faria o roteiro desistir no meio de uma parte
   que estava indo bem. */
let ultimaQ = 0, parado = 0;
const limite = Date.now() + 180_000;
for (; passos < 400 && Date.now() < limite; passos++) {
  if (questoes === ultimaQ) { if (++parado > 25) break; } else { ultimaQ = questoes; parado = 0; }
  if (await p.locator('text=/de 3[0-9] ·|Relatório|seu resultado|Você lê hebraico|Aprovado|Ainda não/i').count()
      && await p.getByRole('button',{name:/^(Continuar|Ver resultado|Próxima parte|Começar)/}).count() === 0) break;

  const seguir = p.getByRole('button',{name:/^(Continuar|Ver resultado|Próxima parte|Começar a parte|Começar)$/});
  if (await seguir.count()) { await seguir.first().click(); await p.waitForTimeout(260); continue; }

  /* "Ligue cada X ao seu Y": duas colunas de botões, uma escolha de cada
     lado por par. Clicar um botão qualquer não resolve, e sem este ramo o
     roteiro fica batendo na mesma tela para sempre. */
  /* "Ligue cada X ao seu Y": só termina quando TODOS os pares estão certos -
     um par errado pisca e fica. Não há como responder errado de propósito,
     então o roteiro resolve por força bruta: para cada item da esquerda,
     tenta os da direita até o botão desabilitar (que é o sinal de par
     fechado). São quatro pares, então no pior caso dezesseis tentativas. */
  const tabuleiro = p.locator('div.grid-cols-2:has(li button)').last();
  if (await p.locator('text=/Ligue cada/').count() && await tabuleiro.count()) {
    const esq = tabuleiro.locator('> div').nth(0).locator('li button');
    const dir = tabuleiro.locator('> div').nth(1).locator('li button');
    const n = await esq.count();
    for (let i = 0; i < n; i++) {
      if (await esq.nth(i).isDisabled().catch(()=>true)) continue;
      for (let j = 0; j < n; j++) {
        if (await dir.nth(j).isDisabled().catch(()=>true)) continue;
        await esq.nth(i).click({timeout:4000}).catch(()=>{});
        await p.waitForTimeout(70);
        await dir.nth(j).click({timeout:4000}).catch(()=>{});
        await p.waitForTimeout(120);
        if (await esq.nth(i).isDisabled().catch(()=>false)) break;
      }
    }
    /* Só conta como respondida se o tabuleiro REALMENTE fechou. Contar a
       tentativa faria o detector de tela parada nunca disparar, e o roteiro
       giraria até o relógio - relatando um número de questões que não
       aconteceram. */
    await p.waitForTimeout(500);
    if (!await p.locator('text=/Ligue cada/').count()) questoes++;
    continue;
  }

  const campo = p.locator('input[type="text"]:visible');
  if (await campo.count()) {
    await campo.first().fill('xyz');
    const env = p.getByRole('button',{name:/Responder|Conferir|Verificar/});
    if (await env.count()) { await env.first().click(); questoes++; await p.waitForTimeout(300); continue; }
  }

  const ops = p.locator('li button:visible, [role="listitem"] button:visible');
  const n = await ops.count();
  if (n) { await ops.nth(n-1).click().catch(()=>{}); questoes++; await p.waitForTimeout(300); continue; }

  const qualquer = p.locator('button:visible');
  if (await qualquer.count()) { await qualquer.last().click().catch(()=>{}); await p.waitForTimeout(300); continue; }
  break;
}

const chegouAoFim = await p.locator('text=/Ainda não|Aprovado|Você lê hebraico/').count() > 0;
if (!chegouAoFim) {
  /* Diagnóstico: quando o roteiro não chega ao fim, o que interessa é em que
     tela ele ficou preso, e não quantas vezes clicou. */
  const titulo = await p.locator('h1, h2').first().innerText().catch(()=>'?');
  const botoes = await p.locator('button:visible').allInnerTexts();
  console.log('  PRESO EM:', titulo.replace(/\s+/g,' '));
  console.log('  botões visíveis:', botoes.map(t=>t.replace(/\s+/g,' ').slice(0,28)).slice(0,12));
}

await p.waitForTimeout(800);
await p.screenshot({path:'.shots/exame-relatorio.png',fullPage:true});
const chegou = await p.locator('text=/Ainda não|Aprovado|Você lê hebraico/').count();
const partesNoRelatorio = await p.locator('text=/As letras difíceis/').count();
console.log(`  passos: ${passos}, questões respondidas: ${questoes}`);
console.log('  chegou ao relatório:', chegou ? 'sim' : 'não (parou num pareamento - ver o cabeçalho)');
console.log('  "As letras difíceis" no relatório:', partesNoRelatorio ? 'sim' : 'não (parte foi bem)');
console.log('  erros de console:', erros.length ? erros.slice(0,3) : 'nenhum', '\n');
await b.close(); s.close();
