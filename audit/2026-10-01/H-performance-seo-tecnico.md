# H - Performance, SEO/compartilhamento e qualidade técnica (01/10/2026)

Base: main @ 6d6302d, build atual em app/out servida por `wrangler dev --local` em http://127.0.0.1:8787.
Nenhum arquivo do repositório foi alterado. Única escrita fora do scratchpad: `node seo.mjs` regravou
app/out/sitemap.xml e app/out/robots.txt (saída de build, gitignored; o diff contra a cópia anterior saiu vazio).
Conta própria criada para não derrubar aparelhos das outras frentes: `perf-h-1790814715@example.invalid`
(id 28, entitlement local `AUDIT-H` inserido por SQL no D1 local).

Scripts e capturas: scratchpad/audit2/H-perf.mjs, H-film.mjs, H-film2.mjs, H-repeat.mjs, H-heap.mjs,
H-console.mjs, H-seo.mjs, H-fonts.mjs, H-offline.mjs, H-perf-rapido.json, H-perf-lento.json, capturas-H/.

## Medições (Chromium, viewport 390x844 móvel, cache desligado)

"Lento" = CDP Network.emulateNetworkConditions no perfil Fast 3G do Lighthouse (562,5 ms RTT, 1,47 Mbps) + CPU 4x.
INP medido por Event Timing num clique real (aproximado: 1 interação por página).
Atenção: localmente não há latência de borda; os números "rápido" são o piso, os "lentos" são o que importa
para um celular médio em 3G/4G ruim.

| Página | Modo | FCP | LCP (elemento) | CLS | INP | TBT | TTI aprox. | Reqs | KB transferidos (gzip) |
|---|---|---|---|---|---|---|---|---|---|
| / (capa) | rápido | 540 | 540 (IMG hero) | 0 | 48 | 271 | 798 | 49 | 498 (JS 247 · fontes 177 · RSC 30 · HTML 21 · CSS 17 · img 6) |
| / (capa) | lento | 1924 | 2936 (IMG hero) | 0 | 112 | 887 | 4917 | 49 | 498 |
| /cursos/alfabetizacao/ | rápido | 284 | 284 | 0 | 40 | 0 | 171 | 47 | 483 |
| /cursos/alfabetizacao/ | lento | 2776 | 2776 | 0 | 72 | 591 | 4364 | 47 | 483 |
| /entrar/ | rápido | 152 | 152 | 0 | 16 | 19 | 245 | 57 | 524 (RSC 73, 14 prefetches) |
| /entrar/ | lento | 2344 | 2344 | **0,587** | 48 | 186 | 4108 | 58 | 525 |
| /licao/alef/ (logado) | rápido | 184 | 964 | **0,156** | 0 | 37 | 297 | 70 | 664 (JS 311 · fontes 177 · /api/content 79 · RSC 61 · mp3 9) |
| /licao/alef/ (logado) | lento | 2412 | **7296** | **0,157** | 24 | 425 | 7272 | 69 | 660 |

Tela "em branco" em conexão lenta: o HTML é pré-renderizado, então a primeira pintura (cabeçalho, rodapé) vem em
1,9-2,8 s. O CONTEÚDO útil demora mais onde ele depende de JavaScript: formulário de /entrar e /criar-conta em
4,4-4,6 s; a lição em 7,3 s (esqueleto cinza de 2,4 s a ~7 s, capturas-H/licao-5000.png). O checkout mostra o
título em 2,8 s (é pré-renderizado) e a página do curso em 2,3 s.

Export: 85 arquivos JS em _next/static (2,0 MB brutos), 1 CSS (85 KB bruto, 17 KB gzip), 11 woff2 (177 KB),
4 imagens em /media (hero.webp 15 KB 1280x725, hero-mobile.webp 4,6 KB 640x362, moshik.webp 118 KB 680x850 lazy,
og.jpg 53 KB 1200x630), 539 mp3 (9,9 MB, média 18 KB, nenhum baixado em massa: a lição pede 1-2 clipes).
JS de primeira carga (build.log): 103 KB compartilhado, capa 181 KB, lição 192 KB, públicas 114-123 KB (gzip).

---

## Achados

