# B · PAGAMENTOS E FLUXO COMERCIAL · Hebraico Fluente · 01/10/2026 · main 6d6302d

Método: leitura completa de worker/src/api/pay.js, lib/{mercadopago,pix,catalog,db (pagamento, direitos, estornos),mail}.js,
reconcile.js, alertas.js, api/estornos-admin.js, gate.js (lista GATED), data/{courses,empresa}.json, app/src/lib/{catalog,cta}.ts,
checkout/[slug]/{CheckoutClient,obrigado/ObrigadoClient}.tsx, perfil/PerfilClient.tsx, platform/AccessNotice.tsx,
scripts/pagamento-ativo.mjs, .github/workflows/{acesso,deploy-worker}.yml, audit/2026-09-28/C-pay.md.

Provas executadas (tudo local, nenhuma cobrança real; scripts em `scratchpad/audit2/b/`):
- `npx vitest run tests/pagamento.test.ts tests/estorno.test.ts tests/estornos-admin.test.ts tests/pix.test.ts`: 63/63 verdes.
- Playwright logado em so-termos-390-...@example.invalid, 390 px e 1280 px (`b/checkout.mjs`, capturas `b/checkout-*.png`).
- Webhook forjado e replay com HMAC calculado a partir do segredo local, sem imprimi-lo (`b/webhook.mjs`).
- Conta nova `b-vencido-1790814792@example.invalid` (id 29) com direito vencido ontem e pedidos sintéticos
  `HFBVENCIDO1` (paid 2025), `HFBPEND1` (pending), `HFBFAIL1` (failed), `HFBREF1` (refunded) para ver /meu-hebraico,
  /perfil e /checkout/.../obrigado (`b/vencido.mjs`).
- curl em /api/pay/create com corpo manipulado, /api/pay/verify de pedido alheio, /api/pay/desistir fora do prazo e não pago.

## Como o checkout se comporta hoje (local, sem credencial válida da Mercado Pago)

- 390 px e 1280 px: sem rolagem horizontal (scrollWidth 390/1280). No celular o resumo "Seu pedido" vem em cima:
  "PRÉ-LANÇAMENTO ATÉ 31/10/2026 · DEPOIS, R$ 297 | R$ 147 | ou em até 12x no cartão | R$ 132,30 no PIX". Abaixo:
  "Passo 2 de 2", PIX R$ 132,30 (10%) e Cartão R$ 147 em até 12x, quadro "Condições desta compra" (o que leva, 12 meses,
  pagamento único sem renovação automática, o que não vem junto, quando abre, 7 dias de desistência), botão "Pagar R$ 132,30"
  (com cartão: "Pagar R$ 147") e o aceite dos Termos.
- Clique em Pagar: `POST /api/pay/create -> 502 {"error":"payment-failed"}` (a MP local responde 403 ao token falso).
  A tela mostra, em caixa âmbar acima das condições: "Não conseguimos gerar o pagamento agora, e o problema é nosso, não seu.
  Escreva para languageswithmoshik@gmail.com que a gente resolve na hora - e nada foi cobrado." O botão continua ativo.
  No banco: pedido nasce `failed` com valor do catálogo (13230 PIX, 14700 cartão x12) e a trilha
  `pay-create-failed "<pedido> pix mercadopago 403"`. Com 3 dessas por hora o dono recebe alerta (alertas.js).
- /api/health local: `payments:true, webhook:true, modo:"teste", vendedor:"recusado"`.

## Achados

