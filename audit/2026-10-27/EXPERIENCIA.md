# Experiência premium: auditoria e rodada 1 (27/10/2026)

Pedido do dono: o "Master prompt Hebraico Fluente Premium Experience 2.0". O trabalho é feito em
rodadas, cada uma com melhorias reais, testadas e publicadas por PR. Este documento é o registro:
o que foi visto, o que mudou e o que vem depois.

## Como a auditoria foi feita

- Worker local (`wrangler dev`, D1 local) com uma aluna de teste: curso liberado, Aula 0 feita,
  seis letras concluídas (e, numa segunda conta, quatro). Capturas a 390 x 844 (celular) e
  1280 x 860 (computador) do painel, do mapa, da lição do Guímel, da Academia, do Laboratório de
  Leitura e da Aula 0. Sem erros de console em nenhuma delas.
- Não auditados nesta rodada, por dentro: os jogos jogados até o fim, o exame final e o
  certificado. Ficam para a rodada 2, com a mesma conta de teste.

## Skills usadas, e o que cada uma trouxe

| Skill | O que trouxe |
|---|---|
| audit-suite:emil-design-engineering | A régua do movimento: animar só o que tem motivo, 150 a 300 ms, `ease-out` para o que entra ou responde a um toque, só `transform`/`opacity`, nada no que se usa centenas de vezes por dia, e "reduzir movimento" sempre. |
| audit-suite:make-interfaces-feel-better | Os detalhes: botão que afunda ao toque (scale .97), transições com propriedades exatas (nunca `all`), números tabulares, selo em vez de só cor. |
| marketing-psychology:behavior-diagnosis | O critério para a rodada 2: um comportamento por vez (voltar para a próxima lição), sem inventar dado. Os achados de "o que trava" abaixo vêm dele. |
| marketing-psychology:price-framing | Uma regra para o preço: o "Depois, R$ 297" só é legítimo se o curso de fato for passar a custar R$ 297. Sem data e sem virada automática (decisão de 23/10), a frase está certa enquanto essa for a intenção. |

## Achados, por prioridade

| # | Tela | Achado | Situação |
|---|---|---|---|
| 1 | Mapa | Módulo com as letras feitas e o checkpoint pendente dizia "Em andamento" ao lado de 100%, e o cartão levava de volta à primeira letra. | Feito |
| 2 | Mapa | Letra concluída só se distinguia pela cor (ruim para quem não distingue cores). | Feito: selo com ✓ |
| 3 | Mapa | A próxima letra a estudar não se destacava das outras. | Feito: borda e anel que se abre 3 vezes |
| 4 | Exercícios | Resposta certa ou errada só mudava a cor; nenhum sinal de movimento. A barra de progresso animava `width`. | Feito |
| 5 | Botões | Sem resposta ao toque no celular (só o "levantar" do mouse). | Feito: afunda ao toque |
| 6 | Lição | A letra nova aparece de uma vez, sem marcar o momento. | Feito: revelação da direita para a esquerda |
| 7 | Lição | A etapa 1 é muito longa no celular (cerca de 9.400 px no Guímel): letra, pronúncia, articulação, erro comum, sílabas, comparação e perguntas numa página só. | Rodada 2 |
| 8 | Laboratório | Os três cartões de modo empurram a primeira palavra para baixo da dobra no celular. | Rodada 2: seletor compacto |
| 9 | Navegação | Barra de baixo com 7 itens e rótulos de 11 a 12 px; "Aula 0" fica nela depois de concluída. | Rodada 2 (muda a navegação: pede o ok do dono) |
| 10 | Painel | O aviso de conquista ocupa um quarto da primeira tela, antes do próximo passo; o botão de acessibilidade cobre parte do "Ler agora". | Rodada 2 |
| 11 | Academia | Os jogos são cartões iguais, sem dizer o que cada um treina nem quando foi jogado. | Rodada 3 |
| 12 | Exame e certificado | Não auditados por dentro. | Rodada 2 |

## Rodada 1: o que mudou

