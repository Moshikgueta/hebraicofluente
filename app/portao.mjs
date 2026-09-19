/* O portão de domínio: erra o mini-teste de propósito e confere que o curso
   oferece reforço em vez de deixar passar - e que não tranca. A letra é o
   Tav, cujo mini-teste é todo de escolha (dá para responder pelo teclado). */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4407,r));
mkdirSync('.shots',{recursive:true});
const hoje=new Date().toISOString().slice(0,10);
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'M',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:new Date().toISOString()},xp:50,lessons:{mem:{letterId:'mem',stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()}},checkpoints:{},srs:{},achievements:[],days:{[hoje]:{answered:0,units:0,xp:0,goalMet:false}},streak:{current:1,longest:1,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
const p=await ctx.newPage();
const erros=[]; p.on('console',m=>{if(m.type()==='error')erros.push(m.text())}); p.on('pageerror',e=>erros.push('pageerror: '+e.message));
await p.goto('http://127.0.0.1:4407/licao/tav/',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
await p.getByRole('button',{name:/Etapa 5 de 5/}).click();
await p.waitForTimeout(500);
/* Responde sempre a ÚLTIMA alternativa: erra quase tudo de propósito. */
for (let k=0;k<20;k++){
  const cont = p.getByRole('button',{name:/^(Continuar|Ver resultado)$/});
  if (await cont.count()) { await cont.click(); await p.waitForTimeout(350); continue; }
  const ops = p.locator('li button');
  const n = await ops.count();
  if (!n) break;
  await ops.nth(n-1).click().catch(()=>{});
  await p.waitForTimeout(400);
}
await p.waitForTimeout(700);
await p.screenshot({path:'.shots/portao-nota.png',fullPage:true});
const nota = await p.locator('text=/de 5 ·/').first().innerText().catch(()=>'?');
console.log('nota:', nota);
const ofereceu = await p.getByRole('button',{name:/Praticar mais um pouco/}).count();
console.log('ofereceu reforço:', ofereceu ? 'sim' : 'não');
const podeSeguir = await p.getByRole('button',{name:/Próxima letra|Ir para o Checkpoint|Voltar ao mapa/}).count();
console.log('segue sem travar:', podeSeguir ? 'sim' : 'NÃO - travou');
if (ofereceu) {
  await p.getByRole('button',{name:/Praticar mais um pouco/}).click();
  await p.waitForTimeout(800);
  await p.screenshot({path:'.shots/portao-reforco.png',fullPage:true});
  console.log('tela de reforço:', await p.locator('text=/Vamos praticar mais um pouco/').count() ? 'ok' : 'não apareceu');
  console.log('questões do reforço saem dos erros:', await p.locator('text=/Reforço/').count() ? 'rotulado' : '?');
}
console.log('erros de console:', erros.length ? erros.slice(0,2) : 'nenhum');
await b.close(); s.close();
