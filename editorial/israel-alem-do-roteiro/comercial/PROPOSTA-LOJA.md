# Israel Além do Roteiro na loja: proposta, não implementação

Estado em 21/10/2026: **nada disto foi ligado.** Nenhuma linha do site, do
Worker, do banco ou do `data/courses.json` mudou por causa do e-book. Este
documento é o projeto da integração e a lista do que precisa ser decidido
antes dela, porque três das decisões são do dono e uma delas, pela regra do
próprio repositório, tem de ser apontada **antes** de qualquer código.

## 1. O que precisa ser decidido antes (bloqueios)

### 1.1 Enquadramento: vender e-book é atividade nova

O `CLAUDE.md`, seção "Enquadramento: serviço educacional, não produto
digital" (29/09/2026), diz que a empresa vende **acesso a um curso** (CNAE
8593-7/00) e lista, como exemplo do que seria atividade independente, a
"venda avulsa de outros produtos digitais (e-book, apostila, pacote de
áudio)". A regra: "uma mudança que crie atividade independente tem de ser
apontada ao dono ANTES de ser feita, com o motivo".

Este é esse aviso. O motivo: um PDF vendido por R$ 49, sem ser parte de um
curso, é um produto digital avulso, e não acesso ao curso de alfabetização.
Perguntas para o contador, antes de vender:

- O CNAE atual cobre a venda de livro digital, ou é preciso acrescentar um
  (por exemplo, de edição de livros ou de comércio varejista de livros)?
- Que nota sai: de serviço (ISS) ou de venda? Há uma tese de imunidade
  tributária para livros, que o STF já estendeu a livros eletrônicos;
  confirmar com o contador se e como ela se aplica a este PDF.
- O Simples Nacional da ME continua cabendo com a nova receita?

Também mudam textos jurídicos, que o `check-legal` e a regra do repositório
amarram ao modo de venda:

- **Termos de Uso, art. 1** ("cursos online", "acesso a um curso"): precisa
  dizer que a loja também oferece livros digitais, e em que condições de
  licença (uso pessoal, sem redistribuição).
- **Política de Reembolso**: o direito de arrependimento de 7 dias (CDC, art.
  49) vale também para conteúdo digital comprado pela internet. Com PDF, quem
  desiste fica com o arquivo. A decisão de como tratar isso (por exemplo,
  liberar o download imediatamente e aceitar o risco, ou só depois de um
  aceite expresso) é do dono e do advogado; o site não pode prometer menos do
  que a lei.
- **Privacidade**: se a entrega carimbar o PDF com o e-mail de quem comprou
  (seção 3), a política precisa dizer isso, como já diz da marca d'água do
  curso.
- Subir `politicas.atualizadoEm` em `data/empresa.json` quando esses textos
  mudarem.

### 1.2 Viagem com alerta oficial de "não viajar"

Na consulta de 21/10/2026, a página de alertas consulares do Itamaraty para o
Oriente Médio recomendava **não viajar para Israel** (registro C08 no
`afirmacoes/cap08.json`, com a data que a página exibia). Um livro vendido
como preparação para a viagem, nesse momento, tem dois riscos: a promessa de
"aproveitar melhor a viagem" pode soar como incentivo a ignorar o alerta, e
o comprador pode alegar oferta enganosa se a viagem for inviável.

O livro já trata disso no capítulo 8 (aviso com a data e a remissão às fontes
oficiais) e a introdução diz que ele vale também para quem não tem viagem
marcada. Para a página de venda, recomendo:

- posicionar o livro como **história e cultura de Israel**, para ler antes,
  durante ou sem viagem, e não como guia para viajar agora;
- dizer, na própria página, que as informações práticas foram consultadas em
  tal data e que a orientação oficial vigente deve ser conferida;
- não usar imagem ou frase de "embarque já".

A decisão de vender agora ou esperar é do dono.

### 1.3 O kit depende de um livro que ainda não existe

"Hebraico Sem Perrengue" não existe no repositório. O kit **Israel Antes de
Embarcar** fica só desenhado (seção 4) e não pode ser vendido até os dois
livros estarem prontos, como o próprio pedido exige.

### 1.4 O livro em si ainda não está pronto para venda

Ver `RELATORIO-FINAL.md`: parte dos capítulos depende de nova rodada de
pesquisa, todo o hebraico depende da aprovação do autor, e a revisão humana
especializada não aconteceu. O gerador recusa a edição final enquanto
`revisao/aprovacoes.json` não registrar essas três coisas.

## 2. Onde o produto entra na arquitetura que já existe

O que o repositório tem hoje e serve ao e-book sem duplicar nada:

| Peça | Onde | Como o e-book usa |
| --- | --- | --- |
| Catálogo e preço | `data/courses.json` + `worker/src/lib/catalog.js` | Uma linha nova. O preço continua saindo só do catálogo, nunca do corpo da requisição. |
| Checkout e Mercado Pago | `worker/src/api/pay.js`, `lib/mercadopago.js`, `/checkout` | O mesmo fluxo de pedido, PIX, cartão, webhook, verificação na volta e varredura. |
| Pedido e direito de acesso | tabelas `orders` e `entitlements` | O pedido grava o `course_slug` do e-book; a confirmação concede o direito como hoje. |
| Desistência e estorno | `POST /api/pay/desistir`, `estornos` | O mesmo caminho, com o texto decidido em 1.1. |
| Portão | `worker/src/gate.js` | A rota de download fica atrás de sessão E direito no banco. |
| Marca por conta | `lib/marca.js`, tabela `marcas` | O mesmo número de cópia pode identificar o PDF entregue. |
| Painel de vendas | `/admin/vendas` | Passa a mostrar o produto do pedido. |

