# Hebraico Fluente - notas do projeto

## Escrita: nada de travessão
O texto do site, dos comentários, dos commits e da documentação usa **hífen `-`**.
Nunca o travessão (U+2014) nem a meia-risca (U+2013), nem as formas escapadas
delas (`\u` seguido do código). Este arquivo cita os dois só pelo número de
propósito: escrever o caractere aqui faria a própria verificação abaixo
acusar o documento que explica a regra.

Travessão é a assinatura mais visível de texto gerado por IA, e este
projeto é vendido como material de um autor. A regra vale para:

- todo arquivo sob `app/`, `data/`, `worker/`, `scripts/`, `tools/`, `.github/`
- os `.md` da raiz, `wrangler.toml`, `.env.example`
- **os geradores**, não só a saída: `tools/export-content.mjs` escreve o cabeçalho
  de `app/src/lib/audio-manifest.ts`, então um travessão lá volta a cada
  `npm run export-content`

Verificação (o locale importa, senão a contagem sai em bytes):

```sh
LC_ALL=C.UTF-8 grep -rlP '\x{2014}|\x{2013}' \
  --exclude-dir={node_modules,.next,out,dist,.git,.wrangler} .
grep -rn 'u2014\|u2013' --exclude-dir={node_modules,.next,out,dist,.git,.wrangler} .
```

As duas linhas têm de sair vazias. As réguas de caixa (`─`, U+2500) dos
cabeçalhos de comentário não são travessões e ficam como estão.

## Onde mora o quê
- `data/*.json` é a fonte. `app/content/` e `app/src/lib/audio-manifest.ts` são
  **gerados** por `npm run export-content` - editar a saída é perder o trabalho no
  próximo build.
- `data/courses.json` é o catálogo: uma linha por curso, e é dele que saem
  `/cursos`, cada página de curso e **o preço cobrado**. O servidor lê o mesmo
  arquivo (`worker/src/lib/catalog.js`): preço nunca vem do corpo da requisição.
- `worker/` é a API (`/api/*`) e o portão do conteúdo pago. `IMPLEMENTATION` da
  camada de comércio: `DEPLOY-CLOUDFLARE.md` + `worker/schema.sql`.

## Invariantes que quebram o produto se forem ignorados
- **Noto Sans Hebrew é obrigatória** para todo hebraico: são 55 sinais de nikud e
  uma tabela `ccmp`. Fonte que posiciona vogal errado torna todo exercício de
  leitura errado.
- **`<He>` é a única porta de entrada para hebraico.** `unicode-bidi: isolate`,
  e pontuação nunca dentro do span hebraico.
- **Regra da ordem:** nenhuma palavra usa letra que ainda não foi ensinada.
  `npm run validate` cobra isso.
- **Limite de 10 ms de CPU** por requisição no plano gratuito do Workers. É por
  isso que o PBKDF2 roda 25.000 iterações (`worker/src/lib/crypto.js`) e não
  310.000. `wrangler dev` não aplica o limite: o erro só aparece em produção.
- **A fusão de progresso é monotônica** (`app/src/lib/state/merge.ts`). Todo
  campo tem um "mais adiantado dos dois" e é ele que fica; contagem é MÁXIMO e
  nunca soma, senão o mesmo dia sincronizado duas vezes dobra o XP. É essa
  propriedade que deixa o adaptador repetir a fusão depois de um 409 sem medo
  de desfazer alguma coisa. Um campo novo no estado precisa de uma regra aqui,
  e de um teste em `app/tests/merge.test.ts`.

## Estado da operação (19/09/2026)
O que está LIGADO em produção, porque um documento que descreve a intenção em
vez do estado manda quem lê procurar no lugar errado:

- **Endereço:** `hebraicofluente.com.br`, com o `*.workers.dev` de conferência.
- **Pagamento: MERCADO PAGO pedida, resolvida a cada publicação.**
  `pagamento.modo` em `data/empresa.json` está em `mercadopago` e diz como se
  QUER cobrar. Quem decide o que VAI ao ar é `scripts/pagamento-ativo.mjs`, um
  passo do deploy que roda **antes do build** e pergunta à Mercado Pago
  (`/users/me`) se a credencial publicada autentica:
  - autenticou → publica em `mercadopago`: PIX, cartão, parcelamento e
    confirmação automática;
  - não autenticou → reescreve o modo para `pix-direto` **só naquela
    execução** (o repositório não muda) e diz no resumo por quê. O site vende
    por PIX em vez de recusar toda compra.

  É o mesmo arquivo dos dois lados - o build do site, que decide o que
  oferecer, e o bundle do Worker, que decide o que criar -, e é por isso que a
  página nunca oferece cartão enquanto o servidor só sabe fazer PIX.
