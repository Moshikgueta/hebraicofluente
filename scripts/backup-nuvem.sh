#!/usr/bin/env bash
# O backup do banco, todo dia, guardado fora do banco - e provado.
# ──────────────────────────────────────────────────────────────────────────
#   bash scripts/backup-nuvem.sh copiar            # o que a Action roda todo dia
#   bash scripts/backup-nuvem.sh ensaiar [chave]   # restaura uma cópia num banco de teste
#   bash scripts/backup-nuvem.sh conferir ARQ.sql  # só a prova, num banco local
#
# POR QUE EXISTE. O D1 é o único lugar onde moram as contas, os direitos de
# acesso, os pedidos e o progresso de todos os alunos. O Time Travel da
# Cloudflare volta o banco para um instante dos últimos 30 dias, mas não
# sobrevive a apagar o banco nem a perder a conta. A auditoria de 28/09/2026
# (INFRA-001) marcou isso como o único P0: sem cópia fora do banco, um
# acidente leva todos os alunos de uma vez.
#
# ONDE FICA. No R2, um bucket PRIVADO da mesma conta Cloudflare
# (`hebraico-fluente-backups`), criado por este script na primeira vez:
#   diario/hebraico-fluente-AAAAMMDD-HHMMSS.sql.gz   uma por dia, 90 dias
#   ultimo/hebraico-fluente.sql.gz                   sempre a mais recente
# As diárias somem sozinhas depois de 90 dias (regra de ciclo de vida do
# bucket). A política de privacidade precisa dizer esse prazo (LEGAL-007).
#
# NUNCA num artefato do Actions nem no repositório: o arquivo tem o e-mail de
# todo aluno e o hash de cada senha. O bucket não tem acesso público; quem lê
# é quem já tem a conta Cloudflare, que também lê o banco.
#
# PROVADO, NÃO ESPERADO. Um backup que nunca foi restaurado é uma esperança.
#   · `copiar` restaura cada cópia num banco LOCAL antes de enviar, e só
#     envia se todas as tabelas voltarem com o mesmo número de linhas que
#     saíram. Uma cópia que não restaura faz a Action falhar - e avisar.
#   · `ensaiar` baixa uma cópia do R2 e restaura num banco de TESTE na
#     Cloudflare (`hebraico-fluente-ensaio`), confere as contagens e apaga o
#     banco de teste. É a prova de que dá para voltar do zero. Rodar uma vez
#     agora e depois uma vez por mês.

set -uo pipefail
cd "$(dirname "$0")/.."

DB="hebraico-fluente"
ENSAIO_DB="hebraico-fluente-ensaio"
BUCKET="${HF_BACKUP_BUCKET:-hebraico-fluente-backups}"
REGRA="expira-diarias-90-dias"
DIAS=90
# Mesma versão fixa da publicação: estes comandos rodam com o token da conta.
W="${HF_WRANGLER:-npx --yes wrangler@4.135.0}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

vermelho() { printf '\033[31m%s\033[0m\n' "$*"; }
verde()    { printf '\033[32m%s\033[0m\n' "$*"; }
info()     { printf '  %s\n' "$*"; }
morre()    { vermelho "✗ $1"; [ $# -gt 1 ] && printf '\n  %s\n' "$2"; exit 1; }

# Uma linha no resumo da execução do Actions (e nada fora dele).
resumo() { [ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"; return 0; }

# ── contagens ─────────────────────────────────────────────────────────────
# Quantas linhas de cada tabela SAÍRAM, lidas do próprio arquivo. O export do
# D1 escreve um INSERT por linha de tabela, e toda linha de dados começa com
# `INSERT INTO`; um valor com quebra de linha continua na linha seguinte,
# que não começa assim.
contar_no_arquivo() { # arquivo.sql -> "tabela n" por linha
  # As tabelas internas (sqlite_sequence, _cf_*, d1_*) ficam de fora dos dois
  # lados: guardam contadores do próprio SQLite, não dado de aluno.
  sed -nE 's/^INSERT INTO "?([A-Za-z0-9_]+)"? .*/\1/p' "$1" \
    | grep -vE '^(sqlite_|_cf_|d1_)' | sort | uniq -c | awk '{print $2, $1}'
}

# Quantas linhas de cada tabela VOLTARAM, perguntadas ao banco restaurado.
# $@ = como chegar nele: `--local --persist-to DIR` ou `--remote`.
contar_no_banco() { # nome-do-banco args... -> "tabela n" por linha
  local nome="$1"; shift
  local tabelas sql
  tabelas="$($W d1 execute "$nome" "$@" --json --command \
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY name" \
    2>"$TMP/erro-tabelas" | node -e '
      let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
        const r=JSON.parse(s);console.log(r[0].results.map(x=>x.name).join(" "));});')" \
    || { cat "$TMP/erro-tabelas" >&2; return 1; }
  [ -n "$tabelas" ] || return 1
  # Uma linha só, uma coluna por tabela. UNION ALL não serve: o D1 recusa
  # mais que poucos termos num SELECT composto ("too many terms").
  sql=""
  for t in $tabelas; do
    [ -n "$sql" ] && sql="$sql, "
    sql="${sql}(SELECT COUNT(*) FROM \"$t\") AS \"$t\""
  done
  $W d1 execute "$nome" "$@" --json --command "SELECT $sql" 2>"$TMP/erro-contagem" | node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const r=JSON.parse(s);
      if (!Array.isArray(r)) { console.error(JSON.stringify(r)); process.exit(1); }
      for (const [t,n] of Object.entries(r[0].results[0])) console.log(t, n);});' \
    || { cat "$TMP/erro-contagem" >&2; return 1; }
}

