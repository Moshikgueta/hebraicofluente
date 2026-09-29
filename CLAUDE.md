# Hebraico Fluente - notas do projeto

## Como trabalhar neste repositório (regras do dono)
Este projeto é SEPARADO do curso de espanhol (`Moshikgueta/espanolsindolordecabeza`).
Sessões do Claude para o Hebraico Fluente abrem só este repositório; nada do
espanhol (regras, fontes, provedor de pagamento) vale aqui.

- **Responder ao dono em português.**
- **Nunca fazer merge nem push em `main` sem aprovação.** Trabalhar no ramo da
  sessão, abrir PR e perguntar "Posso fazer o merge?". Depois de cada merge:
  reiniciar o ramo a partir da `main` nova e conferir a publicação
  (`deploy-worker.yml`) até ficar verde.
- **Conteúdo do curso só no presente.** Exceção aprovada: as leituras bíblicas
  bônus (`data/bonus.json`).
- **Hebraico escrito pelo Claude precisa da aprovação do dono antes de ir ao ar.**
- **Nunca inventar fatos sobre o dono** (Moshik Gueta): cargos, certificados,
  números de alunos, anos de experiência. Só o que ele informou.
- **Nunca trancar conteúdo central do curso atrás de XP.** A loja só troca extras.
- **Não apagar tabelas do banco de produção** sem pedido explícito.
- **Nenhum identificador de modelo** em commits, PRs, comentários ou arquivos.
- **Incidente** (vazamento, invasão, segredo exposto, site fora): seguir
  `INCIDENTES.md`, na ordem. Tem a tabela de como trocar cada segredo e o
  prazo da ANPD.
- A auditoria de pré-lançamento de 28/09/2026 está em `audit/2026-09-28/`
  (`RELATORIO.md` é o consolidado; a seção Q é a ordem de correção).

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
  as 600.000 do OWASP. `wrangler dev` não aplica o limite: o erro só aparece em
  produção. Com o Workers Paid: descomentar `PBKDF2_ITERATIONS = "600000"` e o
  bloco `[limits] cpu_ms = 300` no wrangler.toml e publicar; as contas se
  atualizam sozinhas no próximo login.
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
  Os 27 diagramas de traçado (`/stroke-order/`) também estão atrás do portão
  desde 24/09/2026; a landing lê só os que mostra, de `/tracado-amostra/`,
  que o exportador recria a partir de `AMOSTRA_TRACADO`
  (`tools/export-content.mjs`). Letra nova na landing entra nessa lista.
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
- **Backup diário no R2** (desde 28/09/2026): a Action "Backup do banco"
  (`.github/workflows/backup.yml` + `scripts/backup-nuvem.sh`) exporta o D1
  às 03:17 de Brasília, restaura a cópia num banco local e só guarda no R2
  (`hebraico-fluente-backups`, privado, diárias por 90 dias) se todas as
  tabelas voltarem com as mesmas linhas. "ensaiar", à mão, restaura uma cópia
  do zero num banco de teste na Cloudflare e o apaga depois: uma vez por mês.
  Falha vira e-mail para o SUPPORT_EMAIL. O agendamento só roda no ramo
  PADRÃO do GitHub, que precisa ser a `main`.
- **Publicação volta sozinha** (desde 28/09/2026): `scripts/cloudflare-setup.sh`
  anota a versão no ar antes do `wrangler deploy`; se a conferência de
  produção (`worker/e2e.sh`) falhar duas vezes seguidas, faz `wrangler
  rollback` para ela e a execução fica vermelha. Uma falha só, seguida de
  sucesso, é tratada como passageira. O rollback não desfaz schema (que só
  cresce) nem segredos.
- **Token de teste barra a publicação:** `MP_ACCESS_TOKEN` com `TEST-` faz
  `scripts/pagamento-ativo.mjs` parar antes do build; o e2e de produção exige
  `modo: producao` e conta que não seja usuário de teste da Mercado Pago.
- **Trocar o e-mail de um aluno:** Actions → Acesso → `trocar-email` (campo
  E-mail = o de hoje, `novo_email` = o certo). Só depois de confirmar com o
  aluno por outro canal.
