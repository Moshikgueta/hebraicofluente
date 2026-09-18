-- Hebraico Fluente — esquema D1.
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
--  2. Todo pagamento que chega — webhook, verificação, varredura — é gravado
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
-- servidor — caro para nós, barato para quem tenta.
CREATE TABLE IF NOT EXISTS throttle (
  key        TEXT    NOT NULL,
  window_at  INTEGER NOT NULL,
  hits       INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_at)
);

-- Trilha do que mexeu em acesso. É o que responde "por que essa pessoa perdeu
-- o curso?" três meses depois, quando ninguém lembra.
CREATE TABLE IF NOT EXISTS access_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER,
  action     TEXT NOT NULL,
  detail     TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
