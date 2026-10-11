/* Os tipos de exercício, respondidos num navegador de verdade.
   ─────────────────────────────────────────────────────────────────────────
   `tests/tipos.test.ts` prova que os itens estão BEM FORMADOS. Isto prova
   que eles são RESPONDÍVEIS: que a alternativa aceita o toque, que o retorno
   aparece, que dá para seguir, e que responder duas vezes não conta duas.

   Os dois são necessários e nenhum substitui o outro. Um item pode ter
   `answer` válido e mesmo assim ter a alternativa por baixo de outro
   elemento, ou o botão de seguir fora da tela - defeitos que só existem
   depois que o React desenhou.

   ── por que percorre a prática e não uma tela de amostra ────────────────
   Porque uma tela feita para o teste testa a tela feita para o teste. Aqui
   se entra pela mesma porta do aluno: a etapa 4 de uma lição, com progresso
   semeado, e se responde item a item até o fim do bloco.

   node exercicios.mjs (de dentro de app/, com out/ em modo local). */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';

const T = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg'
};
const srv = createServer((q, r) => {
  const c = decodeURIComponent(q.url.split('?')[0]);
  for (const f of [`out${c}`, `out${c}/index.html`, `out${c}.html`, 'out/404.html']) {
    if (!existsSync(f) || f.endsWith('/')) continue;
    try {
      const b = readFileSync(f);
      r.writeHead(200, { 'Content-Type': T[f.slice(f.lastIndexOf('.'))] || 'application/octet-stream' });
      return r.end(b);
    } catch { /* tenta o próximo */ }
  }
  r.writeHead(404); r.end('404');
});
await new Promise(r => srv.listen(4490, r));
const BASE = 'http://127.0.0.1:4490';

const agora = new Date().toISOString();
const ACC = { v: 1, accounts: { 'd@h.t': {
  id: 'a', name: 'M', email: 'd@h.t', createdAt: agora, pw: 'x',
  entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: agora,
    expiresAt: new Date(Date.now() + 3e10).toISOString(), orderId: 'd' }], orders: []
} }, current: 'd@h.t' };
const curso = JSON.parse(readFileSync('content/course.json', 'utf8'));
const lessons = {};
for (const l of curso.letters) {
  lessons[l.id] = { letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1,
    quizAttempts: 1, perfectBonusPaid: true, completedAt: agora };
}
const ST = { version: 2, onboarding: { reason: 'familia', goalMinutes: 10,
  startingPoint: 'zero', name: 'M', completedAt: agora }, xp: 900, lessons,
  checkpoints: {}, srs: {}, achievements: [], days: {}, streak: { current: 0, longest: 0, lastDay: null },
  lastRoute: null, finalChallenge: { best: null, completedAt: null },
  skills: {}, confusions: {}, firsts: {}, gym: {} };

let falhas = 0;
const erro = m => { console.log(`  ✗ ${m}`); falhas++; };

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM });
const ctx = await b.newContext({ viewport: { width: 390, height: 1100 } });
await ctx.addInitScript(([a, s]) => {
  /* A prática em andamento mora no sessionStorage desde 01/10/2026 (UXQA-003):
     sem limpar, a segunda passada retomava a primeira, com outros itens, e
     nenhum gabarito aprendido servia. */
  sessionStorage.clear();
  /* E as rodadas (lib/rodadas.ts): cada rodada concluída faz a próxima ser
     outra, de propósito. A segunda passada precisa da MESMA rodada. */
  localStorage.removeItem('hf-rodadas-v1');
  localStorage.setItem('hf-platform-local-v1', a);
  localStorage.setItem('hebraico-fluente-v1', s);
}, [JSON.stringify(ACC), JSON.stringify(ST)]);
const p = await ctx.newPage();

/* Os erros de console contam: um item que responde certo e joga uma
   exceção está quebrado, mesmo que a tela pareça bem. */
const consoleErros = [];
p.on('console', m => { if (m.type() === 'error') consoleErros.push(m.text()); });

