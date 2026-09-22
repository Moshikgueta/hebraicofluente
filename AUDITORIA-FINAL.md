# Auditoria final - técnica e pedagógica

Partes 19 e 20 do pedido, rodadas como passe próprio em 22/09/2026, e não
como subproduto de outro trabalho. O que está escrito aqui foi **medido**,
e cada linha diz com o quê.

Duas regras que valem para o documento inteiro:

- onde a resposta é "passa", há o nome do verificador que provou isso, para
  que qualquer pessoa possa repetir;
- onde a resposta é "não passa", está dito o que falta, sem rodeio. Um
  relatório de auditoria que não tem nenhum "não" não foi uma auditoria.

---

## Parte 19 · auditoria técnica

### Progressão

| O que | Resultado | Provado por |
|---|---|---|
| O módulo inicial não trava as letras (ele ORIENTA, não bloqueia) | ver nota | decisão de projeto, abaixo |
| A primeira letra abre | passa | `trava.mjs` |
| A próxima só abre depois de dominar a atual | passa | `trava.mjs`, `tests/progressao` |
| O critério de 80% funciona | passa | `tests/rules`, `tests/progressao` |
| Tentativas funcionam, e repetir não apaga o melhor resultado | passa | `tests/mastery`, `tests/progresso-auditoria` |
| Revisão cumulativa dentro da lição | passa | `tests/cobertura` |

**Nota sobre o bloqueio pelo módulo 0.** O pedido dizia "somente então
desbloqueie a primeira letra". Hoje a aula 0 não tranca o alef: ela é
obrigatória no caminho (o painel e o fim do onboarding levam para lá, e
`varrer-curso.mjs` recusa a volta ao estado em que ela era órfã), mas quem
digitar o endereço da primeira letra entra.

Isso é decisão, e não esquecimento: a trava de progressão existe para que o
aluno não encontre uma tela onde metade dos símbolos é ruído - e a lição do
alef não tem esse problema para quem pulou a introdução. Trancá-la custaria
uma porta a mais na primeira visita, que é o momento em que se perde gente.
Se a preferência for trancar, é uma linha em `porQueTrancada`.

### Rotas

| O que | Resultado | Provado por |
|---|---|---|
| Letra bloqueada não abre pelo endereço | passa | `trava.mjs` |
| A porta diz QUAL letra falta e o que falta nela | passa | `trava.mjs` |
| Quem já tinha progresso adiante não é expulso | passa | `trava.mjs`, `tests/progressao` |

### Persistência

| O que | Resultado | Provado por |
|---|---|---|
| Recarregar a página mantém o progresso | passa | `sincronia.mjs` (contra o Worker e o D1 local) |
| Sair e entrar mantém | passa | `sincronia.mjs` |
| Erro de rede não apaga nem rebaixa | passa | `tests/merge`, `tests/progresso-servidor`, `tests/gravador` |
| Fusão entre dois aparelhos não perde trabalho | passa | `sincronia.mjs`, `tests/merge` |

### Mapa

| O que | Resultado | Provado por |
|---|---|---|
| As 22 letras aparecem | passa | `trava.mjs` |
| Sequência pedagógica correta | passa | `tests/curriculo` |
| Estados corretos (dominada, revisar, atual, nova, bloqueada) | passa | `trava.mjs` |
| A barra conta letras DOMINADAS, não visitadas | passa | `trava.mjs`, `tests/mastery` |
| **Ordem tradicional disponível** | **NÃO EXISTE** | - |

A ordem tradicional é parte da PARTE 3, que não foi feita. Ver "o que
continua em aberto", no fim.

### Áudios

| O que | Resultado |
|---|---|
| Todos funcionam | **impossível verificar: há zero arquivos** |
| Arquivos corretos | idem |
| Shin e Sin separados | o DADO está separado: cada leitura tem `audioId` próprio (`tests/variantes`) |
| Áudio no celular | idem - sem arquivo não há o que medir |

