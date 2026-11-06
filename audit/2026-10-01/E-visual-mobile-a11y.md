# E. UI/design premium, mobile e acessibilidade (WCAG), auditoria de 01/10/2026

Ambiente: http://127.0.0.1:8787 (wrangler dev local, build atual de app/out, main @ 6d6302d), Chromium do Playwright em /opt/pw-browsers/chromium.
Larguras: 360, 390, 768, 1366, 1920 (mais 320, 375, 412 e 683 nos testes de reflow).
Capturas: audit2/capturas-E/ (cerca de 220 arquivos; nome = rota-largura, `-full` = página inteira).
Scripts (todos em audit2/): E-crawl.mjs + E-metric.js (varredura por largura), E-contrast.mjs + E-contrast.js (contraste com cor normalizada por canvas, pega oklab/color()), E-op.mjs (contraste com opacidade), E-dark.mjs (modo escuro), E-reflow.mjs / E-reflow2.mjs (rolagem lateral, zoom e texto 115/130/150 %), E-kbd*.mjs (lição inteira só com teclado), E-match.mjs, E-games2.mjs, E-tab.mjs, E-rm.mjs (reduced motion), E-hdr.mjs, E-a11y.mjs (cópia do app/a11y.mjs com executablePath).

Contas: aluno-ux-1790733122848 (com curso), so-termos-390-1790772607046 (sem curso) e uma conta criada para esta auditoria, `audit-e-1790815712670@example.invalid` (entitlement `AUDIT-E` inserido no D1 local, progresso semeado com 8 letras), porque a conta aluno-ux tem 0 letras e com ela os seis jogos da Academia não abrem.

Observação de ambiente: a conta aluno-ux é compartilhada pelos outros auditores; o limite de 3 aparelhos derrubou minha sessão no meio da primeira varredura (as rotas logadas a 1366/1920 caíram em /entrar). Refiz essas larguras com login próprio. Não é defeito do produto.

---

## Achados