/** O que está na tela agora, o suficiente para decidir o próximo toque.
 *
 *  O progresso sai de `data-progresso`, e não do texto: o cabeçalho da lição
 *  mostra "LETRA 7/22" acima do player, e ler o primeiro "n/m" da tela dava
 *  22 como total de um bloco de dez - a primeira execução desta varredura
 *  acusou dez problemas que eram todos esse engano. */
const estado = () => p.evaluate(() => {
  const main = document.querySelector('main');
  const txt = (main?.innerText || '').replace(/\s+/g, ' ');
  const marca = main?.querySelector('[data-progresso]')?.getAttribute('data-progresso') || '';
  const [feito, total] = marca.split('/').map(Number);
  const botoes = [...main.querySelectorAll('button')].map((el, i) => ({
    i, txt: (el.innerText || '').replace(/\s+/g, ' ').trim(),
    /* aria-disabled conta como desligado: o ligar da lição e as perguntas
       da etapa 1 mantêm o botão focável depois de respondido (VIS-005/008). */
    off: el.disabled || el.getAttribute('aria-disabled') === 'true', etapa: !!el.getAttribute('aria-label')?.startsWith('Etapa'),
    resposta: el.getAttribute('data-resposta'),
    /* O rótulo acessível, e ele é necessário por causa de um laço infinito.
       ────────────────────────────────────────────────────────────────────
       Num item de MONTAR, as peças já colocadas continuam sendo botões - e
       têm de ser: tocar numa peça posta é como se tira ela de volta, que é a
       única forma de corrigir a ordem sem recomeçar. Só que elas vêm ANTES
       das peças disponíveis no documento.

       A varredura tocava sempre o primeiro botão habilitado. Então ela punha
       uma peça, via a peça posta como primeiro botão, tirava a peça, punha de
       novo - para sempre. Resultado na saída: «mem/Praticar: respondi 9 de 14
       itens», que lia como defeito da lição e era o robô brigando consigo
       mesmo. Um verificador que não sabe operar a tela acusa a tela. */
    rotulo: el.getAttribute('aria-label') || ''
  }));
  return {
    /* 2000, e não 400: com o som da letra em português (CONT-003) e o anúncio
       do ligar para o leitor de tela (VIS-005), o retorno do item passou do
       corte, e a varredura acusava "sem explicação" e "tela travada" numa
       lição que funcionava. */
    txt: txt.slice(0, 2000),
    feito: feito || 0, total: total || 0,
    /* O item desta tela já foi corrigido?
       ──────────────────────────────────────────────────────────────────
       Duas evidências, e as duas são necessárias. `data-resposta` só existe
       nas alternativas de ESCOLHA - montar e ligar desenham por outro
       componente -, então sozinho ele dava o item de montar sílaba como
       nunca respondido, e a varredura acusava "8 de 10" num bloco que
       tinha sido respondido inteiro. O botão de seguir é o sinal que vale
       para todos: ele só aparece depois que o player julgou. */
    julgado: botoes.some(b => b.resposta === 'right' || b.resposta === 'wrong')
      || botoes.some(b => !b.off && /^(Continuar|Ver resultado)/.test(
        (b.txt || '').replace(/\s+/g, ' ').trim())),
    temCampo: !!main.querySelector('input[type="text"], input:not([type])'),
    botoes
  };
});

const vistos = new Map();
/* O gabarito de cada item digitado, lido da tela no primeiro erro. */
const gabaritos = new Map();
let digitadasCertas = 0;