## 3. Desenho proposto

### 3.1 Catálogo

Em `data/courses.json`, uma entrada com um campo novo de tipo, para que o
site e o servidor saibam que não é um curso com lições:

```json
{
  "slug": "israel-alem-do-roteiro",
  "tipo": "ebook",
  "titlePt": "Israel Além do Roteiro",
  "categoriaPt": "História, cultura e viagem",
  "status": "draft",
  "engine": null,
  "formatoPt": "E-book em PDF",
  "price": { "brl": 49, "installments": 1, "pixDiscountPct": 0 },
  "accessMonths": null
}
```

- `status: "draft"` e `engine: null` fazem `isSellable` devolver falso: a
  linha pode existir sem que ninguém consiga comprar. Vender é trocar para
  `available`, decisão do dono.
- `accessMonths: null` = acesso sem prazo. Hoje `grantAccess` calcula
  `expires_at` a partir de meses; o e-book precisa de uma regra própria
  (por exemplo, `expires_at` nulo = permanente), com teste no estilo de
  `tests/pagamento.test.ts`, incluindo estorno.
- As páginas `/cursos` e `/cursos/<slug>` hoje assumem curso; o tipo `ebook`
  pede um componente de página de venda próprio (seção 3.3) ou uma rota
  `/livros/<slug>`.

### 3.2 Entrega segura do PDF

- O PDF **não** vai para `app/public/` nem para nenhum caminho servido pelo
  servidor de ativos: lá ele seria uma URL pública permanente.
- Guardar o PDF num bucket R2 **privado** (como o de backups), enviado pela
  publicação a partir de um segredo do Actions, nunca pelo git.
- Rota `GET /api/livros/<slug>/pdf`: exige sessão, conferida pelo mesmo
  `requireAccount`, e direito no banco; responde com
  `Content-Disposition: attachment`, `Cache-Control: private, no-store`, sai
  por `blindar()`, grava uma linha na trilha (`access_log`, sem e-mail) e tem
  teto por hora por conta e por endereço, como toda rota nova.
- Marca no PDF: carimbar cada download com "Licenciado para an•••@dominio ·
  cópia XXXXXXXX" usa a mesma ideia da marca d'água do curso. **Atenção ao
  limite de 10 ms de CPU do plano gratuito:** carimbar um PDF de 100 páginas
  no Worker passa disso. Alternativas: gerar a cópia carimbada uma vez por
  compra numa Action e guardar no R2 com a chave do pedido, ou entregar o
  arquivo sem carimbo e só com o número de cópia nos metadados. Decidir com o
  dono, sabendo que nenhuma marca impede quem pagou de copiar.

### 3.3 Página de venda

Seções, todas com conteúdo real:

- capa (imagem gerada do próprio PDF);
- descrição curta: "Explore a história, a geografia, a cultura e os lugares
  mais fascinantes de Israel em um guia ilustrado criado especialmente para
  brasileiros.";
- para quem é (texto de `ESTRUTURA.md`) e o que o livro não promete;
- sumário (gerado do `livro.json`);
- amostra gratuita: o PDF de amostra (`saida/...-amostra.pdf`), este sim
  público, e imagens de páginas;
- formato: PDF, número de páginas, tamanho do arquivo, funciona no celular;
- data de atualização das informações práticas e o aviso da seção 1.2;
- preço, condições (pagamento único, sem assinatura), o direito de
  desistência como estiver decidido;
- perguntas frequentes;
- produtos relacionados: o curso de alfabetização.

Fica proibido, como no resto do site: depoimento inventado, contador falso,
urgência artificial, "de R$ X por R$ Y" sem que o preço cheio exista.

### 3.4 O que testar antes de ligar

- `tests/`: compra do e-book concede o direito certo e só esse; estorno
  tira o direito; preço vem do catálogo; download sem sessão é 401; com
  sessão e sem direito, 403; com direito, 200 com o PDF.
- `npm run pacote`: o PDF não aparece no export publicado.
- `npm run check-legal` e `npm run pagamento`: textos coerentes com o novo
  produto.
- Checkout em ambiente de teste da Mercado Pago (token `TEST-` só local; a
  publicação recusa token de teste, de propósito).

## 4. Oferta conjunta (desenho, desligada)

**Israel Antes de Embarcar** = Hebraico Sem Perrengue (R$ 29) + Israel Além do
Roteiro (R$ 49), por R$ 59. Preços de teste, sujeitos a decisão comercial.

- Catálogo: uma linha `tipo: "kit"` com `inclui: ["hebraico-sem-perrengue",
  "israel-alem-do-roteiro"]`; o pedido do kit concede os dois direitos numa
  transação, e o estorno do kit tira os dois.
- O preço "de" do kit (R$ 78) só pode aparecer se os dois livros estiverem à
  venda separados por esses preços: senão é preço de referência fictício.
- Bloqueio: `status: "draft"` até os dois livros estarem completos e
  aprovados.