- **Desde 19/09/2026 a credencial autentica** e o que está no ar é a Mercado
  Pago: PIX, cartão, parcelamento e confirmação automática. O caminho até aqui,
  porque o sintoma vai voltar se a chave for trocada de novo: o segredo
  carregava a **Public Key**, e a resposta que encerrou a dúvida foi
  `400 {"message":"invalid_token"}` - um 400, não um 401, que lido pelo código
  mandaria procurar erro na chamada. Os dois valores começam com `APP_USR-`; o
  Access Token tem números com hífens, a Public Key tem o desenho de um UUID.
- **O PIX direto continua pronto**, como rede por baixo: BR Code gerado por nós
  (`worker/src/lib/pix.js`) a partir da chave do CNPJ, sem adquirente nem
  gateway. É para onde a publicação cai sozinha se a credencial parar de
  autenticar - e lá **nada confirma o pagamento sozinho**: a liberação é à mão
  em Actions → Acesso → `liberar`, depois de olhar o extrato.
- **Ainda não provado em produção:** que uma cobrança REAL nasce. O e2e pula a
  criação quando o token é de produção, de propósito (senão cada publicação
  deixaria um PIX pendente no painel). A prova é uma compra de verdade; o que
  ela deu está em Actions → Acesso → `pagamento`, que lê `pay-create-failed`
  com o motivo que a Mercado Pago devolveu.
- **E-mail: LIGADO.** Resend, com `EMAIL_FROM` no `wrangler.toml` e
  `RESEND_API_KEY` nos segredos do repositório.
- **Ainda por conferir:** a assinatura do webhook da Mercado Pago contra uma
  notificação real. Não é bloqueante hoje (o webhook não é usado no PIX
  direto), e quando a Mercado Pago voltar o acesso continua tendo três caminhos
  independentes: webhook, `/api/pay/verify` na volta do comprador, e a
  varredura de 5 em 5 min em `worker/src/reconcile.js`.

**O que o site promete tem de ser o que o site faz.** O modo resolvido muda
texto corrido em nove páginas - rodapé, capa, página do curso, FAQ,
Termos, Privacidade, Reembolso, Suporte e o próprio checkout - e o tipo de
defeito que isso gera é silencioso: o build passa, a página fica bonita, e o
rodapé segue oferecendo "cartão em até 12x" numa loja que só processa PIX.
`npm run pagamento` (em `app/`) lê o modo, abre as nove páginas num navegador e
falha na frase que o modo não cumpre; leva o checkout até o código PIX e
confere o prazo prometido a quem já pagou. Rodar depois de mexer no modo.

**Operação sem terminal:** aba Actions → **Acesso**. `liberar` e `revogar`
mexem no acesso de alguém - e no PIX direto `liberar` **não é exceção, é o
processo**: é assim que cada compra vira acesso. `revogar` é a metade que se
esquece depois de um estorno: devolver o dinheiro NÃO tira o curso.
`consultar`, `listar`, `envios` e `pagamento` só leem - `envios` mostra o
motivo que a Resend devolveu quando um e-mail de senha não saiu, e `pagamento`
mostra os pedidos que falharam, com a razão que o provedor deu.

## Auditoria de segurança (20/09/2026)
`SECURITY-AUDIT.md` é o relatório: dez agentes independentes, achados com
arquivo:linha, o que foi consertado e o que foi deixado como proposta. As
regras que ele fixou e que valem para todo commit daqui em diante:

- **Nenhuma decisão de acesso lê cabeçalho que o cliente escreve.** O portão
  (`worker/src/gate.js`) autentica TODA rota paga; `Sec-Fetch-Dest` só decide
  a forma da recusa. Foi um `curl -H 'Sec-Fetch-Dest: empty'` que abria a aula.
- **O conteúdo do curso não pode voltar para o pacote público.** Desde
  20/09/2026 ele sai de `/api/content`, atrás do cookie E do direito de acesso
  no banco. Quem importa os seis JSONs é `lib/content-servidor.ts`, e só
  componente de SERVIDOR pode lê-lo; o navegador lê o depósito de
  `lib/content.ts`, que nasce vazio. Um import estático novo em código de
  cliente desfaz tudo em silêncio - é o que `npm run pacote` (no deploy, contra
  o export publicado) e `tests/conteudo.test.ts` existem para impedir.
- **O repositório é público, e o resumo de cada execução do Actions também.**
  `acesso.yml` mascara todo e-mail que imprime (`mascara`); a trilha
  (`access_log`) não recebe e-mail; `payment_events` guarda só a projeção
  `enxuto()` do pagamento. Nada novo pode imprimir dado de cliente num resumo.