- **Escala de movimento** (`src/styles/tokens.css`): `--dur-toque` 130 ms, `--dur-revela` 640 ms,
  `--ease-out` e `--ease-in-out`, ao lado do `--ease`/`--dur` que já existiam.
- **Resposta certa assenta e errada balança** (`hf-certo`, `hf-errado` em `globals.css`, classe
  `hf-opcao` no ExercisePlayer): 260 e 280 ms, deslocamento de 4 px no máximo. O sinal continua
  sendo também a cor e o ícone, então nada depende do movimento.
- **Barra de progresso** do exercício por `transform: scaleX`, e não `width`.
- **Botões** (`components/ui/Button.tsx`): `active:scale-[.97]`; o levantar do hover fica só onde
  há mouse (Tailwind 4).
- **A letra nova se revela** da direita para a esquerda, no sentido da leitura (`hf-revela`), uma
  vez ao abrir a lição. É um recorte que se abre: o glifo é sempre o da fonte, e nenhum traço é
  desenhado (o caminho da caneta não foi conferido por um nativo; ver `StrokeOrder.tsx`).
- **Mapa** (`app/mapa/CourseMapClient.tsx`): "Falta o checkpoint" levando ao checkpoint, selo nas
  letras concluídas, borda e anel na próxima. As regras de desbloqueio não mudaram.
- **Movimento reduzido**: as duas regras de `globals.css` (a do sistema e a do menu de
  acessibilidade) zeram tudo isso. Medido: a revelação roda em 0,64 s e, com movimento reduzido,
  termina na hora com a letra inteira.

## Conferido

- `npm test`: 1652 passaram. Build da plataforma verde.
- `a11y`, `clique` e `ctas` (páginas públicas, 1280 e 390 px): verdes.
- `a11y-pago` (9 telas pagas a 360 e 390 px, texto em 100% e 150%): verde.
- Capturas do mapa e da lição antes e depois, sem erro de console.

## Revisão pela checklist do Emil (emil-design-engineering, a pedido do dono)

A checklist inteira da skill, conferida no código e medida num Chromium, nas telas do aluno
(painel, mapa, lição, Academia, Laboratório, vocabulário, progresso, perfil, checkout,
depoimento, onboarding) e nas públicas (capa, entrar, criar conta, esqueci a senha):

| Item | Resultado |
|---|---|
| Sem `transition: all` | 5 achados (barras do A1, grade do Blast, sílabas do comparar pronúncia, cartão de sílaba): trocados pelas propriedades exatas; as duas barras do A1 passaram a `transform` |
| z-index numa escala fixa | o `z-[9999]` da imagem da conquista virou `z-[70]`, no topo da escala 10 a 60 do site |
| Área de toque de 44 px | medido: só "Ver o meu vocabulário" (21 px de altura) estava abaixo; agora 44 px |
| Campos com 16 px ou mais (zoom do iOS) | medido: todos os campos visíveis já tinham |
| Números que mudam sem pular de largura | o XP e os placares já usam `tabular-nums` |
| Hover só onde há mouse | Tailwind 4 já faz isso; o CSS próprio do Raízes tem `:hover` solto (fora de venda, fica para quando ele voltar) |
| Foco visível no teclado | `*:focus-visible` global, inclusive no alto contraste |
| Movimento reduzido | regra global (sistema e menu de acessibilidade); as três animações em loop que sobram têm motivo (gravando, ponto de articulação, seta da leitura) |

## O que vem depois

- **Rodada 2:** a etapa 1 da lição em sequência curta (descobrir, ouvir, observar, entender,
  interagir), o seletor compacto do Laboratório, o painel com o próximo passo primeiro, e a
  auditoria por dentro do exame e do certificado (com a revelação do certificado).
- **Rodada 3:** os jogos da Academia (placar que anima sem pular de largura, cronômetro mais claro,
  tela de fim com "tentar de novo"), e as ilustrações com propósito.
- **Precisa do dono:** a barra de navegação de 7 itens (tirar a Aula 0 depois de concluída?) e
  qualquer ilustração com hebraico, que só usa palavras já aprovadas do curso.

As notas de 0 a 100 do pedido são metas. Este documento não dá nota sem evidência; cada rodada
diz o que foi medido.
