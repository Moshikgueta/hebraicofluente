/* Busca as fotos candidatas das missões no Wikimedia Commons (28/10/2026).
   Roda na Action "Fotos das missões" (a rede da sessão do Claude não chega ao
   Commons). Para cada busca de tools/fotos-missoes-pedido.json, pega as
   primeiras fotos com licença livre, baixa a versão de 1200 px e escreve a
   ficha de cada uma em fotos-candidatas/missoes/candidatas.json. Nenhuma vai
   ao ar daqui: a escolha é do dono, e a foto escolhida passa para
   data/fotos-missoes.json com aprovada: true.

   Desde 28/10/2026 serve também ao "Hebraico na rua": com argumentos, lê
   outro pedido e grava em outra pasta, e o id sai do grupo do pedido.
     node tools/fotos-missoes-buscar.mjs tools/fotos-rua-pedido.json rua r */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const [, , PEDIDO = 'tools/fotos-missoes-pedido.json', PASTA = 'missoes', PREFIXO = 'm'] = process.argv;
const pedido = JSON.parse(readFileSync(join(RAIZ, PEDIDO), 'utf8'));
const DESTINO = join(RAIZ, 'fotos-candidatas', PASTA);
mkdirSync(DESTINO, { recursive: true });
const UA = 'HebraicoFluente/1.0 (https://hebraicofluente.com.br; contato@hebraicofluente.com.br)';
const LIVRE = /^(public domain|pd|cc0|cc by(-sa)? \d(\.\d)?)/i;
const texto = h => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

/* Uma busca nova SOMA às candidatas que já existem: os ids das que o dono
   já viu não mudam. */
const ARQ = join(DESTINO, 'candidatas.json');
const candidatas = existsSync(ARQ) ? JSON.parse(readFileSync(ARQ, 'utf8')).candidatas : [];
const vistas = new Set(candidatas.map(c => c.titulo));
const feitas = new Set(candidatas.map(c => c.busca));
for (const b of pedido.buscas) {
  if (feitas.has(b.q)) continue;
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: `${b.q} filetype:bitmap`,
    gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1200'
  });
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  const j = await r.json();
  const paginas = Object.values(j.query?.pages ?? {}).sort((a, c) => (a.index ?? 0) - (c.index ?? 0));
  let n = 0;
  for (const pg of paginas) {
    if (n >= pedido.porBusca) break;
    const ii = pg.imageinfo?.[0]; if (!ii || vistas.has(pg.title)) continue;
    const m = ii.extmetadata ?? {};
    const licenca = texto(m.LicenseShortName?.value);
    if (!LIVRE.test(licenca)) continue;
    if (!ii.thumburl || (ii.thumbwidth ?? 0) < 800) continue;
    vistas.add(pg.title);
    const grupo = b.missao ?? b.grupo;
    const id = `${PREFIXO}${grupo}-${candidatas.filter(c => (c.missao ?? c.grupo) === grupo).length + 1}`;
    const arquivo = `${id}.jpg`;
    const img = await fetch(ii.thumburl, { headers: { 'User-Agent': UA } });
    if (!img.ok) continue;
    writeFileSync(join(DESTINO, arquivo), Buffer.from(await img.arrayBuffer()));
    candidatas.push({
      id, ...(b.missao != null ? { missao: b.missao } : { grupo: b.grupo }), busca: b.q, titulo: pg.title, arquivo,
      pagina: ii.descriptionurl, autor: texto(m.Artist?.value) || null, licenca,
      licencaUrl: texto(m.LicenseUrl?.value) || null, data: texto(m.DateTimeOriginal?.value) || null,
      descricao: texto(m.ImageDescription?.value).slice(0, 400) || null,
      largura: ii.thumbwidth, altura: ii.thumbheight
    });
    n++;
  }
  console.log(`${b.q}: ${n}`);
}
writeFileSync(join(DESTINO, 'candidatas.json'), JSON.stringify({ geradoEm: new Date().toISOString(), candidatas }, null, 2) + '\n');
console.log(`total: ${candidatas.length}`);
