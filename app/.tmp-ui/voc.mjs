import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const B='http://127.0.0.1:8787'; const MAIL=readFileSync('/tmp/claude-0/ui-mail','utf8').trim();
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await (await br.newContext()).newPage();
const r=await p.request.post(`${B}/api/auth/login`,{data:{email:MAIL,password:'senha-boa-123'}}); console.log('login',r.status());
p.on('response',x=>{if(x.url().includes('/api/'))console.log(x.status(),x.url())}); console.log(await p.context().cookies()); await p.goto(`${B}/vocabulario/`,{waitUntil:'load'}); await p.waitForTimeout(5000);
console.log(p.url(), await p.$$eval('button[aria-label^="Ouvir"]',b=>b.length), (await p.textContent('main'))?.slice(0,300));
await br.close();
