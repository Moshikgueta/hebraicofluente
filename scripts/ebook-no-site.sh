#!/usr/bin/env bash
# O e-book "Israel Além do Óbvio" dentro do site, em /israel/ (21/10/2026).
#
# Monta a versão interativa e o PDF a partir de editorial/ e os põe em
# app/public/israel/, que o build do app copia para out/israel/. Lá, o portão
# (worker/src/gate.js, prefixo /israel) só deixa passar quem comprou o
# e-book ou o pacote. app/public/israel/ está no .gitignore: o e-book pronto
# nunca entra no git.
#
# Uso: bash scripts/ebook-no-site.sh   (HF_CHROMIUM aponta o Chromium do PDF)
set -euo pipefail
cd "$(dirname "$0")/.."
LIVRO=israel-alem-do-roteiro
PDF=israel-alem-do-roteiro.pdf
DEST=app/public/israel

( cd editorial
  node tools/web.mjs "$LIVRO" --livro --producao="$PDF"
  node tools/revista.mjs "$LIVRO" --livro )

rm -rf "$DEST"
mkdir -p "$DEST"
cp editorial/$LIVRO/saida/web/index.html "$DEST/"
cp -r editorial/$LIVRO/saida/web/assets "$DEST/"
cp editorial/$LIVRO/saida/livro-revista.pdf "$DEST/$PDF"

# O servidor de ativos da Cloudflare recusa arquivo acima de 25 MiB.
tamanho=$(stat -c %s "$DEST/$PDF")
if [ "$tamanho" -gt $((25 * 1024 * 1024)) ]; then
  echo "O PDF tem $tamanho bytes, acima dos 25 MiB que a Cloudflare serve." >&2
  exit 1
fi
# A marca d'água de cada comprador: a cauda que o Worker completa por pedido
# (scripts/pdf-marca.mjs e worker/src/lib/pdf-marca.js).
node scripts/pdf-marca.mjs "$DEST/$PDF"
echo "e-book em $DEST: $(du -sh "$DEST" | cut -f1), PDF $((tamanho / 1024 / 1024)) MB"
