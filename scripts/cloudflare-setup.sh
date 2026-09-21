#!/usr/bin/env bash
# Sobe a plataforma na Cloudflare, do zero, com um comando.
# ──────────────────────────────────────────────────────────────────────────
#   bash scripts/cloudflare-setup.sh
#
# Pode rodar quantas vezes quiser: cada passo verifica antes de agir. Se
# parar no meio, conserte o que ele apontou e rode de novo - ele pula tudo
# que já estava feito.
#
# Não faz nada escondido. Cada passo diz o que vai fazer, e quando falha diz
# O QUE deu errado e O QUE fazer - um script de implantação que morre com
# "Error: 10021" é pior do que nenhum.

set -uo pipefail
cd "$(dirname "$0")/.."

DB_NAME="hebraico-fluente"
# Versão fixa. Este script roda com TODOS os segredos de produção no ambiente
# (token da Cloudflare, Mercado Pago, Resend); `wrangler@4` resolvia para a
# versão mais nova a cada execução, e um pacote comprometido rodaria com tudo
# isso nas mãos. Subir de versão é uma edição deliberada, testada, aqui.
W="npx --yes wrangler@4.135.0"
# Vira 1 quando este script edita o wrangler.toml. No CI a edição é
# descartável (o runner some), então a publicação funciona mesmo assim - mas
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
  echo "  Depois de resolver, rode este script de novo - ele continua de onde parou."
  exit 1
}

echo
bold "Hebraico Fluente → Cloudflare"
echo

# ── 0. wrangler e login ───────────────────────────────────────────────────
# Roda igual na máquina de alguém e dentro do GitHub Actions. A única
# diferença é de onde vem a credencial: `wrangler login` grava um perfil
# local; no CI, o wrangler lê CLOUDFLARE_API_TOKEN do ambiente sozinho. Por
# isso não há dois caminhos aqui - só uma mensagem que serve aos dois.
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
  info "Não consegui ler o Account ID da saída do whoami - seguindo assim mesmo."
else
  ok "Conta $ACCOUNT"
  # O Account ID vem do PRÓPRIO TOKEN, e não de uma variável que alguém
  # digitou. Um id colado errado (ou de outra conta da mesma pessoa) faz a
  # Cloudflare responder 7003 - "could not route" - em vez de um erro de
  # permissão, e a mensagem manda procurar no lugar errado. Derivando daqui,
  # essa classe inteira de engano deixa de existir.
  if [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] && [ "$CLOUDFLARE_ACCOUNT_ID" != "$ACCOUNT" ]; then
    info "CLOUDFLARE_ACCOUNT_ID não bate com a conta do token - usando a do token."
  fi
  export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT"
fi

# ── 1. o banco ────────────────────────────────────────────────────────────
echo
bold "1. Banco D1"

# `d1 list` cobre o caso de o banco já existir de uma tentativa anterior -
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

  if [ -z "$DB_ID" ]; then
    # 7003 / "could not route" na rota de D1 quase nunca é o que parece. A
    # Cloudflare não responde 403 quando o token não carrega a permissão de
    # D1: ela responde que a ROTA não existe, porque para aquele token ela
    # realmente não existe. Quem lê a mensagem literal vai procurar id
    # inválido e não acha nada.
    if printf '%s' "$OUT" | grep -qE '7003|[Cc]ould not route'; then
      morre "O token não tem permissão de D1.

       A Cloudflare responde 'could not route ... [code: 7003]' em vez de um
       erro de permissão, porque para um token sem D1 essa rota realmente
       não existe. Não é id inválido." \
            "Não precisa criar outro token - dá para editar o que existe:

       1. https://dash.cloudflare.com/profile/api-tokens
       2. Na linha do token, menu ⋯ à direita → 'Edit'
       3. No quadro Permissions, clique em '+ Add more'
       4. Preencha a linha:  Account  |  D1  |  Edit
       5. 'Continue to summary' → 'Save'

       O valor do token NÃO muda - não precisa colar de novo no GitHub."
    fi
    morre "Não consegui criar o banco. O wrangler disse:

