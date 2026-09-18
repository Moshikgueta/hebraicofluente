#!/bin/bash
# Prova de ponta a ponta do Worker, contra um `wrangler dev` local.
# ──────────────────────────────────────────────────────────────────────────
# O que ela cobre é o que não pode estar errado: quem entra, quem é barrado,
# quanto é cobrado e o que acontece quando o acesso vence. O que ela NÃO cobre
# é a Mercado Pago de verdade — com um token falso, criar um pedido tem de
# falhar limpo (502) e deixar o pedido registrado, e é isso que o passo C
# verifica.
#
# Rodar:
#   npm run build:platform
#   npx wrangler d1 execute hebraico-fluente --file=worker/schema.sql --local
#   npx wrangler dev --local --port 8787 &
#   bash worker/e2e.sh
#
# Precisa de um .dev.vars com SESSION_SECRET (ver .env.example). Os valores de
# Mercado Pago podem ser falsos: nada aqui chega a cobrar.
#
# ⚠ Não use `curl -o /dev/stdout` neste arquivo. Quando a saída do script está
# redirecionada para um arquivo, /dev/stdout É esse arquivo, e o curl o abre
# truncando — cada chamada apagaria tudo que veio antes. Levou uma execução
# inteira para descobrir isso.

set -u
B="${HF_BASE:-http://127.0.0.1:8787}"
JAR="$(mktemp)"
MAIL="teste$RANDOM@exemplo.br"
fails=0

G() { curl -s --noproxy '*' "$@"; }

# espera <descrição> <esperado> <obtido>
espera() {
  if [ "$2" = "$3" ]; then
    printf '  ✓ %s\n' "$1"
  else
    printf '  ✗ %s — esperava %s, veio %s\n' "$1" "$2" "$3"
    fails=$((fails + 1))
  fi
}

code()     { G -o /dev/null -w '%{http_code}' "$@"; }
location() { G -o /dev/null -D - -H 'Sec-Fetch-Dest: document' "$@" \
               | grep -i '^location:' | sed 's/^[Ll]ocation: *//' | tr -d '\r'; }

# Primeiro a saúde. Sem isto, uma publicação sem banco ou sem SESSION_SECRET
# produz nove falhas idênticas — todas "veio 500" — e nenhuma delas diz qual
# das três peças está faltando. Com isto, a causa aparece na primeira linha.
echo "Saúde"
HEALTH="$(G --max-time 15 "$B/api/health")"
campo() { printf '%s' "$HEALTH" | grep -o "\"$1\":[a-z]*" | cut -d: -f2; }
espera "ligação com o banco (D1)"      true "$(campo db)"
espera "tabelas criadas (schema.sql)"  true "$(campo schema)"
espera "SESSION_SECRET definido"       true "$(campo session)"
if [ "$(campo payments)" != "true" ]; then
  echo "  · pagamento desligado (MP_ACCESS_TOKEN ausente) — o site funciona assim"
fi
if [ "$(campo ok)" != "true" ]; then
  echo
  echo "  A publicação está incompleta. As falhas abaixo são consequência disso;"
  echo "  conserte o que está marcado ✗ aqui em cima primeiro."
  echo
fi

echo "Sessão e portão"
espera "/api/me sem sessão recusa"            401 "$(code $B/api/me)"
espera "rota paga sem sessão manda ao login"  "$B/entrar/?next=%2Flicao%2Falef%2F" \
       "$(location $B/licao/alef/)"
espera "página pública abre"                  200 "$(code $B/cursos/alfabetizacao/)"

echo "Conta"
espera "criar conta" 200 "$(G -c "$JAR" -o /dev/null -w '%{http_code}' -X POST $B/api/auth/signup \
  -H 'content-type: application/json' \
  -d "{\"name\":\"Teste\",\"email\":\"$MAIL\",\"password\":\"cavalo correto\"}")"
espera "/api/me com sessão" 200 "$(G -b "$JAR" -o /dev/null -w '%{http_code}' $B/api/me)"
espera "e-mail repetido" 409 "$(G -o /dev/null -w '%{http_code}' -X POST $B/api/auth/signup \
  -H 'content-type: application/json' \
  -d "{\"name\":\"Outro\",\"email\":\"$MAIL\",\"password\":\"outra senha\"}")"