- **Mudança numa tabela que já existe** (desde 28/09/2026): o `schema.sql` só
  cria; `ALTER TABLE` vai num arquivo `worker/migrations/NNNN-descricao.sql`,
  aplicado uma vez pela publicação (passo 3b de `scripts/cloudflare-setup.sh`)
  e anotado na tabela `migracoes`. Só acrescentar (a versão anterior ainda
  está no ar quando a migração roda). Ver `worker/migrations/README.md`.
- **A varredura roda uma de cada vez**: trava `varredura` na tabela `travas`,
  4 minutos de validade, falha aberta (`pegarTrava` em `worker/src/lib/db.js`).
- **Lista do aviso do próximo curso** (desde 28/09/2026): a ÚNICA
  propaganda por e-mail, e só com consentimento. Entra pela caixa "Quero
  receber um e-mail quando o Hebraico A1 abrir" em /perfil (começa
  desmarcada); sai pela mesma caixa, pelo link assinado de /sair-da-lista
  (o GET só abre a página, quem tira é o POST) ou apagando a conta. Tabela
  `novidades`; tudo em `worker/src/api/novidades.js`. O envio do lançamento
  ainda não existe: cada mensagem precisa levar `linkDeSaida(env, id)` no
  corpo e nos cabeçalhos List-Unsubscribe. Nenhum outro e-mail de
  propaganda: a política de privacidade diz isso.
- **Desistência estorna sozinha** (desde 28/09/2026): `POST /api/pay/desistir`
  pede o estorno total à Mercado Pago na hora (`iniciarEstorno` em
  `worker/src/api/pay.js`, chave de idempotência `estorno-<pedido>`), a
  varredura tenta de novo o que falhou (8 vezes, intervalo dobrando) e o
  acesso fecha pelo caminho de sempre quando ela confirma. PIX direto e
  pedido liberado à mão ficam `manual`. Estado em `estornos`.
- **Alertas ao dono** (`worker/src/alertas.js`, na varredura): erros de
  pagamento na última hora viram um e-mail por hora; desistência sem estorno
  resolvido vira lembrete diário. A varredura marca um batimento, e
  `/api/health` responde `monitor: false` se ela parar: é o campo que o
  monitor externo de disponibilidade deve olhar (palavra-chave `"monitor":true`).
- **O backup é segredo:** tem e-mail e hash de senha de todo aluno. Nunca num
  artefato do Actions nem no git. `npm run db:backup` continua existindo para
  uma cópia na sua máquina.
- `npm run csp` prova a CSP num navegador; `app/tests/auditoria.test.ts`
  guarda cada ataque fechado. Um achado novo entra lá antes do conserto.
- **CSP estrita em observação (SEC-003).** O build de `app` roda
  `tools/csp-hashes.mjs`, que grava em `out/_csp-hashes.json` o hash de cada
  script inline de cada página. O Worker manda, ao lado da CSP que vale, uma
  `Content-Security-Policy-Report-Only` sem `'unsafe-inline'` e com esses
  hashes; o navegador relata em `/api/csp-report` (trilha `csp-violacao`,
  lida em Actions → Acesso → `csp`). `CSP_ESTRITA=1 npm run csp` aplica a
  regra estrita de verdade num Chromium. Trocar a observação pela regra que
  vale é decisão do dono, depois de semanas sem relato.

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

### Consumidor e Marco Civil (24/09/2026)
Revisão contra a lei brasileira; o que o código cumpre e onde:

- **Desistência pelo site** (CDC art. 49; Decreto 7.962/2013 art. 5º):
  botão "Desistir da compra" em Sua conta → Compras, `POST /api/pay/desistir`,
  tabela `arrependimentos`. Vale até o fim do 7º dia depois do pagamento, em
  Brasília (`prazoDeDesistencia` em `api/pay.js`). A confirmação sai NA HORA
  por e-mail, e o dono recebe o aviso para estornar - o estorno continua
  manual, e o acesso fecha sozinho quando a Mercado Pago avisa.
