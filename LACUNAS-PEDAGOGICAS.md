# Lacunas pedagógicas - o brief contra o curso que existe

Feito em 21/09/2026, contra o conteúdo construído (`app/content/`), o motor de
exercícios (`app/src/lib/engine/`), as regras de progressão
(`app/src/lib/state/rules.ts`) e o fluxo da lição.

Este documento responde a uma pergunta só: **do que o brief pede, o que já
existe, o que existe pela metade e o que falta de verdade.** Ele não repete a
análise de `AUDITORIA-PEDAGOGICA.md`, que continua sendo o documento de fundo -
aqui só se verifica.

Os números foram contados agora, não lembrados.

---

## O retrato, em uma tabela

| | |
|---|---|
| Letras | 22, sendo 5 com forma final |
| Módulos · lições | 7 · 21 |
| Checkpoints | 5 (módulos 1 a 5) |
| Sílabas para ler | 132 |
| Palavras-ponte | 89 |
| Frases | 23 |
| Palavras sem nikud | 24, em 3 grupos |
| Cenas do mundo real | 17 |
| Cartas de cultura/história | 10 |
| Tipos de exercício no motor | 19 |
| Geradores aplicáveis por letra | mín 9 · máx 16 · **média 14,9** |
| Letras sem palavra legível | 1 (Álef, que é muda - correto) |
| Letras sem par confundível | 0 |
| **Clipes de áudio gravados** | **0 de 321** |

---

## 1. O que o brief pede e JÁ EXISTE

Isto é mais da metade do brief. Está aqui para você não pagar duas vezes pela
mesma coisa.

| o brief pede | onde já está |
|---|---|
| Progressão em módulos, do fácil ao difícil | 7 módulos, 3 lições cada, ordem por utilidade e não alfabética |
| Não ensinar muitas letras de uma vez | 2 a 6 letras por módulo; 1 letra por lição |
| Estrutura consistente de aula | 5 etapas fixas: Conhecer · Palavras · Escrever · Praticar · Fixação |
| Letras finais | as 5, ensinadas no módulo 5, com gerador próprio (`final-form`, `letter-in-word`) |
| Letras parecidas / "Não confunda" | `confusableWith` nas 22 letras, gerador `exConfusablePick`, modo "Letras parecidas" na Academia |
| Erro comum de brasileiro | **nota própria nas 22 letras**, específica de verdade (ת que vira TCH, ה mudo, ר carioca como vantagem) |
| Diminuir a transliteração | retirada automática por domínio: `sempre` → `um toque` → `sob pedido` |
| Exercícios variados | 19 tipos: matching, múltipla escolha, ordenar, formar palavra, lacuna, identificar letra/som, cursiva↔imprensa, intruso, leitura de frase |
| Leitura real desde cedo | palavras-ponte na lição 1 (`תל אביב`, `שמפו`, `קטשופ`); a 1ª palavra inteira é lida na **2ª letra** |
| Leitura do mundo real | 17 cenas: placa, cardápio, mensagem, produto, aeroporto |
| Escrita | traçado com o dedo, ordem certa dos traços, 27 geometrias reais - etapa 3 de toda lição |
| Mini testes | Fixação ao fim de cada lição + checkpoint ao fim de 5 módulos |
| Revisão inteligente | Leitner de verdade (1, 2, 4, 8, 16 dias) + ~30% de cada prática vindo de letras anteriores + item 5 do mini-teste sempre de letra anterior |
| História do hebraico | 10 cartas, opcionais, não bloqueiam nada |
| Hebraico moderno × bíblico | página `/biblia` pública, com Gênesis 1:1 palavra por palavra |
| Texto bíblico no fim | o mesmo Gênesis 1:1, liberado quando as letras fecham |
| Antes e depois | `antes-depois.ts` - a frase do começo volta no fim |
| Gamificação com lastro | 12 conquistas, sequência de dias, meta diária, domínio por letra |
| Domínio de letras | 5 estados por letra × 5 habilidades (`rec`, `som`, `ler`, `ouvir`, `escrever`) |
| Checkpoints | 5, com nota mínima de 70% |
| Teste final | 7 partes, semente nova a cada tentativa, relatório que nomeia a parte fraca |
| Critério de conclusão | domínio ≥ 75% por letra **e** exame passado - não basta clicar |
| Certificado | exige alfabeto dominado + exame aprovado; diz na própria imagem que não é oficial |
| Próximo passo A1 | tela `/concluido` com a transição |
| Leitura cronometrada | modo "Contra o relógio" na Academia |
| Flashcards / estilo Quizlet | três jogos: Match, Blast e Teste |

