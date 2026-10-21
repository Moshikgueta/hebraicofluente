# Produtos digitais (guias em PDF)

A coleção **Guias Hebraico Fluente**, linha "Para viajar a Israel". Primeiro título: **Hebraico de Sobrevivência em Israel**. Tudo aqui é separado da plataforma: nada em `app/`, `worker/` ou `data/` lê esta pasta, e nada nesta pasta muda o curso.

**Estado (21/10/2026):** conteúdo e PDF em primeira versão completa, hebraico **aguardando a revisão do dono**, áudio **não gravado**, **nada à venda**. A integração com a loja (fases 5 e 6 do briefing) está proposta abaixo e não foi feita, por um motivo que o CLAUDE.md manda levantar antes: ver "Antes de vender".

## Gerar de novo

```sh
cd produtos
npm run conferir      # só a conferência do conteúdo (rápido)
npm run pdf           # conferência + PDF celular + PDF A4 + manifesto de áudio + REVISAO.md
npm run pdf:previa    # o mesmo, mais um PNG de cada página em saida/previa-*/
```

Precisa do Chromium que já vem na máquina (`HF_CHROMIUM`, ou o do Playwright em `/opt/pw-browsers`; nunca `playwright install`), de `pdffonts`/`pdfinfo`/`pdftoppm` (poppler) e do Playwright, local ou global. As fontes saem de `assets/fonts/`, as mesmas do site.

Saída em `sobrevivencia-israel/saida/`, que **não vai para o git** (`.gitignore`): o repositório é público, e o PDF é o produto pago.

## Onde mora o quê

```
produtos/
  colecao.json                     a coleção: identidade e lista de títulos (os futuros como "planejado")
  package.json                     os três comandos acima
  _motor/                          o gerador, igual para todo guia da coleção
    dados.mjs                      carrega um produto (produto.json + conteúdo + textos)
    conferir.mjs                   a conferência: 100 itens, campos, hebraico, travessão, NFC
    montar.mjs                     conteúdo -> HTML (componentes editoriais)
    paginar.js                     roda no navegador: distribui os blocos nas páginas
    gerar.mjs                      orquestra: conferir, montar, Chromium, PDF, pdffonts, derivados
    derivados.mjs                  audio/manifesto.json e REVISAO.md
    figuras.mjs                    ilustrações de abertura e figuras que ensinam (SVG próprio)
    estilo/guia.css                o design editorial (formatos celular e A4)
  sobrevivencia-israel/
    produto.json                   metadados: título, estado, revisão, áudio, formatos, preço sugerido
    conteudo/vocabulario.json      1. conteúdo linguístico: os 100 itens
    conteudo/dialogos.json            os 5 diálogos
    conteudo/atividades.json          os 6 desafios e o gabarito
    textos/guia.json               2. textos editoriais: capa, introdução, aberturas, quadros
    audio/README.md, manifesto.json 5. áudio: o que gravar e como ligar
    REVISAO.md                     o documento de revisão para o dono (gerado)
    saida/                         7. PDF final e 8. prévias (fora do git)
```

Templates (3) e recursos visuais (4) estão em `_motor/`: os componentes em `montar.mjs`, o estilo em `estilo/guia.css`. A arte da capa, as ilustrações de abertura, as figuras (o dia, a semana, o café hafúch, as direções, o dinheiro, atá/at) e as placas são desenho próprio em SVG/CSS; não há foto de terceiros no guia. Uma figura entra no texto como um quadro: `{ "tipo": "figura", "nome": "dia", "apos": "<id>" }` em `textos/guia.json`.

## Como o gerador garante a qualidade

- **Nada se diagrama à mão.** O HTML sai como uma fila de blocos; o paginador, no navegador e com as fontes carregadas, enche cada página e abre outra quando o próximo bloco não cabe. Um cartão, um quadro ou uma fala nunca se partem; um título desce junto com o bloco seguinte. Trocar uma tradução e rodar `npm run pdf` rediagrama o guia inteiro, renumera o índice e o sumário.
- **A geração falha** (código de saída 1) se: a conferência acusar erro; uma fonte não carregar; um bloco não couber numa página inteira; sobrar página vazia; um link interno não tiver destino; o PDF embutir uma fonte que não é nossa (sinal de glifo fora das nossas fontes) ou deixar alguma sem embutir.
- **Avisa** páginas com mais de 45% livre, para o olho decidir.
- O PDF sai marcado (tagged) e com marcadores de navegação; sumário, índice das 100 expressões, gabarito e "Expressões praticadas" dos diálogos são links internos.
- Enquanto `produto.json` > `revisao` não estiver todo `aprovado`, toda página traz "Rascunho · hebraico em revisão" e a capa traz a faixa RASCUNHO.

## Os 100 itens: critério de contagem

Um item é uma palavra ou expressão fixa com `id` próprio em `conteudo/vocabulario.json`. As formas de gênero são **variantes** do mesmo item e não contam à parte; exemplos, falas de diálogo, a tabela das dezenas e as palavras dos quadros culturais também não. A conferência recusa um número diferente de 100, `id` repetido e o mesmo hebraico (com nikud) em dois itens.

Cada item tem: `id`, `categoria` (o capítulo), `he` (como se escreve em Israel, sem nikud), `nikud`, `tr`, `pt`, `contexto`, `variantes`, `exemplo`, `nota`, `audio` (referência do arquivo) e `revisao` (`rascunho` ou `aprovado`).

