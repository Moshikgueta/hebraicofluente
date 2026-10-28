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
| 7 | Lição | A etapa 1 é longa no celular. Medida de novo na rodada 2, com os quadros extras já recolhidos: 4.816 px no Guímel (os 9.400 da primeira medida contavam a página inteira). | Rodada 2: a tabela de comparação fica a um toque (Guímel 4.263 px). Feito com o ok do dono (28/10): a etapa vira cinco passos, cada tela entre 1.400 e 1.900 px contando cabeçalho e rodapé |
| 8 | Laboratório | Os três cartões de modo empurram a primeira palavra para baixo da dobra no celular. | Feito: seletor de uma linha; a palavra aparece na primeira tela |
| 9 | Navegação | Barra de baixo com 7 itens e rótulos de 11 a 12 px; "Aula 0" fica nela depois de concluída. | Parte feita (ok do dono): a Aula 0 sai das duas navegações depois de concluída e continua no topo do mapa. Os rótulos ficam para a rodada 2 |
| 10 | Painel | O aviso de conquista ocupa um quarto da primeira tela, antes do próximo passo; o botão de acessibilidade cobre parte do "Ler agora". | Feito o aviso: uma linha (de ~125 para ~64 px). No relatório do exame ele cobria o título do resultado. O botão de acessibilidade só cobre em certas posições da rolagem: fica |
| 11 | Academia | Os jogos são cartões iguais, sem dizer o que cada um treina nem quando foi jogado. | Feito: "Treina: ..." em cada jogo e "Jogado hoje / ontem / há N dias" (do `lastOn` que já existia, sem campo novo no estado). Placares e cronômetro já usavam números tabulares, e o fim de jogo já tinha "Mais uma" |
| 12 | Exame e certificado | Não auditados por dentro. | Feito: exame respondido até o relatório (40 questões, sem erro de console); o certificado dizia que o exame verificou "sem os pontos" e "os sons de fora" a quem não fez essas partes, e agora lista só as que a prova cobrou |

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

## Rodada 2: o que mudou (28/10/2026)

- **Laboratório de Leitura:** os três cartões de nível viram um seletor de uma linha (Guiada,
  Menos ajuda, Independente), com a descrição só do escolhido. A primeira palavra sobe para a
  primeira tela do celular.
- **Aviso de conquista:** uma linha, com "Compartilhar" curto ao lado e o título em até duas
  linhas. Medido: deixava de cobrir o título do relatório do exame.
- **Lição, etapa 1:** "Compare com as letras que você já sabe" fica a um toque. Guímel
  4.816 → 4.263 px; He 5.329 → 4.841 px.
- **Certificado:** "O que o exame verificou" lista só as partes da prova feita.
- Conferido: 1653 testes, varredura do curso nas duas larguras, o exame de ponta a ponta.

## Rodada 3: a Academia (28/10/2026)

- Cada jogo diz o que treina ("Treina: separar as letras parecidas") e quando foi jogado pela
  última vez; os treinos por assunto também ganham o "Jogado há N dias".
- Conferido nos jogos, sem mudar: placar e contadores em números tabulares, cronômetro que conta
  pelo relógio do sistema, e "Mais uma" no fim de cada partida.

## A etapa 1 em passos (28/10/2026, decisão do dono)

A etapa "Conhecer" da lição deixa de ser uma página só e vira cinco passos, um por tela:
Descobrir (a letra), Ouvir (pronúncia e leituras), Entender (o que a letra faz), Praticar (as
sílabas) e Conferir (as perguntas rápidas; letra sem perguntas tem quatro passos). "Voltar" e
"Próximo" sempre andam; nenhum passo cobra nada. O passo novo começa do alto, com o foco no
nome dele, e entra com 6 px e opacidade em 220 ms (zerado pelo movimento reduzido). Pontos ao
lado de "Passo N de 5", e não uma barra, para não parecer uma segunda fileira de abas.
Conferido: as três lições percorridas até "Continuar para as palavras" sem erro de console;
`varrer-curso`, `toque` e `portao` limpos.

## O que vem depois

- **Ilustrações com propósito:** ficam para quando houver o que ilustrar com palavra já aprovada.
- **Precisa do dono:** qualquer ilustração com hebraico, que só usa palavras já aprovadas do curso.

As notas de 0 a 100 do pedido são metas. Este documento não dá nota sem evidência; cada rodada
diz o que foi medido.
