# Prática por letra - o que mudou

Relatório do trabalho pedido: auditar quanta prática cada letra realmente
recebia, e depois consertar. Os números aqui não são estimativa - saem do
próprio motor, e estão travados por testes (`app/tests/cobertura.test.ts`).

## 1. O que faltava

A auditoria mediu o estado anterior e achou quatro buracos. Nenhum deles era
visível em revisão de código: todos exigiam CONTAR.

| o que | antes |
|---|---|
| interações por letra | **13** |
| famílias de exercício por letra | 8 |
| itens de letras anteriores dentro da lição | **0** |
| forma final exercitada | só no **Mem** (1 das 5 que têm) |
| letra em outra fonte | só no **Tav** (1 de 22) |
| letra dentro de uma palavra | **nunca** |
| discriminação entre parecidas | **nunca** |

A causa era uma só, e mecânica: a rotação de geradores era **posicional**. O
motor percorria a lista de geradores por número de rodada, e em treze passos
nunca chegava à metade de baixo da lista - onde estavam justamente forma
final, outra fonte e discriminação. Não era uma decisão pedagógica; era um
`for` que não dava a volta.

## 2. O que foi acrescentado

**Cinco geradores novos** (`app/src/lib/engine/generators.ts`):

- `exLetterInWord` - achar a letra dentro de uma palavra inteira
- `exLetterPosition` - onde ela está: começo, meio ou fim
- `exConfusablePick` - a letra ao lado das que se parecem com ela
- `exFinalInWord` - qual forma final pertence a esta letra, dentro da palavra
- `exCursiveToPrint` - a mesma letra noutra fonte, nos dois sentidos

**A lição deixou de sortear e passou a compor em camadas.**
`buildLetterPractice` monta a prática numa progressão declarada -
reconhecer → som → discriminar → dentro da palavra → forma final → outra
fonte → ler - em vez de girar geradores por posição. É a mudança que fez a
diferença: nenhuma das camadas depende de "sobrar rodada".

**Um mini-teste de cinco questões** fecha cada letra (`buildMiniTest`), com
uma questão obrigatória de letra anterior.

**Um reforço montado a partir dos próprios erros** (`buildRemedial`) entra
quando a nota fica abaixo de 80%.

## 3. Quantos exercícios por letra agora

Uma passagem por uma letra = 10 de prática + 5 de mini-teste = **15
interações**, e mais 4 quando o reforço entra (**19** no caminho de quem
errou). O pedido era de 12 a 20.

```
   # | letra      | fin   | itens | famílias | cumulativos | f.final | palavra | parecidas | fonte
   1 | Mem        | final |  15   |    10    |      0      |   sim   |    -    |    sim    |  sim
   2 | Tav        |       |  15   |     8    |      3      |    -    |    -    |    sim    |  sim
   3 | Álef       |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
   4 | Nun        | final |  15   |     9    |      2      |   sim   |   sim   |    sim    |  sim
   5 | He         |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
   6 | Yod        |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
   7 | Guímel     |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
   8 | Dálet      |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
   9 | Shin       |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  10 | Lámed      |       |  15   |     7    |      4      |    -    |   sim   |     -     |  sim
  11 | Resh       |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  12 | Vav        |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  13 | Záyin      |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  14 | Het        |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  15 | Tet        |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  16 | Sámech     |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  17 | Áyin       |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  18 | Tsadi      | final |  15   |     9    |      2      |   sim   |   sim   |    sim    |  sim
  19 | Qof        |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  20 | Bet / Vet  |       |  15   |     8    |      3      |    -    |   sim   |    sim    |  sim
  21 | Kaf / Chaf | final |  15   |     9    |      2      |   sim   |   sim   |    sim    |  sim
  22 | Pe / Fe    | final |  15   |     9    |      2      |   sim   |   sim   |    sim    |  sim

  Média: 15,0 interações · 8,2 famílias · 2,7 itens de letras anteriores
  Total numa passagem pelo alfabeto: 330 interações
```

As duas casas vazias são honestas e ficam explicadas abaixo.

## 4. Quais letras receberam tratamento especial

**Mem e Tav, as duas primeiras.** Nelas não existe palavra que se possa LER -
com uma consoante só não se fecha palavra nenhuma. Em vez de inventar uma
palavra com letra não ensinada (o que quebraria a regra da ordem do curso),
as duas recebem mais trabalho de forma, som e sílaba: o Mem chega a 10
famílias, a maior variedade do alfabeto. A coluna "palavra" vazia nessas duas
é a regra da ordem sendo respeitada, não um esquecimento - e o teste
`cobertura.test.ts` só cobra a letra-dentro-da-palavra onde existe palavra
legível.

**Lámed.** É a única letra do curso sem par confundível declarado nos dados -
a forma dela não se parece com nenhuma outra. Em vez de inventar uma
confusão que não existe, a rodada de discriminação dela vira mais uma de
revisão cumulativa: é a letra com mais itens de letras anteriores (4).

**As cinco com forma final** (Mem, Nun, Tsadi, Kaf, Pe) - seção 5.

**Álef, Shin, Bet e Pe** têm só UM par confundível declarado. Recebem
discriminação pelo "qual não pertence" (`exOddOneOut`) em vez do pareamento
de três, que precisaria de dois parecidos.

## 5. Como as formas finais são tratadas

