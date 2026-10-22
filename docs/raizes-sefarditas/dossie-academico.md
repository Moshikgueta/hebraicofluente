# Raízes Sefarditas: dossiê acadêmico

Edição 0 (pré-lançamento), pesquisa de 21/10/2026. Os registros de verdade são
`data/raizes/fontes.json` e `data/raizes/afirmacoes.json`; este documento
explica o método, resume o que foi verificado e diz o que falta.

**Isto é uma auditoria interna feita com ajuda de IA, não uma revisão
acadêmica.** Nenhum especialista leu o conteúdo. Nenhuma passagem foi
conferida no texto integral.

## 1. Método

- Protocolo: o mesmo de Israel Além do Roteiro
  (`hebraicofluente-editorial/israel-alem-do-roteiro/PROTOCOLO.md`): níveis
  A-E, status, forma de acesso.
- O ambiente tem busca na web, que devolve título, endereço e um trecho. Ele
  **não abre** páginas (o proxy recusa a conexão direta: tentado com
  `sourcebooks.web.fordham.edu` e `encyclopedia.com`). Por isso toda fonte
  está como `trecho-de-busca` ou `referencia-confirmada`.
- Wikipedia, blogs, guias turísticos e páginas comemorativas apareceram nas
  buscas e **não** foram usados como prova. Quando só eles sustentavam um
  dado, o dado ficou `NÃO VERIFICADO` ou foi retirado da frase.
- Datas que divergem entre fontes aparecem divergindo no texto (nascimento de
  Maimônides, data de Elvira, da lápide de Tortosa), ou só com a parte em que
  as fontes concordam (o mês da Disputa de Barcelona, o ano de 929).
- Números de mortos e convertidos (1066, 1391) não aparecem: as estimativas
  divergem demais.

## 2. Resumo da matriz (módulo 1)

| Status | Quantas | Vai ao texto? |
| --- | ---: | --- |
| VERIFICADO | 27 | Sim |
| CONTESTADO | 6 | Só como debate (R01-001, 005, 007, 014, 027, 028) |
| NÃO VERIFICADO | 2 | Não: R01-009 (IV Concílio de Toledo, 633) e R01-025 (data de Santa María la Blanca) |

Fontes: 46 registradas, por nível: A (literatura acadêmica) 16, B
(instituições, obras de referência e o dado geográfico) 29, D (oficial) 1.
Nenhuma de nível C: os documentos de época foram lidos por meio de estudos e
catálogos, não diretamente. Duas fontes de nível A estão só como referência
confirmada (FR-002, FR-031).

## 3. Debates que o texto apresenta como debates

1. **Onde ficava a Sefarad bíblica** (R01-001). Sardes, Saparda, regiões
   persas; a leitura "Hispânia" vem da tradução aramaica.
2. **"Convivência"** (R01-028, R01-029). Américo Castro (1948); leituras como
   harmonia, como acomodação, ou com o conflito como parte da coexistência
   (Nirenberg, 1996; Wolf, 2009). A etapa Refletir não escolhe pelo aluno.
3. **O alcance das conversões forçadas almóadas** (R01-014; Fierro).
4. **As causas de 1391** (R01-027): o pregador ou as facções urbanas.
5. **Datações**: Elvira (R01-005), lápide de Tortosa (R01-007).

## 4. O que a revisão humana deve abrir no texto integral

Prioridade alta (sustentam frase central do módulo):

- Os cânones de Elvira numa edição crítica (numeração 48/49, texto de 16, 50, 78).
- Carpenter (1986), Partidas 7.24, lei 1: a citação "como en cativerio para
  siempre" (R01-021) foi tirada de artigo, não da edição.
- Vernet Pons (2014) para R01-001.
- Fierro, para R01-014.
- Encyclopaedia Judaica (verbetes Sepharad, Granada, Joseph ha-Nagid,
  Almohads): foram lidos em reproduções (Jewish Virtual Library,
  Encyclopedia.com).

Fontes adicionais que melhorariam o módulo:

- Maria José Ferro Tavares, *Os Judeus em Portugal no século XV* (1982), para
  R01-030 e R01-031 (hoje sustentadas por obra de referência geral e por um
  artigo de repositório).
- Um estudo de história da arquitetura sobre Santa María la Blanca, para
  tirar R01-025 do "não verificado".
- A edição dos cânones do IV Concílio de Toledo (R01-009).
- Uma obra de referência acadêmica sobre judeu-árabe, para poder dizer que o
  Guia foi escrito em árabe com letras hebraicas (hoje o texto diz só "em árabe").

## 5. Imagens e direitos

Nenhuma fotografia, manuscrito ou documento digitalizado foi reproduzido. O
único recurso visual é o mapa, desenhado a partir de Natural Earth
(domínio público), só com terra e mar. Os documentos da atividade de
investigação são descritos e parafraseados, com link para o acervo. Antes de
usar qualquer imagem de acervo (Cambridge, Torre do Tombo, museus), ler as
condições de reprodução de cada instituição e registrar em `fontes.json`
(campo `reproducao`).

## 6. Módulos 2 a 10

Só o plano existe (`data/raizes/curso.json`, `plano-pedagogico.md`). Nenhuma
afirmação deles foi pesquisada. Temas que pedem cuidado especial já
identificados:

- Módulo 3 e 4: não confundir cristão-novo com criptojudeu, nem acusação
  inquisitorial com prova de prática religiosa.
- Módulo 6: Kahal Zur Israel e o Recife neerlandês; fontes do Arquivo
  Nacional e da Biblioteca Nacional; não reduzir a presença judaica no Brasil
  a uma trajetória só.
- Módulo 7: nenhuma lista de sobrenomes como diagnóstico.
- Módulo 8: judeu-espanhol não é a língua de todos os sefarditas; áudio só
  com gravação de falante, verificada.
- Módulo 9: genética, com os limites ditos por fonte científica.
- Nacionalidade (Portugal e Espanha): o percurso não trata. Se tratar, com a
  legislação vigente, datada, e com aviso.
