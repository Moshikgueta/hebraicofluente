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

# Quem respondeu, quando não foi o nosso Worker.
# ──────────────────────────────────────────────────────────────────────────
# Uma publicação em que TODAS as verificações falham com o mesmo código não é
# trinta e uma falhas: é uma só, e nenhuma das trinta e uma linhas diz qual.
# Aconteceu com um 403 em tudo - e "403" sozinho não distingue o Worker
# recusando, a Cloudflare bloqueando o curl, e um domínio que ainda não
# entrega. A resposta está nos cabeçalhos e no <title>, e eles custam uma
# chamada.
#
# Só roda quando alguma coisa já falhou, e uma vez.
diagnostico_feito=0
diagnostico() {
  [ "$diagnostico_feito" = "1" ] && return 0
  diagnostico_feito=1
  local url="$1" cab corpo
  echo
  echo "  Quem está respondendo em $url:"
  cab="$(G -o /dev/null -D - -H 'Sec-Fetch-Dest: document' "$url" 2>/dev/null)"
  # Os cabeçalhos que dizem de quem é a resposta. `cf-mitigated` aparece
  # quando é a Cloudflare barrando (WAF, Bot Fight Mode, Under Attack); a
  # ausência dele com `server: cloudflare` aponta para o Worker ou para o
  # roteamento do domínio.
  printf '%s' "$cab" | grep -iE '^(HTTP/|server:|cf-ray:|cf-mitigated:|cf-cache-status:|content-type:)' \
    | sed 's/^/    /' | tr -d '\r'
  corpo="$(G -H 'Sec-Fetch-Dest: document' "$url" 2>/dev/null)"
  local titulo
  titulo="$(grep -oiE '<title[^>]*>[^<]*' <<<"$corpo" | head -1 | sed 's/<[^>]*>//')"
  [ -n "$titulo" ] && echo "    título: $titulo"
  # O texto visível das primeiras linhas, sem marcação. Numa página de bloqueio
  # da Cloudflare é aqui que aparece o motivo em português claro.
  sed -e 's/<[^>]*>/ /g' -e 's/  */ /g' <<<"$corpo" | grep -vE '^\s*$' | head -4 \
    | sed 's/^ */    /'
  echo
}

# Primeiro a saúde. Sem isto, uma publicação sem banco ou sem SESSION_SECRET
# produz nove falhas idênticas - todas "veio 500" - e nenhuma delas diz qual
# das três peças está faltando. Com isto, a causa aparece na primeira linha.
echo "Saúde"

# A saúde é consultada com algumas tentativas, e não uma vez só.
#
# Quando esta conferência roda logo depois de uma publicação - que é o caso no
# CI -, os primeiros segundos ainda podem ser respondidos pela versão ANTERIOR
# do Worker. Um campo que acabou de nascer volta ausente, e a checagem acusa
# uma falha que não existe: foi exatamente isso que aconteceu quando `progresso`
# entrou. Quinze segundos de paciência cobrem a propagação; passado isso, o
# campo ausente é falha de verdade e é assim que ela aparece.
HEALTH=''
for _ in 1 2 3 4 5; do
  HEALTH="$(G --max-time 15 "$B/api/health")"
  # O campo MAIS NOVO é o sinal de que a versão nova já está respondendo.
  # Trocar quando um campo novo entra faz parte de acrescentá-lo.
  case "$HEALTH" in *'"recuperacao"'*) break ;; esac
  sleep 3
done
campo() { grep -o "\"$1\":[a-z]*" <<<"$HEALTH" | cut -d: -f2; }
espera "ligação com o banco (D1)"      true "$(campo db)"
espera "tabelas criadas (schema.sql)"  true "$(campo schema)"
espera "tabela de progresso criada"    true "$(campo progresso)"
espera "tabela de recuperação criada"  true "$(campo recuperacao)"
espera "SESSION_SECRET definido"       true "$(campo session)"
if [ "$(campo payments)" != "true" ]; then
  echo "  · pagamento desligado (MP_ACCESS_TOKEN ausente) - o site funciona assim"
fi
# Sem provedor de e-mail o site sobe inteiro e "esqueci minha senha" não
# entrega o link a ninguém. Não é falha de publicação - é uma peça que falta,
# e ela precisa aparecer no log em vez de ficar implícita.
if [ "$(campo email)" != "true" ]; then
  echo "  · e-mail desligado (RESEND_API_KEY ou EMAIL_FROM ausente) - ninguém"
  echo "    recupera a senha sozinho. Ver .env.example."
