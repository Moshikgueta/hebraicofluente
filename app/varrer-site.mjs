/* Varredura: todas as rotas públicas em duas larguras, procurando rolagem
   lateral e erro de console. */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
const s=createServer((q,r)=>{const c=decodeURIComponent(q.url.split('?')[0]);for(const f of [`out${c}`,`out${c}/index.html`,`out${c}.html`,'out/404.html']){if(!existsSync(f))continue;try{const b=readFileSync(f);r.writeHead(200,{'Content-Type':T[f.slice(f.lastIndexOf('.'))]||'application/octet-stream'});return r.end(b)}catch{}}r.writeHead(404);r.end('404')});
await new Promise(r=>s.listen(4402,r));
const ROTAS = ['/','/metodo/','/cursos/','/cursos/alfabetizacao/','/sobre/','/faq/','/entrar/','/criar-conta/','/checkout/alfabetizacao/','/termos/','/privacidade/','/reembolso/','/suporte/'];
const b=await chromium.launch({executablePath:process.env.HF_CHROMIUM});
let ruim = 0;
for (const w of [390, 1280]) {
  const p=await b.newPage({viewport:{width:w,height:900}});
  for (const rota of ROTAS) {
    const erros=[];
    p.removeAllListeners('console');
    p.on('console', m => { if (m.type()==='error') erros.push(m.text()); });
    await p.goto(`http://127.0.0.1:4402${rota}`,{waitUntil:'networkidle'});
    await p.waitForTimeout(500);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight }));
    const over = m.sw > m.iw + 1;
    if (over || erros.length) ruim++;
    console.log(`${String(w).padEnd(5)} ${rota.padEnd(28)} ${String(m.h).padStart(6)}px ${over ? 'OVERFLOW ' + m.sw : 'ok'} ${erros[0] ? 'ERRO: '+erros[0].slice(0,70) : ''}`);
  }
  await p.close();
}
console.log(ruim === 0 ? 'tudo limpo' : `${ruim} problema(s)`);
await b.close(); s.close();