- **Registro de acesso** (Marco Civil art. 15): tabela `registros_acesso`, IP
  inteiro + data/hora em cadastro, login e senha redefinida, 190 dias, apagado
  pela varredura. NÃO sai com a conta apagada (obrigação legal).
- **O contrato no e-mail** (Decreto 7.962 art. 4º, IV): o recibo de compra
  leva os links dos Termos e da Política de Reembolso com a versão
  (`politicas.atualizadoEm` em `data/empresa.json` - suba a data quando os
  textos mudarem).
- **18+**: artigo 3 dos Termos e a declaração junto do aceite no checkout.
- **LGPD art. 16, I** (obrigação legal) é o que ampara guardar pedidos e
  registros depois da exclusão - não o II, que é pesquisa.
- A autorização do autor de *Ba Li Ivrit* existe (o dono a tem por escrito).

`tests/consumidor.test.ts` guarda tudo isso.

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

**Rodadas de exercício** (`lib/rodadas.ts`): refazer um exercício traz
perguntas que o aluno ainda não viu. Cada categoria (`licao-pratica-bet`,
`checkpoint-3`, `revisao`...) guarda quantas rodadas concluiu e a impressão
das últimas 48 perguntas. Desde 27/09/2026 isso mora na CONTA
(`LearnerState.rodadas`, fundido por `fundirRegistro`: o lado com mais
rodadas vence, empate pelo conteúdo), com um espelho síncrono no aparelho
(`hf-rodadas-v1`) que as telas leem ao escolher a rodada. O store faz a
ponte: ao carregar, espelho e conta se fundem nos dois sentidos; o evento
`RODADAS_MUDOU` leva cada rodada concluída para o estado; sair da conta
limpa o espelho. `npm run sincronia` prova a travessia entre aparelhos.

## Missão de módulo

Cada módulo fecha com uma missão: uma situação de verdade (o mercado, a
padaria, a ficha da escola) em 3 ou 4 passos, em `/modulo/N/missao/`. O
cartão fica na página do módulo, e o checkpoint aprovado leva até ela. Passa
com 70%; cumprida, grava `firsts['missao-N']`. Não tranca nada.

- `data/missoes.json` só CITA o hebraico de cada passo e escreve a situação em
  português. O significado e a transliteração vêm do vocabulário do curso na
  hora de montar (`lib/engine/missao.ts`), para a missão nunca discordar da
  lição. Não escreva hebraico novo ali: copie o de uma palavra do curso.
- Passos: `ler` (hebraico no lugar → significado), `achar` (significado →
  qual palavra), `transliterar` (escrever como se lê). `semPontos` tira o
  nikud (módulo 6).
- `tests/missoes.test.ts` falha se uma palavra não for do curso, se usar letra
  que o aluno ainda não viu naquele módulo, ou se dois distratores tiverem o
  mesmo significado da certa.
- É conteúdo pago: vai por `/api/content` (os três lados do contrato e
  `OS_PAGOS` em `tests/conteudo.test.ts`), nunca no pacote público.

## Mini-textos de leitura corrida

Um texto curto por módulo, do 3 ao 7 (bilhete, mensagem de WhatsApp, cartão),
em `/modulo/N/texto/`, com transliteração e tradução a um toque (a linha ou o
texto todo), glossário das palavras novas e perguntas de compreensão
(`Compreensao`, sem nota). O do módulo 6 aparece sem nikud.

- São as únicas frases escritas PARA o curso. Cada texto em `data/textos.json`
  nasce com `revisado: false` e só aparece para o aluno com `true`
  (`textoDoModulo` filtra). Aprovar é trabalho de quem fala hebraico, e
  `TEXTOS-PARA-REVISAR.md` é o documento de revisão.
- `tests/textos.test.ts`: um por módulo 3 a 7, só letras já ensinadas no
  módulo, toda palavra pontuada (menos as com gerech), transliteração,
  tradução e porquê em tudo, e a trava da revisão.
- Conteúdo pago: vai por `/api/content`, como as missões.

## A rampa sem pontos, e as palavras dos textos no vocabulário

