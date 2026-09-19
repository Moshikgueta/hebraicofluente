/* Os CTAs, nos dois estados que importam.
   ────────────────────────────────────────────────────────────────────────
   Visitante: a capa vende, o preço aparece, o botão leva ao checkout.
   Aluno:     a mesma capa, o mesmo /metodo e o mesmo /faq deixam de vender -
              nenhum caminho para /checkout, nenhum preço na caixa da direita.

   Confere também que a mensagem central do hero é PORTUGUÊS INTEIRO: nenhum
   caractere hebraico dentro do <h1>. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4409,r));
mkdirSync('.shots',{recursive:true});
const hoje=new Date().toISOString().slice(0,10);
const ACC={v:1,accounts:{'d@h.test':{id:'a',name:'M',email:'d@h.test',createdAt:new Date().toISOString(),pw:'x',entitlements:[{courseSlug:'alfabetizacao',grantedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+3e10).toISOString(),orderId:'d'}],orders:[]}},current:'d@h.test'};
const ST={version:2,onboarding:{reason:'familia',goalMinutes:10,startingPoint:'zero',name:'M',completedAt:new Date().toISOString()},xp:50,lessons:{},checkpoints:{},srs:{},achievements:[],days:{[hoje]:{answered:0,units:0,xp:0,goalMet:false}},streak:{current:1,longest:1,lastDay:hoje},lastRoute:null,finalChallenge:{best:null,completedAt:null},skills:{},confusions:{},firsts:{},gym:{}};

const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const erros=[];
const HEBRAICO=/[֐-׿]/;

async function cenario(nome, aluno) {
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  if (aluno) await ctx.addInitScript(([a,st])=>{
    localStorage.setItem('hf-platform-local-v1',a);
    localStorage.setItem('hebraico-fluente-v1',st);
  },[JSON.stringify(ACC),JSON.stringify(ST)]);
  const p=await ctx.newPage();
  p.on('console',m=>{if(m.type()==='error')erros.push(nome+': '+m.text())});
  p.on('pageerror',e=>erros.push(nome+' pageerror: '+e.message));

  await p.goto('http://127.0.0.1:4409/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);           /* a sequência do hero leva 1,9s */
  const h1 = (await p.locator('h1').first().innerText()).replace(/\s+/g,' ');
  const botao = (await p.locator('header a').filter({hasText:/Começar|Continuar|Liberar/}).first().innerText()).replace(/\s+/g,' ').trim();
  const micro = await p.locator('text=/Acesso imediato · 12 meses|Seu progresso está salvo/').first().innerText().catch(()=>'(sem microcópia)');
  const precoVisivel = await p.locator('text=/R\\$/').count();
  const jaSeu = await p.locator('text=/Este curso já é seu/').count();
  const paraCheckout = await p.locator('a[href*="/checkout/"]').count();

  console.log(`\n  ${nome}`);
  console.log(`    h1            ${h1}`);
  console.log(`    hebraico no h1 ${HEBRAICO.test(h1) ? 'SIM - erro' : 'não'}`);
  console.log(`    botão         ${botao}`);
  console.log(`    microcópia    ${micro.replace(/\s+/g,' ')}`);
  console.log(`    caixa preço   ${jaSeu ? '"já é seu"' : precoVisivel ? 'mostra R$' : '?'}`);
  console.log(`    links /checkout na capa: ${paraCheckout}`);
  await p.screenshot({path:`.shots/cta-${nome}-capa.png`,fullPage:false});

  for (const rota of ['metodo','faq','sobre']) {
    await p.goto(`http://127.0.0.1:4409/${rota}/`,{waitUntil:'networkidle'});
    await p.waitForTimeout(700);
    const fecho = await p.locator('a').filter({hasText:/Começar a aprender|Continuar de onde parei|Liberar meu acesso/}).first().innerText().catch(()=>'(nenhum)');
    const vende = await p.locator('a[href*="/checkout/"]').count();
    console.log(`    /${rota.padEnd(7)} fecho: ${fecho.replace(/\s+/g,' ').trim().padEnd(26)} checkout: ${vende}`);
  }
  await ctx.close();
}

await cenario('visitante', false);
await cenario('aluno', true);
console.log('\n  erros de console:', erros.length ? erros.slice(0,3) : 'nenhum', '\n');
await b.close(); s.close();
