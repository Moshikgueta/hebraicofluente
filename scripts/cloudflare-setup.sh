#!/usr/bin/env bash
# Sobe a plataforma na Cloudflare, do zero, com um comando.
# ──────────────────────────────────────────────────────────────────────────
#   bash scripts/cloudflare-setup.sh
#
# Pode rodar quantas vezes quiser: cada passo verifica antes de agir. Se
# parar no meio, conserte o que ele apontou e rode de novo — ele pula tudo
# que já estava feito.
#
# Não faz nada escondido. Cada passo diz o que vai fazer, e quando falha diz
# O QUE deu errado e O QUE fazer — um script de implantação que morre com
# "Error: 10021" é pior do que nenhum.

set -uo pipefail
cd "$(dirname "$0")/.."

DB_NAME="hebraico-fluente"
W="npx --yes wrangler@4"
# Vira 1 quando este script edita o wrangler.toml. No CI a edição é
# descartável (o runner some), então a publicação funciona mesmo assim — mas
# o arquivo do repositório continua com o valor de exemplo, e é isso que o
# aviso do fim cobra.
PATCHED=0

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$*"; }
info()  { printf '  · %s\n' "$*"; }
erro()  { printf '  \033[31m✗\033[0m %s\n' "$*"; }

# morre <o que falhou> <o que fazer>
morre() {
  echo
  erro "$1"
  echo
  printf '  \033[1mO que fazer:\033[0m %s\n' "$2"
  echo
  echo "  Depois de resolver, rode este script de novo — ele continua de onde parou."
  exit 1
}

echo
bold "Hebraico Fluente → Cloudflare"
echo

# ── 0. wrangler e login ───────────────────────────────────────────────────
# Roda igual na máquina de alguém e dentro do GitHub Actions. A única
# diferença é de onde vem a credencial: `wrangler login` grava um perfil
# local; no CI, o wrangler lê CLOUDFLARE_API_TOKEN do ambiente sozinho. Por
# isso não há dois caminhos aqui — só uma mensagem que serve aos dois.
bold "0. Conta"
WHO="$($W whoami 2>&1)"
if echo "$WHO" | grep -qi "not authenticated\|you are not logged in\|please run.*login"; then
  morre "O wrangler não está autenticado." \
        "Na sua máquina: 'npx wrangler login' (abre o navegador).
       No GitHub Actions ou em servidor sem navegador: defina
       CLOUDFLARE_API_TOKEN (modelo 'Edit Cloudflare Workers', mais D1:Edit)."
fi
ACCOUNT="$(echo "$WHO" | grep -oE '[0-9a-f]{32}' | head -1)"
if [ -z "$ACCOUNT" ]; then
  info "Não consegui ler o Account ID da saída do whoami — seguindo assim mesmo."
else
  ok "Conta $ACCOUNT"
fi

# ── 1. o banco ────────────────────────────────────────────────────────────
echo
bold "1. Banco D1"

# `d1 list` cobre o caso de o banco já existir de uma tentativa anterior —
# `d1 create` falharia com "already exists" e o script pararia por nada.
LIST="$($W d1 list --json 2>/dev/null)"
DB_ID="$(printf '%s' "$LIST" \
  | python3 -c "
import sys,json
try: rows=json.load(sys.stdin)
except Exception: rows=[]
print(next((r.get('uuid') or r.get('id','') for r in rows if r.get('name')=='$DB_NAME'), ''))
" 2>/dev/null)"

if [ -n "$DB_ID" ]; then
  ok "Já existe: $DB_ID"
else
  info "Criando '$DB_NAME'…"
  OUT="$($W d1 create "$DB_NAME" 2>&1)"
  DB_ID="$(printf '%s' "$OUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)"
  [ -n "$DB_ID" ] || morre "Não consegui criar o banco. O wrangler disse:

$(printf '%s' "$OUT" | sed 's/^/       /')" \
        "Se a mensagem fala em limite de bancos, apague um D1 que não usa no
       painel. Se fala em permissão, o token precisa de D1:Edit além de
       Workers:Edit."
  ok "Criado: $DB_ID"
fi

