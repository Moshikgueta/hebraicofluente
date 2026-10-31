# Auditoria de SEO - Hebraico Fluente (31/10/2026)

Pedido do dono: "Master prompt | SEO 10/10". Ramo `claude/seo-auditoria-1031`. **Nada foi publicado.**
Skills usadas: `seo-audit`, `schema`, `ai-seo`, `analytics` (os critérios delas, aplicados ao código).

## Como a auditoria foi feita, e o que ela NÃO viu

- **Contra a build de produção local** (`npm run build`, o mesmo export que vai ao ar). O site no ar
  (`hebraicofluente.com.br`) está bloqueado pela política de rede desta sessão: nenhuma medida aqui
  é do servidor de produção (cabeçalhos da Cloudflare, robots.txt gerenciado, tempo de resposta).
- **Rastreio próprio sem JavaScript**: um Chromium com JavaScript DESLIGADO abriu as 21 páginas do
  sitemap e coletou título, description, H1 a H3, alt das imagens, links internos, JSON-LD e texto.
  É o que um rastreador que não executa script vê.
- **Performance de laboratório**: Chromium com a emulação do Lighthouse móvel (CPU 4x mais lenta,
  150 ms de latência, 1,6 Mbps), build servida com gzip, mediana de 5 cargas. Não é dado de campo:
  o Google ranqueia pelo CrUX (usuários reais, percentil 75), que só o Search Console mostra.
- **Concorrência**: consultas reais de busca em 31/10/2026 para os termos principais (fontes no fim).
  **Nenhum volume de busca, dificuldade ou posição foi inventado**: sem Search Console nem ferramenta
  paga, eles aparecem como "não verificado".

---

## 1. Auditoria inicial

### O que já estava certo (e é raro)
- `sitemap.xml`, `robots.txt` e `llms.txt` gerados do que o build publica (`seo.mjs`); página paga
  nasce fora do sitemap pela mesma lista do portão; `noindex` nas páginas de conta e checkout, sem
  `Disallow` (que impediria ler o `noindex`); `X-Robots-Tag` nas rotas pagas.
- Canonical, Open Graph e cartão do WhatsApp em toda página pública; `www` → 301 → apex; barra final
  em 308; HTTPS com HSTS; `lang="pt-BR"`.
- **Todo o conteúdo está no HTML**: nenhuma das 21 páginas depende de JavaScript para mostrar texto
  (zero elementos escondidos à espera de script). A FAQ usa `<details>`, que o Google lê.
- Um H1 por página, zero links internos quebrados, toda imagem de conteúdo com `alt` descritivo
  (a única com `alt=""` é o fundo decorativo do hero, corretamente).
- JSON-LD de Organization (com CNPJ), Course, FAQPage, Person e BreadcrumbList; sem avaliação
  inventada. Atribuição de origem própria (busca, IA, Instagram...) até o pedido pago.

### Problemas encontrados

