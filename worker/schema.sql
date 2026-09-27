-- Hebraico Fluente - esquema D1.
--
-- Aplicar com:
--   npx wrangler d1 execute hebraico-fluente --file=worker/schema.sql --remote
--
-- Duas escolhas estruturais, e as duas são sobre crescer:
--
--  1. O direito de acesso é UMA LINHA POR CURSO (tabela `entitlements`), e não
--     um campo `pago_ate` na conta. Com um campo só, o dia em que o A1 sair
--     exige migrar todo mundo e reescrever cada consulta. Com uma linha por
--     curso, lançar um curso novo não toca em nada.
--
--  2. Todo pagamento que chega - webhook, verificação, varredura - é gravado
--     cru em `payment_events` ANTES de qualquer coisa acontecer. O UNIQUE em
--     event_id é o que torna a entrega repetida inofensiva: a Mercado Pago
--     reenvia o mesmo aviso várias vezes por desenho, e sem isso um pedido
--     poderia liberar acesso duas vezes ou registrar duas compras.
--
-- Datas são inteiros em milissegundos de época. Um TEXT com fuso horário
-- dentro é uma comparação errada esperando acontecer.

CREATE TABLE IF NOT EXISTS accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,     -- sempre minúsculo, normalizado na entrada
  name          TEXT    NOT NULL DEFAULT '',
  pass_hash     TEXT    NOT NULL,
  pass_salt     TEXT    NOT NULL,
  -- Iterações do PBKDF2 usadas NESTA linha. É o que permite subir o custo
  -- depois sem invalidar a senha de ninguém.
  pass_iter     INTEGER NOT NULL DEFAULT 310000,
  -- Subir este número invalida todo cookie já emitido para a conta.
  session_version INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  account_id  INTEGER NOT NULL REFERENCES accounts(id),
  course_slug TEXT    NOT NULL,              -- combina com data/courses.json
  granted_at  INTEGER NOT NULL,
  expires_at  INTEGER,                       -- NULL = sem prazo; nenhum curso vende isso hoje
  order_id    TEXT    NOT NULL,              -- por onde um estorno encontra o acesso
  -- Um acesso por conta e curso. Uma renovação ESTENDE a linha existente em
  -- vez de criar outra: duas linhas para o mesmo curso significam duas datas
  -- de validade, e alguma consulta vai escolher a errada.
  PRIMARY KEY (account_id, course_slug)
);

CREATE TABLE IF NOT EXISTS orders (
  id            TEXT    PRIMARY KEY,         -- mintado pelo servidor, nunca pelo cliente
  account_id    INTEGER NOT NULL REFERENCES accounts(id),
  course_slug   TEXT    NOT NULL,
  amount_cents  INTEGER NOT NULL,            -- centavos; dinheiro nunca em ponto flutuante
  currency      TEXT    NOT NULL DEFAULT 'BRL',
  method        TEXT    NOT NULL,            -- pix | card
  installments  INTEGER NOT NULL DEFAULT 1,
  -- pending | paid | failed | refunded | expired
  status        TEXT    NOT NULL DEFAULT 'pending',
  provider      TEXT    NOT NULL DEFAULT 'mercadopago',
  provider_ref  TEXT,                        -- id do pagamento ou da preferência
  pay_url       TEXT,                        -- checkout do cartão, reaproveitado num reclique
  pix_code      TEXT,                        -- copia e cola
  pix_expires_at INTEGER,
  created_at    INTEGER NOT NULL,
  paid_at       INTEGER,
  checked_at    INTEGER                      -- última vez que a varredura olhou
);

CREATE INDEX IF NOT EXISTS orders_account ON orders(account_id, created_at DESC);
-- A varredura procura exatamente por isto: pendentes, mais antigos primeiro.
CREATE INDEX IF NOT EXISTS orders_pending ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS orders_provider_ref ON orders(provider_ref);

-- Tudo que o provedor disse, cru, antes de qualquer coisa ser acreditada.
CREATE TABLE IF NOT EXISTS payment_events (
  event_id   TEXT PRIMARY KEY,               -- id do pagamento na Mercado Pago
  order_id   TEXT,
  status     TEXT,
  raw        TEXT NOT NULL,
  source     TEXT NOT NULL,                  -- webhook | verify | reconcile
  created_at INTEGER NOT NULL
);