espera "senha curta" 400 "$(G -o /dev/null -w '%{http_code}' -X POST $B/api/auth/signup \
  -H 'content-type: application/json' -d '{"email":"x@exemplo.br","password":"1234"}')"
espera "senha errada" 401 "$(G -o /dev/null -w '%{http_code}' -X POST $B/api/auth/login \
  -H 'content-type: application/json' -d "{\"email\":\"$MAIL\",\"password\":\"errada!!\"}")"
# O e-mail é normalizado: entrar com outra caixa e espaços tem de funcionar.
espera "e-mail normalizado" 200 "$(G -c "$JAR" -o /dev/null -w '%{http_code}' -X POST $B/api/auth/login \
  -H 'content-type: application/json' \
  -d "{\"email\":\"  $(echo "$MAIL" | tr '[:lower:]' '[:upper:]') \",\"password\":\"cavalo correto\"}")"

echo "Portão com conta, sem compra"
espera "vai para a página do curso" "$B/cursos/alfabetizacao/" "$(location -b "$JAR" $B/meu-hebraico/)"

echo "Cobrança"
# Duas situações legítimas, e a checagem se adapta:
#
#   · MP_ACCESS_TOKEN configurado → o pedido nasce, e o valor tem de ser o do
#     catálogo: R$147 com 10% de desconto no PIX = 13230 centavos. É a prova de
#     que o preço sai do servidor e não do navegador.
#   · sem token → 503 `payments-off`, e NENHUM pedido é criado. Também é o
#     comportamento certo: um pendente que nunca vai compensar é pior do que
#     uma recusa clara.
#
# O que seria erro é qualquer outra coisa — e é isso que o `case` separa.
pay_code=$(G -b "$JAR" -o /dev/null -w '%{http_code}' -X POST $B/api/pay/create \
  -H 'content-type: application/json' -d '{"courseSlug":"alfabetizacao","method":"pix"}')
case "$pay_code" in
  503)
    espera "pagamento ainda não ligado, e diz isso" 503 "$pay_code"
    espera "e nenhum pedido órfão foi criado" "" \
      "$(G -b "$JAR" $B/api/orders | grep -o '"amountCents":[0-9]*' | head -1 | cut -d: -f2)"
    ;;
  *)
    espera "o pedido ficou registrado com o preço do servidor" 13230 \
      "$(G -b "$JAR" $B/api/orders | grep -o '"amountCents":[0-9]*' | head -1 | cut -d: -f2)"
    ;;
esac
espera "curso fora de venda é recusado" 404 "$(G -b "$JAR" -o /dev/null -w '%{http_code}' \
  -X POST $B/api/pay/create -H 'content-type: application/json' \
  -d '{"courseSlug":"hebraico-a1","method":"pix"}')"
espera "pedido de outra pessoa não é lido" 404 "$(code -b "$JAR" "$B/api/pay/verify?order=HFNAOEXISTE")"

echo "Webhook"
espera "sem assinatura, recusa" 401 "$(code -X POST "$B/api/pay/webhook?type=payment&data.id=1")"

echo "Saída"
G -b "$JAR" -c "$JAR" -o /dev/null -X POST $B/api/auth/logout
espera "depois de sair, /api/me recusa" 401 "$(G -b "$JAR" -o /dev/null -w '%{http_code}' $B/api/me)"

rm -f "$JAR"

# Contra produção, a passagem deixa rastro: uma conta de teste e, se o
# pagamento estiver ligado, um pedido. Nada disso é bonito num banco de
# verdade, então o script entrega a limpeza pronta em vez de deixar para quem
# lembrar depois — que é ninguém.
if [ "$B" != "http://127.0.0.1:8787" ]; then
  cat <<LIMPEZA

Esta passagem criou a conta de teste $MAIL.
Para apagá-la do banco de produção:

  npx wrangler d1 execute hebraico-fluente --remote --command \\
    "DELETE FROM orders WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM entitlements WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM accounts WHERE email = '$MAIL'"
LIMPEZA
fi

if [ "$fails" -eq 0 ]; then
  echo
  echo "tudo certo."
else
  echo
  echo "$fails verificação(ões) falharam."
  exit 1
fi
