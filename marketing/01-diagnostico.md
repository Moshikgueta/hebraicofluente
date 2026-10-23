# Fase 1 - Diagnóstico (23/10/2026)

Skills usadas: `product-marketing` (contexto), `cro` (páginas), `marketing-psychology` e a auditoria
de persuasão já feita (`audit/portal/auditoria-persuasao.md`), `analytics` e `attribution`
(medição), `seo-audit` (descoberta), `offers` e `pricing` (oferta).

Como ler: **[E]** = evidência (lida no código, no catálogo, no build ou numa auditoria anterior,
com a fonte ao lado). **[H]** = hipótese, ainda sem dado que a confirme. Nada aqui é resultado
medido de venda ou de tráfego: esses números estão no banco de produção e no Instagram, que esta
sessão não alcança (o site responde 403 para a rede da sessão). A lista do que falta está no fim.

## 0. Os primeiros dados reais (23/10/2026, painéis enviados pelo dono)

Lidos de `/admin/vendas` e `/admin/estatisticas` (últimos 30 dias), em capturas de tela que o
dono mandou. Aqui só totais: o repositório é público, e nome ou e-mail de aluno não entra.

| Dado | Valor | O que diz |
|---|---|---|
| Compras pagas mantidas (desde o início) | 4, R$ 543,90 | volume muito baixo; o gargalo é tráfego |
| Compras pelo link de campanha | 0 | os links de campanha ainda não trouxeram venda |
| Pedidos criados (30 dias) | 9 | |
| Pagos no período | 3 mantidos + 2 estornados | os 2 estornos foram **testes do dono** (corrigido pelo dono em 23/10): nenhum cliente pediu o dinheiro de volta |
| Pedidos sem pagamento (30 dias) | 4 de 9 | também **testes do dono**: o abandono no pagamento não está medido |
| Progresso de quem comprou (3 compras visíveis) | 0, 0 e 3 de 22 letras | **quem compra estuda no dia da compra e não volta** |
| Último estudo de cada comprador | o mesmo dia da compra | idem |
| Capa (contador ligado em 23/10, então cerca de 1 dia) | 30 visitas; "Descobrir Israel" 7 (23%), "Aprender hebraico" 3 (10%), botão para a página de venda 1 | amostra mínima; o interesse por Israel apareceu maior que pelo curso |
| "Comece aqui" | 0 aberturas | o link da bio ainda não leva lá, ou ninguém tocou |
| Prévia do livro | 11 abriram, 2 foram ao curso (18%) | o EBOOK do ManyChat traz gente; poucos usam as atividades |
| Respostas nos exercícios (30 dias) | 2.251 | erro mais alto: Resh reconhecer (29%), Tav sentido da palavra (29%), Lámed digitar (25%), com 12 a 18 respostas cada |

**O que muda no diagnóstico:**
1. **Novo obstáculo: ativação depois da compra** [E]. Quem pagou não passou da primeira sessão
   (0, 0 e 3 de 22 letras, último estudo no dia da compra). Não houve estorno de cliente, mas um
   aluno que não volta não dá depoimento, não indica e não compra o A1. Vem antes de qualquer
   anúncio.
2. **Os testes do dono entram nos números** [E]: 2 estornos e 4 pedidos sem pagamento do mês eram
   testes. Enquanto os painéis os contarem, estorno, abandono e conversão saem errados. Proposta:
   os painéis deixam de contar pedidos de contas de `ADMIN_EMAILS` (com a opção de vê-los à parte).
   O abandono real no pagamento só fica medido depois disso.
3. **O tráfego é o segundo gargalo** [E]: 30 visitas num dia e 4 vendas na vida do produto.
4. **Israel atrai mais que o curso** [H, amostra de 1 dia]: repetir a leitura em 2 semanas antes de
   mudar qualquer coisa. Se confirmar, o livro (ainda fora de venda) é a porta de entrada mais
   forte, e o caminho prévia → curso merece mais cuidado.
5. A hipótese "o link de campanha vende" (O5) não se confirmou até aqui: 0 vendas por ele.

## 1. O que existe hoje

### Produtos e preços [E: `data/courses.json`]

