-- A versão dos Termos de Uso que valia quando o pedido nasceu (auditoria de
-- 01/10/2026, LEGAL-104). É o código de data/politicas-versoes/atual.json, e a
-- cópia fixa dessa versão é publicada em /termos/v/<versao>/. Pedidos de antes
-- desta migração ficam com NULL: para eles, vale a data `politicas.atualizadoEm`
-- gravada em `aceites` no cadastro.
ALTER TABLE orders ADD COLUMN termos_versao TEXT;