---

## 2. O que existe PELA METADE

### 2.1 Áudio - 0 de 321 clipes

Já está dito na auditoria anterior e continua sendo a maior lacuna do produto,
mas vale registrar o tamanho exato do dano **pedagógico**, que é maior do que
parece:

- a habilidade `ouvir` fica em "ainda não visto" nas 22 letras, para sempre;
- a parte `escuta` do exame é filtrada fora: o exame mede **32 itens em vez de
  37**;
- três geradores existem e nunca disparam: `listen-syllable`,
  `audio-recognition`, `type-answer` na variante de ditado;
- o modo "Ouvir e escolher" da Academia fica indisponível;
- e o pior: **as 22 notas de erro brasileiro são quase todas sonoras**. O curso
  explica ח contra ה, o ר raspado e o ת que vira TCH - por escrito, muito bem -
  e o aluno nunca ouve nenhum deles.

O brief pede, no item 7, áudio para letras, sons, palavras, frases e exercícios
de escuta, e no 22 pede gravação de voz do aluno. Nada disso existe hoje.

### 2.2 O exame não mede a frase que o curso passou a ensinar

As 23 frases entraram depois da auditoria anterior, com gerador próprio, e
aparecem na prática. O exame final continua com as 7 partes de antes - nenhuma
delas é frase. O curso ensina uma habilidade que não verifica.

### 2.3 A estrutura da aula tem 5 passos, o brief pede 9

As 5 etapas atuais cobrem 6 dos 9 que você listou:

| o brief | hoje |
|---|---|
| Conheça | etapa 1 |
| **Escute** | **não existe** (depende do áudio) |
| Reconheça | dentro da etapa 4 |
| Diferencie | dentro da etapa 4 |
| Pratique | etapa 4 |
| Leia | etapa 2 |
| **Produza** | **só o traçado** - o aluno nunca digita em hebraico |
| Revise | distribuído (SRS), não é etapa da aula |
| Mini desafio | etapa 5 |

Não recomendo transformar em 9 etapas: aumentaria a lição sem aumentar o
aprendizado, e o brief mesmo diz no item 32 para não inchar. O que falta é
substância em dois dos nove - **Escute** e **Produza** -, não mais caixas.

### 2.4 Os contrastes cobrem 15 letras, não 22

O campo `contrastes` (a frase que diz *onde olhar* quando o aluno confunde duas
letras) existe em 15 letras. **7 letras não têm nenhuma.** Quando falta, o
retorno degrada para "Essa é a letra X, olhe o desenho de novo" - nomeia o erro
sem ensinar a diferença, que é o defeito que o campo foi criado para corrigir.

### 2.5 Checkpoints param no módulo 5

Os módulos **6 (ler sem os pontos)** e **7 (sons modernos)** não têm checkpoint.
São justamente os dois últimos, e o 6 é o mais difícil do curso. O aluno atravessa
a parte mais dura sem nenhuma verificação intermediária antes do exame final.

### 2.6 Pares mínimos de vogal continuam sem treino

A introdução do nikud diz ao aluno, com todas as letras, que "dois sinais para
um som é a dificuldade de verdade". Nenhum exercício treina isso: o gerador
`vowel-sound` monta os distratores a partir das sílabas da letra, que são um som
cada, então patach nunca aparece contra kamats. É a única dificuldade que o
curso nomeia e não exercita.

---

## 3. O que FALTA de verdade

