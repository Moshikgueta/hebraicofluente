# Ligar a plataforma na Cloudflare

Do zero ao ar. Sete passos, uns vinte minutos, e o único que precisa de
paciência é o do domínio.

## O caminho sem terminal

Cole dois segredos no GitHub e o resto acontece sozinho, a cada push.

GitHub → o repositório → **Settings → Secrets and variables → Actions → New
repository secret**:

| Nome | Onde achar |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Painel da Cloudflare → ícone da conta → *API Tokens* → *Create Token* → modelo **Edit Cloudflare Workers**, e acrescente **`D1:Edit`** nas permissões |
| `CLOUDFLARE_ACCOUNT_ID` | Painel → Workers & Pages → coluna da direita, *Account ID* |

O `D1:Edit` não é opcional: sem ele o Action publica o Worker e falha ao criar
o banco, que é a metade que guarda as contas.

A partir daí, todo push roda os testes e executa
`scripts/cloudflare-setup.sh` dentro do Action — que cria o banco se não
existir, aplica o esquema, gera o `SESSION_SECRET`, publica, acerta o
`SITE_ORIGIN` e roda as quinze verificações contra o que subiu. O resultado
aparece no resumo da execução, sem precisar abrir log.

Uma pendência fica: a edição do `wrangler.toml` acontece dentro do runner, que
some no fim. Funciona a cada execução porque o script relê o id do banco de
verdade — mas o arquivo do repositório continua com o valor de exemplo. O
script avisa disso no fim, e vale commitar o id uma vez.

---

## O caminho curto

```bash
npx wrangler login                  # abre o navegador, autoriza a conta
bash scripts/cloudflare-setup.sh    # faz o resto
```

O script cria o banco, cola o `database_id` no `wrangler.toml`, aplica o
esquema, gera o `SESSION_SECRET`, constrói o site, publica, acerta o
`SITE_ORIGIN` com a URL que saiu e roda as quinze verificações contra o que
subiu.

Pode rodar quantas vezes quiser: cada passo confere antes de agir e pula o que
já estava feito. Quando falha, ele diz **o que** falhou e **o que fazer** —
e continua de onde parou na próxima vez.

Depois disso, commite a única coisa que ele mudou no repositório:

```bash
git add wrangler.toml && git commit -m "database_id e SITE_ORIGIN"
```

Sem esse commit, a publicação pelo GitHub Actions volta a falhar no binding do
D1 — o `database_id` ficaria só na sua máquina.

Os passos abaixo são o que o script faz, um a um, para quando você quiser
entender ou consertar alguma coisa na mão.

---

## 1. Criar o banco

```bash
npx wrangler d1 create hebraico-fluente
```

A resposta termina com um bloco assim:

```
[[d1_databases]]
binding = "DB"
database_name = "hebraico-fluente"
database_id = "0f2a…"
```

Copie o `database_id` e cole em `wrangler.toml`, no lugar de
`PREENCHER-COM-O-ID-DE-wrangler-d1-create`. É a única linha do arquivo que
precisa mudar.

## 2. Criar as tabelas

```bash
npm run db:init
```

Isso aplica `worker/schema.sql` no banco remoto. Roda quantas vezes quiser —
tudo é `CREATE TABLE IF NOT EXISTS`.

## 3. Publicar uma primeira vez

```bash
npm run deploy
```

Ele constrói o app em modo plataforma (`NEXT_PUBLIC_PLATFORM_API=worker`) e
publica. No fim, o wrangler imprime a URL:
`https://hebraico-fluente.<sua-conta>.workers.dev`.

**Ela ainda não funciona direito**, e é esperado: faltam os segredos. Guarde a
URL — os próximos dois passos precisam dela.

## 4. Os segredos

Painel da Cloudflare → **Workers & Pages → hebraico-fluente → Settings →
Variables and Secrets** → *Add* → tipo **Secret** (não *Text*: *Text* aparece
em tela e em log).

| Nome | O que é |
|---|---|
| `SESSION_SECRET` | Assina o cookie de sessão. Gere com `openssl rand -base64 48`. Trocar depois desloga todo mundo na hora. |
| `MP_ACCESS_TOKEN` | Mercado Pago → Suas integrações → a aplicação → Credenciais. |
| `MP_WEBHOOK_SECRET` | Mercado Pago → a aplicação → Webhooks → "Assinatura secreta". |

