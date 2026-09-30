/* Apagar a conta, num navegador de verdade, pela porta do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * Os testes de unidade cobrem o SERVIDOR: o que some, o que fica, e as
 * travas. O que só se vê aqui é a tela - e foi aqui que os dois defeitos
 * apareceram, os dois na mesma costura:
 *
 *   · a confirmação renderizada dentro do /perfil nunca aparecia, porque o
 *     CourseGate vê a sessão sumir e manda para /entrar;
 *   · e trocar por `router.replace` não resolveu: o efeito do portão continua
 *     vivo numa navegação de cliente, e vencia a corrida. A pessoa apagava a
 *     conta e caía na tela de login, sem nenhuma confirmação - que é o pior
 *     desfecho possível para esta operação, porque deixa a dúvida de se
 *     apagou mesmo.
 *
 * Nenhum dos dois quebra nada, nenhum aparece num teste de unidade, e os dois
 * só existem quando a exclusão e o portão rodam na mesma tela.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4412,r));
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
const ctx=await b.newContext({viewport:{width:390,height:844}});
const p=await ctx.newPage();
let falhas=0;
const ok=m=>console.log(`  ✓ ${m}`);
const erro=m=>{console.log(`  ✗ ${m}`);falhas++};
const U='http://127.0.0.1:4412';

await p.goto(`${U}/criar-conta/`,{waitUntil:'networkidle'});
await p.fill('#nome','Daniel'); await p.fill('#email','apagavel@exemplo.com.br');
await p.fill('#senha','senha-do-teste-1'); await p.check('#aceite-termos'); await p.check('#declaracao-idade'); await p.click('button[type=submit]');
await p.waitForTimeout(900);

await p.goto(`${U}/perfil/`,{waitUntil:'networkidle'});
await p.waitForTimeout(500);
(await p.locator('button',{hasText:'Apagar minha conta'}).count())
  ? ok('o perfil oferece apagar a conta') : erro('não há botão de apagar no perfil');
await p.locator('button',{hasText:'Apagar minha conta'}).first().click();
await p.waitForTimeout(300);

/* O aviso vem ANTES do formulário. Uma confirmação que só explica as
   consequências na tela seguinte é uma armadilha. */
const aviso=await p.innerText('form:has(#apagar-senha)');
/\bnão tem volta\b/i.test(aviso) ? ok('avisa que não tem volta antes do formulário') : erro('não avisa');

/* As duas travas, uma de cada vez. */
await p.fill('#apagar-senha','senha-do-teste-1'); await p.fill('#apagar-palavra','sim');
await p.locator('button[type=submit]').click(); await p.waitForTimeout(600);
(await p.locator('#apagar-senha').count()) ? ok('sem escrever APAGAR, não apaga') : erro('APAGOU sem a palavra');

await p.fill('#apagar-palavra','APAGAR'); await p.fill('#apagar-senha','senha-errada-mesmo');
await p.locator('button[type=submit]').click(); await p.waitForTimeout(900);
(await p.locator('#apagar-senha').count()) ? ok('com a senha errada, não apaga') : erro('APAGOU com senha errada');

/* E agora de verdade. */
await p.fill('#apagar-senha','senha-do-teste-1'); await p.fill('#apagar-palavra','APAGAR');
await p.locator('button[type=submit]').click(); await p.waitForTimeout(1800);
p.url().includes('/conta-apagada') ? ok('chega na confirmação, e não na tela de login')
                                   : erro(`foi parar em ${p.url().replace(U,'')}`);
const txt=(await p.innerText('body')).replace(/\s+/g,' ');
/Conta apagada/.test(txt) ? ok('a tela diz que a conta foi apagada') : erro('não confirma nada');
/LGPD/.test(txt) ? ok('explica o que ficou, e por quê') : erro('não explica o que ficou');

/* Recarregar é o que a pessoa faz quando não acredita. Sem sessão, a página
   tem de continuar de pé - é para isso que ela é pública. */
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(400);
/Conta apagada/.test(await p.innerText('body')) ? ok('continua lá depois de recarregar, sem sessão')
                                                : erro('some ao recarregar');

/* E voltar não pode devolver o perfil de uma conta que não existe. */
await p.goBack({waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(800);
p.url().includes('/perfil') ? erro('o botão voltar devolve o perfil apagado')
                            : ok('o botão voltar não devolve o perfil apagado');

await p.goto(`${U}/entrar/`,{waitUntil:'networkidle'});
await p.fill('#email','apagavel@exemplo.com.br'); await p.fill('#senha','senha-do-teste-1');
await p.click('button[type=submit]'); await p.waitForTimeout(900);
p.url().includes('/entrar') ? ok('a senha antiga não entra mais') : erro(`entrou: ${p.url()}`);

console.log(falhas?`\n${falhas} problema(s)`:'\napagar a conta funciona num navegador de verdade.');
await b.close(); s.close();
if (falhas) process.exit(1);