### PERF-001 | Prioridade: P1 | Confiança: CONFIRMADO
Local: wrangler.toml:61 (`run_worker_first = true`) + worker/src/worker.js:239,344-393 (`blindar` não define cache para ativos)
Problema: todo arquivo do site, inclusive os de nome com hash em /_next/static (imutáveis por construção), sai com
`Cache-Control: public, max-age=0, must-revalidate`, e todo pedido passa pelo Worker. Resultado: o navegador nunca
reaproveita nada sem perguntar, e cada pergunta é uma invocação do Worker.
Evidência: `curl -sI /_next/static/chunks/framework-*.js` → `public, max-age=0, must-revalidate`. H-repeat.mjs,
mesma aba, segunda visita à lição: **68 pedidos, 68 na rede, 0 do cache (46 x 304, 22 x 200)**; capa na volta:
44 na rede (17 x 304). Uma carga completa custa 47-70 invocações (tabela acima), não as 15 que G-infra/INFRA-007
estimou em 28/09.
Por que importa: (1) no plano Free (ainda em uso: CLAUDE.md "Limite de 10 ms de CPU", PBKDF2 25k) o teto é
100.000 invocações/dia; a ~60 por carga completa isso são ~1.600 cargas completas por dia, e ao estourar o Worker
recusa TUDO, inclusive a página de vendas, até 00:00 UTC. A estimativa de G ("1.000 alunos ≈ 300-400k") fica
3-4x maior: ~300-400 alunos ativos/dia + tráfego de campanha já encostam no teto. (2) Em rede móvel cada
revalidação é uma ida e volta: 46 perguntas para abrir de novo uma aula que o aparelho já tem.
Impacto no cliente: volta ao curso mais lenta todo dia; num dia de campanha, site inteiro fora.
Correção sugerida: em `blindar`, para `path.startsWith('/_next/static/')`, `Cache-Control: public, max-age=31536000,
immutable` (some com 35+ pedidos por volta). Melhor ainda: `run_worker_first` em lista
(`["/*", "!/_next/static/*", "!/fonts/*", "!/media/*", "!/amostra-audio/*", "!/tracado-amostra/*"]`) para que esses
nem invoquem o Worker (pedido de ativo sem Worker não conta na cota), com `_headers` para nosniff/HSTS nesses
caminhos. /audio e /stroke-order continuam passando pelo portão. E, como G já pediu, Workers Paid antes de campanha.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (mexe no caminho de todo ativo; rodar portao.mjs/pacote.mjs depois)

### PERF-002 | Prioridade: P1 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: worker/src/worker.js:239 (`env.ASSETS.fetch`) para /audio/*.mp3 e /amostra-audio/*.mp3; contraste com worker/src/api/audio.js:125-160
Problema: o próprio código diz "O Safari só toca mídia de servidor que responde a `Range` (ele pede `bytes=0-1`
antes de tudo)" e implementa 206 só para as gravações do painel (D1). Os 539 mp3 do git e os 7 da capa saem
pelo servidor de ativos, e localmente ele ignora o Range.
Evidência: `curl -s -D - -o /dev/null -H 'Range: bytes=0-1' http://127.0.0.1:8787/amostra-audio/shalom.mp3` →
`HTTP/1.1 200 OK Content-Length: 11956` (sem 206, sem Content-Range, sem Accept-Ranges); o mesmo com cookie pago
em /audio/he-7d989155.mp3. Nenhum teste do repositório cobre Range em arquivo estático (grep vazio fora de
gravacao-painel.test.ts). Não dá para saber daqui se o servidor de ativos de PRODUÇÃO responde 206.
Por que importa: o áudio é o centro do curso (ouvir cada letra, sílaba, palavra) e a capa vende com "Ouça e fale".
Se a produção fizer como o local, iPhone/iPad (público grande no Brasil) aperta "Ouvir" e não ouve nada.
Impacto no cliente: aluno de iPhone sem som; possível onda de reembolso.
Correção sugerida: verificar hoje: `curl -sI -H 'Range: bytes=0-1' https://hebraicofluente.com.br/amostra-audio/shalom.mp3`
deve dar `206` + `Content-Range: bytes 0-1/11956`, e tocar 3 clipes num iPhone real (capa e lição). Se der 200,
servir os mp3 pelo mesmo caminho de `audio.servir` (fatiar o corpo do ASSETS.fetch quando houver Range) e pôr a
checagem de 206 no e2e do deploy.
Complexidade: Pequena | Claude corrige sozinho?: Sim (a verificação no iPhone é do dono)

