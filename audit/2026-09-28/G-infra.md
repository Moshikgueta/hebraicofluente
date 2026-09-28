# G - INFRA + RELIABILITY (28/09/2026, somente leitura)

Fontes: wrangler.toml, .github/workflows/{deploy-worker,deploy-app,acesso,relatorio-ab}.yml, scripts/{backup-d1,cloudflare-setup}.sh,
worker/{e2e.sh,browser-check.mjs,schema.sql,src/worker.js,src/reconcile.js,src/api/{auth,pay}.js,src/lib/{db,crypto}.js},
DEPLOY-CLOUDFLARE.md, DEPLOY.md, CLAUDE.md, SECURITY-AUDIT.md, ANTES-DE-VENDER.md, .env.example; API GitHub (runs 81-154,
jobs/logs de #152-#154, colaboradores, branches, repo). Produção/painel Cloudflare: inalcançáveis (CONNECT 403).

## Respostas diretas

**1. D1 destruído hoje: os alunos voltam?** NÃO, com o que existe no repositório/CI. Único mecanismo é `scripts/backup-d1.sh`
(export manual para `backups/` local, gitignored). Nenhum workflow agendado (4 workflows: Acesso, Deploy app to Pages, Deploy
platform, pages-build-deployment; `grep schedule` vazio). Nenhuma evidência de execução: não há `backups/`, nenhum
`.wrangler/ensaio-*`, nenhum commit/doc relata um ensaio; ANTES-DE-VENDER §16 e CLAUDE.md descrevem o comando, não um resultado.
O `--ensaiar` restaura só localmente e conta linhas: nunca foi provado contra o D1 remoto. Time Travel (30 d, não sobrevive a
apagar o banco/conta): NOT TESTED. Conclusão: hoje a recuperação depende de a Cloudflare ainda ter o banco.

**3. Observabilidade.** Não existe NENHUM alerta: nenhum health check externo, nenhum `schedule:` no Actions, nenhuma
notificação Cloudflare no código/docs, nenhum e-mail ao dono em erro (só `console.error`, que morre com a execução: sem
`wrangler tail` aberto e sem Logpush nada fica). O cron só escreve na trilha quando liberou/expirou algo (reconcile.js:77):
um cron que parou é indistinguível de um cron sem trabalho. Cenários: 20 pagamentos falhando -> `pay-create-failed` na trilha,
visível só se o dono rodar Acesso->pagamento; webhook parado -> cron cobre em 5 min, e se o cron parar também ninguém sabe;
login quebrado / Worker 500 / D1 fora / certificado -> só quando o cliente reclamar no gmail/WhatsApp (data/empresa.json).
A única "sonda" de produção é o e2e do deploy, i.e. só quando alguém dá push. Tempo de detecção = tempo até a reclamação.

**7. Deploy.** Push em `main` publica direto; sem staging, sem preview. Os testes barram ANTES (vitest, pacote, promessas,
numeros, seo, a11y, clique: #146 parou em a11y e nada subiu). Mas `wrangler deploy` acontece no passo 6 do
cloudflare-setup.sh e o e2e no passo 9: o site fica ~5-10 s com a build nova antes da primeira checagem, e **se o e2e falhar
o código já está no ar e não há rollback** (exit 1 só pinta o job de vermelho; browser-check é `continue-on-error`). Evidência:
#152 (28/09 00:30) e **#154 (28/09 18:18, o `main` atual = 4380711)** subiram e o e2e falhou depois; #154 falhou em
`vai para a página do curso` (Location vazio em 16 s para /meu-hebraico/ com sessão sem compra) e o site segue nessa versão.
Taxa: runs 130-154 (25): 3 falhas (12%), 2 delas pós-deploy; runs 81-130 (50): 2 falhas (4%), 14 disparadas do ramo de
trabalho (antes de 20/09). Duração 4-6 min (média 3 min na janela anterior, máx 12). O e2e cria em produção
`hf-e2e-<n>@example.invalid`, pede link de senha (Resend real) e a limpeza apaga por `LIKE 'hf-e2e-%@example.invalid'`,
rodando com `always()` mesmo quando o deploy nem publicou. Risco baixo (RFC 2606, padrão específico), mas é DELETE em cascata
por padrão de string com o token de escrita total, sem `environment: producao`.

## Achados

INFRA-001 | P0 | scripts/backup-d1.sh; .github/workflows/* | Sem backup automático nem restore provado; único banco de contas, direitos, pedidos e progresso | 4 workflows, nenhum `schedule`; sem `backups/`; sem registro de ensaio; SECURITY-AUDIT.md:492 já apontava | Action semanal `wrangler d1 export` para R2/bucket cifrado (nunca artefato), ensaio de restore documentado com data, e testar restore no D1 remoto num banco `hebraico-fluente-ensaio`
INFRA-002 | P0 | monitoramento (ausente) | Zero alertas: falha de login, 500, D1 fora, cron parado, certificado, pagamento só chegam via reclamação | Nenhum health check externo, notificação Cloudflare ou Action agendada; cron sem heartbeat (reconcile.js:77) | Uptime check externo em `/api/health` exigindo `ok:true` + `payments:true` (5 min, e-mail/WhatsApp); Cloudflare Notifications (Workers errors, D1); cron grava heartbeat `reconcile-tick` 1x/h
INFRA-003 | P1 | scripts/cloudflare-setup.sh:269-297,753 + deploy-worker.yml:434-466 | Deploy publica antes de verificar; e2e falhando deixa a build no ar; sem rollback automático; `main` atual (#154) está nesse estado | job 109068394418: "No ar" 18:18:26, `✗ vai para a página do curso` 18:19:19, nada revertido | Usar `wrangler versions upload` + e2e contra preview URL + `versions deploy` só se passar; senão, passo automático `wrangler rollback` quando o e2e falha; investigar já a falha do #154 em produção
INFRA-004 | P1 | GitHub repo (API) | `main` sem proteção (`protected:false`), repo PRIVADO no plano Free (rulesets/branch protection indisponíveis: API 403 "Upgrade to GitHub Pro"), default branch é `claude/practical-babbage-veufcz`, 1 colaborador admin | list_branches, GET /repos, /rulesets | Tornar `main` default; ou GitHub Pro / repo público (mas acesso.yml e a11y docs assumem público, avaliar) para bloquear force-push/delete; 2FA: NOT TESTED
INFRA-005 | P1 | worker/schema.sql (0 `ALTER`), cloudflare-setup.sh:161 | Sem mecanismo de migração: só `CREATE IF NOT EXISTS`; coluna nova nunca chega à produção; sem versionamento do schema, rollback de schema é indefinido | SECURITY-AUDIT.md:498; `pass_iter DEFAULT 310000` vs código 25.000 (crypto.js:57) | Adotar `wrangler d1 migrations` (aditivas, numeradas, idempotentes); nunca DROP; documentar "rollback = código anterior tolera schema novo"
INFRA-006 | P1 | DNS e-mail (Cloudflare zone) | SPF/DKIM/DMARC de hebraicofluente.com.br não verificáveis daqui; ANTES-DE-VENDER.md:180-185 admite que DMARC talvez não exista; e-mail de senha pode cair em spam | `dig` ausente, DoH bloqueado (403) | Publicar DMARC (`v=DMARC1; p=quarantine; rua=...`) além dos registros da Resend; testar com Gmail real; NOT TESTED
INFRA-007 | P2 | wrangler.toml:69-70,137; crypto.js:27-57 | Plano Free: 10 ms CPU -> PBKDF2 25k (4,4 ms medido, abaixo do OWASP); 100k req/dia e D1 100k escritas/dia (CLAUDE.md:162-180: "seis endereços o dia inteiro" esgotam a cota) | estouro = toda escrita falha (login, cadastro, pagamento); req/dia excedido = Worker responde erro para todos até 00:00 UTC | Workers Paid (US$5) antes do lançamento: remove 100k req/dia, sobe D1 e CPU, habilita 310k iterações; estimativa abaixo
INFRA-008 | P2 | worker/src/worker.js:212-225 + log #153 | Cloudflare Web Analytics (beacon `static.cloudflareinsights.com`) está injetado na zona e bloqueado pela CSP; `/` deu timeout 45 s no browser-check pós-deploy (networkidle nunca chega) e ninguém agiu (continue-on-error) | browser-check #153: "✗ / - Timeout", "violates CSP" | Desligar Web Analytics/RUM na zona (também por LGPD: site declara "nenhum terceiro" -> HANDOFF LEGAL/SEC) e tornar o browser-check bloqueante ou alertante
INFRA-009 | P2 | deploy-worker.yml:536-562 | Limpeza de contas de teste = DELETE em 9 tabelas por `LIKE`, com token D1:Edit total, `continue-on-error`, sem `environment: producao`; e2e também gasta 2 envios Resend reais por deploy | log #153/#154 | Restringir ao e-mail da execução (`$MAIL` exportado), token separado só-leitura para Acesso/relatório (SECURITY-AUDIT.md:488), e `environment` no job de deploy
INFRA-010 | P2 | .env.example:17-20; cloudflare-setup.sh:170-215 | Segredos: CLOUDFLARE_API_TOKEN (D1:Edit + Workers + Zone WAF), MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, RESEND_API_KEY vivem no GitHub e são reempurrados a cada deploy; SESSION_SECRET vive SÓ no painel (gerado uma vez, sem cópia); sem procedimento de rotação nem prazo | trocar SESSION_SECRET = todos deslogados (cookie HMAC; `bumpSessionVersion` não ajuda); vazamento = forjar sessão de qualquer conta até a troca | Runbook de rotação (quem, onde, efeito); rotacionar CLOUDFLARE_API_TOKEN por escopo mínimo; guardar SESSION_SECRET num cofre do dono
INFRA-011 | P2 | *.md (grep incidente/ANPD/vazamento) | Nenhum procedimento de resposta a incidente (detectar, conter, preservar trilha, avaliar impacto, comunicar ANPD art. 48 e titulares); único "playbook" é "trocar SESSION_SECRET desloga todo mundo" | .env.example:17; ANTES-DE-VENDER.md:227 só fala do encarregado | Escrever INCIDENTES.md: contenção (rotacionar segredos, `wrangler rollback`, desligar rota), preservação (export D1 + trilha antes de purgar), prazo ANPD "razoável" (Res. CD/ANPD 15/2024: 3 dias úteis), modelo de comunicação
INFRA-012 | P2 | wrangler.toml:107,128; data/empresa.json; conta GitHub/Cloudflare | Bus factor 1: gmail pessoal é suporte, ADMIN_EMAILS e SUPPORT_EMAIL; GitHub e Cloudflare são contas pessoais de 1 pessoa; token de deploy é o único caminho para o banco | collaborators = 1 admin; get_me criado 26/04/2026 | Segundo admin (ou pessoa de confiança com acesso de recuperação) nas 3 contas; e-mail de domínio (contato@) como login de recuperação; senhas/2FA num cofre com sucessor
INFRA-013 | P3 | reconcile.js; worker.js:99 | Cron sem evidência de execução (só loga quando algo muda) e sem trava contra execução paralela; dois crons simultâneos são seguros por acaso: `recordEvent` UNIQUE `id:status` + `atual.status==='paid'` releitura (pay.js:563-603) evitam dupla liberação, mas `expired` e `checked_at` podem ser gravados 2x (inócuo) | Cloudflare não sobrepõe crons do mesmo Worker; a última execução aparece só no painel (NOT TESTED) | Heartbeat na trilha + alerta se ausente por >30 min
INFRA-014 | P3 | DEPLOY.md, deploy-app.yml, acesso.yml:25 | Docs contraditórios: DEPLOY.md diz "Pages, se republica a cada push, repositório público"; deploy-app.yml é só manual desde 20/09 e o repo é privado; acesso.yml ainda mascara por ser "público" | GET /repos: private=true | Marcar DEPLOY.md como legado ou apagar; confirmar que o site Pages antigo (curso inteiro, demo) foi despublicado (NOT TESTED)
INFRA-015 | P3 | worker.js:238 | HSTS `max-age=31536000; includeSubDomains` sem `preload`; www->apex por 301 no Worker (depende de a rota www existir, wrangler.toml:34) | código | Adicionar `preload` e submeter só depois de confirmar que nenhum subdomínio serve HTTP
INFRA-016 | P3 | deploy-worker.yml:107-108 | Actions `checkout@v4`/`setup-node@v4`/`upload-artifact@v4` em Node 20 deprecado (aviso em todo run); wrangler fixado em 4.135.0 (bom) mas Playwright 1.63.0 fixado só por versão, sem hash | logs #153/#154 | Subir para versões atuais fixadas por SHA

## PASS / NOT TESTED

PASS | Pipeline barra antes de publicar (7 provas + vitest); falha pré-deploy não sobe nada | run #146: a11y falhou, "Publicar" skipped
PASS | Deploy idempotente e auto-configurável; segredos do repo reempurrados ao Worker (rotação = editar segredo + push) | log #154 passos 1-8b
PASS | Só `main` publica (desde 20/09); `concurrency: cloudflare` serializa deploy, Acesso e relatório | deploy-worker.yml:54,110-112
PASS | Freio na borda existe (1 regra, janela 10 s = plano Free) e é confirmado por leitura da zona a cada deploy | log #154 "Confirmado na zona: 1 regra"
PASS | Domínio resolve para Cloudflare (2606:4700::/32) | `getent hosts` -> 2606:4700:3033::ac43:a002, 2606:4700:3037::6815:214d
PASS | Header/CSP/HSTS aplicados a toda resposta via `blindar()`; www 301 antes de tudo | worker.js:86-94,121-124,238-253
PASS | e2e em produção prova, a cada deploy: D1, schema, SESSION_SECRET, 10 páginas públicas 200, portão 302, conta/senha/logout, webhook sem assinatura 401, Resend aceitou envio (`emailEntregue`) | log #153 (36 ✓)
PASS | Trilha com retenção definida: access_log 180 d (db.js:231), registros_acesso 190 d (Marco Civil), password_resets +7 d, verificações vencidas; purga no cron | db.js:137-256
PASS | `deploy-app.yml` não conflita: só `workflow_dispatch`, grupo `pages`, build sem `PLATFORM_API` | deploy-app.yml:41-53
NOT TESTED | TLS/certificado real, HSTS no ar, headers reais | proxy intercepta TLS (cert `*.com.br` emitido pela CA do sandbox)
NOT TESTED | SPF/DKIM/DMARC, MX, NS, validade do registro .com.br, DNSSEC | sem `dig`, DoH 403
NOT TESTED | Time Travel do D1, Logpush, notificações Cloudflare, Bot Fight Mode (token sem permissão de leitura, log #154), última execução do cron, versões do Worker para rollback | painel inalcançável
NOT TESTED | 2FA no GitHub/Cloudflare; nomes de segredos do repo via API | proxy bloqueia `/actions/secrets`; get_me não expõe 2FA
NOT TESTED | Site GitHub Pages antigo ainda no ar (`moshikgueta.github.io/hebraicofluente`) | web 403

## Respostas curtas às demais perguntas

2. Rollback em 10 min: Worker: `npx wrangler rollback` (painel ou CLI, versão anterior fica retida) ou `git revert` + push
(5-6 min de pipeline). Não está documentado em lugar nenhum. Schema: só aditivo (nunca houve ALTER/DROP), então o código
anterior sobrevive ao schema atual; mas nada garante isso no futuro (INFRA-005). Dados: sem rollback (INFRA-001).
4. Logs: `access_log` (evento, account_id, detalhe, sem e-mail; 180 d), `registros_acesso` (login/IP, 190 d),
`payment_events` (projeção `enxuto()`, sem purga), `ab_contagens` (diário). Leitura: Actions->Acesso (consultar, listar,
envios, pagamento, pedido) e Relatório A/B, tudo mascarado. Logs de execução do Worker: só `console.error`, efêmeros, sem
`wrangler tail` permanente nem Logpush (plano Free não tem Logpush). Logs do Actions: 90 d padrão; capturas 7 d.
5. Estimativas (plano Free; hipótese 15 req/página, 3 sessões/aluno/dia, 6 páginas/sessão, /api/me+/api/progress em
cada página): 100 alunos ≈ 30-40k req/dia (ok) e ~2-3k escritas D1/dia (ok; cada login = throttle + registros_acesso +
access_log = 3 escritas). 1.000 alunos ≈ 300-400k req/dia -> ESTOURA 100k: o Worker devolve erro a todos até a meia-noite
UTC, site inteiro fora, inclusive páginas de venda (assets passam pelo Worker, `run_worker_first`). Escritas ≈ 25-30k/dia,
ok, mas 6 IPs hostis já esgotam a cota (CLAUDE.md:176). CPU 10 ms: PBKDF2 25k = 4,4 ms, sem folga para 310k. O Paid resolve
todos os três por US$5/mês: obrigatório antes de qualquer campanha.
6. Cron: sem evidência de execução daqui (nem log, nem heartbeat); Cloudflare não roda dois `scheduled` do mesmo Worker em
paralelo por desenho, e mesmo se rodasse a dupla liberação é impedida (INFRA-013).
8. Segredos: GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET,
RESEND_API_KEY) + painel Cloudflare (SESSION_SECRET, e cópias empurradas). Acesso: só o dono. Rotação: nunca documentada
nem feita. SESSION_SECRET trocado = todos deslogados na hora (cookie HMAC sem versão de chave); vazado = forjar qualquer
sessão (o portão confia no cookie + entitlement no banco: dá acesso a qualquer conta paga) até a troca. Cookie legado até
15/10/2026 (`LEGADO_ATE`) -> HANDOFF SEC: confirmar que a chave legada não é mais fraca.
9. Domínio: na Cloudflare (custom_domain via wrangler, certificado automático); www 301 apex; HSTS 1 ano sem preload;
registro .com.br/validade: NOT TESTED. E-mail: Resend com domínio verificado (prova: `emailEntregue:true` em todo deploy),
DMARC desconhecido (INFRA-006).
10. Incident response: inexistente (INFRA-011). 11. Bus factor 1 (INFRA-012).

HANDOFF → SEC: beacon Cloudflare Insights injetado na zona contradiz "nenhum terceiro"/CSP (INFRA-008); cookie legado até 15/10.
HANDOFF → LEGAL: mesmo beacon (analytics de terceiro sem aviso na Privacidade); ausência de plano de comunicação ANPD.
HANDOFF → PAY: #154 em produção falhou "portão com conta sem compra" (Location vazio): conferir /meu-hebraico/ ao vivo.
HANDOFF → QA: browser-check dá timeout na capa por networkidle (beacon/CSP); tornar bloqueante ou trocar de critério.