$(printf '%s' "$OUT" | sed 's/^/       /')" \
          "Se a mensagem fala em limite de bancos, apague um D1 que não usa
       no painel. Cole essa saída que eu resolvo."
  fi
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
# Aplica SEMPRE, e não só quando o banco está vazio.
#
# A versão anterior pulava este passo se `accounts` já existisse - e com isso
# uma tabela NOVA acrescentada ao esquema nunca seria criada num banco que já
# estava no ar. O sintoma seria a funcionalidade nova falhando em silêncio, em
# produção, com o esquema "já aplicado" no relatório.
#
# É seguro repetir: cada comando do arquivo é CREATE ... IF NOT EXISTS, então
# rodar de novo não toca em nada que exista nem apaga um dado sequer.
info "Aplicando worker/schema.sql…"
if $W d1 execute "$DB_NAME" --remote --file=worker/schema.sql >/dev/null 2>&1; then
  ok "Esquema em dia"
else
  morre "Falhou ao aplicar o esquema." \
        "Rode à mão para ver a mensagem inteira:
       npx wrangler d1 execute $DB_NAME --remote --file=worker/schema.sql"
fi

# ── 4. segredos ───────────────────────────────────────────────────────────
echo
bold "4. Segredos"
# Falha aqui é falha, e não "lista vazia". A versão anterior engolia o erro
# (`|| true`), lia a lista como vazia, concluía que SESSION_SECRET não existia
# e gerava OUTRO - e cada aluno logado caía fora no meio de uma publicação
# verde. Uma listagem que não deu certo não prova ausência de nada.
if ! SECRETS="$($W secret list 2>&1)"; then
  morre "Não consegui listar os segredos do Worker." \
        "Sem a lista não dá para saber se SESSION_SECRET existe, e gerar um
       novo por engano derruba a sessão de todo mundo. A resposta foi:
       $(printf '%s' "$SECRETS" | tail -5)"
fi
tem() { printf '%s' "$SECRETS" | grep -q "\"$1\"\|^$1\b"; }

if tem SESSION_SECRET; then
  ok "SESSION_SECRET definido"
else
  info "SESSION_SECRET não existe - gerando um e enviando…"
  if openssl rand -base64 48 | $W secret put SESSION_SECRET >/dev/null 2>&1; then
    ok "SESSION_SECRET criado"
  else
    morre "Não consegui gravar SESSION_SECRET." \
          "Rode à mão: npx wrangler secret put SESSION_SECRET
       (cole o resultado de: openssl rand -base64 48)"
  fi
fi

# Os da Mercado Pago: se o valor estiver no AMBIENTE (segredo do GitHub, ou
# exportado na sua máquina), ele é empurrado para o Worker. É o que evita a
# viagem ao painel da Cloudflare - os segredos ficam num lugar só, o mesmo
# onde já estão os da Cloudflare, e uma troca de chave é uma edição e um push.
#
# Empurra SEMPRE que o valor existe no ambiente, mesmo que o Worker já tenha
# um: é assim que rotacionar uma chave funciona. Sem isso, trocar o token no
# GitHub não trocaria nada e a pessoa passaria uma tarde entendendo por quê.
empurra() {
  local nome="$1" valor="$2"
  if [ -n "$valor" ]; then
    if printf '%s' "$valor" | $W secret put "$nome" >/dev/null 2>&1; then
      ok "$nome enviado ao Worker"
    else
      info "Não consegui enviar $nome - rode 'npx wrangler secret put $nome'."
    fi
  elif tem "$nome"; then
    ok "$nome já definido no Worker"
  else
    return 1
  fi
}

# PAGAMENTO_LIGADO guarda a resposta para o aviso do fim do script. Sem ele,
# a última linha da publicação continuava dizendo "falta: Mercado Pago" muito
# depois de a credencial ter entrado - e um relatório que pede uma coisa já
# feita ensina a não ler o relatório.
PAGAMENTO_LIGADO=1
empurra MP_ACCESS_TOKEN   "${MP_ACCESS_TOKEN:-}" \
  || { PAGAMENTO_LIGADO=0
       info "MP_ACCESS_TOKEN ausente - pagamento fica desligado (o site funciona)."; }
empurra MP_WEBHOOK_SECRET "${MP_WEBHOOK_SECRET:-}" \
  || info "MP_WEBHOOK_SECRET ausente - o webhook recusa tudo, de propósito."