elif [ "$(campo emailEntregue)" = "false" ]; then
  # O estado mais perigoso dos três, e o único que não se parece com um
  # problema: a chave existe, a saúde diz que sim, a tela diz "o link está a
  # caminho" - e o último envio foi RECUSADO. Quase sempre é o domínio do
  # remetente ainda não verificado na Resend. Por isso vira ✗, e não aviso.
  espera "o último e-mail de senha saiu" true false
  echo "    A chave existe, mas a Resend recusou o último envio. Quase sempre é"
  echo "    o domínio de EMAIL_FROM ainda não verificado. O motivo exato está no"
  echo "    log do Worker e na trilha (access_log, ação 'forgot-falhou')."
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
  c="$(code -H 'Sec-Fetch-Dest: document' "$B$p")"
  espera "$p abre" 200 "$c"
  # A primeira página que não abre já diz quem respondeu. Sem isto, as dez
  # linhas seguintes repetem o mesmo código sem acrescentar nada.
  [ "$c" = "200" ] || diagnostico "$B$p"
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
#
# `<<<` e não `printf | grep -q`: o `-q` sai no primeiro acerto e fecha o
# cano, e aí o printf do outro lado imprime "write error: Broken pipe" no log
# de uma verificação que PASSOU. Ruído desse tipo ensina a ignorar log.
espera "a capa tem um título com texto" true \
  "$(grep -qE '<h1[^>]*>[^<]{12,}' <<<"$HOME_HTML" && echo true || echo false)"
espera "a capa traz a marca" true \
  "$(grep -q 'Hebraico Fluente' <<<"$HOME_HTML" && echo true || echo false)"

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

# ── senha ────────────────────────────────────────────────────────────────
# O que dá para provar de FORA, sem ler a caixa de entrada de ninguém.
#
# O ciclo completo - pedir, receber o e-mail, redefinir - é provado contra um
# SQLite de verdade em app/tests/senha.test.ts, com o e-mail interceptado na
# saída. O que só aparece AQUI, contra o que está publicado, é se as rotas
# existem, se as telas abrem, e - a mais importante - se a resposta de
# `forgot` é idêntica para um e-mail que existe e um que não existe. Essa é a
# propriedade que impede o formulário de recuperação de virar uma lista de
# quem é cliente, e ela é observável exatamente de onde um curioso olharia.
echo "Senha"
for p in "/esqueci-senha/" "/nova-senha/"; do
  espera "$p abre sem conta" 200 "$(code -H 'Sec-Fetch-Dest: document' "$B$p")"
done

pede_link() {
  G -X POST "$B/api/auth/forgot" -H 'content-type: application/json' -d "{\"email\":\"$1\"}"
}
EXISTE="$(pede_link "$MAIL")"
NAO_EXISTE="$(pede_link "hf-e2e-fantasma-$RANDOM@example.invalid")"
espera "pedir o link responde 200" 200 "$(G -o /dev/null -w '%{http_code}' \
  -X POST "$B/api/auth/forgot" -H 'content-type: application/json' \
  -d "{\"email\":\"$MAIL\"}")"
espera "a resposta não diz se a conta existe" "$EXISTE" "$NAO_EXISTE"

espera "token inventado é recusado" 400 "$(G -o /dev/null -w '%{http_code}' \
  -X POST "$B/api/auth/reset" -H 'content-type: application/json' \
  -d '{"token":"nao-existe-este-token","password":"outra senha boa"}')"

espera "trocar a senha sem sessão recusa" 401 "$(G -o /dev/null -w '%{http_code}' \
  -X POST "$B/api/auth/password" -H 'content-type: application/json' \
  -d '{"current":"cavalo correto","password":"outra senha boa"}')"
espera "trocar a senha com a atual errada recusa" 401 "$(G -b "$JAR" -o /dev/null \
  -w '%{http_code}' -X POST "$B/api/auth/password" -H 'content-type: application/json' \
  -d '{"current":"chute","password":"outra senha boa"}')"

# A troca de verdade, e as duas consequências que importam. `-c` grava o
# cookie novo que vem na resposta; `VELHO` guarda o anterior para provar que
# ele morreu - que é o ponto inteiro de trocar a senha por desconfiança.
VELHO="$(mktemp)"; cp "$JAR" "$VELHO"
espera "trocar a senha com a atual certa" 200 "$(G -b "$JAR" -c "$JAR" -o /dev/null \
  -w '%{http_code}' -X POST "$B/api/auth/password" -H 'content-type: application/json' \
  -d '{"current":"cavalo correto","password":"outra senha boa"}')"
espera "o cookie novo continua valendo" 200 "$(G -b "$JAR" -o /dev/null -w '%{http_code}' "$B/api/me")"
espera "o cookie antigo caiu" 401 "$(G -b "$VELHO" -o /dev/null -w '%{http_code}' "$B/api/me")"
rm -f "$VELHO"
espera "a senha nova entra" 200 "$(G -c "$JAR" -o /dev/null -w '%{http_code}' \
  -X POST "$B/api/auth/login" -H 'content-type: application/json' \
  -d "{\"email\":\"$MAIL\",\"password\":\"outra senha boa\"}")"
espera "a senha antiga não entra mais" 401 "$(G -o /dev/null -w '%{http_code}' \
  -X POST "$B/api/auth/login" -H 'content-type: application/json' \
  -d "{\"email\":\"$MAIL\",\"password\":\"cavalo correto\"}")"

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
    "DELETE FROM orders          WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM entitlements    WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM progress        WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM password_resets WHERE account_id = (SELECT id FROM accounts WHERE email = '$MAIL');
     DELETE FROM accounts WHERE email = '$MAIL'"

(Toda tabela que aponta para accounts precisa estar aí, antes do DELETE das
contas - senão o banco recusa tudo com "FOREIGN KEY constraint failed" e a
conta fica. Ver worker/schema.sql.)
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
