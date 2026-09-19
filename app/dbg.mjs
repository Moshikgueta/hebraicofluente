import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4405,r));
const hoje=new Date().toISOString().slice(0,10);
const licoes={}; for (const id of ['mem','tav','alef','nun','he','yod']) licoes[id]={letterId:id,stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()};
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'M',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:new Date().toISOString()},xp:0,lessons:licoes,checkpoints:{},srs:{},achievements:[{id:'primeira-letra',unlockedAt:new Date().toISOString()},{id:'primeira-palavra-lida',unlockedAt:new Date().toISOString()}],days:{[hoje]:{answered:0,units:0,xp:0,goalMet:false}},streak:{current:1,longest:1,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const ctx=await b.newContext({viewport:{width:900,height:1100}});
await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
const p=await ctx.newPage();
p.on('pageerror',e=>console.log('PAGEERROR', e.message));
await p.goto('http://127.0.0.1:4405/academia/?jogo=match',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
const textos = await p.locator('ul li button').allInnerTexts();
console.log('cartas:', JSON.stringify(textos));
// clica a 1ª e depois cada uma, reportando o contador
for (let j=1;j<textos.length;j++){
  await p.locator('ul li button').nth(0).click();
  await p.waitForTimeout(120);
  await p.locator('ul li button').nth(j).click();
  await p.waitForTimeout(700);
  const cont = await p.locator('text=/\\d+ \\/ 6/').first().innerText().catch(()=>'?');
  const desab = await p.locator('ul li button[disabled]').count();
  console.log(`0 x ${j} (${textos[j].trim()}) -> ${cont}, sumiram: ${desab}`);
  if (desab) break;
}
await b.close(); s.close();