- Os checkpoints dos módulos 3, 4 e 5 (`MODULOS_COM_RAMPA`) terminam com 3
  palavras conhecidas sem nikud (`buildSemPontos`), com a forma pontuada na
  dica. Ficam FORA da nota: `CheckpointClient` recalcula o placar sem os ids
  `sempontos-` e mostra o resultado delas à parte. Só palavras que não viram
  outra sem os pontos (שֵׁם/שָׁם ficam de fora).
- Respondidas as perguntas de um mini-texto, grava-se `firsts['texto-N']`, e
  as `novas` do texto (menos prefixo solto e nome próprio) entram no
  vocabulário (`leituraDe`) e no "Palavras à mão" (`palavrasDosTextosLidos`).

## Gravar a própria leitura

`GravarLeitura` (components/learn) grava o aluno lendo em voz alta e toca de
volta: nas sílabas da lição e no mini-texto. O áudio fica num `Blob` local e
some ao sair da página; nada é enviado. O `Permissions-Policy` do Worker
libera `microphone=(self)` SÓ nas rotas do portão (`isGatedPath`); o site
público e a API seguem com `microphone=()` (teste em auditoria.test.ts). A
privacidade diz isso no art. 2.

## Painel de gravação (/admin/gravar)

O dono do curso grava as pronúncias pelo navegador (pensado para o Safari do
iPhone): escolhe o item, Gravar, Parar, ouve, Salvar ou Apagar e gravar de
novo; o painel pula para o próximo item sem áudio. Referência:
`worker/src/api/audio.js`.

- **O endereço não muda.** Tudo continua pedindo `/audio/<id>.mp3` (id =
  hash do hebraico). Depois do portão, o Worker serve a gravação do painel
  (tabela `gravacoes` do D1, schema.sql) e, sem ela, o arquivo do git. Gravar
  de novo substitui; remover devolve o arquivo do estúdio. Serve com `Range`
  (o Safari não toca mídia sem 206).
- **Formato:** `audio/mp4` (AAC) quando o `MediaRecorder` aceita; senão o
  painel grava WebM/Ogg e converte para WAV antes de enviar (WebM não toca em
  todo iPhone). O servidor confere os bytes, não o tipo declarado.
- **Corte:** o painel mede onde a voz está (`acharVoz`, lib/gravador.ts) e
  guarda `inicio_ms`/`fim_ms`; o curso toca só esse trecho (fragmento `#t=`
  + corte no `timeupdate`). O WAV já sai cortado e nivelado.
- **O curso fica sabendo na hora:** `lib/audio-registro.ts` junta o
  `AUDIO_MANIFEST` da build com `/api/audio/manifest` (público, só ids),
  carregado pelo AppShell e guardado no aparelho. `hasAudio`, `audioAvailable`
  e `gravado` leem daí. O `?v=` no endereço fura o cache quando uma gravação
  é substituída.
- **Nomes organizados** (`alef.mp4`, `a-ayin.mp4`) saem de
  `worker/src/lib/nomes-audio.js`, calculados do catálogo inteiro: só rótulo e
  nome de download, o arquivo continua guardado pelo id.
- **Quem pode:** as contas em `ADMIN_EMAILS` (vírgulas). `/admin` fica fora
  da casca do curso e do portão de compra (Chrome.tsx), com `noindex`, e com
  o microfone liberado pelo `Permissions-Policy`.
- `tests/gravacao-painel.test.ts` cobre tudo isso contra o SQLite com o
  schema de produção.

## Escuta de frase e a onda 4 (26/09/2026)

- **Onda 4 · Frases e textos** (`tools/gen-audio.mjs`): as 23 frases e cada
  linha dos mini-textos revisados, `kind: 'frase'`. Uma frase de uma palavra
  só que já é palavra do curso reaproveita o clipe dela. As linhas dos textos
  saem do exportador com `audioId`.
- **Gravar frases**: o roteiro por letra tem uma seção "frases" e uma por
  texto, com 2 s de pausa entre os itens. O `cortar-audio` entra sozinho no
  modo frase quando todos os itens são `frase` (pausa mínima 0,9 s, sem abrir
  peça longa) - o `--ensaiar` prova que a régua de palavra partiria a frase.
