import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const B='http://127.0.0.1:8787'; const MAIL=readFileSync('/tmp/claude-0/ui-mail','utf8').trim();
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const ctx=await br.newContext({viewport:{width:320,height:700}}); const p=await ctx.newPage();
await p.request.post(`${B}/api/auth/login`,{data:{email:MAIL,password:'senha-boa-123'}});
await p.goto(`${B}/teclado-hebraico/`,{waitUntil:'networkidle'}); await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{const W=document.documentElement.clientWidth;const out=[];for(const el of document.querySelectorAll('body *')){const r=el.getBoundingClientRect();if(r.right>W+1&&r.width>0){const ch=[...el.children].some(c=>c.getBoundingClientRect().right>W+1);if(!ch)out.push(`${el.tagName}.${(el.className||'').toString().slice(0,80)} right=${Math.round(r.right)} w=${Math.round(r.width)} txt=${(el.textContent||'').trim().slice(0,40)}`)}}return out.slice(0,10).join('\n')}));
await br.close();