### PERF-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/entrar/page.tsx:18 e app/src/app/criar-conta/page.tsx:15 (`<Suspense fallback={null}>`)
Problema: `useSearchParams` sob um Suspense com fallback nulo faz o Next exportar /entrar e /criar-conta com o
`<main>` VAZIO (o HTML exportado não tem nenhum input; marcador BAILOUT_TO_CLIENT_SIDE_RENDERING também em
/esqueci-senha, /nova-senha, /confirmar-email, /sair-da-lista, /checkout/.../obrigado). O formulário só nasce
depois de baixar e hidratar ~250 KB de JS.
Evidência: H-film2.mjs em Fast 3G + CPU 4x: FCP 2,4-2,5 s, formulário visível só em 4,4 s (/criar-conta) e
4,6 s (/entrar); capturas-H/entrar-3000.png mostra cabeçalho, faixa vazia e o rodapé subido. Quando o
formulário entra, o rodapé salta: CLS 0,587 (fonte do deslocamento: FOOTER), "ruim" pela régua do Google.
Por que importa: são as duas portas da compra (o checkout manda criar conta/entrar). Dois segundos de página vazia
com rodapé no meio parecem página quebrada; quem toca num link do rodapé que está pulando sai do funil.
Impacto no cliente: perda de conversão no celular em rede fraca.
Correção sugerida: fallback com a forma do formulário (mesmo tamanho: título, 2 campos, botão desabilitado) ou
renderizar o formulário sem Suspense e ler `?next=` num `useEffect` com `window.location.search`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

### PERF-004 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/shell/CourseGate.tsx:86 (+ efeito que exige `allowed` antes de buscar) · app/src/lib/content.ts:322 · Link do Next sem `prefetch` em AppShell/rodapé
Problema: a lição é uma cascata em série: HTML (esqueleto) → JS → `/api/me` → só então `/api/content`
(296 KB brutos, 79 KB gzip, `private, no-store`, rebaixado a cada carga completa) → render. Enquanto isso 15
prefetches RSC de links do rodapé/menu (`/suporte`, `/termos`, `/privacidade`, `/loja`...) disputam a mesma banda.
Evidência: H-film.mjs (lento): `/api/me` 5278 ms, `/api/content` só em 5887 ms, prefetches de 4256 a 7097 ms,
conteúdo da lição aparece ~7,3 s (LCP 7296 ms); de 2,4 s a ~7 s o aluno vê blocos cinza (capturas-H/licao-5000.png).
Rápido: LCP 964 ms. CLS 0,156 nos dois modos (o rodapé desce quando o esqueleto vira aula).
Por que importa: o HTML de rota paga só sai do Worker depois de o portão conferir sessão e direito; quando ele
chega, o `/api/me` já é sabido "sim". Esperar por ele é uma ida e volta a mais em toda primeira tela do dia.
Impacto no cliente: ~1 s a mais por abertura em 3G, esqueleto longo, salto do rodapé.
Correção sugerida: nas rotas do curso, disparar `carregarConteudo()` já na montagem (em paralelo ao `/api/me`) e
descartar o resultado se a sessão disser não; `prefetch={false}` nos links de rodapé/jurídicos da casca do aluno;
`min-height` do esqueleto próximo ao da aula. Opcional: ETag no `/api/content` (é por conta, mas estável).
Complexidade: Pequena | Claude corrige sozinho?: Sim

