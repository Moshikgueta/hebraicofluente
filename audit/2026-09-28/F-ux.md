# F - UX + Acessibilidade + RTL (Hebraico Fluente, 28/09/2026)

Ambiente: http://127.0.0.1:8787 (wrangler dev, build worker), Chromium Playwright. Conta hf-ux-7511@example.invalid (id 8) com entitlement `alfabetizacao` (order `ux-audit-7511`) e progresso semeado (8 letras) via PUT /api/progress - apagar depois (ver "limpeza" no fim). 23 rotas auditadas em 1280/640/390/360/320 px, ~300 elementos tabulados, contraste medido no computado, 7 scripts prontos + 7 scripts próprios (scratchpad/scripts/ux-audit*.mjs, saídas em *.out.txt, capturas em scratchpad/shots/).

## Problemas

UX-001 | P1 | app/src/app/cursos/[slug]/CourseClient.tsx:129 | Página de vendas mostra marcação crua `{{בּ}} · {{כּ}} · {{פּ}}` (e `{{צ׳}} · {{ג׳}}`) no módulo 5 e 7 | body.innerText de /cursos/alfabetizacao contém 5 ocorrências de `{{…}}`; `m.subPt` é renderizado como string, enquanto /mapa e /modulo usam `<Prose text={m.subPt}/>` | Trocar `{m.subPt}` por `<Prose text={m.subPt} />` (e conferir `topicPt` se um dia entrar aqui)
UX-002 | P2 | app/src/app/licao/[letterId]/LessonClient.tsx + components/learn/ExercisePlayer.tsx + components/game/* | Foco cai no `<body>` a cada troca de etapa e a cada resposta; nos jogos, o botão respondido é desabilitado e o foco pula para os links do rodapé | Após Enter em "Continuar": activeElement=BODY, scrollY=531; após tecla 2 no quiz: BODY, opções `disabled`; Batalha/Blast/Impressa/Teste após Space: foco em "Reembolso e cancelamento"/"Precisa de ajuda?" | Ao trocar etapa/pergunta mover o foco para o `h2` da etapa (tabindex=-1) ou para a primeira opção; ao responder, manter o foco no botão "Continuar" do feedback (não desabilitar o botão que tem foco antes de reposicioná-lo)
UX-003 | P2 | app/src/components/shell/BotaoAcessibilidade.tsx:114 | Diálogo "Ajustes de acessibilidade" abre sem receber foco e fica ANTES do botão no DOM: Tab a partir do botão aberto sai do diálogo para "Pular para o conteúdo" | timeline 50/300/800 ms: foco permanece no botão; 1º Tab → skip link; 13 controles tabuláveis dentro do diálogo nunca alcançados por Tab (só por Shift+Tab) | Ao abrir, `focus()` no primeiro controle (ou no diálogo com tabindex=-1) e prender o Tab dentro; Escape já fecha e devolve o foco (ok)
UX-004 | P2 | app/src/components/shell/PublicShell.tsx:165-177 | Menu móvel (☰) não fecha com Escape; `aria-expanded` continua `true` e o scroll do fundo continua travado | após Escape: expanded=true, foco em "Como funciona", body overflow hidden | keydown Escape → fechar e devolver foco ao botão ☰ (mesmo padrão do BotaoAcessibilidade:81)
UX-005 | P2 | app/src/components/game/CacaLetra.tsx:206 | Todas as células da grade têm `aria-label="letra"`: leitor de tela ouve "letra, botão" 12 vezes e não sabe qual letra é qual - jogo injogável sem visão | outerHTML `<button aria-pressed="false" aria-label="letra" …>`; alvo anunciado só como "0 de 3 nesta grade" | `aria-label={`letra ${nomeDaLetra}`}` (ou deixar o texto hebraico com lang="he" como nome) e no alvo "Encontre todas as letras Álef"
UX-006 | P2 | app/src/styles/tokens.css (--teal #1F8A7D) usado como texto e como fundo de botão | Teal falha 4.5:1 em todo fundo claro: 4.00 sobre creme, 4.21 sobre branco, 3.70 sobre areia, 3.68 sobre gold-soft; branco sobre teal 4.21 | Landing: botão "🎤 Fale e seja corrigido" (branco/teal, 14 px), "Você está no lugar certo." (23 px não-bold), "72%"; FAQ: links "Gênesis 1:1…"; /mapa: rótulo "Meu curso"; lição: `dt` "Certo" 3.68 | Para texto e botão sólido usar `--teal-ink` #12665C (5.9:1 sobre teal-soft, 7.1 sobre branco) e reservar `--teal` para bordas, barras e ícones decorativos
UX-007 | P2 | app/src/components/shell/AppShell.tsx:354 | Dica da sidebar "Nos exercícios, 1-4 respondem e Enter avança" em branco 70% sobre navy, 11.5 px | contraste 3.76:1 em todas as 16 páginas da plataforma | `text-white/90` (≥ 8:1) ou 13 px com white/85
UX-008 | P3 | app/src/styles/tokens.css:92 (--ink-muted #66716D) | Comentário diz "passa 4.5:1 sobre o creme", mas o secundário é usado sobre areia (4.45), teal-soft (4.37) e gold-soft (4.43) | /entrar, /criar-conta, /checkout ("7 módulos · 27 lições"), /inicio, /perfil, /certificado, lição ("De onde sai o som", "Sai") | Escurecer para #5F6A66 (≈4.9 sobre areia) ou usar `--ink-body` nos fundos tingidos
UX-009 | P3 | tokens.css (--locked #A8AFAB) + landing "Em breve" #9AA29E | Texto informativo "Em breve" a 2.13:1 (/mapa sobre creme) e 2.61 (landing sobre branco) - não é controle inativo, é conteúdo | medido em /mapa e / | ≥ #7A837F (4.5:1) mantendo o ícone de cadeado
UX-010 | P3 | app/src/app/teclado-hebraico/* (cabeçalho `grid gap-2`, h1, parágrafo) | Rolagem lateral de 15 px a 320 px (zoom 400 %) - única rota que falha reflow | scrollWidth-clientWidth=15; elementos com right>322: HEADER.grid, H1, P, DIV.grid gap-5 | conferir padding/`min-w-0` do container; as outras 22 rotas passam
UX-011 | P3 | app/src/app/vocabulario/VocabularioClient.tsx:117 | 32 botões com o mesmo nome "Ouvir" - leitor de tela não sabe qual palavra toca | focusables: BUTTON:Ouvir ×12 na primeira tela | `<AudioButton … ariaLabel={`Ouvir ${w.translit}`}>` (o componente já aceita `ariaLabel`, AudioButton.tsx:148)
UX-012 | P3 | app/src/components/learn/AudioButton.tsx:65,111 | Falha de áudio é engolida (`catch(() => {})`): com /audio/* devolvendo 404 nada muda na tela, sem aria-live, sem `aria-pressed`/`aria-busy` durante a reprodução | rota bloqueada em /licao/mem: live=[], pressed=null | Estado visível "Áudio indisponível - tente de novo" em `role=status` + `aria-pressed` enquanto toca
UX-013 | P3 | components/game/Batalha.tsx, Match.tsx, TestRun.tsx (Teste), CacaLetra.tsx | Durante o jogo o `<main>` não tem nenhum heading (h1/h2) e o jogo "Teste" não tem `aria-live` - acerto/erro não é anunciado | MAIN.h=[] em 6 jogos; Teste: live=[] antes e depois de responder | `h2` visualmente discreto com o nome do jogo e o mesmo `aria-live="polite"` que Blast/Batalha já usam
UX-014 | P3 | AppShell.tsx:354 promete "1-4 respondem" | Atalhos numéricos só existem em ExercisePlayer e Blast (únicos com keydown); em Batalha, Impressa × cursiva, Match e Teste a tecla 1 não faz nada | key1: Blast → "Quase. A resposta era j."; Batalha/Impressa/Teste → sem efeito | ou implementar nos quatro, ou limitar a promessa a "nas lições"
UX-015 | P3 | components/landing/Transformacao.tsx:95; app/teclado-hebraico (instruções Gboard); CourseClient.tsx:129 | Hebraico fora de `lang="he"`: `<span class="he">ש מ ל א</span>` sem lang; "No Gboard: Idiomas → עברית", "A barra de espaço mostra…" | heNoLangCount: / =1, /teclado-hebraico =2, /cursos =2 | usar `<He>` (que já carimba lang="he") em vez de `span.he` cru
UX-016 | P3 | components/platform/AuthForm.tsx | Erro de login é anunciado (`role=alert` "E-mail ou senha não conferem.") e o foco vai para a senha, mas os campos não recebem `aria-invalid` nem `aria-describedby` apontando para a mensagem | ariaInvalid=0, describedby=0 | adicionar os dois atributos quando `erro` existe (WCAG 3.3.1)
UX-017 | P3 | BotaoAcessibilidade.tsx (botão flutuante 52×52 em bottom-right) | A 360 px o botão cobre o texto corrido (main vai até x=344, botão começa em 292) - última linha de cada parágrafo fica tapada ao rolar | /teclado-hebraico 360: overlapsText=true; visível na captura | reservar `padding-right`/`scroll-padding` no main abaixo de 640 px ou encolher o botão para 44 px encostado na barra inferior
UX-018 | P4 | components/game/CacaLetra.tsx + toast de conquista (role=status) | Toast "Conquista desbloqueada" cobre a instrução "Encontre todas as letras iguais a esta" e o alvo | captura shots/game2-Caaletra.png | posicionar o toast abaixo do cabeçalho do jogo ou no canto inferior
UX-019 | P4 | app/src/app/layout.tsx:118 (skip link → `#conteudo`, `<div>` sem tabindex) | Funciona no Chromium (próximo Tab cai no `summary` dentro do main), mas o alvo não é focável - Safari/Firefox antigos podem não mover o ponto de partida | activeElement=BODY após Enter; Tab seguinte inMain=true | `tabindex="-1"` no `#conteudo`
UX-020 | P4 | app/src/app/checkout/[slug]/CheckoutClient.tsx:102 | Página nunca atinge `networkidle` (setInterval) já no passo 1, antes de existir pedido | Playwright timeout em /checkout/alfabetizacao com visitante | só iniciar a sondagem depois de `orderId` existir
UX-021 | P4 | app/out/index.html | Landing carrega 14 scripts = 773 KB (não comprimido) + 11 preloads de fonte (192 KB woff2); LCP local 300-350 ms (IMG hero.webp 15 KB, fetchPriority=high), CLS 0 | perf: transferBytes 484 KB, 47 requests | ok para vender; se quiser, preload só das 3 fontes do hero e `next/dynamic` para OuvirEFalar (gravador) - sem urgência
UX-022 | P4 | HomeClient / componentes de landing com reveal-on-scroll | Na captura a 360 px o bloco "Mesmo que hoje você não reconheça…" aparece cinza-claro (meio da animação); computado ao final: opacity 1, cor #1B211F, e com reduced-motion inicia em 1 | shots/landing-360.png vs REVEAL after | nada a fazer; registrado para não ser confundido com contraste
UX-023 | P4 | worker/src/worker.js gate + app públicas | Toda página pública dispara `GET /api/me` e `/api/progress` → 401 no console (2 erros por página) | consoleErrors em /, /entrar, /faq… | só chamar quando existir cookie de sessão (document.cookie não vê `__Host-`… então usar um flag em localStorage após login) - cosmético

## Aprovado

PASS | Um h1 por página, sem saltos de nível | 23 rotas: h1=1, headingSkips=[] em todas
PASS | Landmarks (main, nav com aria-label, header, footer) + skip link "Pular para o conteúdo" funcional | landmarks presentes em todas; Tab seguinte ao skip cai dentro do main
PASS | Foco visível em 100 % dos ~300 elementos tabulados; nenhuma armadilha; nenhum tabindex positivo | noFocusRing=[] em todas as rotas; Tab sempre chega ao fim
PASS | Ordem de foco lógica (skip → logo → nav → conteúdo → rodapé); nav da plataforma com `aria-current` | sequências TAB registradas em ux-audit.out.txt
PASS | Formulários: todo input com label (login, cadastro, checkout, perfil, busca do vocabulário); autocomplete email/current-password/name; "Mostrar senha" com aria-pressed + aria-controls e sem quebrar o autocomplete | inputsNoLabel=[] em todas; a11y.mjs "olho da senha" ✓
PASS | Erros anunciados: login (`role=alert`), cadastro/throttle (`role=alert`), pagamento 502 ("Não conseguimos gerar o pagamento agora, e o problema é nosso… nada foi cobrado" em `role=alert`) | ux-audit5/6
PASS | Checkout: 2 passos claros, `fieldset` "Forma de pagamento" com PIX/Cartão (rádios), preço/desconto/parcelas, condições da compra e links legais no fluxo; aluno com curso vê "Já é seu" sem preço | ux-audit6 PAY step
PASS | Imagens: nenhuma `<img>` sem alt; SVG do "Onde nasce o som" com nome ("Corte da cabeça de perfil…"); canvas do traçado `role=img` + aria-label; hero decorativo alt="" | imgsNoAlt=[] em todas
PASS | Botões de áudio com nome: "Ouvir a letra", "Ouvir devagar", "Ouvir o nome: Álef", "ma: ouvir e praticar" (aria-pressed nas sílabas) | LESSON alef/mem
PASS | Gravador: nome "● Gravar a minha"; sem microfone → "Não consegui gravar…"; permissão negada → texto próprio (GravarLeitura.tsx:143) explicando o cadeado do navegador; Permissions-Policy `microphone=(self)` só em / e rotas pagas, `()` no resto | curl com cookie: /licao/alef/, /inicio/, / = self; /faq = ()
PASS | Sem autoplay de áudio: 0 `play()` no carregamento da lição; 1 após Enter no botão | AUTOPLAY plays=0/1
PASS | Traçado não bloqueia teclado: "Ver o traçado", "Próxima etapa →" e "Conferir" acessíveis; feedback em `role=status` ("Quase! Tente seguir…") | TRACE stage
PASS | Lição: teclas 1-4 respondem e Enter avança; feedback em `aria-live=polite` com explicação | QUIZ key2/Enter
PASS | Jogos operáveis por teclado (todas as opções são `<button>`), sem drag-and-drop, sem arrastar; Blast sem limite de tempo (Blast.tsx:12); Match com cronômetro opcional (aria-pressed) | GAME play/tab
PASS | RTL/Unicode: `.he` = direction rtl + unicode-bidi isolate + `lang="he"` (He.tsx:121/135/163); 126 runs na landing; separadores `aria-hidden`; input do teclado hebraico `dir="auto"`, colar `שָׁלוֹם` e digitar após ArrowLeft preserva nikud | heIsolate=true em todas
PASS | Fontes: Noto Serif Hebrew 400/500/600 + Gveret Levin (cursiva) self-hosted via next/font, preload; carregada (`document.fonts` "hebrew" loaded); nikud com avanço zero (ב 25.875 = בָּ 25.875; שלום = שָׁלוֹם 102.6 px) → marcas posicionadas como combining, não como caixa | NIKUD width
PASS | Reflow: sem rolagem lateral a 320/360/390/640 px em 22 de 23 rotas (exceção UX-010); zoom 200 % (640 px) na lição sem clipping | scrollX=0
PASS | Alvos: todos ≥ 24 px (WCAG 2.5.8) exceto o skip link oculto; nav móvel 50×60, botões 44-52 px; nenhum alvo sob a barra fixa (toque.mjs) | TAP small=[]
PASS | prefers-reduced-motion: 0 animações e 0 transições >50 ms na landing e na lição; o menu de acessibilidade tem "menos animação" próprio | REDUCED-MOTION
PASS | Modo escuro (medido no worker, não no escuro.mjs): plataforma escurece (#0E1416), vitrine e /entrar continuam claros; texto 11.6-16.3:1, secundário 7.0:1, cartão 9.6-10.5:1; sem lampejo (atributo no HTML gerado); escuro + alto contraste = preto/branco 17.8:1 | DARK /inicio /licao/alef / /entrar
PASS | Tamanho 150 %, espaçamento (só português), alto contraste 7:1, persistência entre páginas, Alt+Shift+A | a11y.mjs completo ✓
PASS | Sem JavaScript: export estático entrega o conteúdo - landing 14 k caracteres com h1, /cursos 3.7 k, /faq 5.6 k (details/summary nativos); /entrar entrega o shell (formulário é React) | NOJS
PASS | Console limpo nas 16 rotas pagas; 404 só em /extra/dj (slug inexistente → página "Esta página não existe" com "Voltar ao início") | consoleErrors=[]
PASS | Copy em português claro e consistente: "Meu curso/Revisão/Praticar/Progresso/Palavras/Aula 0/Recompensas/Perfil" iguais na sidebar e na barra móvel; estados vazios explicam o próximo passo ("Ainda não há o que revisar", "O som Chaf ainda não abriu", "Ainda falta um pouco" + link) | textos coletados
PASS | Perfil → apagar conta: confirmação inline com senha (label "Sua senha") + "Escreva APAGAR", foco vai para o campo, Cancelar presente | PERFIL confirm
PASS | Menu móvel: abre com Enter, foco vai para "✕ Fechar menu", scroll do fundo travado, 5 links | (fecha só por clique/✕ - ver UX-004)
PASS | LCP landing 300-350 ms local (hero.webp 15 KB, mobile 4.6 KB), CLS 0, fontes self-hosted (CSP self) | PERF landing

## Scripts prontos

PASS | app/a11y.mjs | tudo ✓ (botão, 150 %, contraste 7:1, espaçamento, animação, persistência, 390 px, olho da senha)
PASS | app/toque.mjs | nenhum alvo sob a barra fixa em 390/430/834/1000 px (servidor estático próprio, sem portão)
PASS | app/capa.mjs | 1280 e 390: hero, 1 h1, percurso, "Além do alfabeto" → /biblia, barra fixa aparece/some, sem rolagem, console limpo
PASS | app/ctas.mjs (visitante) | h1 sem hebraico, preço, 4 links /checkout, fechos de /metodo /faq /sobre
NOT TESTED | app/ctas.mjs (aluno) | cenário injeta conta em localStorage - a build worker ignora; "aluno" saiu igual a visitante por isso, não por defeito
FAIL (ambiental) → PASS ao vivo | app/escuro.mjs | 14 ✗ porque o servidor estático do script não passa pelo portão e as rotas pagas não montam `[data-plataforma]`; refeito contra o worker com cookie: tudo passa (ver PASS Modo escuro). Único ✗ real: "secundário sobre o trilho 4.45:1" = UX-008
NOT TESTED | app/tom.mjs | exige `npm run build` em modo local (proibido nesta auditoria)
NOT TESTED | app/trancado.mjs | idem - "rota direta: deixa entrar" é o servidor estático sem portão, não o produto

## Não testado

NOT TESTED | Safari/iOS (VoiceOver, getUserMedia exige gesto + https, áudio só com Range 206 - CLAUDE.md:427, teclado virtual cobrindo o input, `viewportFit: cover`) | sem dispositivo; risco maior: gravador e Web Speech
NOT TESTED | Firefox (Web Speech sem transcrição - CLAUDE.md:484; posicionamento de nikud da Noto Serif Hebrew no motor Gecko) | sem binário
NOT TESTED | Android/Chrome real (TalkBack, teclado Gboard hebraico, toque com dedo) | só emulação de viewport
NOT TESTED | Leitor de tela real (NVDA/VoiceOver): ordem de leitura de consoante+nikud, pronúncia de transliteração | inferido pela semântica (lang, aria-live, nomes), não ouvido
NOT TESTED | Zoom 400 % real do navegador | simulado por viewport 320 px (equivalente em reflow)
NOT TESTED | Contraste em modo escuro do botão "Ouvir a letra" desabilitado (letra muda) | na captura parece baixo; a medição não achou o botão após `load` (conteúdo chega via /api/content)

## Handoffs

HANDOFF → COM: UX-001 é visível a quem vai comprar; conferir também se algum `subPt/topicPt` com `{{}}` chega a e-mail ou OG.
HANDOFF → SEC: throttle de cadastro 10/h por IP (`signup-h`) bloqueou o checkout no meio da auditoria ("Tentativas demais por agora") - num NAT de escola/empresa dois alunos podem barrar o terceiro; avaliar chave por e-mail+IP ou limite maior no checkout.
HANDOFF → PED: /modulo/1/texto abre "Este módulo ainda não tem texto de leitura" (dead end por URL; o link é escondido, ok) e /som/chaf mostra "ainda não abriu" - confirmar que nenhuma trilha manda para lá antes da hora.
HANDOFF → QA: UX-023 (401 em toda página pública) e UX-020 (polling no checkout) são ruído que esconde erros reais no console.

## Limpeza pedida

Conta de teste id 8 `hf-ux-7511@example.invalid` + linha `entitlements` (order `ux-audit-7511`) + `progress` uid 8 no D1 local; nenhum arquivo do projeto foi alterado (cópias temporárias `.ux-*.mjs` removidas; `app/.shots/` já era gitignored).
