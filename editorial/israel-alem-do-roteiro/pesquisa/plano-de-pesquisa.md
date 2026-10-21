# Plano de pesquisa e de verificação

Estado em 21/10/2026, depois da primeira rodada.

## O limite que manda no plano

Este ambiente faz pesquisa só por **busca na web**: a busca devolve título,
endereço e um resumo da página. A leitura direta de páginas e o download de
arquivos estão bloqueados pela rede. Duas consequências:

1. **Cada rodada tem uma cota de cerca de 200 buscas**, dividida entre todos
   os agentes que pesquisam ao mesmo tempo. A primeira rodada pôs nove agentes
   em paralelo, e a cota acabou com cerca de 12 a 37 buscas por capítulo
   (o capítulo 9 ficou com zero). Uma rodada nova começa a cada mensagem nova
   do dono na sessão.
2. **Nenhuma passagem foi lida no texto integral.** Tudo o que está
   VERIFICADO foi conferido contra o trecho que a busca devolveu. A leitura no
   texto integral é tarefa da revisão humana (ver `auditoria/` de cada
   capítulo, seção "Fontes adicionais necessárias").

## Rodadas seguintes (no máximo 3 agentes por rodada, cerca de 60 buscas cada)

| Rodada | Capítulos | Prioridade | Por quê |
| --- | --- | --- | --- |
| 2 | 9 (curiosidades), 8 (prática), 7 (hebraico) | alta | 9 está vazio; 8 é o que mais envelhece e tem metade dos temas como "consulte X"; 7 não tem nenhuma fonte e nenhuma etimologia |
| 3 | 5 (semana, Shabat, feriados, kibutz), 6 (kashrut, pães, mercados, gorjeta), 1 (regiões, Neguev, Arava, vale do Jordão, nível oficial do Mar Morto) | alta | o coração dos capítulos 5 e 6 ficou de fora; o infográfico da semana e o mapa de regiões dependem disso |
| 4 | 3 (bairros, portas, Monte das Oliveiras, cidade dividida), 4 (Nazaré, Cafarnaum, Mar Morto, Acre, Tel Aviv), 2 (lacunas apontadas em `auditoria/cap02.md`) | média | completa os destinos e libera o esquema de Jerusalém |
| 5 | todos | média | trocar por fonte de nível A a D as afirmações que hoje se apoiam em uma única fonte de nível E (o validador lista em `auditoria/validacao.md`), e reconsultar a orientação de segurança do Itamaraty |

Cada rodada termina com: `node tools/validar.mjs` sem erro, auditoria do
capítulo atualizada, `node tools/build.mjs` e inspeção das páginas.

## O que nenhuma rodada de busca resolve

- **Revisão humana especializada** (historiador ou pesquisador da região),
  com leitura no texto integral das obras citadas. O livro não pode dizer que
  foi revisado antes disso.
- **Aprovação do hebraico pelo autor** (`auditoria/hebraico.md`).
- **Aprovação das caixas "O olhar de um israelense"**, que só o autor pode
  dar, porque falam com a voz dele.
- **Fotografias** com licença comercial (lista em
  `ativos/registro-de-ativos.json`, campo `fotografias_necessarias`).
- **Decisões comerciais e jurídicas** (`comercial/PROPOSTA-LOJA.md`).

## Temas controversos e como o livro os trata

| Tema | Onde | Como o texto apresenta |
| --- | --- | --- |
| Monarquia unida de Davi e Salomão | cap. 2 | debate entre posições (ver `pesquisa/temas-controversos-cap02.md`) |
| 1948: Guerra de Independência / Nakba, causas do êxodo palestino | cap. 2 | os dois nomes, o deslocamento como fato, as causas como debate historiográfico |
| Status de Jerusalém Oriental e das Colinas de Golã | caps. 1, 2, 3 e mapas | o que cada parte afirma, as resoluções da ONU, as exceções (com data) |
| Monte do Templo / Haram al-Sharif e o status quo | cap. 3 | os dois nomes, o status quo segundo a declaração oficial citada |
| Datação do Domo da Rocha e do túnel de Ezequias | cap. 3 | como debate, com as posições |
| Massada: suicídio coletivo e o uso como símbolo nacional | cap. 4 | Josefo, Cohen, Magness, Ben-Yehuda (falta uma voz crítica a Ben-Yehuda) |
| Lei do Estado-Nação (2018) e o status do árabe | cap. 5 | como debate sobre o alcance da mudança |
| "Origem" do hummus e do falafel | cap. 6 | como disputa, sem dono |
| Situação de segurança e recomendação de viagem | cap. 8 | só o que a fonte oficial dizia, com data, sem opinião |
