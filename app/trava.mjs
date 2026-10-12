/* A trava de progressão, no navegador.
   ─────────────────────────────────────────────────────────────────────────
   O cadeado no mapa é o aviso; a porta é esta. O que se mede aqui:

     · uma letra adiante, aberta PELO ENDEREÇO, não entrega a lição;
     · a tela diz qual letra falta e o que falta nela;
     · a letra atual e as já feitas continuam abrindo normalmente;
     · quem já tem progresso adiante não é expulso - a trava nunca tira o
       que já foi dado;
     · o mapa desenha cadeado no que está trancado e anel no "você está
       aqui".

   Precisa do `out/` em modo local. node trava.mjs (de dentro de app/). */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f)||f.endsWith('/'))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4449,r));
const BASE='http://127.0.0.1:4449';
const agora=new Date().toISOString();
const ACC={v:1,accounts:{'demo@hf.test':{id:'acc_demo',name:'M',email:'demo@hf.test',createdAt:agora,pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:agora,expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'demo'}],orders:[]}},current:'demo@hf.test'};
const licao=(id,etapas,nota)=>({letterId:id,stagesDone:Array.from({length:etapas},(_,i)=>i+1),quizBest:nota,quizAttempts:nota==null?0:1,perfectBonusPaid:false,completedAt:etapas>=5?agora:null});
const base=l=>({version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:agora},xp:100,lessons:l,checkpoints:{},srs:{},achievements:[],days:{},streak:{current:1,longest:1,lastDay:null},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}});

let falhas=0;
const ok=m=>console.log(`  ✓ ${m}`);
const erro=m=>{console.log(`  ✗ ${m}`);falhas++};
const b=await chromium.launch();

async function abre(estado, rota) {
  const ctx=await b.newContext({viewport:{width:1000,height:900}});
  await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(estado)]);
  const p=await ctx.newPage();
  await p.goto(BASE+rota,{waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  const txt=(await p.innerText('body')).replace(/\s+/g,' ');
  const r={txt, trancada:/ainda não abriu/.test(txt), licao:/Como pronunciar|Conhecer/.test(txt), pg:p, ctx};
  return r;
}

console.log('\n── quem está na segunda letra ────────────────');
/* Álef dominado, mem em andamento: tav e adiante estão trancadas. */
const st1=base({alef:licao('alef',5,1), mem:licao('mem',2,null)});

{ const r=await abre(st1,'/licao/kaf/');
  r.trancada ? ok('kaf (21ª) recusa a entrada pelo endereço') : erro('kaf abriu a lição inteira');
  /Álef|Mem/.test(r.txt) ? ok('e diz qual letra falta') : erro('não diz o que falta');
  await r.ctx.close(); }

{ const r=await abre(st1,'/licao/mem/');
  r.licao && !r.trancada ? ok('mem (a atual) abre normalmente') : erro('mem, que é a letra atual, foi trancada');
  await r.ctx.close(); }

{ const r=await abre(st1,'/licao/alef/');
  r.licao && !r.trancada ? ok('álef (já feita) continua abrindo') : erro('álef, já concluída, foi trancada');
  await r.ctx.close(); }

{ const r=await abre(st1,'/licao/tav/');
  r.trancada ? ok('tav (a seguinte) espera mem fechar') : erro('tav abriu antes da hora');
  await r.ctx.close(); }

console.log('\n── nota abaixo do critério ───────────────────');
const st2=base({alef:licao('alef',5,0.6)});
{ const r=await abre(st2,'/licao/mem/');
  r.trancada ? ok('5 etapas com nota baixa não abrem a seguinte') : erro('abriu com nota abaixo do critério');
  /60%/.test(r.txt) ? ok('e a tela diz a nota que faltou') : erro('não mostra a nota');
  await r.ctx.close(); }

console.log('\n── quem já estava adiante ────────────────────');
/* O aluno que estudava quando a trava entrou: progresso na 9ª sem nota na 8ª. */
const st3=base({shin:licao('shin',3,null)});
{ const r=await abre(st3,'/licao/shin/');
  r.licao && !r.trancada ? ok('quem já tinha progresso na 9ª continua entrando') : erro('*** a trava expulsou um aluno que já estava lá ***');
  await r.ctx.close(); }
{ const r=await abre(st3,'/licao/dalet/');
  r.licao && !r.trancada ? ok('e tudo antes dela segue aberto') : erro('trancou uma letra anterior à que o aluno já usava');
  await r.ctx.close(); }

console.log('\n── o mapa ────────────────────────────────────');
{ const r=await abre(st1,'/meu-hebraico/');   // a grade das 22 letras mora no painel
  const bloq=await r.pg.locator('button[aria-label*="bloqueada"]').count();
  bloq>0 ? ok(`${bloq} letras com cadeado, e nenhuma delas é link`) : erro('o mapa não marcou nenhuma letra como bloqueada');
  const aqui=await r.pg.locator('[aria-current="step"]').count();
  aqui===1 ? ok('uma letra marcada como "você está aqui"') : erro(`${aqui} letras marcadas como atual`);
  /de 22 lições concluídas/.test(r.txt) ? ok("o mapa conta as lições CONCLUÍDAS") : erro("sem a contagem de lições concluídas");
  await r.ctx.close(); }

await b.close(); s.close();
console.log('');
if (falhas) { console.log(`${falhas} problema(s) na trava de progressão.\n`); process.exit(1); }
console.log('a trava de progressão funciona num navegador de verdade.\n');
