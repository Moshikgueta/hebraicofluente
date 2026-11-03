# Diretrizes de conteúdo

## A regra que sustenta o produto

Nenhum fato, data, inscrição, fonte ou dado arqueológico inventado. Destino sem
texto revisado aparece como **"em preparação"**, nunca com um texto de enchimento.

## Fato, tradição, interpretação, dica

Cada parágrafo da página de um destino declara o que é, e a tela mostra o rótulo:

| Tipo | Rótulo na tela | Quando |
| --- | --- | --- |
| `fact` | Fato histórico | documentado por fonte histórica ou arqueologia |
| `tradition` | Tradição | o que um texto religioso, uma tradição ou uma lenda conta (Bíblia, midrash, Evangelhos, mitologia) |
| `interpretation` | Interpretação | leitura de pesquisadores, debate, sentido atribuído |
| `tip` | Para a visita | orientação prática |

Exemplos do que isso evita: "aqui morou Pedro" vira tradição (Evangelhos) mais
interpretação (a identificação se apoia na tradição antiga, sem inscrição); "960
defensores" vira fato **do relato de Josefo**, seguido do debate sobre a exatidão.

Quando há fonte direta, ela vai no bloco (`source`) e nas referências da página.

## Revisão editorial

`placeholder` → `draft` → `in_review` → `approved`.

- Só `approved` entra na caravana de uma agência real.
- A agência de demonstração mostra `in_review`, com o aviso "texto de demonstração
  em revisão editorial".
- Aprovar exige o nome de quem revisou (`reviewed_by`). Editar um texto aprovado
  cria uma revisão nova e o devolve para revisão.
- A revisão de destino religioso deve passar por um guia licenciado ou especialista,
  e o texto deve respeitar as diferentes tradições (judaica, cristã, muçulmana)
  sem tomar partido.

### Estado atual da biblioteca

| Destino | Situação |
| --- | --- |
| Muro Ocidental, Cafarnaum, Jaffa, Massada | texto completo, **em revisão** (escrito para a demonstração) |
| Jerusalém, Cidade Antiga, Monte das Oliveiras, Santo Sepulcro, Belém, Mar da Galileia, Nazaré, Rio Jordão, Mar Morto, Tel Aviv, Cesareia | só identificação (nome, nome em hebraico, região): em preparação |

Os quatro textos completos citam: Flávio Josefo (A Guerra dos Judeus, livros VI e
VII), Midrash Shemot Rabá 2:2, Evangelhos de Mateus e Marcos, Itinerário de Egéria,
Stanislao Loffreda (Recovering Capharnaum), Livros de Jonas, Crônicas, Esdras e Atos,
o Papiro Harris 500, Yigael Yadin (Masada, 1966) e a inscrição de Massada na lista da
UNESCO (2001). Conferir cada citação na revisão.

Belém: só entra no roteiro quando a agência confirmar que a visita é possível nas
condições da viagem.

## Edição na superadministração

Texto simples, uma seção por `## Título`, cada parágrafo começando por `[fato]`,
`[tradição]`, `[interpretação]` ou `[dica]`, fonte opcional no fim:
`{fonte: Josefo, livro VI}`. O formato recusa parágrafo sem tipo.

## Hebraico

- `hebrew`: como aparece nas placas e cardápios, sem nikud. `hebrewPointed`: com nikud.
- Transliteração para brasileiros: acento na sílaba forte; `ch` como o "rr" de
  "carro"; `ts` como em "tsunami".
- Tudo nasce `pending_native_review`. Só expressão **revisada por falante nativo**
  entra numa caravana real. O texto atual foi escrito para a demonstração e precisa
  dessa revisão, inclusive os poucos trechos em hebraico da interface
  (שָׁלוֹם, עִבְרִית, דַּרְכּוֹן, תּוֹדָה e a letra א do selo).
- Números: na contagem e nos preços usa-se a forma feminina (achát, shtáyim, shalósh).

## Áudio

- Gravação de pessoa: `audio_assets.source = 'native_recording'`, com nome de quem
  gravou e licença. O botão diz "Ouvir gravação".
- Sem gravação, se o aparelho tiver voz em hebraico, aparece "Voz sintética do
  aparelho", com esse nome, e o aviso de que ela pode errar. Voz sintética nunca é
  cadastrada como gravação.
- Envio de arquivos depende do armazenamento (R2), ainda não ligado.

## Imagens

Não há fotografias nesta etapa: os bancos de imagem não estavam acessíveis a partir
do ambiente de desenvolvimento, e foto de lugar sem licença conferida não entra.
As ilustrações da plataforma são desenho assumido. Fotos entram por `media_assets`
com `credit`, `license` e `source_url` preenchidos; imagem gerada por IA não deve
ser apresentada como fotografia de um lugar.

## Informações práticas

- Só o que a agência confirmou: contatos oficiais, guia, hotéis, pontos de encontro.
- Nada de regra de entrada no país, fronteira ou segurança copiada de fonte antiga.
- Item que muda leva `is_time_sensitive`: a tela mostra "atualizado em".
- Números de emergência de Israel (polícia 100, Magen David Adom 101, bombeiros 102)
  foram conferidos em fontes públicas em outubro de 2026; a agência deve confirmar
  os contatos de emergência da caravana.
- Avisos urgentes continuam pelos canais oficiais da agência, e a tela diz isso.

## Atividades

- Pergunta com explicação curta da resposta, sempre.
- Tom adulto: nada de infantilizar.
- `key` da pergunta é estável: reescrever o texto não apaga o progresso.
- Atividade só entra aprovada numa caravana real.
