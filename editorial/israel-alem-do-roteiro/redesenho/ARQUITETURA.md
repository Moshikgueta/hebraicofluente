# Arquitetura: uma base, dois produtos

## 1. O fluxo

```
manuscrito/capNN.md  ─┐
afirmacoes/*.json    ─┼─▶ tools/lib/conteudo.mjs ─▶ capítulo estruturado (JSON)
fontes/*.json        ─┤                                 │
ativos/ (mapas, dados,│                                 ├─▶ tools/revista.mjs ─▶ PDF (digital, A4, amostra)
  fotos, links)      ─┘                                 └─▶ tools/web.mjs ────▶ experiência digital
```

- **Onde se escreve:** só no manuscrito (Markdown com diretivas `:::`) e nos
  registros. Nenhum dos dois produtos tem texto próprio.
- **O que a base estruturada tem**, por capítulo: seções com id estável
  (`cap01-o-mar-morto-um-lago-que-desce`), rubrica, blocos tipados
  (parágrafo, foto, figura, vocabulário, quiz, link, dado...), as afirmações
  e as fontes de cada seção já resolvidas, a data da última consulta
  (`revisado_em`) e o status de verificação (`verificado`, `contestado` ou
  `pendente`, com a lista do que impede). Vocabulário com o id do áudio do
  curso e se a gravação existe.
- **Corrigir um dado:** muda o registro e a frase do manuscrito; os dois
  produtos se refazem com `node tools/revista.mjs` e `node tools/web.mjs`.
  Ninguém copia texto de um lado para o outro.

## 2. Na plataforma (proposta para depois da aprovação)

O protótipo da fase 3 é estático e guarda o estado no aparelho, para poder
ser aprovado sem tocar no site. A integração segue as regras que o
repositório já impõe:

| Peça | Como entra | Regra do repositório respeitada |
| --- | --- | --- |
| Rota | `/livros/israel-alem-do-roteiro/` e `/livros/israel-alem-do-roteiro/<capitulo>/`, no `GATED` do portão | toda rota paga atrás do portão |
| Conteúdo | o JSON compilado vai para o Worker (como os JSON do curso) e sai de `GET /api/livros/israel-alem-do-roteiro/<cap>`, com sessão e direito | conteúdo pago nunca no pacote público; `npm run pacote` e `tests/conteudo.test.ts` ganham o caso |
| Componentes | `app/src/components/livro/` em React, portando `web-app.js` (são as mesmas peças), usando `<He>` e o `AudioButton` existentes | `<He>` é a única porta do hebraico |
| Áudio | os mesmos `/audio/<id>.mp3` do curso, atrás do portão | id = hash do hebraico; gravação humana |
| Estado do leitor | `LearnerState.livros[<slug>]` = `{ lidas, favoritos, respostas, desafios, diario, ultima }` | toda chave nova com regra de fusão em `merge.ts` (lidas e desafios: união; favoritos: último a mudar vence por carimbo; diário: texto mais recente por seção) e teste em `tests/merge.test.ts` |
| Marca anticópia | a mesma marca invisível de `/api/content` nos textos longos | já existe para o curso |

## 3. Comércio (arquitetura preparada, nada ligado)

O pedido mudaria o catálogo e a cobrança, e isso depende das decisões de
`comercial/PROPOSTA-LOJA.md` e da sua autorização. A arquitetura proposta:

- **Produto** passa a ter `tipo` (`curso`, `livro-pdf`, `livro-digital`,
  `pacote`) em `data/courses.json`; um pacote lista o que inclui
  (`inclui: [...]`) e o pedido concede um direito por item.
- **Direito sem prazo** para livro (`expires_at` nulo), com teste de estorno.
- **Licenças para caravanas:** tabela `codigos_acesso` (código com hash, como
  as senhas; produto; quantidade de usos; validade; caravana). Resgatar um
  código concede o direito à conta que resgata, com teto por hora como toda
  rota que escreve.
- **Personalização por caravana:** campo `caravana` no código, que a
  experiência digital pode ler para mostrar o roteiro daquele grupo (fase
  futura).
- **Mercado Pago:** nenhuma mudança. O preço continua saindo só do catálogo.

## 4. Pendências técnicas conhecidas

- O PDF da edição anterior (`tools/build.mjs`) continua gerando o rascunho de
  153 páginas, como pedido ("não substitua o PDF original"). Depois da
  aprovação, `revista.mjs` assume o livro inteiro e `build.mjs` sai.
- Fotos: `tools/baixar-fotos.mjs` baixa e confere a licença pela API do
  Commons; precisa de internet aberta (sua máquina ou uma Action).
- Links e QR: os QR codes são lidos de volta aqui; abrir cada endereço fica
  para `tools/checar-links.mjs` fora daqui.
