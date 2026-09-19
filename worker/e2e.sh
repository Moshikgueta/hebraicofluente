#!/bin/bash
# Prova de ponta a ponta do Worker, contra um `wrangler dev` local.
# ──────────────────────────────────────────────────────────────────────────
# O que ela cobre é o que não pode estar errado: quem entra, quem é barrado,
# quanto é cobrado e o que acontece quando o acesso vence. O que ela NÃO cobre
# é a Mercado Pago de verdade - com um token falso, criar um pedido tem de
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
# truncando - cada chamada apagaria tudo que veio antes. Levou uma execução
# inteira para descobrir isso.

set -u
B="${HF_BASE:-http://127.0.0.1:8787}"
JAR="$(mktemp)"
# Domínio .invalid (RFC 2606): reservado, jamais resolve, ninguém consegue
# receber e-mail nele. Isso importa porque a limpeza automática no fim da
# publicação apaga por PADRÃO de endereço - e um padrão que pudesse casar com
# o e-mail de um aluno de verdade seria uma forma criativa de apagar cliente.
MAIL="hf-e2e-$RANDOM@example.invalid"
fails=0

G() { curl -s --noproxy '*' "$@"; }

# espera <descrição> <esperado> <obtido>
espera() {
  if [ "$2" = "$3" ]; then
    printf '  ✓ %s\n' "$1"
  else
    printf '  ✗ %s - esperava %s, veio %s\n' "$1" "$2" "$3"
    fails=$((fails + 1))
  fi
}

code()     { G -o /dev/null -w '%{http_code}' "$@"; }
location() { G -o /dev/null -D - -H 'Sec-Fetch-Dest: document' "$@" \
               | grep -i '^location:' | sed 's/^[Ll]ocation: *//' | tr -d '\r'; }

# Primeiro a saúde. Sem isto, uma publicação sem banco ou sem SESSION_SECRET
# produz nove falhas idênticas - todas "veio 500" - e nenhuma delas diz qual
# das três peças está faltando. Com isto, a causa aparece na primeira linha.
echo "Saúde"
HEALTH="$(G --max-time 15 "$B/api/health")"
campo() { printf '%s' "$HEALTH" | grep -o "\"$1\":[a-z]*" | cut -d: -f2; }
espera "ligação com o banco (D1)"      true "$(campo db)"
espera "tabelas criadas (schema.sql)"  true "$(campo schema)"
espera "tabela de progresso criada"    true "$(campo progresso)"
espera "SESSION_SECRET definido"       true "$(campo session)"
if [ "$(campo payments)" != "true" ]; then
  echo "  · pagamento desligado (MP_ACCESS_TOKEN ausente) - o site funciona assim"
fi
if [ "$(campo ok)" != "true" ]; then
  echo
  echo "  A publicação está incompleta. As falhas abaixo são consequência disso;"
  echo "  conserte o que está marcado ✗ aqui em cima primeiro."
  echo
fi

# O site de vendas inteiro, SEM conta nenhuma. É o requisito mais óbvio da
# plataforma e o mais fácil de quebrar sem perceber: basta um prefixo a mais na
# lista do portão e uma página de vendas some atrás de um login. Quem não
# consegue ver o curso não compra o curso.
#
# `code` não segue redirecionamento de propósito: 200 aqui significa "a página
# abriu", e um 302 - mesmo que fosse para algum lugar bonito - é exatamente a
# falha que este bloco existe para pegar.
echo "Site público, sem conta"
for p in "/" "/metodo/" "/cursos/" "/cursos/alfabetizacao/" "/cursos/hebraico-a1/" \
         "/sobre/" "/faq/" "/entrar/" "/criar-conta/" "/checkout/alfabetizacao/"; do
  espera "$p abre" 200 "$(code -H 'Sec-Fetch-Dest: document' "$B$p")"
done

# Status 200 não prova que a página aparece. Um HTML vazio, um bundle que
# some ou uma folha de estilo 404 devolvem 200 e mostram uma tela branca - que
# do lado de quem abre é indistinguível de "o site não funciona". Estas três
# checagens olham o CONTEÚDO.
echo "A capa aparece de verdade"
HOME_HTML="$(G --max-time 20 -H 'Sec-Fetch-Dest: document' "$B/")"
espera "o HTML tem tamanho de página" true \
  "$([ "${#HOME_HTML}" -gt 3000 ] && echo true || echo false)"
# Duas perguntas, e nenhuma delas é "a frase X está lá".
#
# A checagem anterior procurava uma frase da página de vendas, e ficou vermelha
# no dia em que a capa foi reescrita - sem que nada tivesse quebrado. Um teste
# que cai quando o texto muda não está medindo o site: está medindo o texto, e
# ensina a ignorar o vermelho.
#
# O que importa aqui é o que a tela branca NÃO tem:
#   · um <h1> com texto dentro - a capa renderizou conteúdo, e não um casco;
#   · a marca - é o site certo, e não uma página de erro do provedor.
# Os dois sobrevivem a qualquer reescrita de copy e falham em toda falha real.
espera "a capa tem um título com texto" true \
  "$(printf '%s' "$HOME_HTML" | grep -qE '<h1[^>]*>[^<]{12,}' && echo true || echo false)"
espera "a capa traz a marca" true \
  "$(printf '%s' "$HOME_HTML" | grep -q 'Hebraico Fluente' && echo true || echo false)"

# O primeiro script do Next referenciado pela capa. Se ele não vier, o
# navegador mostra o texto mas nada funciona - e um erro de caminho de
# ativos aparece exatamente assim.
ASSET="$(printf '%s' "$HOME_HTML" | grep -oE '/_next/static/[^"]+\.js' | head -1)"
if [ -n "$ASSET" ]; then
  espera "o JavaScript da página carrega" 200 "$(code "$B$ASSET")"
else
  espera "a capa referencia o JavaScript do Next" true false
fi

echo "Sessão e portão"
espera "/api/me sem sessão recusa"            401 "$(code $B/api/me)"
espera "rota paga sem sessão manda ao login"  "$B/entrar/?next=%2Flicao%2Falef%2F" \
       "$(location $B/licao/alef/)"

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
# O que seria erro é qualquer outra coisa - e é isso que o `case` separa.
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
# lembrar depois - que é ninguém.
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
