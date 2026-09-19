/* O cadeado do teste final: trancado com letras faltando, aberto quando o
   alfabeto fecha - e a festa só na transição. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4408,r));
mkdirSync('.shots',{recursive:true});
const hoje=new Date().toISOString().slice(0,10);
const TODAS=['mem','tav','alef','nun','he','yod','gimel','dalet','shin','lamed','resh','vav','zayin','het','tet','samekh','ayin','tsadi','qof','bet','kaf','pe'];
const mk = ids => { const o={}; for (const id of ids) o[id]={letterId:id,stagesDone:[1,2,3,4,5],quizBest:1,quizAttempts:1,perfectBonusPaid:true,completedAt:new Date().toISOString()}; return o; };
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'M',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const base = licoes => ({version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:new Date().toISOString()},xp:900,lessons:licoes,checkpoints:{},srs:{},achievements:[],days:{[hoje]:{answered:0,units:0,xp:0,goalMet:false}},streak:{current:4,longest:5,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}});
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const erros=[];

async function cenario(nome, licoes, jaAvisado) {
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  await ctx.addInitScript(([a,st,av])=>{
    localStorage.setItem('hf-platform-local-v1',a);
    localStorage.setItem('hebraico-fluente-v1',st);
    if (av) localStorage.setItem('hf-teste-final-avisado','1');
  },[JSON.stringify(ACC),JSON.stringify(base(licoes)),jaAvisado]);
  const p=await ctx.newPage();
  p.on('console',m=>{if(m.type()==='error')erros.push(nome+': '+m.text())});
  p.on('pageerror',e=>erros.push(nome+' pageerror: '+e.message));
  await p.goto('http://127.0.0.1:4408/meu-hebraico/',{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  const trancado = await p.locator('text=/Complete todas as letras/').count();
  const festa = await p.locator('text=/Teste final desbloqueado/').count();
  const botao = await p.getByRole('link',{name:/Fazer o teste final|Refazer o teste final/}).count();
  console.log(`${nome.padEnd(22)} cadeado=${trancado?'sim':'não'} festa=${festa?'sim':'não'} botão=${botao?'sim':'não'}`);
  await p.locator('section[aria-labelledby=praticar]').screenshot({path:`.shots/final-${nome}.png`}).catch(()=>{});
  /* a rota direta também tem de respeitar o cadeado */
  await p.goto('http://127.0.0.1:4408/desafio-final/',{waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  const rotaTrancada = await p.locator('text=/ainda está trancado/').count();
  console.log(`${' '.repeat(22)} rota direta: ${rotaTrancada?'bloqueia':'deixa entrar'}`);
  await ctx.close();
}

await cenario('faltando-3', mk(TODAS.slice(0,19)), false);
await cenario('completo-primeira', mk(TODAS), false);
await cenario('completo-ja-visto', mk(TODAS), true);
console.log('erros de console:', erros.length ? erros.slice(0,3) : 'nenhum');
await b.close(); s.close();