-- Freio de tentativa. Uma linha por (chave, janela); a janela é um minuto.
-- Sem isto, /auth/login é um teste de senhas com 310.000 iterações pagas pelo
-- servidor - caro para nós, barato para quem tenta.
CREATE TABLE IF NOT EXISTS throttle (
  key        TEXT    NOT NULL,
  window_at  INTEGER NOT NULL,
  hits       INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_at)
);

-- ── recuperação de senha ──────────────────────────────────────────────────
-- Um pedido de "esqueci minha senha", enquanto ele vale.
--
-- O que está GRAVADO é o sha256 do token, nunca o token. A diferença importa:
-- quem lê esta tabela - um vazamento de banco, um backup esquecido, uma
-- consulta de suporte - não consegue trocar a senha de ninguém com o que
-- encontra aqui. O token em claro existe em dois lugares: na URL que foi para
-- a caixa de entrada do dono da conta, e na memória do Worker durante a
-- requisição que o criou.
--
-- Por isso o hash é a CHAVE PRIMÁRIA: a busca é pelo hash do que chegou, e
-- não existe consulta que responda "me dê um token válido do fulano".
--
-- `used_at` é o consumo. A linha não é apagada ao ser usada porque a pergunta
-- "essa senha foi trocada por um link de recuperação, e quando?" é exatamente
-- a que se faz depois de uma conta invadida.
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT    PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER,
  -- De onde veio o PEDIDO. Serve para investigar, não para decidir nada: quem
  -- pede não precisa ser quem clica (pediu no computador, abriu o e-mail no
  -- celular - e esse é o caso comum, não a exceção).
  request_ip TEXT    NOT NULL DEFAULT ''
);

-- Para invalidar de uma vez os pedidos abertos de uma conta, que é o que
-- acontece assim que a senha dela muda, por qualquer caminho.
CREATE INDEX IF NOT EXISTS password_resets_abertos
  ON password_resets(account_id) WHERE used_at IS NULL;

-- ── confirmação de e-mail ─────────────────────────────────────────────────
-- Prova de que quem criou a conta recebe o e-mail dela.
--
-- Sem isto qualquer pessoa cria uma conta com o endereço de outra, e a dona
-- do endereço só descobre quando tenta se cadastrar e ouve "já existe uma
-- conta com esse e-mail". O e-mail de confirmação chega a ela - e é ele que
-- avisa, se não foi ela quem criou, como tomar a conta de volta.
--
-- Uma linha por link enviado. `confirmed_at` preenchido é a prova, e ela vale
-- para o par (conta, endereço): o dia em que o e-mail da conta mudar, a prova
-- antiga não confirma o endereço novo.
--
-- Como em `password_resets`, o que está gravado é o sha256 do token, e o hash
-- é a chave primária. Uma recuperação de senha concluída também prova a caixa
-- de entrada, e grava aqui uma linha já confirmada, com `reset:` na frente do
-- hash para não colidir com um link de confirmação.
--
-- Tabela nova (24/09/2026): aplicar com
--   npx wrangler d1 execute hebraico-fluente --file=worker/schema.sql --remote
-- Enquanto ela não existe, o site funciona igual e só não confirma ninguém -
-- `/api/health` reporta `verificacao: false`.
CREATE TABLE IF NOT EXISTS email_verifications (
  token_hash   TEXT    PRIMARY KEY,
  account_id   INTEGER NOT NULL REFERENCES accounts(id),
  email        TEXT    NOT NULL,
  created_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  confirmed_at INTEGER
);

-- "Esta conta tem o e-mail confirmado?" é perguntado a cada /api/me.
CREATE INDEX IF NOT EXISTS email_verifications_conta
  ON email_verifications(account_id, email);

-- Trilha do que mexeu em acesso. É o que responde "por que essa pessoa perdeu
-- o curso?" três meses depois, quando ninguém lembra.
CREATE TABLE IF NOT EXISTS access_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER,
  action     TEXT NOT NULL,
  detail     TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