ID: PAY-B-001 | Prioridade: P1 | Confiança: CONFIRMADO
Local: data/courses.json:399 (`preLancamentoAte: "2026-10-31"`), app/src/lib/catalog.ts:174-179 (`fimDoPreLancamento`),
worker/src/lib/catalog.js:28-34 (`priceCents`), Fecho.tsx:439, CheckoutClient.tsx:624, CourseClient.tsx:308, faq/page.tsx:85, CourseCard.tsx:118
Problema: nada muda sozinho em 01/11/2026. `fimDoPreLancamento` só formata a data, sem comparar com hoje; o servidor cobra
`price.brl` (147) sem olhar data nenhuma; o site é export estático. No dia 01/11 o site inteiro continua dizendo "Preço de
pré-lançamento até 31/10/2026. Depois, o curso passa a custar R$ 297" (capa, página do curso, checkout, FAQ, card) e cobra
R$ 147 / R$ 132,30. A virada depende de alguém editar `brl: 297, listBrl: null` e publicar; não há lembrete, alerta, teste nem
runbook (grep "pré-lançamento|31/10" em ANTES-DE-VENDER.md, INCIDENTES.md, DEPLOY.md: nada; nenhum check em app/*.mjs).
Evidência: checkout local hoje "PRÉ-LANÇAMENTO ATÉ 31/10/2026 · DEPOIS, R$ 297 | R$ 147"; código acima sem `Date`.
JSON-LD: o site não publica nenhum (`grep ld+json` em app/src e app/out: vazio), então não há Offer para divergir.
og.jpg: não tem preço ("27 lições · 22 letras · feito para brasileiros"), então também não diverge.
Por que importa: um prazo vencido anunciado com um "depois R$ 297" que nunca chega é exatamente o preço de referência não
praticado que a auditoria de 28/09 (LEGAL-014) quis evitar; e se o dono esquecer, a promessa "depois R$ 297" vira falsa
urgência. Se ele lembrar, precisa lembrar das DUAS coisas (JSON e publicar).
Impacto no cliente: lê uma oferta com data passada; quem comprou em outubro achando que o preço subiria vê o mesmo preço depois.
Correção sugerida: (a) build falha (ou check em `app/promessas.mjs`) quando `preLancamentoAte < hoje` e `listBrl` não é null;
(b) `fimDoPreLancamento`/`ancora` devolvem null depois da data e o servidor passa a cobrar `listBrl` a partir de 01/11 00:00
BRT (uma regra só em catalog.js e catalog.ts), ou um cron/Action agendado que abre o PR da virada; (c) alerta ao dono 7 dias antes.
Pedidos já criados a 147 continuam válidos (valor gravado no pedido; PIX 30 min, preferência 23 h), o que é coerente.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (decisão de preço do dono)

ID: PAY-B-002 | Prioridade: P2 | Confiança: ALTA CONFIANÇA
Local: app/src/app/checkout/[slug]/CheckoutClient.tsx:80 (`order` só em estado React), :359 (`Gerar outro código`)
Problema: o PIX gerado vive só na memória da aba. Recarregar, voltar do app do banco com a aba descartada pelo sistema (comum
no celular), ou abrir o checkout de novo, mostra outra vez o botão "Pagar R$ 132,30" sem o código anterior. Nenhuma tela
recupera o PIX pendente: o checkout não consulta `/api/orders` no início, e /perfil lista o pedido como "Aguardando" sem o
copia-e-cola (embora `toOrder` já devolva `pix.code` e `expiresAt`). Quem clica de novo gera um segundo PIX; o primeiro continua
pagável por 30 min.
Evidência: código (estado `order` inicial `null`, sem efeito de retomada); /perfil da conta 29 mostra "Cartão · R$ 147 · AGUARDANDO"
sem ação nenhuma.
Por que importa: é o caminho mais provável para "paguei duas vezes" (PIX pago no banco + novo PIX gerado ao voltar). O sistema
detecta (`pedido-duplicado` vira alerta), mas o estorno é manual e o aluno fica com 24 meses e uma cobrança que não queria.
Impacto no cliente: ao voltar do banco vê a tela inicial de pagamento e conclui que não deu certo.
Correção sugerida: no mount do checkout, buscar o pedido `pending` mais recente do curso com `pix.expiresAt` no futuro e
reabrir o PixPanel com polling; em /perfil, botão "Ver código PIX" para pedido pendente não expirado. Opcional: ao "Gerar outro
código", cancelar o PIX anterior na MP (`PUT /v1/payments/{id}` status cancelled).
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/checkout/[slug]/obrigado/ObrigadoClient.tsx:65-75, 124-171
Problema: a tela de retorno da Mercado Pago (as três back_urls apontam para ela) dá mensagens erradas em três estados:
1. Pedido `refunded` ou `expired` cai em `failed` e diz "Nada foi cobrado. Pode ter sido o limite, um dado digitado errado
   ou uma recusa do banco". Em `refunded` houve cobrança (e estorno).
2. Quem desistiu na tela da MP e voltou (pedido `pending`, nenhum pagamento) vê, após 3 min, "O pagamento ainda está em
   análise. Acontece com alguns cartões e com boleto ... Você não precisa fazer nada". Boleto está excluído da preferência
   (mercadopago.js:292), e não há pagamento nenhum em análise.
3. Cartão recusado (`failed`): a tela segura "Confirmando seu pagamento… Não feche esta página" por 3 minutos inteiros
   antes de dizer que não foi concluído, porque `setPhase` só usa o mapa depois de `GIVE_UP_MS`.
Evidência (b/vencido.mjs, conta 29): `HFBFAIL1`, `HFBREF1`, `HFBPEND1` aos 10 s: "Confirmando seu pagamento… Não feche esta
página."; `HFBREF1` aos 190 s: "O pagamento não foi concluído. | Nada foi cobrado. Pode ter sido o limite..."; `HFBPEND1`
aos 190 s: "O pagamento ainda está em análise. | Acontece com alguns cartões e com boleto... Você não precisa fazer nada".
Por que importa: é a tela que o comprador vê no momento de maior dúvida; texto errado vira chamado ou chargeback.
Impacto no cliente: espera 3 min olhando um spinner com cartão recusado; lê que nada foi cobrado quando foi; acha que um
pagamento inexistente está em análise.
Correção sugerida: `failed` mostra o resultado na hora (o servidor já reconsultou a MP); `refunded` com texto próprio
("pagamento estornado, o acesso foi encerrado"); `pending` sem pagamento: usar o parâmetro `collection_status`/`status=null`
da query só para o TEXTO (nunca para acesso) e dizer "não encontramos pagamento; se você não concluiu, tente de novo";
tirar "boleto".
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-004 | Prioridade: P2 | Confiança: CONFIRMADO
Local: worker/src/lib/db.js:460-475 (`activeEntitlements` omite vencidos), app/src/app/perfil/PerfilClient.tsx:102-117,
worker/src/gate.js:125, app/src/components/platform/AccessNotice.tsx:40-41, worker/src/lib/mail.js (nenhuma mensagem de vencimento)
Problema: o dia seguinte ao fim dos 12 meses. (a) /meu-hebraico (o link do e-mail de compra e do botão "Continuar") dá 302
para /cursos/alfabetizacao/, a página de vendas, sem nenhuma frase dizendo que o acesso venceu. (b) /perfil mostra
"Alfabetização em Hebraico | Não está na sua conta | Ver o curso": o ramo "Acesso encerrado" é código morto, porque a sessão
só carrega direitos ATIVOS. A compra antiga continua listada como "PAGO" sem data de fim. (c) Nenhum e-mail avisa antes
(30/7 dias) nem no dia: o aviso existe só como faixa dentro da plataforma, para quem entra. (d) A faixa diz "Seu progresso
continua guardado neste aparelho", contradizendo /perfil ("Seu progresso fica na sua conta e é sincronizado").
Evidência: conta 29 (direito vencido ontem): `/meu-hebraico/` terminou em `http://127.0.0.1:8787/cursos/alfabetizacao/`
com "PREÇO DE PRÉ-LANÇAMENTO | Até 31/10/2026. Depois, R$ 297. | R$ 147"; /perfil "Não está na sua conta" e "Você está logado,
mas ainda não tem nenhum curso ativo". A auditoria de 28/09 marcou como PASS "/perfil 'Acesso encerrado'": não acontece.
Por que importa: um aluno que pagou recebe um tratamento de visitante, sem explicação, e o caminho de renovação parece compra nova.
Impacto no cliente: "minha conta sumiu?"; chamado de suporte ou pedido de reembolso indevido.
Correção sugerida: `/api/me` devolver também o último vencimento (`expiredAt`) por curso; /perfil e a página do curso mostrarem
"Seu acesso terminou em dd/mm/aaaa. Renovar"; gate redirecionar com `?vencido=1`; e-mail aos 30 e 7 dias e no dia (cron diário
já existe); corrigir o texto da faixa.
Complexidade: Média | Claude corrige sozinho?: Sim

ID: PAY-B-005 | Prioridade: P2 | Confiança: CONFIRMADO
Local: .github/workflows/acesso.yml:365-394 (`liberar`), worker/src/api/pay.js:370 (`nao-pago`), api/estornos-admin.js:50,
worker/src/alertas.js:167
Problema: no modo PIX direto (o trilho de reserva para quando o token da MP falha na publicação, scripts/pagamento-ativo.mjs)
a liberação manual nunca marca o pedido como pago: `liberar` grava o direito com `order_id = 'MANUAL-ACTIONS'` e não toca em
`orders`. Consequências: (1) o pedido fica "Aguardando" para sempre em /perfil (o cron não expira mais pedidos PIX direto);
(2) a desistência pelo site é impossível: o botão só aparece para `paid`, e a API responde `nao-pago` (provado:
`POST /api/pay/desistir {"order":"HFBPEND1"} -> 409 {"error":"nao-pago"}`), o que contraria o art. 5º do Decreto 7.962 que o
próprio código cita; (3) o fluxo "PIX direto: abra /admin/estornos e toque em Já devolvi" do lembrete diário nunca é
alcançável, porque nenhuma desistência PIX direto chega a existir; (4) o aluno não recebe e-mail de liberação nem recibo
(`confirmarPorEmail` só roda em `applyPayment`).
Por que importa: é o modo em que a loja cai sozinha quando a credencial quebra; nele o cliente pagante fica sem recibo, sem
desistência pelo site e vendo "Aguardando".
Impacto no cliente: pagou, foi liberado à mão, mas a conta diz que a compra está aguardando e não oferece desistir.
Correção sugerida: ação `liberar` com campo `pedido` opcional que faz `UPDATE orders SET status='paid', paid_at=..., provider='manual'`
e grava o direito com aquele `order_id`; ou endpoint admin "confirmar PIX recebido" que chama `grantAccess` + `markPaid` +
`confirmarPorEmail`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-006 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/api/pay.js:784-797 (estorno), worker/src/lib/mail.js (exports)
Problema: nenhum e-mail ao aluno quando o estorno é concluído (desistência, estorno pelo painel, chargeback) e o acesso fecha.
O e-mail da desistência promete "O acesso ao curso é encerrado quando o reembolso for processado", mas ninguém avisa quando foi.
Correção sugerida: `mensagemDeEstorno` disparada uma vez quando `refundOrder` devolve `refunded: true` (mesmo padrão do recibo).
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-007 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/api/pay.js:586-588 (trilha 1 por IP por hora), worker/src/alertas.js:46 (`'webhook-bad-signature': 20`)
Problema: o alerta "o segredo do webhook mudou?" exige 20 linhas na última hora, mas cada IP só grava 1 linha por hora. A MP
entrega de poucos IPs, então um MP_WEBHOOK_SECRET errado praticamente nunca dispara o alerta. Verify e varredura cobrem a
liberação (atraso de até 5 min), mas estorno e chargeback passam a depender da varredura diária dos pagos (até 24 h).
Evidência: probe local `assinatura com segredo errado -> 401`; trilha mostra uma só linha `webhook-bad-signature` por IP.
Correção sugerida: limite 1 (ou contar o freio `whk-h:*` em vez da trilha), ou expor em /api/health "último webhook válido há X h".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: PAY-B-008 | Prioridade: P3 | Confiança: ALTA CONFIANÇA
Local: worker/src/api/pay.js:777-797
Problema: pedido pago duas vezes (pagamentos A e B). Se o dono estornar o PRIMEIRO (A, o gravado em `provider_ref`) em vez do
segundo, `refundOrder` fecha o acesso, embora B continue pago. Só o caso inverso (estornar B) está tratado (teste 2b).
Mitigação existente: o alerta diz "estornar o segundo".
Correção sugerida: no estorno do `provider_ref`, consultar `paymentsFor(order)`; se houver outro `approved` sem estorno,
trocar `provider_ref` para ele e não revogar.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-009 | Prioridade: P3 | Confiança: ALTA CONFIANÇA
Local: worker/src/reconcile.js:116-119, worker/src/api/pay.js:296
Problema (resíduo de PAY-005): a preferência de cartão agora expira em 23 h (corrigido), mas um cartão em `in_process`
(análise antifraude) por mais de 24 h vira pedido `expired`, sai da varredura e do verify; se aprovado depois, só o webhook
libera. `paidOrdersToRecheck` só olha `paid`.
Correção sugerida: incluir `expired` com `provider_ref` numérico (ou com eventos `pending` gravados) numa consulta diária por 7 dias.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: PAY-B-010 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/perfil/PerfilClient.tsx:186-212, worker/src/api/pay.js:239-242, worker/src/lib/db.js:752-760
Problema: "Compras" lista toda tentativa como compra: cada clique em Pagar que falhou vira "NÃO CONCLUÍDO" (vermelho),
cada ida abandonada ao Checkout Pro vira "AGUARDANDO" e depois "EXPIRADO" (vermelho). Além disso, pedidos que falharam já na
criação (sem `provider_ref`, nunca existiram na MP) entram na varredura de 5 em 5 min por 24 h; com credencial ruim cada um
gera `settle-error` (vi várias linhas locais) e alerta "liberações de acesso que falharam", que é falso.
Evidência: /perfil conta 29: "Cartão · R$ 147 | NÃO CONCLUÍDO | ... PIX · R$ 132,30 | ESTORNADO | ... Cartão · R$ 147 | AGUARDANDO".
Correção sugerida: esconder `failed`/`expired` sem pagamento da lista (ou agrupar em "tentativas"); excluir da varredura
pedidos `failed` sem `provider_ref`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: PAY-B-011 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/lib/account/types.ts:119, CheckoutClient.tsx:403
Problema: textos que prometem além do real. (a) Erro `payment-failed`: "Escreva para ... que a gente resolve na hora", com
atendimento declarado "segunda a sexta, 9h às 18h" e resposta "em até 2 dias úteis" (empresa.json). (b) Na RENOVAÇÃO o
quadro diz "12 meses, contados da confirmação do pagamento", mas `grantAccess` soma a partir do vencimento (melhor para o aluno,
mas diferente do que está escrito).
Correção sugerida: "respondemos em até 2 dias úteis (WhatsApp ...)"; quando `restam <= 45`, "mais 12 meses, somados ao prazo atual".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: PAY-B-012 | Prioridade: P3 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: worker/src/lib/mail.js:340-345 ("Este e-mail é o comprovante da sua compra"), fluxo inteiro
Problema: a venda é feita por CNPJ (Mhg Treinamentos e Idiomas, 51.041.290/0001-52) e nenhum ponto do fluxo fala de nota
fiscal (NFS-e): nem emissão, nem como pedir, nem prazo. O "comprovante" é o e-mail. Depende do regime tributário do dono.
Correção sugerida: HANDOFF → [LEGAL/fiscal]: definir emissão (automática pelo emissor municipal de Curitiba ou manual) e dizer
no e-mail de compra e no FAQ como a nota chega.
Complexidade: Média | Claude corrige sozinho?: Não

ID: PAY-B-013 | Prioridade: P3 | Confiança: ALTA CONFIANÇA
Local: worker/src/api/auth.js:176-223, .github/workflows/acesso.yml:365-394, app/src/lib/cta.ts:70-76
Problema: convite + compra. Quem foi presenteado e cria a conta não vê nada sobre o presente (só o dono recebe e-mail); o CTA
logo depois é "Liberar meu acesso", e a pessoa pode pagar pelo que ganhou. Se pagar e o dono depois rodar `liberar`, os meses
somam (24). Conta comprada com outro e-mail: não existe ferramenta para mover direito ou compra entre contas (`trocar-email`
só renomeia); o caminho é estornar e liberar à mão.
Correção sugerida: na sessão, sinal "presente aguardando confirmação" que troca o CTA por "Seu acesso de presente está sendo
liberado"; documentar no runbook o caso "comprou com outro e-mail".
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes

ID: PAY-B-014 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/tests/{pagamento,estorno}.test.ts
Problema: os 63 testes cobrem bem liberação, idempotência, estorno, chargeback, desistência automática e alertas. NÃO cobrem:
corpo manipulado em `create` (provado aqui à mão: `amount:1, pixDiscountPct:100, price` ignorados, PIX gravado 13230, cartão
14700 x12, `installments:99` vira 12, curso `soon` 404); o corpo da preferência (`installments`, `expires`, `back_urls`);
o modo PIX direto ponta a ponta; pedido `expired` pago depois; as telas obrigado/checkout/perfil (nenhum teste de UI dos
estados); a virada do pré-lançamento.
Correção sugerida: acrescentar esses casos ao pagamento.test.ts e um teste de componente para ObrigadoClient.
Complexidade: Pequena | Claude corrige sozinho?: Sim

## O que passou (com evidência)
- Preço só do catálogo: provado com curl (acima). Desconto PIX igual na tela (R$ 132,30) e no pedido (13230).
- Webhook: sem assinatura 401, segredo errado 401, ts de 10 min 401, ts em ms aceito, GET sem assinatura 401, `data.id` não
  numérico 200 ignorado, tópico desconhecido 200 ignorado, `chargebacks` assinado consultado. Replay idêntico dentro dos 5 min
  é aceito (200), mas inofensivo: o aviso só dispara uma reconsulta e `payment_events` UNIQUE `id:status` + `markPaid`
  condicional seguram duplicidade.
- Verify de pedido alheio: 404. Desistência fora do prazo: 409 `fora-do-prazo`; de pedido não pago: 409 `nao-pago`.
- Já dono fora da janela de 45 dias: tela "Já é seu" e 409 `already-owned`; dentro da janela e vencido: checkout aberto (conta 29).
- Estorno automático da desistência, contestação por `chargebacks`/`merchant_order`, varredura diária dos pagos, alertas ao
  dono, trava da varredura: código e testes verdes.
- Token `TEST-` para a publicação; usuário de teste `APP_USR-` barrado no e2e (`vendedor=usuario-de-teste`).
- Juros do parcelamento: FAQ e Termos dizem "cobrados pela Mercado Pago".

## NOT TESTED
Cobrança, webhook e estorno reais (MP inalcançável); entrega real de e-mail (Resend falso); reviewers do environment
`producao` no GitHub.

## (1) Auditoria de 28/09 (C-pay.md): estado de cada item
| Item | Estado hoje |
|---|---|
| PAY-001 token de teste em produção | RESOLVIDO: pagamento-ativo.mjs para a publicação com `TEST-`; e2e barra `usuario-de-teste`. |
| PAY-002 chargeback fora do tópico payment | RESOLVIDO: webhook trata `chargebacks` e `merchant_order` (pay.js:563-623); varredura diária dos pagos (reconcile.js:161-168); testes verdes. Resíduo: alerta de segredo errado praticamente mudo (PAY-B-007). |
| PAY-003 desistência não estorna | RESOLVIDO no modo Mercado Pago (estorno automático, 8 tentativas, alerta, lembrete diário, /admin/estornos). CONTINUA no modo PIX direto (PAY-B-005). |
| PAY-004 dois pedidos pagos sem trilha | RESOLVIDO em parte: trilha `pedido-duplicado` + alerta. A causa principal (PIX perdido ao recarregar) continua (PAY-B-002). |
| PAY-005 pedido expirado pago depois | RESOLVIDO em parte: preferência expira em 23 h. Resíduo `in_process` > 24 h (PAY-B-009). |
| PAY-006 400/403 de outro vendedor | RESOLVIDO (pay.js:611-614, 683-686; teste 1c). |
| PAY-007 `liberar` substituía o prazo | RESOLVIDO: soma a partir do vencimento (meses de 30,44 dias, diferente do `+12 months` do grantAccess; irrelevante). |
| PAY-008 quem pode liberar | CONTINUA NOT TESTED (settings do GitHub). Nota: o repositório é público e o e-mail digitado na ação aparece nos metadados da execução (acesso.yml:25-33, já documentado). |
| PAY-009 rebaixamento silencioso | RESOLVIDO: e-mail ao dono no deploy, `cobranca` em /api/health, PIX direto não expira mais. |
| PAY-010 texto dos juros | RESOLVIDO. |
| PAY-011 estorno parcial fecha acesso | CONTINUA como decisão de produto; ainda não está em runbook (INCIDENTES.md sem menção). |
| PASS "Expiração: /perfil Acesso encerrado" | ERA FALSO: o ramo é código morto (PAY-B-004). |

## (2) Nota da área: 78/100
O núcleo (quem libera, quanto se cobra, idempotência, estorno, contestação, varredura, alertas) está sólido e testado; não
achei caminho para acesso sem pagar nem para cobrar valor diferente do catálogo. O que impede subir sem ressalva:
PAY-B-001 (a virada de 31/10 é manual, sem lembrete, e o site passa a anunciar prazo vencido) precisa de solução antes de
31/10; PAY-B-002 e PAY-B-003 (o comprador no celular perde o PIX e a tela de retorno diz coisas erradas) e PAY-B-004
(aluno vencido tratado como visitante, sem aviso por e-mail) são os que mais vão gerar suporte e pedido de reembolso.

## (3) Os 5 maiores problemas
1. PAY-B-001 (P1): em 01/11 nada muda sozinho; o site anuncia "pré-lançamento até 31/10, depois R$ 297" e segue cobrando R$ 147.
2. PAY-B-002 (P2): PIX gerado se perde ao recarregar/voltar do banco; sem retomada, novo PIX, risco de pagar duas vezes.
3. PAY-B-003 (P2): tela de retorno diz "nada foi cobrado" em pedido estornado, "em análise" sem pagamento, e segura cartão recusado 3 min.
4. PAY-B-004 (P2): acesso vencido vira visitante sem explicação; "Acesso encerrado" é código morto; nenhum e-mail de vencimento.
5. PAY-B-005 (P2): no PIX direto a liberação manual não marca o pedido pago: sem recibo, "Aguardando" eterno e desistência pelo site impossível.
