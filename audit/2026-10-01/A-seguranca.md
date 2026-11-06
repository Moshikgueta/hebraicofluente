# A. Segurança e infraestrutura (auditoria de 01/10/2026)

Repositório: /home/user/hebraicofluente @ 6d6302d. Ambiente: http://127.0.0.1:8787 (wrangler dev local, D1 local).
Scripts e saídas temporárias: scratchpad/audit2/ (a-leak.mjs, nc.txt, cc.txt, ck-*).

Pergunta central: um usuário capaz consegue o conteúdo pago sem pagar, dados de outra conta, ou virar administrador?
Resposta, com o que foi provado hoje: **não, por nenhum caminho testado.** O portão, /api/content, a sessão HMAC, o
segundo fator do admin e o webhook resistiram a todas as tentativas abaixo. Os achados reais desta rodada estão na
infraestrutura (o backup diário quebrou ontem) e em freios e abusos de segunda ordem.

## O que foi testado e PASSOU (evidência resumida)

| Teste | Resultado |
|---|---|
| Sem cookie: /licao/alef/, /licao/alef/index.txt, /inicio/, /audio/he-*.mp3, /stroke-order/alef.svg | 302 para /entrar/ (nenhum byte do HTML) |
| Sem cookie: /api/content, /api/orders, /api/progress, /api/depoimento, /api/admin/* | 401 |
| Conta sem curso (id 25): rotas pagas | 302 para /cursos/alfabetizacao/; /api/content 403 `not-owned`; /api/depoimento 403 |
| Conta sem curso: /api/admin/depoimentos, estatisticas, estornos, audio | 403 `not-admin` |
| Conta com curso e admin, sem 2º fator: /api/admin/depoimentos | 403 `admin-codigo` |
| 24 variações de caminho (`/LICAO/`, `/%6Cicao/`, `//licao/`, `/licao%2Falef/`, `/x/../licao/`, `/licao\alef/`, `/inicio.html`, `/licao/alef.html`, `?_rsc=1`, `;`) | todas 302/307 para o portão ou 404; nenhuma entregou aula |
| IDOR: `/api/pay/verify?order=ui-12` (pedido da conta 12) com cookie da conta 25; `/api/orders?account=12`; `/api/progress?uid=17`; `POST /api/pay/desistir {"order":"ui-12"}` | 404 `server`, ou a própria conta (parâmetros ignorados) |
| CSRF: PUT /api/novidades com `Origin: https://evil.example`, `Origin: null`, `Sec-Fetch-Site: cross-site`; POST logout cruzado | 403 nos quatro; mesma origem 200 |
| Cookie adulterado: uid 25→17 com a assinatura antiga, sem assinatura, assinatura alterada, nome legado com payload trocado | 401 em todos; o legítimo ao lado de um enxerto continua valendo |
| Webhook forjado: sem `x-signature`, com `v1=deadbeef`, tópico `chargebacks`, id não numérico | 401 `bad-signature` ou 200 ignorado; nada liberado |
| Erros: verify sem id, `order` objeto, `email` array, `__proto__` no progresso, método inválido | só códigos (`server`, `sem-curso`); nenhuma pilha, SQL ou caminho |
| Bundle público: `node app/pacote.mjs` + varredura independente de 963 strings dos 11 JSON pagos em todo app/out fora dos prefixos pagos | 0 vazamentos (único acerto: Gênesis 1:1 na página pública /biblia, intencional) |
| Source maps em app/out | 0 arquivos `.map`; `_csp-hashes.json` responde 404 |
| Cabeçalhos em `/` e `/licao/alef/` | CSP, CSP-Report-Only com hashes, HSTS 1 ano + preload, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; página paga `private, no-store` + `X-Robots-Tag: noindex` |
| `npm audit --omit=dev` (app) | 0 vulnerabilidades. Raiz: sem lockfile (ver SEC-A-009) |
| Histórico git: `-S 'APP_USR-'` (18 commits), `SESSION_SECRET=`, `re_…`, `ghp_`, chaves PEM, tokens da Cloudflare | só fixtures de teste (4 strings com forma de Access Token, todas `APP_USR-1234…-abcdef…` em app/tests); `SESSION_SECRET=qualquer-coisa` em doc. Nenhum segredo real |
| acesso.yml | entradas passam por `env:` (nunca `${{ }}` dentro de `run:`), SQL com aspas dobradas, `meses` validado, `pedido` filtrado a [A-Za-z0-9]; `environment: producao`; `permissions: contents: read` |
| Segundo fator do admin: 40 códigos em paralelo | 6 avaliados (limite 5), 0 aceitos; 5 códigos/h × 5 tentativas contra 10^6 |

---

## Achados

### SEC-A-001 | Prioridade: P1 | Confiança: CONFIRMADO (falha) / ALTA CONFIANÇA (causa)
**Local:** .github/workflows/backup.yml; scripts/backup-nuvem.sh (restauração local antes de enviar); tabela `gravacoes` (worker/src/api/audio.js:207, blobs de até 1,5 MB)

**Problema:** o backup diário que fechou o P0 INFRA-001 de 28/09 **falhou na execução agendada de 30/09** e, pela causa, vai falhar todos os dias.
**Evidência:** execução 36716795792 (schedule, 30/09 12:45 UTC, conclusão `failure`). Log do job 109891592313:
`Executing on local database hebraico-fluente ... from .../restaura-local/v3/d1:` seguido de
`✘ [ERROR] statement too long: SQLITE_TOOBIG`. As três execuções anteriores (28/09 manual ×2, 29/09 agendada) passaram.
Entre 29/09 e 30/09 entrou o painel de gravação, que guarda cada áudio como BLOB numa linha de `gravacoes` (até 1,5 MB, MAX_BYTES em audio.js:54). O export do D1 escreve cada linha como um único `INSERT` com o blob em hexadecimal (2× o tamanho: ~3 MB), acima do teto de 1.000.000 bytes por comando do SQLite. A restauração de prova rejeita o arquivo, e o script (corretamente) não envia uma cópia que não restaura. Resultado: nenhuma cópia nova no R2 desde 29/09.
**Por que importa:** o mesmo arquivo também não restauraria no D1 remoto (o `d1 execute --file` tem o mesmo teto). Ou seja: mesmo se o envio fosse forçado, a cópia não serviria para recuperar o banco. O único banco de contas, direitos, pedidos e progresso está de novo sem backup restaurável, e o Time Travel (30 dias) é a única rede.
**Impacto no cliente:** num acidente (DROP, migração errada, conta Cloudflare perdida) os alunos perdem conta, compra e progresso.
**Correção sugerida:** tirar `gravacoes` do dump principal (`wrangler d1 export --no-data --table gravacoes` ou exportar a lista de tabelas sem ela) e guardar os áudios à parte (já existem como .mp3 no git via `exportar-gravacoes`, ou mover os blobs para o R2 em vez do D1). Conferir também se o e-mail de falha saiu (o passo depende de RESEND_API_KEY). Rodar `ensaiar` depois.
**Complexidade:** Pequena | **Claude corrige sozinho?:** Revisar antes

### SEC-A-002 | Prioridade: P2 | Confiança: CONFIRMADO
**Local:** worker/src/api/auth.js:426 e 454-455 (`estourou`, só leitura) com o gasto em 463-465

**Problema:** os tetos de ERRO do login (20 erros/h por IP, 5/min por e-mail+IP, 30/min por e-mail) decidem por uma LEITURA e só gastam depois da falha. Requisições paralelas leem todas "abaixo do teto" e passam. É exatamente o defeito que o comentário de `throttled` (db.js:835-847) diz ter corrigido, mas `estourou` reintroduz a leitura que autoriza.
**Evidência:** 40 senhas erradas em paralelo, mesmo IP (`CF-Connecting-IP: 10.99.99.2`), mesmo e-mail:
`40 401` (todas avaliadas), e só depois `429 rate-limited-hora`. Projetado: 5 por minuto e 20 por hora.
**Por que importa:** por IP o teto real passa a ser o `login-h` atômico (60/h, 3× o desenhado). Por e-mail, com muitos IPs em rajada, o teto de 30/min deixa de existir. Combinado com senha mínima de 8 caracteres sem lista de senhas vazadas e PBKDF2 a 25k (SEC-001 antigo), é o caminho de credential stuffing contra contas que compraram.
**Impacto no cliente:** conta tomada, curso usado por terceiro, aparelhos do dono derrubados (limite de 3).
**Correção sugerida:** fazer o teto de erro reservar a vaga antes de verificar a senha (`throttled` atômico, e devolver a vaga no sucesso), ou usar um contador atômico por e-mail de "tentativas em voo". Avaliar lista de senhas comuns no cadastro.
**Complexidade:** Pequena | **Claude corrige sozinho?:** Sim

### SEC-A-003 | Prioridade: P2 | Confiança: CONFIRMADO
**Local:** worker/src/api/auth.js:314 (`name` livre) → lib/mail.js:162 (`Oi, ${nome}.`) no e-mail de confirmação, de senha (109), de compra e no aviso ao dono (225)

**Problema:** o campo nome do cadastro entra cru no texto dos e-mails que saem do domínio verificado. Quem cria uma conta com o e-mail de outra pessoa escolhe a primeira frase da mensagem que ela recebe.
**Evidência:** `POST /api/auth/signup` com `name: "Sua conta foi bloqueada. Regularize em https://pagamento-hebraico.example/pix agora..."` e e-mail `vitima-a1-9172@example.org`. Em /tmp/claude-0/emails.jsonl: assunto "Confirme seu e-mail - Hebraico Fluente", texto começando com
`Oi, Sua conta foi bloqueada. Regularize em https://pagamento-hebraico.example/pix ag.` (o nome é cortado em 80 caracteres, o que ainda cabe uma URL). O HTML é escapado, mas o texto puro e o link viram clicáveis na maioria dos clientes. Depois, `forgot` repete o nome a cada pedido (5/h por endereço).
**Por que importa:** phishing assinado com DKIM do próprio curso, perfeito para golpe de "PIX pendente"; queima a reputação do remetente.
**Impacto no cliente:** aluno ou não aluno recebe golpe vindo de contato@hebraicofluente.com.br.
**Correção sugerida:** limitar o nome a letras, espaços e pontuação de nome (sem `/`, `:`, `.` seguidos de domínio, sem dígitos em sequência) e/ou não usar o nome nos e-mails enviados antes de o endereço ser confirmado (confirmação e senha com "Oi." fixo).
**Complexidade:** Mínima | **Claude corrige sozinho?:** Sim

### SEC-A-004 | Prioridade: P2 | Confiança: PRECISA VERIFICAÇÃO MANUAL
**Local:** .github/workflows/deploy-app.yml; app/src/lib/content.ts:289-317

**Problema:** o workflow manual "Deploy app to Pages" faz o build SEM `NEXT_PUBLIC_PLATFORM_API=worker`. Nesse modo o `if` de content.ts importa os 11 JSON pagos para o pacote, e a ação publica tudo no GitHub Pages, sem portão. É um botão que publica o curso inteiro de graça.
**Evidência:** deploy-app.yml só tem `NEXT_PUBLIC_BASE_PATH` no build; content.ts:289 `if (process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker') { ... import('@content/letters.json') ...}`. Histórico (API do GitHub): 39 execuções com sucesso, a última em 19/09/2026 23:07 (run 35475227161). Não há passo que despublique. Daqui não deu para abrir moshikgueta.github.io (proxy). A auditoria de 28/09 registrou o repositório como privado no plano Free, caso em que o GitHub normalmente despublica o Pages; não confirmado.
**Por que importa:** se o site de 19/09 ainda estiver no ar, é um bypass total do conteúdo pago (vira P0). Mesmo fora do ar, qualquer clique futuro em "Run workflow" (ou o repo virar público/Pro) republica o curso.
**Impacto no cliente:** curso inteiro gratuito e indexável num endereço público.
**Correção sugerida:** abrir https://moshikgueta.github.io/hebraicofluente/licao/alef/ fora deste ambiente; em Settings → Pages, "Unpublish site"; apagar deploy-app.yml (e DEPLOY.md, ou marcá-lo como histórico).
**Complexidade:** Mínima | **Claude corrige sozinho?:** Sim (apagar o workflow); a despublicação é clique do dono

### SEC-A-005 | Prioridade: P2 | Confiança: PRECISA VERIFICAÇÃO MANUAL
**Local:** worker/src/alertas.js; /api/health (`monitor`); INCIDENTES.md:18; scripts/backup-nuvem.sh (bucket no R2 da mesma conta)

**Problema (observabilidade e recuperação, resto de INFRA-001/002):** (a) o alerta de indisponibilidade depende de um monitor externo (UptimeRobot) consultando `"monitor":true`; nada no repositório prova que ele existe. (b) Os alertas internos cobrem pagamento, estorno e duplicidade, mas não taxa de 5xx da API, falha de login em massa nem D1 com cota esgotada. (c) O backup vive num bucket R2 da MESMA conta Cloudflare: perder/comprometer a conta leva banco e cópias juntos.
**Evidência:** grep por uptimerobot só acha INCIDENTES.md; alertas.js LIMITES lista só ações de pagamento; backup-nuvem.sh:15 "No R2, um bucket PRIVADO da mesma conta Cloudflare".
**Por que importa:** a falha do backup de 30/09 (SEC-A-001) é o exemplo: só aparece se alguém ler o e-mail da Action.
**Correção sugerida:** confirmar o monitor externo e registrar no INCIDENTES.md a URL e o contato; incluir `settle-error`/5xx e "backup sem cópia há mais de 36 h" no alerta diário; uma cópia semanal fora da Cloudflare (por exemplo, criptografada com `age` para um armazenamento de outra conta).
**Complexidade:** Pequena | **Claude corrige sozinho?:** Revisar antes

### SEC-A-006 | Prioridade: P3 | Confiança: CONFIRMADO
**Local:** worker/src/worker.js:263-276 (CSP aplicada) e 334-338 (estrita só em Report-Only)

**Problema:** SEC-003 de 28/09 continua: a CSP que vale ainda tem `script-src 'self' 'unsafe-inline'`. A versão com hashes existe, mas só em `Content-Security-Policy-Report-Only`.
**Evidência:** `curl -D - /` mostra os dois cabeçalhos; a que bloqueia tem `'unsafe-inline'`.
**Por que importa:** qualquer XSS futuro roda sem barreira. O risco hoje é contido (React escapa, único `dangerouslySetInnerHTML` é constante, `connect-src 'self'`).
**Correção sugerida:** ver os relatos (`Acesso → csp`); se limpos, promover a estrita a `Content-Security-Policy`.
**Complexidade:** Mínima | **Claude corrige sozinho?:** Revisar antes

### SEC-A-007 | Prioridade: P3 | Confiança: CONFIRMADO
**Local:** worker/src/api/auth.js:799-932 (`GET /api/health`, público)

**Problema:** SEC-010 continua: a rota pública diz `modo`, `tokenFormato`, `vendedor` (`recusado`), `emailEntregue:false`, `varredura` em minutos e `monitor`.
**Evidência:** resposta local: `"emailEntregue":false,"modo":"teste","tokenFormato":"formato-desconhecido","vendedor":"recusado","varredura":3173,"monitor":false`.
**Por que importa:** informa a um atacante quando a recuperação de senha ou a cobrança estão quebradas (janela boa para golpe de "suporte").
**Correção sugerida:** público só `{ok, monitor}`; o resto atrás de `exigirAdmin` ou de um token do monitor.
**Complexidade:** Mínima | **Claude corrige sozinho?:** Sim

### SEC-A-008 | Prioridade: P3 | Confiança: CONFIRMADO (código) 
**Local:** worker/src/api/estatisticas.js:registrar (qualquer conta logada, sem curso); worker/src/api/ab.js (anônimo, 30/min por IP)

**Problema:** as estatísticas de erro por lição e as contagens do teste A/B aceitam escrita de quem não é aluno (estatísticas) ou de qualquer visitante (A/B). Contas são grátis; 30 eventos×60 por minuto por conta.
**Por que importa:** o dono decide pedagogia e capa por esses números; uma pessoa com um script envenena os dois.
**Correção sugerida:** estatísticas só com `hasEntitlement`; A/B com teto diário por IP e só `compra` contada a partir do pedido pago no servidor.
**Complexidade:** Mínima | **Claude corrige sozinho?:** Sim

### SEC-A-009 | Prioridade: P3 | Confiança: CONFIRMADO
**Local:** package.json (raiz, `wrangler ^4.42.0`, sem lockfile); workflows com `npx --yes wrangler@4.135.0`; actions por tag (`@v4`)

**Problema (cadeia de suprimentos):** `npm audit` na raiz falha com ENOLOCK. O wrangler é fixado por versão nos scripts, mas suas dependências transitivas são resolvidas a cada execução, num passo que recebe CLOUDFLARE_API_TOKEN, MP_ACCESS_TOKEN e RESEND_API_KEY. Actions fixadas por tag móvel, não por SHA (INFRA-016 parcial).
**Correção sugerida:** package-lock.json na raiz e `npm ci` antes de usar `npx wrangler` local; fixar actions por SHA.
**Complexidade:** Pequena | **Claude corrige sozinho?:** Sim

### SEC-A-010 | Prioridade: P3 | Confiança: CONFIRMADO
**Local:** worker/src/api/content.js:52-78; worker/src/lib/marca.js; api/pay.js:desistir

**Problema:** a marca por conta só entra no `didYouKnow` das letras e nos parágrafos de cultura (caracteres de largura zero) e no `_licenca`. Letras, nikud, frases, textos, missões e bônus saem sem marca, e os caracteres invisíveis somem com um `replace(/[​‌⁠]/g,'')`. Somado à desistência automática em 7 dias com estorno (decisão legal correta), o roteiro "compra, baixa /api/content (296 KB), desiste" leva o curso inteiro sem custo e sem rastro útil.
**Por que importa:** pirataria barata; é risco de negócio, não falha de controle de acesso.
**Correção sugerida:** registrar na trilha cada /api/content por conta (já existe `access_log`) e alertar desistência com download completo; marcar também campos de maior volume (glossas, frases). Não há correção completa para conteúdo entregue em texto.
**Complexidade:** Média | **Claude corrige sozinho?:** Revisar antes

### SEC-A-011 | Prioridade: P3 | Confiança: CONFIRMADO (resumo público do Actions, se o repo for público) / PRECISA VERIFICAÇÃO MANUAL (visibilidade)
**Local:** .github/workflows/acesso.yml (`mascara`, `listar`, `pedido`)

**Problema:** o resumo mascara só o usuário (`m***@gmail.com`), mostrando domínio, id da conta, data de criação e valor de pedidos. Num repositório privado o risco é baixo; o próprio arquivo justifica a máscara por ser "público", o que a auditoria de 28/09 contradisse (INFRA-014).
**Correção sugerida:** confirmar a visibilidade; se privado, manter; se público, mascarar também o domínio e omitir datas.
**Complexidade:** Mínima | **Claude corrige sozinho?:** Sim

---

## (1) Estado dos itens da auditoria de 28/09 na minha área

| Item | Estado em 01/10 | Evidência |
|---|---|---|
| SEC-001 PBKDF2 25k | **Continua** (dívida escrita; plano Free) | crypto.js:365; wrangler.toml:137 comentado |
| SEC-002 progresso confiado ao cliente (certificado, XP) | **Continua** | progress.js:106-137 só valida forma |
| SEC-003 CSP com unsafe-inline | **Parcial**: estrita em Report-Only com nonce e hashes | SEC-A-006 |
| SEC-004 enumeração no cadastro | **Continua** (decisão escrita) | auth.js:328-332 |
| SEC-005 /api/ab sem teto de bytes | **Resolvido** | ab.js `readJson(request, 1024)` |
| SEC-006 upload de áudio lido inteiro | **Resolvido** | http.js `readBytes` em stream |
| SEC-007 cookie legado | **Continua até 15/10/2026** (some sozinho) | session.js:41 |
| SEC-008 trancar a dona do login | **Continua**, e agora com o furo de concorrência | SEC-A-002 |
| SEC-009 admin só com senha | **Resolvido**: código por e-mail, cookie `__Host-hf_admin` preso a sessão, versão e aparelho | admin.js; teste: 403 `admin-codigo` |
| SEC-010 /api/health verboso | **Continua** | SEC-A-007 |
| SEC-011 replay de webhook | **Continua, inócuo** (status sempre reconsultado) | pay.js:596-601 |
| INFRA-001 backup (P0) | **Regrediu**: implantado em 28/09, quebrado desde 30/09 | SEC-A-001 |
| INFRA-002 monitoramento (P0) | **Parcial**: batimento, `monitor`, alertas de pagamento; monitor externo não comprovado | SEC-A-005 |
| INFRA-003 deploy sem rollback | **Resolvido**: rollback automático após duas conferências falhas | cloudflare-setup.sh:817-835 |
| INFRA-004 main sem proteção | **Não verificável daqui** (repo privado no Free) | precisa do painel |
| INFRA-005 migrações | **Resolvido**: worker/migrations + tabela `migracoes` | cloudflare-setup.sh:170-197 |
| INFRA-006 SPF/DKIM/DMARC | **Não verificável daqui** | sem DNS |
| INFRA-009 limpeza de teste com token amplo | **Continua** | deploy-worker.yml:571-612 |
| INFRA-010 segredos reempurrados a cada deploy | **Continua** (design) | cloudflare-setup.sh:230-267 |
| INFRA-011 resposta a incidente | **Resolvido** (INCIDENTES.md) | arquivo existe |
| INFRA-013 trava da varredura | **Resolvido** (pegarTrava) | db.js:384 |
| INFRA-014 Pages legado | **Continua**, e é mais grave do que P3 | SEC-A-004 |
| INFRA-015 HSTS preload | **Resolvido** | cabeçalho confirmado |
| INFRA-016 actions em Node 20 / pin | **Parcial** | SEC-A-009 |

## (2) Nota da área: 78/100

Controle de acesso, sessão, CSRF, IDOR, webhook e cabeçalhos estão no nível de um produto comercial sério: nada do que tentei abriu conteúdo, dado alheio ou painel. O que impede subir a nota:
o backup está quebrado desde ontem (SEC-A-001) e precisa ser consertado antes de vender; o workflow do Pages que publica o curso inteiro precisa ser apagado e o site antigo confirmado como fora do ar (SEC-A-004); o freio do login cede a rajadas (SEC-A-002); e o campo nome vira phishing assinado (SEC-A-003).

## (3) Os 5 maiores problemas da área

1. SEC-A-001 (P1): backup diário falha desde 30/09 com SQLITE_TOOBIG (blobs de `gravacoes`); não há cópia restaurável nova.
2. SEC-A-004 (P2, vira P0 se o site de 19/09 estiver no ar): deploy-app.yml publica o curso inteiro sem portão no GitHub Pages.
3. SEC-A-002 (P2): tetos de erro do login burlados por concorrência (40 senhas avaliadas contra limite de 5/min).
4. SEC-A-003 (P2): nome do cadastro injeta texto e URL nos e-mails do domínio (phishing com DKIM).
5. SEC-A-005 (P2): monitor externo não comprovado, alertas sem 5xx/backup, cópias na mesma conta Cloudflare.