empurra RESEND_API_KEY    "${RESEND_API_KEY:-}" \
  || info "RESEND_API_KEY ausente - ninguém recupera a senha sozinho (ver .env.example)."

# ── 5. construir ──────────────────────────────────────────────────────────
# HF_SKIP_BUILD=1 quando quem chama já construiu - é o caso do GitHub Actions,
# que constrói num passo próprio para aproveitar o cache do npm e para que uma
# falha de build apareça como falha de build, e não como falha de publicação.
echo
bold "5. Construir o site"
if [ "${HF_SKIP_BUILD:-0}" = "1" ] && [ -d app/out ]; then
  # Um app/out construído sem NEXT_PUBLIC_PLATFORM_API é a DEMONSTRAÇÃO: as
  # contas moram no navegador e qualquer pedido se aprova sozinho. Publicar
  # isso por cima da loja seria entregar o curso de graça com a tarja de
  # "demonstração" como único aviso. A tarja é prerenderizada no HTML, então
  # ela mesma é a prova.
  if grep -q 'Ambiente de demonstra' app/out/index.html 2>/dev/null; then
    morre "app/out é um build de DEMONSTRAÇÃO, não de plataforma." \
          "Reconstrua com: cd app && NEXT_PUBLIC_PLATFORM_API=worker npm run build
       (ou rode este script sem HF_SKIP_BUILD, que ele constrói certo)."
  fi
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
# Guardado antes de publicar, para a checagem logo abaixo.
HAVE_BEFORE="$(grep -oP 'SITE_ORIGIN\s*=\s*"\K[^"]+' wrangler.toml || true)"
DEPLOY="$($W deploy 2>&1)"
RC=$?

# Quem diz se publicou é o CÓDIGO DE SAÍDA do wrangler, e mais nada.
#
# A versão anterior decidia pela presença de uma URL workers.dev na saída, e
# isso quebrou no dia em que o domínio próprio entrou: com `routes` no
# wrangler.toml e sem `workers_dev`, o wrangler desliga o endereço
# workers.dev. A publicação correu inteira, criou os dois domínios e terminou
# em zero - e o script a declarou falha por não achar um endereço que a
# própria publicação tinha desativado. Ler o resultado de um comando pela
# forma do texto que ele imprime funciona até o texto mudar.
if [ "$RC" -ne 0 ]; then
  if printf '%s' "$DEPLOY" | grep -qi 'workers\.dev.*subdomain\|register.*subdomain'; then
    morre "O Worker subiu, mas a sua conta ainda não tem um subdomínio workers.dev." \
          "Painel → Workers & Pages → Overview → escolha o seu subdomínio.
       Depois rode este script de novo."
  fi
  morre "A publicação falhou. O wrangler disse:

$(printf '%s' "$DEPLOY" | tail -25 | sed 's/^/       /')" \
        "Cole essa mensagem que eu resolvo."
fi

# ── qual é o endereço, agora que publicou ────────────────────────────────
# Um domínio próprio declarado em `routes` É o endereço do site; o workers.dev
# ao lado dele é conferência. Sem domínio, o workers.dev é o endereço.
#
# Extrair a URL workers.dev é mais delicado do que parece, e o jeito ingênuo
# (primeiro workers.dev que aparecer) está ERRADO: antes de publicar, o
# wrangler imprime a tabela de bindings, e ela contém a nossa própria
# variável SITE_ORIGIN -
#
#   env.SITE_ORIGIN ("https://hebraico-fluente.workers.dev")   Environment Variable
#
# - que é justamente o valor de exemplo que estamos tentando substituir. Pegar
# essa linha faz o script "achar" uma URL que não existe, gravar o mesmo
# placeholder de volta e conferir um endereço morto.
#
# A URL de verdade tem TRÊS rótulos antes de workers.dev
# (<worker>.<subdomínio-da-conta>.workers.dev); o placeholder tem dois. É essa
# diferença que separa as duas com segurança.
URL="$(printf '%s' "$DEPLOY" \
  | grep -vE 'env\.|Environment Variable' \
  | grep -oE 'https://[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev' | tail -1)"

# Rede de segurança contra a armadilha descrita acima: se a URL extraída for
# igual ao SITE_ORIGIN que já estava no arquivo, é sinal de que pegamos a
# linha de binding em vez do endereço publicado. Parar aqui é melhor do que
# seguir e conferir um endereço morto - que foi o sintoma original.
if [ "$URL" = "${HAVE_BEFORE:-}" ] && [ "${HAVE_BEFORE:-}" = "https://hebraico-fluente.workers.dev" ]; then
  morre "A URL extraída é o valor de exemplo, não o endereço publicado." \
        "É um defeito deste script na leitura da saída do wrangler.
       Me mande a saída inteira de 'npx wrangler deploy'."
fi

# O domínio próprio sai do wrangler.toml, e não da saída do wrangler: é o
# arquivo que manda em qual endereço o site atende. O www é descartado aqui
# porque ele existe para redirecionar, não para ser o endereço.
DOMINIO="$(grep -oP 'pattern\s*=\s*"\K[^"]+(?="\s*,\s*custom_domain\s*=\s*true)' wrangler.toml \
  | grep -v '^www\.' | head -1)"

if [ -n "$DOMINIO" ]; then
  ok "No ar: https://$DOMINIO"
  [ -n "$URL" ] && info "Conferência: $URL"
  URL="https://$DOMINIO"
elif [ -n "$URL" ]; then
  ok "No ar: $URL"
else
  morre "O wrangler publicou sem erro, mas não sobrou endereço nenhum: não há
       domínio próprio em 'routes' e o workers.dev não apareceu na saída." \
        "Acrescente 'workers_dev = true' ao wrangler.toml, ou declare o
       domínio em 'routes'. Um dos dois precisa existir."
fi

# ── 7. SITE_ORIGIN ────────────────────────────────────────────────────────
# O cron não tem requisição de onde deduzir a origem, e o back_urls da
# Mercado Pago é montado a partir dela. Errada, o comprador volta para o
# lugar errado depois de pagar.
echo
bold "7. SITE_ORIGIN"
HAVE="$(grep -oP 'SITE_ORIGIN\s*=\s*"\K[^"]+' wrangler.toml || true)"

# Um SITE_ORIGIN que NÃO é workers.dev é uma escolha, não um resíduo.
#
# Este passo existe para preencher o endereço na primeira publicação de uma
# conta nova, quando o único endereço que existe é o workers.dev. No dia em
# que um domínio próprio entra, o endereço passa a ser o domínio - e um
# script que continuasse "corrigindo" o arquivo para o workers.dev desfaria a
# mudança em toda publicação, silenciosamente. O sintoma seria caro e
# indireto: o comprador voltaria da Mercado Pago para o endereço errado.
case "$HAVE" in
  https://*.workers.dev|'') ;;                 # ainda no endereço de fábrica
  *)
    # Se o workers.dev responde ou não é decisão do wrangler.toml, e a
    # mensagem lê de lá: afirmar "continua respondendo" sem olhar foi
    # verdade por um tempo e depois virou uma linha que mentia a cada
    # publicação, no meio de uma saída que ninguém lê com desconfiança.
    if grep -qE '^\s*workers_dev\s*=\s*true\s*$' wrangler.toml; then
      ok "Domínio próprio em uso: $HAVE (o workers.dev também responde)"
    else
      ok "Domínio próprio em uso: $HAVE (só ele: workers_dev = false)"
    fi
    URL="$HAVE"
    ;;
esac

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
  info "SITE_ORIGIN ← $URL - republicando…"
  PATCHED=1
  $W deploy >/dev/null 2>&1 && ok "Republicado" || info "A republicação falhou; rode 'npx wrangler deploy'."
fi

# ── 8. o desafio de bot da zona ───────────────────────────────────────────
# O "Bot Fight Mode" da Cloudflare desafia o que ela julga automatizado. Isso
# soa bom até lembrar que ESTE SITE É UMA API: /api/auth/login, /api/me,
# /api/progress e o webhook de pagamento são todas requisições sem navegador
# do outro lado, e todas passam pela mesma porta.
#
# O que aconteceu aqui: o domínio entrou, a zona veio com o desafio ligado, e
# a publicação seguinte recebeu 403 em TUDO - capa, API, saúde. Nas trinta e
# uma linhas vermelhas não havia uma palavra sobre Cloudflare; o motivo só
# apareceu quando o navegador tentou carregar
# `challenges.cloudflare.com/cdn-cgi/challenge-platform` e falhou.
#
# Por isso isto é parte da publicação, e não um lembrete no README: é uma
# configuração que quebra o produto e que ninguém associa ao produto.
#
# Nunca derruba a publicação. O token padrão de Workers não tem permissão de
# zona, e nesse caso o passo diz exatamente o que acrescentar - do mesmo
# jeito que o passo do D1 faz com o erro 7003.
echo
bold "8. Desafio de bot na zona"
ZONA="$(printf '%s' "$URL" | sed -e 's#^https\?://##' -e 's#/.*##')"
case "$ZONA" in
  ''|*.workers.dev)
    info "Sem domínio próprio - a zona não é nossa, nada a fazer."
    ;;
  *)
    CFAPI="https://api.cloudflare.com/client/v4"
    # O token vai por um arquivo de configuração do curl, e não em `-H` na
    # linha de comando: argumentos de processo são legíveis por qualquer
    # outro processo da máquina enquanto o curl roda.
    CFCONF="$(mktemp)"; trap 'rm -f "$CFCONF"' EXIT
    printf 'header = "Authorization: Bearer %s"\nheader = "Content-Type: application/json"\n' \
      "${CLOUDFLARE_API_TOKEN:-}" > "$CFCONF"
    cf() { curl -s -K "$CFCONF" "$@"; }
    # O nome da zona é o domínio registrável: `hebraicofluente.com.br` tem
    # três rótulos, e é ele que a Cloudflare conhece - não um subdomínio.
    ZID="$(cf "$CFAPI/zones?name=$ZONA" | python3 -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: d={}
