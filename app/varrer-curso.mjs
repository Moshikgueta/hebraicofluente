/* A mesma varredura, mas nas rotas do curso - que exigem conta e progresso. */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4403,r));
const hoje=new Date().toISOString().slice(0,10);
const ACC={v:1,accounts:{'demo@hf.test':{id:'acc_demo',name:'Moshik',email:'demo@hf.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'demo'}],orders:[]}},current:'demo@hf.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'Moshik',completedAt:new Date().toISOString()},xp:340,lessons:{mem:{letterId:'mem',stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()},tav:{letterId:'tav',stagesDone:[1,2,3,4,5],quizBest:.9,quizAttempts:2,perfectBonusPaid:false,completedAt:new Date().toISOString()},alef:{letterId:'alef',stagesDone:[1,2],quizBest:null,quizAttempts:0,perfectBonusPaid:false,completedAt:null}},checkpoints:{},srs:{tav:{itemId:'tav',letterId:'tav',box:1,misses:2,hits:1,dueOn:hoje,lastSeen:hoje,skill:'ler'},mem:{itemId:'mem',letterId:'mem',box:0,misses:1,hits:0,dueOn:hoje,lastSeen:hoje,skill:'som'}},achievements:[{id:'primeira-letra',unlockedAt:new Date().toISOString()}],days:{[hoje]:{answered:12,units:3,xp:120,goalMet:false}},streak:{current:3,longest:5,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};
const ROTAS=['/meu-hebraico/','/mapa/','/revisao/','/academia/','/conquistas/','/perfil/','/licao/alef/','/modulo/6/','/inicio/','/historia/','/desafio-final/','/onboarding/'];
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
let ruim=0;
for (const w of [390,1280]) {
  const ctx=await b.newContext({viewport:{width:w,height:900}});
  await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
  const p=await ctx.newPage();
  for (const rota of ROTAS) {
    const erros=[]; p.removeAllListeners('console');
    p.on('console', m=>{ if(m.type()==='error') erros.push(m.text()); });
    await p.goto(`http://127.0.0.1:4403${rota}`,{waitUntil:'networkidle'});
    await p.waitForTimeout(500);
    const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,h:document.documentElement.scrollHeight}));
    const over=m.sw>m.iw+1;
    if(over||erros.length) ruim++;
    console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} ${String(m.h).padStart(6)}px ${over?'OVERFLOW '+m.sw:'ok'} ${erros[0]?'ERRO: '+erros[0].slice(0,70):''}`);
  }
  await ctx.close();
}
console.log(ruim===0?'tudo limpo':`${ruim} problema(s)`);
await b.close(); s.close();
