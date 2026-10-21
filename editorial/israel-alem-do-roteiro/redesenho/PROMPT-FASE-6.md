# MASTER PROMPT | ISRAEL ALÉM DO ROTEIRO, fase 6: mais visual, mais interativo, mais brasileiro

## Contexto
O livro "Israel Além do Roteiro" (Coleção Hebraico Fluente) já existe inteiro:
dez capítulos verificados, numa base estruturada única
(`editorial/israel-alem-do-roteiro/`) que gera o PDF (`tools/revista.mjs`) e a
experiência web (`tools/web.mjs`). O conteúdo está certo, mas a experiência
ainda é de livro de texto: pouca imagem, pouco infográfico, interação
limitada a quiz e checklist.

Esta fase transforma o livro num produto que o leitor brasileiro **queira
abrir, folhear e mostrar para alguém**, sem perder nada do rigor.

## O objetivo, em uma frase
Cada capítulo deve ser entendido primeiro pelos olhos (ilustração, mapa,
infográfico) e depois pelo texto, e na versão digital o leitor deve **fazer**
algo a cada poucos minutos: tocar, comparar, ouvir, montar, responder, guardar.

## Para quem
Brasileiros de 25 a 65 anos, a maioria lendo no celular:
- quem vai em caravana religiosa (evangélica, católica ou judaica) e quer
  entender o que vai ver além do que o guia conta;
- quem viaja por conta própria e quer chegar preparado;
- quem não tem viagem marcada e gosta de história, Bíblia, arqueologia e
  cultura.

O tom é o de um bom guia brasileiro que estudou de verdade: caloroso, direto,
com humor leve, sem infantilizar e sem pregar. Respeito igual às três
religiões e a quem não tem nenhuma.

## 1. Ilustrações e infográficos (o centro desta fase)

### Meta de volume
- **Pelo menos 4 visuais por capítulo**, e um a cada 2 ou 3 páginas do PDF.
  Visual = mapa, infográfico, ilustração explicativa, linha do tempo
  ilustrada, ficha visual, ou foto licenciada.
- **Toda abertura de capítulo com ilustração própria** (não a arte genérica
  da coleção).
- Nenhuma página dupla do PDF só com texto corrido, salvo a bibliografia.

### Tipos de visual (escolha o que serve ao conteúdo)
1. **Mapa ilustrado** (estilo mapa turístico desenhado, não mapa técnico):
   relevo suave, ícones dos lugares, rotas, distâncias e tempos de
   deslocamento.
2. **Infográfico comparativo com o Brasil**: o tamanho de Israel ao lado de um
   estado brasileiro, a distância Tel Aviv-Jerusalém ao lado de um trajeto
   conhecido, o calendário de feriados ao lado do brasileiro, preços em reais
   com data e câmbio declarados.
3. **Corte e anatomia**: o corte do terreno (já existe), as camadas do Muro
   Ocidental, a anatomia de uma placa trilíngue, de um sabich, de uma porta
   da muralha.
4. **Ficha visual de lugar** (um cartão por destino): onde fica, distância de
   Jerusalém, altitude, quanto tempo reservar, melhor horário, o que observar,
   patrimônio da UNESCO, palavra em hebraico do lugar.
5. **Linha do tempo ilustrada** com ícones por período e "quem governava
   Jerusalém" em faixas de cor.
6. **Gráfico de dado** (queda do Mar Morto ano a ano, chuva por cidade,
   população por grupo), sempre com fonte e data na própria figura.
7. **Ilustração de cena** (o mercado na sexta à tarde, o Shabat numa rua de
   Jerusalém, o aeroporto): desenho original, claramente ilustração.
8. **Cartões compartilháveis** (formato 4:5 e 9:16) para as curiosidades do
   capítulo 9 e os "você sabia?", com a marca Hebraico Fluente.

