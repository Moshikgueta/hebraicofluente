# Diagnóstico do rascunho de 153 páginas

Fase 1 do redesenho. Data: 21/10/2026. Base: o PDF digital de rascunho
(`saida/israel-alem-do-roteiro-digital-RASCUNHO.pdf`, 153 páginas, 148 x 210
mm), o HTML paginado de onde ele sai, os registros de afirmação e de fonte, as
auditorias por capítulo e a auditoria cruzada. As contagens abaixo foram
medidas no HTML paginado, página a página.

## 1. O que o PDF é hoje, em números

| Tipo de página (medido) | Páginas | % |
| --- | --- | --- |
| Texto corrido | 68 | 44 |
| Notas de fonte e bibliografia | **39** | **25** |
| Caixas editoriais dominando a página | 17 | 11 |
| Diário e checklist | 11 | 7 |
| Aberturas de capítulo (todas iguais) | 9 | 6 |
| Glossário | 4 | 3 |
| Figuras (mapas, infográfico) | **4** | **3** |
| Capa | 1 | 1 |

- **Fotografias: zero.** Mapas: três. Infográficos: um.
- **328 marcas de fonte** sobrescritas no corpo do texto.
- **17 páginas com menos de 40% de ocupação** (páginas 1, 5, 7, 38, 54, 86,
  97, 117, 119-121, 123-125, 127, 131 e 149): fim de capítulo, diário e notas.
