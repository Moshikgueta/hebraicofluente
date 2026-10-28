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
const ROTAS=['/meu-hebraico/','/mapa/','/revisao/','/academia/','/conquistas/','/perfil/','/licao/alef/','/licao/bet/','/licao/he/','/modulo/6/','/inicio/','/historia/','/desafio-final/','/onboarding/',
  /* 23/09/2026: as três telas das atividades de produção. */
  '/vocabulario/','/meu-nome/','/teclado-hebraico/',
  /* 25/09/2026: a missão de módulo. */
  '/modulo/1/missao/', '/modulo/3/texto/'];
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
let ruim=0;
/* O que a navegação OFERECE, por largura e por rota. Ver as duas regras
   logo depois do laço. */
const navegacao={390:{},1280:{}};
/* E todo link visível, para a regra da ajuda. */
const ajuda={390:{},1280:{}};
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
             build e pela própria varredura, que só procurava chaves.

             O `u` está na lista pela mesma razão, e pelo mesmo acidente:
             `\\u00e1` escrito no TEXTO de um JSX não é escape nenhum - JSX
             não interpreta escapes fora de string -, então o aluno lê
             "R\\u00e1pido" na tela. */
          ||(document.body.innerText.match(/\\[1-9u]/g)||[])[0]||null}));
    /* Os destinos que a navegação principal mostra AQUI, nesta largura.
       Só conta link que ocupa espaço na tela: nas duas barras o HTML das
       duas existe sempre, e é o CSS que esconde uma delas. A inicial da
       conta, no cabeçalho do telefone, é a versão móvel do item "Perfil" e
       por isso entra na conta; o presente do cabeçalho é a versão móvel de
       "Recompensas" (27/09/2026: na barra de baixo não cabe um oitavo
       destino), e entra pelo mesmo motivo. */
    /* E o que a tela oferece a quem precisa de SOCORRO. Medido junto porque
       é a mesma pergunta: o que esta tela alcança. */
    ajuda[w][rota]=await p.evaluate(()=>{
      const visivel=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
      const fora=new Set();
      for (const a of document.querySelectorAll('a[href^="/"]'))
        if (visivel(a)) fora.add(new URL(a.href).pathname.replace(/\/+$/,'')||'/');
      return [...fora].sort();
    });
    navegacao[w][rota]=await p.evaluate(()=>{
      const visivel=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
      const fora=new Set();
      for (const a of document.querySelectorAll(
             'nav[aria-label="Navegação principal"] a[href^="/"], header a[href^="/perfil"], header a[href^="/loja"]'))
        if (visivel(a)) fora.add(new URL(a.href).pathname.replace(/\/+$/,'')||'/');
      return [...fora].sort();
    });
    const over=m.sw>m.iw+1;
    if(over||erros.length||m.cru) ruim++;
    if(m.cru) console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} MARCAÇÃO CRUA NA TELA: ${m.cru}`);
    console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} ${String(m.h).padStart(6)}px ${over?'OVERFLOW '+m.sw:'ok'} ${erros[0]?'ERRO: '+erros[0].slice(0,70):''}`);
  }
  await ctx.close();
}

/* ── o computador e o celular oferecem OS MESMOS destinos ─────────────────
   A plataforma tem duas navegações desenhadas separadamente: uma sidebar
   acima de 1024px e uma barra inferior abaixo. Enquanto elas forem duas
   listas, um destino novo pode entrar numa e não na outra - e o defeito é
   invisível de dentro: quem trabalha no notebook vê a tela completa, e é o
   aluno, no telefone, que perde a metade que ninguém conferiu. A barra
   inferior era literalmente `NAV.slice(0, 5)`: qualquer item inserido antes
   do fim empurrava outro para fora do telefone, em silêncio.

   Aqui os dois conjuntos são medidos num navegador de verdade, nas duas
   larguras, e têm de ser iguais. */
{
  const chaves=r=>navegacao[390][r].join(' | ');
  let divergiu=0;
  for (const rota of ROTAS) {
    const no_celular=navegacao[390][rota], no_desktop=navegacao[1280][rota];
    /* Hoje toda rota do curso tem a casca, e nenhuma cai aqui. A saída
       existe para uma tela que um dia seja desenhada SEM navegação de
       propósito - um funil, por exemplo. O que ela não permite é o caso
       que importa: navegação numa largura e não na outra. */
    if (!no_celular.length && !no_desktop.length) continue;
    const so_no_celular=no_celular.filter(h=>!no_desktop.includes(h));
    const so_no_desktop=no_desktop.filter(h=>!no_celular.includes(h));
    if (so_no_celular.length||so_no_desktop.length) {
      divergiu++; ruim++;
      console.log(`      ${'navegação'.padEnd(20)} ${rota} DIVERGE:` +
        (so_no_desktop.length?` só no computador: ${so_no_desktop.join(', ')}`:'') +
        (so_no_celular.length?` só no celular: ${so_no_celular.join(', ')}`:''));
    }
  }
  console.log(`      ${'navegação'.padEnd(20)} ${divergiu
    ? `${divergiu} rota(s) com navegação diferente entre computador e celular`
    : `os mesmos destinos nas duas larguras (${chaves(ROTAS[0])})`}`);
}