### Sugestão por capítulo (ponto de partida, não lista fechada)
| Cap. | Visuais |
| --- | --- |
| 1 | Israel x estado brasileiro; mapa ilustrado das regiões; queda do Mar Morto em gráfico; "de norte a sul em 9 horas" |
| 2 | Régua do tempo ilustrada (existe); sequência de mapas por império; "quem governou Jerusalém" em faixas; as estelas desenhadas lado a lado |
| 3 | Mapa ilustrado da Cidade Antiga (só com posições verificadas); corte do Monte e do Muro; "um monte, três religiões"; as oito portas em ficha |
| 4 | Mapa de destinos ilustrado; uma ficha visual por destino; perfil de Massada |
| 5 | A semana (existe); feriados israelenses x brasileiros; "quem mora em Israel" em gráfico; o Shabat hora a hora |
| 6 | Anatomia do falafel, do homus e do sabich; mapa das cozinhas que chegaram a Israel; guia visual de cardápio |
| 7 | Anatomia da placa trilíngue; as 22 letras ilustradas; cartões de palavra com áudio |
| 8 | A viagem em linha do tempo (antes, aeroporto, chegada, Shabat); tomada, moeda e notas ilustradas; mapa do trem |
| 9 | Cada curiosidade com um ícone ou mini-ilustração; versão em cartão compartilhável |
| 10 | Diário ilustrado (molduras, pequenos desenhos dos lugares) |

### Regras das imagens (inegociáveis)
- **Mapas, infográficos e gráficos** são desenhos originais em SVG, feitos a
  partir de dados registrados (`afirmacoes/`, `ativos/dados/`). Nenhum número,
  posição ou data no desenho sem registro VERIFICADO.
- **Fotos** só de acervo com licença identificada (domínio público, CC0,
  CC BY; CC BY-SA com decisão do dono), com autor e licença na legenda.
- **Ilustração de cena** pode ser feita à mão em SVG ou com ferramenta
  generativa, mas **só depois de o dono aprovar o uso de IA para ilustração**,
  sempre com o rótulo "ilustração", nunca no lugar de foto, nunca mostrando
  lugar real como se fosse registro, nunca com pessoa real reconhecível, e
  nunca com texto em hebraico gerado pela ferramenta.
- Estilo único para o livro inteiro: paleta da marca (navy, teal, ouro, papel,
  pedra, mar, neguev, oliveira), traço limpo, figuras simples. Documentar o
  estilo em `redesenho/DESIGN-SYSTEM.md` antes de desenhar.
- Todo visual com texto alternativo na web e legenda no PDF.

## 2. Interatividade (versão digital)

### Em todo capítulo
- **Mapa tocável**: tocar no lugar abre a ficha visual com foto, áudio do nome
  e "o que observar".
- **Antes e agora** ou **compare**: um controle deslizante entre dois estados
  (Jerusalém dividida e hoje, o nível do Mar Morto em dois anos, Israel x
  estado brasileiro).
- **Quiz rápido** de 3 a 5 perguntas, com explicação, e uma pergunta
  "pegadinha do guia" (o mito que circula e o que a fonte diz).
- **"História ou tradição?" interativo**: o leitor escolhe antes de ver a
  resposta.
- **Ouça e repita**: palavras em hebraico com a gravação humana do curso, e
  botão "gravar a minha" (fica no aparelho, como no curso).
- **Guardar**: favoritar seções, lugares e palavras; tudo aparece em "Minha
  viagem".

### Recursos novos do produto
1. **Monte seu roteiro**: o leitor marca os lugares que quer ver; o app monta
   a lista por região, com o tempo sugerido de cada ficha e o aviso de Shabat.
   Nada de recomendação de agência ou preço de pacote.
2. **Modo viagem**: o que é útil no dia (frases, Shabat, transporte, tomada,
   telefone da embaixada com data de conferência), funcionando sem internet.
3. **Flashcards** das palavras do livro, com áudio e repetição espaçada simples.
4. **Conquistas** leves (terminou um capítulo, acertou todas, montou o
   roteiro), sem pontos que tranquem conteúdo.
5. **Cartões para compartilhar** (curiosidades e "você sabia?") prontos para
   WhatsApp e Instagram, sem dado pessoal.
6. **Busca única** no livro inteiro (texto, glossário, lugares).
7. **Progresso** por capítulo e "continuar de onde parou" (já existe).