| # | Problema | Evidência | Impacto | Prioridade |
|---|---|---|---|---|
| P1 | **Conteúdo duplicado: `/` e `/curso-de-hebraico/` são a mesma página** | as duas com 1.573 palavras, mesmo título e description, cada uma com canonical em si mesma, as duas no sitemap, as duas com Course e FAQPage; o `Course.url` apontava a cópia, não a capa | Alto: o Google escolhe uma sozinho e divide os sinais (links, cliques) entre as duas | 1 |
| P2 | **LCP de laboratório da capa no celular 2,57 s** (meta 2,5 s) | o maior elemento pintado é o fundo do hero (`hero-mobile.webp`, 4,7 KB), pedido com `fetchPriority="low"` e servido só depois do retrato de 118 KB | Médio: Core Web Vitals é critério de desempate e de experiência | 1 |
| P3 | `Course` sem `hasCourseInstance` | JSON-LD da capa | Médio: sem ele o curso não é elegível ao resultado de curso ("Course info") do Google | 2 |
| P4 | Capa sem `WebSite` no JSON-LD | o nó existia só no grafo do portal, que saiu da capa em 27/10 | Baixo | 3 |
| P5 | Descriptions de `/cursos/hebraico-a1`, `a2` e `b1` com 180 caracteres, cortadas no meio da palavra ("...situação real em", "notí", "e e") | `checa-seo.mjs` só avisava | Baixo a médio (CTR) | 2 |
| P6 | Description da capa sem os dois motivos para clicar que a página cumpre: professor israelense e teste grátis | 141 caracteres, só "curso interativo... do zero" | Médio (CTR) | 2 |
| P7 | H1 de `/alfabeto-hebraico` sem a expressão "alfabeto hebraico" ("As 22 letras do hebraico, uma por uma.") | rastreio | Baixo | 3 |
| P8 | **Conteúdo informativo ralo para os termos de maior procura**: pilar do alfabeto com 436 palavras, 5 de 22 letras com página (cerca de 175 palavras cada), blog com 6 artigos em rascunho (`revisado: false`) | rastreio, `data/blog.json` | **Alto, o maior gargalo de crescimento**: sem páginas que respondam às buscas informativas, o site só compete pela marca e por "aprender a ler hebraico" | 1 (depende do dono) |
| P9 | **Canibalização nos rascunhos do blog**: o artigo `alfabeto-hebraico` disputa a mesma busca que a página `/alfabeto-hebraico`; `como-aprender-a-ler-hebraico` disputa com a capa | `data/blog.json` | Médio, quando publicados | 2 (antes de aprovar) |
| P10 | JavaScript de ~650 KB (descomprimido) em toda página pública, TBT de laboratório ~210 a 290 ms | medida | Médio para INP | 3 (proposta) |
| P11 | Search Console, sitemap enviado, Bing e as regras de robôs de IA da Cloudflare: **não verificáveis daqui** | sem meta de verificação no HTML (pode estar por DNS); rede bloqueada | Alto se não estiverem ligados | 1 (ação do dono) |
| P12 | `/sobre`: H3 logo depois do H1 ("O caminho até aqui") | rastreio | Baixo (semântica) | 4 |
| P13 | O funil do teste grátis (`d|<etapa>`) não guarda a ORIGEM da visita: não dá para saber quantos testes grátis vieram da busca | `api/estatisticas.js` | Médio para medir SEO de ponta a ponta | 2 (proposta) |

---

## 2. Matriz de palavras-chave

Volume, dificuldade e posição: **não verificados** (precisa do Search Console depois de 4 a 8 semanas,
ou de uma ferramenta paga). "Concorrência observada" é o que apareceu na busca de 31/10/2026.

| Palavra-chave | Intenção | Relevância | Potencial comercial | Concorrência observada | Página certa | Prioridade |
|---|---|---|---|---|---|---|
| aprender a ler hebraico | aprender (comercial-informativa) | máxima | alto | agregadores de cursos grátis (Cursa), guias genéricos | `/` (título já começa assim) | A |
| aprender hebraico do zero | comercial | máxima | alto | Cursa (vídeos do YouTube reunidos), Antishkola, Berlitz, Hotmart | `/` | A |
| curso de hebraico online | comercial (comparar e comprar) | alta (o curso é de leitura, não de conversação) | alto | Berlitz, Cursa, Superprof, AmazingTalker | `/` | A |
| alfabeto hebraico | informativa | alta | médio (porta de entrada) | MosaLingua, ExpatDen, Cursa, enciclopédias: **textos genéricos, sem áudio nem exercício** | `/alfabeto-hebraico` | A |
| letras do alfabeto hebraico / letras hebraicas e seus sons | informativa | alta | médio | idem | `/alfabeto-hebraico` (mesma intenção: **não criar página à parte**) | A |
| alfabeto hebraico com pronúncia | informativa | alta | médio | poucos com áudio em português | `/alfabeto-hebraico` + páginas por letra (gravação do professor) | A |
| \<letra\> hebraico (álef, mem, shin...) | informativa | média | baixo a médio | fraca em português | `/alfabeto-hebraico/<letra>` | B |
| como ler hebraico / hebraico para iniciantes | informativa | alta | médio | ExpatDen, Speechify, Cursa | guia novo (o rascunho `como-aprender-a-ler-hebraico`, redirecionado para esta intenção) | A |
| o que é nikud / vogais do hebraico | informativa | alta | médio | fraca | artigo `o-que-e-nikud` (rascunho pronto) | B |
| como ler a Bíblia em hebraico | informativa | alta para o público bíblico | médio | Logos, livros, cursos de teologia | `/biblia` (já responde com honestidade: ler sim, entender não) | A |
| hebraico bíblico para iniciantes | comercial-informativa | média (o curso alfabetiza, não ensina gramática bíblica) | médio | Logos, Cursa, Hotmart | `/biblia` (título pode citar) | B |
| diferença entre hebraico bíblico e moderno | informativa | média | baixo a médio | **quase só em inglês e espanhol** | artigo novo | B |
| como escrever em hebraico / letra cursiva hebraica | informativa | alta (o curso ensina a cursiva na tela) | médio | **fraca em português** (apps, livros em inglês) | artigo novo | A |
| como aprender hebraico sozinho | informativa | média | médio | blogs genéricos | guia de "como ler hebraico" (mesma intenção) | C |
| palavras em hebraico para viajar | informativa | média (público de viagem) | baixo | genérica | artigo `palavras-em-hebraico-para-viajar` (rascunho) | C |
| shalom significado | informativa | baixa para venda | baixo | dicionários | artigo `shalom-significado` (rascunho) | C |

