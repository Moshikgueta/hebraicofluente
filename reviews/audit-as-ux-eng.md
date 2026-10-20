# Auditoria de UX: Hebraico Fluente (site e plataforma)

**Perspectiva**: engenharia de UX (jornadas, não código nem visual)
**Data**: 20/10/2026
**Base**: `main` em 794d85e, export estático percorrido num Chromium a 390px, mais leitura do código das jornadas

Legenda das provas: **[navegador]** visto acontecer; **[código]** conferido no código por mim; **[leitura]** apontado na leitura do código e não reproduzido ainda.

## Resumo

O site de venda está claro e honesto. Os problemas estão nas **passagens entre telas**:
- da conta para o pagamento;
- do pagamento para o acesso;
- de uma etapa da lição para a próxima;
- da primeira entrada para a primeira letra.

Quase tudo é texto ou estado faltando, não funcionalidade faltando.

## Mapa da jornada

| # | Passo | Situação |
|---|---|---|
| 1 | Capa → "Começar o curso · R$ 147" | OK |
| 2 | Checkout, sem conta: "Passo 1 de 2", criar conta | ATENÇÃO: duas apresentações empilhadas; cabeçalho com "Começar" e rodapé completo dentro do checkout |
| 3 | Criar conta → passo 2 (pagar) | FALHA: vai para a página de venda (`/cursos/alfabetizacao?sem-acesso=1`), não para o pagamento [navegador] |
| 4 | Pagar com PIX | FALHA: só o código "copia e cola", sem QR Code [código]; sem os passos de como pagar; validade só aparece num código retomado [leitura] |
| 5 | PIX pago, esperando liberação à mão | ATENÇÃO: ao voltar, a pessoa vê de novo preço e "Desbloquear curso"; risco de pagar duas vezes [leitura] |
| 6 | Primeira entrada no painel | ATENÇÃO: diz "três perguntas rápidas", o questionário tem 4 [navegador]; cerca de 10 blocos disputando a atenção [leitura] |
| 7 | Questionário inicial | OK, mas promete "Dá para mudar depois" a meta diária, e nenhuma tela muda [leitura] |
| 8 | Aula 0 | ATENÇÃO: promete "Dez minutos de leitura, sem nada para decorar" e exige 12 acertos em 17 [navegador]; botão "Ir para a primeira letra" aparece antes de passar e volta para a mesma tela [leitura] |
| 9 | Lição: etapas 1 a 5 | ATENÇÃO: voltar à lição recomeça na etapa 1 [código]; sair no meio do teste perde o teste [leitura] |
| 10 | Resultado do teste | FALHA: de 75% a 79% diz "Mais uma lição concluída." e a próxima continua trancada (75% e 80%, dois limites) [código] |
| 11 | Volta no dia seguinte | ATENÇÃO: a folga é gasta e a sequência some sem aviso [leitura] |
| 12 | Login com erro / esqueci a senha | OK: "E-mail ou senha não conferem."; link vencido sem botão de pedir outro [leitura] |
| 13 | Conteúdo pago sem conta | OK: vai para o login com o retorno guardado [navegador] |

## Veredito: APROVAR COM MUDANÇAS

O produto funciona. Mas quatro defeitos da compra e três da lição custam venda ou fazem o aluno achar que o curso quebrou.

## Problemas críticos (corrigir primeiro)

| # | Problema | Passo | Efeito para a pessoa | Correção |
|---|---|---|---|---|
| 1 | Criar a conta dentro do checkout leva à página de venda, não ao passo 2. O `AuthForm` volta para `?next=`, e o checkout não passa nenhum (`AuthForm.tsx:92`, `CheckoutClient.tsx:613-618`). O comentário no código diz o contrário do que acontece. **[navegador]** | 3 | No momento de maior intenção de compra, ela sai do pagamento e precisa achar "Desbloquear curso" de novo. A página tinha prometido "o pagamento vem logo em seguida, nesta mesma página". | Passar o caminho do checkout como retorno no formulário embutido, ou não redirecionar quando ele está dentro do checkout. Criar um teste que cadastra no checkout e espera "Passo 2". |
| 2 | "Já tem conta? Entrar" dentro do checkout também volta ao painel, e o erro "Já existe uma conta com esse e-mail" não tem link para entrar. **[leitura]** | 2-3 | Quem já tem conta perde o carrinho. | Mesmo retorno para o checkout; link "Entrar" junto do erro. |
| 3 | O PIX mostra só o código "copia e cola"; o QR Code existe no pedido (`qrPngBase64`) e não é desenhado. **[código]** | 4 | No computador, a pessoa precisa levar um texto de mais de 100 caracteres até o celular. | Mostrar o QR quando houver; no PIX direto, gerar no navegador. |
| 4 | Quem pagou no PIX direto e espera a liberação à mão volta ao site e vê de novo preço e "Desbloquear curso". O aviso "não pague de novo" fica embaixo do preço, e o `?sem-acesso=1` que o portão põe na URL nunca é lido (`CourseGate.tsx:181`, `veioSemAcesso()` sem uso). **[código]** | 5 | Paga duas vezes, ou acha que perdeu o dinheiro. | Com pedido PIX pendente ou recente na conta: um aviso "Recebemos seu pedido; liberação em até N dias úteis" acima de qualquer preço, e sem botão de pagar. |
| 5 | Voltar a uma lição recomeça em "Conhecer", mesmo com 4 etapas feitas. O ponto salvo vive 12 h no `sessionStorage`, então outra aba, outro dia ou outro aparelho começam do zero (`LessonClient.tsx:76`). **[código]** | 9 | "Continuar aprendendo" não continua. Parece que o progresso sumiu. | Abrir na primeira etapa que falta (`stagesDone`). |
| 6 | Dois limites para a mesma prova: passa com 75% (`MASTERY_MARK`) e libera com 80% (`LIBERA_MARK`). Entre os dois, a tela diz "Mais uma lição concluída." e oferece "Refazer os exercícios (precisa de 80%)". **[código]** | 10 | Mensagem que se contradiz na tela mais importante da lição. | Um limite só, ou o título "Quase: faltou 1 acerto para abrir a próxima". |
| 7 | O teste de 20 perguntas recomeça do zero se a pessoa sai ou recarrega, e "← Mapa" e as abas saem sem aviso. **[leitura]** | 9 | Perde 10 minutos de trabalho por um toque. | Perguntar antes de sair no meio do teste, ou guardar o teste em andamento. |

