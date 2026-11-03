# Relatório de melhorias: versão 0.2.0 (redesenho editorial)

Base: a versão 0.1.0 (commit 3e75829, tag local `guia-v0.1.0`), PDF A4 de 54 páginas. Este redesenho preserva as 100 expressões, a numeração 001 a 100, a ordem dos capítulos e a proposta pedagógica. O que mudou está abaixo; o detalhe linguístico e factual está nos outros relatórios desta pasta.

## Diagnóstico da versão 0.1.0

1. **Grade rígida.** As expressões ficavam numa grade de duas colunas alinhada por linha: cada linha tinha a altura do cartão mais alto, e sobrava branco ao lado dos menores.
2. **Aparência de aplicativo.** Toda expressão era uma caixa arredondada com borda; somadas aos quadros, a página virava uma sequência de cartões de interface.
3. **Páginas vazias.** O fim de capítulo e as aberturas deixavam páginas com 53% a 87% de área livre (páginas 5, 14, 20, 23 e 41 do A4 antigo).
4. **Medida de texto longa.** O texto corrido ocupava a largura inteira do A4: linhas longas demais para leitura confortável.
5. **Números em 10 cartões.** De 1 a 10, um cartão por número, ocupando quase duas páginas.
6. **Rótulos repetidos.** "sem vogais" em todo cartão.
7. **Índice em zigue-zague.** Lido em linhas alternadas entre as duas colunas.
8. **Marcadores do PDF poluídos.** 90 entradas geradas de todo título da página, com palavras coladas.
9. **Hebraico solto no texto.** Palavras hebraicas no meio de frases em português sem isolamento de direção.

## Design

- **Sistema tipográfico fixo** (`_motor/estilo/guia.css`, variáveis `--t-*`): títulos, corpo, transliteração, hebraico, legendas e rótulos têm um tamanho cada, igual em todo o livro. Títulos com espaçamento negativo; rótulos em versalete com espaçamento positivo; números com algarismos tabulares.
- **Grade editorial de duas colunas** (84 mm, de 55 a 60 caracteres por linha) com margens de 17 mm nas laterais, 13 mm em cima e 12 mm embaixo. Cabeçalho corrido discreto (capítulo à esquerda, título do guia à direita) e número de página no pé.
- **A entrada de dicionário substitui o cartão.** Cada expressão passa a ter um filete em cima, o número, a pronúncia e o sentido à esquerda, e o hebraico com nikud à direita, com a forma sem vogais no canto. A altura acompanha o conteúdo. Só as oito expressões centrais (shalóm, todá, bevakashá, slichá, efshár, káma ze olé, éifo, aní lo mevín) ganham fundo, como destaque.
- **Caixas só para o que é de outra natureza:** cultura, dica, situação real, "você vai ouvir", revisão rápida e atividade. Cantos de 1,2 mm em vez de 3 mm; curiosidade e pronúncia sem caixa, só com filete.
- **Aberturas de capítulo integradas** no A4: número grande, título, ilustração e a palavra-símbolo em hebraico no topo da página, com a introdução e o resumo "Se lembrar de só três" lado a lado. O capítulo seguinte começa na mesma página quando sobra pelo menos 42% dela.
- **Tabela dos números:** de 1 a 10 em duas metades lado a lado, com a forma de contar e a forma com coisa masculina (em dourado) na mesma linha.
- **Diálogos como roteiro**, sem balões: falante marcado por cor e letra, hebraico à direita, pronúncia e tradução à esquerda.
- **Figuras revisadas:** os rótulos miúdos foram ampliados; as moedas perderam a cor (dourado e prateado não foram verificados em fonte oficial); "atá ou at" virou figura e absorveu o quadro que dizia a mesma coisa.

## Diagramação (o problema principal)

O paginador (`_motor/paginar.js`) foi reescrito. Antes ele tentava encaixar e, quando não cabia, abria outra página. Agora:

1. **Mede** cada bloco na largura em que ele vai ficar, depois de as fontes carregarem.
2. **Enche as colunas como um jornal:** a primeira de cima para baixo, depois a segunda.
3. **Equilibra** o fim de cada sequência (antes de um bloco largo ou no fim do capítulo), escolhendo o corte que deixa as duas colunas com a mesma altura. O que vem depois começa logo abaixo, sem buraco.
4. **Encadeia** capítulos, gabarito e índice num fluxo só no A4. Cada um começa numa página nova apenas se a página atual estiver quase cheia.
5. **Nunca parte** uma expressão, um quadro, uma fala ou uma questão. Um título nunca fica no pé da coluna sem o bloco seguinte.

Também foram corrigidos dois defeitos de medida. A página-modelo era criada fora do `<body>` e por isso herdava outra fonte. E o arredondamento de pixel deixava um bloco "caber" por meio pixel.

Resultado: 54 para 37 páginas, com ocupação média de 94% das páginas de conteúdo e nenhuma abaixo de 74%. Ver PAGINACAO.md.

## Conteúdo e pedagogia

- **Introduções dos capítulos reescritas:** cada uma diz em que situação o vocabulário aparece, o que se aprende e como usar na viagem.
- **Hebraico de emergência:** uma página de consulta imediata depois do sumário, com 12 expressões organizadas por necessidade (cumprimentar, agradecer, pedir, preço, lugar, não entender, ajuda, situação difícil), cada uma com link para a expressão completa.
- **Situação real** (7 cenas): a cena, o que você diz e o que pode ouvir de volta. Por exemplo: "Você está numa cafeteria em Tel Aviv e quer pedir água."
- **Você vai ouvir:** listas com o que atendente, vendedor, motorista e taxista dizem (restaurante, compras, transporte). As duas expressões do vocabulário que o viajante ouve, e não diz (038 e 045), vêm marcadas.
- **Dica de um israelense** (7 dicas práticas, na voz do autor; precisam da aprovação dele).
- **Revisão rápida** no fim dos capítulos 2 a 9: três perguntas de recuperação ativa, com resposta no gabarito e link de volta à expressão.
- **Diálogos com pergunta de compreensão** ("Entendeu?"), também respondida no gabarito.
- **Conclusão comercial reescrita**, com a mensagem do briefing ("O guia ajudou você a se comunicar…") e só o endereço real do curso.
- **Generalizações absolutas retiradas:** "todo israelense", "o café mais pedido", "sempre funciona", "qualquer israelense gosta".
- **Hebraico no texto corrido isolado automaticamente.** Todo trecho em letras hebraicas vira um span `lang="he" dir="rtl"` e não quebra de linha, porque partido ele inverteria a ordem das palavras.

## Experiência digital

- Sumário, índice das 100 expressões, gabarito (ida e volta), resumos, galeria de placas e "Expressões do diálogo" são links internos: 307 no A4.
- 18 marcadores do PDF, um por seção, com o painel de marcadores aberto ao abrir o arquivo.
- Metadados: título, autor, assunto, palavras-chave e idioma pt-BR. O PDF é marcado (tagged), e o hebraico pode ser pesquisado e copiado.
- Nenhuma página é imagem: todo o texto continua texto. Arquivo de 1,4 MB.

## O que não mudou

A numeração das 100 expressões, os ids, o critério de contagem, a convenção de transliteração e de nikud, a estrutura de arquivos, a geração de duas versões (A4 e celular) e a regra de não prometer áudio.