async function percorre(letraId, etapa, rotulo, abrir) {
  if (abrir) await abrir();
  else {
    await p.goto(`${BASE}/licao/${letraId}/`, { waitUntil: 'networkidle' });
    await p.getByLabel(`Etapa ${etapa} de 5 - ${rotulo}`).click();
  }
  await p.waitForTimeout(500);

  const inicial = await estado();
  const total = inicial.total || 0;
  if (!total) { erro(`${letraId}/${rotulo}: não achei o contador de progresso`); return; }

  let ultimoFeito = -1;
  let travas = 0;
  /* Conta por ÍNDICE julgado, e não por clique em "Continuar": o último
     item do bloco é corrigido e então o player sai da tela, levando o botão
     junto - contando no clique, o item 10 de 10 nunca entrava. */
  const julgados = new Set();

  /* O TETO DE PASSOS, e por que ele subiu.
     ──────────────────────────────────────────────────────────────────────
     Era `total * 8 + 20`, calibrado quando o bloco de prática tinha dez
     itens e quase todos eram de ESCOLHER, que custam dois passos: tocar e
     seguir. Em 23/09/2026 o bloco foi para catorze e ganhou os gestos de
     MONTAR - que custam um toque por peça, mais o de seguir: quatro a cinco
     passos cada.

     Com o teto antigo a varredura ficava sem passos no meio do bloco e
     acusava «respondi 9 de 14», que lia como defeito do produto e era
     defeito da régua. É o mesmo engano de sempre neste projeto: um
     verificador que não consegue operar a tela acusa a tela. */
  for (let passo = 0; passo < total * 12 + 30; passo++) {
    const e = await estado();
    /* Acabou quando o player sai da tela: o contador some junto com ele. */
    if (!e.total) break;
    if (e.julgado) julgados.add(e.feito);

    /* Qual formato está na tela? É pelo texto do enunciado, que é o que o
       aluno vê - e não pelo `kind`, que daqui não se enxerga. */
    const tipo =
      e.temCampo ? 'digitar'
      : /Ligue cada/.test(e.txt) ? 'ligar'
      : /Monte a s[íi]laba|Monte a palavra|Monte em cursiva|Toque nas .* na ordem/.test(e.txt) ? 'montar'
      : 'escolher';
    vistos.set(tipo, (vistos.get(tipo) ?? 0) + 1);

    const seguir = e.botoes.find(x => !x.off && /^Continuar|^Próxim|^Ver resultado|^Concluir/.test(x.txt));
    if (seguir) {
      /* O RETORNO TEM DE APARECER ANTES DO BOTÃO DE SEGUIR. Um item que
         avança sem dizer nada é o "Incorreto." mudo que o curso recusa.
         Só se cobra isso quando o item FOI julgado - a tela de fim de bloco
         também tem botão de seguir, e ali não há retorno a dar. */
      if (e.julgado && !/Isso|Boa|resposta certa|Quase|Não é|Errou|certa é/.test(e.txt)) {
        erro(`${letraId}/${rotulo}: item julgado e nenhuma explicação na tela`);
      }
      await p.locator('main button').nth(seguir.i).click();
      await p.waitForTimeout(300);
      continue;
    }

    /* DIGITAR, e as duas coisas que ele tem de fazer.
       ──────────────────────────────────────────────────────────────────
       1. O Enter que CORRIGE não pode também SEGUIR. Até 23/09/2026 o Enter
          do campo subia até o atalho do player («Enter = próxima») e o mesmo
          toque corrigia e pulava: o aluno nunca via se tinha acertado. Esta
          varredura acusava «respondi 13 de 14» em todo bloco, e era verdade.
       2. A resposta certa tem de ser ACEITA. Na primeira passada o robô não
          sabe a resposta: digita "x", erra, e lê o gabarito que a tela
          mostra. A prática usa semente fixa, então a segunda passada pelo
          mesmo bloco traz o mesmo item - e aí ele digita o gabarito e cobra o
          acerto. */
    if (e.temCampo) {
      /* A chave é a TELA do item (enunciado e hebraico, sem o contador), e
         não a posição: um digitado errado volta depois de outros itens (a
         prática de revisão, 30/09/2026), e pela posição o robô digitava a
         resposta de um item no outro e acusava "certa recusada". */
      const tela = await p.evaluate(() => {
        const main = document.querySelector('main');
        const h2 = main?.querySelector('h2')?.textContent?.trim() ?? '';
        const he = [...(main?.querySelectorAll('[lang="he"]') ?? [])].map(x => x.textContent?.trim()).filter(Boolean).join(' ');
        return `${h2}|${he}`;
      });
      const chave = `${letraId}/${rotulo}/${tela}`;
      const sabida = gabaritos.get(chave);
      await p.locator('main input').first().fill(sabida ?? 'x');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(350);
      const d = await estado();
      if (d.feito !== e.feito || !d.julgado) {
        erro(`${letraId}/${rotulo}: o Enter que corrige o item digitado também pulou para o próximo`);
      } else if (sabida) {
        if (/O certo era/.test(d.txt)) erro(`${letraId}/${rotulo}: a resposta certa digitada ("${sabida}") foi recusada`);
        else digitadasCertas++;
      } else {
        const m = d.txt.match(/O certo era (\S+?)\./);
        if (m) gabaritos.set(chave, m[1]);
      }
      continue;
    }

    /* MONTAR POR LETRAS não aceita chute eterno: o erro devolve as peças à
       mesa para refazer, e o robô, que monta sempre na ordem das peças,
       erraria igual para sempre (a primeira execução deu «montar×988»).
       O aluno que não sabe tem, a partir do segundo erro, "Mostrar a
       resposta" - e o robô faz o mesmo que ele. */
    const desistir = e.botoes.find(x => !x.off && /^Mostrar a resposta/.test(x.txt));
    if (desistir) {
      await p.locator('main button').nth(desistir.i).click();
      await p.waitForTimeout(300);
      continue;
    }

    const alvos = e.botoes.filter(x => !x.off && !x.etapa && x.txt
      && !/dica|Pular|Ouvir|Tocar|Limpar|Desfazer/i.test(x.txt)
      /* "0,7×" é o "Ouvir devagar": o nome está só no rótulo acessível. */
      && !/Ouvir|Tocar/i.test(x.rotulo)
      /* Na academia o "← Academia" é BOTÃO, e é o primeiro da tela: tocar
         nele sai do treino. A primeira execução desta passada acusou
         «respondi 0 de 8» num treino que funcionava. */
      && !/^←/.test(x.txt)
      /* Ver a nota em `rotulo`: desfazer o próprio trabalho é um laço. */
      && !/^Tirar a (peça|letra)/i.test(x.rotulo));
    if (!alvos.length) {
      if (++travas > 3) { erro(`${letraId}/${rotulo}: travei sem alternativa para tocar`); break; }
      await p.waitForTimeout(400);
      continue;
    }

    /* LIGAR precisa ser RESOLVIDO, e não chutado.
       ──────────────────────────────────────────────────────────────────
       O par só trava quando está certo: um par errado pisca em âmbar e
       solta os dois itens (`Answers.tsx`, `tap`). Então um robô que tenta
       uma combinação e passa adiante fica no mesmo exercício para sempre -
       a segunda versão desta varredura tentou 346 vezes e concluiu que o
       produto tinha travado.

       A saída é a do aluno que não sabe: tenta o primeiro da esquerda
       contra cada um da direita até um deles ficar. São no máximo quatro
       pares, então dezesseis toques no pior caso. */
    if (tipo === 'ligar') {
      const colunas = await p.evaluate(() => {
        const uls = [...document.querySelectorAll('main ul')]
          .filter(u => u.querySelectorAll('button').length >= 3);
        const todos = [...document.querySelectorAll('main button')];
        const idx = el => todos.indexOf(el);
        return uls.slice(0, 2).map(u => [...u.querySelectorAll('button')]
          .map(b => ({ i: idx(b), off: b.disabled || b.getAttribute('aria-disabled') === 'true' })));
      });
      if (colunas.length < 2) { travas++; await p.waitForTimeout(300); continue; }
      const [esq, dir] = colunas;
      const aberto = esq.find(x => !x.off);
      if (!aberto) { await p.waitForTimeout(300); continue; }
      for (const alvo of dir.filter(x => !x.off)) {
        await p.locator('main button').nth(aberto.i).click().catch(() => {});
        await p.waitForTimeout(90);
        await p.locator('main button').nth(alvo.i).click().catch(() => {});
        await p.waitForTimeout(160);
        /* aria-disabled também fecha: o ligar mantém o botão focável (VIS-005). */
        const fechou = await p.locator('main button').nth(aberto.i)
          .evaluate(b => b.disabled || b.getAttribute('aria-disabled') === 'true').catch(() => false);
        if (fechou) break;
      }
      continue;
    }

    await p.locator('main button').nth(alvos[0].i).click();
    await p.waitForTimeout(250);

    const depois = await estado();
    /* NÃO CONTA DUAS VEZES: tocar de novo na mesma alternativa, já
       respondida, não pode mexer no contador. */
    if (depois.feito > e.feito + 1) {
      erro(`${letraId}/${rotulo}: um toque avançou ${depois.feito - e.feito} itens`);
    }
    const jaRespondido = depois.botoes[alvos[0].i]?.off;
    if (jaRespondido) {
      const antes = depois.feito;
      await p.locator('main button').nth(alvos[0].i).click({ force: true }).catch(() => {});
      await p.waitForTimeout(200);
      const agora2 = await estado();
      if (agora2.feito !== antes) {
        erro(`${letraId}/${rotulo}: responder duas vezes contou duas vezes`);
      }
    }
    if (depois.feito === ultimoFeito && depois.txt === e.txt) travas++; else travas = 0;
    if (travas > 4) { erro(`${letraId}/${rotulo}: a tela parou de responder`); break; }
    ultimoFeito = depois.feito;
  }

  if (julgados.size < total) {
    erro(`${letraId}/${rotulo}: respondi ${julgados.size} de ${total} itens`);
  } else {
    console.log(`  ✓ ${letraId}/${rotulo}: ${julgados.size}/${total} itens respondidos e corrigidos`);
  }
}

