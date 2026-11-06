# worker/migrations

Mudanças no banco que o `worker/schema.sql` não consegue fazer sozinho.

O `schema.sql` só usa `CREATE ... IF NOT EXISTS`: ele cria tabelas e índices
novos, mas nunca altera uma tabela que já existe. Uma coluna nova numa tabela
que já está no ar precisa de uma migração.

## Como funciona

- Cada migração é um arquivo `NNNN-descricao.sql`, por exemplo
  `0001-orders-cupom.sql`, só com minúsculas, números e hífen.
- A publicação (`scripts/cloudflare-setup.sh`, passo 3b) aplica, em ordem,
  as que ainda não estão na tabela `migracoes`, e anota cada uma depois de
  aplicá-la. Cada arquivo roda uma vez só.
- Uma migração que falha para a publicação antes de o código novo subir. O
  site continua com a versão anterior.

## Regras

1. **Só acrescentar.** A migração roda enquanto a versão ANTERIOR do site
   ainda está no ar. `ALTER TABLE x ADD COLUMN y` com valor padrão serve;
   apagar ou renomear coluna quebraria a versão que está respondendo.
2. **Antes de uma migração que mexe em dados**, faça uma cópia:
   Actions → "Backup do banco" → Run workflow → `copiar`.
3. **Nunca edite uma migração já publicada.** Ela não roda de novo. Corrija
   com uma migração nova, com o número seguinte.
4. Teste local:
   `npx wrangler d1 execute hebraico-fluente --local --file=worker/migrations/NNNN-x.sql`
