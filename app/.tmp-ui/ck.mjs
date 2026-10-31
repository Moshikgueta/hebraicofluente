import { chromium } from 'playwright';
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await (await br.newContext()).newPage();
const log=[]; const t0=Date.now();
p.on('request',r=>log.push(`${Date.now()-t0} > ${r.url().slice(22,90)}`)); p.on('requestfinished',r=>log.push(`${Date.now()-t0} < ${r.url().slice(22,90)}`));
let ok=true; await p.goto('http://127.0.0.1:8787/checkout/alfabetizacao/',{waitUntil:'networkidle',timeout:12000}).catch(()=>ok=false);
console.log(ok, log.length); console.log(log.slice(-12).join('\n'));
await br.close();