/* Letras escolhidas para varrer formatos diferentes: alef não tem palavra
   legível, mem abre o vocabulário, shin e bet trazem as duas leituras, vav
   traz a frase, e as tardias trazem forma final e cena. */
/* Desde 11/10/2026 a etapa 4 é a Fixação guiada, sem o tocador de
   perguntas (components/learn/FixacaoGuiada.tsx): os exercícios corrigidos
   são os da etapa 5. */
for (const [id, etapa, rotulo] of [
  ['alef', 5, 'Exercícios'], ['mem', 5, 'Exercícios'], ['he', 5, 'Exercícios'],
  ['shin', 5, 'Exercícios'], ['vav', 5, 'Exercícios'], ['bet', 5, 'Exercícios'],
  ['pe', 5, 'Exercícios']
]) {
  await percorre(id, etapa, rotulo);
}
/* O modo "Letras parecidas" da academia. Ele mudou de formato em 23/09 -
   todo item passou a mostrar as duas letras do par, com três exercícios
   novos (lib/engine/pares.ts) -, e nenhuma varredura passava por ele. */
await percorre('academia', 0, 'Letras parecidas', async () => {
  await p.goto(`${BASE}/academia/`, { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /Letras parecidas/ }).first().click();
});

/* A segunda passada, agora sabendo o gabarito dos itens digitados. */
for (const id of ['alef', 'vav']) await percorre(id, 5, 'Exercícios');
if (!digitadasCertas) erro('nenhuma resposta digitada certa foi conferida - a segunda passada não achou o item');
else console.log(`  ✓ ${digitadasCertas} resposta(s) digitada(s) certa(s) aceita(s)`);

console.log('');
console.log('  formatos exercitados:', [...vistos.entries()].map(([k, n]) => `${k}×${n}`).join('  '));
for (const f of ['escolher', 'ligar', 'montar', 'digitar']) {
  if (!vistos.get(f)) erro(`o formato "${f}" não apareceu em nenhuma varredura`);
}
if (consoleErros.length) erro(`erro de console: ${consoleErros[0].slice(0, 120)}`);

console.log('');
console.log(falhas === 0
  ? 'todo tipo de exercício responde, corrige e avança num navegador de verdade.'
  : `${falhas} problema(s)`);
await b.close(); srv.close();
if (falhas) process.exit(1);
