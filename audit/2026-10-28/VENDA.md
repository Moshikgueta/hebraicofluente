# Revisão das páginas de venda (28/10/2026)

Pedido do dono: "faz a revisão das páginas de venda". Páginas: a capa (que é a página do curso,
`/` = `/curso-de-hebraico`) e o checkout (`/checkout/alfabetizacao`, passos 1 e 2). Texto e
capturas tirados do build local a 390 px, como visitante, sem conta. Skills: persuasão
(`marketing-psychology:persuasion-audit`) e preço (`price-framing`). Os ids L.. e DP.. são do
registro de evidências e de regras dessas skills.

## 1. O comportamento

Visitante adulto que nunca leu hebraico (quem) toca em "Começar o curso · R$ 147" ou "Começar a
aprender" na capa (o quê), cria a conta no passo 1 e paga no passo 2 do checkout (onde). Feito =
pedido pago.

## 2. A barreira que segura

- **Atrito (contado):** capa → botão → passo 1 com 3 campos (nome, e-mail, senha), 1 caixa (Termos)
  e 1 botão → passo 2 com 1 escolha (PIX já marcado, o mais barato) e 1 botão → Mercado Pago.
  Cinco interações antes do provedor, sem espera e sem custo escondido: o preço, as 12x "com
  juros da Mercado Pago" e o desconto do PIX aparecem antes do clique. Não é a barreira.
- **Chamada para agir:** há botão no topo, na caixa de preço, no fecho e na barra fixa do
  celular. Não é a barreira.
