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
R_CARACT='{"result":null,"success":false,"errors":[{"message":"'"'"'[ip.src]'"'"' is not a valid value for characteristics because characteristics field is missing '"'"'cf.colo.id'"'"', this is required as ratelimiting counting is processed at colocation level only","source":{"pointer":"/rules/0/ratelimit/characteristics"}}],"messages":[]}'
R_QUANTAS='{"result":null,"success":false,"errors":[{"message":"exceeded maximum number of rules for this plan","source":{"pointer":"/rules"}}],"messages":[]}'
R_AUTH='{"success":false,"errors":[{"code":10000,"message":"Authentication error"}],"messages":[],"result":null}'
# A Cloudflare responde JSON FORMATADO - com espaço depois dos dois-pontos.
# Foi exatamente isso que um `grep '"success":true'` não reconheceu, fazendo o
# script relatar fracasso sobre uma escrita que tinha funcionado. A resposta de
# sucesso deste ensaio é formatada de propósito.
R_OK='{
  "result": {
    "id": "9891b3d8e2a045c7998e6452f9ea8830",
    "phase": "http_ratelimit",
    "rules": [ { "action": "block", "description": "HF: freio em /api/auth/*" } ]
  },
  "success": true,
  "errors": [],
  "messages": []
}'
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

sucesso() {
  printf '%s' "$1" | python3 -c "
import sys,json
try: sys.exit(0 if json.load(sys.stdin).get('success') is True else 1)
except Exception: sys.exit(1)
" 2>/dev/null
}

CARACT='ip.src,cf.colo.id'

tentar() {
  local J="$1"
  local A B C
  A="$(regra '/api/auth/*' 30 "$J" "HF: freio em /api/auth/* (30 por ${J}s por IP)" "$CARACT")"
  B="$(regra '/api/pay/*'  30 "$J" "HF: freio em /api/pay/* (30 por ${J}s por IP)" "$CARACT")"
  C="$(regra '/api/*'     300 "$J" "HF: freio em /api/* (300 por ${J}s por IP)" "$CARACT")"
  for TENTATIVA in "$A,$B,$C" "$A,$C" "$A"; do
    RESP="$(posta "$TENTATIVA")"
    if sucesso "$RESP"; then
      APLICOU="$(printf '%s' "$TENTATIVA" | grep -o '"description"' | wc -l | tr -d ' ')"
      ok "Freio na borda: $APLICOU regra(s) enviada(s), janela de ${J}s."
      return 0
    fi
    local M; M="$(motivo "$RESP")"
    case "$VISTOS" in
      *"$M"*) ;;
      *) VISTOS="${VISTOS}${VISTOS:+
}${J}s → ${M}" ;;
    esac
  done
  return 1
}

escada() {
  APLICOU=0
  VISTOS=""
  JANELAS="60"
  if ! tentar 60; then
    for J in $(periodos_oferecidos "${RESP:-}") 10; do
      case " $JANELAS " in *" $J "*) continue ;; esac
      JANELAS="$JANELAS $J"
      tentar "$J" && break
    done
  fi
}

# ── 1. zona gratuita: recusa 60s, recusa cf.colo.id, aceita ip.src + 10s ──
echo
echo "1. zona gratuita (recusa janela de 60s; aceita uma regra de 10s)"
# O contador vai para um ARQUIVO, não para uma variável: `posta` é chamada
# dentro de `$( )`, que é subshell, e um incremento ali não volta para cá.
: > "$CONTA"
posta() {
  echo x >> "$CONTA"
  local n; n="$(printf '%s' "$1" | grep -o '"description"' | wc -l | tr -d ' ')"
  # A janela e as características saem do próprio corpo enviado.
  # `cf.colo.id` é obrigatório em qualquer plano: um corpo sem ele é recusado,
  # e o nosso sempre o inclui. Esta é a condição que o simulador anterior tinha
  # ao contrário, por um palpite meu - e foi o palpite que o caso reprovou.
  if ! printf '%s' "$1" | grep -q 'cf.colo.id'; then printf '%s' "$R_CARACT"; return; fi
  if printf '%s' "$1" | grep -q '"period": 60'; then printf '%s' "$R_PERIODO"; return; fi
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

# ── 4. o defeito que custou duas publicações ─────────────────────────────
echo
echo "4. a resposta de sucesso vem FORMATADA (foi o que o grep não leu)"
if printf '%s' "$R_OK" | grep -q '"success":true'; then
  info "FALHOU: a resposta do ensaio não está formatada - o caso não vale nada"
  falhou=1
else
  ok "o grep antigo NÃO reconhece esta resposta (era o defeito)"
fi
if sucesso "$R_OK"; then ok "o leitor de JSON reconhece"
else info "FALHOU: o leitor novo também não reconheceu"; falhou=1; fi

# ── 5. respostas que não são JSON não podem silenciar ────────────────────
echo
echo "5. resposta vazia, e um 502 em HTML"
for R in "$R_VAZIA" "$R_HTML"; do
  M="$(motivo "$R")"
  if [ -n "$M" ]; then ok "descreveu: ${M:0:60}"
  else info "FALHOU: motivo em branco"; falhou=1; fi
done

echo
if [ "$falhou" = "0" ]; then
  echo "Os cinco casos passaram."
else
  echo "Algum caso falhou."
  exit 1
fi
