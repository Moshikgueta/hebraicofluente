# Áudios do guia

**Situação:** nenhuma faixa gravada. `produto.json` > `audio.status` está em `em-gravacao`, e por isso o PDF não traz código QR nem promete áudio: a introdução diz que as gravações ainda não fazem parte da edição.

## O que gravar

`manifesto.json`, nesta pasta, é a lista completa. Ele é **gerado** a cada `npm run pdf` (em `produtos/`) a partir do conteúdo, então nunca fica para trás de uma correção no texto. Cada faixa tem:

- `id`: o identificador, que é também o caminho do arquivo (`itens/shalom` vira `audio/itens/shalom.mp3`);
- `he`: o hebraico com nikud, que é o que se lê;
- `tr` e `pt`: a pronúncia escrita e a tradução, para conferir;
- `tipo`: `palavra`, `expressao`, `variante` (forma para mulher ou masculina dos números), `exemplo`, `quadro` (palavras dos quadros, situações reais e "Você vai ouvir"), `dialogo` (o diálogo inteiro, com as duas vozes) e `fala` (cada fala do diálogo, separada);
- `gravado`: vira `true` sozinho quando o arquivo existir.

São 219 faixas: 100 itens, 22 variantes, 16 exemplos, 38 frases e palavras de quadros (inclusive as situações reais e o "Você vai ouvir"), 5 diálogos inteiros e as 38 falas deles. O mínimo para anunciar "áudio de todas as 100 expressões" são as 100 faixas de `itens/` (as de tipo `palavra` e `expressao`).

## Organização

```
audio/
  itens/<id>.mp3                 uma por expressão (100)
  itens/<id>--variante-N.mp3     forma de gênero
  itens/<id>--exemplo.mp3        a frase de exemplo do cartão
  quadros/capNN-<palavra>.mp3    palavras dos quadros
  dialogos/<id>.mp3              diálogo inteiro
  dialogos/<id>-NN.mp3           cada fala
```

O agrupamento por capítulo está em `manifesto.json` > `secoes`: é a lista que cada página de áudio vai mostrar.

## Do arquivo ao QR

1. Gravar. O painel `/admin/gravar` da plataforma já grava pelo celular, corta o silêncio e nivela o volume; ele hoje trabalha com o catálogo do curso, e reaproveitá-lo para este manifesto é o caminho mais curto (ver `produtos/README.md`, "Áudio").
2. Os arquivos **não** vão para esta pasta do git: o repositório é público e o áudio faz parte do produto pago. Eles vão para o mesmo armazenamento protegido do PDF.
3. Publicar as páginas de áudio por capítulo, atrás do mesmo controle de acesso do PDF, e conferir que abrem.
4. Só então `audio.base` recebe a URL verificada e `audio.status` vira `disponivel`. O gerador se recusa a gerar o PDF com `disponivel` sem `base`, e ainda não gera QR: esse passo está marcado no código (`audioRef` em `_motor/montar.mjs`) para ser implementado junto com as páginas.
