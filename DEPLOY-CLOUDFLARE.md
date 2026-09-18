# Ligar a plataforma na Cloudflare

Do zero ao ar. Sete passos, uns vinte minutos, e o único que precisa de
paciência é o do domínio.

Tudo acontece na raiz do repositório. Antes de começar:

```bash
npm install          # instala o wrangler
npx wrangler login   # abre o navegador e autoriza a sua conta
```

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

GitHub → o repositório → **Settings → Secrets and variables → Actions → New
repository secret**:

| Nome | Onde achar |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Painel → ícone da conta → *API Tokens* → *Create Token* → modelo **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Painel → Workers & Pages → coluna da direita, *Account ID* |

A partir daí, todo push em `main` que toque `app/`, `data/`, `worker/` ou
`wrangler.toml` roda os testes e publica
(`.github/workflows/deploy-worker.yml`). Sem o token, o job avisa e pula — não
quebra.

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