Pela linha de comando, se preferir:

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put MP_ACCESS_TOKEN
npx wrangler secret put MP_WEBHOOK_SECRET
```

⚠ Nenhum desses três nomes pode aparecer também em `wrangler.toml`. Cada
publicação reaplica a lista `[vars]` de lá, e um nome repetido nos dois faz a
publicação falhar. O motivo está escrito no próprio arquivo.

## 5. A Mercado Pago

**Credenciais.** Em https://www.mercadopago.com.br/developers → *Suas
integrações* → crie (ou abra) a aplicação → *Credenciais*. Existem dois pares:

- **teste** — o token começa com `TEST-`. Use enquanto estiver montando.
  Deixe `MP_SANDBOX = "1"` em `wrangler.toml`.
- **produção** — use quando for vender de verdade, e troque para
  `MP_SANDBOX = "0"`.

Subir o token de produção esquecendo `MP_SANDBOX = "1"` manda todo comprador
para um checkout que **não cobra**, e isso passa despercebido por semanas.

**Webhook.** Na mesma aplicação → *Webhooks* → *Configurar notificações*:

- URL: `https://<a-url-do-passo-3>/api/pay/webhook`
- Evento: **Pagamentos** (`payment`)
- Copie a *assinatura secreta* para `MP_WEBHOOK_SECRET` (passo 4).

Sem esse segredo, `/api/pay/webhook` recusa tudo. É de propósito: um webhook
sem verificação é uma rota pública que libera curso.

## 6. Dizer ao site onde ele mora

Em `wrangler.toml`, `SITE_ORIGIN` precisa ser a URL de verdade. O cron não tem
requisição de onde deduzi-la.

```toml
SITE_ORIGIN = "https://hebraico-fluente.<sua-conta>.workers.dev"
```

Depois `npm run deploy` de novo.

### Domínio próprio (opcional, mas faça)

Painel → o Worker → **Settings → Domains & Routes → Add → Custom domain**, e
aponte `hebraicofluente.com.br`. A Cloudflare cuida do certificado. Feito isso,
volte e atualize:

- `SITE_ORIGIN` em `wrangler.toml`,
- a URL do webhook no painel da Mercado Pago.

## 7. Publicar sozinho a cada push

É **O caminho sem terminal**, no topo deste arquivo. Sem os dois segredos, o
job avisa e pula — não quebra.

---

## Quando a publicação não vai

Cada uma destas já parou um primeiro deploy. A mensagem do wrangler à esquerda,
o que ela realmente quer dizer à direita.

**`Couldn't find a D1 DB with the name or binding` / `database_id` inválido**
O `wrangler.toml` está com o `database_id` de exemplo
(`PREENCHER-COM-O-ID-DE-...`) ou com o id de outra conta. É a causa mais comum
de todas. `bash scripts/cloudflare-setup.sh` resolve — e **commite o
`wrangler.toml` depois**, senão o GitHub Actions falha igual, porque para ele o
arquivo do repositório é o que vale.

**`You need to register a workers.dev subdomain`**
O Worker subiu, mas a conta nunca escolheu um subdomínio, então ele não tem
endereço. Painel → Workers & Pages → Overview → escolha o seu. Depois publique
de novo.

**`ENOENT: no such file or directory, scandir './app/out'`**
O site não foi construído antes de publicar. `npm run deploy` faz as duas
coisas na ordem certa; `npx wrangler deploy` sozinho, não.

**`Running configuration file ... contains duplicate binding` ou
`The following secrets are also defined as vars`**
Um nome está em `wrangler.toml` **e** nos segredos do painel. Cada publicação
reaplica a lista `[vars]` do arquivo, e o choque derruba tudo.
`SESSION_SECRET`, `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` vivem **só** no
painel. Apague do `wrangler.toml` e republique.

**`Authentication error [code: 10000]`**
O token não tem alcance suficiente. O modelo *Edit Cloudflare Workers* cobre o
Worker e os ativos, mas **não** cobre D1 em algumas contas — acrescente
`D1:Edit` ao token. Se o erro for no GitHub Actions, confira também
`CLOUDFLARE_ACCOUNT_ID`: um id errado dá exatamente esta mensagem.

**`workers.dev` responde 522, 1101 ou 500 em tudo**
O Worker subiu e está quebrando em execução. Veja o motivo ao vivo:

```bash
npx wrangler tail
```

Quase sempre é `SESSION_SECRET` ausente (todo `/api/*` que toca sessão falha)
ou o esquema não aplicado (`no such table: accounts`). `npm run db:init`
resolve o segundo.

