#!/usr/bin/env bash
# O SQL de Actions → Acesso → `liberar` com `pedido` (auditoria de
# 01/10/2026, PAY-B-005). Imprime; quem executa é a Action (wrangler d1
# execute) e o teste (app/tests/liberar-pedido.test.ts, contra o schema.sql).
#
# Uso: sql-liberar-pedido.sh <pedido> <email-sql> <meses> [<slugs>]
#   <pedido>     id exato do pedido, já limpo (só A-Z a-z 0-9 _ -)
#   <email-sql>  o e-mail normalizado e com as aspas simples já dobradas
#   <meses>      inteiro de 1 a 120, já conferido
#   <slugs>      (21/10/2026) o que o pedido abre, separado por espaço: no
#                pacote, cada produto dele (a Action lê `componentes` em
#                data/courses.json). Sem isto, o próprio slug do pedido.
#
# O caminho de uma liberação automática (`applyPayment` em
# worker/src/api/pay.js), em SQL:
#   1. o direito PRIMEIRO, com o order_id do pedido, somando os meses a
#      partir do vencimento se ainda vale (renovação) e de agora se não;
#      `order_id IS NOT excluded.order_id` faz rodar duas vezes não somar de
#      novo, igual ao `grantAccess`;
#   2. o pedido DEPOIS: `paid`, com `provider = 'manual'` (o estorno de uma
#      desistência fica com o dono, e a varredura dos pagos não pergunta à
#      Mercado Pago por ele) - igual ao `markPaid`, só se ainda não estava;
#   3. a trilha.
# O recibo sai na varredura seguinte (`enviarRecibosManuais`), que procura
# pedido `paid` com provider `manual` sem recibo.
#
# Só age se o pedido é DA CONTA daquele e-mail e não está pago nem
# estornado: as três escritas repetem a mesma condição.
set -euo pipefail
P="$1"; SQLMAIL="$2"; M="$3"; SLUGS="${4:-}"

case "$P" in *[!A-Za-z0-9_-]*|'') echo "pedido inválido" >&2; exit 1 ;; esac
case "$M" in *[!0-9]*|'') echo "meses inválido" >&2; exit 1 ;; esac
for s in $SLUGS; do
  case "$s" in *[!a-z0-9-]*) echo "slug inválido: $s" >&2; exit 1 ;; esac
done

ALVO="o.id = '$P' AND o.status NOT IN ('paid', 'refunded')
        AND o.account_id = (SELECT id FROM accounts WHERE email = '$SQLMAIL')"

# Um INSERT por produto que o pedido abre. Sem lista, o slug do próprio pedido.
direito() {
  cat <<SQL
INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
SELECT o.account_id, $1, unixepoch()*1000,
       unixepoch('now', '+$M months')*1000, o.id
  FROM orders o
 WHERE $ALVO
ON CONFLICT(account_id, course_slug) DO UPDATE SET
  expires_at = CASE
    WHEN entitlements.expires_at IS NULL THEN NULL
    ELSE unixepoch(MAX(entitlements.expires_at, unixepoch()*1000) / 1000, 'unixepoch', '+$M months')*1000
  END,
  order_id = excluded.order_id
WHERE entitlements.order_id IS NOT excluded.order_id;
SQL
}
if [ -n "$SLUGS" ]; then
  for s in $SLUGS; do direito "'$s'"; done
else
  direito "o.course_slug"
fi

cat <<SQL
INSERT INTO access_log (account_id, action, detail, created_at)
SELECT o.account_id, 'paid', o.id || ' via GitHub Actions (liberar)', unixepoch()*1000
  FROM orders o
 WHERE $ALVO;
UPDATE orders AS o SET status = 'paid', paid_at = unixepoch()*1000,
       provider = 'manual', provider_ref = 'manual-actions'
 WHERE $ALVO;
DELETE FROM invites
 WHERE email = '$SQLMAIL' AND used_at IS NULL
   AND course_slug = (SELECT course_slug FROM orders WHERE id = '$P');
SQL
