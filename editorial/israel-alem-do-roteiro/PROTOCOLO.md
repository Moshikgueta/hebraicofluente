# Protocolo de pesquisa, verificação e escrita

Israel Além do Roteiro. Este documento vale para todo capítulo, toda caixa
editorial, todo mapa e todo número do livro. Quem escreve (pessoa ou agente)
lê isto inteiro antes de começar.

## 1. A regra que sustenta o livro

Toda afirmação factual relevante do manuscrito aponta para um registro em
`afirmacoes/capNN.json`, e todo registro aponta para fontes em
`fontes/capNN.json`. Texto plausível não é informação comprovada; fonte
encontrada não é fonte lida; muitas citações não são rigor.

Proibido, sem exceção: inventar livro, artigo, autor, DOI, ISBN, número de
página, citação, descoberta arqueológica, etimologia ou estatística; atribuir
a um autor uma conclusão que ele não escreveu; dizer que uma fonte foi
consultada quando não foi; apresentar consenso sem evidência.

Se não deu para verificar, a afirmação fica `NÃO VERIFICADO` e sai do texto.
Não há quota de páginas, de curiosidades ou de palavras que justifique o
contrário.

## 2. Como as fontes foram acessadas (a verdade sobre o método)

O ambiente desta edição tem **busca na web**, que devolve título, endereço e
um resumo do conteúdo da página. Ele **não abre** o texto integral das páginas
nem dos livros. Isso define o que cada registro pode afirmar:

| `acesso` | Significa | O que permite |
| --- | --- | --- |
| `trecho-de-busca` | A busca devolveu um trecho ou resumo da página indicada que sustenta a afirmação. | `VERIFICADO`, se a fonte for de nível A a D e o trecho sustentar diretamente. |
| `referencia-confirmada` | A busca confirmou que a obra existe (autor, título, ano, editora), mas não o conteúdo citado. | Só como leitura recomendada ou como apoio de interpretação já sustentada por outra fonte. Nunca sozinha para `VERIFICADO`. |
| `texto-integral` | Alguém abriu o documento inteiro e conferiu a passagem. | Reservado à revisão humana. Nenhum registro desta edição usa. |

Página consultada (`pagina_ou_secao`) só é preenchida se o trecho da busca a
mostrar. Senão, `null`. DOI e ISBN só se aparecerem na busca. Senão, `null`.

A nota metodológica do livro diz isso ao leitor, com estas palavras ou
equivalentes: a pesquisa foi feita em fontes institucionais, acadêmicas e
oficiais acessadas por busca digital; a conferência das passagens no texto
integral faz parte da revisão humana, que é condição para a publicação.

## 3. Hierarquia de fontes

- **A** - literatura acadêmica: artigos revisados por pares, livros de editora
  universitária, monografias reconhecidas, relatórios de escavação publicados.
- **B** - instituições científicas e culturais: Israel Antiquities Authority,
  UNESCO, Israel Museum, universidades, Israel Nature and Parks Authority,
  Academia da Língua Hebraica, museus.
- **C** - fontes primárias: inscrições, documentos, textos antigos (Josefo,
  Bíblia, Mishná), relatos contemporâneos. Sempre lidas criticamente.
- **D** - fontes oficiais contemporâneas: Central Bureau of Statistics (CBS),
  gov.il, Population and Immigration Authority, Itamaraty e consulados,
  Israel Meteorological Service, Banco de Israel, ONU.
- **E** - complementares: jornalismo confiável (Haaretz, Times of Israel,
  Reuters, BBC, AP, Folha), guias institucionais. Servem para descobrir a
  fonte original; sozinhos sustentam no máximo `PARCIALMENTE VERIFICADO`,
  salvo fato jornalístico datado (ex.: "em 2024 o museu reabriu").

Wikipedia, blogs, redes sociais, sites de agência de viagem e de venda de
passeios: **nunca** como comprovação. Se a busca só achou isso, procure a fonte
original que eles citam.

## 4. Status