| Produto | Situação | Preço cobrado | Preço oficial | Parcelas |
|---|---|---|---|---|
| Alfabetização em Hebraico | **à venda** | R$ 147 | R$ 197 | até 12x (juros MP), PIX com 10% de desconto |
| Israel Além do Óbvio (livro interativo) | pronto, `aVenda: false` | R$ 197 | R$ 297 | até 3x |
| Combo livro + curso | pronto, `aVenda: false` | R$ 297 | R$ 397 | até 12x |
| Hebraico A1, A2, B1 | `soon` (em produção) | 297 / 297 / 397 | 397 / 397 / 497 | - |
| Raízes Sefarditas | fora do catálogo, só liberado à mão | - | - | - |

Ou seja: **um único produto gera receita hoje**, e ele é o de entrada (R$ 147, pagamento único,
12 meses). Não há produto seguinte para quem termina (o A1 está em produção).

### Jornada do comprador [E: build local de 23/10/2026, `app/out/`]

1. **Chegada.** Instagram (@hebraicofluente) pelos links `/bio` (vai para `/comece-aqui`),
   `/stories` e `/dm` (vão ao teste grátis), e `/sefarad` (associação). ManyChat manda `/previa`
   a quem comenta EBOOK. Busca orgânica chega na capa ou nas 19 páginas do sitemap.
2. **Capa (`/`).** Portal das três jornadas: "Aprenda a ler hebraico. Depois, descubra Israel e as
   raízes sefarditas." Dois botões na abertura ("Explore as experiências" e "Comece pelo
   hebraico"), três cartões de mesmo peso, **dois deles "Em breve, sem data marcada"**, um
   depoimento, "Leia uma palavra agora" (שָׁלוֹם).
3. **Página de venda (`/curso-de-hebraico`).** "Ler e escrever hebraico, do zero." com os três
   motivos (viajar a Israel, ler as letras da Bíblia, entender o alfabeto), botão "Começar o curso ·
   R$ 147", teste grátis de 6 exercícios sem cadastro, ouvir e falar com correção, as três decisões
   do método, preço com "7 dias para desistir".
4. **Checkout.** Conta, depois pagamento (Mercado Pago: PIX, cartão, parcelado). Confirmação
   automática.
5. **Depois da compra.** E-mail de recibo completo, painel, Aula 0, 27 lições. Lista de aviso do A1
   em /perfil (opcional, desmarcada).

### Identidade e posicionamento [E: capa, /sobre, `CLAUDE.md`, auditorias]

Editorial, honesto, sem fórmula de infoproduto: nada de cronômetro, número de alunos, preço riscado
sem data ou "método revolucionário"; crédito explícito ao método do Dr. Damián Dzienciarsky; o
professor é israelense e grava os áudios. A auditoria de 01/10 deu 76/100 para conversão e
confiança e chamou o teste grátis de "excelente"; os cinco problemas que ela apontou (desistência
fora da vitrine, e-mail da marca, Reply-To, data do pré-lançamento, erros em /sobre e /biblia)
estão resolvidos segundo o `CLAUDE.md`. **Esta identidade é um ativo** (diferencia de concorrente
que promete fluência em 30 dias) e o plano a preserva.

### O que se mede hoje [E: `worker/src/api/estatisticas.js`, `CLAUDE.md`]

- Sem analítica de terceiros, por decisão (privacidade, CSP estrita). Nenhum pixel de anúncio.
- Contadores próprios, sem cookie: eventos da capa e da "Comece aqui" (`p|`), etapas do teste
  grátis (`d|`), visitas dos quatro links de campanha, eventos da prévia do livro.
- Pedido guarda a `parceria` quando veio por `/sefarad`, `/bio`, `/stories` ou `/dm`.
- **Não se lê UTM em lugar nenhum** (`grep utm_` em `app/src` e `worker/src`: zero). O link da
  prévia manda `utm_content=previa-ebook`, que ninguém grava.
- Não há contagem de visitas à página de venda nem de "abriu o checkout" fora da criação do pedido.

## 2. Obstáculos que podem estar segurando as vendas

