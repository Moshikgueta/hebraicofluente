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
const ROTAS=['/meu-hebraico/','/mapa/','/revisao/','/academia/','/conquistas/','/perfil/','/licao/alef/','/licao/bet/','/licao/he/','/modulo/6/','/inicio/','/historia/','/desafio-final/','/onboarding/'];
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
    const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,h:document.documentElement.scrollHeight,
      /* Marcação crua na tela. O hebraico em prosa é escrito {{assim}} e
         convertido pelo <Prose>; um texto que chega à tela sem passar por
         ele mostra as chaves ao aluno, e some no meio de uma página longa
         sem quebrar nada. Foi o que aconteceu com o enunciado da checagem
         da letra {{ב}}: "Como se lê {{לֵב}}?" com chaves e tudo. */
      cru:(document.body.innerText.match(/\{\{[^}]{1,40}\}\}/g)||[])[0]
          /* E sobra de substituição. Um `\\1` ou `\\2` no meio de um título
             é um "replace" que tratou o texto de substituição como literal:
             a regra visual não quebra nada, a página monta, e o título sai
             com "aprender?\\3" escrito na tela. Aconteceu aqui, num script
             que pôs `id` em onze <h2> de uma vez - e passou pelo tsc, pelo
             build e pela própria varredura, que só procurava chaves. */
          ||(document.body.innerText.match(/\\[1-9]/g)||[])[0]||null}));
    const over=m.sw>m.iw+1;
    if(over||erros.length||m.cru) ruim++;
    if(m.cru) console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} MARCAÇÃO CRUA NA TELA: ${m.cru}`);
    console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} ${String(m.h).padStart(6)}px ${over?'OVERFLOW '+m.sw:'ok'} ${erros[0]?'ERRO: '+erros[0].slice(0,70):''}`);
  }
  await ctx.close();
}
/* ── a aula 0 não pode voltar a ser órfã ──────────────────────────────────
   `/inicio` existiu desde o começo e nenhuma tela linkava para ela: o único
   jeito de chegar era digitar o endereço. Uma página de "leia antes de
   começar" que ninguém alcança antes de começar não é uma página, é um
   arquivo. E o botão dela apontava para `mem`, a SEGUNDA letra - a tela que
   existe para não assustar ninguém mandava o iniciante pular a primeira
   lição, e nada reclamava: o endereço existe e a página abre.

   As duas falhas são invisíveis. Só aparecem para quem conhece a ordem do
   alfabeto e esteve nas duas telas. Por isso são conferidas aqui. */
{
  const curso = JSON.parse(readFileSync('content/course.json', 'utf8'));
  const primeira = curso.letters.slice().sort((a, b) => a.order - b.order)[0].id;

  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(([a, st]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', st);
  }, [JSON.stringify(ACC), JSON.stringify(ST)]);
  const p = await ctx.newPage();

  await p.goto('http://127.0.0.1:4403/meu-hebraico/', { waitUntil: 'networkidle' });
  const linkada = await p.locator('a[href="/inicio/"], a[href="/inicio"]').count() > 0;
  console.log(`      ${'aula 0'.padEnd(20)} ${linkada ? 'linkada no painel' : 'ÓRFÃ: o painel não linka /inicio'}`);
  if (!linkada) ruim++;

  await p.goto('http://127.0.0.1:4403/inicio/', { waitUntil: 'networkidle' });
  const destino = await p.locator('a', { hasText: 'Ir para a primeira letra' }).first().getAttribute('href');
  const certo = !!destino && destino.replace(/\/$/, '').endsWith(`/licao/${primeira}`);
  console.log(`      ${'aula 0'.padEnd(20)} ${certo
    ? `manda para ${destino} (primeira letra: ${primeira})`
    : `MANDA PARA ${destino}, e a primeira letra é ${primeira}`}`);
  if (!certo) ruim++;

  await ctx.close();
}

/* ── o módulo 0: o índice e o que ele promete ─────────────────────
   A aula 0 é a página mais longa do curso - dezessete mil pixels num
   telefone - e por isso ganhou um índice. Um item de índice apontando para um
   id que não existe não quebra nada: o clique simplesmente não leva a lugar
   nenhum, nenhum teste vê, e só um aluno percebe. É exatamente o tipo de
   defeito que precisa de um navegador para ser visto.

   Junto vai o que a página PRECISA ter: o índice desenhado, a checagem final
   com o número de perguntas que ela anuncia, e o quadro que ensina a linha
   de duas direções - o único lugar do curso em que o aluno vê um número
   dentro de hebraico antes de encontrar um na rua. */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.addInitScript(([a, st]) => {
    localStorage.setItem('hf-platform-local-v1', a);
    localStorage.setItem('hebraico-fluente-v1', st);
  }, [JSON.stringify(ACC), JSON.stringify(ST)]);
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4403/inicio/', { waitUntil: 'networkidle' });

  const indice = await p.locator('nav[aria-labelledby="indice"] a').evaluateAll(
    as => as.map(a => a.getAttribute('href')));
  const quebrados = [];
  for (const href of indice) {
    const id = (href || '').replace(/^#/, '');
    if (!id || await p.locator(`[id="${id}"]`).count() === 0) quebrados.push(href);
  }
  console.log(`      ${'aula 0'.padEnd(20)} ${indice.length} itens de índice` +
              (quebrados.length ? ` - QUEBRADOS: ${quebrados.join(', ')}` : ', todos com destino'));
  if (!indice.length || quebrados.length) ruim++;

  /* A checagem final anuncia o próprio tamanho no título. Se alguém tirar
     uma pergunta e esquecer o título, a página passa a mentir por conta
     própria - e o pedido era de 12 a 18. */
  const cartoes = await p.evaluate(() => {
    const sec = document.querySelector('section[aria-labelledby="atividade"]');
    if (!sec) return 0;
    return [...sec.children].filter(el => /^\d+\./.test(el.textContent || '')).length;
  });
  const faixa = cartoes >= 12 && cartoes <= 18;
  console.log(`      ${'aula 0'.padEnd(20)} checagem final com ${cartoes} perguntas ` +
              `${faixa ? '(entre 12 e 18)' : 'FORA DA FAIXA 12-18'}`);
  if (!faixa) ruim++;

  const txt = (await p.innerText('body')).replace(/\s+/g, ' ');
  for (const [o_que, marca] of [
    ['a linha de duas direções', 'Quando a linha tem duas direções'],
    ['moderno × antigo', 'Que hebraico é este'],
    ['a história, fechada', 'Como uma língua voltou a ser falada']
  ]) {
    const tem = txt.includes(marca);
    console.log(`      ${'aula 0'.padEnd(20)} ${tem ? '✓' : 'FALTA'} ${o_que}`);
    if (!tem) ruim++;
  }

  /* O bloco da história é OPCIONAL, e opcional quer dizer fechado ao chegar:
     aberto por engano, ele empurra o caminho principal para baixo. */
  const aberto = await p.locator('details[open] summary', { hasText: 'voltou a ser falada' }).count();
  console.log(`      ${'aula 0'.padEnd(20)} ${aberto ? 'A HISTÓRIA CHEGA ABERTA' : 'a história chega fechada'}`);
  if (aberto) ruim++;

  await ctx.close();
}

console.log(ruim===0?'tudo limpo':`${ruim} problema(s)`);
await b.close(); s.close();
if (ruim) process.exit(1);