- `VERIFICADO` - fonte de nível A a D sustenta diretamente a afirmação (ou
  duas fontes de nível E independentes, para fato jornalístico datado).
- `PARCIALMENTE VERIFICADO` - parte tem suporte, parte não. **Não vai ao
  texto assim**: reescreva a frase até caber no que foi verificado, e registre
  a versão reescrita como `VERIFICADO`.
- `CONTESTADO` - há interpretações acadêmicas relevantes divergentes. Vai ao
  texto **só** apresentando o debate, proporcional às evidências, e o registro
  descreve as posições em `interpretacoes_concorrentes`.
- `NÃO VERIFICADO` - sem evidência suficiente. Fica no registro (para a
  próxima edição saber que foi tentado) e **não aparece** no manuscrito.
- `DESATUALIZADO` - precisa de atualização. Não vai ao texto.

Hipótese científica pode entrar, desde que o texto a chame de hipótese.
Nunca vire hipótese em certeza para a narrativa ficar melhor.

## 5. Formato dos registros

### `fontes/capNN.json`

```json
{
  "capitulo": 1,
  "fontes": [
    {
      "id": "F01-001",
      "nivel": "B",
      "tipo": "site-institucional",
      "autor": "UNESCO World Heritage Centre",
      "titulo": "Masada",
      "ano": 2001,
      "editora_ou_periodico": null,
      "doi": null,
      "isbn": null,
      "url": "https://whc.unesco.org/en/list/1040/",
      "data_consulta": "2026-10-21",
      "acesso": "trecho-de-busca",
      "abnt": "UNESCO WORLD HERITAGE CENTRE. Masada. Paris: UNESCO, 2001. Disponível em: https://whc.unesco.org/en/list/1040/. Acesso em: 21 out. 2026."
    }
  ]
}
```

IDs de fonte: `FNN-NNN` (NN = capítulo). A mesma obra pode aparecer em dois
capítulos com IDs diferentes; o gerador da bibliografia junta pela URL ou pelo
par autor+título.

### `afirmacoes/capNN.json`

```json
{
  "capitulo": 1,
  "afirmacoes": [
    {
      "id": "C01-001",
      "secao": "Um país pequeno",
      "afirmacao": "A frase exata (ou a ideia exata) que o manuscrito afirma.",
      "categoria": "geografia",
      "fontes": ["F01-001"],
      "evidencia": "O que o trecho da fonte diz, com as palavras dela quando possível.",
      "pagina_ou_secao": null,
      "acesso": "trecho-de-busca",
      "data_consulta": "2026-10-21",
      "limitacoes": "O que a fonte não cobre, a data do dado, a abrangência.",
      "interpretacoes_concorrentes": null,
      "status": "VERIFICADO",
      "revisar_ate": null
    }
  ]
}
```

Categorias: `geografia`, `clima`, `historia`, `arqueologia`, `religiao`,
`lingua`, `sociedade`, `gastronomia`, `estatistica`, `pratica`, `patrimonio`.

`revisar_ate` (AAAA-MM-DD) é obrigatório em `pratica` e `estatistica`: seis
meses depois da consulta para regras de viagem, doze para estatística. O
validador acusa o vencido.

## 6. Princípios historiográficos (resumo operacional)

1. **Cronologia** conferida: datas, períodos, sequência, causa e efeito, lugar.
   Datas antigas com "c." (cerca de) e a.C./d.C. Use "século X a.C.", e diga
   quando a datação é discutida.
2. **Anacronismo**: não chamar de "israelenses" os antigos israelitas, nem de
   "palestinos" no sentido nacional moderno os habitantes da Palestina romana.
   "Israelitas", "judaítas", "judeus" (a partir do período persa/helenístico,
   conforme o contexto), "habitantes da região".
3. **História e religião**: distinguir narrativa religiosa, tradição, testemunho
   histórico, evidência arqueológica e interpretação acadêmica. O texto bíblico
   não comprova a si mesmo. Use a caixa "História ou tradição?" quando o leitor
   puder confundir.
