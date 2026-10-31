#!/usr/bin/env bash
# O e-book "Israel Além do Óbvio" dentro do site, em /israel/ (21/10/2026).
#
# Monta a versão interativa a partir de editorial/ e a põe em
# app/public/israel/, que o build do app copia para out/israel/. Sem PDF
# desde 23/10/2026 (decisão do dono): o livro não tem arquivo para baixar, e
# nada do PDF é montado nem publicado. Lá, o portão
# (worker/src/gate.js, prefixo /israel) só deixa passar quem comprou o
# e-book ou o pacote. app/public/israel/ está no .gitignore: o e-book pronto
# nunca entra no git.
#
# Uso: bash scripts/ebook-no-site.sh
set -euo pipefail
cd "$(dirname "$0")/.."
LIVRO=israel-alem-do-roteiro
DEST=app/public/israel

PREVIA=app/public/previa

# A prévia grátis (23/10/2026, pedido do dono): /previa, FORA do portão, sem
# conta, para quem recebe o link no direct. Leva só os blocos de
# editorial/$LIVRO/previa.json (mochila, monte a sua comida, roleta com cinco
# curiosidades, duas páginas do diário) e para a publicação se algum faltar.
# Os capítulos daqui são os de onde esses blocos saem. Montada antes do livro,
# porque o web.mjs limpa a mesma pasta de trabalho.
( cd editorial && node tools/web.mjs "$LIVRO" --capitulos=06-sabores.md,08-na-pratica.md,09-curiosidades.md --previa )
rm -rf "$PREVIA"
mkdir -p "$PREVIA"
cp -r editorial/$LIVRO/saida/previa/. "$PREVIA/"

( cd editorial && node tools/web.mjs "$LIVRO" --livro --producao )

rm -rf "$DEST"
mkdir -p "$DEST"
cp editorial/$LIVRO/saida/web/index.html "$DEST/"
cp -r editorial/$LIVRO/saida/web/assets "$DEST/"
echo "e-book em $DEST: $(du -sh "$DEST" | cut -f1); prévia em $PREVIA: $(du -sh "$PREVIA" | cut -f1)"
