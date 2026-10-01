# Contexto compartilhado da auditoria de 01/10/2026 (Hebraico Fluente)

Repositório: /home/user/hebraicofluente (branch claude/festive-turing-a4olfy = main @ 6d6302d, PR #85).
NÃO altere nenhum arquivo do repositório. Scripts temporários só em
/tmp/claude-0/-home-user-espanolsindolordecabeza/f968eeec-05b6-5568-9ddf-eecb1a9e02c9/scratchpad/audit2/ .
NÃO faça operações destrutivas, NÃO use produção (hebraicofluente.com.br NÃO é alcançável deste
ambiente: o proxy bloqueia; não tente), NÃO crie cobranças reais, NÃO imprima segredos.

## Arquitetura (resumo)
- app/: Next.js 15 (export estático em app/out), React 19, Tailwind 4. Rotas em app/src/app/*.
  Componentes em app/src/components/{landing,learn,game,platform,shell,legal,hebrew,ui}.
  Lógica em app/src/lib (engine/ = exercícios; state/ = progresso do aluno; account/ = sessão).
- worker/src: Cloudflare Worker na frente dos assets. worker.js roteia /api/* (tabela de rotas em
  worker.js:34-123), gate.js barra rotas pagas (prefixos GATED) com cookie de sessão + entitlement no D1,
  api/content.js serve o conteúdo pago (fora do bundle JS; app/pacote.mjs prova isso no deploy).
  api/pay.js = Mercado Pago (create/verify/webhook/reconcile) + PIX direto + desistência (CDC art. 49)
  + estorno automático; lib/mercadopago.js, lib/pix.js; reconcile.js e alertas.js rodam no cron de 5 min.
  schema.sql = D1 (accounts, entitlements, orders, payment_events, throttle, password_resets,
  email_verifications, access_log, invites, progress, registros_acesso, arrependimentos, estornos,
  aceites, depoimentos, aparelhos, marcas, novidades, admin_codigos, estatisticas, ab_contagens...).
  lib/session.js (cookie HMAC, session_version, aparelho), lib/admin.js (segundo fator por e-mail),
  lib/crypto.js (PBKDF2), api/csp.js (CSP com nonce/hashes, relatório).
- data/*.json: conteúdo (letters, nikud, modules, textos, bonus, biblia, courses, empresa, audio...).
  tools/export-content.mjs gera app/content e app/public. scripts/validate.js valida o conteúdo.
- .github/workflows: deploy-worker.yml (testes, checks, deploy com rollback), acesso.yml (operação manual).
- Documentação: CLAUDE.md (histórico de decisões, LEIA as seções que tocam sua área), IMPLEMENTAÇÃO em
  SECURITY-AUDIT.md e SPEC.md, SECURITY-AUDIT.md, INCIDENTES.md, ANTES-DE-VENDER.md.
- Auditoria anterior: audit/2026-09-28/ (RELATORIO.md + A-qa..H-com). NÃO repita o que já está lá
  sem verificar o estado atual: diga se cada item relevante da sua área foi resolvido ou continua.

## Ambiente local disponível (já no ar; não reinicie)
- Site de produção reproduzido localmente: http://127.0.0.1:8787 (wrangler dev --local, D1 local,
  build atual de app/out). ADMIN_EMAILS local = aluno-ux-1790733122848@example.invalid.
- E-mails saem para um Resend falso e caem em /tmp/claude-0/emails.jsonl (JSON por linha: to, subject, text).
- Contas de teste no D1 local: aluno-ux-1790733122848@example.invalid / senha-boa-123 (COM o curso,
  e é admin local), so-termos-390-1790772607046@example.invalid / senha-boa-123 (sem curso; nota: um
  estorno de teste já fechou um pedido dela). Pode criar contas novas com e-mails @example.invalid.
- Consultar o banco local: cd /home/user/hebraicofluente && npx wrangler d1 execute hebraico-fluente --local --json --command "SELECT ..."
- Navegador: Playwright em /home/user/hebraicofluente/app/node_modules/playwright/index.mjs com
  executablePath '/opt/pw-browsers/chromium'. Use waitUntil 'load' (networkidle não assenta na capa).
  Script modelo: /tmp/claude-0/-home-user-espanolsindolordecabeza/f968eeec-05b6-5568-9ddf-eecb1a9e02c9/scratchpad/loja2.mjs
- Rate limit: PUT /api/progress permite 60/min; login 60/h por origem; signup 10/h por IP.
- Testes: cd app && npx vitest run (1087 passam hoje), npx tsc --noEmit. Checks: app/{checa-seo,numeros,
  promessas,pacote,check-legal,clique,a11y}.mjs (clique/a11y precisam de HF_CHROMIUM=/opt/pw-browsers/chromium;
  a11y.mjs usa chromium.launch() sem path: copie-o para o scratchpad e troque por executablePath).
- Mercado Pago: só mock nos testes (tests/estorno.test.ts, pagamento.test.ts). Não há credencial aqui.

## Formato de saída obrigatório
Escreva o relatório completo em /tmp/claude-0/-home-user-espanolsindolordecabeza/f968eeec-05b6-5568-9ddf-eecb1a9e02c9/scratchpad/audit2/<SUA-LETRA>.md
em português, SEM travessões (use vírgula, dois-pontos ou parênteses), com esta ficha por achado:

ID: <AREA>-NNN | Prioridade: P0/P1/P2/P3 | Confiança: CONFIRMADO / ALTA CONFIANÇA / PRECISA VERIFICAÇÃO MANUAL
Local: arquivo:linha ou rota
Problema / Evidência (comando, trecho, captura) / Por que importa / Impacto no cliente / Correção sugerida
Complexidade: Mínima/Pequena/Média/Grande | Claude corrige sozinho?: Sim / Revisar antes / Não

Regras: só achados com evidência; reproduza quando der; não infle severidade; não repita formatação
trivial; distinga "confirmado" de "suspeita". Inclua no fim: (1) o que da auditoria de 28/09 na sua
área foi resolvido/continua, (2) nota 0-100 da sua área com o que impede subir, (3) os 5 maiores
problemas da área. Na resposta final para o orquestrador devolva SÓ: caminho do arquivo, contagem
por prioridade, nota, e os 5 maiores achados em uma linha cada.
