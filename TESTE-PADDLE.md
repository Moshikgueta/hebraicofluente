# Teste do pagamento pelo Paddle (site em inglês)

O roteiro para provar a compra de ponta a ponta antes da primeira venda: no
**sandbox** do Paddle (não cobra nada) e fora do site publicado, porque a
publicação recusa chave de sandbox (`scripts/pagamento-ativo.mjs`, a mesma
regra do token `TEST-` da Mercado Pago). O código está pronto e testado
(`app/tests/paddle.test.ts`); o que este roteiro prova é a conta e o painel.

## 1. O que o dono faz no sandbox (uns 15 minutos, sem verificação)

1. Criar a conta de teste em sandbox-login.paddle.com.
2. **Developer tools > Authentication**:
   - criar uma chave da API com leitura e escrita em *transactions* e
     *adjustments*, e leitura em *event types* e *notification settings*.
     Ela começa com `pdl_sdbx_apikey_`;
   - copiar o **client-side token** (começa com `test_`).
3. **Checkout > Checkout settings**: em *Default payment link*, o endereço do
   checkout. Para o teste local, `http://localhost:8787/checkout/alfabetizacao/`;
   com o domínio, `https://<domínio>/checkout/alfabetizacao/`. Sem esse campo
   o Paddle não cria transação nenhuma (`transaction_default_checkout_url_not_set`).
4. **Developer tools > Notifications** (só com o domínio no ar): novo destino
   `https://<domínio>/api/pay/paddle`, com os eventos `transaction.completed`,
   `transaction.paid`, `adjustment.created` e `adjustment.updated`. Copiar o
   segredo (começa com `pdl_ntfset_`).
5. Mandar as três chaves ao Claude por um canal seguro, ou pô-las nos
   segredos do repositório com o nome `PADDLE_SANDBOX_API_KEY`,
   `PADDLE_SANDBOX_CLIENT_TOKEN` e `PADDLE_SANDBOX_WEBHOOK_SECRET` (nomes à
   parte, para nunca irem à publicação por engano).

## 2. O que o Claude faz com as chaves

1. `node scripts/paddle-confere.mjs` com as chaves de sandbox: a chave
   autentica, o token é do mesmo ambiente e (com o domínio) o aviso aponta
   para `/api/pay/paddle` com os quatro eventos.
2. Sobe o Worker em inglês localmente (`wrangler dev`, banco local), cria uma
   conta e faz a compra num navegador de verdade, com o cartão de teste do
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
4. Com o domínio no ar e o destino de notificação criado, repete o caminho
   pelo aviso assinado (o que um `wrangler dev` não recebe de fora).

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