ID: VIS-001 | Prioridade: P1 | Confiança: CONFIRMADO
Local: app/src/styles/tokens.css:94 (`--accent: var(--navy)`) + :197 (`--navy: #1D545E` no tema escuro); 149 usos de `text-[var(--accent)]` em .tsx
Problema: no tema escuro da plataforma, toda tinta "accent" vira #1D545E sobre fundos #0E1416/#161F21/#12302D. Fica entre 1,67:1 e 2,20:1.
Evidência: E-dark.mjs (colorScheme dark, preferência padrão `auto`): "Ouvir a letra" 1,67:1; transliteração "/ɡ/" 1,98; "ga" (sílaba) 1,67; "Ver mais sobre esta letra" 2,20; rótulo ativo da barra inferior ("Hoje", "Meu curso", "Revisão"...) 2,20; inicial do avatar 1,67; "Comece pela aula 0" 1,98; e-mail de suporte no perfil 1,98; links da Recompensas 2,20. Captura capturas-E/dark-390_licao_gimel_.png: o botão principal "Ouvir a letra" e o "/g/" quase somem.
Por que importa: o tema padrão é `auto` (lib/acessibilidade.ts:160), então todo aluno com o celular em modo escuro cai nisto sem pedir. A auditoria de 28/09 aprovou o escuro medindo só corpo e secundário; o accent nunca foi medido. Falha WCAG 1.4.3 em controles centrais da lição.
Impacto no cliente: o botão de ouvir, a transliteração e o item ativo da navegação ficam praticamente ilegíveis à noite. Parece produto quebrado.
Correção sugerida: no bloco escuro, definir `--accent` como uma tinta clara (ex.: `var(--teal-ink)` #7FDACA, cerca de 10:1) e deixar `--navy` só para fundo; ou separar `--accent` (tinta) de `--accent-bg`. Acrescentar ao escuro.mjs uma varredura de contraste de TODO texto, não de três amostras.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (mexe na cor de 149 lugares; conferir botões sólidos que usam accent como fundo)

ID: VIS-002 | Prioridade: P2 | Confiança: CONFIRMADO
Local: menu de acessibilidade, tamanho 130 % e 150 % (app/src/app/globals.css:186-188, zoom no #hf-zoom) + cabeçalho e barra inferior da plataforma (app/src/components/shell/AppShell.tsx:172-200)
Problema: com o próprio ajuste de texto do site em 150 % num telefone, a plataforma rola de lado e corta texto; em 130 % e 150 % o cabeçalho sobrepõe marca, XP e presente, e os rótulos da barra inferior encostam uns nos outros.
Evidência: E-reflow.mjs (conta semeada, conteúdo real): 360 px a 150 %: /vocabulario rola 58 px, /perfil 50, /meu-hebraico 33, /mapa 24, /licao/mem 23, /modulo/1 5, / 5; 390 px a 150 %: /vocabulario 28, /perfil 20, /meu-hebraico 3. Capturas z150-360_vocabulario_.png (h1 "Você já consegue..." cortado à direita, "Hebraico Fluente" por cima de "◆ 400 XP"), zoom150-_licao_mem_390.png (cartão da letra cortado, barra "HojeMeu cursoRevisão Pratica Progres"), z130-390-mapa.png (130 %: XP sobre a marca, "RevisãoPraticarProgresso" colados).
Por que importa: a Declaração de Acessibilidade promete 150 % e diz que "uma verificação automática ... confere o tamanho de texto em 150% e a navegação em telas de celular". O app/a11y.mjs passa porque roda num servidor estático SEM portão: /meu-hebraico e /mapa abrem sem conteúdo (a casca não monta o curso), então o teste mede uma página vazia.
Impacto no cliente: justamente quem precisa de letra maior encontra a tela cortada e rolando de lado (WCAG 1.4.4/1.4.10).
Correção sugerida: abaixo de 640 px, limitar o zoom do conteúdo ou aplicar o zoom só ao #conteudo e não ao cabeçalho/barra; no cabeçalho, `truncate`/esconder a palavra "Hebraico Fluente" quando apertar; na barra inferior, esconder rótulos (só ícone + aria-label) quando o texto passa de 115 %. Fazer o a11y.mjs rodar contra o worker com cookie (como o escuro foi refeito em 28/09) e incluir /vocabulario, /perfil e /licao.
Complexidade: Média | Claude corrige sozinho?: Revisar antes

ID: VIS-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/shell/AppShell.tsx:175 (Link da marca com `min-w-0`) + app/src/components/shell/Logo.tsx:40 (`whitespace-nowrap`, sem `overflow-hidden`/`truncate`)
Problema: no cabeçalho da plataforma a 360 px (Android mais comum) e abaixo, o nome "Hebraico Fluente" passa por baixo do indicador "◆ 500 XP".
Evidência: E-hdr.mjs: a 360 px a marca vai de x=56 a 174 e o "◆" começa em 159 (15 px de sobreposição); a 320 px começa em 119 (55 px). 375 e 390 encostam sem sobrepor. Capturas _meu-hebraico_-360.png ("Hebraico Flue◆nte500") e hdr-320.png.
Por que importa: é a primeira linha de todas as telas pagas, no aparelho mais vendido no Brasil.
Impacto no cliente: impressão imediata de layout quebrado.
Correção sugerida: no Link da marca, `overflow-hidden` + `truncate` no texto, ou mostrar só o ícone ע abaixo de 380 px (o site público já faz isso).
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-004 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/platform/Painel.tsx:99-140 (`CartaoRevisao`, usa `p.dueCount`) x app/src/app/revisao/ReviewClient.tsx:83-93 (usa `learned`)
Problema: o painel e a navegação contam itens de revisão que a página de revisão não reconhece. Com erros feitos na prática da lição 1 antes de concluir a letra, /meu-hebraico mostra "5 a revisar", "Hora de revisar: 5 letras precisam de uma revisão rápida", selo dourado "5" na Revisão (sidebar e barra), e o botão leva a "Ainda não há o que revisar". Além disso o número é de ITENS, mas o texto diz "letras": depois, "2 letras precisam de revisão" com uma única letra (א) na lista.
Evidência: varredura a 390 px na mesma sessão: _meu-hebraico_-390.png (5 a revisar, 0 letras dominadas) e _revisao_-390.png ("Ainda não há o que revisar"); E-rev.mjs: "2 letras precisam de uma revisão rápida" com só Álef listada.
Por que importa: é o primeiro dia de um aluno real (errar na prática da primeira letra é o normal).
Impacto no cliente: o produto se contradiz na primeira sessão; o aluno clica num chamado dourado e cai num beco.
Correção sugerida: usar a mesma fonte de verdade nos dois lugares (ou o painel esconde o cartão quando `learned` está vazio, ou a revisão aceita os itens pendentes); trocar "letras" por "itens"/"exercícios", ou contar letras distintas.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (toca regra de estado; handoff PED)

ID: VIS-005 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/learn/Answers.tsx:371-460 (`MatchPairs`, exercício "Ligue cada sílaba à sua leitura" da lição)
Problema: o exercício de ligar pares é operável por teclado, mas para leitor de tela e teclado é cego: (1) o item escolhido não tem `aria-pressed` (o estado é só cor de borda); (2) ao formar um par, o botão vira `disabled` e o foco cai no `<body>`; (3) par errado é só um piscar âmbar de 550 ms, sem anúncio; (4) par certo também não é anunciado (o aria-live só fala no fim).
Evidência: E-match.mjs: 8 botões, `aria-pressed=null` em todos; após Enter no par certo: `foco BODY`, `live=""`. Captura match-390.png.
Por que importa: a Declaração promete "a correção de cada exercício é anunciada" e "toda a plataforma pode ser usada só pelo teclado"; aqui o leitor de tela não sabe o que escolheu nem se acertou (WCAG 4.1.2, 1.4.1, 2.4.3). O jogo Match da Academia já tem `aria-pressed` (Match.tsx:148), o da lição não.
Impacto no cliente: aluno cego ou só de teclado trava na etapa Praticar, que é sorteada e pode cair neste formato em qualquer letra.
Correção sugerida: `aria-pressed={isPicked}`; nome com estado ("אֶ, ligado a e"); em vez de `disabled`, `aria-disabled` + ignorar clique, mantendo o foco; anunciar "Par certo"/"Não combinam" num `role=status`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-006 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/acessibilidade/page.tsx (item 2 e 3 da Declaração)
Problema: a Declaração afirma mais do que o produto entrega hoje: "150%" + "verificação automática confere ... 150% e a navegação em telas de celular" (VIS-002 mostra que não), "toda a plataforma pode ser usada só pelo teclado, com o foco sempre visível" (VIS-005 e VIS-008: foco cai no body), "a correção de cada exercício é anunciada" (VIS-005), e omite o modo escuro ilegível (VIS-001).
Evidência: texto da página (E-decl.mjs) confrontado com os achados acima.
Por que importa: é documento público exigido pela LBI art. 63; afirmação falsa sobre acessibilidade é risco de reclamação (Procon/MP) maior do que a falha em si.
Impacto no cliente: quem depende do recurso confia no texto e encontra o contrário.
Correção sugerida: corrigir VIS-001/002/005 antes; até lá, mover os itens para "4. O que ainda não está bom" e descrever a verificação automática como ela é (servidor estático, sem o conteúdo pago).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (texto jurídico; handoff LEGAL)

ID: VIS-007 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/platform/Painel.tsx:134 (botão "Começar revisão" `bg-[var(--gold)] text-white`) e AppShell.tsx:337 (selo de contagem da Revisão)
Problema: branco sobre gold #B8862F = 3,24:1, em texto de 15,5 px semibold (botão) e 11,5 px bold (selo). Não é texto grande; AA pede 4,5:1.
Evidência: E-contrast.mjs em /meu-hebraico 390 e 1366: "Começar revisão | A 15.5px w600 | rgb(255,255,255) on rgb(184,134,47) = 3.24"; selo "5" idem em todas as páginas a 1366.
Por que importa: é o mesmo defeito do UX-006 (teal), corrigido no teal e repetido no gold; é o CTA principal do cartão de revisão.
Impacto no cliente: botão de ação com contraste baixo para baixa visão e celular ao sol.
Correção sugerida: fundo `--gold-ink` #8A6520 (≈5,6:1 com branco) ou texto `--ink` sobre o gold; o selo pode usar o mesmo par.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-008 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/learn/Compreensao.tsx:128-213 (perguntas rápidas da etapa 1), components/game/Batalha.tsx:235/282, ImpressaCursiva.tsx:148, Blast.tsx:178, ExercisePlayer (dica)
Problema: resto do UX-002. A troca de etapa e o ExercisePlayer agora levam o foco ao lugar certo (h2 da questão ou botão Continuar), mas: ao responder uma pergunta rápida da etapa 1 os botões viram `disabled` e o foco cai no body (página volta para y=-2461); nos jogos Batalha, Impressa × cursiva e Blast o mesmo; no exercício digitado, a segunda dica some o botão "Mais uma dica" e o foco cai no body.
Evidência: E-kbd.mjs ("após Enter: BODY ... y=-2461"); E-games2.mjs (Batalha e Impressa: "foco depois BODY"); E-kbd2.mjs (ex6 em diante: foco BODY após "Mais uma dica").
Por que importa: no Chromium o próximo Tab ainda segue de perto, mas leitor de tela perde o contexto (WCAG 2.4.3).
Impacto no cliente: usuário de teclado/leitor de tela reorienta a cada resposta.
Correção sugerida: o mesmo padrão já usado no ExercisePlayer: antes de desabilitar, mover o foco para o feedback/Continuar; usar `aria-disabled` em vez de `disabled` no botão que tem o foco; após a última dica, focar o campo de resposta.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-009 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/academia/AcademiaClient.tsx (lista de jogos) + estado vazio de cada jogo
Problema: com 1 letra aprendida, a Academia mostra os seis jogos como disponíveis; os seis abrem "Ainda não há letras suficientes para montar a rodada. Siga mais uma lição e volte." O estado vazio não tem heading (`main` sem h1/h2).
Evidência: E-games.mjs com a conta aluno-ux (1 letra): `hs:[]`, só botão "Voltar", nos 6 jogos; captura jogo-Caaletra-390.png.
Por que importa: seis becos seguidos na primeira visita à área de prática.
Impacto no cliente: frustração; parece conteúdo faltando.
Correção sugerida: marcar os jogos como "abre com N letras" (cadeado + contagem) quando a rodada não fecha, e dar um h1 ao estado vazio.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-010 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/mapa/CourseMapClient.tsx:150 (cartões "Em breve" com opacidade .72) e /conquistas (cartões bloqueados com opacidade .55)
Problema: o UX-009 foi corrigido trocando a cor para `--ink-muted`, mas o cartão inteiro continua com opacidade; o resultado efetivo continua abaixo de 4,5:1. E "Em breve" sugere conteúdo não lançado, quando o módulo só está trancado.
Evidência: E-op.mjs: /mapa "Em breve" e "Módulo 2 · 4 lições" 3,01:1, nomes das letras 9,5 px 3,27:1; /conquistas descrição 13 px 2,28:1, título 3,73:1.
Por que importa: é informação (o que vem e o que falta), não controle inativo.
Impacto no cliente: baixa visão não lê o caminho do curso nem as metas.
Correção sugerida: tirar a opacidade do texto (manter só no ícone/cadeado) e trocar "Em breve" por "Abre depois do módulo N".
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-011 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/MarcaDagua.tsx:31-34
Problema: a marca d'água vertical ("Licenciado para au•••@example.invalid · cópia 5A44267C") fica na margem esquerda de toda tela paga, a 10,5 px, opacidade .6 (2,49:1). Num telefone de 360 a 390 px ela ocupa a calha de 16 px e encosta nos cartões.
Evidência: visível em todas as capturas logadas (ex.: _meu-hebraico_-360.png, licao-390-feedback.png); E-op.mjs mede 2,49:1.
Por que importa: é decisão do dono (proteção) e está `aria-hidden`, então não é falha WCAG; mas é o elemento que mais tira a sensação premium no celular, junto com o aviso de direitos autorais no pé de cada aula.
Impacto no cliente: lembra o aluno, o tempo todo, que é suspeito.
Correção sugerida: decisão de produto; se mantida, só a partir de `lg` (onde há margem real) ou só no rodapé no celular. Não é bloqueio.
Complexidade: Mínima | Claude corrige sozinho?: Não (decisão do dono)

ID: VIS-012 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/checkout/[slug]/CheckoutClient.tsx (184, 212, 233, 251, 274: só h2)
Problema: o checkout não tem h1 em nenhum passo, em nenhuma largura; "Seu pedido" é um `<p>`.
Evidência: E-crawl: `/checkout/alfabetizacao/` h1=0 a 360/390/768/1366/1920; todas as outras 22 telas têm h1=1.
Por que importa: leitor de tela que pula para o h1 não acha o título da página de pagamento (boa prática; WCAG 1.3.1/2.4.6 em sentido amplo).
Impacto no cliente: pequeno, na página que mais importa para a venda.
Correção sugerida: h1 visualmente discreto "Pagamento: Alfabetização em Hebraico" e "Seu pedido" como h2.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-013 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/game/TestRun.tsx:185
Problema: o jogo Teste numera as opções 1 a 4 em selos iguais aos da lição, mas as teclas 1-4 não fazem nada (não há keydown). A sidebar agora limita a promessa a "Nas lições" (UX-014 resolvido no texto), mas o visual continua prometendo.
Evidência: E-games2.mjs: Teste, "tecla 1 -> live: (vazio)", botões "1 מִדָּה | 2 גַּם | 3 נֹתֵן | 4 אַתְּ".
Correção sugerida: implementar 1-4 no Teste (é escolha simples) ou tirar os números.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-014 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/PublicShell.tsx:171 (`Começar<span>&nbsp;agora</span>` dentro de LinkButton com gap)
Problema: o botão do cabeçalho público mostra "Começar   agora" com espaço duplo visível (gap do flex + &nbsp;), em 768, 1366 e 1920.
Evidência: capturas _-768.png, _-1366.png, _-1920.png.
Correção sugerida: tirar o `&nbsp;` (o gap já separa) ou envolver as duas palavras num único span.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-015 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/landing/Hero.tsx:293 (selo flutuante "Sequência 7 dias" do mockup)
Problema: no desktop, o selo flutuante cobre o canto direito da barra de progresso do mockup e corta o contador ("1/..." aparece pela metade embaixo do selo); a 768 px o selo cai sobre o rodapé da dobra.
Evidência: _-1366.png e _-1920.png (texto cortado sob "Sequência 7 dias"), _-768.png.
Por que importa: é a vitrine do produto na primeira dobra; texto cortado parece descuido.
Correção sugerida: deslocar o selo para cima/fora da barra ou esconder o contador do mockup.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-016 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/BotaoAcessibilidade.tsx (botão flutuante 52×52 bottom-right)
Problema: UX-017 continua em parte: a 390 px o botão cobre a borda direita do cartão "Cartão de crédito" no checkout e a faixa direita da folha de retorno dos exercícios (ao lado do "0,7×").
Evidência: _checkout_alfabetizacao_-390.png; licao-390-feedback.png.
Correção sugerida: na plataforma, subir o botão acima da folha de retorno enquanto ela está aberta (ou reservar `padding-right` na folha); no checkout, `padding-bottom` extra no formulário.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-017 | Prioridade: P3 | Confiança: CONFIRMADO
Local: /criar-conta e /entrar (placeholders), components/platform/Campo.tsx
Problema: o placeholder ("Daniel", "voce@exemplo.com.br") tem a mesma cor do texto secundário (#5F6A66) e tamanho igual ao valor; na captura parece campo já preenchido.
Evidência: E-op.mjs: `::placeholder` rgb(95,106,102); captura _criar-conta_-390.png.
Por que importa: pessoa apressada pula o campo "Como você quer ser chamado" achando que já está preenchido; nome errado vai para o certificado.
Correção sugerida: placeholder mais claro (≈ #8A938F, é permitido abaixo de 4,5:1 por ser dica) ou exemplo explícito "ex.: Daniel".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: VIS-018 | Prioridade: P3 | Confiança: CONFIRMADO
Local: /loja (🛡️ 📜 ✨), /meu-hebraico ("Bom dia, Marina 👋"), lição ("⚠️ ERRO COMUM"), capa ("🎤 Fale e seja corrigido")
Problema: o sistema de ícones é de traço fino (SVG) na sidebar, barra, cartões e conquistas, mas Recompensas e alguns rótulos usam emoji colorido do sistema; o emoji muda de desenho entre Android, iOS e Windows.
Evidência: _loja_-390.png ao lado de _conquistas_-1366.png.
Por que importa: percepção premium; é o ponto em que o produto mais parece app genérico. Não é falha de acessibilidade (os emojis estão em texto com nome).
Correção sugerida: trocar os três emojis da loja por ícones do mesmo traço (já existe NavIcons.tsx); manter o 👋 se o dono gostar.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: VIS-019 | Prioridade: P3 | Confiança: ALTA CONFIANÇA
Local: todo o design em px (`text-[15px]`), app/src/lib/acessibilidade.ts:15-21
Problema: o aumento de "só texto" do navegador (fonte padrão do Chrome desktop, "Zoom só texto" do Firefox) não muda nada, porque tudo é px. O site compensa com o próprio menu (que tem VIS-002) e o zoom de página funciona até 400 % (320 px sem rolagem em 18 rotas).
Evidência: decisão documentada em acessibilidade.ts; E-reflow.mjs 320 e 683 px: nenhuma rolagem lateral.
Por que importa: WCAG 1.4.4 aceita o zoom de página, então não é falha; é só para registrar que o único caminho de "texto maior" sem zoom é o menu do site, e ele quebra no celular.
Correção sugerida: nenhuma além de VIS-002.
Complexidade: n/a | Claude corrige sozinho?: n/a

---

## Aprovado (verificado nesta rodada)

- app/a11y.mjs (cópia com executablePath): 27 de 27 ✓. Cobre: botão em 5 rotas, alvo 52×52, Alt+Shift+A e Esc, 150 % cresce o parágrafo, persistência entre páginas, alto contraste ≥ 7:1, espaçamento sem tocar o hebraico, menos animação, voltar ao normal, 390 px sem rolagem com tudo ligado, olho da senha. NÃO cobre: conteúdo pago real (servidor estático sem portão, então /meu-hebraico e /mapa abrem vazios), 360 px, 130 %, cabeçalho/barra da plataforma, modo escuro, contraste fora do parágrafo, teclado nos exercícios, leitor de tela.
- Rolagem lateral: 0 px nas 23 telas em 360, 390, 768, 1366 e 1920, e em 320 e 683 (zoom 400 % e 200 %).
- Um h1 por tela e nenhum salto de heading em 22 de 23 telas (exceção VIS-012); landmarks main/header/nav/footer em todas.
- Nenhum input sem label, nenhuma img sem alt, nenhum botão só com emoji sem nome; hebraico fora de `lang="he"`: 0 em todas as telas; todo `[lang=he]` com direction rtl.
- Contraste no tema claro (E-contrast.mjs, cor normalizada): só as falhas de VIS-007 e os números decorativos "01-04" do painel (2,52:1, 15 px; decorativos ao lado do título, P4).
- Teclado na capa, /entrar e /criar-conta: ordem lógica (skip, marca, nav, CTA, conteúdo, rodapé), anel de foco de 2 px em 100 % dos elementos tabulados; menu móvel fecha com Esc e devolve o foco (UX-004 resolvido); o diálogo de acessibilidade recebe o foco e prende o Tab (UX-003 resolvido); erro de login com `role=alert`, `aria-invalid` e `aria-describedby` nos dois campos e foco no campo (UX-016 resolvido).
- Lição inteira só com teclado: etapas 1 a 3 avançam por Tab+Enter (4, 4 e 8 Tabs), a troca de etapa leva o foco ao passo atual da barra e volta a página ao topo (UX-002 resolvido no principal); na prática, 1-4 respondem, Enter avança e o foco vai ao h2 da questão seguinte; o exercício de montar sílaba responde por Tab+Enter ("Sinal 1"); o digitado tem label "Sua resposta" com autocomplete/autocapitalize desligados; o traçado da etapa 3 pode ser pulado. Feedback em `aria-live` com a explicação.
- Jogos: os seis têm h1 (oculto) e região viva (UX-013 resolvido); Caça à letra nomeia cada célula pela letra (UX-005 resolvido).
- prefers-reduced-motion: 0 animações e 0 transições > 50 ms na capa, painel, lição e academia (sem a preferência: 11 animações na capa, inclusive 3 infinitas, todas desligadas com reduce).
- Tipografia hebraica: Noto Serif Hebrew com nikud no lugar nas capturas (אֶ, אוּ, שׁ, גִּימֶל), cursiva distinta, separadores corretos em frases mistas ("אוּ - u.").
- Mobile geral: alvos da barra inferior e cabeçalho ≥ 40 px, controles de resposta 72 px, checkout com resumo antes do formulário, nenhum texto cortado nas larguras padrão além de VIS-003 e VIS-015.

## Automático x manual

Automático (feito aqui, reproduzível pelos scripts): rolagem lateral, headings, landmarks, labels, nomes, alt, lang/dir, contraste claro e escuro (inclusive opacidade), alvos, ordem de Tab, foco após ação, aria-live, reduced motion, zoom/texto.
Exige teste manual com usuário real: VoiceOver (iOS) e TalkBack (Android) lendo consoante + nikud e a transliteração; NVDA no desktop; Safari/iOS (áudio, gravação, teclado virtual sobre o campo de resposta); Firefox (Fale e seja corrigido não existe); uso real com dedo no traçado; uma pessoa de baixa visão usando 150 % no celular depois de VIS-002; percepção de cor do vermelho/âmbar e verde em daltonismo nos jogos (o acerto tem ✓ e ↻, o que ajuda). A Declaração diz que leitores reais ainda não foram testados; continua verdade.

---

## (1) Auditoria de 28/09 (F-ux), estado hoje

| Item | Estado |
|---|---|
| UX-001 `{{ }}` cru na vitrine | Resolvido (`<Prose>` em CourseClient.tsx:131) |
| UX-002 foco cai no body | Parcial: etapas e ExercisePlayer resolvidos; perguntas rápidas, MatchPairs, Batalha, Impressa, Blast e "Mais uma dica" continuam (VIS-005, VIS-008) |
| UX-003 diálogo de acessibilidade sem foco | Resolvido |
| UX-004 menu móvel sem Esc | Resolvido |
| UX-005 Caça à letra "letra" ×12 | Resolvido |
| UX-006 teal a 4,2:1 | Resolvido no teal (`--teal-solid`); o mesmo erro reapareceu no gold (VIS-007) |
| UX-007 dica da sidebar 3,76:1 | Resolvido (white/85) |
| UX-008 --ink-muted 4,45 | Resolvido (#5F6A66) |
| UX-009 "Em breve" 2,13:1 | Parcial: a cor foi trocada, a opacidade do cartão mantém 3,01:1 (VIS-010) |
| UX-010 /teclado-hebraico rola a 320 | Resolvido (0 px) |
| UX-011 32 botões "Ouvir" | Resolvido (`Ouvir ${translit}`) |
| UX-012 falha de áudio muda | Resolvido no código (`role=status` em AudioButton.tsx:178); não forcei 404 nesta rodada |
| UX-013 jogos sem heading/aria-live | Resolvido |
| UX-014 "1-4 respondem" | Resolvido no texto; o Teste ainda mostra 1-4 sem atalho (VIS-013) |
| UX-015 hebraico sem lang | Resolvido (0 ocorrências) |
| UX-016 login sem aria-invalid | Resolvido |
| UX-017 botão flutuante cobre texto | Parcial (VIS-016) |
| UX-018 toast cobre a Caça à letra | Não reverificado |
| UX-019 skip link sem alvo focável | Resolvido (`tabIndex={-1}` em layout.tsx:143) |
| UX-020/021/023 polling, peso, 401 no console | Não reverificados (fora do foco visual; ver QA) |
| PASS "modo escuro" | Revogado: o accent nunca foi medido e falha (VIS-001) |
| PASS "a11y.mjs completo" | Continua passando, mas não mede a plataforma com conteúdo (VIS-002) |

## (2) Nota da área: 72/100

O que impede subir: VIS-001 (modo escuro, que é o padrão de quem tem o celular escuro, deixa o botão de ouvir e a navegação ilegíveis). Antes de anunciar acessibilidade: VIS-002 e VIS-006 (a Declaração promete o que o 150 % no celular não entrega). O resto é polimento: o produto é limpo, consistente, sem rolagem lateral em nenhuma largura, com teclado e leitor de tela tratados acima da média de cursos online brasileiros.

## (3) Os 5 maiores problemas

1. VIS-001 (P1): no tema escuro, todo texto "accent" fica a 1,7-2,2:1 ("Ouvir a letra", transliteração, item ativo da navegação).
2. VIS-002 (P2): o próprio ajuste de texto 130/150 % do site quebra a plataforma no celular (rola até 58 px, cabeçalho e barra sobrepostos), e o teste automático não vê porque roda sem conteúdo.
3. VIS-004 (P2): painel e selo dizem "5 a revisar" e a Revisão responde "Ainda não há o que revisar" (e conta itens como "letras").
4. VIS-003 (P2): a 360 px o nome "Hebraico Fluente" passa por baixo do XP em toda tela paga.
5. VIS-005 (P2): o exercício "Ligue os pares" da lição não expõe estado nem anuncia acerto/erro, e derruba o foco a cada par.

## Handoffs e limpeza

- PED: VIS-004 (regra de contagem da revisão).
- LEGAL: VIS-006 (Declaração de Acessibilidade).
- Limpeza no D1 local: conta `audit-e-1790815712670@example.invalid` + entitlement order `AUDIT-E` + linha de progress dela. O progresso da conta aluno-ux foi alterado pelas passagens de teclado (lição alef com etapas 1-3 feitas, itens de SRS com erros, XP 500 → 520).
- Nenhum arquivo do repositório foi alterado.