# Compara o que saiu com o que voltou. Toda tabela do banco restaurado tem de
# ter exatamente as linhas que o arquivo carregava (zero, se não carregava).
comparar() { # saiu.txt voltou.txt -> 0 se tudo bate
  node -e '
    const fs=require("fs");
    const ler=f=>Object.fromEntries(fs.readFileSync(f,"utf8").trim().split("\n")
      .filter(Boolean).map(l=>{const [t,n]=l.split(" ");return [t,Number(n)];}));
    const saiu=ler(process.argv[1]), voltou=ler(process.argv[2]);
    let ok=Object.keys(voltou).length>0;
    const nomes=[...new Set([...Object.keys(saiu),...Object.keys(voltou)])].sort();
    for (const t of nomes) {
      const a=saiu[t]??0, b=voltou[t];
      const bate=b!==undefined && a===b;
      if(!bate) ok=false;
      console.log(`${bate?"✓":"✗"} ${t.padEnd(22)} saiu ${String(a).padStart(6)} · voltou ${b===undefined?"(tabela ausente)":String(b).padStart(6)}`);
    }
    process.exit(ok?0:1);' "$1" "$2"
}

# Restaura um .sql num banco LOCAL descartável e compara. Nunca toca a nuvem.
conferir_local() { # arquivo.sql
  local arq="$1" dir="$TMP/restaura-local"
  rm -rf "$dir"; mkdir -p "$dir"
  $W d1 execute "$DB" --local --persist-to "$dir" --file="$arq" -y \
    >"$TMP/restaura.log" 2>&1 \
    || morre "A cópia NÃO restaurou num banco local." "$(tail -20 "$TMP/restaura.log")"
  contar_no_arquivo "$arq" > "$TMP/saiu.txt"
  contar_no_banco "$DB" --local --persist-to "$dir" > "$TMP/voltou.txt" \
    || morre "Restaurou, mas não consegui contar as tabelas do banco restaurado."
  if comparar "$TMP/saiu.txt" "$TMP/voltou.txt" | tee "$TMP/comparacao.txt"; then
    rm -rf "$dir"; return 0
  fi
  rm -rf "$dir"
  morre "A cópia restaurada não bate com o que saiu (acima)." \
        "Não confie neste arquivo. A Action falha para você ficar sabendo."
}

tabela_no_resumo() { # arquivo de comparação -> tabela markdown
  resumo "| Tabela | Linhas |"
  resumo "|---|---:|"
  sed -nE 's/^✓ ([A-Za-z0-9_]+) +saiu +([0-9]+).*/| \1 | \2 |/p' "$1" \
    | while IFS= read -r l; do resumo "$l"; done
}