A = fazer já · B = próximos 60 dias · C = depois de ver os dados do Search Console.

Leitura da matriz: as buscas **comerciais** têm concorrentes com marca forte (Berlitz) ou volume de
vídeos grátis (Cursa); a capa já está bem posicionada para elas no texto. A oportunidade real está
nas buscas **informativas** em que os resultados em português são fracos e genéricos, e em que o
Hebraico Fluente tem algo que ninguém tem: a gravação do professor, o erro comum do brasileiro e a
escrita na tela. É também onde a busca por IA procura respostas para citar.

---

## 3. Plano de otimização

1. **Feito neste ramo** (sem página nova, sem mudar visual, preço, checkout, conta ou progresso):
   P1, P2, P3, P4, P5, P6, P7, e a conferência automática passou a cobrar essas regras.
2. **Precisa da sua aprovação** (texto ou decisão de produto): P8, P9, P12 e as propostas da
   seção 10 (H1 da capa, título da capa, links do corpo da capa para o alfabeto).
3. **Precisa de você fora do código**: P11 (Search Console, Bing, Cloudflare), checklist na seção 9.
4. **Proposta técnica para depois**: P10 (peso de JavaScript), P13 (origem no funil do teste grátis).

---

## 4. Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `app/src/lib/seo.ts` | `ESPELHOS` e `canonicaDe`: `/curso-de-hebraico` com canonical na capa, fora do sitemap, sem `noindex` |
| `app/seo.mjs` | a mesma lista; o sitemap deixa o espelho de fora e o relatório o mostra |
| `app/checa-seo.mjs` | confere o espelho; description acima de 155 reprova em toda página; o Course precisa de instância online, um módulo por módulo, endereço = canonical, e nunca avaliação |
| `app/src/lib/jsonld.ts` | Course com `hasCourseInstance`, `courseSchedule`, nível, pré-requisito, `teaches`, `syllabusSections`, `image`; `WebSite` na página do curso; Course aponta a capa |
| `app/src/i18n/telas/motor-jsonld.ts` | os textos novos do Course, em português e inglês |
| `app/src/i18n/telas/venda-curso-de-hebraico.tsx` | meta description da capa (155 caracteres), português e inglês |
| `app/src/i18n/telas/venda-alfabeto-hebraico.tsx` | H1: "Alfabeto hebraico: as 22 letras, uma por uma." (e o inglês) |
| `app/src/app/cursos/[slug]/page.tsx` | description fecha na última frase inteira que cabe em 155 |
| `app/src/components/landing/Hero.tsx` | o fundo do hero sem `fetchPriority="low"` |
| `app/tests/seo.test.ts` | o espelho e a lista igual nos dois lados |
| `CLAUDE.md` | a seção "SEO de 31/10/2026" e o passo a mais em "Para voltar" do portal |