4. **Arqueologia**: objeto, proveniência, datação, interpretação, limites.
   Exemplo: a Estela de Tel Dan (objeto), achada em Tel Dan em 1993-1994
   (proveniência), século IX a.C. (datação), menção a "casa de Davi"
   (interpretação majoritária), debate sobre a leitura (limite).
5. **História contemporânea**: bibliografia diversa (israelense, palestina,
   internacional), consequências documentadas, sem propaganda. Não criar
   equivalência artificial entre posições com sustentação muito diferente.

## 7. Terminologia dos temas sensíveis

- **Monte do Templo / Haram al-Sharif (Esplanada das Mesquitas)**: na primeira
  menção de cada capítulo, os dois nomes e quem usa cada um.
- **1948**: "Guerra de Independência" (como é chamada em Israel) e "Nakba"
  (catástrofe, como é chamada pelos palestinos), os dois nomes, ditos como
  nomes. O deslocamento de cerca de 700 mil palestinos é fato documentado; as
  causas são debate historiográfico (Morris e outros) e o texto mostra o debate.
- **Territórios**: Cisjordânia ("Judeia e Samaria" é o termo oficial israelense;
  diga isso quando usar), Faixa de Gaza, Jerusalém Oriental, Colinas de Golã.
  Linha de armistício de 1949 = "Linha Verde". Anexações de Jerusalém Oriental
  e do Golã: diga que a maior parte da comunidade internacional não as
  reconhece, com fonte (ONU). Não inventar números de população: use os do CBS
  ou da ONU, datados.
- **Brasil**: o Itamaraty é fonte D para orientação de viagem a brasileiros.

## 8. Cultura sem caricatura

Proibido: "os israelenses sempre...", "todo israelense...", "em Israel
ninguém...". Diga quem, onde, quando, e que varia. Israel tem judeus seculares,
tradicionais, religiosos e ultraortodoxos; árabes muçulmanos, cristãos e
drusos; beduínos; circassianos; imigrantes da ex-URSS, da Etiópia, da França,
da América Latina. Gastronomia: reconhecer influências compartilhadas
(levantina, árabe, judaica de várias diásporas, otomana). Não atribuir a
origem exclusiva de hummus, falafel ou shakshuka a nenhuma nação.

## 9. Hebraico

- **Todo hebraico do livro precisa da aprovação do autor** (regra do
  repositório). O validador lista cada ocorrência em `auditoria/hebraico.md`.
- Hebraico sempre dentro de `<he>...</he>`. Pontuação portuguesa fica FORA da
  marca: `<he>שָׁלוֹם</he>,` e nunca `<he>שָׁלוֹם,</he>`.
- Grafia moderna padrão. Com nikud nas palavras apresentadas como vocabulário
  (caixa "Em hebraico", capítulo 7); sem nikud quando o texto mostra como a
  palavra aparece em placas, e aí diga isso.
- **Transliteração**: o padrão do curso, `pt-BR-practical-v1`
  (`data/translit.json`). Resumo:
  - acento agudo na vogal tônica de toda palavra de 2+ sílabas, como se fala
    hoje em Israel: shalóm, bóker, Yerushaláyim, Tel Avív, falafél;
  - monossílabo sem acento: shuk, yam, tov;
  - `ch` para ח e para כ/ך (R raspado, como o R carioca de "carro"), `sh` para
    ש, `ts` para צ, `tch` para צ׳, `dj` para ג׳, `j` para ז׳;
  - `ss` para S entre vogais (kissé);
  - álef e áyin não ganham letra; `h` de ה se pronuncia, leve; ה final mudo
    não se escreve (Torá, não Toráh);
  - shva pronunciado vira `e`, mudo some.
  Nomes de lugar consagrados em português (Jerusalém, Nazaré, Cafarnaum, Haifa,
  Acre, Jafa, Mar Morto) aparecem em português no texto corrido; a forma
  hebraica e a transliteração aparecem na primeira menção ou na caixa.
