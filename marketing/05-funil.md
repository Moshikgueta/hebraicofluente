# O funil de vendas do Hebraico Fluente (28/10/2026)

Pedido do dono: montar o funil de marketing. Quase todas as peças já existem; o que faltava era
ligá-las numa sequência só, com uma métrica por etapa e as lacunas em ordem de impacto. Skills
usadas: `marketing-loops`, `cro` e `emails`.

## O funil em uma linha

**Ver um post que ensina → seguir ou salvar → fazer o teste grátis do Álef → (não comprou)
deixar o e-mail e receber 5 letras em 14 dias → comprar → estudar → indicar.**

```
  DESCOBRIR            CONHECER              EXPERIMENTAR          DECIDIR             FICAR
  ───────────          ───────────           ────────────          ─────────           ────────
  Instagram (série)    seguir / salvar       teste grátis Álef     página de venda     e-mails d1/d3/d7
  páginas do alfabeto  DM: nome decorado,    (6 exercícios,        checkout (PIX,      mensagem pessoal
  aula com parceiros   "você já estuda?"     sem cadastro)         cartão, 7 dias)     depoimento
  busca e IA           ManyChat LER          ↓ não comprou?                            → indicação
                                             e-mail: 2ª letra + 5 e-mails em 14 dias ↗
```

## As etapas, uma por uma

| # | Etapa | O que já existe | Métrica (onde ler) | Estado |
|---|---|---|---|---|
| 1 | **Descobrir** | série "O erro do brasileiro", Chanucá, "3 palavras"; páginas do alfabeto no Google; `llms.txt`; aula aberta com 6 parceiros | alcance por post (Metricool); impressões (Search Console) | rodando; parceiros esperam o envio |
| 2 | **Conhecer** | fecho de salvar e seguir em todo carrossel; ManyChat LER; nome decorado de presente; DM "obrigado + você já estuda?" | seguidores ganhos e salvamentos por post (Metricool); conversas abertas (anotar) | rodando, DM manual |
| 3 | **Experimentar** | teste grátis do Álef em `/curso-de-hebraico/#experimente` (bio → `/comece-aqui`) | "Teste grátis da capa": visto → pronto (`/admin/estatisticas`) | pronto |
| 4 | **Capturar quem não compra** | fim do teste: e-mail com a 2ª letra (Mem) + caixa "quero as próximas letras" → 5 e-mails em 2, 4, 7, 10 e 14 dias, o último com o convite e o preço | `d|segunda-letra`; inscritos confirmados (seção "Lista de interessados") | pronto |
| 5 | **Decidir** | página de venda, 7 dias para desistir, checkout com PIX e cartão | "O funil por semana": página de venda → checkout → pagamento → compra | pronto; **falta prova social** |
| 6 | **Ficar** | e-mails automáticos d1, d3 e d7 (`worker/src/ativacao.js`); mensagem pessoal do dono depois dos 7 dias | lições concluídas por aluno (`/admin/vendas`) | rodando |
| 7 | **Indicar** | página `/depoimento` existe | depoimentos recebidos (`/admin/depoimentos`) | **parado: falta o pedido** |

## As lacunas, em ordem de impacto

1. **Prova social na página de venda (etapa 5).** É o que mais pesa na decisão de quem não conhece
   o professor, e hoje não há nenhum depoimento publicado. O caminho já está pronto: aprovar o
   pedido de depoimento (`marketing/emails/pedido-de-depoimento.md`) e mandá-lo aos 3 alunos. Com 2
   ou 3 depoimentos autorizados, eles entram na página. **Depende do dono: aprovar o texto.**
2. **Levar o Instagram ao teste grátis (etapas 2 → 3).** Os carrosséis da série pedem salvar e
   seguir, de propósito; quem vai ao site vem pelo link da bio e pelo ManyChat. Proposta: nos stories
   do dia de cada post, um story "Faça a primeira letra de graça" com o link `/stories` (que já conta
   a visita). Custo: um story por dia. Mede em "Links de campanha".
3. **Conversa no direct com regra fixa (etapa 2).** O que funcionou com o Renan e o Marcos vira
   roteiro (abaixo), para usar com todo mundo que reposta, comenta com interesse ou pede o nome.
4. **Parcerias (etapa 1).** As 6 mensagens estão aprovadas e não foram enviadas. É o canal que pode
   trazer turmas inteiras de uma vez. **Depende do dono: enviar.**
5. **Atrito no checkout (etapa 5).** O teste C4 (as condições da compra antes do cadastro) está
   escrito e começa em 23/11, com a base medida.
6. **Indicação (etapa 7).** Ainda não existe. Só depois dos depoimentos: sem prova, indicação não
   tem o que mostrar. Fica para dezembro.

## O roteiro do direct (etapa 2)

Para quem repostou, comentou com interesse, pediu o nome ou respondeu um story:

1. **Primeira mensagem, sempre igual:** "Oi, [nome]! Vi que você [repostou / comentou], muito
   obrigado! Fiquei curioso: você já estuda hebraico, ou está começando agora?"
2. **Se quer aprender ou já tentou:** o link da primeira lição grátis
   (`hebraicofluente.com.br/curso-de-hebraico/#experimente`) e "depois me conta o que achou".
3. **Se pergunta o preço:** o mesmo link (o preço e os 7 dias estão na página). Sem desconto.
4. **Se só gosta do conteúdo:** agradecer e parar. Ele continua divulgando.
5. **Nunca mais de uma mensagem sobre o curso.** Sem resposta, não insiste.

Quem pediu o nome ganha o nome decorado (`lib/nome-decorado.ts`), sem link de venda junto.

## O que olhar toda segunda (a leitura semanal)

As taxas que dizem onde o funil vaza, todas no painel do site e no Metricool:

| Passagem | Conta | Onde vaza, se cair |
|---|---|---|
| Post → seguidor | seguidores ganhos / alcance | o conteúdo não promete continuidade |
| Visita → teste concluído | `pronto` / `visto` do teste grátis | o teste está longo ou confuso |
| Teste → e-mail | inscritos / testes concluídos | a oferta da 2ª letra não convence |
| Página de venda → checkout | checkout / página de venda | preço, prova social, clareza |
| Checkout → compra | compras / checkout | atrito no cadastro ou no pagamento (C4) |
| Compra → estudo | alunos com lição concluída em 7 dias | ativação |

Com o volume de hoje, uma semana sozinha engana: comparar sempre as 4 últimas.

## Próximos passos

- [ ] **Dono:** aprovar o pedido de depoimento (lacuna 1).
- [ ] **Dono:** enviar as mensagens aos parceiros (lacuna 4).
- [ ] **Dono:** um story com o link `/stories` no dia de cada post da série (lacuna 2).
- [ ] **Claude, 02/11:** primeira leitura do funil inteiro, com as taxas da tabela acima.
- [ ] **Claude, quando houver 2 depoimentos autorizados:** pô-los na página de venda (PR).