- **Dois títulos de seção sem texto** no capítulo 7 ("A língua que voltou a ser
  falada", "Como ler uma placa trilíngue").
- **72 caixas**, das quais 22 são "Em hebraico", todas com o mesmo cartão
  branco de borda lateral.

Conclusão: o livro hoje é, visualmente, um relatório de pesquisa bem
organizado. Um quarto das páginas é aparato; o resto é texto com cartões. O
rigor está lá e deve ficar. O que falta é experiência visual, ritmo e cortes.

## 2. Estrutura editorial

| # | Problema | Onde | Gravidade | Solução proposta |
| --- | --- | --- | --- | --- |
| E1 | Aparato de fontes ocupa 25% do livro e interrompe a leitura a cada página | todas as notas de fim de capítulo; 328 sobrescritos | alta | Corpo do texto **sem sobrescritos**. Cada seção ganha uma linha discreta "Fontes desta seção: n" no rodapé da página, que leva às notas reunidas **no fim do livro**, em corpo pequeno e duas colunas. Na web, um botão "Fontes" por seção. A rastreabilidade continua inteira, porque a ligação afirmação → fonte fica no registro. |
| E2 | Aberturas de capítulo idênticas (número, título, lista de seções, faixa) | 9 páginas | alta | Abertura cinematográfica: imagem de página inteira (fotografia licenciada ou, enquanto não houver, ilustração documental original), título sobre a imagem, uma frase de entrada. |
| E3 | Sumário promete capítulo 9, que não existe, e o capítulo 2 para em 1947 | sumário, introdução, encerramento | alta | O sumário passa a sair só do que existe; os textos de introdução e encerramento serão revistos quando a estrutura fechar (auditoria cruzada 3.12). |
| E4 | Diário espalhado em 9 páginas quase vazias | cap. 10 | média | Diário compacto (4 a 5 páginas com pautas em duas colunas) no PDF; a versão completa e salvável vive na plataforma. |
| E5 | Seções vazias no cap. 7 | cap. 7 | alta | Fora do PDF até terem texto verificado. |
| E6 | Capítulos muito diferentes em extensão (1.500 a 3.200 palavras) por causa da cota de busca, não de decisão editorial | todos | média | Fechar a pesquisa (ver `pesquisa/plano-de-pesquisa.md`) antes da produção integral. |
| E7 | Status de Jerusalém Oriental e do Golã prometido em remissões que não levam a lugar nenhum | caps. 1, 5 | alta | Resolver no capítulo 1 (piloto), com fonte da ONU, e apontar as outras remissões para lá. |

## 3. Escrita

O texto é correto e cuidadoso, e às vezes cuidadoso demais: o rigor aparece
na própria frase ("segundo números que o mesmo ministério divulgava por volta
de 2013"), o que é certo para a precisão e cansativo para a leitura.

| # | Problema | Exemplo | Solução |
| --- | --- | --- | --- |
| W1 | Atribuição dentro de toda frase | cap. 1, "Quanto mede Israel" | Atribuir no texto só quando a fonte é parte da história (há dois números oficiais diferentes, e o leitor precisa saber por quê). O resto vai para as fontes da seção. |
| W2 | Abertura de capítulo sem cena | quase todos | Começar por um lugar, uma pessoa, um objeto ou um número que espanta, como no jornalismo cultural. |
| W3 | Parágrafos de 7 a 9 linhas no formato A5 | caps. 2, 3, 4 | Parágrafos de 3 a 5 linhas; uma ideia por parágrafo; intertítulos mais frequentes. |
| W4 | Advertências metodológicas repetidas no corpo ("não foi possível confirmar", "esta edição não...") | cap. 8 | Uma caixa "Atenção" por assunto, com data; o corpo diz o que se sabe. |
| W5 | Frases maiores que a fonte | 34 casos, 30 corrigidos | Ver `auditoria/auditoria-cruzada.md`, seção 1. |

## 4. Design visual

| # | Problema | Solução |
| --- | --- | --- |
| V1 | Nenhuma fotografia | Fotografia documental licenciada em todo capítulo (ver seção 7 sobre o que este ambiente permite). |
| V2 | Um só tipo de página | Sistema de dez composições (ver `DESIGN-SYSTEM.md`). |
| V3 | Cartões repetidos para tudo (72 caixas iguais) | Menos caixas: o vocabulário vira uma faixa tipográfica com o hebraico grande; "Você sabia?" vira nota de margem; "História ou tradição?" vira uma página de duas colunas comparando. Fios e rubricas no lugar de bordas, como a capa do site já faz. |
| V4 | Títulos em sans pequeno, sem contraste de revista | Título em serifa de alto contraste (Literata em tamanho óptico de display), rubrica em versalete com letra hebraica numerando as seções. |
| V5 | Mapas bons, mas pequenos e sem leitura guiada | Mapa como página de experiência visual, com legendas numeradas no próprio mapa. |
| V6 | Infográficos quase ausentes | Perfil de altitude (Mediterrâneo → Mar Morto), régua da descida do Mar Morto, gradiente de chuva com cidades, comparação de áreas. |
| V7 | Páginas quase vazias ao fim de cada capítulo | Notas no fim do livro (E1) e composição que fecha o capítulo numa imagem ou num "Perguntas e descobertas". |

## 5. Verificação factual (registro consolidado)

O registro completo, afirmação por afirmação, está em `afirmacoes/` e nas
auditorias. Os pontos que mudam o que o livro pode dizer:

| # | Problema | Onde | Gravidade | Fonte que falta | Solução |
| --- | --- | --- | --- | --- | --- |
| F1 | 1948 e todo o período posterior ausentes | cap. 2 | **bloqueante** | UNRWA, ONU, historiografia (Morris, Khalidi, Shlaim, críticos) | rodada de pesquisa dedicada |
| F2 | Status de Golã e Jerusalém Oriental sem a frase da ONU | caps. 1, 2, 3 | **bloqueante** | Resoluções 497 e 478 do Conselho de Segurança | pesquisado agora no piloto |
| F3 | Afirmações no texto apoiadas só em jornalismo, fora da exceção do fato datado | 9 registros | alta | fonte de nível A a D | rodada 5 do plano |
| F4 | Nível do Mar Morto apoiado em fontes de nível E | cap. 1 | alta | Serviço Hidrológico / Autoridade da Água | pesquisado agora no piloto |
| F5 | Convenção de nikud diferente entre capítulos | 1, 3, 4, 5, 6 x 7 | alta | decisão do autor | aguardando a decisão |
| F6 | Datas antigas e medievais só com Britannica | cap. 2 | média | literatura acadêmica | rodada 4 |
| F7 | Informação prática: entrada de brasileiros, transporte, moeda sem fonte oficial | cap. 8 | alta | PIBA, Israel Railways, Banco de Israel | rodada 2 |
| F8 | Orientação do Itamaraty "não viajar" na data da consulta | cap. 8 | alta (comercial) | reconsultar no dia da publicação | decisão do dono |
| F9 | Todo o hebraico pendente de aprovação do autor | 158 ocorrências | alta | o autor | `auditoria/hebraico.md` |

Nada neste diagnóstico foi declarado verificado sem fonte consultada. Onde
não houve fonte, o item fica pendente.

## 6. O repositório

- **App:** Next.js 15 em export estático (`app/`), React 19, Tailwind 4,
  tokens em `app/src/styles/tokens.css`. Rotas pagas atrás do portão do Worker
  (`worker/src/gate.js`); o conteúdo pago nunca vai no pacote público: sai de
  `/api/content`, com cookie e direito de acesso no banco (regra do
  `CLAUDE.md`).
- **Conta e progresso:** sessão por cookie `__Host-hf_session`; progresso do
  aluno em `LearnerState`, sincronizado com fusão monotônica
  (`app/src/lib/state/merge.ts`). Todo campo novo precisa de regra de fusão e
  de teste.
- **Comércio:** catálogo único `data/courses.json`; pedidos e direitos em D1
  (`orders`, `entitlements`, com prazo em meses); Mercado Pago com PIX direto
  de reserva; desistência e estorno automáticos.
- **Áudio:** gravações humanas do dono em `audio/`, id = hash do hebraico com
  nikud (`tools/audio-id.mjs`), servidas atrás do portão. Oito palavras do
  capítulo piloto já estão gravadas (יָם, מַיִם, הַר, יִשְׂרָאֵל, חַם, קַר,
  שֶׁמֶשׁ, נָהָר); o resto entra no roteiro de gravação.
- **Componentes reaproveitáveis:** `<He>` (a única porta para hebraico),
  `AudioButton` e o registro de áudio, o teclado hebraico, o painel de
  gravação, a marca d'água por conta, o diário e o progresso por conta.

## 7. O que este ambiente permite, e o que não

Dito antes, para não aparecer como surpresa no piloto:

- **Fotografias:** daqui não dá para baixar nenhuma imagem: a rede bloqueia o
  Wikimedia Commons, museus e bancos de imagens. Dá para **escolher** as
  fotos (a busca mostra arquivo, autor e licença) e deixar pronta uma
  ferramenta que, rodando na sua máquina ou numa Action, baixa cada uma pela
  API do Commons e **confere a licença no próprio metadado** antes de aceitar.
  O piloto mostra a composição final com as molduras no lugar e o crédito da
  foto escolhida, marcadas como "fotografia a inserir".
- **QR codes e links:** os códigos são gerados e **decodificados de volta**
  aqui, para provar que levam ao endereço certo. Abrir os endereços não é
  possível daqui; o teste de que cada página responde fica num verificador de
  links para rodar fora (ou numa Action). Nenhum QR aponta para página da
  plataforma que ainda não existe.
- **Áudio:** só gravação humana. Nenhuma voz sintética para hebraico.
- **Imagens geradas por IA:** não são usadas como documentação. As ilustrações
  do piloto são diagramas originais, identificados como tal, desenhados a
  partir de dados verificados.

## 8. Direção de arte, em uma frase

**Uma publicação de museu com ritmo de revista de viagem:** fotografia grande e
honesta, mapas e cortes de paisagem como protagonistas, tipografia serifada de
alto contraste, rubricas com letras hebraicas e fios finos no lugar de
cartões, e o hebraico tratado como objeto bonito, não como exercício. O
detalhamento está em `DESIGN-SYSTEM.md`.

## 9. Arquitetura recomendada

Detalhada em `ARQUITETURA.md`. Em resumo: o manuscrito em Markdown continua
sendo a fonte única (é onde se escreve e se corrige), compilado para uma base
estruturada em JSON (`conteudo/capNN.json`) com unidades por seção, blocos
tipados, fontes resolvidas, áudios, atividades, data de revisão e status de
verificação. Dessa base saem os dois produtos: o PDF (pelo pipeline atual,
com a nova folha de estilos) e a experiência web (componentes que leem o mesmo
JSON). Na plataforma, a experiência entra como produto novo atrás do mesmo
portão, servida por API com sessão e direito de acesso, e nunca no pacote
público.

## 10. Plano

| Fase | O que | Estado |
| --- | --- | --- |
| 1 | Diagnóstico | este documento |
| 2 | Design system | `DESIGN-SYSTEM.md` |
| 3 | Piloto: capítulo 1 (geografia e Mar Morto) em PDF e web | em execução nesta rodada |
| 4 | Validação do piloto e **sua aprovação** | `VALIDACAO-PILOTO.md` |
| 5 | Produção integral, capítulo a capítulo, depois de fechar a pesquisa | aguarda a fase 4 |
| 6 | Integração comercial | aguarda a fase 4 e as decisões de `comercial/PROPOSTA-LOJA.md` |
| 7 | Auditoria final | depois da 6 |