> **Situação em 25/09/2026, conferida no código.** Feitos desde este
> levantamento: 2 (parte "Frases" no exame), 3 (checkpoints nos módulos 6 e
> 7), 4 (todo par de letras parecidas tem a frase de contraste, dos dois
> lados), 5 (`exVowelPair`), 6 (a missão de módulo, `/modulo/N/missao`),
> 7 (`exTypeHebrew` na academia e `/teclado-hebraico`), 9 (verdadeiro ou
> falso na compreensão) e 10 (`ContadorDeLeitura` no fim da lição). Continuam
> em aberto: 1 (o áudio, 0 de 321) e 8 (gravação da voz do aluno).

Em ordem de dano, e nada aqui é opinião de estilo.

| # | lacuna | por que dói | esforço |
|---|---|---|---|
| 1 | **Áudio: 321 clipes, 0 gravados** | mata uma das cinco habilidades e desliga o maior diferencial do curso | grande (3 tomadas) |
| 2 | **Parte de frases no exame** | o curso ensina e não mede | pequeno |
| 3 | **Checkpoint nos módulos 6 e 7** | o trecho mais difícil não tem verificação | pequeno |
| 4 | **Contrastes nas 7 letras que faltam** | erro repetido pelo mesmo motivo é erro não corrigido | pequeno |
| 5 | **Pares mínimos de vogal** (`exVowelPair`) | a dificuldade que o curso nomeia e não treina | pequeno |
| 6 | **Missão de módulo** | o brief pede no item 12; hoje o módulo fecha num checkpoint de itens soltos, não num "eu usei isto" | médio |
| 7 | **Digitação em hebraico** | toda digitação é transliteração; não há teclado hebraico em lugar nenhum | médio |
| 8 | **Gravação de voz do aluno** | item 22 do brief; não existe `MediaRecorder` no projeto | médio |
| 9 | **Verdadeiro ou falso** | o único formato da sua lista 10 que o motor não tem | pequeno |
| 10 | **Fim de lição com "palavras que você já lê: N"** | é o número que corresponde ao que a pessoa comprou | pequeno |

---

## 4. O que REMOVER ou simplificar

O brief pede isto no entregável D, e a resposta honesta é curta: **quase nada.**

Uma coisa só, e já estava na auditoria anterior como H3:

- **A etapa 1 na letra 18 tem a mesma profundidade da letra 1.** Quem já fez
  dezessete lições não precisa da mesma introdução ao ritual. Encolher a etapa
  1 a partir da letra 12 - letra, som, e direto para as sílabas, com "ver a
  explicação completa" a um toque - devolve tempo a quem já sabe o que vem.

E uma coisa a **não** fazer: não acrescentar os formatos de exercício que
sobraram da sua lista (memória, sorting, speed round). Eles repetem habilidades
que os 19 tipos atuais já cobrem, e cada tipo novo é manutenção permanente.

---

## 5. O que eu faria, e em que ordem

Separado por quanto muda o produto, não por quanto custa.

**Primeiro, e sozinho numa categoria:**
1. Gravar a **onda 1 do áudio** (168 clipes). Destrava uma habilidade inteira,
   liga três geradores, devolve 5 itens ao exame, e converte as 22 notas de erro
   brasileiro de explicação em treino.

**Depois, um dia de trabalho ao todo:**
2. Parte de frases no exame
3. Checkpoints nos módulos 6 e 7
4. Contrastes nas 7 letras
5. Pares mínimos de vogal
6. Fim de lição com "palavras que você já lê"

**Com alunos reais na mão, e só então:**
7. Missão de módulo, digitação em hebraico, gravação de voz, etapa 1 encolhida

O motivo da terceira faixa ser a terceira: são as mudanças que alteram o
formato da experiência, e alterar formato sem saber onde as pessoas param é
adivinhação cara.

---

## 6. A conclusão, sem rodeio

**O conteúdo pedagógico deste curso está bem acima da média do que se vende
como "curso de alfabetização em hebraico".** A progressão é sólida, a revisão
espaçada é real, a retirada da transliteração é automática e medida, e a
adaptação ao ouvido brasileiro - 22 notas de erro, 89 palavras-ponte - é
conteúdo original que nenhum concorrente internacional tem.

As lacunas reais são cinco itens pequenos e um grande. O grande é o áudio.

E a ironia continua a mesma da auditoria anterior: **o maior diferencial do
curso é sonoro, e o produto ainda não tem som.**