- **Exercícios**: `exListenSentence` (ouça e ache a frase escrita,
  `audio-recognition`) e `exListenMeaning` (ouça, sem texto, e diga o sentido
  em português, tipo `listen-meaning`). Só com a frase gravada (`gravado`),
  só com frases que o aluno já lê; entram na lição, na escuta da academia e
  na parte "escuta" do exame. `tests/escuta-frases.test.ts`.
- **Mini-texto**: botão de ouvir por linha e "Ouvir o texto inteiro" (só
  com TODAS as linhas gravadas), acendendo a linha que toca.
- **Etapa 1 enxuta** a partir da letra 12 (`ENXUTA_DESDE` em LessonClient):
  à vista ficam a letra, como pronunciar (com o desenho), as leituras, "o
  que você precisa lembrar", as sílabas e as perguntas; o resto fica em
  "Ver a explicação completa".

## Comparar pronúncia e "Achei um erro" (26/09/2026)

- **`CompararPronuncia`** (components/learn): nas sílabas (etapa 1) e nas
  palavras (etapa 2), só com item gravado. O aluno ouve o modelo, grava o
  seu e vê as duas ondas na MESMA escala de tempo (`barrasDoTrecho`,
  lib/gravador.ts), cortadas no trecho da voz; "Ouvir os dois" toca modelo e
  a sua em sequência, por Web Audio. Sem nota automática, de propósito. A
  gravação não sai do aparelho.
- **Sílabas e pronúncia (27/09/2026).** Na etapa das sílabas (letra e som),
  `CompararPronuncia grade`: tocar na sílaba TOCA a gravação e mostra a dica, e
  o gravar-e-comparar fica logo abaixo, para a sílaba escolhida (eram três
  blocos repetidos). Nas PALAVRAS, `FalarECorrigir`: o reconhecimento de fala
  do navegador (he-IL) transcreve e `conferirFala` (lib/fala.ts) decide -
  sem pontos, sem forma final, e grafia cheia = defectiva (אומר = אֹמֵר).
  Não em sílaba solta. Some onde o navegador não transcreve (Firefox). A voz
  vai ao Google/Apple: o aviso fica ao lado do botão e a privacidade (art. 2)
  diz isso. `tests/fala.test.ts`.
- **"Achei um erro" foi DESLIGADO por inteiro** (27/09/2026, a pedido do dono
  do curso: não abrir canal de reclamação dentro do curso). Saíram o botão,
  `RelatarErro`, `lib/relato.ts`, a rota `POST /api/relatos`, as duas rotas
  do painel e a página `/admin/relatos`. A tabela `relatos` continua no
  schema só para não apagar em silêncio o que havia no banco de produção;
  nada lê nem grava nela. `tests/comparacao-pronuncia.test.ts` prova que as
  três rotas respondem 404.
- `lib/admin.js` (worker) tem `isAdmin`/`exigirAdmin`, usados pelo painel de
  gravação.

## Palavras à mão

Na academia, "Palavras à mão" (também em `/academia?treino=palavras-a-mao`,
que o vocabulário linka) dá rodadas de 5 palavras aprendidas para escrever
inteiras em cursiva, no mesmo `TraceBoard` das letras e do "meu nome": por
cima do modelo, modelo fraco, sem modelo. O modelo é a palavra sem nikud.

- O sorteio é `palavrasParaEscrever` (lib/engine/palavras.ts): só palavras do
  vocabulário acumulado (toda letra da grafia já ensinada, porque à mão o ו
  vogal vira letra), de 2 a 7 letras. `tests/palavras-a-mao.test.ts`.
- Corpo `display` para 3+ letras: medido, a mais larga cabe no quadro de um
  telefone de 360px. Mudar a fonte cursiva ou o limite de 7 letras pede medir
  de novo.

## Recompensas: trocar XP (27/09/2026)

`/loja` (atrás do portão; o XP do cabeçalho linka para lá). Regra que segura
tudo: **o XP total é conquista e nunca diminui; o que se gasta é o saldo** =
`xp - soma dos custos` (`lib/loja.ts`, nunca negativo na tela).