/* O cartão "Aula 0" no topo do mapa: o caminho para ela depois de concluída. */
const mapaLinkaAula0 = await (async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.addInitScript(([a,st])=>{localStorage.setItem('hf-platform-local-v1',a);localStorage.setItem('hebraico-fluente-v1',st)},[JSON.stringify(ACC),JSON.stringify(ST)]);
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4403/mapa/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const n = await p.locator('main a[href="/inicio/"], main a[href="/inicio"]').count();
  await ctx.close();
  return n > 0;
})();

/* ── a aula 0 fica ao alcance do curso inteiro ────────────────────────────
   Ela era uma ETAPA: o painel oferecia, o onboarding terminava nela, e
   depois sumia do caminho. Mas a página é referência - quem esbarra no ה
   mudo na décima lição precisa dela ali, não no painel. Agora ela é um
   destino da navegação, e isto recusa a volta atrás: em toda rota que tem
   navegação, nas duas larguras, existe um link visível para /inicio.
   Exceção (27/10/2026, decisão do dono): depois de CONCLUÍDA, ela sai das
   duas navegações e o caminho passa a ser o cartão no topo do mapa. Então a
   tela sem o link na navegação só passa se o mapa tiver o link. */
{
  let sem=0;
  for (const w of [390,1280]) for (const rota of ROTAS) {
    const tem=navegacao[w][rota];
    if (!tem.length) continue;
    if (!tem.includes('/inicio') && !mapaLinkaAula0) {
      sem++; ruim++;
      console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} SEM CAMINHO PARA A AULA 0`);
    }
  }
  console.log(`      ${'aula 0'.padEnd(20)} ${sem
    ? `fora da navegação em ${sem} tela(s)`
    : 'ao alcance de toda tela do curso, nas duas larguras'}`);
}

/* ── quem precisa de socorro tem por onde pedir ───────────────────────────
   Medido em 22/09/2026, listando todo link visível das telas do curso: de
   dentro do curso não havia caminho nenhum para suporte, dúvidas, termos,
   privacidade ou reembolso. As páginas existiam, ligadas só à casca do SITE
   DE VENDAS - o lugar onde quem já comprou nunca mais entra. O único contato
   era um endereço de e-mail solto no perfil.

   O defeito é do tipo que nenhum teste de unidade vê, porque nada está
   quebrado: cada página abre, cada rota responde. O que faltava era o
   caminho até elas, e caminho só se mede olhando a tela. */
{
  const EXIGIDAS = ['/suporte', '/faq', '/reembolso', '/termos', '/privacidade'];
  let sem = 0;
  for (const w of [390, 1280]) for (const rota of ROTAS) {
    /* O onboarding é a única tela do curso sem o rodapé, porque ela não usa a
       casca - e é um funil de quatro passos, não um lugar onde se mora. */
    if (!navegacao[w][rota].length) continue;
    const faltam = EXIGIDAS.filter(h => !ajuda[w][rota].includes(h));
    if (faltam.length) {
      sem++; ruim++;
      console.log(`${String(w).padEnd(5)} ${rota.padEnd(20)} SEM AJUDA: falta ${faltam.join(', ')}`);
    }
  }
  console.log(`      ${'ajuda'.padEnd(20)} ${sem
    ? `${sem} tela(s) sem caminho para pedir ajuda`
    : `suporte, dúvidas, reembolso, termos e privacidade em toda tela, nas duas larguras`}`);
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
    /* A checagem mora no <Compreensao id="atividade-perguntas">, dentro da
       parte "atividade" (que chega fechada: o texto está no HTML, então
       textContent conta mesmo assim). */
    const sec = document.querySelector('section[aria-labelledby="atividade-perguntas"]');
    if (!sec) return 0;
    return [...sec.children].filter(el => /^\d+\./.test(el.textContent || '')).length;
  });
  const faixa = cartoes >= 12 && cartoes <= 18;
  console.log(`      ${'aula 0'.padEnd(20)} checagem final com ${cartoes} perguntas ` +
              `${faixa ? '(entre 12 e 18)' : 'FORA DA FAIXA 12-18'}`);
  if (!faixa) ruim++;

  /* As partes da Aula 0 chegam fechadas (pedido do dono, 29/09/2026,
     components/learn/Partes.tsx): o texto fica no HTML com `hidden`, e o
     innerText só lê o que está à vista. Abre todas antes de procurar. */
  /* Desde 28/10/2026 a Aula 0 abre numa capa, com os passos curtos; a
     página inteira fica a um botão ("Ver tudo numa página"). */
  const paginaInteira = p.getByRole('button', { name: 'Ver tudo numa página' });
  if (await paginaInteira.count()) { await paginaInteira.first().click(); await p.waitForTimeout(200); }
  const abrirTodas = p.getByRole('button', { name: 'Abrir todas as partes' });
  if (await abrirTodas.count()) { await abrirTodas.first().click(); await p.waitForTimeout(200); }
  const txt = (await p.innerText('body')).replace(/\s+/g, ' ');
  for (const [o_que, marca] of [
    ['a linha de duas direções', 'Quando a linha tem duas direções'],
    ['moderno × antigo', 'Que hebraico é este'],
    ['a história, fechada', 'Como uma língua voltou a ser falada'],
    ['impressa × cursiva', 'impressa e cursiva'],
    ['a regra em duas linhas', 'Para escrever à mão'],
    ['a microatividade do caderno', 'escrever no caderno']
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
