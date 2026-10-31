# AGENTE C - PAYMENT & ACCESS · Hebraico Fluente · 28/09/2026 · main 4380711

Método: leitura de worker/src/api/pay.js, lib/{mercadopago,pix,catalog,db}.js, reconcile.js, gate.js,
checkout/[slug]/{CheckoutClient,obrigado/ObrigadoClient}.tsx, perfil, scripts/pagamento-ativo.mjs,
acesso.yml, e2e.sh, audit/README.md, SECURITY-AUDIT.md. Provas: `npx vitest run tests/pagamento.test.ts`
(25/25 verdes), `node worker/concessao.mjs` (tudo certo), sonda própria `scratchpad/audit/c-pay-probe.mjs`
(handlers reais + schema.sql em node:sqlite + Mercado Pago falsa; 47 asserções, todas conforme) e curls no
wrangler local. Produção/Mercado Pago real: NOT TESTED.

## Veredito dos 4 cenários críticos
| Cenário | Veredito | Resumo |
|---|---|---|
| 1 Cliente paga e não recebe acesso | PASS (código) / NOT TESTED (MP real) | 3 caminhos + cron 5 min; e-mail só depois do acesso e falha aberta. Buracos residuais: PAY-005 (pedido `expired` pago no dia 2 só via webhook), PAY-001 (token de teste = ninguém é cobrado). |
| 2 Acesso sem pagar | PASS | Preço/meses/curso só do catálogo; verify 404 para pedido alheio; `pending` não abre portão; convite não vira acesso sozinho; webhook fail-closed; valor/moeda conferidos. Risco só operacional: quem tem write no repo roda `liberar` (PAY-008). |
| 3 Pagamento duplicado | PARTIAL | Mesmo pedido pago 2x: só trilha `pagamento-duplicado`, estorno é MANUAL do dono; nenhum estorno automático existe (não há chamada a /v1/payments/{id}/refunds). Dois PEDIDOS pagos: 24 meses e nenhuma trilha (PAY-004). |
| 4 Reembolso e acesso continua | PARTIAL | `refunded`/`charged_back`/parcial abaixo do preço → `refundOrder` revoga na hora (provado). Mas depende 100% do webhook `payment`: `chargebacks`/`merchant_order` são ignorados, o cron nunca revisita pedidos pagos, e a desistência pelo site não fecha nada até o dono estornar no painel (PAY-002, PAY-003, PAY-013). |

## Tabela de transições (mapStatus mercadopago.js:212 → applyPayment pay.js:547)
| MP status | interno | order.status antes → depois | entitlement | evento UNIQUE `id:estado` |
|---|---|---|---|---|
| approved / authorized | paid | pending/failed/expired → paid (`markPaid`, `status<>'paid'`) | `grantAccess` (INSERT ou ESTENDE a partir do vencimento; no-op se `order_id` já é este) | `<id>:paid` |
| approved, valor < amount_cents ou moeda ≠ BRL | failed (pay.js:646) | inalterado | nada; trilha `pay-mismatch` | `<id>:paid` gravado antes (sem efeito) |
| approved, `transaction_amount_refunded` > 0 e resto < preço | refunded (pay.js:559) | paid → refunded | recua `months` deste pedido; apaga se ≤ agora | `<id>:refunded` |
| approved de 2º pagamento com pedido já paid | paid | inalterado | inalterado; trilha `pagamento-duplicado` (só se `fresh`) | `<id2>:paid` |
| pending / in_process / in_mediation / desconhecido | pending | inalterado | nada | `<id>:pending` |
| rejected / cancelled | failed | pending → failed (só se `fresh`) ; paid inalterado | nada | `<id>:failed` |
| refunded / charged_back (id = provider_ref) | refunded | paid → refunded (batch atômico `refundOrder`) ; pending → refunded | recua meses / apaga; trilha `estorno`/`revoke` | `<id>:refunded` |
| refunded de id ≠ provider_ref (cobrança em dobro) | refunded | inalterado (paid) | inalterado; trilha `estorno-duplicado` | `<id2>:refunded` |
| (cron) pending/failed > 24 h | - | → expired (reconcile.js:54) | nada | - |
| expired + approved via webhook | paid | expired → paid | `grantAccess` | `<id>:paid` |
Ordem/idempotência: evento gravado ANTES de agir, mas a trava real é `atual.status` relido + `markPaid`/`refundOrder`
condicionais no SQL. Aviso repetido (`!fresh`) de aprovação chega de propósito até `grantAccess` para terminar uma
liberação interrompida (pay.js:627-641). Todo caminho reconsulta a MP (`getPayment`/`paymentsFor`): um webhook
atrasado/replayed NUNCA carrega estado - só o id. "approved → refunded → approved atrasado" resulta em refunded
(sonda F). Só se a própria MP voltasse a dizer `approved` o acesso reabriria e o pedido voltaria a `paid` (teórico).

