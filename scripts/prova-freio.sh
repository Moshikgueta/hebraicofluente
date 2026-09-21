#!/usr/bin/env bash
# Ensaio do freio na borda, sem tocar na Cloudflare.
# ─────────────────────────────────────────────────────────────────────────
# O passo 8b do cloudflare-setup.sh desce uma escada de tentativas até achar o
# degrau que o plano da zona aceita. Cada degrau custou uma publicação para ser
# descoberto - primeiro a permissão do token, depois a janela de 60s que o plano
# gratuito recusa, depois uma recusa que veio sem mensagem nenhuma. Publicar de
# novo para descobrir o quarto degrau é caro e lento.
#
# Então aqui a escada roda contra um `posta` de mentira, que devolve as respostas
# REAIS que a Cloudflare já deu. O que este ensaio prova:
#
#   1. numa zona gratuita (recusa 60s, recusa cf.colo.id, aceita ip.src+10s),
#      a escada chega ao degrau certo sozinha;
#   2. numa zona paga, acerta na primeira e não desce escada nenhuma;
#   3. quando NENHUM degrau serve, o relatório mostra cada tentativa com o que
#      a zona respondeu - e nunca fica em branco, que era o defeito;
#   4. uma resposta vazia ou um HTML de portal não quebram nem silenciam.
#
#   bash scripts/prova-freio.sh
set -uo pipefail

ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
CONTA="$(mktemp)"; trap 'rm -f "$CONTA"' EXIT
chamadas() { wc -l < "$CONTA" | tr -d ' '; }
info() { printf '  · %s\n' "$*"; }
falhou=0

# ── as respostas reais que a Cloudflare já devolveu ──────────────────────
R_PERIODO='{"result":null,"success":false,"errors":[{"message":"not entitled to use the period 60, can only use a period among [10]","source":{"pointer":"/rules/0/ratelimit/period"}}],"messages":[]}'
R_CARACT='{"result":null,"success":false,"errors":[{"message":"not entitled to use the characteristic cf.colo.id","source":{"pointer":"/rules/0/ratelimit/characteristics"}}],"messages":[]}'
R_QUANTAS='{"result":null,"success":false,"errors":[{"message":"exceeded maximum number of rules for this plan","source":{"pointer":"/rules"}}],"messages":[]}'
R_AUTH='{"success":false,"errors":[{"code":10000,"message":"Authentication error"}],"messages":[],"result":null}'
R_OK='{"result":{"rules":[{"id":"abc"}]},"success":true,"errors":[],"messages":[]}'
R_VAZIA=''
R_HTML='<!DOCTYPE html><html><head><title>502</title></head><body>bad gateway</body></html>'

# ── o trecho sob ensaio, copiado do cloudflare-setup.sh ──────────────────
# Copiado e não importado porque o script real fala com a API de verdade na
# primeira linha. O que importa é que a LÓGICA seja a mesma; se alguém mudar uma
# e não a outra, o teste 1 para de bater com a produção e é isso que se vê.
regra() { # caminho teto segundos descricao caracteristicas
  python3 - "$1" "$2" "$3" "$4" "$5" <<'PY'
import json,sys
caminho,teto,janela,desc,caract=sys.argv[1:6]
print(json.dumps({
  "description": desc,
  "expression": f'(http.request.uri.path wildcard "{caminho}")',
  "action": "block",
  "ratelimit": {
    "characteristics": [c for c in caract.split(',') if c],
    "period": int(janela),
    "requests_per_period": int(teto),
    "mitigation_timeout": int(janela),
  },
}))
PY
}

periodos_oferecidos() {
  printf '%s' "$1" | python3 -c "
import sys,re
t=sys.stdin.read()
m=re.search(r'can only use a period among \[([0-9, ]+)\]', t)
print(' '.join(m.group(1).replace(' ','').split(',')) if m else '')
" 2>/dev/null
}