r=(d.get('result') or [])
print(r[0]['id'] if r else '')
" 2>/dev/null)"

    if [ -z "$ZID" ]; then
      info "Não consegui ler a zona $ZONA com este token."
      info "Se o site responder 403 a tudo, é quase certo ser o Bot Fight Mode."
      info "Acrescente ao token: Zone | Zone | Read  e  Zone | Bot Management | Edit"
      info "(ou desligue à mão: painel → $ZONA → Security → Bots)."
    else
      ATUAL="$(cf "$CFAPI/zones/$ZID/bot_management" | python3 -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: d={}
print(str((d.get('result') or {}).get('fight_mode','?')).lower())
" 2>/dev/null)"

      case "$ATUAL" in
        false)
          ok "Bot Fight Mode já está desligado"
          ;;
        true)
          info "Bot Fight Mode está LIGADO - ele desafia a nossa própria API. Desligando…"
          RESP="$(cf -X PUT "$CFAPI/zones/$ZID/bot_management" --data '{"fight_mode":false}')"
          if printf '%s' "$RESP" | grep -q '"success":true'; then
            ok "Bot Fight Mode desligado"
          else
            erro "Não consegui desligar. A Cloudflare respondeu:"
            printf '%s\n' "$RESP" | head -c 400 | sed 's/^/       /'
            echo
            info "Falta permissão no token: Zone | Bot Management | Edit."
            info "Ou desligue à mão: painel → $ZONA → Security → Bots."
          fi
          ;;
        *)
          info "Não consegui ler o estado do Bot Fight Mode (token sem Bot Management)."
          info "Se o site responder 403 a tudo, desligue à mão em Security → Bots."
          ;;
      esac

      # ── freio na BORDA ───────────────────────────────────────────────
      # O Worker já freia toda rota da API, e isso é a defesa que conta: ela
      # sabe de quem é a conta, quantas falhas houve, e responde um código
      # que o app entende. O que ela não faz é ser barata: cada recusa custa
      # uma execução do Worker e uma escrita no D1. A borda recusa ANTES,
      # sem gastar nada nosso.
      #
      # Duas decisões que valem a nota:
      #
      # · A ação é `block`, nunca `managed_challenge`. Um desafio devolve uma
      #   PÁGINA para um `fetch()` que espera JSON - o login não mostraria
      #   "muitas tentativas", mostraria um erro incompreensível, e o
      #   comprador legítimo atrás de um IP compartilhado ficaria de fora sem
      #   entender o quê. Bloquear é honesto: o app já sabe ler um 429.
      #
      # · Os tetos são altos de propósito. Estes números não existem para
      #   substituir o freio do Worker (30 tentativas de senha por minuto ali
      #   continuam valendo); existem para cortar o que é ordens de grandeza
      #   maior - o laço que tenta dez mil senhas, não a pessoa que errou a
      #   sua três vezes. Um teto apertado aqui derruba cliente de verdade em
      #   rede corporativa, e ninguém descobre o motivo.
      #
      # TRÊS coisas variam com o plano da zona, e cada uma foi descoberta do
      # jeito caro - publicando e lendo o erro. Por isso aqui não há um chute:
      # há uma ESCADA, e o script desce por ela até achar o degrau que a zona
      # aceita. O que varia:
      #
      # · QUANTAS regras cabem. O gratuito permite uma; os pagos, mais. As
      #   regras vão em ordem de valor e o script tenta do conjunto inteiro
      #   para baixo.
      #
      # · QUE JANELA cabe. O gratuito só aceita 10 segundos, e recusou 60 com
      #   "not entitled to use the period 60, can only use a period among
      #   [10]" - a recusa DIZ o que existe, então o script lê e usa.
      #
      # · QUAIS CARACTERÍSTICAS de contagem cabem. Aqui eu não sei de cor qual
      #   plano aceita o quê, e é justamente por isso que é escada: tenta
      #   `ip.src + cf.colo.id` (que é o que um plano pago quer) e, se recusar,
      #   `ip.src` sozinho.
      #
      # O TETO não encolhe junto com a janela, de propósito. Converter
      # "30 por minuto" para "5 por 10 segundos" manteria a taxa média e
      # apertaria a rajada seis vezes - e um teto apertado aqui derruba um
      # escritório inteiro atrás de um IP só, sem ninguém descobrir o motivo.
      # Esta camada não existe para ser o freio fino (esse é o do Worker, que
      # continua valendo); existe para cortar o que é ordens de grandeza
      # maior. 30 pedidos em 10 segundos já é muito além de qualquer pessoa.
      #
      # E o relato NUNCA fica calado. Uma versão anterior deste passo imprimia
      # os primeiros 300 bytes do JSON cru (que não cabia a resposta formatada
      # da Cloudflare) e depois passou a imprimir as mensagens do JSON - que
      # numa das recusas vieram vazias, deixando na tela "A Cloudflare disse:"
      # seguido de nada. Um diagnóstico que pode ficar em branco é pior do que
      # nenhum, porque parece que não houve erro.
      echo
      bold "8b. Freio na borda"
      RLSET="$CFAPI/zones/$ZID/rulesets/phases/http_ratelimit/entrypoint"

      regra() { # caminho teto segundos descricao caracteristicas-separadas-por-virgula
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

      posta() { # rules-json
        cf -X PUT "$RLSET" --data "{\"rules\":[$1]}"
      }

      # As janelas que a recusa disser que existem, na ordem em que vieram.
      # Vazio quando o erro for outro - e aí não há segunda tentativa a fazer.
      periodos_oferecidos() { # resposta-json
        printf '%s' "$1" | python3 -c "
import sys,re
t=sys.stdin.read()
m=re.search(r'can only use a period among \[([0-9, ]+)\]', t)
print(' '.join(m.group(1).replace(' ','').split(',')) if m else '')
" 2>/dev/null
      }

      # O motivo da recusa, em uma linha, e NUNCA em branco.
      #
      # Primeiro tenta as mensagens do JSON, que é a forma legível. Se não vier
      # nenhuma - resposta vazia, um 502 do caminho, um HTML de portal - cai
      # para a resposta crua encolhida numa linha. Uma versão anterior deste
      # passo imprimia "A Cloudflare disse:" e nada, e passar a impressão de
      # que não houve erro é o pior resultado possível para um diagnóstico.
      motivo() { # resposta-json → uma linha
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

      # Da mais específica para a mais geral: a Cloudflare aplica a primeira
      # que casar, então `/api/*` por último ou ele engoliria as outras.
      tentar() { # janela caracteristicas → 0 e imprime, ou 1
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
          # Guarda o que a zona disse, uma vez por motivo distinto. É este
          # registro que fica no resumo quando nenhum degrau serve.
          local M; M="$(motivo "$RESP")"
          case "$VISTOS" in
            *"$M"*) ;;
            *) VISTOS="${VISTOS}${VISTOS:+
}${J}s · ${CAR} → ${M}" ;;
          esac
        done
        return 1
      }

      # A escada, do degrau que um plano pago aceita para o que o gratuito
      # aceita. `periodos_oferecidos` entra no meio: quando a recusa de 60s diz
      # quais janelas existem, é essa a próxima tentada - a API sabe melhor que
      # uma lista escrita aqui.
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

      if [ "$APLICOU" = "0" ]; then
        # Nunca derruba a publicação: é defesa em profundidade, e a camada
        # que conta (o Worker) já está de pé.
        info "Não consegui criar as regras de freio na borda. Cada degrau tentado,"
        info "e o que a Cloudflare respondeu:"
        printf '%s\n' "$VISTOS" | sed 's/^/       /'
        info "Se algum motivo falar em permissão, acrescente ao token:"
        info "  Zone | Zone WAF | Edit   (ou Rulesets | Edit)"
        info "Ou crie à mão em Security → WAF → Rate limiting rules:"
        info "  /api/auth/* e /api/pay/*  30 por janela, por IP · bloquear"
        info "  /api/*                   300 por janela, por IP · bloquear"
        info "O freio do Worker continua valendo de qualquer jeito."
      fi
    fi
    ;;
