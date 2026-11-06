# Auditoria completa de pré-lançamento: Hebraico Fluente

Data: 01/10/2026 · Base: `main` @ 6d6302d (PR #85) · Método: 1 orquestrador + 8 agentes especializados
(A segurança e infra, B pagamentos, C jurídico Brasil, D conversão/confiança/cliente oculto, E visual/mobile/
acessibilidade, F jornada UX e QA funcional, G conteúdo/pedagogia/hebraico/português, H performance/SEO/técnico),
todos contra uma cópia local da build de produção (Worker + D1 local + Chromium), 1.087 testes automatizados,
sondas próprias (fuzz de 44.974 exercícios, varredura de contraste, filmagem em 3G, curl contra o portão) e a API
do GitHub. Os oito relatórios estão nesta pasta (A-seguranca.md a H-performance-seo-tecnico.md). Todo achado P1
foi reconferido pelo orquestrador no código ou no ambiente local. Nenhum arquivo de produto foi alterado.

Limite: **o site em produção não é alcançável deste ambiente** (proxy). DNS, caixa de e-mail, Mercado Pago real,
Resend real, D1 remoto, painel Cloudflare e GitHub Pages ficam em "precisa verificação manual". Esta é uma
avaliação de software e produto, não uma certificação jurídica.

---

# LEIA ISTO PRIMEIRO

| | |
|---|---|
| **P0 (bloqueadores confirmados)** | **0** (1 condicional: SEC-A-004, vira P0 se o site antigo do GitHub Pages ainda estiver no ar) |
| **P1 (antes de lançamento sério)** | **7** |
| **P2 (melhoria importante)** | **42** |
| **P3 (polimento)** | **79** (inclui 9 menores classificados P4 pelos agentes) |
| **Maior risco de segurança** | O backup diário do banco falha desde 30/09 (`SQLITE_TOOBIG`, blobs de áudio na tabela `gravacoes`): não há cópia restaurável nova. Controle de acesso, sessão, CSRF, IDOR e webhook passaram em tudo. |
| **Maior risco de pagamento** | Nada muda sozinho em 01/11/2026: o site vai continuar dizendo "pré-lançamento até 31/10, depois R$ 297" e cobrando R$ 147. Sem trava, lembrete nem runbook. |
| **Maior risco jurídico** | Os e-mails de compra dizem "responda este e-mail para desistir", saem de `contato@hebraicofluente.com.br` sem `reply_to`, e nada prova que esse endereço tem caixa postal. Um pedido de desistência feito do jeito que o próprio recibo ensina pode se perder. |
| **Maior problema de conversão** | O direito de desistir em 7 dias com 100% de volta não aparece na capa nem na página do curso; só no checkout, depois do cadastro. |
| **Maior problema de UX** | Com a fixação abaixo de 80%, os botões "Concluir e continuar → Mem" e "Começar a lição" levam a uma letra trancada, na primeira letra do curso. |
| **Maior problema de conteúdo** | Dicas e explicações dos exercícios mostram marcação crua (`{{א}} é um apoio…`) ao aluno em 11 letras e 9 frases; e na prática do Kaf 42% das rodadas têm um "ligue letra e som" com duas cartas "/k/", onde acertar pode contar como erro. |
| **Há bloqueadores aparentes?** | Não para vender em escala pequena e controlada. **Sim para mandar tráfego pago**: os 7 P1 somam menos de dois dias de trabalho e precisam entrar antes. |

---

## 1. Resumo executivo

O produto está onde mais importa: **ninguém consegue ler o curso sem pagar, ninguém vê dados de outra conta, o preço
nunca vem do navegador, o webhook é assinado e reconsultado, a desistência em 7 dias estorna sozinha, e o hebraico
está correto no essencial** (22 letras, nikud, 539 áudios do professor, 59 de 60 linhas bíblicas conferem com o
massorético, 1.087 testes verdes, 0 vulnerabilidades em dependências, 0 links ou assets quebrados no export).
Desde a auditoria de 28/09, dos 7 bloqueadores de então, 5 foram resolvidos de verdade (FAQ do áudio, marcação crua
na vitrine, estorno automático, deploy com rollback, migrações) e 2 ficaram parciais (monitoramento sem prova de
monitor externo; backup implantado e depois quebrado).

O que impede o lançamento sério hoje não é código quebrado, é **sete coisas de borda que custam dinheiro ou
confiança**:

1. O backup voltou a não existir na prática (SEC-A-001).
2. A promessa pública "depois R$ 297, até 31/10" não tem nada que a faça valer (PAY-B-001 / LEGAL-108 / CONV-008).
3. O recibo manda "responder este e-mail" para um endereço sem caixa comprovada e sem Reply-To (LEGAL-101 / CONV-002).
4. A desistência de 7 dias, o maior redutor de risco do site, é invisível antes do checkout (CONV-001).
5. No tema escuro (padrão de quem tem o celular escuro) o botão "Ouvir a letra", a transliteração e o item ativo da
   navegação ficam a 1,7-2,2:1, quase ilegíveis (VIS-001).
6. Nenhum arquivo do site tem cache: 68 de 68 pedidos vão à rede na volta à lição, e cada carga completa são 47-70
   invocações do Worker; no plano Free a cota de 100 mil/dia estoura com ~1.600 cargas e o site inteiro sai do ar
   (PERF-001).
7. Os mp3 estáticos respondem 200 (não 206) a `Range` localmente; o próprio código diz que o Safari não toca sem
   206. Se a produção fizer igual, iPhone não ouve nada (PERF-002, verificar em 5 minutos).

Depois deles, os P2 que mais vão gerar suporte e reembolso: PIX que some ao recarregar (PAY-B-002), tela de retorno
da Mercado Pago com textos errados (PAY-B-003), aluno vencido tratado como visitante (PAY-B-004 / UXQA-004), botão
que leva a letra trancada (UXQA-002), "concluída" × "dominada" trocadas em cinco telas (UXQA-005), ajuste de texto
150% que quebra o celular enquanto a Declaração de Acessibilidade promete o contrário (VIS-002 / VIS-006), e as
contradições de texto em páginas de confiança (/sobre sobre a ordem das letras, "lição 20 das 22", "Formação Letras").

## 2. Prontidão geral

**Status: 🟠 PRONTO PARA VENDA CONTROLADA (poucos alunos, atendimento próximo); CORRIGIR OS 7 P1 ANTES DE TRÁFEGO PAGO.**

Nota geral de prontidão técnica/produto: **77/100** (28/09: estimado ~70). Não é garantia jurídica.

## 3. Maiores riscos (em ordem)

1. Perda total do banco sem cópia restaurável (SEC-A-001), agravada por backup na mesma conta Cloudflare (SEC-A-005).
2. Site inteiro fora do ar num dia de campanha por cota do plano Free (PERF-001), e áudio mudo no iPhone (PERF-002).
3. Publicidade enganosa por prazo vencido em 01/11 (PAY-B-001) e por "100% de volta" não provado em compra parcelada (LEGAL-110).
4. Desistência exercida por e-mail e não lida (LEGAL-101); depoimento retirado sem aviso ao dono (LEGAL-106).
5. Bypass total do conteúdo pago se o GitHub Pages de 19/09 ainda estiver publicado (SEC-A-004, condicional).
6. Cobrança dupla por PIX regenerado ao voltar do banco (PAY-B-002).
7. Reputação: Gmail de outra marca como canal oficial, um depoimento com detalhe que o produto não tem, três erros factuais em /sobre, /biblia e na capa (CONV-003/004/005/006/007).

---

## 4. P0

Nenhum confirmado.

**SEC-A-004 (condicional, P2 hoje, P0 se confirmado)** · `.github/workflows/deploy-app.yml` + `app/src/lib/content.ts:289-317`.
O workflow manual "Deploy app to Pages" faz o build sem `NEXT_PUBLIC_PLATFORM_API=worker`, modo em que os 11 JSON pagos
entram no pacote, e publica tudo sem portão no GitHub Pages. Última execução com sucesso: 19/09/2026 23:07. A
auditoria de 28/09 registrou o repositório como privado no plano Free (o que normalmente despublica o Pages), mas
isso não foi confirmado daqui. **Ação do dono, hoje:** abrir `https://moshikgueta.github.io/hebraicofluente/licao/alef/`
numa janela anônima; se abrir, Settings → Pages → Unpublish. **Ação de código:** apagar `deploy-app.yml`.

## 5. P1 (corrigir antes de lançamento sério)

**SEC-A-001 · Backup diário falha desde 30/09.** Confiança: CONFIRMADO (API do GitHub: execução 36716795792,
`schedule`, 30/09 12:45 UTC, `failure`; log: `statement too long: SQLITE_TOOBIG`). Local: `.github/workflows/backup.yml`,
`scripts/backup-nuvem.sh`, tabela `gravacoes` (blobs de até 1,5 MB, `worker/src/api/audio.js:54`). Causa: o export do D1
escreve cada linha como um `INSERT` com o blob em hexadecimal (~3 MB), acima do teto de 1 MB por comando do SQLite; a
restauração de prova rejeita e o script, corretamente, não envia cópia que não restaura. **Também não restauraria no D1
remoto.** Impacto: num acidente os alunos perdem conta, compra e progresso. Correção: exportar `gravacoes` sem dados
(os áudios já existem como .mp3 no git via `exportar-gravacoes`) ou mover os blobs para o R2; rodar `ensaiar`; conferir
se o e-mail de falha saiu (depende de `RESEND_API_KEY` no repositório). Complexidade: Pequena. Claude corrige: Revisar antes.

**PAY-B-001 (= LEGAL-108 = CONV-008) · Em 01/11/2026 nada muda sozinho.** CONFIRMADO. Local: `data/courses.json:54`
(`preLancamentoAte: "2026-10-31"`), `app/src/lib/catalog.ts:174-179` (só formata a data), `worker/src/lib/catalog.js:28-34`
(cobra `price.brl` sem olhar data), capa, /cursos/alfabetizacao, checkout, /faq, CourseCard. Não há `Date`, check, alerta
nem runbook (grep em `scripts/`, `tools/`, `worker/src`, `.github`, `ANTES-DE-VENDER.md`, `INCIDENTES.md`: zero). Impacto:
prazo vencido anunciado é publicidade enganosa (CDC art. 37) e, se o preço nunca subir, a âncora de R$ 297 era falsa.
Correção: (a) decisão do dono por escrito: o que acontece em 01/11; (b) `check-legal`/build falham se `preLancamentoAte <
hoje` com `listBrl` presente; (c) o Worker e o app cobram/mostram `listBrl` depois da data (regra única em catalog.js e
catalog.ts), ou uma Action agendada abre o PR da virada; (d) alerta ao dono 7 dias antes. Pedidos já criados a 147
continuam válidos (valor gravado no pedido). Complexidade: Pequena. Claude corrige: Revisar antes (decisão de preço).

**LEGAL-101 (= CONV-002) · "Responda este e-mail" sem Reply-To e sem caixa comprovada.** CONFIRMADO no código
(`worker/src/lib/mail.js:58-63` monta `{from, to, subject, text, html}`, sem `reply_to`; `:321` e `:357` "ou responda este
e-mail"; `:331/368/419` "responda esta mensagem"); PRECISA VERIFICAÇÃO MANUAL a caixa de `contato@hebraicofluente.com.br`
(nenhuma menção a MX/Email Routing em todo o repositório). Impacto: desistência do art. 49 exercida por escrito e não
atendida; pedidos LGPD perdidos. Correção: `reply_to: env.SUPPORT_EMAIL` em `sendMail` (1 linha) + o dono confirma no
painel Cloudflare o Email Routing de `contato@` para a caixa que lê, ou o texto vira "escreva para <suporte>". Teste:
responder um e-mail real de "esqueci a senha". Complexidade: Mínima. Claude corrige: Sim (o código).

**CONV-001 · A desistência de 7 dias é invisível na capa e na página do curso.** CONFIRMADO (grep "7 dias|sete dias|
garantia|reembols" no texto renderizado das 10 páginas públicas: a capa só tem "Sequência 7 dias" do mockup; /cursos/
alfabetizacao, /metodo e /sobre não têm nada; a FAQ da capa tem 8 perguntas e nenhuma sobre desistir; o bloco "E se não
for para mim?" da página do curso responde com prazo de estudo). Local: `components/landing/Fecho.tsx:338-449` (Preco),
`:452-474` (Faq), `app/cursos/[slug]/CourseClient.tsx:162`. Impacto: tráfego frio decide na caixa de preço sem saber que o
risco é zero. Correção: uma linha fixa na caixa de preço da capa e do curso e na BarraFixa, lida de
`empresa.politicas.arrependimentoDias`: "7 dias para desistir e receber 100% de volta, sem justificar"; responder "E se
não for para mim?" com ela; trocar "Posso estudar no meu ritmo?" por "E se eu não gostar?" na FAQ da capa. Não chamar de
"garantia" nem inventar prazo maior. Complexidade: Pequena. Claude corrige: Sim.

**VIS-001 · Tema escuro: todo texto "accent" fica a 1,7-2,2:1.** CONFIRMADO (E-dark.mjs, colorScheme dark, preferência
padrão `auto`: "Ouvir a letra" 1,67:1; "/ɡ/" 1,98; item ativo da barra 2,20; links da Recompensas 2,20; captura
`capturas-E/dark-390_licao_gimel_.png`). Local: `app/src/styles/tokens.css:94` (`--accent: var(--navy)`) + `:197` (`--navy:
#1D545E` no escuro); 149 usos de `text-[var(--accent)]`. A auditoria de 28/09 aprovou o escuro medindo só corpo e
secundário. Impacto: WCAG 1.4.3 reprovado nos controles centrais da lição para todo aluno com celular escuro; parece
produto quebrado à noite. Correção: no bloco escuro, `--accent` como tinta clara (`--teal-ink` #7FDACA ≈ 10:1) e `--navy`
só para fundo, ou separar `--accent` (tinta) de `--accent-bg`; incluir no `escuro.mjs` varredura de contraste de todo
texto. Complexidade: Pequena. Claude corrige: Revisar antes (149 lugares; conferir botões sólidos).

**PERF-001 · Ativos imutáveis sem cache e todo pedido no Worker.** CONFIRMADO pelo orquestrador (`curl -sI
/_next/static/chunks/*.js` → `Cache-Control: public, max-age=0, must-revalidate`; `wrangler.toml:61 run_worker_first = true`;
H-repeat.mjs: segunda visita à lição 68 pedidos, 68 na rede, 0 do cache). Local: `worker/src/worker.js:239,344-393`
(`blindar` não define cache para ativos). Impacto: 47-70 invocações por carga completa (28/09 estimou 15); cota Free de
100 mil/dia acaba com ~1.600 cargas e o Worker recusa tudo, inclusive a página de vendas, até 00:00 UTC; volta ao curso
lenta todo dia em rede móvel. Correção: `Cache-Control: public, max-age=31536000, immutable` para `/_next/static/`;
melhor: `run_worker_first = ["/*", "!/_next/static/*", "!/fonts/*", "!/media/*", "!/amostra-audio/*", "!/tracado-amostra/*"]`
com `_headers` para nosniff/HSTS nesses caminhos (pedido sem Worker não conta na cota; `/audio` e `/stroke-order` continuam
no portão); e Workers Paid antes de campanha. Rodar `portao.mjs`/`pacote.mjs` depois. Complexidade: Pequena. Claude corrige:
Revisar antes.

**PERF-002 · mp3 estáticos sem resposta 206 a `Range`.** CONFIRMADO localmente pelo orquestrador (`curl -H 'Range: bytes=0-1'
/amostra-audio/sha.mp3` → `200`, `Content-Length: 10389`, sem `Content-Range`/`Accept-Ranges`); PRECISA VERIFICAÇÃO MANUAL
em produção. Local: `worker/src/worker.js:239` (`env.ASSETS.fetch`) para `/audio/*.mp3` e `/amostra-audio/*.mp3`; contraste com
`worker/src/api/audio.js:125-160`, que implementa 206 só para as gravações do painel porque "o Safari só toca mídia de
servidor que responde a Range". Impacto: se a produção fizer como o local, iPhone/iPad apertam "Ouvir" e não ouvem nada; o
áudio é o centro do curso e da capa. Correção: hoje, `curl -sI -H 'Range: bytes=0-1' https://hebraicofluente.com.br/amostra-audio/shalom.mp3`
tem de dar `206` + `Content-Range`; tocar 3 clipes num iPhone real. Se der 200, fatiar o corpo do `ASSETS.fetch` quando
houver `Range` (o mesmo caminho de `audio.servir`) e pôr a checagem de 206 no e2e do deploy. Complexidade: Pequena. Claude
corrige: Sim (a conferência no iPhone é do dono).

## 6. P2 (melhoria importante)

Fichas completas nos relatórios de área. Aqui, por área, com o que importa para decidir. Duplicatas entre áreas foram
fundidas e indicadas.

**Segurança e infra**
- SEC-A-002 · Tetos de erro do login cedem a rajadas: 40 senhas erradas em paralelo foram todas avaliadas (limite desenhado
  5/min). `worker/src/api/auth.js:426, 454-465` (`estourou` lê antes de gastar). Caminho de credential stuffing contra contas
  pagantes. Fix: reservar a vaga antes de verificar (atômico), devolver no sucesso. Pequena · Sim.
- SEC-A-003 · Nome do cadastro entra cru nos e-mails do domínio ("Oi, Sua conta foi bloqueada. Regularize em https://…"):
  phishing assinado com DKIM. `auth.js:314`, `mail.js:162,109,225`. Fix: filtrar o nome (sem `/`, `:`, domínios) e não usá-lo
  antes da confirmação do e-mail. Mínima · Sim.
- SEC-A-004 · Workflow do GitHub Pages publica o curso inteiro sem portão (ver seção 4). Apagar `deploy-app.yml`. Mínima · Sim.
- SEC-A-005 · Monitor externo (UptimeRobot) não comprovado; alertas internos não cobrem 5xx nem "backup sem cópia há 36 h";
  cópias no R2 da mesma conta Cloudflare. Fix: registrar o monitor em INCIDENTES.md; alerta diário de 5xx e backup; uma cópia
  semanal criptografada fora da Cloudflare. Pequena · Revisar antes.

**Pagamentos**
- PAY-B-002 · O PIX vive só na memória da aba: recarregar ou voltar do app do banco mostra "Pagar" de novo, sem o código;
  /perfil lista "Aguardando" sem o copia-e-cola. Caminho mais provável para "paguei duas vezes" (detectado, mas estorno
  manual). `CheckoutClient.tsx:80,359`. Fix: no mount, retomar o pedido `pending` com `pix.expiresAt` futuro; "Ver código PIX"
  no perfil. Pequena · Sim.
- PAY-B-003 · Tela de retorno da Mercado Pago (`obrigado/ObrigadoClient.tsx:65-75,124-171`): pedido `refunded` diz "Nada foi
  cobrado"; sem pagamento nenhum diz "em análise… com boleto" (não há boleto); cartão recusado segura "Confirmando… Não feche
  esta página" por 3 minutos. Confirmado no navegador com pedidos sintéticos. Pequena · Sim.
- PAY-B-004 (= UXQA-004) · Dia seguinte ao fim dos 12 meses: /meu-hebraico dá 302 para a página de vendas sem explicação;
  /perfil mostra "Não está na sua conta" (o ramo "Acesso encerrado" é código morto, `db.js:460-475` só carrega ativos; o PASS de
  28/09 era falso); nenhum e-mail aos 30/7 dias nem no dia; a página de vendas diz "não pague de novo" a quem precisa renovar.
  Fix: `/api/me` devolver `expiredAt`; texto "Seu acesso terminou em dd/mm. Renovar"; e-mails de vencimento no cron diário.
  Média · Sim.
- PAY-B-005 · Modo PIX direto: a ação `liberar` do GitHub não marca o pedido como pago (`acesso.yml:365-394`): "Aguardando"
  eterno, desistência pelo site impossível (`POST /api/pay/desistir` → 409 `nao-pago`, provado), sem recibo, e o fluxo
  "PIX direto → /admin/estornos" nunca é alcançável. Fix: `liberar` com `pedido` opcional que faz `markPaid` + direito com
  aquele `order_id` + `confirmarPorEmail`. Pequena · Sim.

**Jurídico (observações de produto; o advogado decide)**
- LEGAL-102 · "Em até 12x" no checkout, capa e rodapé (26 páginas) sem "com juros"; só Termos e FAQ avisam. CDC art. 52.
  Fix: "parcelado em até 12x com juros da Mercado Pago (o total aparece antes de confirmar)". Pequena · Sim.
- LEGAL-103 · Termos (art. 1 e 2) e FAQ olham só `soPix()`: com PIX desligado na conta MP, continuam prometendo "R$ 132,30 no
  PIX" e "liberado em minutos"; em pix-direto, os CTAs dizem "Acesso imediato" enquanto o checkout diz "até 2 dias úteis". Fix:
  `temPix()`/`confirmaSozinho()` nos Termos, FAQ e `cta.ts`; teste com `formas.pix=false`. Pequena · Sim.
- LEGAL-104 · A "versão" aceita é uma data comum a todas as políticas, já gravada para dois textos diferentes dos Termos
  (commits 4b83dde, 8a68e80, 7530c76 no mesmo dia 29/09); não há arquivo das versões antigas; o recibo linka `/termos/`, que
  mostra sempre a atual; o aceite da compra não é gravado. Decreto 7.962 art. 4º IV. Fix: versão = hash do texto renderizado
  conferido por `check-legal`; `/termos/v/<versao>/` imutável; gravar a versão em `orders`. Média · Revisar antes.
- LEGAL-105 · Termos art. 9 proíbem retroação e a Política promete aviso por e-mail antes de mudança relevante; desde 29-30/09
  entraram para todas as contas o limite de 3 aparelhos, as marcas e as estatísticas, sem rotina de aviso. Fix: o dono confirma
  se houve venda real antes de 29/09; se sim, e-mail único; criar a rotina de aviso. Pequena · Revisar antes.
- LEGAL-106 · "O depoimento sai de onde estiver publicado em até 7 dias": retirar (`DELETE /api/depoimento`) ou apagar a conta
  só grava trilha; o dono não é avisado; a vitrine é um arquivo estático. Fix: e-mail ao dono quando a linha removida era
  `aprovado`. Pequena · Sim.
- LEGAL-107 (= CONV-007) · O único depoimento (Natália) foi cortado a pedido do dono sem "[...]", a autorização existe só como
  comentário de código, a página /depoimento promete "o texto não é editado por ninguém", e a citação elogia "imagens" que o
  curso não tem (47/47 imagens de vocabulário `null`). Fix: "[...]" no corte; autorização escrita guardada; ou pedir que ela
  use o fluxo /depoimento; título singular até haver 3 depoimentos. Mínima · Revisar antes.
- LEGAL-109 · Termos art. 8: confirmação de recebimento da desistência por e-mail "na hora"; Política de Reembolso: "em até 2
  dias úteis"; só o canal do site confirma na hora. Decreto 7.962 art. 5º §4º. Fix: auto-resposta no Gmail/`contato@` e
  unificar o texto. Mínima · Revisar antes.
- LEGAL-110 · "Devolvemos 100%" e "saldo final zero" na compra parcelada dependem de os juros da MP voltarem; nunca houve
  compra real parcelada com desistência. CDC art. 49 parágrafo único. Fix: fazer a compra real; ajustar texto ou devolver a
  diferença. Pequena · Não.
- LEGAL-111 · A capa diz "o conteúdo do livro dele é a base" e os Termos art. 5 dizem "O conteúdo é nosso" e citam Lei 9.610 e
  CP art. 184; a autorização do autor é afirmada em CLAUDE.md mas não está em lugar verificável nem com escopo conhecido. Fix:
  o advogado lê a autorização e ajusta o art. 5. Mínima (texto) · Não.

**Conversão e confiança**
- CONV-003 (= LEGAL-117) · Canal oficial é `languageswithmoshik@gmail.com`, Gmail pessoal com outra marca, ao lado de CNPJ e
  domínio próprio. Principal sinal de "projeto de hobby". Fix: depois de LEGAL-101, trocar os três campos de `contato` em
  `data/empresa.json` por um endereço do domínio encaminhado. Mínima · Revisar antes.
- CONV-004 · /sobre:120-126 ("O que é adaptação minha") diz que "a sequência em que as letras entram foi organizada" pelo
  Moshik, ao lado do cartão novo que diz "A ordem em que as letras entram vem do método dele". Contradiz a decisão de 01/10.
  Fix: tirar a frase do cartão; check que proíbe "sequência em que as letras" fora de `lib/credito.ts`. Mínima · Sim.
- CONV-005 (= LEGAL-124) · Capa "Formação CELTA e Letras"; a nota interna diz Letras em curso; /sobre diz "estudos em Letras".
  Fix: "CELTA · Letras em andamento" ou só "Formação CELTA". Mínima · Revisar antes (o dono confirma).
- CONV-006 · /biblia:108 "lição 20 das 22": é a letra 20; a lição é a 14 e o curso tem 27. Fix: "até a letra 20 das 22 (lição 14
  das 27)" calculado; incluir /biblia no `numeros.mjs`. Pequena · Sim.
- CONV-009 · O botão principal do hero ("Comece do zero e leia suas primeiras palavras") leva direto a "Passo 1 de 2: sua
  conta" com preço. Fix: rótulo que diga o que vem ("Começar o curso · R$ 147"). Mínima · Revisar antes (teste A/B).

**Visual, mobile e acessibilidade**
- VIS-002 · O ajuste de texto do próprio site a 130/150% quebra a plataforma no celular (360 px a 150%: /vocabulario rola 58 px,
  cabeçalho sobre o XP, barra inferior colada); `a11y.mjs` passa porque roda num servidor estático sem conteúdo pago. Fix: zoom
  só no conteúdo abaixo de 640 px; truncar a marca; rótulos da barra só ícone; `a11y.mjs` contra o Worker com cookie. Média ·
  Revisar antes.
- VIS-003 · A 360 px e abaixo, "Hebraico Fluente" passa por baixo de "◆ 500 XP" em toda tela paga (`AppShell.tsx:175`,
  `Logo.tsx:40`). Fix: `truncate` ou só o ícone abaixo de 380 px. Mínima · Sim.
- VIS-004 · Painel e selo dizem "5 a revisar" (usa `dueCount`) e /revisao responde "Ainda não há o que revisar" (usa `learned`);
  o número é de itens, o texto diz "letras". `Painel.tsx:99-140` × `ReviewClient.tsx:83-93`. Pequena · Revisar antes (PED).
- VIS-005 · "Ligue cada sílaba à sua leitura" na lição: sem `aria-pressed`, foco cai no body a cada par, acerto e erro não
  anunciados (`Answers.tsx:371-460`); o Match da Academia já faz certo. Pequena · Sim.
- VIS-006 · A Declaração de Acessibilidade afirma 150% verificado, teclado em toda a plataforma e correção anunciada; VIS-002/005/008
  mostram que não. LBI art. 63. Fix: corrigir os três ou mover para "o que ainda não está bom". Mínima · Revisar antes (LEGAL).
- VIS-007 · Branco sobre gold #B8862F = 3,24:1 no botão "Começar revisão" e no selo da Revisão (mesmo defeito corrigido no teal
  em 28/09). Fix: `--gold-ink` #8A6520 de fundo. Mínima · Sim.

**Jornada UX e QA funcional**
- UXQA-001 · Sem JavaScript, toda página pública (capa, curso, checkout, entrar, FAQ) mostra só cabeçalho, rodapé e três
  retângulos de esqueleto: o conteúdo está no HTML, dentro do `div hidden` do streaming (`app/src/app/loading.tsx` raiz). O PASS
  de 28/09 media `textContent`. Fix: `loading.tsx` só nas rotas da plataforma, ou `<noscript>`. Pequena · Revisar antes.
- UXQA-002 · Fixação abaixo de 80%: "Concluir e continuar → letra Mem" e "Começar a lição" do painel levam a "A letra מ ainda
  não abriu". Primeira letra do curso. Fix: botão principal vira "Refazer a fixação (precisa de 80%)"; painel aponta "Terminar
  Álef". Pequena · Sim.
- UXQA-003 · FAQ promete "volta exatamente na lição e na questão"; recarregar (ou aba descartada pelo celular) no meio da
  Prática volta à etapa Conhecer e zera 1/14; Voltar do navegador sai da lição. Fix: `sessionStorage` como o exame já faz, ou
  reescrever a FAQ. Média (retomar) / Mínima (texto) · Sim.
- UXQA-005 (= CONT-007) · "Concluída" × "dominada" trocadas: checkpoint "VOCÊ JÁ DOMINA" a 50%; /concluido "1/22 dominadas" e
  "Conquistas 0 de 11" fixo (há 18); /certificado "0 de 22 concluídas" contando domínio; loja "6 de 8" (a fixação tem 10 itens,
  domínio 75% = 8 de 10, trava 80%). Fix: um vocabulário, `lettersMastered`, textos derivados das constantes. Pequena · Sim.
- UXQA-006 · Aparelho derrubado pelo limite de 3 cai em /entrar sem explicação; "Sair" desconecta todos os aparelhos e a
  confirmação não diz; não há lista de aparelhos. Fix: `?motivo=` no portão + frase em /entrar; confirmação de sair honesta.
  Pequena · Revisar antes (logout global é decisão de segurança).
- UXQA-007 · Conta sem curso (inclusive quem pagou por PIX e aguarda) vê "Meu Hebraico" e a navegação inteira do aluno; cada
  link cai na página de vendas com o preço antes do aviso "não pague de novo". Fix: `?sem-acesso=1` e aviso acima do preço;
  casca pública em /perfil sem curso. Pequena · Sim.

**Conteúdo, pedagogia, hebraico**
- CONT-001 · Prática do Kaf: 417 de 1.000 rodadas trazem "Ligue cada letra ao seu som" com duas cartas "/k/" (כ e ק); o Match
  corrige por índice, então ligar ק ao "/k/" do כ conta como erro e alimenta a confusão ק↔כ no modelo. `generators.ts:455-468`,
  `sons.ts:327`, `Answers.tsx:402-413`. Mínima · Sim.
- CONT-002 · Dicas e explicações com `{{…}}` cru (`Answers.tsx:566`, `ExercisePlayer.tsx:338-340`): 11 letras, 9 frases, cenas;
  confirmado no navegador. Fix: `<Prose>` como já feito em Compreensao.tsx. Mínima · Sim.
- CONT-003 · O som da letra é mostrado em IPA cru ("/j/" para Yod, "/ʁ/", "/χ/"), contradizendo a nota "nunca como o J do
  português"; aparece no cabeçalho da lição e no exercício de ligar. Fix: campo `somPt` legível. Pequena · Revisar antes.
- CONT-004 · Dt 6:9 do Shemá foi trocado para מְזוּזֹת pela correção PED-015 de 28/09; o massorético (Leningrado/BHS) é
  מְזֻזֹת (a grafia com vav é Dt 11:20). PRECISA VERIFICAÇÃO MANUAL num Tanakh (Sefaria bloqueado daqui). As outras 59 linhas
  conferem. Mínima · Revisar antes.
- CONT-005 · Teste da Academia no sentido "pt": perguntas com duas respostas certas (ת/ט para "t", א/ע para "mudo", קִ/כִּ para
  "ki"), ~4% das partidas. `deck.ts:190-243`. Pequena · Sim.

**Performance**
- PERF-003 · /entrar e /criar-conta saem do build com `<main>` vazio (`Suspense fallback={null}` + `useSearchParams`); em Fast
  3G o formulário aparece em 4,4-4,6 s e o rodapé salta (CLS 0,587). São as duas portas da compra. Pequena · Sim.
- PERF-004 · Lição em cascata: HTML → JS → `/api/me` → só então `/api/content` (79 KB gzip, `no-store`, rebaixado a cada carga)
  com 15 prefetches disputando banda: LCP 7,3 s em Fast 3G, CLS 0,156. Fix: buscar o conteúdo na montagem em paralelo;
  `prefetch={false}` nos links do rodapé; esqueleto com altura. Pequena · Sim.
- PERF-005 · FAQ promete "o curso funciona no ônibus"; sem service worker, a próxima aula offline é a página de erro do
  navegador. Fix mínimo: texto. Mínima (texto) / Grande (offline) · Revisar antes.

## 7. P3 (polimento)

Uma linha por item; fichas nos relatórios de área.

| ID | Resumo |
|---|---|
| SEC-A-006 | CSP aplicada ainda tem `unsafe-inline`; a estrita (nonce + hashes) só em Report-Only. Promover depois de ler os relatos. |
| SEC-A-007 | `/api/health` público expõe `modo`, `tokenFormato`, `vendedor`, `emailEntregue`, `varredura`. |
| SEC-A-008 | Estatísticas aceitam conta sem curso; A/B aceita anônimo 30/min: dá para envenenar os números. |
| SEC-A-009 | Raiz sem lockfile (`npm audit` falha); wrangler transitivo resolvido a cada deploy com tokens no ambiente; actions por tag. |
| SEC-A-010 | Marca por aluno só em `didYouKnow`/cultura e removível; "compra, baixa /api/content, desiste" leva o curso sem rastro útil. Registrar /api/content na trilha e alertar desistência com download completo. |
| SEC-A-011 | Resumo da ação Acesso mascara só o usuário do e-mail; conferir visibilidade do repositório. |
| PAY-B-006 | Nenhum e-mail ao aluno quando o estorno conclui e o acesso fecha. |
| PAY-B-007 | Alerta de "segredo do webhook mudou" exige 20 linhas/h, mas cada IP grava 1/h: praticamente mudo. |
| PAY-B-008 | Pedido pago duas vezes: estornar o primeiro (o de `provider_ref`) fecha o acesso embora o segundo siga pago. |
| PAY-B-009 | Cartão `in_process` > 24 h vira `expired` e sai da varredura; só o webhook libera depois. |
| PAY-B-010 (= UXQA-013) | Toda tentativa falha vira "NÃO CONCLUÍDO" vermelho em Compras; pedidos `failed` sem `provider_ref` entram na varredura e geram alerta falso. |
| PAY-B-011 | "A gente resolve na hora" × atendimento "em até 2 dias úteis"; renovação diz "12 meses da confirmação" mas soma ao vencimento. |
| PAY-B-012 | Nenhum ponto do fluxo fala de nota fiscal (NFS-e); pendência do dono com o contador. |
| PAY-B-013 | Presenteado não vê o convite e pode pagar pelo que ganhou; não há ferramenta para mover compra entre contas. |
| PAY-B-014 | Testes não cobrem corpo manipulado em `create`, PIX direto ponta a ponta, `expired` pago depois, telas obrigado/checkout/perfil, virada do pré-lançamento. |
| LEGAL-112 | Termos admitem menor com responsável; Política diz "não coletamos de menores"; sem dizer se há reembolso ao remover conta. ECA Digital: parecer. |
| LEGAL-113 | Apagar a conta apaga a prova do aceite, mas pedidos ficam: sem como provar o contrato numa contestação posterior. |
| LEGAL-114 | Política só descreve a marca invisível; a visível (e-mail parcial na margem) só nos Termos; sem base legal escrita para marca, aparelhos e estatísticas (LIA). |
| LEGAL-115 | Transferência internacional cita art. 33 sem inciso; Mercado Pago fora da frase. |
| LEGAL-116 | "Prazo legal de guarda fiscal" sem número e sem purga; o contador dá o prazo. |
| LEGAL-118 | Identificação completa do fornecedor ausente nas telas logadas, inclusive /perfil (onde está "Desistir"). |
| LEGAL-119 | CTA de venda no pé da Privacidade e da Acessibilidade; "mudanças no produto" × serviço; Acessibilidade fora da navegação das políticas; três redações do início dos 12 meses e dos 7 dias. |
| LEGAL-120 | Suspensão: sem consequência financeira escrita; "muito acima do normal" vago; citação do CP 154-A. Advogado. |
| LEGAL-121 | Renovação existe no código (soma ao vencimento) e não está nos Termos. |
| LEGAL-122 | Sem "baixar meus dados"; nome não editável; procedimento LGPD interno não escrito. |
| LEGAL-123 | `check-legal` não cobre versão × texto, data vencida, Termos × formas ativas. |
| LEGAL-125 | Registro de acesso só nas entradas, não no uso (Marco Civil art. 15): parecer. |
| CONV-010 | Método descrito de três jeitos (capa 6 passos, /metodo 5 regras, produto 5 abas); os 6 passos omitem a escrita. |
| CONV-011 | Rodapé "do alfabeto à conversa" e A1/A2/B1 como oferta; FAQ "você entra na trilha". |
| CONV-012 | "Cardápio" prometido em 3 lugares; nenhuma cena de cardápio em real-world.json. |
| CONV-013 | FAQ "mesmo dia útil" × rodapé "até 2 dias úteis". |
| CONV-014 | Frases metalinguísticas com cara de IA; "10% off"; "nikud"/"niqqud". |
| CONV-015 (= VIS-014) | "Começar   agora" com vão visível no cabeçalho desktop (`&nbsp;` + gap). |
| CONV-016 | "com boleto" na tela de retorno; não há boleto. |
| CONV-017 (= SEO-003) | Só `icon.svg`; sem `apple-touch-icon` nem `favicon.ico` (404 passando pelo Worker). |
| CONV-018 | Nome do vendedor na tela da Mercado Pago (pessoa física ou "Mhg"?) não verificável daqui. |
| CONV-019 | Credenciais do professor sem nenhum link verificável. |
| CONV-020 | Primeiro acesso: botão principal "Começar a lição" e a Aula 0 como cartão secundário: ordem oposta à recomendada. |
| CONV-021 (= VIS-016 = UXQA-014) | Botão flutuante de acessibilidade cobre o mockup do hero, o cartão de cartão no checkout, a folha de retorno e as teclas de nikud; toast de conquista cobre o teclado da tela. |
| VIS-008 | Foco cai no body após responder perguntas rápidas da etapa 1, nos jogos Batalha/Impressa/Blast e após "Mais uma dica". |
| VIS-009 | Com 1 letra, a Academia mostra os seis jogos como disponíveis e todos abrem "Siga mais uma lição"; estado vazio sem heading. |
| VIS-010 | /mapa "Em breve" e /conquistas bloqueados com opacidade: 3,01:1 e 2,28:1. |
| VIS-011 | Marca d'água vertical a 10,5 px na calha de 16 px do celular: o elemento que mais tira a sensação premium (decisão do dono). |
| VIS-012 | Checkout sem h1 em nenhum passo. |
| VIS-013 | Jogo Teste numera 1-4 sem atalho de teclado. |
| VIS-015 | Selo "Sequência 7 dias" do mockup cobre o contador no desktop e cai sobre o rodapé a 768 px. |
| VIS-017 | Placeholders com cor e tamanho de texto preenchido: "Daniel" parece nome já digitado (vai para o certificado). |
| VIS-018 | Emojis coloridos (🛡️ 📜 ✨ 👋 ⚠️ 🎤) num sistema de ícones de traço fino. |
| VIS-019 | Tudo em px: "só texto maior" do navegador não muda nada (compensado pelo menu, que tem VIS-002). |
| UXQA-008 | Nome pedido três vezes e nunca reaproveitado; "fica só no seu navegador" é falso (sobe para /api/progress); certificado baixa sem nome como "aluno". |
| UXQA-009 | Onboarding sem motivo "Bíblia/religioso", apesar da capa e do /biblia. |
| UXQA-010 | Capa e página do curso não dizem que o curso não ensina a falar (persona "viajar a Israel"). |
| UXQA-011 | Senha atual errada responde "E-mail ou senha não conferem" numa tela sem e-mail. |
| UXQA-012 | "Digitar em hebraico" abre com guia de instalação do teclado do sistema; o teclado da tela fica embaixo. |
| UXQA-015 | /concluido abre para qualquer aluno com "Você está lendo hebraico… ✓ Reconhecer as 22 letras" com 1 lição feita. |
| UXQA-016 | FAQ diz que o suporte é só para acesso/pagamento; /suporte convida dúvidas do curso; prazos diferentes. |
| UXQA-017 | React #418 (hidratação) na 404 de rota paga para aluno. |
| UXQA-018 (= PERF-007) | Dois 401 no console (`/api/me`, `/api/progress`) em toda página pública, e 2 invocações do Worker por visita. |
| UXQA-019 | Desistência afirma "a confirmação é enviada para {email}" sem saber se saiu. |
| UXQA-020 | `/api/content` (296 KB) baixado a cada carga dura; 10-15 s de esqueleto em rede lenta (ver PERF-004/008). |
| UXQA-021 | Dois áudios de /biblia (אֵת, וְאֵת) sem arquivo; botão escondido. |
| UXQA-022 | Quem já lê um pouco não tem nivelamento nem "já sei esta letra": 27 fixações a 80% em ordem (decisão do dono). |
| CONT-006 | "Onde está a letra?" com palavras onde ela aparece duas vezes (שֶׁמֶשׁ, נֹתֵן, גַּג…): só a primeira posição vale, inclusive no exame. |
| CONT-008 | Página de todo módulo diz "As três lições… duas novas e uma de prática": o 2 tem 4, o 5 tem 7, o 7 tem 4. |
| CONT-009 | Os 5 mini-textos foram reescritos em 27/09 mantendo `revisado: true`; TEXTOS-PARA-REVISAR.md descreve os antigos. O hebraico atual está correto. |
| CONT-010 | Faixa máxima do exame "decodificou palavras que não viu antes" (todas são do curso); o exame abre sem os módulos 6 e 7 e cobra 5 itens deles. |
| CONT-011 | shalom/shalóm, nikud/niqqud, daguesh/dagesh, Yisraél/esrim: duas grafias. |
| CONT-012 | Resposta digitada rejeita "ge/gi", "geshem", "todah", "lehem" (grafias plausíveis). |
| CONT-013 | Lições de som (Sin, Vet/Chaf/Fe, contraste, ponto, gerech) medidas quase só com itens de 2 alternativas: chute dá 50%. |
| CONT-014 | Traçado: meia letra recebe "Muito bem"; ordem/direção dos traços não medidas, mas a vitrine promete "na ordem certa". |
| CONT-015 | Dicas do Qof e do Shin citam letras ainda não ensinadas (כּ, שׂ). |
| CONT-016 | Fala: esqueleto sem ו/י aceita palavra diferente; "Certo!" com autoridade sobre o que é inteligibilidade para o Google. |
| CONT-017 | Assinatura de exercício ignora `he`: a fixação nunca tem duas vogais nem dois digitados. |
| CONT-018 | 8 sílabas de Kaf/Pe fora de NFC no dado-fonte (o exportador normaliza). |
| CONT-019 | 22 leituras × 200 XP = 4.400 XP contra ~2.000 do curso; 47 imagens de vocabulário `null`; "Ouvir e escolher" sem frases. |
| PERF-006 | 11 preloads de fonte (177 KB) em toda página; 4 nunca usadas nas públicas; negrito de UI sintetizado. |
| PERF-008 | Cada clipe de áudio: 3-4 leituras de D1 e `no-store`; clipe já ouvido é baixado de novo. `private, max-age=86400` (decisão SEC). |
| SEO-001 | Nenhum JSON-LD (Organization com CNPJ, Course, FAQPage, Person). Oportunidade; se feito, `priceValidUntil` gerado do catálogo. |
| SEO-002 | URL sem barra final redireciona com 307, não 308. |
| SEO-003 | /cursos sem h1; 404 com título genérico; description da capa com 208 caracteres; `*.txt` RSC sem `X-Robots-Tag`. |
| TEC-001 | ~900 linhas de componentes mortos da capa antiga (fora do bundle, confirmado) e 40 fontes copiadas para /out/fonts (624 KB) usadas só por uma ferramenta. |
| TEC-002 | Raiz sem lockfile; wrangler 4.138 local × 4.135 no CI. |
| TEC-003 | Tailwind 4 (`@layer`, `@property`, `color-mix`): iOS ≤ 15.3 veria o site sem estilo; não medido. |

---

## 8. Auditoria de segurança (A)

**Resultado: nenhum caminho testado deu acesso ao conteúdo pago sem pagar, a dados de outra conta ou ao painel.**
Testado e aprovado, com evidência: portão em 24 variações de caminho (maiúsculas, `%6C`, `//`, `..`, `.html`, `index.txt`,
`?_rsc`); `/api/content`, `/api/orders`, `/api/progress`, `/api/depoimento`, `/api/admin/*` sem cookie (401) e com conta sem
curso (403 `not-owned`/`not-admin`); admin com senha e sem 2º fator (403 `admin-codigo`); IDOR por parâmetro em verify,
orders, progress e desistir (ignorado ou 404); CSRF com `Origin` estranho, `null` e `Sec-Fetch-Site: cross-site` (403);
cookie adulterado em 4 formas (401); webhook sem assinatura, com assinatura falsa, tópico estranho, id não numérico (401
ou 200 ignorado); mensagens de erro só com códigos; 0 source maps; 0 strings dos 11 JSON pagos no export público (963
strings varridas); cabeçalhos completos (CSP, HSTS 1 ano + preload, X-Frame DENY, nosniff, Referrer, Permissions, páginas
pagas `private, no-store` + `noindex`); `npm audit` 0 vulnerabilidades; histórico git sem segredo real (só fixtures de
teste); `acesso.yml` com inputs por `env:` e SQL com aspas dobradas; 2º fator: 40 códigos paralelos, 6 avaliados, 0 aceitos.

**Achados:** SEC-A-001 (P1, backup quebrado), SEC-A-002/003/004/005 (P2), SEC-A-006 a 011 (P3). Estado dos 27 itens de
28/09: 5 resolvidos (SEC-005, 006, 009, INFRA-003, 005), INFRA-001 regrediu, o resto continua ou é não verificável daqui
(DNS, proteção de branch, visibilidade do repositório). Nota: 78.

## 9. Auditoria de pagamentos (B)

Fluxo seguido no código: CTA → checkout 2 passos → `POST /api/pay/create` (preço só do catálogo, provado com corpo
manipulado: `amount:1`, `pixDiscountPct:100`, `installments:99` ignorados) → preferência de cartão (23 h) ou PIX (30 min) →
back_urls para /obrigado → `GET /api/pay/verify` (reconsulta MP) → webhook assinado + `payment_events` UNIQUE + `markPaid`
condicional → varredura de pendentes a cada 5 min e dos pagos uma vez por dia → `grantAccess` 12 meses (renovação soma ao
vencimento) → estorno/chargeback via webhook `chargebacks`/`merchant_order` → desistência em 7 dias com estorno automático
(8 tentativas, intervalo crescente), alerta diário e /admin/estornos. 63/63 testes de pagamento, estorno, estornos-admin e
PIX verdes.

**Nenhum cenário de acesso sem pagar nem de preço errado.** Cenários de "paga e não recebe" ou de confusão: PAY-B-002 (PIX
perdido), PAY-B-003 (tela de retorno), PAY-B-004 (vencimento), PAY-B-005 (PIX direto sem `paid`), PAY-B-009 (`in_process`
> 24 h). Estado de 28/09: PAY-001, 002, 006, 007, 009, 010 resolvidos; 003, 004, 005 parciais; 008 não testável; 011 fora do
runbook; o PASS "Acesso encerrado" era falso. Sem credencial MP aqui: `create` responde 502 `payment-failed` com texto digno
("o problema é nosso… nada foi cobrado") e o pedido nasce `failed` com valor do catálogo. Nota: 78.

## 10. Auditoria jurídica e de conformidade (C)

Aprovado com evidência: identificação completa do fornecedor (razão social, CNPJ, endereço, e-mail, WhatsApp, horário,
prazo) em todas as páginas públicas, no cadastro e no checkout; "Condições desta compra" exemplares (o que leva, 12 meses,
pagamento único sem renovação automática, o que não vem junto, quando abre, 7 dias); desistência pelo site com confirmação
imediata e estorno automático, prazo contado da liberação; aceite dos Termos por caixa desmarcada conferida no servidor com
data e versão; marketing com opt-in, link de saída assinado e POST próprio; retenções escritas e implementadas (trilha 180
d, Marco Civil 190 d, IP da desistência 190 d, backups 90 d, estatísticas 365 d); exclusão de conta self-service e atômica;
nenhum dado sensível; só um cookie de sessão; sem script de terceiros; certificado com "não é oficial"; Declaração de
Acessibilidade publicada; plano de incidentes com ANPD em 3 dias úteis; preço cheio sem traço e com data; encarregado
dispensado por ME (confirmado pelo contador em 01/10) com o canal na Política.

**Achados:** LEGAL-101 (P1), LEGAL-102 a 111 (P2), LEGAL-112 a 125 (P3). Contradições entre documentos e produto estão
tabeladas em C-legal.md §2 (desistência por e-mail, PIX nos Termos, juros, versão do contrato, retroação, depoimento,
menores, "conteúdo é nosso" × "base é o livro dele", serviço × produto, três redações do início dos prazos). Dos 26 itens
de 28/09: 17 resolvidos, 4 parciais, 3 continuam, 1 não verificável. Nota: 76.

## 11. Landing page e conversão (D)

Primeira impressão: limpa, profissional, hebraico de verdade na tela, preço visível, não parece golpe. Headline A ("Ler e
escrever hebraico, do zero.") mais clara que a B (perguntas); com o volume de pré-lançamento o A/B não terá significância
até 31/10. O teste grátis do Álef sem cadastro é o melhor ativo de conversão do site. Oferta clara no checkout e genérica
na capa (a lista de "inclui" não mostra Aula 0, exame, certificado, jogos, áudio do professor). Alegações conferidas: "27
lições" ✓, "22 letras" ✓, "voz do professor israelense" ✓ (539 clipes), "lê palavras reais na primeira semana" ✓,
"certificado" ✓ com ressalva; "cardápio" ✗, "Formação Letras" ✗ exagerado, "imagens" no depoimento ✗, "lição 20 das 22" ✗.
A capa encurtada (19 → 12 seções) ficou coerente; o que faltou não estava nas seções cortadas: redução de risco perto do
preço, "o que não está incluído", a ressalva "cursos à parte", itens concretos na caixa de preço.

**Achados:** CONV-001 (P1), CONV-002 (= LEGAL-101, P1), CONV-003 a 009 (P2), CONV-010 a 021 (P3). Nota: 76.

## 12. UX da jornada (F, parte 1)

Seis personas percorridas de verdade a 390 e 1280 px. A (zero), C (Bíblia) e F (só celular) são bem servidos. B (viajar)
sai achando que vai se virar em Israel: ninguém diz na capa nem no curso que não se ensina a falar (UXQA-010). D (já sabe um
pouco) bate no portão de 80% em 27 fixações sem atalho (UXQA-022). E (mais velha) tropeça em sessão derrubada sem
explicação (UXQA-006), nome pedido três vezes (UXQA-008) e textos de progresso que se contradizem (UXQA-005). Estados de
borda bem tratados: deep link em lição trancada, 404 real, `next=` malicioso, localStorage corrompido/cheio/bloqueado,
sessão expirada, API fora, áudio 404, esqueci senha ponta a ponta, apagar conta. Mal tratados: sem JS (UXQA-001), refresh e
voltar no meio da lição (UXQA-003), letra trancada pelo botão (UXQA-002), vencido e sem curso (UXQA-004/007). Nota: 76.

## 13. Visual e design premium (E)

Produto limpo e consistente: 0 px de rolagem lateral em 23 telas × 5 larguras (e a 320/683 com zoom 400/200%), um h1 por
tela (exceto checkout), landmarks em todas, nenhum input sem label, nenhuma imagem sem alt, hebraico sempre com `lang="he"`
e `dir="rtl"`, Noto Serif Hebrew com nikud no lugar, cursiva distinta, retrato real do professor. O que tira a sensação
premium: tema escuro ilegível (VIS-001), marca d'água vertical na calha do celular (VIS-011, decisão do dono), emojis coloridos
no meio de ícones de traço (VIS-018), "Hebraico Flue◆nte500" a 360 px (VIS-003), "Começar   agora" (VIS-014), selo do
mockup cobrindo o contador (VIS-015), placeholders que parecem preenchidos (VIS-017). Nota visual: 80.

## 14. Acessibilidade (E)

`a11y.mjs` 27/27 (botão, alvo 52 px, Alt+Shift+A, Esc, 150% no parágrafo, alto contraste ≥ 7:1, menos animação, 390 px
sem rolagem), mas roda num servidor estático sem conteúdo pago. Verificado a mais: ordem de Tab lógica e anel de foco em
100% dos elementos na capa, login e cadastro; lição inteira só com teclado (etapas 1-3 por Tab+Enter, prática com 1-4 e
Enter, foco no h2 da questão seguinte, feedback em `aria-live`); diálogo de acessibilidade prende o Tab; erro de login com
`role=alert` e `aria-invalid`; `prefers-reduced-motion` zera 11 animações da capa; contraste no tema claro só falha no gold
(VIS-007) e em números decorativos. Reprovado: tema escuro (VIS-001), 150% no celular (VIS-002), "Ligue os pares" cego para
leitor de tela (VIS-005), foco caindo no body em perguntas rápidas, jogos e dica (VIS-008), opacidade em /mapa e /conquistas
(VIS-010), checkout sem h1 (VIS-012), e a Declaração afirmando o que não entrega (VIS-006). Exige teste manual: VoiceOver/
TalkBack lendo consoante + nikud, NVDA, Safari/iOS (áudio, gravação, teclado virtual), Firefox, daltonismo nos jogos. Nota: 70.

## 15. Mobile (E, F, H)

360/390/412 px: sem rolagem lateral; alvos ≥ 40 px na barra e no cabeçalho, 72 px nos controles de resposta; traçado por
toque funciona; teclado hebraico da tela funciona (coberto por toast e botão flutuante, UXQA-014). Problemas: cabeçalho a
360 px (VIS-003), 150% (VIS-002), botão flutuante sobre conteúdo (VIS-016), aba descartada perde a prática (UXQA-003), PIX
some ao voltar do banco (PAY-B-002), lição em 7 s e login vazio por 4 s em Fast 3G (PERF-003/004), áudio no iPhone a
confirmar (PERF-002), Tailwind 4 em iOS antigo não medido (TEC-003). Nota: 74.

## 16. Performance (H)

Medido com PerformanceObserver + CDP (Lighthouse não instalado), 390×844, cache desligado, Fast 3G + CPU 4x:

| Página | LCP rápido / lento | CLS | Reqs | KB gzip |
|---|---|---|---|---|
| Capa | 540 ms / 2,9 s (hero) | 0 | 49 | 498 (JS 247, fontes 177) |
| /cursos/alfabetizacao | 284 ms / 2,8 s | 0 | 47 | 483 |
| /entrar | 152 ms / 2,3 s | **0,587** | 57 | 524 |
| /licao/alef (logado) | 964 ms / **7,3 s** | **0,156** | 70 | 664 (/api/content 79) |

Aprovado: CLS 0 nas páginas de venda, hero com `fetchPriority=high` e versão mobile de 4,6 KB, retrato lazy, 539 mp3 nunca em
lote, heap estável em 30 navegações, 0 erros de console para o aluno, build sem avisos. Achados: PERF-001 (P1), PERF-002 (P1),
PERF-003/004/005 (P2), PERF-006/007/008 (P3). Nota: 68.

## 17. SEO e compartilhamento (H)

Aprovado: portão contra buscador provado com 15 variações (302 + `noindex` + `no-store`); `seo.mjs` + `checa-seo.mjs` EXIT 0;
sitemap com 15 URLs públicas e nenhuma paga nem /admin; robots `Allow: /` + Sitemap; 15 páginas com title único, description,
canonical com barra, `lang="pt-BR"`, OG completo, twitter card, og.jpg 1200×630 com "27 lições · 22 letras" (confere);
noindex em conta/checkout; 0 `<img>` sem alt; 0 links quebrados; 404 real. Achados: SEO-001 (sem JSON-LD, oportunidade),
SEO-002 (307), SEO-003 (h1 em /cursos, títulos, description longa, `.txt` sem noindex, ícones). Nota: 78.

## 18. QA funcional (F, parte 2)

Inventário de 40 funcionalidades com estado (F-ux-qa.md, Parte 2): 31 OK, 9 OK com ressalva, 3 não testáveis aqui (microfone,
nome decorado comprado, folga em dia real). Varredura: 0 TODO/FIXME reais, 0 `href="#"`, 0 placeholder, 0 `console.log` em
app/src, 0 `debugger`, 0 source maps, 114 HTML com 4.238 hrefs e 1.694 src locais todos presentes, 539/539 áudios do
manifesto presentes (2 ids de /biblia sem arquivo, botão escondido), 0 `{{ }}` visível nas páginas de curso/módulo/som/
extra (continua em dicas e explicações: CONT-002). Nota de confiabilidade funcional: 80.

## 19. Conteúdo do curso e pedagogia (G)

`validate.js` 0 violações; 245/245 testes pedagógicos; 539/539 clipes; fuzz de 44.974 exercícios com 20 sementes (prática e
fixação das 22 letras como a lição as mostra, 5 checkpoints, revisão, 11 modos da Academia, Blast, Teste, 720 exames, módulos
6 e 7, lições de som, 7 missões): regra da ordem respeitada em todos os construtores, gabarito sempre no intervalo, nenhuma
alternativa duplicada fora da "intrusa", montar sílaba/palavra sempre fecha, resposta digitada sempre aceita a própria
transliteração, nenhum sinônimo em pergunta de significado. Domínio = 5 etapas + 75% na fixação de 10; trava 80%; exame 45
itens com 70%; certificado só com 22 dominadas + exame; nada essencial atrás de XP. Achados: CONT-001 a 005 (P2), 006 a 014
(P3), 015 a 019 (P4). Nota: 80.

## 20. Hebraico (G)

Varredura de todo hebraico de `data/*.json` (NFC, formas de apresentação, finais fora do fim, shin sem ponto, בכפ inicial sem
daguesh, dois sinais de vogal): nenhum erro; letras, nomes, finais, daguesh, shin/sin, vav vogal corretos; pronúncia
moderna correta (ר uvular, ח raspado, א/ע mudos com nota mizrahi, צ = ts, ק = כּ, ת = ט); 23 frases e 5 textos corretos e
naturais; 59 de 60 linhas bíblicas conferem com o massorético, inclusive daguesh lene ausentes por regra. Pendências:
Dt 6:9 provavelmente alterado para a grafia errada por uma "correção" de 28/09 (CONT-004, conferir num Tanakh); som em IPA
cru contradizendo a nota de pronúncia (CONT-003); dicas com letras futuras (CONT-015); 8 sílabas fora de NFC no dado-fonte
(CONT-018). Nota: 90.

## 21. Português (G, D)

Texto claro, natural, adulto, sem travessões, sem erros de concordância ou acentuação na varredura de `data/*.json` e das
strings da interface. Pendências: marcação `{{ }}` visível em dicas e explicações (CONT-002), duas grafias para o mesmo termo
(CONT-011), frases metalinguísticas com cara de texto gerado e "10% off" (CONV-014), "mesmo dia útil" × "2 dias úteis"
(CONV-013), "queria" por "quero" numa justificativa (CONT-009). Nota: 90.

## 22. Cliente oculto (D)

Chegou por anúncio no Instagram, nunca ouviu falar do Moshik, celular 390 px.
1. **5 segundos:** "Curso de ler hebraico, bonito, parece sério." O botão de acessibilidade tapa um pedaço do mockup.
2. **O que acho que é:** curso no navegador, 22 letras e vogais, para ler (não falar); /biblia deixa claro que ler não é entender.
3. **Para quem:** brasileiro adulto do zero; viajante, leitor da Bíblia, família israelense. Me reconheço.
4. **Confio no criador?** Parcialmente: foto real, cargos em Tel Aviv e Buenos Aires, mas nenhum link para conferir, e-mail
   Gmail com outro nome, e "parte do livro de outra pessoa" me faz pensar "é um livro em formato de app?".
5. **Perguntas sem resposta antes do checkout:** posso pedir o dinheiro de volta? quanto fica a parcela? funciona no iPhone?
   quantos alunos já fizeram? quando sai o A1? quem é a Natália?
6. **Objeções:** "R$ 147 por algo que talvez eu largue"; "12 meses e depois perco?"; "e se eu não conseguir pronunciar?";
   "já tentei app grátis". A capa responde bem a última e mal a primeira.
7. **Atritos:** o botão principal me manda criar conta sem eu ter decidido; a capa ainda é longa; a barra fixa com preço ajuda;
   o checkout tem 2 passos claros e PIX pré-selecionado com desconto.
8. **Confiança para comprar:** 6,5/10 na capa; 8/10 depois do quadro "Condições desta compra", que só aparece depois do cadastro.
9. **Pós-compra (código):** "Pronto. O curso é seu. Acesso liberado por 12 meses" → /meu-hebraico; e-mail-comprovante completo
   (link, valor, data de fim, pedido, como desistir, termos versionados), exceto o "responda este e-mail".
10. **Primeira sessão:** "Bom dia, Marina 👋", cartão "Começar a lição" e a Aula 0 logo abaixo (qual primeiro?). A Aula 0 é
    didática e sem pressa. A lição do Álef abre com a letra enorme, "Ouvir a letra", a meta da aula e um "Erro comum" bem
    pensado. Barra inferior cheia mas legível. Marca d'água discreta. Sensação: produto sério que entrega o que a capa prometeu.

**Razões para hesitar:** não vejo em lugar nenhum da capa que posso desistir em 7 dias; o contato é um Gmail de outra marca;
um único depoimento, de alguém que parece ter sido aluna presencial, citando "imagens" que o curso não tem; o botão "Comece
do zero e leia…" me pede conta e cartão; /sobre diz duas coisas sobre quem definiu a ordem das letras; /biblia diz "lição
20 das 22"; nenhum link para conferir as credenciais.

**Razões para comprar com confiança:** testei o Álef de graça, sem cadastro, e ouvi a voz do professor; CNPJ, razão social e
endereço no rodapé; Termos, Privacidade e Reembolso publicados e legíveis; preço à vista, sem mensalidade, sem renovação
automática, 12 meses ditos em todo lugar; /biblia diz com clareza o que o curso NÃO faz; o checkout lista o que não vem
junto antes de pagar; crédito explícito ao autor do método; o e-mail de compra é um comprovante completo com o botão de
desistir na própria conta.

## 23. Auditoria de confiança (D, C)

Forte: identidade da empresa completa; preço sem truque; teste grátis real; foto real; honestidade sobre limites (/biblia,
"o que não vem junto", "certificado não oficial"); políticas claras. Fraco: Gmail de outra marca (CONV-003); depoimento
único e com detalhe falso (CONV-007); credencial "Letras" exagerada e nenhuma verificável (CONV-005/019); contradições
factuais em /sobre e /biblia (CONV-004/006); data de pré-lançamento sem trava (CONV-008); "responda este e-mail" sem caixa
comprovada (CONV-002); nome do vendedor na tela da Mercado Pago não conferido (CONV-018). Nota: 72.

---

## 24. Scorecard de prontidão (0-100; software e produto, não certificação jurídica)

| Categoria | Nota | O que impede subir |
|---|---|---|
| Segurança | 78 | Backup quebrado (SEC-A-001); Pages legado (SEC-A-004); freio do login por concorrência; nome em e-mail; monitor não comprovado. Controle de acesso: sem achado. |
| Pagamentos | 78 | Virada de 31/10 manual e sem lembrete; PIX perdido ao recarregar; tela de retorno errada; vencimento sem aviso; PIX direto sem `paid`. |
| Conformidade jurídica | 76 | Reply-To/caixa; juros do 12x; Termos × formas ativas; versão do contrato; promessas sem mecanismo (7 dias do depoimento, aviso de mudança, 31/10). |
| Conversão da landing | 76 | Desistência invisível; CTA que promete leitura e abre cadastro; prova social fraca; caixa de preço genérica; método em três versões. |
| Confiança | 72 | Gmail de outra marca; depoimento com detalhe falso; três erros factuais; credenciais não verificáveis; data sem trava. |
| Qualidade visual | 80 | Tema escuro; marca d'água na calha; emojis; cabeçalho a 360 px; vão em "Começar agora"; placeholders. |
| UX | 74 | Letra trancada pelo botão; concluída × dominada; aparelho derrubado sem explicação; sem curso/vencido na página de vendas; refresh perde a prática. |
| Experiência mobile | 74 | 150% quebra; cabeçalho 360; PIX some ao voltar do banco; lição 7 s e login vazio em 3G; áudio iPhone a confirmar. |
| Acessibilidade | 70 | Tema escuro 1,7:1; 150% no celular; "ligue os pares" cego; foco no body; Declaração promete demais. |
| Performance | 68 | Zero cache + tudo no Worker (cota); mp3 sem 206; cascata da lição; login vazio por 4 s; "funciona no ônibus" falso. |
| SEO | 78 | Sem JSON-LD; 307; h1 em /cursos; description longa; ícones. Portão contra buscador e sitemap: impecáveis. |
| Qualidade técnica | 82 | Raiz sem lockfile; código morto; Tailwind 4 em iOS antigo não medido. tsc estrito, 1.087 testes, 0 vulnerabilidades. |
| Confiabilidade funcional | 80 | Sem JS = esqueleto; refresh na lição; pedidos failed listados; 401 no console. 0 links/assets quebrados. |
| Conteúdo pedagógico | 80 | Duas respostas certas em pontos específicos; lições de som com itens de 50%; números de domínio ditos errado. |
| Exatidão do hebraico | 90 | Dt 6:9 a conferir; IPA cru. |
| Qualidade do português | 90 | `{{ }}` em dicas; duas grafias; frases com cara de IA. |
| Percepção premium | 75 | Gmail; emojis; marca d'água; tema escuro; contradições de texto. Checkout e lição: premium. |
| **Geral** | **77** | **7 P1, menos de dois dias de trabalho, antes de tráfego pago.** |

---

## 25. Respostas explícitas

**A. Os clientes conseguem comprar agora?** Sim, pelo que o código e os 63 testes de pagamento mostram: checkout em 2
passos, cartão (preferência MP) e PIX, liberação por verify/webhook/varredura, recibo por e-mail. A compra real ponta a
ponta (cartão parcelado + desistência) continua sem ter sido feita (ANTES-DE-VENDER item 6) e é o único teste que prova a
tela da MP, os juros no estorno e a entrega do e-mail. Sem credencial aqui, o que vimos foi o modo de falha, e ele é digno.

**B. Há jeito óbvio de acessar conteúdo pago sem pagar?** Não. 24 variações de caminho, IDOR, cookie adulterado, bundle
público varrido contra 963 strings pagas: zero. Única ressalva: o site antigo do GitHub Pages (19/09), se ainda estiver
publicado (SEC-A-004), e o roteiro "compra, baixa /api/content, desiste em 7 dias" (SEC-A-010), que é risco de negócio, não
falha de controle.

**C. Há problema sério de segurança?** Não de intrusão. Sim de continuidade: o backup falha desde 30/09 (SEC-A-001). Em
segunda ordem: freio do login burlável por rajada (SEC-A-002) e phishing pelo campo nome (SEC-A-003).

**D. Algo pode fazer clientes perderem dinheiro ou acesso?** Perder dinheiro: PIX regenerado ao voltar do banco (PAY-B-002,
detectado mas estorno manual); estorno do pagamento errado num pedido pago duas vezes (PAY-B-008). Perder acesso: perda do
banco sem backup (SEC-A-001); vencimento dos 12 meses sem aviso e sem caminho de renovação claro (PAY-B-004). Não receber:
PIX direto liberado à mão sem recibo e sem desistência pelo site (PAY-B-005); desistência por e-mail não lida (LEGAL-101).

**E. As páginas legais estão completas e coerentes com o produto?** Completas sim (Termos, Privacidade, Reembolso,
Acessibilidade, identificação, aceite, retenções implementadas). Coerentes na maior parte; as 11 contradições encontradas
estão em C-legal.md §2, e as que importam são: "responda este e-mail" sem caixa; "em até 12x" sem juros; PIX nos Termos
quando a build o desliga; versão do contrato que não prova o texto aceito; "retira em 7 dias" e "aviso de mudança" sem
mecanismo; menores; "conteúdo é nosso" × "base é o livro dele".

**F. O que precisa de revisão jurídica profissional?** Os 12 pontos de C-legal.md §4: desistência por e-mail e confirmação
imediata; juros no estorno e "de imediato" do art. 49; escopo da autorização do Dr. Damián e o art. 5; ECA Digital e LGPD art.
14; alto risco × dispensa de encarregado (ME); LIA para marca, aparelhos e estatísticas; instrumento de transferência
internacional; guarda da prova do aceite após exclusão; cláusula de suspensão e citação do CP; registro de acesso só nas
entradas; forma da autorização do depoimento; o que fazer em 01/11. Mais: NFS-e e prazo de guarda fiscal com o contador.

**G. A landing comunica o que estou vendendo?** Sim: curso de alfabetização em hebraico, 22 letras, nikud, cursiva, 12
meses, R$ 147, no navegador, com áudio do professor. O que falta dizer: que não ensina a falar (persona viagem), que dá para
desistir em 7 dias, e o que concretamente vem junto (Aula 0, exame, certificado, jogos).

**H. Parece premium o bastante?** O produto por dentro e o checkout, sim. A capa, quase: Gmail de outra marca, um depoimento,
emojis, tema escuro quebrado e três erros factuais são o que um comprador atento percebe.

**I. Cinco maiores problemas de conversão:** CONV-001 (desistência invisível), CONV-009 (CTA promete leitura e abre cadastro),
CONV-007 (prova social fraca com detalhe falso), caixa de preço genérica (D §2 item 4), CONV-010 (método em três versões).

**J. Cinco maiores problemas de confiança:** LEGAL-101/CONV-002 (responda este e-mail), CONV-003 (Gmail), CONV-004 (/sobre se
contradiz sobre a ordem das letras), CONV-008/PAY-B-001 (31/10 sem trava), CONV-005/019 (credencial exagerada e nenhuma
verificável).

**K. Cinco maiores problemas de UX:** UXQA-002 (letra trancada pelo botão), UXQA-005 (concluída × dominada), UXQA-006 (aparelho
derrubado sem explicação), UXQA-007/PAY-B-004 (sem curso e vencido na página de vendas), UXQA-003 (refresh perde a prática).

**L. Cinco maiores problemas de conteúdo:** CONT-002 (`{{ }}` em dicas), CONT-001 (duas cartas "/k/"), CONT-004 (Dt 6:9),
CONT-003 (IPA cru), CONT-005/006 (duas respostas certas no Teste e em "onde está a letra", inclusive no exame).

**M. Cinco maiores problemas técnicos:** PERF-001 (zero cache + cota), PERF-002 (Range/206), PERF-004 (cascata da lição),
PERF-003 (login exportado vazio), UXQA-001 (sem JS = esqueleto).

**N. Cinco maiores preocupações de segurança:** SEC-A-001 (backup), SEC-A-004 (Pages), SEC-A-002 (rajada no login), SEC-A-003
(phishing pelo nome), SEC-A-005 (monitor e cópia fora da Cloudflare).

**O. O que pode gerar reclamação ou reembolso?** Áudio mudo no iPhone (PERF-002); "paguei duas vezes" por PIX (PAY-B-002);
tela de retorno dizendo "nada foi cobrado" em estorno (PAY-B-003); "o curso sumiu" no 13º mês (PAY-B-004); "respondi o e-mail e
ninguém me atendeu" (LEGAL-101); "parcelei em 12x e não era sem juros" (LEGAL-102); "comprei para viajar e não ensina a
falar" (UXQA-010); "a primeira letra me mandou para uma porta fechada" (UXQA-002); "no modo escuro não vejo o botão" (VIS-001);
"ele diz 6 de 8 e eu fiz 7 de 10" (UXQA-005); "a FAQ diz que volta na questão e não volta" (UXQA-003); "não funciona no
ônibus" (PERF-005).

**P. O que pode criar problema jurídico?** Prazo de pré-lançamento vencido sem virada (CDC art. 37); desistência por e-mail
perdida (CDC art. 49; Decreto 7.962 art. 5º); "100% de volta" em compra parcelada sem prova (art. 49 parágrafo único); "em até
12x" sem juros (art. 52); versão do contrato não reproduzível (Decreto 7.962 art. 4º IV); depoimento cortado sem marca e
retirada sem mecanismo (CONAR/CDC 37; LGPD 8º §5º); "Formação Letras" (CDC 37/38); Declaração de Acessibilidade afirmando o que
não entrega (LBI 63); uso da obra de terceiro sem escopo verificável (Lei 9.610); nota fiscal não emitida (fiscal).

**Q. O que absolutamente corrigir antes de mandar tráfego pago?** Os 7 P1 (SEC-A-001, PAY-B-001, LEGAL-101, CONV-001,
VIS-001, PERF-001, PERF-002), a confirmação do Pages (SEC-A-004), e, dos P2, os que tocam dinheiro e primeira sessão: PAY-B-002,
PAY-B-003, UXQA-002, CONT-001, CONT-002, LEGAL-102, CONV-004/005/006. Mais o Workers Paid e uma compra real parcelada com
desistência.

---

## 26. Plano de correção

Dependências: (→) "depois de".

### FASE 0 · Emergência e bloqueadores (hoje; ~1,5 dia de código + ações do dono)
1. **Dono (5 min):** abrir `moshikgueta.github.io/hebraicofluente/licao/alef/` em janela anônima; se abrir, Unpublish (SEC-A-004).
2. **Dono (5 min):** `curl -sI -H 'Range: bytes=0-1' https://hebraicofluente.com.br/amostra-audio/shalom.mp3` e tocar 3 clipes num iPhone (PERF-002). Se 200: fix no Worker.
3. **Dono (5 min):** conferir no painel Cloudflare se `contato@hebraicofluente.com.br` tem Email Routing; responder um e-mail real de "esqueci a senha" (LEGAL-101).
4. Backup: `gravacoes` fora do dump; `ensaiar`; alerta de "sem cópia há 36 h" (SEC-A-001 → SEC-A-005).
5. `reply_to` em `sendMail` (LEGAL-101) → depois trocar `contato` em `empresa.json` para o domínio (CONV-003), só quando a caixa existir.
6. Trava e decisão do 31/10: check no build, alerta a 7 dias, regra de preço única (PAY-B-001). **Decisão do dono por escrito.**
7. Cache de `/_next/static` + `run_worker_first` em lista; rodar `portao.mjs`/`pacote.mjs` (PERF-001). **Dono:** Workers Paid.
8. Tema escuro: `--accent` claro (VIS-001) → depois VIS-006 (Declaração).
9. Desistência de 7 dias na capa, no curso e na barra (CONV-001).
10. Apagar `deploy-app.yml` (SEC-A-004).

### FASE 1 · Antes de tráfego pago significativo (~3 dias)
- Dinheiro: PAY-B-002 (retomar PIX), PAY-B-003 (tela de retorno), PAY-B-005 (`liberar` marca `paid`), PAY-B-010/UXQA-013 (failed fora de Compras), PAY-B-008.
- Juros e formas: LEGAL-102, LEGAL-103 (→ teste com `formas.pix=false`), LEGAL-109 (auto-resposta: dono).
- Primeira sessão: UXQA-002, UXQA-005/CONT-007 (→ decisão da régua 75% × 80% com o dono), VIS-004, CONT-001, CONT-002, CONT-005, CONT-006, CONT-003 (→ decisão do `somPt`).
- Confiança: CONV-004, CONV-005 (dono confirma), CONV-006, CONV-007/LEGAL-107 (dono fala com a Natália), UXQA-010.
- Segurança: SEC-A-002, SEC-A-003, SEC-A-007, SEC-A-009.
- Acesso: PAY-B-004/UXQA-004 (vencimento com e-mail), UXQA-006, UXQA-007.
- Mobile/a11y: VIS-002 (→ `a11y.mjs` contra o Worker), VIS-003, VIS-005, VIS-007.
- Performance: PERF-003, PERF-004, PERF-005 (texto; dono decide).
- Hebraico: CONT-004 (dono confere num Tanakh).
- Jurídico: LEGAL-104 (versão do contrato), LEGAL-105 (dono confirma vendas anteriores), LEGAL-106, LEGAL-111 (advogado), LEGAL-110 (compra real parcelada + desistência).

### FASE 2 · Conversão e UX (~2 dias)
CONV-009 (→ fim do A/B), caixa de preço com itens concretos, CONV-010, CONV-011, CONV-012, CONV-013, CONV-020 (dono), UXQA-001 (sem JS), UXQA-003 (retomar na etapa), UXQA-008, UXQA-009, UXQA-012, UXQA-016 (dono), VIS-009, VIS-016/UXQA-014/CONV-021, CONT-008, CONT-010, CONT-012, PAY-B-006, PAY-B-011, PAY-B-013.

### FASE 3 · Polimento premium (~1,5 dia)
VIS-008, VIS-010, VIS-012, VIS-013, VIS-014/CONV-015, VIS-015, VIS-017, VIS-018, VIS-011 (decisão do dono), CONV-014, CONV-016, CONV-017/SEO-003, SEO-001 (JSON-LD → gerado do catálogo e conferido pelo checa-seo), SEO-002, CONT-011, CONT-015, CONT-017, CONT-018, UXQA-011, UXQA-015, UXQA-017, UXQA-018/PERF-007, UXQA-019, PERF-006, TEC-001, TEC-002, LEGAL-118, LEGAL-119, LEGAL-121, LEGAL-123.

### FASE 4 · Longo prazo
Offline real com service worker (PERF-005), cache do conteúdo pago com marca (PERF-008/UXQA-020, decisão SEC), nivelamento para quem já lê (UXQA-022), lições de som com 4 alternativas (CONT-013), medição de ordem dos traços ou ajuste da promessa (CONT-014), "baixar meus dados" (LEGAL-122), cópia semanal fora da Cloudflare (SEC-A-005), CSP estrita (SEC-A-006), marca em campos de maior volume e trilha de /api/content (SEC-A-010), PAY-B-009, PAY-B-014, LEGAL-112/113/114/115/116/120/125 (advogado e contador), Tailwind em iOS antigo (TEC-003), fonte de testes de UI para as telas de pagamento.

---

## 27. Tabela condensada

| Prioridade | Issue | Impacto no cliente | Complexidade | Ação |
|---|---|---|---|---|
| P1 | SEC-A-001 backup falha desde 30/09 | Perde conta, compra e progresso num acidente | Pequena | `gravacoes` fora do dump; ensaiar; alerta |
| P1 | PAY-B-001 nada muda em 01/11 | Lê prazo vencido; âncora falsa | Pequena | Trava no build + regra de preço + decisão do dono |
| P1 | LEGAL-101 "responda este e-mail" sem Reply-To | Desistência perdida | Mínima | `reply_to`; dono confirma a caixa |
| P1 | CONV-001 desistência invisível na capa | Hesita e abandona no preço | Pequena | Linha na caixa de preço e FAQ |
| P1 | VIS-001 tema escuro 1,7:1 | Não vê "Ouvir a letra" à noite | Pequena | `--accent` claro no escuro |
| P1 | PERF-001 zero cache + tudo no Worker | Volta lenta; site fora em campanha | Pequena | `immutable` + `run_worker_first` em lista; Paid |
| P1 | PERF-002 mp3 sem 206 | iPhone sem som (a confirmar) | Pequena | Verificar prod; fatiar Range |
| P2 | PAY-B-002 PIX some ao recarregar | Paga duas vezes | Pequena | Retomar pedido pendente |
| P2 | PAY-B-003 tela de retorno errada | "Nada foi cobrado" em estorno; 3 min de spinner | Pequena | Textos por estado |
| P2 | PAY-B-004 vencimento sem aviso | "Minha conta sumiu" | Média | `expiredAt`, e-mails, texto de renovar |
| P2 | UXQA-002 botão leva a letra trancada | Trava na 1ª letra | Pequena | "Refazer a fixação" |
| P2 | UXQA-005 concluída × dominada | Não sabe o que falta | Pequena | Um vocabulário, números das constantes |
| P2 | CONT-001 duas cartas "/k/" | Acerto conta como erro | Mínima | Dedup por som |
| P2 | CONT-002 `{{ }}` em dicas | Parece código quebrado | Mínima | `<Prose>` |
| P2 | LEGAL-102 "12x" sem juros | Surpresa na MP | Pequena | "com juros da Mercado Pago" |
| P2 | CONV-003 Gmail de outra marca | "É empresa mesmo?" | Mínima | E-mail do domínio |
| P2 | CONV-004/005/006 erros factuais | Lê a contradição | Mínima | Corrigir os três textos |
| P2 | VIS-002 + VIS-006 150% quebra e Declaração promete | Baixa visão cortada | Média | Zoom só no conteúdo; Declaração honesta |
| P2 | UXQA-001 sem JS = esqueleto | Página vazia | Pequena | `loading.tsx` só nas rotas pagas |
| P2 | SEC-A-004 Pages legado | Curso grátis se no ar | Mínima | Dono confere; apagar workflow |
| P2 | SEC-A-002/003 login em rajada; nome em e-mail | Conta tomada; phishing | Mínima | Freio atômico; filtrar nome |
| P2 | LEGAL-104 versão do contrato | Não prova o que aceitou | Média | Hash do texto; versões imutáveis |
| P2 | LEGAL-110 100% em parcelado | Promessa não provada | Pequena | Compra real + decisão |
| P2 | PERF-003/004 login vazio; lição 7 s em 3G | Parece quebrado | Pequena | Fallback; paralelizar; sem prefetch |
| P3 | 79 itens (seção 7) | Polimento | Mínima a Média | Fases 2 a 4 |

---

## 28. Checklist final de lançamento

### Segurança
- [ ] Backup diário voltando a passar com `gravacoes` fora do dump, ensaio de restauração verde (SEC-A-001)
- [ ] Alerta de "sem cópia nova há 36 h" e de 5xx no e-mail diário; monitor externo registrado em INCIDENTES.md (SEC-A-005)
- [ ] GitHub Pages confirmado fora do ar; `deploy-app.yml` apagado (SEC-A-004)
- [ ] Freio de erro do login atômico (SEC-A-002); nome filtrado nos e-mails (SEC-A-003)
- [ ] `/api/health` público só com `{ok, monitor}` (SEC-A-007)
- [ ] Lockfile na raiz; actions por SHA (SEC-A-009)
- [ ] Dono: 2FA no Gmail e no GitHub; branch `main` protegida; Workers Paid; PBKDF2 600k depois do Paid
- [ ] Depois: CSP estrita (SEC-A-006); cópia semanal fora da Cloudflare

### Pagamentos
- [ ] Decisão escrita do 01/11 e trava no build + regra de preço única + alerta a 7 dias (PAY-B-001)
- [ ] Retomada do PIX pendente no checkout e no perfil (PAY-B-002)
- [ ] Tela de retorno com texto certo por estado, sem "boleto" (PAY-B-003)
- [ ] Vencimento: `expiredAt`, e-mails aos 30/7 dias e no dia, texto de renovar (PAY-B-004)
- [ ] `liberar` marca o pedido como pago e manda recibo (PAY-B-005)
- [ ] Pedidos `failed` sem `provider_ref` fora de Compras e da varredura (PAY-B-010)
- [ ] E-mail ao aluno quando o estorno conclui (PAY-B-006)
- [ ] Compra real: cartão parcelado + desistência + PIX, conferindo tela da MP, juros devolvidos, nome do vendedor, recibo (LEGAL-110, CONV-018)

### Legal
- [ ] `reply_to` em todos os e-mails; caixa de `contato@` confirmada ou texto "escreva para" (LEGAL-101)
- [ ] "Em até 12x com juros da Mercado Pago" no checkout, capa e rodapé (LEGAL-102)
- [ ] Termos, FAQ e CTAs condicionados a `temPix()`/`confirmaSozinho()` com teste (LEGAL-103)
- [ ] Versão do contrato por hash do texto; versões imutáveis em `/termos/v/`; versão gravada no pedido (LEGAL-104)
- [ ] Dono confirma se houve vendas antes de 29/09; rotina de aviso de mudança (LEGAL-105)
- [ ] E-mail ao dono quando depoimento aprovado é retirado (LEGAL-106)
- [ ] Depoimento da Natália: autorização escrita guardada, "[...]" no corte, "imagens" conferido (LEGAL-107)
- [ ] Auto-resposta de recebimento no canal de e-mail; textos de confirmação unificados (LEGAL-109)
- [ ] Advogado: os 12 pontos de C-legal.md §4 (autorização do Damián, menores/ECA Digital, alto risco, LIA, transferência internacional, prova do aceite, suspensão, Marco Civil, depoimento, 01/11)
- [ ] Contador: NFS-e por venda e prazo de guarda; purga correspondente (PAY-B-012, LEGAL-116)
- [ ] Declaração de Acessibilidade honesta (VIS-006)

### Conteúdo
- [ ] `<Prose>` em dicas e explicações (CONT-002)
- [ ] Dedup por som no "ligue letra e som" com teste de várias sementes (CONT-001)
- [ ] Teste da Academia e "onde está a letra" sem duas respostas certas (CONT-005, CONT-006)
- [ ] Dt 6:9 conferido num Tanakh e corrigido se preciso (CONT-004)
- [ ] `somPt` legível no lugar do IPA cru (CONT-003)
- [ ] "8 de 10" e um vocabulário de concluída/dominada (CONT-007/UXQA-005)
- [ ] Página do módulo com contagem real de lições (CONT-008)
- [ ] Mini-textos re-aprovados pelo dono e TEXTOS-PARA-REVISAR.md atualizado (CONT-009)
- [ ] Grafias unificadas: nikud, daguesh, shalom (CONT-011)

### Landing page
- [ ] Desistência de 7 dias na caixa de preço da capa, do curso e na barra; "E se eu não gostar?" na FAQ (CONV-001)
- [ ] E-mail do domínio no rodapé e no suporte (CONV-003)
- [ ] /sobre sem a frase sobre a ordem das letras; "Letras em andamento"; "/biblia: letra 20, lição 14 das 27" (CONV-004/005/006)
- [ ] "Este curso ensina a ler e escrever; conversação começa no A1" na página do curso e na FAQ (UXQA-010)
- [ ] Caixa de preço com Aula 0, 27 lições, exame, certificado, jogos, áudio do professor
- [ ] Rótulo do CTA principal dizendo o que vem; fim do A/B decidido por clareza (CONV-009)
- [ ] Método em uma lista só (CONV-010); rodapé sem "à conversa" (CONV-011); "cardápio" resolvido (CONV-012)

### Mobile
- [ ] Cabeçalho a 360/320 px sem sobreposição (VIS-003)
- [ ] 130/150% sem rolagem lateral; `a11y.mjs` contra o Worker com cookie e conteúdo real (VIS-002)
- [ ] Botão flutuante e toast fora do checkout, da folha de retorno e do teclado da tela (VIS-016/UXQA-014)
- [ ] Prática retomada após recarregar/aba descartada (UXQA-003)
- [ ] 3 clipes tocando num iPhone real; Safari: gravação, fala, teclado virtual (PERF-002, manual)
- [ ] Capa, checkout e lição num iOS 15.x/16.0-16.3 (TEC-003)

### Acessibilidade
- [ ] Tema escuro com todo texto ≥ 4,5:1 e varredura automática (VIS-001)
- [ ] "Ligue os pares" com `aria-pressed`, foco mantido, acerto/erro anunciados (VIS-005)
- [ ] Foco não cai no body em perguntas rápidas, jogos e dica (VIS-008)
- [ ] Gold de fundo com contraste ≥ 4,5:1 (VIS-007); opacidade fora do texto em /mapa e /conquistas (VIS-010)
- [ ] h1 no checkout (VIS-012); placeholders claramente placeholders (VIS-017)
- [ ] Teste manual com VoiceOver/TalkBack e NVDA numa lição inteira

### SEO
- [ ] h1 em /cursos; title do 404; description da capa ≤ 155; `X-Robots-Tag` nos `.txt`; `apple-icon.png`; 308 (SEO-002/003)
- [ ] JSON-LD Organization (CNPJ), Course, FAQPage, Person gerados do catálogo e conferidos pelo `checa-seo` (SEO-001)

### Analytics
- [ ] Estatísticas só com `hasEntitlement`; A/B com teto diário e "compra" contada do pedido pago (SEC-A-008)
- [ ] Beacon do Cloudflare Web Analytics na zona confirmado desligado ou declarado na Política (LEGAL-001 de 28/09)
- [ ] `/api/me` 200 `{signedIn:false}`; sem `/api/progress` para visitante (PERF-007)

### Atendimento
- [ ] Um prazo de resposta em todo lugar (FAQ, suporte, rodapé, e-mails) (CONV-013, UXQA-016, PAY-B-011)
- [ ] Decidir se dúvida de conteúdo é atendida e dizer onde (UXQA-016)
- [ ] Runbook: "comprou com outro e-mail", "pagou duas vezes", "estorno parcial", "01/11" (PAY-B-013, PAY-011)
- [ ] Login explica aparelho derrubado e "Sair" avisa que desconecta todos (UXQA-006)

### Curso
- [ ] "Refazer a fixação" quando abaixo de 80%; painel aponta a letra certa (UXQA-002)
- [ ] Painel e Revisão com a mesma contagem; "itens" em vez de "letras" (VIS-004)
- [ ] Academia marca jogos sem material com "abre com N letras" (VIS-009)
- [ ] Teclado da tela como opção principal em "Digitar em hebraico" (UXQA-012)
- [ ] Exame exige módulos 6 e 7 ou não cobra os itens deles; faixa máxima honesta (CONT-010)
- [ ] Nome reaproveitado no onboarding, certificado e "Meu nome"; "fica na sua conta" (UXQA-008)
- [ ] /concluido sem afirmações antes das 22 letras (UXQA-015)

### Pós-compra
- [ ] Recibo com Reply-To e sem "responda" se a caixa não existir (LEGAL-101)
- [ ] Conta sem curso: aviso acima do preço; navegação de aluno só com direito (UXQA-007)
- [ ] Aula 0 oferecida antes da lição 1 no primeiro acesso (CONV-020, dono decide)
- [ ] Lição em paralelo (`/api/content` na montagem) e sem prefetch de rodapé (PERF-004)
- [ ] Texto do "funciona no ônibus" ajustado ou service worker (PERF-005)
- [ ] Teste de UI dos estados de checkout/obrigado/perfil (PAY-B-014)