- **Etimologia**: nunca confundir etimologia linguística, explicação
  tradicional, interpretação religiosa e associação popular. Etimologia
  debatida é dita debatida. Etimologia sem fonte linguística sai.
- Árabe, quando aparecer, transliterado de forma simples e consistente
  (al-Aqsa, Haram al-Sharif, Qubbat al-Sakhra), sem escrita árabe no PDF desta
  edição (a fonte não está no pipeline).

## 10. Escrita

- Português do Brasil, registro de divulgação: claro, concreto, envolvente,
  frases de tamanho variado. Nada de "Neste capítulo veremos", "é importante
  ressaltar", "rica tapeçaria", "fascinante mosaico", "berço de", "terra de
  contrastes" como clichê, listas de três adjetivos.
- **Nada de travessão.** Nem o travessão (U+2014) nem a meia-risca (U+2013).
  Use vírgula, dois-pontos, parênteses ou ponto. Hífen `-` só onde o português
  pede hífen ou em intervalo numérico (1948-1949). Esta regra vale para todo
  arquivo desta pasta, inclusive JSON.
- Só o que o autor informou sobre ele mesmo: Moshik Gueta, israelense, falante
  nativo de hebraico, professor de línguas, criador do Hebraico Fluente. Nada
  de anos de experiência, cargos, viagens, alunos, histórias pessoais.
- Caixa "O olhar de um israelense": escreva como explicação cultural ou
  linguística geral, nunca como lembrança pessoal. Toda caixa desse tipo nasce
  `pendente` e só sai no livro depois de o autor aprovar.
- Sem urgência, sem promessa de domínio do hebraico ou de conhecimento
  completo. Sem conselho de segurança ou imigração que não venha de fonte
  oficial atual, datada e com o aviso "confira antes de viajar".

## 11. Formato do manuscrito (`manuscrito/NN-slug.md`)

```markdown
---
capitulo: 1
titulo: Israel no mapa
subtitulo: Um país pequeno, uma geografia surpreendente
---

Parágrafo de abertura...

## Seção

Texto com afirmação factual.[[C01-001]] Outra frase com duas fontes.[[C01-002,C01-003]]

::: voce-sabia Título curto da caixa
Texto da caixa.[[C01-010]]
:::

::: em-hebraico
- <he>מִדְבָּר</he> | midbár | deserto | O Neguev é "o" deserto do país.
:::

::: figura mapa-regioes
Legenda da figura.
:::
```

- O marcador `[[Cnn-nnn]]` fica DEPOIS da pontuação final da frase que ele
  sustenta. O gerador o tira da leitura e monta as notas de fonte.
- Caixas: `voce-sabia`, `observar`, `em-hebraico`, `historia-ou-tradicao`,
  `olhar-israelense pendente`, `entenda-melhor`, `aviso` (informação prática
  sujeita a mudança, com data de consulta), `linha-do-tempo` (linhas
  `data | evento`), `diario Título` (página de anotação; `linhas: N`),
  `checklist Título` (linhas `- item`), `figura <id-do-ativo>`.
- Caixas aparecem quando acrescentam, não como enfeite obrigatório. Uma a três
  por seção longa é o teto razoável.
- Use só o que o português pede de negrito e itálico.

## 12. Auditoria de cada capítulo (`auditoria/capNN.md`)

Depois de escrever, releia o capítulo como adversário e produza:

1. Afirmações verificadas (contagem por status).
2. Problemas encontrados (datas, anacronismos, generalizações, etimologias
   populares, números sem fonte, contradições com outros capítulos).
3. Correções feitas.
4. Fontes adicionais necessárias (o que a revisão humana deve abrir no texto
   integral).
5. Debates acadêmicos relevantes e como o texto os apresenta.
6. Pendências editoriais (hebraico para aprovar, caixas do autor, fotos).

Uma segunda leitura feita por IA **não é** revisão acadêmica. O relatório diz
"auditoria interna", nunca "revisado", "validado" ou "aprovado".