# ── 2. colar o id no wrangler.toml ────────────────────────────────────────
echo
bold "2. wrangler.toml"
CURRENT="$(grep -oP 'database_id\s*=\s*"\K[^"]+' wrangler.toml || true)"
if [ "$CURRENT" = "$DB_ID" ]; then
  ok "database_id já está certo"
else
  python3 - "$DB_ID" <<'PY'
import re, sys
p = 'wrangler.toml'
s = open(p, encoding='utf8').read()
s = re.sub(r'(database_id\s*=\s*")[^"]*(")', lambda m: m.group(1) + sys.argv[1] + m.group(2), s, count=1)
open(p, 'w', encoding='utf8').write(s)
PY
  ok "database_id ← $DB_ID"
  PATCHED=1
fi

# ── 3. tabelas ────────────────────────────────────────────────────────────
echo
bold "3. Tabelas"
if $W d1 execute "$DB_NAME" --remote --command \
     "SELECT 1 FROM accounts LIMIT 1" >/dev/null 2>&1; then
  ok "Esquema já aplicado"
else
  info "Aplicando worker/schema.sql…"
  if $W d1 execute "$DB_NAME" --remote --file=worker/schema.sql >/dev/null 2>&1; then
    ok "Tabelas criadas"
  else
    morre "Falhou ao aplicar o esquema." \
          "Rode à mão para ver a mensagem inteira:
       npx wrangler d1 execute $DB_NAME --remote --file=worker/schema.sql"
  fi
fi

# ── 4. segredos ───────────────────────────────────────────────────────────
echo
bold "4. Segredos"
SECRETS="$($W secret list 2>/dev/null || true)"
tem() { printf '%s' "$SECRETS" | grep -q "\"$1\"\|^$1\b"; }

if tem SESSION_SECRET; then
  ok "SESSION_SECRET definido"
else
  info "SESSION_SECRET não existe — gerando um e enviando…"
  if openssl rand -base64 48 | $W secret put SESSION_SECRET >/dev/null 2>&1; then
    ok "SESSION_SECRET criado"
  else
    morre "Não consegui gravar SESSION_SECRET." \
          "Rode à mão: npx wrangler secret put SESSION_SECRET
       (cole o resultado de: openssl rand -base64 48)"
  fi
fi

# Sem os da Mercado Pago a plataforma SOBE e funciona — só o pagamento fica
# desligado, e o checkout diz isso na tela. Por isso é aviso, não parada.
tem MP_ACCESS_TOKEN   && ok "MP_ACCESS_TOKEN definido" \
  || info "MP_ACCESS_TOKEN ausente — pagamento fica desligado (o site funciona)."
tem MP_WEBHOOK_SECRET && ok "MP_WEBHOOK_SECRET definido" \
  || info "MP_WEBHOOK_SECRET ausente — o webhook recusa tudo, de propósito."

# ── 5. construir ──────────────────────────────────────────────────────────
# HF_SKIP_BUILD=1 quando quem chama já construiu — é o caso do GitHub Actions,
# que constrói num passo próprio para aproveitar o cache do npm e para que uma
# falha de build apareça como falha de build, e não como falha de publicação.
echo
bold "5. Construir o site"
if [ "${HF_SKIP_BUILD:-0}" = "1" ] && [ -d app/out ]; then
  ok "Já construído ($(find app/out -type f | wc -l | tr -d ' ') arquivos)"
else
  if [ ! -d app/node_modules ]; then
    info "Instalando dependências (demora na primeira vez)…"
    (cd app && npm ci) >/dev/null 2>&1 || morre "npm ci falhou em app/." \
      "Rode 'cd app && npm ci' para ver o erro."
  fi
  info "next build em modo plataforma…"
  if (cd app && NEXT_PUBLIC_PLATFORM_API=worker npm run build) >/tmp/hf-build.log 2>&1; then
    ok "app/out pronto ($(find app/out -type f | wc -l | tr -d ' ') arquivos)"
  else
    morre "O build falhou. Últimas linhas:

$(tail -20 /tmp/hf-build.log | sed 's/^/       /')" \
          "O log inteiro está em /tmp/hf-build.log"
  fi
fi

# ── 6. publicar ───────────────────────────────────────────────────────────
echo
bold "6. Publicar"
DEPLOY="$($W deploy 2>&1)"
URL="$(printf '%s' "$DEPLOY" | grep -oE 'https://[a-z0-9.-]+\.workers\.dev' | head -1)"

if [ -z "$URL" ]; then
  if printf '%s' "$DEPLOY" | grep -qi 'workers\.dev.*subdomain\|register.*subdomain'; then
    morre "O Worker subiu, mas a sua conta ainda não tem um subdomínio workers.dev." \
          "Painel → Workers & Pages → Overview → escolha o seu subdomínio.
       Depois rode este script de novo."
  fi
  morre "A publicação falhou. O wrangler disse:

$(printf '%s' "$DEPLOY" | tail -25 | sed 's/^/       /')" \
        "Cole essa mensagem que eu resolvo."
fi
ok "No ar: $URL"

# ── 7. SITE_ORIGIN ────────────────────────────────────────────────────────
# O cron não tem requisição de onde deduzir a origem, e o back_urls da
# Mercado Pago é montado a partir dela. Errada, o comprador volta para o
# lugar errado depois de pagar.
echo
bold "7. SITE_ORIGIN"
HAVE="$(grep -oP 'SITE_ORIGIN\s*=\s*"\K[^"]+' wrangler.toml || true)"
if [ "$HAVE" = "$URL" ]; then
  ok "Já aponta para $URL"
else
  python3 - "$URL" <<'PY'
import re, sys
p = 'wrangler.toml'
s = open(p, encoding='utf8').read()
s = re.sub(r'(SITE_ORIGIN\s*=\s*")[^"]*(")', lambda m: m.group(1) + sys.argv[1] + m.group(2), s, count=1)
open(p, 'w', encoding='utf8').write(s)
PY
  info "SITE_ORIGIN ← $URL — republicando…"
  PATCHED=1
  $W deploy >/dev/null 2>&1 && ok "Republicado" || info "A republicação falhou; rode 'npx wrangler deploy'."
fi

# ── 8. conferir ───────────────────────────────────────────────────────────
echo
bold "8. Conferir o que subiu"
for _ in $(seq 1 12); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$URL/" 2>/dev/null)" = "200" ] && break
  sleep 5
done
HF_BASE="$URL" bash worker/e2e.sh
RC=$?

echo
if [ $RC -eq 0 ]; then
  bold "Pronto. $URL"
else
  bold "Subiu, mas alguma verificação falhou (acima)."
fi

echo
if [ "$PATCHED" = "1" ]; then
  echo "  O wrangler.toml foi editado (database_id e/ou SITE_ORIGIN):"
  echo "    git add wrangler.toml && git commit -m 'database_id e SITE_ORIGIN'"
  echo "  Sem esse commit, o arquivo do repositório continua com o valor de"
  echo "  exemplo — funciona aqui e falha para quem publicar de outro lugar."
  echo
fi
echo "  Falta, quando você quiser:"
echo "   · Mercado Pago: os dois segredos e o webhook em $URL/api/pay/webhook"
echo "   · Domínio próprio: painel → o Worker → Settings → Domains & Routes"
echo
exit $RC
