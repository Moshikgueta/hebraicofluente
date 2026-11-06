# AUDIT_CONTEXT - Hebraico Fluente (auditoria de pré-lançamento, 28/09/2026)

Contexto compartilhado. Leia isto e vá direto aos arquivos da sua área. NÃO refaça
tree, NÃO leia package.json inteiro, NÃO mapeie a arquitetura de novo.
Repositório: /home/user/hebraicofluente (branch main = commit 4380711, PR #49).
REGRA: auditoria somente-leitura. Não edite nenhum arquivo do projeto.

## Restrições do ambiente
- **Produção (https://hebraicofluente.com.br) NÃO é alcançável deste contêiner**: o
  proxy devolve 403 no CONNECT. Tudo que só existe em produção (DNS, TLS, headers
  reais, WAF, Mercado Pago real, Resend real, D1 remoto, backups) é NOT TESTED,
  a menos que se prove pelo código/CI. Nunca converta isso em PASS.
- **Ambiente local já no ar** (não suba outro): `wrangler dev --local` em
  `http://127.0.0.1:8787` servindo a build de produção (`app/out`, modo worker)
  com D1 local, schema aplicado, `.dev.vars` com SESSION_SECRET real e
  MP_ACCESS_TOKEN falso (`TEST-...`), logo `/api/pay/create` falha limpo (502).
  Use `curl --noproxy '*'`. Log: /tmp/claude-0/wrangler.log.
  /api/health devolve `{"db":true,"schema":true,...,"email":false,"modo":"teste"}`.
- Chromium: `/opt/pw-browsers/chromium` (Playwright em app/node_modules). Os scripts
  `app/*.mjs` são provas em navegador prontas; vários aceitam `HF_CHROMIUM=` e
  `HF_BASE=`. Leia o cabeçalho de cada um antes de rodar.
- Testes: `cd app && npx vitest run` (930 testes, ~63 arquivos em app/tests) e
  `npx tsc --noEmit`. `npm run validate` na raiz confere a regra da ordem das letras.
- `npm audit` funciona (registry.npmjs.org está liberado). Web em geral: tentar
  WebFetch; se 403, registrar NOT TESTED.

## Stack
- Frontend: Next.js 15.5 (App Router, `output: export` = estático), React 19, Tailwind 4,
  TypeScript. Raiz `app/`. Fonte em `app/src/`. Build de plataforma:
  `NEXT_PUBLIC_PLATFORM_API=worker`. Existe também build "demo" (localStorage puro).
- Backend: Cloudflare Worker `worker/src/worker.js` (roda ANTES dos assets:
  `run_worker_first=true`). API `/api/*`, portão das rotas pagas, redirect www→apex,
  CSP/headers (worker.js:213-224), cron `*/5` (`worker/src/reconcile.js`).
- Banco: Cloudflare D1 (SQLite) `hebraico-fluente`. Schema `worker/schema.sql`,
  aplicado a cada deploy (`CREATE IF NOT EXISTS`). Tabelas: accounts, entitlements,
  orders, payment_events, throttle, password_resets, email_verifications, access_log,
  invites, progress, registros_acesso, arrependimentos, gravacoes, relatos, ab_contagens.
- E-mail: Resend (`worker/src/lib/mail.js`), segredo RESEND_API_KEY.
- Pagamento: Mercado Pago (`worker/src/lib/mercadopago.js`): PIX (`createPix`) e
  cartão via preference (`createCardPreference`); webhook assinado
  (`verifyWebhookSignature`, MP_WEBHOOK_SECRET). Fallback "pix-direto" (BR Code
  próprio, `worker/src/lib/pix.js`, liberação MANUAL via Action `Acesso`) escolhido a
  cada deploy por `scripts/pagamento-ativo.mjs`. Modo atual pedido: `mercadopago`
  (`data/empresa.json`). Sandbox decidido pelo prefixo do token (`isSandbox`).
- Preço: `data/courses.json` → alfabetizacao R$147 (listBrl 297, 12x, pixDiscountPct 10),
  `accessMonths: 12`. Worker lê o mesmo arquivo (`worker/src/lib/catalog.js`). O
  navegador nunca manda preço.
- Segredos (painel/GitHub): SESSION_SECRET, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET,
  RESEND_API_KEY, CLOUDFLARE_API_TOKEN, ADMIN_TOKEN?. Vars públicas em `wrangler.toml
  [vars]`: SITE_ORIGIN, EMAIL_FROM, SUPPORT_EMAIL, MP_SANDBOX=0, ADMIN_EMAILS,
  PBKDF2_ITERATIONS (comentado; padrão 25.000 por causa do limite 10ms CPU do plano
  gratuito, `worker/src/lib/crypto.js:57`).
- Analytics: NENHUM terceiro. `app/src/lib/analytics.ts` `track()` não sai do
  navegador. Teste A/B do hero: `app/src/lib/ab.ts` + `POST /api/ab`
  (`worker/src/api/ab.js`) → tabela `ab_contagens` (só contadores diários; sem cookie,
  sem IP guardado; throttle 30/min/IP). Sem pixels, sem GA, sem fontes externas (CSP
  `default-src 'self'`).
- Cookies: só o de sessão (`worker/src/lib/session.js`, HMAC, `makeSessionCookie`,
  `LEGADO_ATE` 15/10/2026 para cookie legado). localStorage: progresso
  (`app/src/lib/state/local.ts`, `worker.ts` embrulha e sincroniza com `/api/progress`,
  fusão monotônica `merge.ts`), dono (`DONO`), A/B (`hf-ab-hero-2026-09`), preferências
  de acessibilidade.

## Rotas
- API (worker.js:26-83): auth signup/login/logout/forgot/reset/verify(send)/password/
  delete, GET /api/me, /api/health; pay create/verify/webhook(GET+POST)/orders/desistir;
  GET /api/content (conteúdo pago, exige entitlement); POST /api/ab; progress
  GET/PUT/DELETE; audio manifest; admin audio GET/PUT/DELETE/arquivo (admin =
  ADMIN_EMAILS, `worker/src/lib/admin.js`).
- Portão (`worker/src/gate.js:47-75`, espelhado em `PAGAS` `app/src/lib/seo.ts:37`):
  /licao /modulo /checkpoint /extra /revisao /academia /mapa /desafio-final
  /certificado /concluido /conquistas /historia /inicio /onboarding /meu-hebraico
  /vocabulario /meu-nome /teclado-hebraico /audio /stroke-order /som /loja /bonus
  /nikud-biblico. Sem sessão+entitlement → 302 (documento) ou 403 (asset).
- Públicas (app/src/app/): / (HomeClient), /sobre, /metodo, /cursos, /cursos/[slug],
  /faq, /suporte, /termos, /privacidade, /reembolso, /entrar, /criar-conta,
  /esqueci-senha, /nova-senha, /confirmar-email, /checkout/[slug], /perfil,
  /conta-apagada, /biblia?, /admin/gravar (painel de gravação, admin).
- Conteúdo pago também via `GET /api/content` (`worker/src/api/content.js`), gerado
  de `data/*.json` por `tools/export-content.mjs` → `app/content` (`ConteudoPago`).
  Amostras públicas: `app/public/amostra-audio/*.mp3`, `/tracado-amostra/`.

## Usuários
- visitante; conta sem compra (vê /perfil, /cursos, checkout); aluno com entitlement
  (12 meses, `entitlements.expires_at`); expirado; admin (ADMIN_EMAILS: só grava áudio,
  `/admin/gravar`; não há painel de alunos no site). Operação do dono = GitHub Action
  `Acesso` (`.github/workflows/acesso.yml`: liberar/revogar/consultar/listar/envios/
  pagamento) + `Relatório do teste A/B`.
- Conta: PBKDF2 (crypto.js), sessão versionada (`bumpSessionVersion`), reset por token
  hash (`password_resets`), confirmação de e-mail (`email_verifications`), apagar conta
  (`auth.apagar` + `app/apagar-conta.mjs`), throttle por IP (tabela `throttle`).
  Trilha: `access_log`, `registros_acesso` (190 dias, `REGISTROS_DIAS`).

## Pagamento (detalhe para C e B)
- `worker/src/api/pay.js`: create (111), verify (274), orders (316), desistir (345,
  arrependimento 7 dias, tabela `arrependimentos`, e-mail ao dono), webhook (415,
  assinatura → 401 `bad-signature`), settleFromProvider (478), applyPayment (547:
  trava `atual.status==='paid'`, estorno/chargeback → `refundOrder` revoga,
  `transaction_amount_refunded`). `payment_events` UNIQUE por `pagamento:estado`.
  Auditoria anterior: `SECURITY-AUDIT.md`, `audit/README.md`, `app/tests/pagamento.test.ts`.
- Reconciliação: `worker/src/reconcile.js` (cron 5 min, pedidos pending → consulta MP).
- Ainda não provado em produção (CLAUDE.md "Estado da operação"): cobrança REAL e
  assinatura do webhook contra notificação real.

## Progresso, jogos, certificado
- Regras puras: `app/src/lib/state/rules.ts` (XP, streak, SRS, conquistas, checkpoints,
  exame). Store React: `app/src/lib/state/store.tsx`. Sincronização: `worker.ts` ↔
  `/api/progress` (`worker/src/api/progress.js`, tabela `progress`, 409 + refusão).
- Motor de exercícios: `app/src/lib/engine/` (exercises, generators, gym, jogos, exam,
  deck, palavras, textos, missao, bonus, extras). Conteúdo: `data/letters.json`
  (27 letras), `nikud.json`, `translit.json`, `sentences.json`, `textos.json`,
  `extras.json`, `missoes.json`, `bonus.json` (22 leituras bíblicas + guia),
  `courses.json`, `modules.json`, `real-world.json`, `culture.json`, `eras.json`.
- Exame final: `engine/exam.ts`, rota /desafio-final; certificado: `app/src/lib/
  certificate.ts`, /certificado (CertificadoClient.tsx). Loja XP: `lib/loja.ts`, /loja.
- Áudio: `data/audio.json` (catálogo, ~430 clipes), `audio/` (mp3 no git), servidos em
  `/audio/*` (atrás do portão), `GET /api/audio/manifest`. Voz do dono. TTS não usado.
- Traçado: `data/stroke-paths.json` → `/stroke-order/*` (portão).

## Jurídico e comercial
- Fornecedor: `data/empresa.json` (razão social Mhg Treinamentos e Idiomas, CNPJ
  51.041.290/0001-52, Curitiba, e-mail gmail, WhatsApp, horário, arrependimento 7 d,
  garantia 7 d, reembolso 10 dias úteis, prazo LGPD 15 d, encarregado null).
- Páginas: /termos, /privacidade, /reembolso, /suporte, /faq (app/src/app/*/page.tsx,
  componente `components/legal/Legal.tsx`). Provas: `app/check-legal.mjs`,
  `app/tests/consumidor.test.ts`, `app/promessas.mjs`, `app/numeros.mjs`.
- Landing: `app/src/app/HomeClient.tsx` + `components/landing/*` (Hero A/B, Promessa,
  OuvirEFalar, Decisoes, Fecho, Trajetoria em /sobre). Depoimentos: `lib/testimonials.ts`
  (1 depoimento, Natália). Crédito do método: `lib/credito.ts`.
- Certificado: "não é certificado oficial" deve constar (verificar).
- Menores: verificar Termos/cadastro (não há campo de idade conhecido).

## Infra / CI
- `.github/workflows/deploy-worker.yml`: push em main → npm ci → vitest → pagamento-ativo
  → build → provas (pacote, promessas, numeros, seo, a11y, clique/browser) → wrangler
  deploy → schema D1 remoto → browser-check em produção (`worker/browser-check.mjs`,
  `worker/e2e.sh` contra prod) → limpeza de contas de teste. Job opcional
  exportar-gravacoes. `deploy-app.yml` (Pages, legado?). `acesso.yml` (operação).
- Backup: `scripts/backup-d1.sh` (`npm run db:backup`, `--ensaiar`). Verificar se roda
  agendado (não há workflow de backup listado) e se restore foi provado.
- Docs prévios (não confiar cegamente, confirmar): SECURITY-AUDIT.md (20/09),
  ANTES-DE-VENDER.md, AUDITORIA-*.md, DEPLOY-CLOUDFLARE.md, CLAUDE.md
  ("Invariantes", "Estado da operação", "Camada de confiança").
- Rate limiting/WAF: dito estar na zona Cloudflare (painel) - NOT TESTED daqui.
  Throttle em D1 no código (tabela `throttle`, `scripts/prova-freio.sh`).

## Formato de resposta dos agentes
- Problema: `ID | P0-P4 | arquivo:linha ou URL | problema | evidência | correção`
- Aprovado: `PASS | item | evidência`  ·  Não testado: `NOT TESTED | item | motivo`
- Fora do escopo: `HANDOFF → [agente]: descrição`
- IDs: QA- SEC- PAY- LEGAL- PED- UX- INFRA- COM-. Sem ensaios, sem código copiado.
