# Direção visual das ilustrações do vocabulário

**Hebraico Fluente · 23 de setembro de 2026**

As palavras concretas do curso - mãe, casa, cachorro, água - podem ter uma
ilustração. A estrutura já existe; as imagens ainda não. Este documento diz
como elas devem ser, para que as 47 fiquem parecendo uma coleção e não 47
imagens de lugares diferentes.

## Onde as coisas moram

| o quê | onde |
|---|---|
| a lista das palavras com imagem, e o que cada uma mostra | `data/imagens-vocabulario.json` |
| os arquivos de imagem | `app/public/media/vocabulario/<nome>-<hash>.webp` (via `node tools/imagem-vocabulario.mjs <arquivo> <número>`) |
| quem junta as duas coisas às palavras | `tools/export-content.mjs` (`carregarImagens`) |
| onde elas aparecem hoje | "Meu vocabulário" (`/vocabulario`) |

Cada entrada tem três campos:

- **`image`** - o caminho do arquivo, por exemplo `/media/vocabulario/casa-1a2b3c4d.webp`.
  Fica `null` até o arquivo existir. O exportador **recusa** um caminho para
  arquivo que não existe, então uma imagem quebrada nunca chega ao aluno.
- **`imageAlt`** - o texto para leitor de tela. Descreve a **cena**, não a
  palavra ("Uma casa simples com porta, janelas e telhado"), porque a palavra
  já está escrita ao lado da imagem.
- **`imagePrompt`** - só a cena, em inglês. O estilo comum fica no campo
  `estilo` do mesmo arquivo e é colocado na frente de todo prompt pelo
  exportador; o prompt completo chega pronto ao conteúdo exportado.

Para pôr uma imagem no ar: gerar, salvar em `app/public/vocabulario/`,
preencher `image` com o caminho, rodar `npm run export-content`.

## O estilo

**Ilustração editorial plana, para adultos.** A referência é a das páginas de
um bom livro didático moderno, não a de um app infantil.

- **Formas geométricas simples**, cantos levemente arredondados, contorno fino
  ou nenhum.
- **Um assunto só**, centralizado, com bastante espaço vazio em volta. Uma
  casa, e não uma rua com uma casa.
- **Fundo off-white liso** (`#FBF9F5`, o mesmo papel do site).
- **A paleta do produto**, e só ela:

  | papel | cor |
  |---|---|
  | estrutura, sombra | petróleo `#0E3B43` |
  | destaque principal | teal `#1F8A7D` |
  | preenchimento claro | teal claro `#E4F1EE` |
  | superfícies neutras | areia `#F3F0E9` |
  | um único acento quente | dourado `#B8862F` |
  | detalhes pequenos | quase-preto `#1B211F` |

- **Pessoas**: adultas quando a palavra é sobre adultos (mãe, pai, mulher,
  amigo), sem rostos de desenho animado, sem olhos enormes. Traços mínimos.
- **Sem**: texto, letras (nenhuma letra hebraica ou latina dentro da imagem -
  ela competiria com a palavra que o aluno está lendo), logos, gradientes,
  fotorrealismo, sombras dramáticas.
- **Formato**: quadrado, 1024×1024, exportado em WebP a ~80% de qualidade. A
  tela mostra a 72px; o tamanho maior fica para usos futuros.

## Por que essas regras

- **Um assunto e fundo liso**: a imagem aparece pequena, ao lado da palavra.
  Uma cena cheia vira mancha a 72px.
- **Sem letras dentro**: o exercício é ler a palavra hebraica. Qualquer texto
  na imagem disputa a atenção e, se for hebraico, pode mostrar letras que o
  aluno ainda não aprendeu.
- **Paleta fechada**: é o que faz 47 imagens geradas separadamente parecerem
  da mesma mão.

## Estado

**As 47 imagens estão no curso (01/10/2026).** Geradas pelo dono no
ChatGPT (são dele, para uso comercial), em montagens 3x3 recortadas e
completadas até o quadrado. Para trocar uma: gere a nova e rode
`node tools/imagem-vocabulario.mjs <arquivo> <número>`; o arquivo antigo sai
e o nome novo leva outro hash. O `imageAlt` descreve a imagem que está no
ar, não o prompt: ao trocar a imagem, confira o texto.

Palavras abstratas (ontem, também, verdade, obrigado) ficam **sem** imagem de
propósito: uma ilustração de "verdade" é uma adivinhação, e uma imagem que
precisa ser explicada não ajuda a lembrar a palavra.

**102 imagens (02/10/2026).** Mais 55 palavras concretas ganharam imagem
(montagens A a G). As descrições para leitor de tela ajustadas às imagens
foram aprovadas pelo dono em 02/10/2026.