- **Freios decidem pela escrita atômica** (`throttled`: `INSERT ... ON CONFLICT
  ... RETURNING hits`); a leitura prévia só poupa a escrita de quem já estourou
  e nunca autoriza - ler e depois gravar deixava uma rajada em paralelo passar
  inteira. O do login conta só falhas, e vem ANTES de ler o corpo. Um freio que
  grava a cada tentativa barrada é o próprio amplificador.
- **Toda resposta sai por `blindar()`** (`worker.js`): página, API, 301, 302 do
  portão. Um caminho de resposta novo não pode contornar isso.
- **Escrita na API só da própria origem** (`worker.js`), webhook à parte.
- **A correção do pagamento está aplicada** (decisão do dono, 20/09/2026):
  chave do evento `id:status`, estorno (inclusive parcial) recua os meses do
  pedido, direito antes do pedido sem conceder duas vezes, renovação em 45
  dias, 404 do provedor não pede reenvio, logout invalida em todo aparelho.
  `app/tests/pagamento.test.ts` guarda os nove cenários; `audit/README.md` é o
  registro, com as duas decisões de produto embutidas (estorno parcial fecha o
  acesso; sair derruba todos os aparelhos) e o que conferir em produção.
- **Um convite não vira curso sozinho.** Cadastro num endereço presenteado
  AVISA o dono (e-mail para `SUPPORT_EMAIL`, um por endereço por dia) e não
  concede nada; o dono confirma com `liberar`. Quem se cadastrou não é
  informado de que havia presente. Ver a nota em `worker/src/lib/db.js`,
  acima de `invitesPendentes`.
- **A cota do D1 é superfície de ataque** (auditoria de 24/09/2026, medida
  contra o D1 local). No plano gratuito são 500 MB e 100.000 linhas escritas
  por dia, e banco cheio ou cota vencida é TODA escrita falhando - login,
  cadastro, pagamento. Duas regras saíram daí:
  - **Só conta com curso grava progresso** (`PUT /api/progress` → 403
    `sem-curso`, conferido antes do freio). Antes, mil contas grátis de 512 KB
    enchiam o banco. O app trata o 403 como "o aparelho guarda", igual a
    estar deslogado (`lib/state/worker.ts`).
  - **Toda rota que escreve tem teto por HORA por endereço**, conferido
    antes do freio do minuto, e recusa não escreve nada: login 20 erros e 60
    tentativas, cadastro 10, esqueci a senha 10, redefinir 20, saúde 30,
    checkout 10, e 20 somando as rotas da conta (senha, apagar, confirmar e
    reenviar o e-mail) - conta é de graça, então freio só por conta não
    segura. Falha de login contra e-mail inventado não vai para a trilha.
    Uma máquina passou de ~17.000 linhas por HORA para ~17.000 por DIA; a
    cota ainda acaba com uns seis endereços o dia inteiro, e o conserto de
    verdade é o Workers Paid. Rota nova que escreve nasce com teto por hora.
    `tests/auditoria.test.ts` ("a cota de escrita e o tamanho do banco")
    conta as linhas com `total_changes()`.
- **O horizonte da faxina do freio precisa ser maior que a maior janela em
  uso** (`throttled`, hoje 48h contra uma janela máxima de 24h). Menor, e a
  limpeza apaga a linha que a própria chamada acabou de criar - o freio
  conta até um para sempre.
- **O backup é local e é segredo:** `npm run db:backup`, e
  `npm run db:backup:ensaio` prova que a cópia restaura. Nunca num artefato
  do Actions - tem e-mail e hash de senha de todo aluno.
- `npm run csp` prova a CSP num navegador; `app/tests/auditoria.test.ts`
  guarda cada ataque fechado. Um achado novo entra lá antes do conserto.

## Conta e senha
Criar conta, entrar, sair, **esquecer a senha** e **trocar a senha** - tudo em
`worker/src/api/auth.js`, com as consultas em `worker/src/lib/db.js`.

Três regras que parecem excesso de zelo e são o produto:

- **`/api/auth/forgot` responde igual para e-mail que existe e que não existe**,
  e o envio sai por `ctx.waitUntil` para que o RELÓGIO também não responda. Sem
  as duas coisas, o formulário de recuperação vira uma lista de quem comprou,
  consultável por qualquer um. A tela (`components/platform/EsqueciSenha.tsx`)
  diz "se existir uma conta com esse e-mail" pelo mesmo motivo - uma tela mais
  simpática desfaz sozinha o que o servidor protege.