## Recomendações

| # | Problema | Efeito | Correção |
|---|---|---|---|
| 8 | O checkout tem cabeçalho de venda (com "Começar", que leva ao próprio checkout) e o rodapé inteiro. **[navegador]** | Saídas e distrações no passo de pagar. | No checkout, cabeçalho só com a marca e "Entrar"; rodapé curto (CNPJ, termos, suporte). |
| 9 | No checkout sem conta, duas apresentações seguidas: "Primeiro, sua conta…" e "Criar sua conta / Seus cursos…". **[navegador]** | Leitura dobrada antes do primeiro campo. | Uma só: "Passo 1 de 2 · Crie sua conta (15 segundos)". |
| 10 | O cadastro mostra um erro por vez, numa caixa no fim do formulário ("Esse e-mail não parece válido." com o nome vazio e os Termos desmarcados). **[navegador]** | Vai e volta: corrige um, aparece outro. | Erro junto de cada campo, todos de uma vez, foco no primeiro. |
| 11 | O pagamento por PIX não diz como pagar nem até quando vale o código novo. **[leitura]** | Quem nunca usou "copia e cola" trava. | Três passos curtos (abra o app do banco, Pix copia e cola, cole) e "Válido até HH:MM". |
| 12 | Copiar o código falha calado em navegadores de app (Instagram), que bloqueiam a área de transferência. **[leitura]** | O botão "não faz nada" justamente para quem vem do Instagram. | Ao falhar, selecionar o código e dizer "Toque e segure para copiar". |
| 13 | A Aula 0 se apresenta como "Dez minutos de leitura, sem nada para decorar"; são 14 partes e uma checagem de 17 perguntas. O painel chama de "uma checagem curta". **[navegador]** | Expectativa quebrada antes da primeira letra. | Dizer o tamanho real logo no começo (cerca de 20 min, 12 de 17 para passar). |
| 14 | São três passos antes da primeira letra: questionário (4 telas), Aula 0 e a checagem. O painel diz "três perguntas", o questionário mostra "1 de 4". **[navegador]** | O aluno pagou para ler hebraico e leva 20+ minutos para ver o Álef. | Acertar o número; avaliar tirar a pergunta "o que você já sabe" (todos começam na letra 1 de qualquer jeito). A Aula 0 obrigatória é decisão sua: a sugestão é só ser transparente sobre ela. |
| 15 | O painel de quem nunca estudou mostra cerca de 10 blocos: práticas que respondem "a academia abre depois da primeira lição", quatro contadores em zero, "Nada estudado ainda". **[leitura]** | O único passo certo (Aula 0) se perde. | Antes da primeira lição, só o cartão principal. |
| 16 | A barra de baixo tem 7 abas (Hoje, Meu curso, Revisão, Praticar, Progresso, Palavras, Aula 0) desde o primeiro dia. **[navegador]** | Muita escolha; "Revisão" e "Praticar" parecem a mesma coisa para quem começa. | 4 a 5 abas; "Aula 0" sai da barra quando concluída. |
| 17 | "0 XP" e o presente (loja) no cabeçalho desde o primeiro minuto, sem explicação. **[navegador]** | Jargão e uma porta que ainda não leva a nada. | Mostrar depois do primeiro XP, com uma linha do que é. |
| 18 | Três números parecem "letras aprendidas": "letras dominadas", "lições concluídas" e, em /perfil, "Letras" com o número de lições. A desistência diz "você já domina N de 22" usando lições. **[leitura]** | O aluno não sabe onde está. | Um nome por métrica, igual em toda tela. |
| 19 | O aviso de direitos autorais ("pode gerar responsabilização civil e criminal") aparece em toda tela da plataforma, até no questionário de boas-vindas. **[navegador]** | Tom de suspeita com quem acabou de pagar. | Manter nas aulas, como decidido; tirar do questionário, do painel e da conta, ou suavizar ("Este conteúdo é só para a sua conta. Termos, art. 5"). |
| 20 | A meta diária ("Dá para mudar depois") não aparece nem se muda em lugar nenhum, e a sequência depende dela. **[leitura]** | Promessa não cumprida; sequência quebra por uma regra invisível. | Mostrar "Meta: 10 min/dia" com "mudar", no painel ou em /perfil. |
| 21 | A folga é gasta e a sequência zera sem aviso. **[leitura]** | Quem comprou folga com XP não sabe se ela serviu. | Aviso de uma vez: "Sua folga cobriu ontem" ou "A sequência recomeçou; seu recorde é N". |
| 22 | Pular etapas pelas abas e tirar 100% no teste dá "Mais uma lição concluída." e "Refaça o teste", quando o que falta é a etapa pulada. **[leitura]** | Refaz o teste sem motivo. | Dizer qual etapa falta, com link. |
| 23 | A nota que libera (16 de 20) só aparece depois do teste. **[leitura]** | Prova sem saber a régua. | Uma linha antes: "20 perguntas; com 16 certas a próxima lição abre". |
| 24 | Em /perfil, falha ao carregar as compras vira "Nenhuma compra registrada nesta conta.", e o botão de desistir some. **[leitura]** | Quem pagou lê que a compra não existe. | Estado de erro próprio, com "Tentar de novo". |
| 25 | Link de nova senha vencido: o erro diz para pedir outro, mas não há botão; só "Lembrou a senha? Entrar". **[leitura]** | Beco sem saída. | Botão "Pedir um link novo" junto do erro. |
| 26 | A confirmação de desistência usa linguagem de perda ("Ao desistir, você perde o acesso a:") ao lado de uma oferta para ficar. **[leitura]** | O Decreto 7.962 pede desistência tão fácil quanto a compra; tom de retenção pode ser lido como obstáculo. | Texto neutro; levar ao advogado junto com o resto. |