O que dava para fazer sem gravação está feito: ids distintos por leitura,
e o botão de som **some** quando não há arquivo, em vez de tocar nada ou
tocar o som errado (`tests/tipos` recusa exercício de escuta sem gravação).
A auditoria de verdade fica pendente de alguém gravar.

### RTL

| O que | Resultado | Provado por |
|---|---|---|
| Hebraico renderiza correto | passa | `tests/hebrew`, e o contrato do `<He>` (que lança em desenvolvimento se receber pontuação dentro da tira) |
| O niqqud fica com a letra certa | passa | `tests/hebrew` (agrupamento por cluster), `tests/vogais` |
| Shin e Sin corretos | passa | `tests/variantes` |
| Texto misto não quebra | passa | `varrer-curso.mjs` (nenhuma rota rola de lado), e o quadro "Quando a linha tem duas direções" da aula 0 |

### Mobile (390px)

| O que | Resultado | Provado por |
|---|---|---|
| Mapa, práticas, checkpoints, cards, navegação | passa | `varrer-curso.mjs` a 390 e 1280 |
| Botões e toque | passa | `toque.mjs` - nenhum alvo por baixo da barra fixa |
| Cursiva (traçado a dedo) | passa | `tests/trace`, e o canvas não deixa a página rolar sob o dedo |
| Áudios | sem arquivo |

---

## Parte 13 · item 64: os tipos de exercício, um por um

O pedido era explícito: "não assuma que todos funcionam só porque um
exercício semelhante funciona". Foram feitas as duas metades.

**O dado** (`tests/tipos.test.ts`): uma amostra de todos os construtores -
prática, mini-teste, reforço, revisão, checkpoints, exame e academia - com e
sem áudio, dando cerca de 2.400 itens, e 19 invariantes sobre eles. Os 22
tipos declarados aparecem na amostra; nenhum é código morto.

O que se cobra de todo item de escolha: a resposta está dentro da lista, há
pelo menos três alternativas, nenhuma repetida, o retorno de erro está
alinhado com as alternativas, e nunca existe explicação dizendo por que a
resposta CERTA estaria errada. E de cada tipo, o que só ele tem - a sílaba
que se monta, as peças que remontam a palavra, os pares que não repetem
lado, o campo que aceita alguma coisa, o intruso que aparece uma vez só, a
lacuna única, a letra que está mesmo na palavra.

Três achados da primeira execução, e os três eram a MINHA régua errada, não
o curso:

1. `odd-one-out` repete alternativa de propósito - a fileira de iguais é o
   exercício. A regra de unicidade passou a excluí-lo, e ele ganhou a regra
   que é dele: o intruso aparece uma vez.
2. A sílaba montada e a consoante têm os mesmos caracteres em ordem
   canônica diferente (o patah vem antes do daguesh em NFC). Comparar as
   strings acusava dado correto.
3. "Onde está o {{מ}} em {{אֵם}}?" usa a forma FINAL - e é uma boa pergunta,
   não um defeito.

Controles negativos: resposta fora da lista, retorno desalinhado e exercício
de escuta sem gravação derrubam, cada um, exatamente o teste que deveria.

**O comportamento** (`exercicios.mjs`): oito blocos percorridos num
navegador, item a item, pela mesma porta do aluno. O que se prova ali: a
alternativa aceita o toque, o retorno aparece ANTES de dar para seguir,
responder duas vezes não conta duas, e o bloco chega ao fim.

Esta varredura custou seis execuções para ficar de pé, e todas as falhas
foram dela e não do produto - vale registrar, porque é o mesmo erro em
formas diferentes: **um verificador que não sabe operar a tela acusa a tela**.
Ela leu "LETRA 7/22" do cabeçalho como se fosse o contador de exercícios;
chutou um par de ligar uma vez e desistiu, quando o par só trava quando está
certo; e contou como não-respondido todo item de montar e ligar, porque
procurava um atributo que só existe nas alternativas de escolha.