- **O banco guarda o sha256 do token, nunca o token** (`password_resets`, e o
  hash é a chave primária). Quem lê a tabela não consegue trocar a senha de
  ninguém.
- **Trocar a senha sobe `session_version`**, o que derruba todo cookie já
  emitido, e a resposta traz um cookie novo. É uma consulta só
  (`changePassword` em `lib/db.js`): trocar a senha porque alguém entrou na
  conta e não expulsar esse alguém é não ter trocado nada.

O link do e-mail sai de `SITE_ORIGIN`, **nunca do cabeçalho Host** - o Host é
escolhido por quem chama, e um pedido forjado faria a plataforma mandar, para o
endereço certo do dono, um e-mail legítimo com o token dentro.

Entregar o e-mail é a Resend (`worker/src/lib/mail.js`): `RESEND_API_KEY` no
painel, `EMAIL_FROM` no `wrangler.toml`, e os dois precisam existir -
`/api/health` reporta `email`. **Sem eles o site funciona inteiro e ninguém
recupera senha sozinho**, então isso fica fora do `ok` da saúde e aparece como
aviso no `e2e.sh`. Como conseguir a chave está em `.env.example`.

"A chave existe" e "o e-mail chega" são **duas perguntas**, e a saúde responde
as duas: `email` (configurado) e `emailEntregue` (o último envio foi aceito).
A distância entre elas é real - a Resend recusa com 403 enquanto o domínio do
remetente não estiver verificado, e aí tudo *parece* funcionar. O motivo exato
que ela devolveu sai em Actions → Acesso → `envios`.

⚠ A checagem de `emailEntregue` no `e2e.sh` fica DEPOIS da seção "Senha", não
junto do resto da saúde. Medida antes dos envios daquela execução, ela só pode
responder sobre a anterior - e acusou uma recusa inexistente na primeira
publicação depois de a chave entrar, mandando conferir DNS à toa.

Provado em três alturas: `app/tests/senha.test.ts` (o ciclo inteiro contra um
SQLite de verdade carregado com o `schema.sql` de produção, e-mail interceptado
na saída - ver `app/tests/ajuda/d1.ts`), `worker/e2e.sh` (as rotas contra o que
está publicado, inclusive a igualdade das duas respostas de `forgot`) e
`npm run senha` (o caminho da pessoa, num navegador, a 390px).

### Confirmação de e-mail (24/09/2026)
O cadastro manda um link "Confirme seu e-mail" (`mensagemDeConfirmacao` em
`worker/src/lib/mail.js`), e `/api/me` devolve `account.emailVerified`.
**Confirmar não bloqueia nada** - a conta e a compra funcionam sem isso
(decisão do dono). O que a confirmação resolve é a conta criada com o endereço
de outra pessoa: o e-mail chega à dona do endereço e diz como tomar a conta de
volta (recuperar a senha, que confirma o e-mail e derruba a sessão de quem a
criou).

- **O link só confirma com a sessão da conta que o pediu** (`verify` em
  `api/auth.js`; `/confirmar-email` pede login se não houver). Se o clique
  bastasse, a dona do endereço confirmaria, por reflexo, a conta do impostor.
  `tests/auditoria.test.ts` trava isso; o ciclo inteiro está em
  `tests/confirmacao.test.ts`.
- **A tabela `email_verifications` não é criada pela publicação.** Rodar uma
  vez `npx wrangler d1 execute hebraico-fluente --file=worker/schema.sql --remote`.
  Sem ela tudo funciona e ninguém confirma nada: `emailVerified` vem `null`, a
  tela não pede, e `/api/health` diz `verificacao: false` (o `e2e.sh` acusa).
- Endereço `.invalid` não recebe o link: é o das contas de teste da publicação.

### O cookie de sessão
Chama-se `__Host-hf_session` desde 24/09/2026: o prefixo faz o navegador
recusar esse nome vindo de qualquer lugar que não seja este host, com Secure,
Path=/ e sem Domain. O nome antigo, `hf_session`, é aceito até `LEGADO_ATE`
(`worker/src/lib/session.js`, 15/10/2026) e trocado pelo novo na primeira
chamada a `/api/me` - ninguém é deslogado pela troca. Passada a data, a
constante e o ramo que a usa podem sair.

## Camada de confiança (Brasil)
`data/empresa.json` é a FONTE ÚNICA da identificação do fornecedor: razão social,
CNPJ, endereço, canais de atendimento e os prazos das políticas. O rodapé,
/termos, /privacidade, /reembolso, /suporte e o checkout leem todos de lá, via
`app/src/lib/empresa.ts`.

