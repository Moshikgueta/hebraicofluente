-- De onde veio o pedido (23/10/2026, plano de marketing): a fonte da primeira
-- página da visita (lista fechada em worker/src/lib/origem.js: bio, stories,
-- busca, email, anuncio...) e a campanha (utm_campaign), quando houver. O dono
-- lê em /admin/vendas e em /admin/estatisticas. Pedidos de antes desta
-- migração ficam com NULL.
ALTER TABLE orders ADD COLUMN origem TEXT;
ALTER TABLE orders ADD COLUMN campanha TEXT;