O site em inglês (`fluent-hebrew`) tem o mesmo código: estas mudanças entram lá pelo `git merge` de
sempre, na mesma rodada (regra dos dois sites). Este ramo não tem acesso àquele repositório.

---

## 5. Correções implementadas, uma a uma

**P1 · a página duplicada.** `/curso-de-hebraico/` continua respondendo (links de campanha, e-mails e
o portão levam para lá), mas declara a capa como canonical, sai do sitemap e do `llms.txt`, e não
leva `noindex` (canonical e noindex juntos se contradizem). O `Course` e a oferta apontam a capa.
Quando o portal voltar para a capa, basta tirar a linha de `ESPELHOS`.

**P2 · LCP.** Medido antes de mudar, com três variantes no HTML gerado:

| Variante | LCP (mediana de 5) | Retrato chega em |
|---|---|---|
| A: como estava | 2,57 s | 2,31 s |
| B: fundo sem prioridade baixa | 1,14 a 1,20 s | 2,35 s |
| C: B + retrato menor para celular | 1,08 a 1,10 s | 2,35 s (o navegador ainda escolhe o grande em telas densas) |

Ficou a B, uma linha: o fundo de 4,7 KB deixa de esperar o retrato. **Leitura honesta:** o indicador
que o Google mede (LCP) melhora, e de verdade (a primeira tela fica completa mais cedo), mas o
retrato do professor continua chegando em ~2,3 s; ele já está bem comprimido (re-codificar a 80%
economizaria só 6%). A C foi descartada: traria um arquivo novo para ganho só em celular de tela
pouco densa.