esac

# ── 9. conferir ───────────────────────────────────────────────────────────
echo
bold "9. Conferir o que subiu"

# Espera o endereço começar a responder. Um domínio próprio recém-criado leva
# alguns minutos até o certificado sair e a rota valer - conferir antes disso
# produz uma tela de falhas que não são falhas.
#
# Deixa o último código em ULTIMO em vez de imprimi-lo: numa substituição de
# comando, tudo que a função escrevesse na saída seria engolido - inclusive o
# "respondeu depois de tantos segundos", que é a informação útil quando dá
# certo na terceira tentativa.
ULTIMO=''
espera_subir() {
  local alvo="$1" i
  for i in $(seq 1 24); do
    ULTIMO="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$alvo/" 2>/dev/null)"
    if [ "$ULTIMO" = "200" ]; then
      [ "$i" -gt 1 ] && info "Respondeu depois de $((i * 5))s."
      return 0
    fi
    sleep 5
  done
  return 1
}

if ! espera_subir "$URL"; then
  # Dois minutos sem 200. Antes de despejar trinta falhas iguais, a pergunta
  # que importa é se o problema é o WORKER ou o ENDEREÇO - e é exatamente para
  # isso que o workers.dev existe (ver `workers_dev` no wrangler.toml).
  erro "$URL respondeu $ULTIMO por 2 minutos, e não 200."
  DEV="$(printf '%s' "$DEPLOY" | grep -vE 'env\.|Environment Variable' \
        | grep -oE 'https://[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev' | tail -1)"
  if [ -n "$DEV" ]; then
    DEVC="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$DEV/" 2>/dev/null)"
    if [ "$DEVC" = "200" ]; then
      info "Mas $DEV responde 200: o Worker está bom, o problema é o domínio."
      info "Olhe a zona no painel: regra de segurança, Bot Fight Mode, modo"
      info "\"Under Attack\", ou o certificado do domínio ainda saindo."
      info "Conferindo pelo workers.dev, para que as checagens abaixo valham."
      URL="$DEV"
    else
      info "E $DEV respondeu $DEVC: o problema está no Worker, não no domínio."
    fi
  fi
fi

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
  echo "  exemplo - funciona aqui e falha para quem publicar de outro lugar."
  echo
fi
if [ "$PAGAMENTO_LIGADO" = "0" ]; then
  echo "  Falta, quando você quiser:"
  echo "   · Mercado Pago: os dois segredos e o webhook em $URL/api/pay/webhook"
else
  echo "  Pagamento ligado. O webhook da Mercado Pago aponta para:"
  echo "   · $URL/api/pay/webhook"
fi
echo
exit $RC