- **Motivação (a que segura):** a prova para este leitor é uma só. "O que diz uma aluna",
  Natália, é "aluna particular do professor": fala da plataforma, mas não é o caso de quem compra
  só a plataforma. E o tempo do curso não aparece no alto da página (só na pergunta "Quanto tempo
  leva?").

## 3. Alavancas, uma por elemento

| # | Trecho | Alavanca | Evidência | Legítima só se | Regra | Veredito |
|---|---|---|---|---|---|---|
| 1 | "Ler e escrever hebraico, do zero." | promessa de resultado | sem linha no registro (C no máximo) | o curso leva ao ler e escrever as 22 letras | nenhuma | manter |
| 2 | "Mesmo que hoje você não reconheça uma única letra." | reduzir risco percebido | sem linha (C) | a Aula 0 e a lição 1 partem do zero (partem) | nenhuma | manter |
| 3 | "Fazer um teste grátis" · "Sem cadastro e sem cartão" | experimentar antes | L07 (B, só para "grátis" de verdade) | o teste é grátis e sem cadastro (é) | DP-10 não se aplica | manter |
| 4 | "Acesso imediato · 12 meses · sem mensalidade" | clareza do que se compra | sem linha (C) | pagamento único e acesso de 12 meses (o passo 2 confirma) | nenhuma | manter |
| 5 | "PREÇO DE PRÉ-LANÇAMENTO · R$ 147" e "Depois do pré-lançamento, o curso passa a custar R$ 297." | âncora de preço futuro | L02 (B em preço) | o curso vai mesmo passar a R$ 297 (decisão do dono de 27/10); sem data e sem contador | DP-05 não se aplica (não é "de/por"); Review se a virada não acontecer | manter, com o fato confirmado |
| 6 | "No PIX sai por R$ 132,30" | desconto | L13 (C): mostrar valor e porcentagem | o desconto existe (existe, 10%) | nenhuma | corrigido: "(10% de desconto)" |
| 7 | "7 dias para desistir e receber 100% de volta, sem justificar." | reversão de risco | sem linha (C) | é o direito do CDC, contado da liberação (é) | nenhuma | manter; levado também ao resumo do checkout |
| 8 | Depoimento de Natália | prova social | L05 (B), só se verdadeira e de alguém parecido | depoimento real, com autorização (o dono a tem) | DP-04: Review; a ligação "aluna particular" está dita | manter |
| 9 | "Israelense, fala cinco idiomas · Gerente Pedagógico em Tel Aviv · Formação CELTA e estudos em Letras" | autoridade | sem linha (C) | os mesmos fatos de `lib/autor.ts` e /sobre (são) | nenhuma | manter |
| 10 | "você lê palavras reais já na primeira semana" | resultado com prazo | L08 (B) | a primeira palavra vem na lição 2 (vem) | nenhuma | manter |
| 11 | "PIX" já marcado no passo 2 | padrão | L01 (A) | o padrão é a opção mais barata (é) | DP-07 não se aplica | manter |
| 12 | "Pagamento único. Não há assinatura nem renovação automática" | clareza antes de pagar | sem linha (C) | é assim (é) | DP-10 não se aplica | manter |

Não há contador, estoque, "mais vendido", avaliação em estrelas, "de/por" ou caixa pré-marcada
com custo. Nenhuma linha de risco alto.

## 4. Provas

| Prova | Fonte | Resultado | Parecida com o leitor | Conferível | Total |
|---|---|---|---|---|---|
| Natália, Búzios, "aluna particular do professor" | 1 (nome e cidade) | 1 ("Lê e escreve em hebraico", sem prazo) | 1 (aluna das aulas, não só da plataforma) | 1 (a pedido) | 4 de 8 |

- **Concretude da promessa principal:** "Ler e escrever hebraico, do zero" tem o resultado e o
  público ("do zero"), mas não o tempo: 2 de 3. O tempo está em "Quanto tempo leva?".
- **Pede evidência:** "lições de cerca de dez minutos" (na resposta "Quanto tempo leva?"). Com
  cinco etapas por lição, é preciso conferir com o tempo real dos alunos antes de subir essa frase
  para o alto da página.
- **Os números batem entre si:** 7 módulos, 27 lições (3+4+3+3+7+3+4) e 22 letras (6+5+4+4+3).
  R$ 132,30 = R$ 147 com 10% de desconto.
- **Prova que falta, e como colher de verdade:** depoimentos de quem estudou só pela plataforma,
  com o resultado e o tempo ("em 3 semanas li as placas do mercado"). O caminho já existe:
  `/depoimento`, pedido depois de 6 lições, com autorização separada, e o dono aprova em
  `/admin/depoimentos`. Pedir a todos no mesmo momento, não só aos satisfeitos, e nunca em troca
  de XP, desconto ou brinde.

## 5. O que mudou nesta revisão

| Antes → depois | Por quê | Legítimo só se | Ética (revelação, reversão, verdade) |
|---|---|---|---|
| Resumo do pedido do checkout sem a desistência → "7 dias para desistir e receber 100% de volta, sem justificar." no resumo, visível já no passo 1 | o passo 1 pede nome, e-mail e senha antes de mostrar as condições; a reversão de risco estava só no passo 2 | o prazo é o da Política de Reembolso (vem de `data/empresa.json`) | passa, passa, passa |
| "No PIX sai por R$ 132,30" → "No PIX sai por R$ 132,30 (10% de desconto)"; no resumo, "R$ 132,30 no PIX · 10% de desconto" | valor e porcentagem juntos (L13, C); o passo 2 já dizia assim | o desconto existe no checkout (`pixDiscountPct`) | passa, passa, passa |

### Hipótese (a mudança do resumo)

Hipótese: como a reversão de risco (sem linha no registro, C) responde à dúvida "e se não for
para mim?" no passo que pede os dados, levar "7 dias para desistir" ao resumo do pedido deve
aumentar a passagem do passo 1 para o passo 2 entre visitantes novos.
Legítimo só se: o prazo é o direito do CDC, contado da liberação, como em /reembolso.
Guardrails: desistências em 7 dias, estornos, reclamações.
Regra de decisão: subir a passagem e subir as desistências é um teste que falhou.
Como testar: para dimensionar e ler, use uma skill de testes A/B, uma calculadora de amostra ou a
plataforma de experimentos.
Viabilidade: em escala, mudanças desse tipo deram em média +1,4 ponto percentual (L21). Com o
tráfego do pré-lançamento isso não aparece num teste: a mudança vai ao ar por ser honesta e de
baixo risco, sem prometer resultado.

## 6. Regras

As regras do registro destas skills são dos EUA, da UE e do Reino Unido (lidas em 03/10/2026). O
site vende no Brasil, e o registro não cobre o Código de Defesa do Consumidor nem o Decreto
7.962/2013: o que o site cumpre deles está em `tests/consumidor.test.ts`. Nenhuma regra do registro
é acionada pelos elementos acima. Não é parecer jurídico. Regras lidas em 03/10/2026; conferir de
novo qualquer regra lida há mais de 6 meses.

## 7. Suposições

- O curso vai mesmo passar a custar R$ 297 depois do pré-lançamento (decisão do dono de 27/10).
- O depoimento de Natália tem autorização por escrito para publicar.

## 8. Perguntas ao dono

1. Quanto tempo leva, de verdade, uma lição inteira? Se for perto de dez minutos, a frase pode
   subir para o topo ("lições de 10 minutos"); se não, a resposta da FAQ precisa mudar.
2. Já há depoimentos de alunos da plataforma em `/admin/depoimentos`, com autorização? Um deles,
   com o resultado e o tempo, é a prova que falta.

## 9. As outras páginas públicas (28/10/2026)

/cursos, /faq, /metodo, /sobre, /biblia, /suporte, /alfabeto-hebraico e as três políticas, com
o texto tirado do navegador.

- **Corrigido:** /cursos e /metodo diziam que se lê "uma palavra de verdade já na terceira lição".
  Pelos dados, Álef, Mem e Tav são a lição 1, e a Mem já lê אִמָא: a primeira palavra vem na
  primeira lição, na segunda letra. A frase era da ordem antiga (Mem, Tav, Álef). Agora:
  "já na primeira lição" (`data/courses.json`) e "a primeira lição já lê uma palavra inteira,
  logo na segunda letra" (/metodo).
- **Conferido e certo:** nenhuma página fora da capa e do checkout cita preço; nenhuma leva ao
  livro, ao Raízes ou às páginas desligadas em 27/10; "volta na questão em que você parou" existe
  (`retomar` no ExercisePlayer); a etapa Escrever não tranca nada, como a FAQ diz; a menção ao
  e-book na Privacidade é a da prévia em /previa, que continua no ar.
- **Pede evidência (a mesma pergunta 1):** "cerca de dez minutos" por lição aparece também em
  /metodo ("Dez minutos, cinco etapas") e em /suporte ("A primeira letra leva dez minutos").

## 10. O tempo, por letra (28/10/2026, decisão do dono)

A pergunta 1 deste relatório foi respondida pela conta e por uma decisão do dono. O site dizia
"27 lições de cerca de dez minutos" e "a primeira lição leva dez minutos", mas a lição 1 tem três
letras, e só a fixação de cada letra são 20 questões. A estimativa passou para a letra:

- "Quanto tempo leva?" (FAQ e capa, `tempoDoCursoPt`): "Cada letra leva cerca de dez minutos, e
  são 22, mais 8 lições de som e os checkpoints. Quem estuda uma por dia termina em cerca de um
  mês; quem estuda três por semana leva uns 2 meses." A conta usa letras + lições de som.
- Checkout, página de obrigado e os lembretes por e-mail: "a primeira letra leva cerca de dez
  minutos" (o assunto do 1º dia virou "Sua primeira letra leva dez minutos").
- A meta diária do /onboarding acompanha a mesma conta (10 minutos = cerca de uma letra por dia)
  e perdeu "O ritmo da maioria", que não tinha dado por trás.
- O lembrete do 3º dia dizia que a primeira palavra vinha "na lição seguinte"; vem com a letra
  seguinte, o Mem.

Continua sendo estimativa. Quando houver alunos, o tempo real por letra pode ser medido e o
número ajustado.

## 11. As boas-vindas depois da compra (/onboarding, 28/10/2026)

- O painel novo prometia "três perguntas rápidas", e o /onboarding tem quatro ("1 de 4": motivo,
  tempo por dia, o que já sabe e o nome). Agora o painel diz quatro e nomeia as quatro.
- A pergunta do motivo dizia "Isso muda o tom das mensagens ao longo do curso", e nada no curso lê
  essa resposta. Agora: "Fica na sua conta, para a gente conhecer você. Não muda o conteúdo: todo
  mundo faz o mesmo curso."
- "Voltar" passou de 13 px de texto sem área de toque para 44 px de altura; a barra de progresso
  anda por transform, como as outras.
- Conferido: o tempo por dia vira a meta diária de verdade, e a pergunta "o que você já sabe" diz
  que todo mundo começa pela primeira letra (a decisão do dono de 01/10). O fluxo termina na Aula 0.
