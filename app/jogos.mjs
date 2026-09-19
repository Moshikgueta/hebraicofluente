/* Percorre os três jogos de ponta a ponta, num telefone. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4404,r));
mkdirSync('.shots',{recursive:true});
const hoje=new Date().toISOString().slice(0,10);
const licoes={}; for (const id of ['mem','tav','alef','nun','he','yod']) licoes[id]={letterId:id,stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()};
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'Moshik',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'Moshik',completedAt:new Date().toISOString()},xp:340,lessons:licoes,checkpoints:{},srs:{},achievements:[],days:{[hoje]:{answered:12,units:6,xp:120,goalMet:false}},streak:{current:3,longest:5,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
const p=await ctx.newPage();
const erros=[]; p.on('console',m=>{if(m.type()==='error')erros.push(m.text())}); p.on('pageerror',e=>erros.push('pageerror: '+e.message));

await p.goto('http://127.0.0.1:4404/academia/',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
await p.screenshot({path:'.shots/jogos-menu.png',fullPage:true});
console.log('menu:', await p.locator('text=Jogos rápidos').count() ? 'ok' : 'SEM PRATELEIRA');

/* MATCH: resolve o tabuleiro inteiro tocando em pares até acabar. */
await p.goto('http://127.0.0.1:4404/academia/?jogo=match',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.screenshot({path:'.shots/jogo-match.png',fullPage:true});
console.log('match cartões:', await p.locator('ul li button').count());
/* Resolve o tabuleiro: para cada rodada, fixa o primeiro cartão livre e
   tenta os seguintes até um par sair. Importante NÃO reclicar o primeiro
   entre as tentativas - isso o desmarca, e o toque seguinte vira uma nova
   seleção em vez de uma tentativa. */
for (let volta = 0; volta < 12; volta++) {
  const n = await p.locator('ul li button:not([disabled])').count();
  if (n < 2) break;
  let casou = false;
  for (let j = 1; j < n; j++) {
    await p.locator('ul li button:not([disabled])').nth(0).click().catch(() => {});
    await p.waitForTimeout(120);
    await p.locator('ul li button:not([disabled])').nth(j).click().catch(() => {});
    await p.waitForTimeout(620);
    if (await p.locator('ul li button:not([disabled])').count() < n) { casou = true; break; }
  }
  if (!casou) break;
  if (await p.locator('text=Mais uma').count()) break;
}
await p.waitForTimeout(1200);
await p.screenshot({path:'.shots/jogo-match-fim.png',fullPage:true});
console.log('match terminou:', await p.locator('text=Mais uma').count() ? 'ok' : 'NÃO chegou ao fim');

/* BLAST: responde 12 pelo teclado. */
await p.goto('http://127.0.0.1:4404/academia/?jogo=blast',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.screenshot({path:'.shots/jogo-blast.png',fullPage:true});
for (let k=0;k<26 && !(await p.locator('text=Mais uma').count());k++){ await p.keyboard.press(String(1+(k%4))); await p.waitForTimeout(1500); }
await p.waitForTimeout(600);
console.log('blast terminou:', await p.locator('text=Mais uma').count() ? 'ok' : 'não chegou ao fim');
await p.screenshot({path:'.shots/jogo-blast-fim.png',fullPage:true});

/* TESTE: escolhe e confirma dez vezes. */
await p.goto('http://127.0.0.1:4404/academia/?jogo=teste',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.screenshot({path:'.shots/jogo-teste.png',fullPage:true});
for (let k=0;k<12;k++){
  const op = p.locator('ul li button');
  if (!(await op.count())) break;
  await op.nth(k%2).click().catch(()=>{});
  await p.waitForTimeout(120);
  const btn = p.getByRole('button',{name:/Confirmar e continuar|Terminar o teste/});
  if (!(await btn.count())) break;
  await btn.click();
  await p.waitForTimeout(250);
}
await p.waitForTimeout(500);
await p.screenshot({path:'.shots/jogo-teste-fim.png',fullPage:true});
console.log('teste terminou:', await p.locator('text=Teste concluído').count() ? 'ok' : 'não chegou ao fim');
console.log('erros de console:', erros.length ? erros.slice(0,3) : 'nenhum');
await b.close(); s.close();
