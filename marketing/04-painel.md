# Fase 4 - Painel de indicadores (23/10/2026)

O que o dono olha toda semana para saber se o plano (`03-plano-90-dias.md`) está funcionando.
Skills usadas: `analytics` (plano de medição), `attribution` (origem e custo por compra),
`conversion-tracking` (onde cada número nasce), `revops` (receita), `ab-testing` (leitura dos
testes).

## Princípios

1. **Um número, uma fonte.** Cada indicador diz de onde vem. Se duas fontes discordarem, vale a do
   próprio site para visitas e cliques, e o banco (`orders`) para compras e receita.
2. **Sem cookie e sem terceiro**, como o site já é: contadores diários por chave (`estatisticas`,
   sem conta, IP nem horário) e o pedido. O Instagram, o Search Console e o gerenciador de
   anúncios são lidos nas próprias telas deles e anotados à mão.
3. **Taxa só com janelas iguais e fechadas** (skill `analytics`): semana de segunda a domingo, em
   Brasília. Nunca verba do mês inteiro dividida por compras de meio mês.
4. **Primeiro toque declarado:** a origem é a da primeira página da visita (UTM ou link de
   campanha). Não há atribuição multitoque; com este volume ela daria precisão falsa.
5. **Robô não conta** (o filtro `ROBO` que já existe em `api/estatisticas.js`).

## Os indicadores

Estado: **existe** (já se mede), **parcial** (mede, mas sem origem ou sem a tela), **falta**
(precisa ser construído na semana 1 do plano).

| # | Indicador | Definição | Fórmula | Fonte | Estado |
|---|---|---|---|---|---|
| K1 | Visitas | visitas humanas à capa, ao `/comece-aqui`, à página de venda e ao teste grátis, uma por visita | soma de `visto` por página | `p\|visto`, `p\|comece-visto`, `d\|visto`; página de venda: nova chave | parcial (falta a página de venda) |
| K2 | Origem do tráfego | de onde veio cada visita | contagem por origem: bio, stories, dm, sefarad, prévia, parceiro, busca, direto, anúncio | `o\|<origem>` para os 4 links; UTM: nova chave | parcial (falta UTM e busca) |
| K3 | Teste grátis concluído | quem chegou ao fim dos 6 exercícios | `d\|pronto` / `d\|visto` | `d\|` (existe) | existe |
| K4 | Leads | e-mails com consentimento na lista de interessados | inscrições novas na semana, por origem | tabela `novidades` estendida (depende da decisão 1) | falta |
| K5 | Cliques no checkout | quem apertou "Começar o curso" e abriu o checkout | aberturas do checkout / visitas da página de venda | nova chave `k\|checkout\|<origem>` | falta |
| K6 | Pedidos criados | quem escolheu PIX ou cartão | `orders` criados na semana | `orders.created_at` | existe |
| K7 | Compras | pedidos pagos na semana, menos estornados | `status = 'paid'` com `paid_at` na semana | `orders` | existe (tela `/admin/vendas`) |
| K8 | Taxa de conversão | compras sobre visitas da página de venda, na mesma semana | K7 / visitas da página de venda | K7 e K1 | falta (depende de K1) |
| K9 | Conversão por origem | a mesma taxa, para cada origem | K7 da origem / visitas da origem | nova coluna `orders.origem` (migração 0003) | parcial (só `parceria`) |
| K10 | Custo por aquisição (CAC) | quanto custou cada compra paga de um canal pago | gasto do canal na semana / K7 do canal na semana | gerenciador de anúncios + K9 | falta (só com anúncio) |
| K11 | Receita bruta | o que entrou | soma de `amount_cents` dos pagos na semana | `orders` | existe |
| K12 | Receita líquida | o que ficou | K11 menos estornos e desistências (`refunded`) menos a taxa da Mercado Pago | `orders` + extrato MP | parcial (taxa da MP a anotar) |
| K13 | Ticket médio e meio | valor médio, PIX x cartão, parcelas | K11 / K7; proporção de `method` | `orders` | existe |
| K14 | Desistência em 7 dias | pedidos estornados por desistência | estornos / K7 | `arrependimentos`, `estornos` | existe |

### Indicadores de canal (lidos fora do site, anotados à mão toda segunda)

| Canal | O que anotar | Onde |
|---|---|---|
| Instagram | seguidores, alcance de Reels e carrossel, cliques no link da bio, respostas ao ManyChat por palavra-chave | Insights do Instagram, ManyChat |
| SEO | impressões, cliques, posição média das páginas do alfabeto | Search Console |
| E-mail | inscrições, cliques e compras por e-mail da sequência (não a abertura, que é imprecisa) | Resend + K9 com origem `email` |
| Parceiros | visitas e compras por link; horas gastas pelo dono | K2, K9 |
| Anúncio | gasto, cliques no link, custo por clique | Gerenciador de anúncios |

## O funil, numa linha por semana

O painel principal é uma tabela só, uma linha por semana, as colunas na ordem do funil:

| Semana | Visitas (K1) | Teste concluído (K3) | Leads (K4) | Checkout (K5) | Pedidos (K6) | Compras (K7) | Conversão (K8) | Receita líquida (K12) | Gasto pago | CAC (K10) |
|---|---|---|---|---|---|---|---|---|---|---|
| 26/10 | | | | | | | | | 0 | - |

E uma segunda tabela, a mesma coisa quebrada por origem (bio, stories, dm, sefarad, prévia,
parceiros, busca, e-mail, anúncio, direto), para a semana e para as 4 últimas semanas somadas
(com pouco volume, uma semana sozinha engana).

## Alertas (o que pede atenção na hora)

- Compras = 0 numa semana com visitas normais: conferir o checkout e a publicação.
- Pedidos criados subindo e compras não: problema no pagamento (Actions → Acesso → `pagamento`).
- Desistência acima de 10% das compras do mês: ler os motivos antes de qualquer campanha.
- CAC de um canal pago acima da receita líquida por compra: pausar o canal (regra do teste A1).
- Os alertas de saúde e de pagamento que já existem (`alertas.js`) continuam valendo.

## O que construir (semana 1 do plano), em uma frase cada

1. Gravar a origem da primeira página da visita (UTM ou link de campanha) no aparelho, sem
   cookie, e mandá-la junto do pedido: coluna `orders.origem` pela migração
   `0003-orders-origem.sql` (só acrescenta, como manda `worker/migrations/README.md`).
2. Chaves novas no contador: visita da página de venda e abertura do checkout, ambas por origem.
3. Uma seção "Crescimento" em `/admin/estatisticas` com as duas tabelas acima, montadas do banco,
   e `/admin/vendas` com a coluna origem.
4. Uma linha na Política de Privacidade (art. 4) dizendo que a origem da visita é contada sem
   cookie e guardada no pedido.
5. Testes: a origem chega ao pedido, robô não conta, nada identifica a pessoa.

## Ritual de leitura

- **Segunda, 20 minutos:** o dono anota os números de canal; o painel do site já está pronto.
  Uma frase por experimento: dentro da regra, fora da regra, ou cedo demais para dizer.
- **Fim de cada mês:** revisão escrita em `marketing/`, atualizando `02-estrategia.md` (o que virou
  evidência, o que foi cortado).