motivo() {
  printf '%s' "$1" | python3 -c "
import sys,json,re
t=sys.stdin.read()
try: d=json.loads(t)
except Exception: d={}
ms=[]
for e in (d.get('errors') or []):
    p=(e.get('source') or {}).get('pointer','')
    ms.append(f\"{e.get('message','?')}{' at ' + p if p else ''}\")
if ms: print(' | '.join(ms))
else:
    cru=re.sub(r'\s+',' ',t).strip()
    print(cru[:220] if cru else '(resposta vazia - a chamada não chegou a responder)')
" 2>/dev/null
}

tentar() {
  local J="$1" CAR="$2"
  local A B C
  A="$(regra '/api/auth/*' 30 "$J" "HF: freio em /api/auth/* (30 por ${J}s por IP)" "$CAR")"
  B="$(regra '/api/pay/*'  30 "$J" "HF: freio em /api/pay/* (30 por ${J}s por IP)" "$CAR")"
  C="$(regra '/api/*'     300 "$J" "HF: freio em /api/* (300 por ${J}s por IP)" "$CAR")"
  for TENTATIVA in "$A,$B,$C" "$A,$C" "$A"; do
    RESP="$(posta "$TENTATIVA")"
    if printf '%s' "$RESP" | grep -q '"success":true'; then
      APLICOU="$(printf '%s' "$TENTATIVA" | grep -o '"description"' | wc -l | tr -d ' ')"
      ok "Freio na borda ativo: $APLICOU regra(s), janela de ${J}s, contando por ${CAR}."
      return 0
    fi
    local M; M="$(motivo "$RESP")"
    case "$VISTOS" in
      *"$M"*) ;;
      *) VISTOS="${VISTOS}${VISTOS:+
}${J}s · ${CAR} → ${M}" ;;
    esac
  done
  return 1
}

escada() {
  APLICOU=0
  VISTOS=""
  for CAR in 'ip.src,cf.colo.id' 'ip.src'; do
    JANELAS="60"
    tentar 60 "$CAR" && break
    for J in $(periodos_oferecidos "${RESP:-}") 10; do
      case " $JANELAS " in *" $J "*) continue ;; esac
      JANELAS="$JANELAS $J"
      tentar "$J" "$CAR" && break 2
    done
  done
}

# ── 1. zona gratuita: recusa 60s, recusa cf.colo.id, aceita ip.src + 10s ──
echo
echo "1. zona gratuita (recusa 60s e cf.colo.id; uma regra só, de 10s, por IP)"
# O contador vai para um ARQUIVO, não para uma variável: `posta` é chamada
# dentro de `$( )`, que é subshell, e um incremento ali não volta para cá.
: > "$CONTA"
posta() {
  echo x >> "$CONTA"
  local n; n="$(printf '%s' "$1" | grep -o '"description"' | wc -l | tr -d ' ')"
  # A janela e as características saem do próprio corpo enviado.
  if printf '%s' "$1" | grep -q '"period": 60'; then printf '%s' "$R_PERIODO"; return; fi
  if printf '%s' "$1" | grep -q 'cf.colo.id';      then printf '%s' "$R_CARACT";  return; fi
  if [ "$n" -gt 1 ]; then printf '%s' "$R_QUANTAS"; return; fi
  printf '%s' "$R_OK"
}
escada
if [ "$APLICOU" = "1" ]; then ok "chegou ao degrau certo em $(chamadas) chamadas"
else info "FALHOU: esperava 1 regra aplicada, veio '$APLICOU'"; falhou=1; fi

# ── 2. zona paga: acerta na primeira ─────────────────────────────────────
echo
echo "2. zona paga (aceita tudo na primeira tentativa)"
: > "$CONTA"
posta() { echo x >> "$CONTA"; printf '%s' "$R_OK"; }
escada
if [ "$APLICOU" = "3" ] && [ "$(chamadas)" = "1" ]; then
  ok "as três regras, numa chamada só - sem descer escada"
else info "FALHOU: esperava 3 regras em 1 chamada, veio '$APLICOU' em $(chamadas)"; falhou=1; fi

# ── 3. nada serve: o relatório tem de mostrar cada degrau ────────────────
echo
echo "3. token sem permissão (nenhum degrau serve)"
posta() { printf '%s' "$R_AUTH"; }
escada
if [ "$APLICOU" = "0" ] && printf '%s' "$VISTOS" | grep -q 'Authentication error'; then
  ok "relatou o motivo em vez de ficar em branco:"
  printf '%s\n' "$VISTOS" | sed 's/^/        /'
else info "FALHOU: relatório vazio ou sem o motivo"; falhou=1; fi

# ── 4. respostas que não são JSON não podem silenciar ────────────────────
echo
echo "4. resposta vazia, e um 502 em HTML"
for R in "$R_VAZIA" "$R_HTML"; do
  M="$(motivo "$R")"
  if [ -n "$M" ]; then ok "descreveu: ${M:0:60}"
  else info "FALHOU: motivo em branco"; falhou=1; fi
done

echo
if [ "$falhou" = "0" ]; then
  echo "Os quatro casos passaram."
else
  echo "Algum caso falhou."
  exit 1
fi
