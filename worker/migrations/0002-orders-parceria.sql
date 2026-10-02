-- De qual link de campanha o pedido veio (02/10/2026): o nome da parceria
-- (`sefarad` para hebraicofluente.com.br/sefarad), só quando ela vale (lib/
-- catalog.js, PARCERIAS). O dono lê em /admin/vendas. Pedidos de antes desta
-- migração, e os que não vieram de link nenhum, ficam com NULL.
ALTER TABLE orders ADD COLUMN parceria TEXT;