-- Para a pergunta "o último e-mail de senha saiu ou não?", que /api/health
-- responde. Sem o índice é uma varredura da trilha inteira, e a trilha só
-- cresce.
CREATE INDEX IF NOT EXISTS access_log_acao ON access_log(action, id DESC);

-- ── convites ──────────────────────────────────────────────────────────────
-- Acesso concedido a um E-MAIL antes de existir uma conta com ele.
--
-- Serve ao caso comum de presentear: cortesia para uma amiga, acesso para
-- quem pagou por fora, aluno convidado para testar. Sem isto, presentear
-- exige coordenação - a pessoa se cadastra, esbarra na tela de "você não tem
-- este curso", avisa, e só então alguém libera. Com isto, ela cria a conta e
-- o curso já está lá.
--
-- O convite é CONSUMIDO no cadastro (`used_at`), nunca apagado: quem deu o
-- presente precisa continuar podendo ver que deu, e quando foi usado.
CREATE TABLE IF NOT EXISTS invites (
  email       TEXT    NOT NULL,
  course_slug TEXT    NOT NULL,
  months      INTEGER NOT NULL DEFAULT 12,
  note        TEXT    NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL,
  used_at     INTEGER,
  PRIMARY KEY (email, course_slug)
);

CREATE INDEX IF NOT EXISTS invites_pendentes ON invites(email) WHERE used_at IS NULL;

-- ── progresso ─────────────────────────────────────────────────────────────
-- O estado de aprendizagem do aluno, do lado do servidor.
--
-- Um BLOB de JSON e não vinte tabelas normalizadas, por três motivos que
-- valem mais do que a elegância do modelo:
--
--  1. Ninguém consulta isto por dentro. O servidor nunca pergunta "quem
--     domina o Shin"; ele guarda e devolve. Normalizar pagaria o custo de um
--     esquema sem comprar nenhuma consulta.
--  2. A forma do estado muda com o curso, e ela já tem migração versionada no
--     app (lib/state/migrate.ts). Uma segunda migração, em SQL, que tem de
--     concordar com a primeira, é a garantia de que um dia elas discordam.
--  3. Uma linha por aluno é uma escrita por sincronização, e o plano gratuito
--     do Workers dá 10 ms de CPU por requisição.
--
-- `rev` é o que impede um aparelho de apagar o outro: toda escrita declara a
-- revisão que leu, e o servidor recusa (409) quem escreve por cima de uma
-- revisão que já mudou. Quem levou 409 funde e tenta de novo - a fusão é
-- monotônica, então repetir é seguro. Ver app/src/lib/state/merge.ts.
CREATE TABLE IF NOT EXISTS progress (
  account_id INTEGER PRIMARY KEY REFERENCES accounts(id),
  state      TEXT    NOT NULL,              -- LearnerState serializado
  version    INTEGER NOT NULL DEFAULT 2,    -- STATE_VERSION de quem gravou
  rev        INTEGER NOT NULL DEFAULT 1,    -- sobe a cada escrita aceita
  updated_at INTEGER NOT NULL
);

-- ── registros de acesso (Marco Civil da Internet, art. 15) ────────────────
-- O provedor de aplicação constituído como pessoa jurídica, com fins
-- econômicos, tem de guardar os registros de acesso à aplicação - data e
-- hora de uso a partir de um endereço IP - por SEIS MESES, em sigilo. É o
-- que uma ordem judicial pede quando alguém usa a conta de outra pessoa.
--
-- Uma linha por entrada na conta: cadastro, login e senha redefinida (que
-- também entra). O IP é o inteiro, como a Cloudflare o entrega - não o /64
-- dos freios. Fica 190 dias (seis meses mais uma folga) e a varredura de 5
-- em 5 min apaga o resto: guardar além do exigido seria dado pessoal sem
-- finalidade (LGPD, art. 6º, III).
--
-- NÃO é apagado quando a conta é apagada: é obrigação legal (LGPD, art. 16,
-- I), e a conta apagada é esvaziada, não removida, então a referência vale.
--
-- Sem AUTOINCREMENT de propósito: ele custa uma escrita a mais por linha
-- (a tabela sqlite_sequence), e aqui nada depende de ids nunca reusados.
CREATE TABLE IF NOT EXISTS registros_acesso (
  id         INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  evento     TEXT    NOT NULL,              -- 'cadastro' | 'entrada' | 'senha-redefinida'
  ip         TEXT    NOT NULL,
  criado_em  INTEGER NOT NULL
);