# ── o bucket ──────────────────────────────────────────────────────────────
garantir_bucket() {
  local lista
  lista="$($W r2 bucket list 2>"$TMP/r2.err")" || {
    if grep -qiE "enable R2|10042|R2 is not enabled|not entitled" "$TMP/r2.err"; then
      morre "O R2 ainda não está ativado nesta conta Cloudflare." \
            "No painel da Cloudflare: menu R2 Object Storage → ativar (o plano
       gratuito cobre 10 GB; a Cloudflare pede um cartão para ativar).
       Depois rode esta Action de novo. Nada mais precisa ser configurado."
    fi
    if grep -qiE "Authentication|10000|403|permission" "$TMP/r2.err"; then
      morre "O token da Cloudflare não tem permissão de R2." \
            "No painel: My Profile → API Tokens → o token usado pelo GitHub →
       Edit → acrescentar  Account · Workers R2 Storage · Edit  → salvar.
       O valor do token não muda; não precisa mexer no GitHub."
    fi
    morre "Não consegui listar os buckets do R2." "$(tail -15 "$TMP/r2.err")"
  }
  if printf '%s\n' "$lista" | grep -qE "^name: *$BUCKET\$|\"$BUCKET\"|^$BUCKET\$"; then
    info "bucket $BUCKET: já existe"
  else
    $W r2 bucket create "$BUCKET" >"$TMP/cria.log" 2>&1 \
      || morre "Não consegui criar o bucket $BUCKET." "$(tail -15 "$TMP/cria.log")"
    verde "✓ bucket $BUCKET criado (privado)"
    resumo "- Bucket \`$BUCKET\` criado agora, sem acesso público."
  fi
  # A regra dos 90 dias. Se falhar, a cópia sai do mesmo jeito: guardar
  # demais é um problema menor do que não guardar.
  if $W r2 bucket lifecycle list "$BUCKET" 2>/dev/null | grep -q "$REGRA"; then
    info "regra de $DIAS dias: já existe"
  elif $W r2 bucket lifecycle add "$BUCKET" "$REGRA" "diario/" --expire-days "$DIAS" -y \
        >"$TMP/regra.log" 2>&1; then
    verde "✓ regra criada: diárias somem em $DIAS dias"
  else
    printf '::warning::Não consegui criar a regra de %s dias no bucket. As cópias ficam até alguém apagar.\n' "$DIAS"
    tail -5 "$TMP/regra.log" | sed 's/^/  /'
  fi
}

# ── copiar ────────────────────────────────────────────────────────────────
copiar() {
  local carimbo arq tamanho chave
  carimbo="$(date -u +%Y%m%d-%H%M%S)"
  arq="$TMP/hebraico-fluente-$carimbo.sql"
  chave="diario/hebraico-fluente-$carimbo.sql.gz"

  verde "1. O bucket"
  garantir_bucket

  verde "2. Copiando a produção"
  $W d1 export "$DB" --remote --output="$arq" -y >"$TMP/export.log" 2>&1 \
    || morre "O export do banco falhou." "$(tail -20 "$TMP/export.log")"
  tamanho="$(wc -c < "$arq" | tr -d ' ')"
  [ "$tamanho" -gt 200 ] || morre "O export saiu vazio ($tamanho bytes)."
  grep -q 'INSERT INTO "\?accounts' "$arq" \
    || morre "O export não tem nenhuma linha de accounts." "Um banco de produção sem contas é um export errado, não um banco vazio."
  info "$tamanho bytes"

  verde "3. Provando que a cópia restaura (num banco local)"
  conferir_local "$arq"

  verde "4. Guardando no R2"
  gzip -9 "$arq"
  $W r2 object put "$BUCKET/$chave" --file="$arq.gz" --remote \
      --content-type application/gzip >"$TMP/put.log" 2>&1 \
    || morre "O envio ao R2 falhou." "$(tail -15 "$TMP/put.log")"
  $W r2 object put "$BUCKET/ultimo/hebraico-fluente.sql.gz" --file="$arq.gz" --remote \
      --content-type application/gzip >>"$TMP/put.log" 2>&1 \
    || morre "O envio da cópia 'ultimo' ao R2 falhou." "$(tail -15 "$TMP/put.log")"
  verde "✓ $BUCKET/$chave ($(wc -c < "$arq.gz" | tr -d ' ') bytes compactado)"

  resumo "## ✅ Backup do banco"
  resumo ""
  resumo "- Guardado em \`$BUCKET/$chave\` e em \`$BUCKET/ultimo/hebraico-fluente.sql.gz\`."
  resumo "- Restaurado num banco local antes do envio: todas as tabelas voltaram com o mesmo número de linhas."
  resumo "- As cópias diárias somem sozinhas depois de $DIAS dias."
  resumo ""
  tabela_no_resumo "$TMP/comparacao.txt"
}