### PERF-005 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/faq/page.tsx:158 (promessa) · ausência de service worker
Problema: o FAQ promete "O que você fizer sem internet fica guardado no aparelho e sobe sozinho quando a conexão
voltar - o curso funciona no ônibus". Guardar o progresso offline é verdade (merge local); "o curso funciona" não:
não há service worker, as rotas não pré-buscadas não abrem e o áudio é `no-store`.
Evidência: H-offline.mjs: lição aberta online, rede cortada; `/mapa/` e `/revisao/` (já pré-buscadas) abrem;
`/licao/mem/` (a próxima aula) vira a página de erro do Chrome "No internet ... ERR_INTERNET_DISCONNECTED";
recarregar também.
Por que importa: promessa comercial que o produto não cumpre no caso descrito (ônibus = conexão que cai).
Impacto no cliente: aluno perde a tela no meio do estudo e acha que o site caiu.
Correção sugerida: o mínimo é ajustar o texto ("se a conexão cair no meio de uma aula, o que você fez fica
guardado e sobe quando ela voltar"). Fazer valer de verdade é um service worker com cache da casca, das rotas do
curso e dos mp3 (Grande; cuidado com conteúdo pago em cache e com o portão). HANDOFF COM.
Complexidade: Mínima (texto) / Grande (offline real) | Claude corrige sozinho?: Revisar antes (texto comercial é do dono)

### PERF-006 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/layout.tsx:17-63 (4 famílias `localFont`, todas com preload padrão)
Problema: 11 `<link rel=preload as=font>` (177 KB, ~36% dos bytes da capa) em TODA página, em prioridade alta,
competindo com o JS na primeira visita. Nas páginas públicas 4 delas não são usadas.
Evidência: H-fonts.mjs: na capa, /cursos, /entrar e /faq as faces usadas são display 500/600/700, ui 400/500/600,
hebrew 400; nunca display 400 (22 KB), hebrew 500/600 (16 KB) nem a cursiva Gveret Levin (11 KB). E `ui 700`
aparece em texto sem face 700 (negrito sintetizado pelo navegador). UX-021 de 28/09 já contava os 11 preloads.
Por que importa: ~50 KB e 4 pedidos de alta prioridade a menos na primeira tela de quem chega por anúncio.
Impacto no cliente: pequeno em 4G, ~0,3 s em 3G.
Correção sugerida: `preload: false` na cursiva e em `hebrew`/`display` dos pesos raros (seguem disponíveis sob
demanda com `display: swap`); trocar `font-bold` de UI por `font-semibold` ou incluir o 700.
Complexidade: Mínima | Claude corrige sozinho?: Sim

### PERF-007 | Prioridade: P3 | Confiança: CONFIRMADO
Local: AccountProvider (app/src/lib/account) e store de progresso: GET /api/me e GET /api/progress sem sessão
Problema: QA-005 de 28/09 continua e cresceu: todo visitante em toda página pública dispara `GET /api/me` 401 e
agora também `GET /api/progress` 401: 2 erros vermelhos no console e 2 invocações do Worker por página vista.
Evidência: H-console.mjs, visitante em 8 páginas (/, /cursos/alfabetizacao, /entrar, /criar-conta, /checkout, /faq,
/metodo, /sobre): em cada uma `HTTP 401 /api/me`, `HTTP 401 /api/progress`, 2x "Failed to load resource: 401".
Aluno pago em 7 páginas (/inicio, /mapa, /licao/bet, /academia, /perfil, /revisao, /desafio-final): 0 erros.
Por que importa: soma na cota do PERF-001 exatamente no tráfego de campanha; console vermelho atrapalha
diagnóstico (erro real some no ruído).
Correção sugerida: `/api/me` responde 200 `{signedIn:false}` para visitante; o progresso só chama a API depois de
`signedIn`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

### PERF-008 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/gate.js:63 (`/audio` no GATED) + worker/src/worker.js:227-235 + blindar (`private, no-store`)
Problema: cada clipe de áudio é uma requisição ao Worker com 3-4 leituras de D1 (sessão, conta, aparelho,
direito) + 1 consulta em `gravacoes`, e sai `private, no-store`: um clipe já ouvido em outra aula ou noutro dia é
baixado e conferido de novo.
Evidência: `curl -b cookie /audio/he-7d989155.mp3` → `Cache-Control: private, no-store`; H-repeat.mjs: mp3 nunca
vem do cache.
Por que importa: latência por toque em rede ruim (o som chega atrasado em relação ao toque) e mais invocações.
Correção sugerida: `private, max-age=86400` para mp3 (o cache `private` é só do aparelho do aluno; o portão já
barra quem não pagou no primeiro pedido). Decisão de segurança: HANDOFF SEC.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes

### SEO-001 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src (nenhum `application/ld+json`)
Problema: o site não tem nenhum dado estruturado: nem Organization (com o CNPJ de data/empresa.json), nem Course
com provider, nem Product/Offer, nem FAQPage no /faq, nem Person para o professor. Não há, portanto, preço em
JSON-LD para divergir de data/courses.json, nem `priceValidUntil` 31/10/2026 a vencer.
Evidência: `grep -rn "ld+json" app/src` vazio; H-seo.mjs: `ld: []` nas 15 páginas do sitemap.
Por que importa: oportunidade, não defeito. Course/Organization/FAQPage dão resultado rico e confiança para quem
procura "curso de hebraico online". Se for feito: preço e `priceValidUntil` gerados de courses.json
(`brl`, `preLancamentoAte`) e conferidos pelo checa-seo.mjs, senão no dia 01/11/2026 o Google mostra preço vencido.
Correção sugerida: um componente `<JsonLd>` alimentado por courses.json/empresa.json na capa, /cursos/alfabetizacao,
/faq e /sobre (Person só com o que o dono informou, regra do CLAUDE.md).
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (texto sobre o dono e preço)

### SEO-002 | Prioridade: P3 | Confiança: CONFIRMADO
Local: servidor de ativos (html_handling padrão) via worker/src/worker.js:239
Problema: URL sem barra final redireciona com 307 (temporário), não 301/308.
Evidência: `curl -A Googlebot /cursos` → `307 /cursos/`; `/cursos/alfabetizacao` → 307; `/index.html` → 307 `/`.
Por que importa: pouco, porque toda página tem canonical absoluto com barra (H-seo.mjs) e o sitemap só lista a
forma com barra. Links externos sem barra passam autoridade por um redirect temporário.
Correção sugerida: no Worker, antes do ASSETS.fetch, 308 para a forma com barra quando o caminho não tem extensão.
Complexidade: Mínima | Claude corrige sozinho?: Sim

### SEO-003 | Prioridade: P3 | Confiança: CONFIRMADO
Local: vários (lista abaixo)
Problema / Evidência (H-seo.mjs, curl):
- /cursos/ não tem `<h1>` (4 `<h2>`; o primeiro, "Comece pelo alfabeto.", deveria ser o h1).
- /entrar e /criar-conta: 0 h1 no HTML (efeito do PERF-003; são noindex, então só a11y/UX).
- 404 sai com o título genérico da raiz ("Hebraico Fluente - a plataforma de hebraico para brasileiros"), igual ao
  das rotas pagas (título duplicado entre /404 e /licao/*; ambas fora de índice, sem efeito de busca).
- description da capa com 208 caracteres (cortada em ~155 no resultado).
- `/faq/index.txt` e demais payloads RSC saem `text/plain` sem `X-Robots-Tag: noindex` (risco baixo de o Google
  indexar o .txt descoberto ao renderizar).
- Sem `apple-touch-icon` nem `/favicon.ico` (ambos 404, cada um passando pelo Worker); só `icon.svg`. "Adicionar à
  tela de início" no iPhone usa captura da página.
Correção sugerida: h1 em /cursos; `metadata.title` no not-found; encurtar a description; `X-Robots-Tag: noindex`
para `*.txt` no blindar; `apple-icon.png` 180x180 em app/src/app.
Complexidade: Mínima | Claude corrige sozinho?: Sim

### TEC-001 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/landing/{Transformacao.tsx, AlemDoAlfabeto.tsx, DiagramaDeTracado.tsx}; Secoes.tsx (`Problema`, `Demonstracao`, `Jornada` e os painéis `PainelAula..PainelProgresso`, `Cadeado`)
Problema: código morto da capa antiga: nenhum import (grep), ~900 linhas. NÃO entra no bundle: as frases
"eu acabei de entender uma coisa", "De onde vem este alfabeto", "Seu hebraico come..." não aparecem em nenhum
chunk de out/_next (tree-shaking funciona). Custo só de manutenção (e do grep de travessão/promessas lendo texto
que ninguém vê). Também morto: app/public/fonts copia 40 arquivos (Inter, DM Sans, Noto Sans Hebrew, latin-ext)
para out/fonts (624 KB publicados), usados só por tools/audio-script.mjs; o site usa 11.
Correção sugerida: apagar os componentes/funções mortos; copiar para public/fonts só as famílias do layout.
Complexidade: Mínima | Claude corrige sozinho?: Sim

### TEC-002 | Prioridade: P3 | Confiança: CONFIRMADO
Local: package.json (raiz)
Problema: a raiz não tem package-lock e declara `wrangler ^4.42.0`; instalado localmente 4.138.0, enquanto o CI e
o setup fixam 4.135.0 (scripts/cloudflare-setup.sh:22). `npm audit` na raiz falha (ENOLOCK).
Por que importa: `wrangler dev`/`deploy` manual roda versão diferente da publicação; auditoria de dependências da
raiz impossível.
Correção sugerida: fixar `"wrangler": "4.135.0"` e versionar o lock da raiz.
Complexidade: Mínima | Claude corrige sozinho?: Sim

### TEC-003 | Prioridade: P3 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: app/out/_next/static/css/01e7fbf339394141.css (Tailwind 4.3.3)
Problema: Tailwind 4 mira Safari 16.4+/Chrome 111+. O CSS usa `@layer` (5x; Safari < 15.4 ignora o bloco inteiro
= página sem estilo), `@property` (61x) e `color-mix` (46x, este com `@supports` de reserva). Usos de `:has()`
(só tema escuro de alto contraste) e `100dvh` (altura mínima da casca) degradam sem quebrar.
Por que importa: iPhones presos em iOS 15.3 ou anterior (6/6 Plus e mais antigos, e quem não atualiza) veriam o
site sem layout. Fatia pequena em 2026, mas não medida.
Correção sugerida: abrir capa, checkout e uma lição num iOS 15.x e 16.0-16.3 (BrowserStack ou aparelho); se
quebrar, aviso de "navegador desatualizado" via `@supports not (color: color-mix(in lab, red, red))`.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

---

## Aprovados (PASS)

- PASS | Portão contra buscador, provado com curl (UA Googlebot, sem cookie): /licao/alef/, /licao/alef,
  /licao/alef/index.html, /licao/alef/index.txt, `?_rsc=`, /LICAO/ALEF/, /licao%2Falef/, //licao/alef/,
  /licao/alef/index, /licao/alef.html, /./licao/alef/, /licao/../licao/alef/, /mapa/, /audio/*.mp3,
  /stroke-order/*.svg → todos 302 para /entrar com `Cache-Control: private, no-store` e `X-Robots-Tag: noindex,
  nofollow`. O HTML pago está em app/out/licao/* mas o Worker decide antes do ASSETS.fetch (run_worker_first).
  /admin/* responde 200 (casca sem dados) com noindex + no-store; `/_csp-hashes.json` → 404.
- PASS | `node seo.mjs && node checa-seo.mjs` (EXIT 0): sitemap com 15 URLs públicas, 82 pagas e 16 não listadas
  fora; nenhuma rota paga nem /admin no sitemap; robots `Allow: /` + Sitemap (correto: Disallow esconderia o
  noindex). Regravação idêntica à anterior.
- PASS | Metadados: 15 páginas do sitemap com title único (26-58 caracteres), description, canonical absoluto com
  barra, `lang="pt-BR"`, og:title/description/url/site_name/locale pt_BR/image 1200x630 + alt, twitter
  summary_large_image; páginas de conta/checkout com `noindex`; 1 h1 por página exceto /cursos (SEO-003); 0 `<img>`
  sem alt.
- PASS | og.jpg: 1200x630, 53 KB, diz "27 lições · 22 letras"; data/modules.json soma 3+4+3+3+7+3+4 = 27 lições.
  COM-001 de 28/09 ("21 lições") resolvido.
- PASS | Cabeçalhos de API: /api/me, /api/progress, /api/orders, /api/health, /api/audio/manifest `no-store`;
  /api/content `private, no-store`; páginas pagas `private, no-store` + noindex. Nada privado é cacheável.
- PASS | Links internos: 40 hrefs únicos do HTML exportado → todos 200 com sessão paga.
- PASS | 404: rota inexistente devolve status 404 com a página do site ("Esta página não existe") também para
  visitante. QA-001 de 28/09 resolvido.
- PASS | Vazamento de memória: 30 navegações SPA (10 lições x 3 voltas, `window.next.router.push`, mesmo
  documento): heap 6,1 → 8,5 → 8,7 → 8,5 MB, 211 nós, 337 listeners. Estável.
- PASS | Hidratação/console do aluno: 0 pageerror e 0 erro de console em 7 telas do curso e nas 30 navegações.
- PASS | Imagens: hero com width/height, `fetchPriority=high`, `loading=eager` e versão mobile 640px (4,6 KB);
  retrato lazy. CLS 0 na capa e na página do curso. LCP da capa = hero (540 ms local, 2,9 s em Fast 3G).
- PASS | Áudio: 539 mp3 (9,9 MB) nunca baixados em lote; 1-2 por tela.
- PASS | `npx tsc --noEmit` limpo (4,8 s; strict + noUncheckedIndexedAccess + noUnusedLocals);
  `npx vitest run` 85 arquivos, 1087/1087; `npm audit` em app: 0 vulnerabilidades (prod e dev);
  /tmp/claude-0/build.log: 116 páginas, 0 avisos, 0 erros.
- PASS | Dependências: next 15.5.26, react 19.2.8, wrangler 4.135 no CI. Há next 16.3.8 e react 19.3.0, mas
  nenhuma vulnerabilidade conhecida na linha atual; não vale migrar de major antes do lançamento.
- PASS | APIs com reserva: MediaRecorder/getUserMedia conferidos antes do uso (GravarLeitura.tsx:77,
  CompararPronuncia.tsx:150), SpeechRecognition com `falaDisponivel()` e prefixo webkit (lib/fala.ts:90),
  AudioContext criado no clique. Polyfills do Next só para `nomodule`.

## NÃO TESTADO
- Produção (proxy bloqueia): compressão real, HTTP/3, latência de borda, Range no servidor de ativos real (PERF-002).
- Safari/iOS real: gravação, reconhecimento de fala he-IL, Tailwind 4 em iOS antigo (TEC-003).
- INP sob uso prolongado (exercícios em sequência); medi 1 interação por página (16-112 ms).
- Lighthouse oficial (não instalado); números acima vêm de PerformanceObserver + CDP.
- Beacon do Cloudflare Web Analytics na zona (INFRA-008): não verificável daqui.

## (1) Estado do que 28/09 apontou na área H
- G-infra INFRA-007 (cota do plano Free): CONTINUA e está subestimado: medido 47-70 invocações por carga completa
  (não 15), e 44-68 mesmo na volta com cache. Ver PERF-001.
- G-infra INFRA-008 (browser-check com timeout por networkidle): RESOLVIDO no critério (worker/browser-check.mjs:73
  espera networkidle com catch; a etapa agora sai com o código do check). Beacon na zona: não verificável.
- G-infra INFRA-015 (HSTS sem preload): RESOLVIDO no cabeçalho (`preload` presente); inscrição na lista é do dono.
- A-qa QA-001 (404 vira login): RESOLVIDO (status 404 e página própria para visitante).
- A-qa QA-005 (ruído 401/403 no console): CONTINUA e agora são dois 401 por página (PERF-007). O 403 de prefetch de
  /meu-hebraico para conta sem compra não foi reverificado.
- F-ux UX-021 (11 preloads de fonte): CONTINUA (PERF-006), com a medida do que não é usado.
- H-com COM-001 (og.jpg "21 lições"): RESOLVIDO (27).
- A-qa QA-002/003/004/006: fora da área H, não reverificados.

## (2) Nota da área: 74/100
Base sólida: export estático, HTML pré-renderizado, CLS 0 nas páginas de venda, portão provado contra buscador,
sitemap gerado do próprio portão, metadados completos, tipos estritos, 1087 testes, 0 vulnerabilidades, sem
vazamento. O que impede subir: cache zero para ativos imutáveis somado a toda requisição passar pelo Worker no
plano Free (PERF-001: performance de volta e risco de site inteiro fora em dia de campanha) e a dúvida concreta
sobre áudio no iPhone (PERF-002, verificável em 5 minutos). Depois deles, a lição em 3G (7 s) e o formulário de
login/cadastro que aparece 2 s depois da página.

## (3) Os 5 maiores problemas
1. PERF-001 (P1): ativos com hash sem cache (max-age=0) e todo pedido no Worker: 68/68 pedidos na volta à lição;
   ~60 invocações por carga, cota Free de 100k/dia estoura com ~1.600 cargas.
2. PERF-002 (P1, verificar): mp3 estáticos respondem 200 a `Range: bytes=0-1` localmente; o próprio código diz que o
   Safari não toca sem 206. Conferir produção e iPhone já.
3. PERF-004 (P2): lição em cascata /api/me → /api/content + 15 prefetches: LCP 7,3 s em Fast 3G, CLS 0,156.
4. PERF-003 (P2): /entrar e /criar-conta exportados vazios; formulário só em 4,4-4,6 s em 3G, CLS 0,587.
5. PERF-005 (P2): FAQ promete "o curso funciona no ônibus"; offline a próxima aula abre a página de erro do navegador.