-- Para a faxina, que apaga por idade.
CREATE INDEX IF NOT EXISTS registros_acesso_idade ON registros_acesso(criado_em);

-- ── desistência da compra (CDC, art. 49; Decreto 7.962/2013, art. 5º) ─────
-- O pedido de desistência feito pelo próprio site - "pela mesma ferramenta
-- utilizada para a contratação", como o decreto exige. Uma linha por pedido
-- de compra: pedir de novo não cria outra, e o momento do primeiro pedido é
-- o que conta para o prazo.
--
-- O reembolso em si continua sendo feito pelo dono, no painel da Mercado
-- Pago; quando ela avisa o estorno, `applyPayment` fecha o acesso sozinho.
-- Esta tabela é a prova de QUANDO a pessoa pediu - que é o que decide se
-- estava dentro dos sete dias.
CREATE TABLE IF NOT EXISTS arrependimentos (
  order_id   TEXT    PRIMARY KEY REFERENCES orders(id),
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  pedido_em  INTEGER NOT NULL,
  ip         TEXT    NOT NULL DEFAULT ''
);

-- ── gravações do painel (/admin/gravar) ───────────────────────────────────
-- O áudio que o dono do curso grava pelo navegador. Uma linha por clipe, com
-- o id do catálogo (`he-xxxxxxxx`, data/audio.json) como chave: gravar de
-- novo SUBSTITUI. O Worker serve daqui antes do arquivo do git, no mesmo
-- endereço /audio/<id>.mp3 - ver worker/src/api/audio.js.
--
-- `dados` é o arquivo como o navegador gravou (audio/mp4 no Safari; WAV no
-- navegador que só grava WebM). `inicio_ms`/`fim_ms` é onde a voz começa e
-- termina dentro dele, medido pelo painel; o curso toca só esse trecho.
--
-- `autor` é o e-mail, e não uma chave para `accounts`, de propósito: a
-- gravação é conteúdo do curso, e não pode travar nem sumir quando uma conta
-- é apagada.
CREATE TABLE IF NOT EXISTS gravacoes (
  audio_id      TEXT    PRIMARY KEY,
  tipo          TEXT    NOT NULL,
  dados         BLOB    NOT NULL,
  tamanho       INTEGER NOT NULL,
  inicio_ms     INTEGER,
  fim_ms        INTEGER,
  duracao_ms    INTEGER,
  autor         TEXT    NOT NULL,
  atualizado_em INTEGER NOT NULL
);

-- ── relatos de erro (o botão "Achei um erro" dos exercícios) ─────────────
-- DESLIGADO em 27/09/2026, a pedido do dono do curso: o botão, a rota que
-- recebia (/api/relatos) e o painel saíram. A tabela fica só para não
-- apagar em silêncio o que já estava no banco de produção; nada mais lê
-- nem grava aqui. Apagá-la é um `DROP TABLE relatos` de propósito.
-- Uma linha por relato. `foto` é o exercício como o aluno o viu (JSON:
-- enunciado, hebraico, alternativas, a certa e a escolhida) - os exercícios
-- são sorteados, e sem a foto o relato não aponta para nada.
--
-- SEM conta, de propósito: o relato exige sessão, mas não guarda quem mandou.
-- Não é dado pessoal, não trava a exclusão de conta e não entra na limpeza
-- das contas de teste.
CREATE TABLE IF NOT EXISTS relatos (
  id           INTEGER PRIMARY KEY,
  exercicio    TEXT    NOT NULL,
  tipo         TEXT    NOT NULL DEFAULT '',
  letra        TEXT    NOT NULL DEFAULT '',
  rota         TEXT    NOT NULL DEFAULT '',
  motivo       TEXT    NOT NULL,              -- resposta | hebraico | audio | confuso | outro
  comentario   TEXT    NOT NULL DEFAULT '',
  foto         TEXT    NOT NULL,
  criado_em    INTEGER NOT NULL,
  resolvido_em INTEGER
);
CREATE INDEX IF NOT EXISTS relatos_abertos ON relatos (resolvido_em, criado_em);