**A regra que não se quebra:** um campo em `null` é um campo que ainda não se
sabe, e ele SOME da tela - nunca vira travessão, "a definir" ou um CNPJ de
exemplo. Identificação de fornecedor inventada não é rascunho, é declaração
falsa num documento que existe para ser confiável. `npm run check-legal` cobra
o que falta e recusa CNPJ fora do formato, política não linkada na capa e
qualquer e-mail ou CNPJ escrito à mão fora de `data/empresa.json`.

As quatro rotas novas precisam estar em `PUBLIC_PREFIXES`
(`components/shell/Chrome.tsx`): uma Política de Privacidade atrás de login
informa o cliente, e não o visitante - que é justamente quem precisa dela.

## O endereço do site
`hebraicofluente.com.br`, declarado em `wrangler.toml` (`routes` com
`custom_domain = true`) e repetido em `SITE_ORIGIN`. O `*.workers.dev`
continua respondendo, de propósito: é a rede de segurança quando há dúvida
sobre DNS ou certificado - e é por isso que `workers_dev = true` está escrito
no arquivo. Sem essa linha, `routes` sozinho faz o wrangler desligar o
workers.dev, avisando num WARNING dentro de uma publicação bem-sucedida.

O `www` **não serve o site** - o Worker devolve 301 para o apex, e isso é a
primeira coisa que ele faz, antes da API e do portão. A ordem não é estética:
`origin` das URLs de retorno da Mercado Pago sai da REQUISIÇÃO
(`worker/src/api/pay.js`), então uma compra iniciada no www voltaria para o
www depois de pagar, com o cookie de sessão emitido para o outro host.
`app/tests/dominio.test.ts` trava isso.

Trocar de endereço é editar `SITE_ORIGIN` e as `routes`. Três lugares já
tentaram desfazer ou desmentir essa troca sozinhos, e foram consertados: o
passo 7 do `scripts/cloudflare-setup.sh` (que sobrescrevia com o
workers.dev), o `HF_BASE` do workflow (que tinha o endereço escrito à mão) e
o passo 6 do mesmo script, que decidia se a publicação tinha dado certo
procurando uma URL workers.dev na saída do wrangler - e chamou de falha a
publicação que estreou o domínio, depois de ela ter criado os dois domínios e
terminado em zero. Agora quem decide é o código de saída. Os três estão
travados em `app/tests/dominio.test.ts`.

## Progresso: onde mora
Três camadas, nesta ordem, e `createStore()` (`app/src/lib/state/store.tsx`)
escolhe:

1. **Worker + D1** (`NEXT_PUBLIC_PLATFORM_API=worker`, que é a build publicada).
   Tabela `progress`, uma linha por conta, o estado inteiro em JSON. O
   adaptador (`app/src/lib/state/worker.ts`) **embrulha** o localStorage em vez
   de substituí-lo: o curso continua funcionando sem sinal, e a sincronização
   é uma fusão nos dois sentidos.
2. **Supabase** - porta escrita e nunca ligada, só entra com as duas variáveis.
3. **localStorage** - o padrão do `npm run dev` e de qualquer export sem API.

A coluna `rev` é o que impede um aparelho de apagar o outro: toda escrita
declara a revisão que leu, o servidor recusa com 409 quem pisar numa revisão
vencida e devolve o estado atual junto, e o cliente funde e repete. `uid` volta
no GET para que um notebook compartilhado não funda o progresso de uma pessoa
na conta de outra.

## Antes de commitar
```sh
cd app && npm test        # 302 testes
cd app && npm run build   # export estático
npm run validate          # ordem das letras, nikud, palavras
```

Verificações em navegador de verdade (a 390px, com `HF_CHROMIUM` apontando
para o Chromium já instalado - nunca `playwright install`):

```sh
cd app && npm run varrer      # rolagem lateral e erros de console em todas as rotas
cd app && npm run ctas        # visitante vs aluno: quem já comprou não vê checkout
cd app && npm run trancado    # o cadeado do teste final nos três estados
cd app && npm run portao      # o portão de domínio da lição não tranca ninguém
cd app && npm run exame       # o exame final abre e responde (para nos pareamentos)
cd app && npm run check-legal # identificação do fornecedor, políticas e checkout
cd app && npm run senha       # esquecer, redefinir e trocar a senha, de ponta a ponta

# a sincronia precisa do Worker no ar, com o D1 local:
npm run db:init:local
SESSION_SECRET=qualquer-coisa npx wrangler dev --port 8788 --local
cd app && npm run sincronia   # dois aparelhos, uma conta, ninguém perde trabalho
```
