# Relatório de paginação: A4

| | Versão 0.1.0 | Versão 0.2.0 |
| --- | --- | --- |
| Páginas (A4) | 54 | 37 |
| Ocupação média das páginas de conteúdo | cerca de 78% | 94% |
| Páginas de conteúdo com mais de 45% vazias | 5 (páginas 5, 14, 20, 23, 41, de 53% a 87% livres) | nenhuma |
| Página de conteúdo menos ocupada | 13% | 74% (página 10, fim do capítulo 2) |
| Fixas (sem medida) | capa, rosto, sumário, contracapa | as mesmas |

A ocupação é medida pelo próprio gerador: a distância entre o topo da área útil e o fim do último bloco, dividida pela altura útil. O valor de cada página fica em `saida/paginacao-a4.json` a cada geração, e o gerador avisa de qualquer página abaixo de 55%.

## Onde cada parte começa (0.2.0)

| Seção | Página |
| --- | --- |
| Sumário | 3 |
| Hebraico de emergência (nova) | 4 |
| Introdução | 5 |
| 01 Como funciona | 6 |
| 02 Primeiras palavras | 8 |
| 03 Conhecendo pessoas | 11 |
| 04 Restaurantes e cafés | 13 |
| 05 Compras e mercados | 16 |
| 06 Orientação e transporte | 18 |
| 07 Números e preços | 21 |
| 08 Placas | 23 |
| 09 Imprevistos | 25 |
| 10 Diálogos | 27 |
| 11 Desafios | 30 |
| 12 Próximo passo | 32 |
| Gabarito | 33 |
| Índice das 100 | 34 |

## Reorganização e consolidação

- **Aberturas de capítulo:** deixaram de ser página própria no A4. Cada uma virou o topo da primeira página do capítulo, com a introdução e o resumo ao lado. Os capítulos 2, 4, 5, 6, 10, 11 e 12 começam no meio de uma página que já tinha conteúdo do capítulo anterior; os outros começam no alto porque a página anterior encheu.
- **Expressões:** passaram a fluir em duas colunas, com altura proporcional ao conteúdo. Uma expressão de duas linhas (ken, lo, po) ocupa duas linhas, não um cartão do tamanho dos outros.
- **Números (cap. 7):** dez cartões, quase duas páginas, viraram uma tabela de dois blocos lado a lado, em meia página.
- **Capítulo 12, gabarito e índice:** passaram a continuar na mesma página quando há espaço, o que evita uma página quase vazia entre o fim do capítulo 12 e o gabarito.
- **Índice:** linhas mais compactas no A4. O tamanho de toque continua na versão de celular.
- **Resumo "Se lembrar de só três":** saiu do fim do capítulo, onde caía muitas vezes sozinho numa página, e foi para a abertura.

## Conteúdo acrescentado (com o espaço que ocupa)

| O quê | Onde | Valor |
| --- | --- | --- |
| Hebraico de emergência | 1 página, logo depois do sumário | consulta imediata pedida no briefing |
| Situação real | 7 quadros, caps. 2 a 7 e 9 | aplicação prática |
| Você vai ouvir | 3 quadros, caps. 4, 5 e 6 | compreensão do que o outro diz |
| Dica de um israelense | 7 quadros | conselho prático do autor |
| Revisão rápida | 8 quadros, caps. 2 a 9 | recuperação ativa |
| Entendeu? | 5 perguntas, uma por diálogo | compreensão |
| Respostas no gabarito | revisões e diálogos | autocorreção |

Mesmo com esses acréscimos, o guia ficou 17 páginas menor.

## Versão para celular

A versão de 108 x 192 mm usa o mesmo conteúdo e o mesmo paginador, numa coluna, com abertura de página inteira por capítulo. Tem 116 páginas e ocupação média de 81%. As páginas de fim de capítulo antes de cada abertura ficam perto de 29%, porque a abertura de página inteira é uma decisão de navegação no celular. Ela não foi o foco deste redesenho, cujo entregável é o A4.