**P3 e P4 · dados estruturados.** O Course ganhou o que o Google pede para o resultado de curso, e
nada foi inventado: `courseMode: Online`; `courseSchedule` = a frase da FAQ ("cada letra leva cerca de
dez minutos... quem estuda uma por dia termina em cerca de um mês"), isto é, 10 min por dia,
`repeatCount` = letras + lições de som (as mesmas que a FAQ conta); `educationalLevel: Iniciante` e
`coursePrerequisites` = o "do zero" da capa; `teaches` = a lista da seção "O que você aprende";
`syllabusSections` = os módulos do currículo que a capa mostra; o professor como `instructor`.
Sem `aggregateRating`, `review` ou número de alunos, e a conferência agora recusa os dois primeiros.

**P5.** As três descriptions fecham na última frase inteira (120, 124 e 66 caracteres).

**P6.** Capa, 155 caracteres: "Aprenda a ler hebraico do zero com um professor israelense: as 22
letras, as vogais e palavras reais, com correção na hora. Teste grátis da primeira letra." As duas
promessas são cumpridas na própria página (hero com o professor; aula aberta do Álef, sem conta).

**P7.** H1 do alfabeto com a expressão que se busca, sem mudar o tom.

---

## 6. Testes executados

| Teste | Resultado |
|---|---|
| `npm test` (vitest, com o export do conteúdo) | 174 arquivos, 1.847 testes passando, 43 pulados (os que dependem dos repositórios privados, como antes) |
| `npm run build` (export estático de produção) | ok, 234 páginas (build local e build com `NEXT_PUBLIC_PLATFORM_API=worker`, a que vai ao ar) |
| `node seo.mjs` + `node checa-seo.mjs` (com as regras novas) | ok: 20 anunciáveis, 1 espelho (`/curso-de-hebraico/` → `/`), JSON-LD Organization, WebSite, Course, FAQPage e Person, preço e CNPJ conferidos |
| Rastreio sem JavaScript das páginas do sitemap | 20 páginas, 0 links internos quebrados, 0 description acima de 155, 0 canonical repetido, `/curso-de-hebraico/` com canonical na capa e fora do sitemap |
| Performance de laboratório depois da mudança | capa: LCP 1,12 s (era 2,57), FCP 1,12 s, CLS 0, TBT ~270 ms; alfabeto: LCP 0,81 s, CLS 0,04 |
| Conferências do projeto (pacote, promessas, números, check-legal) | promessas, números e check-legal ok; pacote ok na build de produção (`NEXT_PUBLIC_PLATFORM_API=worker`): nenhum conteúdo pago no pacote público. Na build local ele acusa, como sempre: ali o curso vai ao navegador de propósito (modo de demonstração, `lib/content.ts`) |
| `npm run validate` (ordem das letras, nikud) | 0 violações, 4 avisos (os de antes) |
| Verificação de travessão (as duas linhas do CLAUDE.md) | só os dois falsos positivos de antes: um mp3 (binário) e a própria linha do comando no CLAUDE.md |
| Teste de Resultados Avançados do Google (Rich Results Test) | **não verificado**: precisa da URL pública depois da publicação |
| PageSpeed Insights / CrUX (dados de campo) | **não verificado**: rede bloqueada; ver no Search Console |

---

## 7. Auditoria final e nota

Notas por evidência. **Não é 100**: o que falta não se resolve com código, e parte do que foi feito
só se prova depois da publicação e da indexação.

| Critério | Peso | Antes | Depois | Por quê |
|---|---|---|---|---|
| SEO técnico | 25 | 20 | 23 | base já excelente; a duplicação era o único defeito estrutural. Faltam 2 por não haver prova de produção (cabeçalhos, robots da Cloudflare, Search Console) |
| Conteúdo e palavras-chave | 20 | 9 | 10 | a capa é forte (1.573 palavras, objetiva, com prova); o resto é ralo para as buscas informativas, e o blog está todo em rascunho. **É aqui que mora o crescimento**, e depende de texto aprovado por você |
| Performance e mobile | 15 | 10 | 12 | LCP de laboratório 2,57 → ~1,2 s, CLS 0, sem rolagem lateral; TBT ~250 ms pelo peso de JavaScript; campo não verificado |
| Arquitetura e links internos | 10 | 6 | 7 | tudo a 2 cliques e sem links quebrados; o espelho consolidou os links; mas o alfabeto só é linkado pelo rodapé e 17 letras não têm página |
| Dados estruturados | 10 | 6 | 9 | Course completo e coerente com a página; falta a validação no Rich Results Test em produção |
| Autoridade e confiabilidade | 10 | 7 | 7 | CNPJ, endereço, políticas, /sobre e credenciais verificáveis, zero depoimento inventado; falta autoridade de fora (links, menções), que é trabalho fora do site |
| SEO orientado a conversão | 10 | 7 | 8 | teste grátis na própria página, CTA claro, origem "busca" e "IA" medida até a compra; a description agora vende o teste; o funil do teste grátis ainda não sabe a origem |
| **Total** | **100** | **65** | **76** | |

---

## 8. Plano de conteúdo para 90 dias

Tudo o que é texto novo passa por você antes de ir ao ar; hebraico novo, também (regra do projeto).

**Dias 1 a 30 · fundação e as páginas que já existem**
- Publicar este ramo (com a sua autorização) e ligar o Search Console e o Bing (seção 9).
- Revisar os 6 rascunhos do blog, com duas mudanças antes de aprovar (canibalização, P9):
  - `alfabeto-hebraico`: **não publicar como artigo**; o melhor do texto vai para a página
    `/alfabeto-hebraico`, que passa de 436 para ~1.200 palavras e vira a página-pilar.
  - `como-aprender-a-ler-hebraico`: mudar o foco para "como ler hebraico" (o passo a passo: direção,
    consoantes, nikud, primeiras palavras), com link para a capa. Assim a capa fica com a busca de
    compra e o artigo com a de "como fazer".
  - os outros quatro (`o-que-e-nikud`, `hebraico-da-direita-para-a-esquerda`,
    `palavras-em-hebraico-para-viajar`, `shalom-significado`) podem seguir como estão.
- Cada artigo aprovado: link para a letra do alfabeto que cita e um convite ao teste grátis.

**Dias 31 a 60 · as buscas em que o português está vazio**
- Páginas das letras 6 a 11, no mesmo formato aprovado (opção B: palavra com a gravação, erro
  comum do brasileiro, letras parecidas), e cada uma com ~300 palavras.
- Artigo "Letra cursiva hebraica: como se escreve à mão" (o diferencial da escrita na tela).
- Artigo "Hebraico bíblico e hebraico moderno: o que muda para quem vai ler" (a resposta honesta
  que `/biblia` já dá, aplicada à pergunta que se busca).

**Dias 61 a 90 · decidir pelos dados**
- Ler o Search Console: as páginas com impressão nas posições 8 a 20 recebem a revisão primeiro
  (é o ganho mais rápido); as letras com impressão crescendo ditam as próximas 11 páginas.
- Só então decidir sobre "hebraico para quem vai a Israel" e as páginas por intenção de viagem.

Acompanhamento:

| Métrica | Onde | Dia 30 | Dia 60 | Dia 90 |
|---|---|---|---|---|
| Páginas indexadas | Search Console, "Páginas" | as 20 do sitemap indexadas; `/curso-de-hebraico/` como "cópia, canônica declarada pelo usuário" | + artigos aprovados | + letras novas |
| Impressões e cliques orgânicos | Search Console, "Desempenho" | linha de base (não há antes) | crescimento semana a semana | idem |
| CTR e posição média | idem | linha de base da capa e do alfabeto | comparar a description nova | |
| Visitas da busca na página do curso | `/admin/estatisticas` (`f|venda-visto|busca`) | linha de base | | |
| Checkout aberto vindo da busca | idem (`f|checkout-aberto|busca`) | | | |
| Compras da busca e da IA | `/admin/vendas` (`orders.origem` = `busca` ou `ia`) | | | |
| Core Web Vitals de campo | Search Console, "Core Web Vitals" | só aparece com tráfego suficiente | | |

---

## 9. Checklist: Search Console, Bing, Cloudflare e GA4

**Google Search Console** (grátis, só leitura para o site)
1. search.google.com/search-console → Adicionar propriedade → **Domínio** → `hebraicofluente.com.br`.
2. O Google mostra um registro TXT. Na Cloudflare: DNS → Registros → Adicionar → Tipo TXT, Nome `@`,
   Conteúdo = o valor do Google → Salvar. Voltar e clicar em Verificar (pode levar minutos).
   (A propriedade de domínio cobre o `www`, o `workers.dev` não.)
3. Sitemaps → enviar `https://hebraicofluente.com.br/sitemap.xml`.
4. Inspeção de URL → `https://hebraicofluente.com.br/` e `/alfabeto-hebraico/` → "Solicitar indexação".
5. Depois desta publicação, inspecionar `/curso-de-hebraico/`: deve dizer "canônica declarada pelo
   usuário: https://hebraicofluente.com.br/".
6. Configurações → Usuários: só a sua conta. Nenhum token ou senha vai para o repositório.

**Bing Webmaster Tools** (alimenta a busca do Copilot e de parte dos assistentes de IA)
- bing.com/webmasters → "Importar do Google Search Console": traz o site e o sitemap de uma vez.

**Cloudflare, robôs de IA** (não deu para conferir daqui)
- Segurança → Bots (ou "AI Crawl Control"): ver se "Bloquear robôs de IA" ou o robots.txt gerenciado
  estão ligados. Se estiverem, o arquivo servido no ar não é o nosso. Para aparecer nas respostas de
  busca por IA, deixar passar pelo menos Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User e
  PerplexityBot (os de busca). Bloquear os de treino (GPTBot, CCBot) é escolha sua e não afeta o Google.
- Conferir abrindo `https://hebraicofluente.com.br/robots.txt` no navegador: deve ter só
  `User-agent: *`, `Allow: /` e o `Sitemap:`.

**GA4: recomendação de NÃO instalar agora.** O site já mede o funil que o briefing pede, sem
cookie e sem mandar dado a terceiros (a Política de Privacidade diz isso):

| Evento pedido | Já existe como | Onde se lê |
|---|---|---|
| `view_landing_page` | `venda-visto`, por origem (`busca`, `ia`, `instagram`...) | /admin/estatisticas |
| `click_free_trial` / `start_free_trial` | etapas `visto` e `reconhecer` do teste grátis | idem, "Teste grátis da capa" |
| `complete_free_trial` | etapa `pronto` (e `cta`, o clique depois) | idem |
| `begin_checkout` | `checkout-aberto`, por origem | idem |
| `purchase` | pedido pago com `orders.origem` | /admin/vendas |

Instalar o GA4 pediria: aviso de consentimento (LGPD, cookies não essenciais), artigo 4 da Política de
Privacidade reescrito e versão nova das políticas, a CSP aberta para o Google, e ~50 a 90 KB de script
em toda página (contra a meta de INP). Se um dia for necessário (por exemplo, para anúncio no Google
Ads), a ordem é essa, com Consent Mode e o script só depois do "aceito".
**A única lacuna real** é P13: o teste grátis não guarda a origem. A proposta é somar a origem que o
aparelho já guarda (`lib/origem.ts`) à chave do funil (`d|<etapa>|<fonte>`); pede uma linha a mais
na Privacidade e passa por você.

---

## 10. Recomendações futuras, por impacto e esforço

| # | Recomendação | Impacto | Esforço | Precisa de |
|---|---|---|---|---|
| 1 | Ligar Search Console e Bing, conferir os robôs na Cloudflare | alto | 15 min | você |
| 2 | Página-pilar `/alfabeto-hebraico` com ~1.200 palavras (o texto do rascunho do blog) | alto | baixo (o texto existe) | sua revisão |
| 3 | Publicar os 5 artigos sem canibalização (com o ajuste do "como ler hebraico") | alto | baixo | sua revisão |
| 4 | Páginas das 17 letras restantes, em lotes, guiadas pelo Search Console | alto | médio | sua revisão do texto |
| 5 | Dois artigos onde o português está vazio: cursiva e bíblico x moderno | médio a alto | médio | texto novo, sua revisão |
| 6 | Na capa, um link no corpo para `/alfabeto-hebraico` (perto do currículo ou da aula aberta) | médio | baixo | sua aprovação (texto da capa) |
| 7 | Testar o H1 da capa com a palavra da busca, por exemplo "Aprenda a ler hebraico com quem nasceu em Israel" (só acrescenta "a ler") | médio | baixo | decisão sua (o H1 é seu, de 29/10) |
| 8 | Origem no funil do teste grátis (P13) | médio | baixo | sua aprovação (Privacidade) |
| 9 | Reduzir o JavaScript das páginas de conteúdo (alfabeto, bíblia, método): elas não precisam do motor da conta inteiro | médio (INP) | médio a alto | só código |
| 10 | Autoridade de fora: parcerias que já existem (associação sefardita, criadores) com link para o alfabeto, não só para a venda | alto, lento | contínuo | você |
| 11 | Quando o site em inglês tiver domínio: `hreflang` recíproco entre os dois domínios | médio | baixo | o domínio |
| 12 | `/sobre`: o "O caminho até aqui" como H2 (P12) | baixo | mínimo | só código |

## Fontes da pesquisa de concorrência (31/10/2026)
- [Cursa: curso de hebraico online e gratuito](https://cursa.app/curso-hebraico-online-e-gratuito)
- [Cursa: O Alfabeto Hebraico](https://cursa.app/pt/artigo/o-alfabeto-hebraico)
- [MosaLingua: alfabeto hebraico](https://www.mosalingua.com/pt/alfabeto-hebraico/)
- [ExpatDen: como começar a aprender o alfabeto hebraico](https://www.expatden.com/pt-br/israel-pt-br/como-comecar-aprender-alfabeto-hebraico/)
- [Berlitz: hebraico](https://www.berlitz.com/pt-br/idiomas/hebraico)
- [Antishkola: hebraico com professor nativo](https://antishkola.com/pt/hebrew/)
- [Logos: Hebraico Bíblico para Principiantes](https://www.logos.com/product/220933/hebraico-biblico-para-principiantes)
- [The Israel Bible: hebraico bíblico x moderno](https://theisraelbible.com/whats-the-difference-between-biblical-hebrew-and-modern-hebrew-zephaniah-39/)
- [Superprof: aulas de hebraico](https://www.superprof.com.br/aulas/hebraico/brasilia-distrito-federal/)