# ── ensaiar ───────────────────────────────────────────────────────────────
ensaiar() {
  local chave="${1:-ultimo/hebraico-fluente.sql.gz}" arq="$TMP/ensaio.sql"
  # A chave vem de um campo digitado no Actions: só o formato das nossas.
  printf '%s' "$chave" | grep -qE '^(diario|ultimo)/[A-Za-z0-9._-]+\.sql\.gz$' \
    || morre "Chave inválida: $chave" "Use uma como diario/hebraico-fluente-AAAAMMDD-HHMMSS.sql.gz, ou deixe vazio."
  # A tranca que importa: este modo APAGA e recria o banco de destino.
  [ "$ENSAIO_DB" != "$DB" ] || morre "O banco de ensaio tem o nome da produção. Parando."

  verde "1. Baixando $BUCKET/$chave"
  $W r2 object get "$BUCKET/$chave" --file="$arq.gz" --remote >"$TMP/get.log" 2>&1 \
    || morre "Não consegui baixar a cópia." "$(tail -15 "$TMP/get.log")"
  gunzip "$arq.gz"
  contar_no_arquivo "$arq" > "$TMP/saiu.txt"

  verde "2. Criando o banco de teste $ENSAIO_DB (na Cloudflare, vazio)"
  apagar_ensaio
  $W d1 create "$ENSAIO_DB" >"$TMP/cria-db.log" 2>&1 \
    || morre "Não consegui criar o banco de teste." "$(tail -15 "$TMP/cria-db.log")"
  trap 'apagar_ensaio; rm -rf "$TMP"' EXIT

  verde "3. Restaurando a cópia inteira nele"
  $W d1 execute "$ENSAIO_DB" --remote --file="$arq" -y >"$TMP/restaura-remoto.log" 2>&1 \
    || morre "A restauração na Cloudflare falhou." "$(tail -20 "$TMP/restaura-remoto.log")"

  verde "4. Conferindo tabela por tabela"
  contar_no_banco "$ENSAIO_DB" --remote > "$TMP/voltou.txt" \
    || morre "Restaurou, mas não consegui contar as tabelas."
  if comparar "$TMP/saiu.txt" "$TMP/voltou.txt" | tee "$TMP/comparacao.txt"; then
    resumo "## ✅ Ensaio de restauração: passou"
    resumo ""
    resumo "- Cópia \`$BUCKET/$chave\` restaurada do zero num banco novo na Cloudflare ($(date -u +%d/%m/%Y) UTC)."
    resumo "- Todas as tabelas voltaram com o mesmo número de linhas. O banco de teste foi apagado em seguida."
    resumo ""
    tabela_no_resumo "$TMP/comparacao.txt"
    verde "✓ A cópia restaura do zero. O banco de teste será apagado."
  else
    resumo "## ❌ Ensaio de restauração: FALHOU"
    morre "O banco restaurado não bate com a cópia (acima)."
  fi
}

apagar_ensaio() {
  [ "$ENSAIO_DB" != "$DB" ] || return 0
  if $W d1 list --json 2>/dev/null | grep -q "\"$ENSAIO_DB\""; then
    $W d1 delete "$ENSAIO_DB" -y >/dev/null 2>&1 \
      && info "banco de teste $ENSAIO_DB apagado" \
      || printf '::warning::Não consegui apagar o banco de teste %s. Apague no painel (D1).\n' "$ENSAIO_DB"
  fi
}

# A conta vem do PRÓPRIO token, como em scripts/cloudflare-setup.sh: um
# CLOUDFLARE_ACCOUNT_ID colado errado faz a Cloudflare responder "could not
# route" em vez de um erro que aponte para o lugar certo.
conta() {
  local who acc
  who="$($W whoami 2>&1)"
  if printf '%s' "$who" | grep -qi "not authenticated\|not logged in\|please run.*login"; then
    morre "O wrangler não está autenticado." \
          "No GitHub Actions falta o segredo CLOUDFLARE_API_TOKEN (o mesmo da publicação)."
  fi
  acc="$(printf '%s' "$who" | grep -oE '[0-9a-f]{32}' | head -1)"
  [ -n "$acc" ] && export CLOUDFLARE_ACCOUNT_ID="$acc" && info "conta $acc"
  return 0
}

case "${1:-}" in
  copiar)   conta; copiar ;;
  ensaiar)  shift; conta; ensaiar "${1:-}" ;;
  conferir) [ -f "${2:-}" ] || morre "Uso: $0 conferir arquivo.sql"; conferir_local "$2"; verde "✓ A cópia restaura." ;;
  *) morre "Uso: $0 copiar | ensaiar [chave] | conferir arquivo.sql" ;;
esac