| # | Obstáculo | Tipo | Fonte |
|---|---|---|---|
| O1 | **Quem não compra na hora some.** Não há captura de e-mail de interessado: a lista de novidades exige conta, o e-mail da "segunda letra" não é guardado (por desenho), e as páginas "Em breve" não têm lista de espera. | E | `api/novidades.js` (`requireAccount`), `CLAUDE.md` "A segunda letra" |
| O2 | **Não dá para saber qual canal vende.** Sem UTM e sem início de checkout medido, não há custo por aquisição por canal, nem base para decidir tráfego pago. | E | seção "O que se mede hoje" |
| O3 | **A capa divide a atenção entre um produto à venda e dois "Em breve".** O cartão do curso tem o mesmo peso dos que não vendem nada. | E (layout) / H (efeito na venda) | build de `/`, `PortalClient.tsx` |
| O4 | **Prova social fraca para quem chega frio:** um depoimento só, de aluna particular, não de compradora do curso (nota 3/8 na auditoria). | E | `audit/portal/auditoria-persuasao.md` |
| O5 | **O funil do Instagram que mais conversa (EBOOK no ManyChat) leva a um produto que não está à venda.** A prévia termina no curso, mas a promessa inicial é o livro. | E (fluxo) / H (perda) | `CLAUDE.md` "Prévia grátis em /previa" |
| O6 | **Busca orgânica com pouca superfície:** 19 páginas no sitemap, nenhuma respondendo diretamente a buscas de quem começa ("alfabeto hebraico", "letras hebraicas", "como ler hebraico", "nikud"). | E (páginas) / H (volume de busca) | `app/out/sitemap.xml` |
| O7 | **Escada de produtos curta:** depois dos R$ 147 não há o que oferecer, e o livro e o combo esperam o contador e o advogado. | E | catálogo, seção E-book do `CLAUDE.md` |
| O8 | Preço: o pré-lançamento sem data é honesto, mas tira a urgência legítima. Mudar isso é decisão do dono; não é obstáculo a resolver com escassez falsa. | E | "Preços, combo único" no `CLAUDE.md` |

## 3. As cinco oportunidades de maior impacto provável

Critério: impacto provável na receita dividido por custo e risco, com a ordem pensada para que
cada uma alimente a seguinte. Impacto é estimativa [H] até haver números.

### 0. Ativação e permanência de quem já comprou (acrescentada com os dados de 23/10)
- **Problema:** compradores com 0 de 22 letras, sem voltar depois do primeiro dia.
- **Proposta:** (a) tirar dos painéis os pedidos de teste do dono; (b) e-mails de serviço depois da compra
  (dia 1: "comece pela Aula 0, 10 minutos"; dia 3, se não houver lição: "quer ajuda?"; dia 7: o
  que já dá para ler), que não são propaganda e não dependem da lista de interessados; (c) uma
  mensagem pessoal do professor a cada comprador na primeira semana; (d) um lembrete único para o
  PIX gerado e não pago, se o abandono real (sem os testes) se mostrar relevante.
- **Meta:** comprador com a lição 1 concluída em 3 dias e de volta na primeira semana.
- **Custo:** baixo. **Risco:** nenhum, se os e-mails forem só de serviço e os textos forem do dono.

### 1. Medir o funil de ponta a ponta, sem cookie (base de todo o resto)
- **Feito em 23/10/2026** (PR #242, publicado).
- **Problema:** O2. Sem isso, qualquer investimento em Instagram, parceria ou anúncio é às cegas.
- **Proposta:** gravar a origem (UTM ou link de campanha) da primeira página vista no aparelho e
  levá-la ao pedido, como já se faz com `parceria`; contar visitas à página de venda e "abriu o
  checkout"; mostrar tudo em `/admin/estatisticas` e `/admin/vendas`. Sem terceiro, sem IP
  guardado; a Privacidade (art. 4) ganha uma linha.
- **Evidência:** [E] a infraestrutura de contador próprio e o campo `parceria` já existem.
- **Custo:** baixo (código no próprio site). **Risco:** baixo.
- **Meta do experimento:** em 2 semanas, saber visitas, cliques no checkout, compras e taxa por
  origem (bio, stories, direct, prévia, busca, parceiro).

### 2. Lista de interessados com consentimento e uma sequência de e-mails
- **Problema:** O1. Hoje o visitante que gostou do teste grátis e não comprou não deixa contato.
- **Proposta:** caixa de e-mail (desmarcada, com finalidade escrita) no fim do teste grátis, na
  prévia do livro e nas páginas "Em breve" (Israel, Raízes, A1): "me avise quando abrir" e "quero
  receber a próxima letra". Sequência curta de boas-vindas (5 e-mails em 10 dias: a segunda letra,
  como o curso funciona, o que muda ao ler, uma dúvida comum, o convite com o preço). A tabela
  `novidades` e o link de saída assinado já existem; falta aceitar quem não tem conta.