**O site abre, mas `/licao/alef/` também abre sem login**
`run_worker_first = true` saiu do `[assets]` no `wrangler.toml`. Sem ele os
arquivos são servidos antes de o Worker rodar, e o portão nunca é consultado.

**A publicação passa, mas o site continua velho**
Cache de borda. Force com uma aba anônima ou
`curl -H 'Cache-Control: no-cache'`. Se persistir, confirme que publicou o
Worker certo: `npx wrangler deployments list`.

**O Actions diz "pulando a publicação"**
`CLOUDFLARE_API_TOKEN` não está nos segredos do repositório. Não é falha do
deploy — é o job avisando que não tem como publicar. Passo 7 acima.

### Quando nada disso for

Rode e me mande a saída — ela diz em qual dos oito passos parou e por quê:

```bash
bash scripts/cloudflare-setup.sh 2>&1 | tail -40
```

---

## Conferir se ficou de pé

```bash
HF_BASE=https://<sua-url> bash worker/e2e.sh
```

Quinze verificações do que não pode estar errado: quem entra, quem é barrado,
o preço que o servidor calcula, o acesso que vence, o webhook sem assinatura.

Na mão, o essencial:

```bash
curl -i https://<sua-url>/api/me          # 401 {"error":"not-signed-in"}
curl -i https://<sua-url>/licao/alef/     # 302 para /entrar/
curl -i https://<sua-url>/               # 200, a página de vendas
```

**O teste que importa de verdade** é uma compra inteira com as credenciais de
teste da Mercado Pago: criar conta → PIX → pagar no simulador → o acesso
aparecer sozinho. Se o acesso não sair em cinco minutos, a varredura do cron
pega — e `worker/src/reconcile.js` explica por que ela existe.

---

## Rodar tudo na sua máquina antes

```bash
cp .env.example .dev.vars        # preencha SESSION_SECRET com qualquer coisa
npm run db:init:local
npm run build:platform
npx wrangler dev --local --port 8787
```

Em outro terminal: `bash worker/e2e.sh`.

Com token falso da Mercado Pago tudo funciona menos cobrar — e criar um pedido
falha limpo com 502, deixando o pedido registrado. É assim que tem de ser.

---

## Operação

**Dar acesso a alguém na mão** (um aluno que pagou por fora, um teste, um
brinde):

```bash
npx wrangler d1 execute hebraico-fluente --remote --command \
  "INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
   VALUES (<id>, 'alfabetizacao', unixepoch()*1000, unixepoch()*1000 + 31536000000, 'MANUAL')"
```

**Tirar acesso depois de um estorno.** Devolver o dinheiro no painel da Mercado
Pago **não fecha a porta**. A segunda metade é obrigatória:

```bash
npx wrangler d1 execute hebraico-fluente --remote --command \
  "DELETE FROM entitlements WHERE account_id = <id> AND course_slug = 'alfabetizacao'"
```

Fecha na hora — o cookie de sessão não carrega direito nenhum.

**Achar uma conta:**

```bash
npx wrangler d1 execute hebraico-fluente --remote --command \
  "SELECT id, email, name FROM accounts WHERE email = 'alguem@exemplo.br'"
```

**Ver o que aconteceu com um pedido:**

```bash
npx wrangler d1 execute hebraico-fluente --remote --command \
  "SELECT id, status, amount_cents, method, created_at, paid_at FROM orders
   WHERE account_id = <id> ORDER BY created_at DESC"
```

E a trilha, que responde "por que essa pessoa perdeu o curso?" três meses
depois:

```bash
npx wrangler d1 execute hebraico-fluente --remote --command \
  "SELECT * FROM access_log ORDER BY created_at DESC LIMIT 30"
```

---

## O que isto ainda não faz

- **Recuperação de senha.** Não existe. Quem esquecer escreve para o e-mail de
  contato, e a página de login diz isso em vez de oferecer um botão que não
  funciona. Precisa de um provedor de e-mail antes de existir.
- **E-mail de confirmação de compra.** Mesmo motivo. O acesso é liberado na
  hora e a tela diz isso, então nada fica preso — mas uma compra sem recibo por
  e-mail gera contato de suporte.
- **Proteção do conteúdo.** O portão recusa as rotas pagas; o conteúdo do curso
  ainda viaja dentro do pacote JavaScript. Ver `app/ARCHITECTURE.md` §11.4 —
  não descreva isto a ninguém como proteção de conteúdo.
- **Sincronizar progresso entre aparelhos.** O acesso viaja com a conta; o
  progresso ainda é do navegador.