## Achados
PAY-001 | P2 | scripts/pagamento-ativo.mjs:98-140 · worker/e2e.sh:265-272 · mercadopago.js:61 | Token `TEST-` (ou usuário de teste `APP_USR-`) publicado em produção passa a publicação: `/v1/payment_methods` autentica, modo fica `mercadopago`, `isSandbox` manda comprador real para `sandbox_init_point`/PIX de teste; ninguém é cobrado, pedido nunca paga, nada falha | e2e só desvia quando `modo=producao`; `/api/health` local hoje: `modo:"teste", vendedor:"recusado"` e `ok:true`; comentário em mercadopago.js:39-42 descreve o dano ("semanas de vendas perdidas sem sintoma") mas nenhuma etapa o barra | Em pagamento-ativo: se `querido=mercadopago` e token começa com `TEST-` → `rebaixar`/falhar; em e2e contra o domínio de produção: `espera modo producao` e `espera vendedor real`
PAY-002 | P2 | pay.js:427 · reconcile.js (só `pending`/`failed`) | Chargeback/estorno só fecha acesso se chegar como aviso `type=payment`. `type=chargebacks` e `merchant_order` respondem 200 e são descartados (sonda B); o cron nunca reconsulta pedidos `paid`. Se a MP entregar o chargeback só no tópico `chargebacks` (ou o webhook estiver mal configurado/401 por segredo errado), o aluno fica com 12 meses e o dinheiro | pay.js:427 `!String(type).startsWith('payment')` → `json({ok:true})`; audit/README "A varredura NÃO revisita pedidos pagos" | Tratar `chargebacks`: GET `/v1/chargebacks/{id}` → `payment_id` → `settleFromPaymentId`; e uma varredura diária (não a de 5 min) dos pedidos `paid` dos últimos ~120 dias comparando `status`/`transaction_amount_refunded` | NOT TESTED contra MP real qual tópico chega
PAY-003 | P2 | pay.js:336-339,364-374 · schema.sql:263 (`arrependimentos`) · acesso.yml | Desistência pelo site NÃO estorna nem fecha: grava a linha, manda e-mail ao dono, e o dinheiro volta só quando o dono estorna no painel da MP (aí o webhook revoga). Não existe estado "resolvido", nenhuma ação `Acesso` lista desistências abertas, e nada alerta se passar o prazo de 10 dias úteis prometido em /reembolso. Se o e-mail ao dono cair (Resend fora: `avisarDesistencia` só loga), o pedido fica invisível | sonda H: após `desistir` acesso segue aberto e pedido `paid`; `mailReady(env)` false → `return` sem trilha do lado do dono | Ação `Acesso → desistencias` (JOIN arrependimentos × orders.status), coluna `resolvido_em`, e/ou estorno automático via `POST /v1/payments/{id}/refunds` dentro do prazo | HANDOFF → [LEGAL]: prazo de 10 dias úteis depende de processo manual sem lembrete
PAY-004 | P3 | pay.js:141-153,631-641 | Dois pedidos `pending` do mesmo curso são permitidos (só entitlement ativo bloqueia); "Gerar outro código" cria outro PIX e o anterior continua pagável por 30 min. Ambos pagos → 24 meses e NENHUMA trilha (`pagamento-duplicado` só cobre o mesmo pedido). Dinheiro=meses é coerente, mas o dono não descobre a cobrança acidental | sonda D: 2 pedidos paid, ≈24,0 meses, 0 linhas de duplicidade; estorno do 2º volta a 12 | Ao liberar, se houver outro pedido `paid` da mesma conta+curso nas últimas 24 h → trilha `pedido-duplicado` + aviso ao dono; opcionalmente cancelar o PIX anterior (`PUT /v1/payments/{id}` status cancelled) ao gerar outro
PAY-005 | P3 | pay.js:293 · db.js:553 · mercadopago.js:259-294 (preference sem `expires`) | Pedido vira `expired` após 24 h e sai de `verify` e do cron; a preference de cartão não expira, então quem paga o link no dia seguinte só é liberado se o webhook chegar. Webhook perdido = "paguei e não liberou" sem caminho automático | sonda G: `verify` de `expired` não consulta a MP; webhook ainda libera | `expires:true, expiration_date_to: +24h` na preference (aí o link morre junto com o pedido), ou incluir `expired` na consulta do `verify`
PAY-006 | P3 | pay.js:511 | Só o 404 da MP vira "não é nosso". Pagamento de OUTRO vendedor pode responder 403/400 → `'erro'` → 500 → a MP reenvia até o limite dela, uma linha `settle-error` por tentativa (teto 20/min) | `if (e && e.status === 404) return null;` | Tratar 400/403 como `null` também
PAY-007 | P3 | acesso.yml:324-329 | `liberar` em conta com acesso ativo faz `expires_at = excluded.expires_at` = agora + M - SUBSTITUI, não estende (o comentário diz "ESTENDE"). Cliente pagante com 10 meses restantes + `liberar 1` (cortesia) → fica com 1 mês. Meses = M×30,44 d, diferente do `+N months` de `grantAccess` | SQL do ramo `EXISTE != 0` | `expires_at = unixepoch(MAX(entitlements.expires_at, unixepoch()*1000)/1000,'unixepoch','+M months')*1000`
PAY-008 | P3 | acesso.yml:36-38,88 | Quem pode liberar/revogar: qualquer pessoa com permissão de escrita no repositório (workflow_dispatch); `environment: producao` com reviewers é opcional e não foi verificado daqui. `revogar` deixa `orders.status='paid'` (correto: reenvio de aprovação não reconcede, `atual.status==='paid'`) | NOT TESTED (settings do GitHub) | Confirmar Required reviewers no environment `producao`; HANDOFF → [INFRA]
PAY-009 | P3 | scripts/pagamento-ativo.mjs:74-85 · auth.js:800 (`modo`) | Rebaixamento para `pix-direto` só aparece no step summary da publicação; nenhum e-mail/push ao dono; `/api/health.modo` não expõe `pix-direto`. No modo pix-direto o cron marca pedidos `expired` após 24 h (reconcile.js:54-62) - quem pagou e não foi liberado no mesmo dia vê "Expirado" em /perfil enquanto o `liberar` manual ainda funciona (independe do pedido) | código | Avisar o dono por e-mail no rebaixamento (workflow) e expor `modo:'pix-direto'` em health; não expirar pedidos pix-direto, ou rotular "aguardando conferência"
PAY-010 | P4 | app/src/app/faq/page.tsx:81 · CheckoutClient.tsx:313 | "juros são os da operadora do seu cartão": a preference não fixa `installments_cost`, logo vale o padrão da conta MP - juros do parcelamento são da Mercado Pago (financiamento dela), pagos pelo comprador, não "da operadora". Coerente em quem paga; impreciso em quem cobra | sonda A: preference = `unit_price 147, installments 12`, sem custo de parcela | HANDOFF → [LEGAL|COM]: "juros do parcelamento da Mercado Pago, mostrados antes de confirmar"
PAY-011 | P4 | pay.js:559-561 · audit/README item 8 | Estorno parcial que deixa menos que o preço fecha o acesso (decisão de produto documentada). Um "desconto de cortesia" devolvido pelo painel derruba o aluno; recuperação só por `liberar` | teste 8 verde | Manter, mas registrar em runbook do dono