- **Evidência:** [E] não há captura hoje. [H] e-mail converte melhor que o primeiro clique para
  um produto de R$ 147 comprado por motivo pessoal (viagem, fé, família).
- **Custo:** médio (rota, tela, textos, envio pela Resend). **Risco:** LGPD, coberto por
  consentimento explícito e saída em um clique; textos passam pelo dono.
- **Meta:** taxa de inscrição no fim do teste grátis e compras vindas da sequência.

### 3. Foco no produto que vende, onde o tráfego chega
- **Problema:** O3 e O5.
- **Proposta (experimento, não reversão do portal):** (a) no `/comece-aqui` e na capa, dar ao
  curso o primeiro lugar e o maior peso visual, com os "Em breve" como uma linha com lista de
  espera (oportunidade 2); (b) no ManyChat, depois da prévia, uma segunda mensagem com o teste
  grátis do curso. Medir com os contadores que já existem (`cta-curso`, `comece-curso`,
  `previa-clique-curso`).
- **Evidência:** [E] layout atual; [H] que a divisão de atenção reduz o clique no curso.
- **Custo:** baixo. **Risco:** a decisão do portal é do dono (23/10/2026); o teste só segue com o
  aval dele.

### 4. Prova social de compradores de verdade
- **Problema:** O4.
- **Proposta:** pedir depoimento no momento de vitória (fim do módulo 1, primeira palavra lida,
  certificado), pelo fluxo `/depoimento` que já existe, com e-mail pessoal do professor; gravar 3
  vídeos curtos de alunos lendo uma palavra (com autorização); publicar números agregados reais
  quando houver (ex.: "a primeira palavra lida, em média, no dia X"), nunca número inventado.
- **Evidência:** [E] um depoimento só; o fluxo e o painel de aprovação existem.
- **Custo:** baixo em código, alto em tempo de relacionamento. **Risco:** nenhum, se seguir a regra
  de não trocar depoimento por brinde.

### 5. Parcerias com comunidades que já reúnem o público
- **Problema:** custo de aquisição. [H] o público dos três motivos da página de venda está
  concentrado em comunidades: associações sefarditas, caravanas e agências de viagem a Israel,
  igrejas e seminários com estudo bíblico, escolas e clubes judaicos.
- **Proposta:** um link por parceiro (o mecanismo `PARCERIAS` já grava o nome no pedido), material
  pronto (aula aberta de 20 min "leia sua primeira palavra em hebraico", post, texto de WhatsApp),
  e, se o dono quiser, condição de grupo. Piloto com 3 parceiros antes de escalar. `/sefarad` com
  @adsefarditas é o primeiro caso, e os números dele dizem se o modelo funciona.
- **Evidência:** [E] infraestrutura pronta e um parceiro ativo. [H] a conversão por esse canal.
- **Custo:** tempo do dono. **Risco:** preço de grupo e comissão são decisão do dono (e do
  contador, se houver comissão).

### Por que SEO e tráfego pago não estão entre as cinco agora
- **SEO** (O6) é a sexta: vale construir páginas públicas sobre o alfabeto (uma por letra, sem o
  conteúdo pago) e "como ler hebraico", mas o retorno leva meses e a decisão de quais páginas
  pede dado do Search Console.
- **Tráfego pago** só depois da oportunidade 1 e de uma taxa de conversão de base: sem medição,
  não há como saber o custo por compra, e o produto de R$ 147 deixa pouca margem para errar.

## 4. O que preciso do dono para transformar hipótese em evidência

1. De `/admin/vendas`: quantas compras pagas, desde quando, e quantas por parceria (bio, stories,
   dm, sefarad).
2. De `/admin/estatisticas`: o funil do teste grátis (visto → pronto → cta) e o do portal e da
   prévia, dos últimos 30 dias.
3. Do Instagram: seguidores, alcance médio de Reels e de carrossel nos últimos 30 dias, cliques no
   link da bio, e quantas pessoas comentaram EBOOK.
4. Search Console (se estiver ligado): consultas e cliques dos últimos 3 meses.
5. Decisões: aceita o experimento 3 (peso da capa)? Pode haver condição de grupo para parceiros?
   Qual o orçamento mensal máximo para testar anúncio, quando chegar a hora?