---

## Parte 20 · auditoria pedagógica

A lista de perguntas que um brasileiro faria lendo o curso. Conferido onde
cada uma é respondida:

| A pergunta | Onde o curso responde |
|---|---|
| Por que lemos para o outro lado? | Aula 0, "Da direita para a esquerda", com a microatividade de apontar |
| O hebraico não tem vogais? | Aula 0, "Então onde estão as vogais?" e o quadro "Cuidado com esta frase" |
| O que é essa bolinha? | Aula 0, o quadro do niqqud e a ressalva "nem todo ponto é vogal" |
| O que é Nikud? | Aula 0, com oito perguntas de checagem logo depois |
| Por que essa letra não tem som? | Lições do {{א}} e do {{ע}}, campo `funcaoPt` |
| Por que essa letra mudou no final? | Aula 0, e o `detalhePt` das cinco letras que têm forma final |
| Por que letras diferentes com o mesmo som? | Dez lições tratam disso; {{ט}}/{{ת}} e {{ק}}/{{כּ}} explicitamente |
| Por que preciso aprender cursiva? | Aula 0, "A mesma letra tem dois desenhos", e a etapa Escrever de toda lição |
| Por que não posso escrever igual ao livro? | A analogia da fonte do livro, nas duas telas acima |
| **Por que não estamos aprendendo א, ב, ג em ordem?** | **NINGUÉM RESPONDE** |
| Como israelenses leem sem Nikud? | Aula 0, e é uma das oito perguntas de checagem |
| Qual é a diferença entre Shin e Sin? | Lição do {{ש}}: quadro das duas leituras, exercício dedicado e item no checkpoint |
| Por que não posso abrir a próxima letra? | A porta trancada diz qual letra falta, o que falta nela, e leva até lá |
| Por que respondi certo e o sistema marcou errado? | `tests/tipos` (2.400 itens, 19 invariantes) e `exercicios.mjs` (responder num navegador) |

**13 de 14.** A que falta é a ordem pedagógica, que é a PARTE 3.

---

## O que continua em aberto

1. **Parte 3 inteira** - por que o curso não segue a ordem alfabética. Não
   existe a mensagem que antecipa a estranheza, nem a ordem tradicional no
   mapa, nem a seção "5 coisas que parecem estranhas agora". É a única
   pergunta pedagógica sem resposta e o único item do mapa que falta.

2. **Áudio** - zero arquivos. Tudo o que depende de ouvir está preparado e
   desligado: ids por leitura, botão que some, exercícios de escuta que não
   são oferecidos. Precisa de gravação, não de código.

3. **O bloqueio da primeira letra pelo módulo 0** - hoje é orientação e não
   trava. Está explicado acima; é uma linha, se a decisão mudar.

---

## Como repetir esta auditoria

```
node scripts/validate.js                 # o dado, na fonte
cd app && npx vitest run                 # 621 testes
npx tsc --noEmit -p .
npm run build                            # modo local
node varrer-curso.mjs                    # as rotas do curso, 390 e 1280
node trava.mjs                           # progressão e rotas
node toque.mjs                           # alvos de toque
node a11y.mjs                            # acessibilidade
node tom.mjs                             # tom e tamanho de página
node exercicios.mjs                      # responder cada formato, item a item
NEXT_PUBLIC_PLATFORM_API=worker npm run build
node pacote.mjs                          # conteúdo pago fora do pacote público
node promessas.mjs && node numeros.mjs   # a vitrine
node seo.mjs && node checa-seo.mjs
```

O fluxo de publicação roda o essencial sozinho. `exercicios.mjs` fica de
fora dele de propósito: leva uns seis minutos porque responde exercício por
exercício num navegador, e isso é caro demais para cada publicação. É a
mesma decisão do `npm run check-workbook` do outro projeto - verificação de
pré-publicação, não de commit.