## PASS
PASS | Preço só do catálogo | catalog.js:28-34 `priceCents`; pay.js:173; sonda A: corpo com `amount/price/months/quantity/pixDiscountPct` ignorado → PIX 13230, cartão 14700 x1, `installments` 24→12, curso `soon` 404, method desconhecido→pix; e2e.sh:284 confere 13230 em produção com token de teste
PASS | Desconto PIX igual na tela e na cobrança | app catalog.ts:124 `pixPrice` = 132,30; catalog.js:30 = 13230; MP `transaction_amount 132.3` (sonda A)
PASS | Webhook: assinatura, janela, fail-closed, GET | mercadopago.js:338-365 (HMAC do manifesto `id;request-id;ts`, ±5 min, `timingSafeEqual`, sem segredo → false); sonda B: segredo errado 401, ts 400 s 401, sem `MP_WEBHOOK_SECRET` 401; GET assinado válido cai no mesmo handler (worker.js); local: POST sem assinatura 401, `data.id=../users/me` 200 ignorado (regex `^\d{1,24}$`)
PASS | Webhook não é acreditado | pay.js:455-457 reconsulta `getPayment`; `external_reference` desconhecido → 200 sem acesso; pagamento de R$1 ou USD com nosso `external_reference` → sem acesso, pedido segue `pending`, trilha `pay-mismatch` (sonda B)
PASS | Idempotência / concorrência | `payment_events` UNIQUE `id:status` (pay.js:564); `grantAccess` decide no SQL (db.js:359-366); `markPaid` condicional (db.js:536); `refundOrder` batch atômico (db.js:414-431); `node worker/concessao.mjs`: 6 caminhos simultâneos → 1 concessão, 1 recibo, 1 estorno; tests 1,2,2b,3,6,7 verdes
PASS | Pedido alheio / pending | pay.js:283 e 353 `order.account_id !== account.id` → 404 (sonda C, e2e.sh:292); `hasEntitlement` exige linha em `entitlements` (gate.js:120, content.js:73) - pedido `pending` não abre nada
PASS | Convites não viram acesso sozinhos | db.js:459-490 só leitura; auth.js:185 avisa o dono; `liberar` de novo concede
PASS | E-mail de compra só depois do acesso, falha aberta | pay.js:673→682→697; `confirmarPorEmail` try/catch, trilha `compra-email-falhou`; tests "um provedor fora do ar não desfaz a compra" e "sai UMA vez só"
PASS | Cron | wrangler.toml:80 `*/5`; reconcile.js: idade mínima 60 s, lote 20, desiste em 24 h, `failed` incluído; sonda G
PASS | PIX expira em 30 min (MP) e a tela desiste em 5 min com instrução | mercadopago.js:225-239; CheckoutClient.tsx:48,478-487; obrigado 3 min com estados paid/pending/failed/unknown e sem confiar na query (ObrigadoClient.tsx:60-80)
PASS | Expiração 12 meses | `grantAccess` `+12 months` (SQLite, UTC ms); `hasEntitlement` `expires_at > now` - no dia seguinte 302 para /cursos (gate.js:121), `/api/me` omite (activeEntitlements), /perfil "Acesso encerrado"; progresso fica (`/api/progress` só exige conta); renovação: `create` aceita se vencido ou ≤45 dias (sonda E: vencido 200, 46 d 409 `already-owned`, NULL 409); aviso "Renovar acesso" a 30 dias (AccessNotice.tsx:19)
PASS | Prazo de desistência | pay.js:78-82: 7 dias do `paid_at`, até 23:59:59 Brasília (sonda H: 27/09 23h BRT → 04/10 23:59:59 BRT); `nao-pago`/`fora-do-prazo` 409; /reembolso diz "compra ou liberação, o mais favorável" - coerente
PASS | Sandbox | `isSandbox` decide pelo prefixo; `MP_SANDBOX` só para prefixo desconhecido e está `"0"` (wrangler.toml:124); sonda I. Comprador real só vai a sandbox se o token for `TEST-` (→ PAY-001)
PASS | 5 correções de audit/README estão no código | (1) chave `id:status` pay.js:564; (2) estorno/chargeback revoga pay.js:573-618 + db.js:409; (3) direito antes do pedido pay.js:660-682, `await` pay.js:488, 500/200 pay.js:464,511; (4) renovação 45 d pay.js:150-153; (5) logout sobe `session_version` - test 5 verde. Mais os 4 da verificação (tests 6-9). `npx vitest run tests/pagamento.test.ts` = 25/25

## NOT TESTED
NOT TESTED | Cobrança real, webhook real, assinatura contra notificação real, tópico em que chegam chargeback/estorno do painel | Mercado Pago real inalcançável; `/api/pay/create` local = 502 (token falso). CLAUDE.md já lista como não provado
NOT TESTED | Quem paga o juro do 12x na prática | depende da configuração "parcelamento sem juros" da conta MP; preference não fixa (sonda A)
NOT TESTED | Reviewers do environment `producao` para `Acesso` | settings do GitHub fora do alcance
NOT TESTED | Resend real / entrega do e-mail de compra e do aviso de desistência ao dono | `email:false` no local

## HANDOFF
HANDOFF → [SEC]: throttle do webhook (1 log/IP/h) e `readJson` 32 KB já vistos; nada novo.
HANDOFF → [LEGAL]: PAY-003 (prazo de 10 dias úteis sem controle), PAY-010 (texto dos juros), PAY-011 (estorno parcial fecha acesso).
HANDOFF → [INFRA]: PAY-001 (barrar token de teste no deploy), PAY-008 (reviewers), PAY-009 (aviso de rebaixamento).
HANDOFF → [QA]: fluxo visual de `expired` em /perfil no modo pix-direto (PAY-009).
