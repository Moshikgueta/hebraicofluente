# Editorial: os e-books da coleção Hebraico Fluente

Pipeline para escrever, verificar e diagramar livros digitais. É separado do
curso: nada aqui é lido pelo site, pelo Worker ou pelo build do `app/`, e
nada do curso muda por causa daqui.

Primeiro livro: **Israel Além do Roteiro** (`israel-alem-do-roteiro/`).

## O que mora onde

```
editorial/
  tools/
    build.mjs         manuscrito + registros → HTML paginado → PDF (digital, A4, amostra)
    validar.mjs       cruza manuscrito, afirmações e fontes; extrai o hebraico
    mapas.mjs         mapas a partir da Natural Earth (domínio público)
    infograficos.mjs  infográficos e esquemas, só com dado verificado
    inspecionar.mjs   folhas de contato e medidas de transbordo das páginas
  templates/          livro.css (identidade editorial), capa e faixa de abertura
  <livro>/
    PROTOCOLO.md      regras de pesquisa, verificação, escrita e hebraico
    ESTRUTURA.md      estrutura editorial e o brief de cada capítulo
    livro.json        metadados, ordem dos arquivos, créditos
    manuscrito/       um .md por parte (é o texto do livro)
    fontes/           capNN.json: as fontes de cada capítulo (ABNT)
    afirmacoes/       capNN.json: cada afirmação, sua evidência e seu status
    auditoria/        relatório por capítulo, validacao.md, hebraico.md
    pesquisa/         plano, temas controversos, atualização das informações práticas
    ativos/           registro-de-ativos.json, mapas/, infograficos/, dados/
    revisao/          aprovacoes.json: as aprovações humanas (só gente preenche)
    comercial/        proposta de integração com a loja
    saida/            PDFs e inspeções (fora do git)
```

## Comandos

```sh
cd editorial
npm ci --ignore-scripts                       # dependências fixadas no lockfile
node tools/mapas.mjs israel-alem-do-roteiro
node tools/infograficos.mjs israel-alem-do-roteiro
node tools/validar.mjs israel-alem-do-roteiro # relatório em auditoria/validacao.md
node tools/build.mjs israel-alem-do-roteiro   # digital, A4 e amostra, marcados RASCUNHO
node tools/inspecionar.mjs israel-alem-do-roteiro --por=30
node tools/build.mjs israel-alem-do-roteiro --final   # recusa sem as aprovações
```

O Chromium é o do ambiente (`/opt/pw-browsers/...`, ou `HF_CHROMIUM`); nunca
`playwright install`.

## Como uma informação chega ao livro

1. A pesquisa registra a fonte em `fontes/capNN.json` e a afirmação em
   `afirmacoes/capNN.json`, com a evidência e o status (PROTOCOLO, seção 4).
2. O manuscrito usa a afirmação e marca a frase com `[[CNN-NNN]]`.
3. O validador recusa marca sem registro, marca com status que não pode ir
   ao texto, fonte inexistente, informação prática vencida, travessão,
   pontuação dentro do hebraico e generalização do tipo "todo israelense".
4. O gerador troca a marca por um número discreto que leva à nota de fonte
   do fim do capítulo, e monta a bibliografia com todas as notas.

Mudou um dado? Corrija o registro e a frase; o resto (notas, bibliografia,
sumário, números de página) se refaz no próximo build.

## Rascunho e edição final

Todo build sem `--final` é rascunho: o rodapé diz isso, as caixas que dependem
do autor aparecem tracejadas e as marcas que não podem ir ao texto aparecem
destacadas. O `--final` só sai com `revisao/aprovacoes.json` dizendo que o
hebraico foi aprovado pelo autor, que a revisão humana foi feita e que a
publicação foi autorizada, e com o validador em modo estrito sem erro nem
aviso.

## Próxima edição

- Rodar o validador: ele acusa a informação prática com `revisar_ate`
  vencido. Refaça essas consultas primeiro (capítulo 8 inteiro, estatísticas).
- Cada auditoria por capítulo tem a lista "fontes adicionais necessárias":
  é a fila da pesquisa seguinte.
- Subir `edicao` e a data de `atualizacao` em `livro.json`.

## Regras do repositório que valem aqui

- Nada de travessão nem meia-risca, nem em JSON (`CLAUDE.md`).
- Hebraico escrito com ajuda de IA só vai ao ar com aprovação do dono.
- Nada inventado sobre o dono: só o que ele informou.
- A identificação da empresa vem de `data/empresa.json`, nunca escrita à mão.
- Vender o livro é atividade nova para o enquadramento da empresa: ver
  `israel-alem-do-roteiro/comercial/PROPOSTA-LOJA.md` antes de qualquer código
  de loja.