- Compras em `LearnerState.loja.compras`, por id: `folga:<ISO>`,
  `carta:<id da carta>`, `nome-decorado`. A fusão é a união (`fundirCompras`),
  então a mesma carta comprada em dois aparelhos cobra uma vez só.
  `comprasValidas` descarta custo que não é número ou é negativo: um custo
  forjado viraria saldo infinito.
- Itens: folga 100 (até 2 guardadas), carta de cultura antecipada 150, nome
  decorado 300 (pede o nome confirmado em "Meu nome"; a imagem é desenhada no
  navegador, `lib/nome-decorado.ts`).
- A folga: em `applyPractice`, se a meta é cumprida depois de dias perdidos e
  há folgas para TODOS eles, a sequência continua e cada folga fica com
  `usadaEm` = o dia coberto. Tudo ou nada. `displayStreak` usa a mesma conta.
- **Nunca trancar conteúdo principal atrás de XP**: o aluno já pagou.
- O XP é do cliente e pode ser forjado. Serve para prêmios digitais; qualquer
  coisa que valha dinheiro não entra na loja sem uma decisão à parte do dono,
  e com teto conferido no servidor.
- `/loja` está no `GATED` do portão e no `PAGAS` de lib/seo.ts.
- **Leituras bônus** (texto bíblico, não reza - pedido do dono): `data/bonus.json` →
  export (com `after` e `audioId`) → `ConteudoPago.bonus` (pago, pelo
  `/api/content`; os três lugares: content.ts, content-servidor.ts,
  worker/src/api/content.js). Itens `texto-bonus` (200) e `bencao` (100), um
  por leitura (`<item>:<id>`). A loja só oferece com `mastered >= after`.
  Leitura em `/bonus?l=<id>` (no GATED), com `LinhasDeLeitura`, o mesmo
  componente do texto do módulo. Só `revisado: true` aparece e entra na
  onda 5 do roteiro. São hebraico bíblico, fora da regra de "só presente" -
  por serem recompensa, fora do caminho do curso.
- **O Nome nas gravações:** o dono do curso segue o costume de não dizer o Nome
  fora da reza. Onde está יְהוָה, a gravação diz «Hashém», e a transliteração
  diz o mesmo (nunca «Adonái»: o aluno ouviria outra palavra). A leitura que
  contém o Nome mostra o aviso "Por que a gravação diz «Hashém»", e o guia
  explica na seção `nome`. Elohím é dito normalmente.
- **Guia «O nikud da Bíblia»** (`guia` em data/bonus.json → `ConteudoPago.guiaNikud`):
  página à parte `/nikud-biblico` (no GATED), opcional, sem XP e sem nada que
  dependa dela - pedido do dono. Linkada das Leituras bônus e de Recompensas.
  Todo exemplo é recortado de uma linha já aprovada das leituras (o teste
  confere); gravações na onda 5.
- `tests/loja.test.ts`.

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

## Teste A/B do hero da capa (28/09/2026)

`hero-2026-09`: A = híbrido ("Ler e escrever hebraico, do zero." com os três
desejos como selos); B = as perguntas (Israel, "as letras da Bíblia"). O botão
é o mesmo nas duas ("Comece do zero…"): o teste compara só a mensagem. Cada navegador sorteia uma vez (`lib/ab.ts`, localStorage).
O HTML estático sai com B; o texto do hero nasce invisível, então A não pisca.

- Contagem: `POST /api/ab` (worker/src/api/ab.js) soma totais diários em
  `ab_contagens` (visto, clique, checkout, compra). Sem cookie, conta ou IP.
  O site continua sem analítica: é o único contador.
- Relatório: Action "Relatório do teste A/B" (`tools/relatorio-ab.mjs`), com
  taxas e teste de duas proporções. O resumo é público (repositório público).
- A privacidade (art. 4) descreve o teste.
- **Para encerrar:** fixar a versão vencedora no Hero, apagar `lib/ab.ts`, as
  chamadas `contarAB`, a rota `/api/ab` e o workflow; a tabela pode ficar.