A transliteração segue a convenção do curso (`data/translit.json`, `pt-BR-practical-v1`), explicada ao leitor no capítulo 1. O nikud segue a convenção do curso de alfabetização (daguesh só em בּ כּ פּ); a troca pela norma completa está em REVISAO.md como decisão do dono.

## Áudio

Ver `sobrevivencia-israel/audio/README.md`. Em resumo: 196 faixas listadas no manifesto, nenhuma gravada; o PDF não promete áudio nem traz QR. O QR é por **capítulo** (uma página de áudio por seção, não 100 códigos) e só é gerado quando `audio.base` tiver uma URL verificada. O painel `/admin/gravar` da plataforma é o candidato natural para gravar: hoje ele trabalha com o catálogo do curso (`data/audio.json`, ids por hash do hebraico), e precisaria aceitar uma segunda lista, a deste manifesto.

## Auditoria da plataforma (fase 1) e a integração proposta (fases 5 e 6)

O que existe hoje, com o que o guia pode reaproveitar:

| Peça | Hoje | Para o guia |
| --- | --- | --- |
| Catálogo | `data/courses.json`; `isSellable` exige `engine` (`worker/src/lib/catalog.js:25`) e o acesso dura `accessMonths`. Não há "tipo de produto". | Um catálogo próprio de guias (gerado de `produtos/*/produto.json`), sem mexer na regra dos cursos. |
| Checkout | `POST /api/pay/create` lê `courseSlug`, preço só do servidor (`priceCents`); `/checkout/[slug]` gera só cursos jogáveis. | Reaproveitar a mesma rota com um ramo para guia (preço do catálogo de guias, sem parcelamento). |
| Confirmação | Um só caminho concede acesso: `applyPayment` (`worker/src/api/pay.js:816`), alimentado por webhook, `verify` e varredura. | Mesmo caminho; guia concede `entitlements` com `expires_at` NULL (acesso sem prazo). O estorno já trata NULL apagando a linha (`refundOrder`, `db.js:609`). |
| Acesso | Portão por sessão + `hasEntitlement` (`gate.js:123`). Arquivos protegidos servidos pelo Worker (áudio do D1 ou do ASSETS). | `GET /api/guias/<slug>/baixar`: sessão + direito, PDF de um bucket R2 **privado** (binding novo), `private, no-store`, `Content-Disposition: attachment`. Nunca uma URL pública permanente. |
| Pagamento | Mercado Pago (PIX e cartão) ou PIX direto, resolvido a cada publicação. | Sem mudança de regra para os outros produtos. |

Nada disso foi implementado. Pede tocar `pay.js` (o ramo do guia em `create` e em `applyPayment`), o schema (nenhuma tabela nova é necessária; `orders.course_slug` passaria a guardar também o slug do guia), o `wrangler.toml` (o binding R2) e o app (página de venda e checkout do guia).

## Antes de vender

1. **Enquadramento (regra do CLAUDE.md, "serviço educacional, não produto digital").** O CLAUDE.md lista "venda avulsa de outros produtos digitais (e-book, apostila, pacote de áudio)" como atividade independente, que **tem de ser apontada ao dono antes de ser feita**. Um guia em PDF vendido à parte é exatamente isso. Pode pedir outro CNAE além do 8593-7/00, outro tratamento na nota fiscal, e mudança no artigo 1 dos Termos ("acesso a um curso"), na Política de Reembolso (desistência de conteúdo baixado) e na Privacidade. Decisão do dono, com o contador e o advogado. Alternativa que não cria atividade nova: oferecer o guia como material de apoio, junto do curso, sem venda avulsa.
2. **Revisão do hebraico** (`REVISAO.md`): 100 itens, 5 diálogos, quadros e as decisões listadas. Regra do CLAUDE.md: hebraico escrito pelo Claude só vai ao ar com aprovação do dono.
3. **Fatos a conferir** (também em `REVISAO.md`): transporte no shabat, gorjeta, números de emergência e afins.
4. **Áudio**: gravar, publicar as páginas, ligar `audio.base`. Até lá, a página de venda não pode anunciar áudio como disponível.
5. **Entrega**: implementar e testar a integração acima (compra de teste, estorno, acesso negado sem pagamento, link sem sessão).
6. `produto.json` > `venda.ativa` só vira `true` depois de tudo isso, por decisão do dono.

## Um guia novo na coleção

1. Copiar a pasta `sobrevivencia-israel/` com outro slug e trocar `produto.json`.
2. Escrever `conteudo/` e `textos/`. Os componentes (cartão, quadros, diálogo, desafios, gabarito, índice) já existem; um guia sem vocabulário usa só `secoes`, `quadros` e `galeria` nos capítulos.
3. Se o guia não tiver 100 itens, mudar `totalItens` em `produto.json` (a conferência cobra o número declarado).
4. Acrescentar a linha em `colecao.json` e o script em `package.json`.
5. `node _motor/gerar.mjs <slug> --previa` e olhar todas as páginas.

As regras de `conferir.mjs` específicas deste guia (5 diálogos, os seis tipos de desafio) estão marcados no código; um guia de outra natureza ajusta essas duas regras.