### Requisitos técnicos
- Mobile-first: tudo funciona com o polegar, a 360 px, sem rolagem lateral.
- Acessível: alvos de 44 px, foco visível, leitor de tela, `lang="he"` no
  hebraico, movimento reduzido respeitado.
- Leve: o capítulo abre rápido no 4G; imagens em tamanho certo.
- A mesma base gera PDF e web: nenhum texto escrito duas vezes.

## 3. O toque brasileiro
- **Comparações com o Brasil** sempre que ajudarem a entender (tamanho,
  distância, clima, calendário, preço), cada uma verificada nos dois lados
  (IBGE para o Brasil).
- **Ligações Brasil-Israel verificadas**: por exemplo Oswaldo Aranha e a
  sessão da ONU de 1947, brasileiros que vivem em Israel, voos do Brasil,
  produtos e palavras que o brasileiro já conhece. Só o que tiver fonte.
- **As perguntas que o brasileiro faz**, respondidas em caixa própria
  ("WhatsApp funciona?", "Tem como ir à praia em janeiro?", "Posso tirar foto
  no Muro?", "Dá para pagar com cartão brasileiro?"), com fonte e data.
- **Pronúncia com referência do português** ("ch" como o R de "carro" no
  Rio), no padrão do curso Hebraico Fluente.
- **Para o leitor de fé**: caixa "Na Bíblia" que dá a referência (livro,
  capítulo, versículo) ao lado do que a arqueologia diz, sem tomar partido e
  sem pregar.
- Linguagem do dia a dia brasileiro, sem gíria que envelhece e sem
  regionalismo que exclua.

## 4. Regras que continuam valendo (do projeto e das fases anteriores)
- Nenhuma fonte, autor, número ou imagem inventados; só VERIFICADO e
  CONTESTADO no texto, com o debate atribuído.
- Neutralidade nos temas políticos e religiosos; cada posição com dono.
- **Todo hebraico novo passa pela aprovação do dono** antes de ir ao ar.
- **Nada de travessão nem meia-risca**, em texto, código e documentação.
- Nada inventado sobre o dono (Moshik Gueta); a caixa "O olhar de um
  israelense" é só dele.
- Nenhum identificador de modelo em commits ou arquivos.
- Conteúdo pago nunca no pacote público; nada vai para `main` nem para
  produção sem aprovação ("Posso fazer o merge?").
- Vender o e-book separado do curso é atividade nova (CNAE): apontar ao dono
  antes de qualquer mudança na loja.
- Não substituir o PDF existente nem apagar nada; não afirmar teste que não
  rodou.

## 5. Como trabalhar
1. **Inventário visual** (sem desenhar ainda): para cada capítulo, a lista
   dos visuais propostos, os dados verificados que cada um usa e os que
   faltam pesquisar. Entregar como tabela.
2. **Estilo de ilustração**: três pranchas de teste (um mapa ilustrado, um
   infográfico comparativo com o Brasil, uma ficha de lugar) no estilo
   proposto. **Pedir aprovação do dono** e a decisão sobre ilustração com IA.
3. **Piloto: capítulo 3 (Jerusalém)** completo nesta linguagem, PDF e web,
   com mapa tocável, compare, fichas e "Monte seu roteiro" funcionando para
   os lugares do capítulo. **Pedir aprovação.**
4. Aplicar capítulo a capítulo, em lotes de dois, com pesquisa nova só para o
   que os visuais exigirem (comparações com o Brasil, posições no mapa,
   séries de dados).
5. Auditoria final: contagem de visuais por capítulo, teste a 360 e 390 px,
   acessibilidade, QR lidos de volta, validador sem erros, relatório do que
   ficou pendente.

## 6. Critérios de aceite
- Cada capítulo com pelo menos 4 visuais e uma abertura ilustrada própria.
- Cada capítulo da web com pelo menos 3 tipos de interação além da leitura.
- Pelo menos uma comparação com o Brasil por capítulo, verificada.
- Zero dado em visual sem registro; zero imagem sem licença ou rótulo.
- Validador com 0 erros; nenhuma rolagem lateral a 360 px; nenhum erro de
  console; QR todos lidos de volta.
- Relatório por capítulo: o que entrou, o que foi testado, o que espera o
  dono.