Antes: uma única letra das cinco via a forma final. Agora as cinco veem, em
duas perguntas diferentes, e a diferença entre elas é o ponto:

- `exFinalForm` - qual é a forma final DESTA letra, entre outras formas
  finais. Com três opções, sendo uma delas a forma final de outra letra: sem
  isso, a pergunta era "qual destes símbolos é diferente" e se acertava sem
  saber de quem era.
- `exFinalInWord` - a mesma letra dentro de uma palavra REAL que termina
  nela, que é onde a forma final deixa de ser curiosidade e vira regra de
  escrita.
- `exLetterPosition` cobra começo, meio e fim explicitamente, o que dá a
  terceira exposição pelo ângulo da posição.

A explicação em português vem junto de cada item (o `why` do exercício), e é
sempre a mesma ideia dita de um jeito concreto: a forma muda quando a letra
fecha a palavra, e só aí.

## 6. Como as parecidas são tratadas

Os pares vêm dos dados (`confusableWith` em `data/letters.json`), letra por
letra - nada é inventado pelo motor. Três coisas usam esse campo:

1. **`exConfusablePick`** põe a letra certa ao lado das parecidas dela, e só
   delas. Distratores aleatórios ensinam a descartar pelo formato geral;
   distratores parecidos obrigam a olhar o detalhe que separa as duas.
2. **`exOddOneOut`** para quem tem um par só.
3. **O registro de confusões do aluno** (`confusions` no estado) guarda qual
   letra ele escolheu quando errou - `correct>chosen` -, o que transforma um
   erro genérico num par treinável. É a diferença entre saber que a pessoa
   errou e saber que ela troca ד por ר.

Sobre o item 3: a revisão e o reforço leem esse registro, então duas pessoas
que erram coisas diferentes recebem prática diferente na mesma letra.

## 7. Como funciona a revisão cumulativa

Dois níveis, e eles respondem a perguntas diferentes.

**Dentro da lição.** Cerca de 30% dos itens são de letras anteriores, com
peso maior para as que vêm custando (o `weak` do estado alimenta a escolha).
Na prática isso dá 2 a 4 itens por letra, o que a tabela acima mostra letra a
letra. Da segunda letra em diante isso é obrigatório - há um teste que falha
nomeando a letra se alguém quebrar.

**Entre lições.** A fila de revisão espaçada (caixas de Leitner, `srs` no
estado) traz de volta o item errado no dia certo, e não na aula seguinte. Os
checkpoints de módulo cobram as letras do módulo inteiro; o exame final cobra
o alfabeto todo.

A proporção cresce sozinha sem ninguém ajustar nada: quanto mais letras
vistas, maior o conjunto de onde os 30% saem.

## 8. Como o domínio é determinado

A régua é **80% no mini-teste de cinco questões**, e o portão **não tranca** -
a decisão importa e está escrita no código:

- acima de 80%: a letra fecha, com a mensagem de que ela foi dominada;
- abaixo: aparece **"Vamos praticar mais um pouco"** e mais 4 questões
  montadas a partir dos **erros daquela tentativa** - não um sorteio novo,
  que seria outra coisa e não reforço;
- depois do reforço a letra fecha de qualquer jeito, com a nota registrada e
  os itens errados na fila de revisão.

Travar um adulto na letra 7 é como se perde um aluno. O sistema de revisão
existe justamente para que nada fique para trás sem voltar - então o portão
mede e ensina, em vez de barrar. Refazer o teste é livre e ilimitado, e uma
tentativa repetida nunca sobrescreve a melhor nota.

A mensagem acompanha a nota de verdade: um resultado de 0% não recebe "faltou
pouco" num cartão verde. São três faixas de texto, e o cartão muda de cor com
elas.

## 9. O exame final

O exame passou a cobrar os tipos novos, e ganhou uma **parte própria** para
eles: **"As letras difíceis"** (5 questões), separada de "As letras" (5).

A separação existe por causa do relatório, que é o produto do exame: "sua
parte fraca são as letras" não diz o que fazer. Quem acerta a letra isolada e
erra nesta parte tem um problema **nomeável** - confunde as parecidas, ou não
reconhece a mesma letra noutra fonte - e é esse nome que a pessoa leva para a
Academia. O exame foi de 30 para 32 questões (37 quando houver gravações).

Há um teste que exige que as cinco famílias apareçam ao longo de cinco
tentativas: uma família morta dentro do exame seria invisível de outro jeito.

## 10. Como verificar

```sh
cd app && npm test            # 265 testes, 11 deles só de cobertura por letra
cd app && npm run audit-letras  # a tabela de cobertura, dos dados
cd app && npm run portao      # o portão de domínio, num navegador de verdade
```

`app/tests/cobertura.test.ts` é o piso: se alguém mexer na composição e uma
letra voltar a receber pouco, ou perder a discriminação, ou perder a forma
final, a suíte cai **nomeando a letra**.

## Sobre o conteúdo hebraico

Nada de hebraico foi inventado neste trabalho. Os geradores novos leem os
mesmos dados que o curso já usava - letras, formas finais, sílabas, palavras,
pares confundíveis, nikud - e `npm run validate` continua cobrando a regra da
ordem (nenhuma palavra usa letra ainda não ensinada) sobre tudo o que eles
produzem. Onde faltava dado para um exercício - palavra legível nas duas
primeiras letras, par confundível no Lámed -, o exercício não aparece, em vez
de aparecer com conteúdo fabricado.
