# Teste do pagamento pelo Paddle (site em inglês)

O roteiro para provar a compra de ponta a ponta antes da primeira venda, no
**sandbox** do Paddle (não cobra nada). Enquanto o site não tem domínio
(`SITE_ORIGIN` no workers.dev), a publicação aceita a chave de sandbox e o
teste roda no próprio site publicado, aviso assinado incluído (decisão do dono,
29/10/2026; `semDominio` em `scripts/pagamento-ativo.mjs` e a mesma regra em
`worker/e2e.sh`). Com o domínio, a chave de sandbox volta a parar a publicação,
como o token `TEST-` da Mercado Pago. O código está pronto e testado
(`app/tests/paddle.test.ts`, `app/tests/paddle-sandbox.test.ts`).

## 1. O que o dono faz no sandbox (uns 15 minutos, sem verificação)

1. Criar a conta de teste em sandbox-login.paddle.com.
2. **Developer tools > Authentication**:
   - criar uma chave da API com leitura e escrita em *transactions* e
     *adjustments*, e leitura em *event types* e *notification settings*.
     Ela começa com `pdl_sdbx_apikey_`;
   - copiar o **client-side token** (começa com `test_`).
3. **Checkout > Checkout settings**: em *Default payment link*, o endereço do
   checkout: `https://fluent-hebrew.moshikg10.workers.dev/checkout/alfabetizacao/`
   (com o domínio, `https://<domínio>/checkout/alfabetizacao/`). Sem esse campo
   o Paddle não cria transação nenhuma (`transaction_default_checkout_url_not_set`).
4. **Developer tools > Notifications**: novo destino
   `https://fluent-hebrew.moshikg10.workers.dev/api/pay/paddle`, com os eventos `transaction.completed`,
   `transaction.paid`, `adjustment.created` e `adjustment.updated`. Copiar o
   segredo (começa com `pdl_ntfset_`).
5. Nos segredos do repositório (Settings > Secrets and variables > Actions):
   `PADDLE_API_KEY` (a `pdl_sdbx_apikey_...`) e `PADDLE_WEBHOOK_SECRET` (a
   `pdl_ntfset_...`). O token `test_...` é público: vai em
   `PADDLE_CLIENT_TOKEN` no `wrangler.toml`. A próxima publicação liga o
   checkout de teste.

## 2. O que o Claude faz com as chaves

1. `node scripts/paddle-confere.mjs` com as chaves de sandbox: a chave
   autentica, o token é do mesmo ambiente e (com o domínio) o aviso aponta
   para `/api/pay/paddle` com os quatro eventos.
2. Depois da publicação com as chaves de sandbox, o dono cria uma conta no
   site publicado e faz a compra num navegador de verdade, com o cartão de teste do
   Paddle (4242 4242 4242 4242, validade futura, CVC 100: conferir na
   documentação do Paddle no dia, porque eles mudam esses números).
3. Confere, nesta ordem:
   - o checkout abre por cima da página, em dólar, US$ 47 com o imposto
     dentro;
   - a volta do pagamento libera o curso sem esperar o aviso (`/api/pay/verify`);
   - o recibo em inglês sai, com o valor em dólar e a linha do Paddle;
   - "Cancel the purchase" em Your account pede o estorno ao Paddle na hora;
   - quando o Paddle aprova o estorno, o acesso fecha e o e-mail de estorno sai;
   - a varredura (`reconcile.js`) libera uma compra cujo aviso não chegou.
4. O aviso assinado chega ao site publicado (o destino de notificação do
   passo 4 da seção 1): o pedido fica `paid` mesmo sem a volta do comprador.

## 3. Para a primeira venda de verdade

1. A conta de **produção** do Paddle verificada: eles olham o site no ar
   (domínio, preço, Termos, Privacidade e Reembolso em inglês, um contato),
   então isso vem depois do domínio e da leitura do advogado.
2. Repetir os passos 2 a 4 da seção 1 no painel de produção: chave
   `pdl_live_`, token `live_`, o mesmo checkout e o mesmo destino.
3. Nos segredos do repositório: `PADDLE_API_KEY` e `PADDLE_WEBHOOK_SECRET`; no
   `wrangler.toml`, `PADDLE_CLIENT_TOKEN = "live_..."`.
4. `node scripts/paddle-confere.mjs` com as chaves de produção, e então ligar
   `FLUENT_PUBLICAR`.
5. Conta para receber os repasses (a da empresa) e a nota de exportação de
   serviço com o contador antes da primeira cobrança.