## Pequenos ajustes

| # | Sugestão | Motivo |
|---|---|---|
| 27 | Um padrão de confirmação: "[verbo específico]" / "Cancelar" (hoje: "Sair mesmo assim", "Confirmar desistência"/"Voltar", "Apagar minha conta para sempre"/"Cancelar"). | Memória muscular. |
| 28 | Um nome para o painel em todo botão de saída ("Ir para Meu Hebraico", "Continuar", "Meu Hebraico", "Voltar ao início"). | Hoje são cinco nomes para o mesmo lugar. |
| 29 | Um padrão de erro e um de aviso (hoje são quatro estilos). | Erro tem de parecer erro em toda tela. |
| 30 | Errar mostra "↻" na alternativa, mas não há segunda tentativa no teste; e todo erro diz "Quase.". | O ícone promete o que não acontece; "Quase" num erro total soa estranho. |
| 31 | O cabeçalho da lição mistura "lição 5 · letra 4/22". | Duas réguas ao mesmo tempo. |
| 32 | A revisão vazia diz "Ir para a primeira lição" e leva ao painel (para o aluno novo, à Aula 0). | O botão diz uma coisa e faz outra. |
| 33 | /perfil não mostra nada enquanto carrega. | Tela em branco parece defeito. |
| 34 | A marca d'água vertical à esquerda passa por cima do conteúdo no celular. | Decisão sua mantê-la; no celular, um pouco mais de margem evita encostar no texto. |

## Consistência entre as jornadas

- **O que está bom:** nada de janela modal para informação, tudo inline; erros de login sem revelar se o e-mail existe; o portão guarda o destino e devolve depois do login; as telas trancadas dizem por quê e para onde ir ("A letra מ ainda não abriu… Ir para Álef").
- **Onde destoa:** a forma de confirmar uma ação, a forma de mostrar erro e o nome do painel mudam de tela para tela. E duas regras numéricas (75% e 80%; 3 e 4 perguntas) se contradizem.

## Veredito por critério

- **Facilidade de achar:** PASSA. As ações principais estão onde se espera; a barra de baixo tem abas demais para quem começa.
- **Jornada completa:** COM RESSALVAS. A compra sai do trilho depois do cadastro (#1), e a lição não continua de onde parou (#5).
- **Recuperação de erros:** COM RESSALVAS. Link vencido sem saída, compras que "somem" num erro de rede, cópia que falha calada.
- **Retorno do sistema:** COM RESSALVAS. A régua da prova só depois da prova; folga e sequência mudam sem aviso; o PIX sem prazo e sem passos.
- **Consistência:** COM RESSALVAS. Quatro estilos de erro, cinco nomes para o painel, dois limites de aprovação.

## Ordem sugerida

1. **Compra:** #1, #2, #3 e #4. São perda direta de venda e risco de cobrança dupla.
2. **Lição:** #5, #6 e #7. São o que faz o aluno achar que o curso quebrou.
3. **Primeira sessão:** #13, #14, #15 e #20.
4. **O resto,** em lotes pequenos.
