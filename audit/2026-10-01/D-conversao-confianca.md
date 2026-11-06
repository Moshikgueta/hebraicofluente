# D · Landing, copy, conversão, confiança e cliente oculto (01/10/2026)

Base: main @ 6d6302d, site local http://127.0.0.1:8787 (wrangler dev, build atual). Somente leitura.
Scripts no scratchpad: `audit2/D-shots.mjs` (10 rotas públicas em 390 e 1280, texto renderizado),
`D-seg.mjs` (capa em fatias), `D-retrato.mjs` (retrato, preço, barra fixa, favicon, OG),
`D-aluno.mjs` (checkout como visitante, sessão do aluno). Capturas e textos em `audit2/capturas-D/`
(`*-390-top.png`, `*-1280-top.png`, `*-full.png`, `capa-390-s00..s09.png`, `capa-1280-s00..s08.png`,
`capa-professor-*.png`, `capa-preco-*.png`, `capa-barra-*.png`, `checkout-*.png`,
`checkout-visitante-390.png`, `aluno_*`, e o `innerText` de cada página em `*.txt`).
Todas as capturas citadas foram abertas e olhadas.

Observação de método: o hero tem teste A/B (lib/ab.ts). A versão A ("Ler e escrever hebraico, do
zero." com três selos) e a B ("Quer viajar para Israel? Ler as letras da Bíblia no original?")
apareceram nas capturas; a avaliação vale para as duas.

---

## 1. Achados

ID: CONV-001 | Prioridade: P1 | Confiança: CONFIRMADO
Local: app/src/components/landing/Fecho.tsx:338-449 (Preco) e :452-474 (Faq da capa); app/src/app/cursos/[slug]/CourseClient.tsx:162 ("E se não for para mim?") e caixas de preço
Problema: o direito de desistir em 7 dias com 100% de volta (o maior redutor de risco que o site tem
para quem não conhece o criador) não aparece em nenhum lugar da capa nem da página do curso. Só
aparece no checkout ("Se você desistir"), em /suporte e dentro de um acordeão fechado em /faq.
Evidência: `grep -i "7 dias|sete dias|garantia|reembols"` no innerText das 10 páginas: a capa só tem
"Sequência 7 dias" (o mockup do hero); /cursos/alfabetizacao, /metodo, /sobre não têm nada; a FAQ da
capa tem 8 perguntas e nenhuma é "E se eu não gostar?", "Como pago?" ou "O que não está incluído?".
Na página do curso, o bloco cujo título é exatamente a objeção ("E se não for para mim?") responde
com prazo de estudo, não com a desistência. data/empresa.json já tem `garantiaDias: 7`.
Por que importa: tráfego frio de anúncio decide na caixa de preço. Sem a frase de risco zero ao
lado do botão, a única informação sobre risco é "R$ 147" e um e-mail Gmail.
Impacto no cliente: hesitação e abandono justo no ponto de decisão; quem compraria "para testar"
não sabe que pode.
Correção sugerida: uma linha fixa na caixa de preço da capa, na do curso (as duas) e na BarraFixa
se couber: "7 dias para desistir e receber 100% de volta, sem justificar", lida de
`empresa.politicas.arrependimentoDias`. Na página do curso, responder "E se não for para mim?" com
essa frase primeiro. Na FAQ da capa, trocar uma pergunta fraca ("Posso estudar no meu ritmo?", já
coberta por "Quanto tempo leva?") por "E se eu não gostar?". Não chamar de "garantia" estendida nem
inventar prazo maior: é o direito do CDC e basta dizê-lo bem.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONV-002 | Prioridade: P1 | Confiança: PRECISA VERIFICAÇÃO MANUAL (o código está CONFIRMADO; a caixa de entrada não)
Local: worker/src/lib/mail.js:55-63 (sendMail sem `reply_to`), :303-331 ("responda esta mensagem", "ou responda este e-mail"); wrangler.toml:103 `EMAIL_FROM = "Hebraico Fluente <contato@hebraicofluente.com.br>"`
Problema: todo e-mail transacional sai de contato@hebraicofluente.com.br sem Reply-To, e o e-mail
de acesso liberado (o comprovante da compra) diz "Para desistir ... responda este e-mail" e
"Qualquer dúvida, responda esta mensagem". O canal de atendimento declarado no site é o Gmail.
Nada no repositório mostra que contato@ recebe mensagens (Resend só envia; Email Routing/MX não
aparecem em nenhum documento: `grep -i "email routing|MX"` só acha "não testado" no G-infra).
Por que importa: se contato@ não tem caixa, um pedido de desistência feito do jeito que o próprio
comprovante ensina volta com erro ou some. É o pior lugar para perder uma mensagem (prazo legal de
7 dias) e o cliente tem prova escrita de que pediu.
Impacto no cliente: "respondi o e-mail e ninguém me atendeu" vira reclamação no Reclame Aqui ou
chargeback.
Correção sugerida: conferir no painel da Cloudflare se existe Email Routing de contato@ para o
Gmail. Em qualquer caso, acrescentar `reply_to: empresa.contato.emailSuporte` no corpo enviado à
Resend (uma linha em sendMail). Teste manual: responder um e-mail real de "esqueci a senha".
Complexidade: Mínima | Claude corrige sozinho?: Sim (o reply_to); a verificação do domínio é do dono

ID: CONV-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: data/empresa.json `contato.*` (rodapé de todas as páginas, /suporte, /faq:275, /sobre, e-mails)
Problema: o único e-mail público é `languageswithmoshik@gmail.com`: Gmail pessoal e com outra marca
("Languages with Moshik") num site que se chama Hebraico Fluente e já tem domínio próprio que envia
e-mail.
Evidência: rodapé (capa-390-s08.png), /suporte "E-MAIL DE ATENDIMENTO languageswithmoshik@gmail.com".
Por que importa: para quem não conhece o criador, Gmail com nome diferente da marca é o sinal mais
forte de "projeto pessoal" do site inteiro, e fica ao lado de CNPJ e endereço, que dizem o
contrário.
Impacto no cliente: dúvida sobre se há empresa por trás; menor confiança para pagar.
Correção sugerida: depois de resolver CONV-002 (caixa em contato@ ou suporte@, encaminhada ao
Gmail), trocar os três campos de `contato` em data/empresa.json. Nenhuma tela precisa mudar.
Complexidade: Mínima (no código) | Claude corrige sozinho?: Revisar antes (depende do roteamento existir)

ID: CONV-004 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/sobre/page.tsx:120-126 ("O que é adaptação minha")
Problema: o cartão diz que "A sequência em que as letras entram ... foi organizada" por Moshik, e o
cartão ao lado (e a capa) diz "A ordem em que as letras entram vem do método dele [Damián]". As
duas frases estão lado a lado em /sobre. A decisão do dono de 01/10 (CLAUDE.md, "Crédito ao Damián")
é que a ordem NÃO é adaptação.
Evidência: `_sobre_.txt` linhas "O que é adaptação minha / A sequência em que as letras entram ..." e
logo depois "A ordem em que as letras entram vem do método dele."
Por que importa: é exatamente o ponto de crédito ao autor do livro, sensível juridicamente (D-legal)
e de reputação; um leitor atento vê a contradição na página que existe para gerar confiança.
Impacto no cliente: impressão de texto montado sem revisão; risco de reclamação do autor.
Correção sugerida: tirar "A sequência em que as letras entram" do cartão de adaptação (fica: o ritmo
da transliteração, os tipos de exercício, as explicações, a cursiva). Acrescentar ao check que
protege `METODO_ORIGINAL` uma busca por "sequência em que as letras" fora de lib/credito.ts.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-005 | Prioridade: P2 | Confiança: ALTA CONFIANÇA
Local: app/src/components/landing/Fecho.tsx:41-46 (RESUMO: "Formação CELTA e Letras"); Trajetoria.tsx:15 (nota interna: "Letras - Inglês (UNINTER, em curso)")
Problema: a capa diz "Formação CELTA e Letras", que um brasileiro lê como graduação concluída. A
própria regra interna registra que Letras está em curso; /sobre diz corretamente "estudos em Letras".
Por que importa: credencial é o que sustenta a autoridade de um criador desconhecido; uma credencial
exagerada, se percebida, derruba as outras (e é publicidade enganosa em tese).
Impacto no cliente: baixo hoje, alto se alguém conferir no LinkedIn.
Correção sugerida: "CELTA · Letras em andamento" ou "Formação CELTA" sozinho na capa.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (o dono confirma o estado do curso)

ID: CONV-006 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/biblia/page.tsx:108
Problema: "Todas as letras deste versículo são ensinadas até a lição 20 das 22." O `after` é a
posição da LETRA (Bet é a 20ª), não a lição, e o curso tem 27 lições. A lição real é a 14 (Bet,
módulo 5; modules.json). O número aparece na página mais visitada pelo público religioso.
Evidência: `_biblia_.txt`; listagem de modules.json (lição 14 = ["bet"]); todas as outras páginas
dizem 27 lições.
Por que importa: é o mesmo tipo de erro numérico que o projeto já trata como risco de Procon
(numeros.mjs), e aqui ele subpromete e contradiz "27 lições" ao mesmo tempo.
Impacto no cliente: confusão ("são 22 ou 27 lições?") justo no argumento "fica legível antes de o
curso acabar".
Correção sugerida: "até a letra 20 das 22 (lição 14 das 27)", com a lição calculada do mesmo
jeito que o `after`; incluir /biblia no numeros.mjs.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONV-007 | Prioridade: P2 | Confiança: CONFIRMADO (texto) / PRECISA VERIFICAÇÃO MANUAL (autorização)
Local: app/src/lib/testimonials.ts:32-48; Fecho.tsx:289 ("Quem já está lendo.")
Problema: (a) um depoimento só, sob título coletivo "Quem já está lendo."; (b) a citação elogia
"áudio, texto, imagens", e as 47 imagens de vocabulário seguem `null` (data/imagens-vocabulario.json),
logo a frase descreve algo que o curso não tem; (c) o comentário diz "O texto é o da pessoa, sem
edição", mas uma frase foi cortada no meio sem reticências; (d) a autorização de uso de nome e
cidade não está registrada em lugar verificável (só o comentário "enviado ... para a landing");
(e) sem foto, sem sobrenome, sem data: um visitante cético não tem como distinguir de um depoimento
inventado. A etiqueta "Lê e escreve em hebraico" é dada pelo dono, não pela aluna.
Por que importa: prova social fraca é melhor que nenhuma, mas uma prova com detalhe falso
(imagens) é pior que nenhuma.
Impacto no cliente: quem já viu muitas landings lê o cartão como enfeite; quem compra e não acha
imagens se sente enganado.
Correção sugerida: título singular ("O que diz uma aluna") até haver 3 ou mais; pedir à Natália
autorização escrita (e-mail guardado) e, se ela concordar, trocar "imagens" por reticências
"[...]" ou confirmar a que se referia; marcar o corte com "[...]". Usar o fluxo /depoimento já
pronto para colher depoimentos de alunos da plataforma antes de 31/10.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (texto de terceiro)

ID: CONV-008 | Prioridade: P2 | Confiança: CONFIRMADO
Local: data/courses.json `price.preLancamentoAte: "2026-10-31"`; app/src/lib/catalog.ts:166-180 (só formata a data)
Problema: nada no código, no validate ou no CI compara a data com hoje (`grep preLancamentoAte` em
scripts/, tools/, worker/src, .github: zero resultados). Em 01/11 o site continua dizendo "Preço de
pré-lançamento até 31/10/2026. Depois, R$ 297" e cobrando R$ 147, até alguém editar o JSON e publicar.
Por que importa: a âncora de R$ 297 só é legítima se for praticada na data dita (o próprio
catalog.ts cita CDC art. 37). Uma data vencida na caixa de preço é a prova pública de que a
urgência era de enfeite, e é o que um concorrente ou o Procon fotografam.
Impacto no cliente: perde a confiança na urgência e no resto das promessas.
Correção sugerida: uma verificação em scripts/validate.js (ou numeros.mjs) que falha o deploy se
`preLancamentoAte < hoje` com `listBrl` ainda preenchido, e um alerta no cron (alertas.js) a 3 dias da
data. Decisão comercial do dono: subir para 297 em 01/11 de fato.
Complexidade: Pequena | Claude corrige sozinho?: Sim (a trava); a virada de preço é do dono

ID: CONV-009 | Prioridade: P2 | Confiança: ALTA CONFIANÇA
Local: app/src/app/HomeClient.tsx (primaryLabel do Hero) + lib/cta.ts:72-74 (href `/checkout/alfabetizacao`)
Problema: o botão principal da primeira dobra diz "Comece do zero e leia suas primeiras palavras em
hebraico", que soa como começar uma aula, e leva direto para "Passo 1 de 2: Primeiro, sua conta"
com o preço ao lado (checkout-visitante-390.png). A promessa do rótulo não é o que acontece.
Por que importa: para tráfego frio, o salto de "vou ler" para "crie conta e pague" no primeiro
clique gera retorno imediato; o A/B só mede a mensagem, não esse atrito.
Impacto no cliente: sensação de isca; volta para a capa ou fecha.
Correção sugerida: rótulo que diga o que vem: "Começar o curso · R$ 147" ou "Quero começar (ver
preço)"; manter "Fazer um teste grátis" ao lado como está. Não exige redesenho.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (interfere no teste A/B)

ID: CONV-010 | Prioridade: P3 | Confiança: CONFIRMADO
Local: components/landing/copy.ts:96-110 (PASSOS, "Seis passos"); app/metodo/page.tsx:38 ("Cinco regras") e :127 ("Dez minutos, cinco etapas"); abas da lição (Conhecer, Palavras, Escrever, Praticar, Fixação)
Problema: a mesma lição é descrita de três jeitos com nomes diferentes (capa: Reconheça, Ouça,
Associe, Pratique, Leia, Revise; /metodo: Conheça, Escute, Leia, Escreva, Prove; dentro do produto:
cinco abas com outros nomes). Os seis passos da capa omitem a escrita, que é um dos diferenciais
vendidos (cursiva).
Por que importa: "método" com três versões parece texto gerado, não processo; o comprador não sabe
qual é o real.
Correção sugerida: uma única lista, com os nomes das abas do produto, usada na capa e em /metodo.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONV-011 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/PublicShell.tsx:235 ("do alfabeto à conversa") e coluna CURSOS (A1, A2, B1); Fecho.tsx:472-473 (FAQ "Você entra na trilha: Hebraico A1 é o próximo nível"); Fecho.tsx:362 ("Curso 1 de uma trilha")
Problema: resto do COM-008. /cursos foi corrigido, mas o rodapé de todas as páginas promete
"conversa" e lista três cursos que não existem como se fossem oferta; a FAQ da capa responde "o que
acontece depois" com um curso sem data.
Correção sugerida: rodapé "Hebraico para brasileiros, começando pelo alfabeto"; A1/A2/B1 com "(em
breve)"; FAQ: "O A1 está em produção, sem data; você pode pedir aviso em Sua conta".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-012 | Prioridade: P3 | Confiança: CONFIRMADO
Local: data/courses.json outcomesPt[4] ("placas, rótulos e cardápios"); módulo 4 "as quatro letras de placa e cardápio"; Secoes.tsx (Curriculo, "placa ou num cardápio")
Problema: continua o COM-011: real-world.json não tem nenhuma cena de cardápio (a palavra só aparece
na nota interna). Três páginas prometem.
Correção sugerida: criar 1-2 cenas de cardápio ou trocar por "etiquetas".
Complexidade: Pequena | Claude corrige sozinho?: Sim (texto) / Revisar antes (cena nova)

ID: CONV-013 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/faq/page.tsx:275 ("Costumamos responder no mesmo dia útil") vs rodapé e /suporte ("em até 2 dias úteis")
Problema: duas promessas de prazo de atendimento.
Correção sugerida: usar `empresa.atendimento.prazoRespostaUteis` também em /faq.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-014 | Prioridade: P3 | Confiança: CONFIRMADO
Local: vários (exemplos abaixo)
Problema: texto que fala do próprio texto ou da página, com cara de IA, e pequenas
inconsistências de português:
· CourseClient.tsx:95 "Escrito como coisa que se faz, não como tema que se estuda - é assim que dá para conferir se aconteceu."
· /biblia "A resposta honesta tem duas metades ... Elas estão logo abaixo, do mesmo tamanho, antes de qualquer botão."
· capa "Você está no lugar certo." (Hero.tsx:191) e "O curso que resolve o problema que trava todo mundo" (courses.json summaryPt).
· "R$ 132,30 no PIX (10% off)" (CourseClient.tsx:336): anglicismo; o checkout já diz "10% de desconto".
· "nikud" na vitrine e "niqqud" na Aula 0.
· "Módulo 1 · lição 1 - letra Álef, som (mudo)" no painel.
Por que importa: individualmente pouco; juntos dão o tom de texto gerado que o público adulto
percebe.
Correção sugerida: cortar as frases metalinguísticas (sem substituir), padronizar "nikud", "10% de desconto".
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: CONV-015 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/PublicShell.tsx:171
Problema: no desktop o botão do cabeçalho mostra "Começar   agora" com um vão visível (o `gap` do
LinkButton soma ao `&nbsp;`). Aparece em todas as páginas (_-1280-top.png, checkout-1280-top.png).
Correção sugerida: tirar o `&nbsp;` ou o gap desse span.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-016 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/checkout/[slug]/obrigado/ObrigadoClient.tsx:132
Problema: "Acontece com alguns cartões e com boleto" numa loja que não oferece boleto.
Correção sugerida: "Acontece com alguns cartões".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-017 | Prioridade: P3 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: app/src/app/layout.tsx / app/src/app/icon.svg
Problema: só existe `icon.svg`; não há apple-touch-icon nem PNG. Atalho na tela inicial do iPhone e
alguns agregadores mostram ícone genérico.
Correção sugerida: `apple-icon.png` 180×180 (convenção do Next) a partir do mesmo SVG.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: CONV-018 | Prioridade: P3 | Confiança: PRECISA VERIFICAÇÃO MANUAL
Local: worker/src/lib/mercadopago.js:269 (title "Alfabetização em Hebraico - Hebraico Fluente"), :295 (statement_descriptor "HEBRAICOFLUENTE")
Problema: o item e a fatura estão certos; o nome do VENDEDOR que a página da Mercado Pago mostra vem
da conta (pessoa física ou "Mhg Treinamentos"?), e não dá para ver daqui. Se aparecer o nome
pessoal, o cliente pode estranhar no último passo.
Correção sugerida: abrir um pagamento real de teste e conferir; ajustar o nome fantasia na conta MP.
Complexidade: Mínima | Claude corrige sozinho?: Não

ID: CONV-019 | Prioridade: P3 | Confiança: CONFIRMADO
Local: /sobre e Professor (Fecho.tsx:48-116)
Problema: as credenciais (Escola Israelita de Curitiba, New School em Tel Aviv, Universidad Isaac
Abarbanel, CELTA) não têm nenhum link verificável (LinkedIn, Instagram, vídeo). Um criador
desconhecido com credenciais só declaradas pede um caminho para conferir.
Correção sugerida: um link para o LinkedIn ou um perfil público do professor em /sobre; um vídeo
curto dele falando (opcional, só se ele quiser).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (o dono escolhe o link)

ID: CONV-020 | Prioridade: P3 | Confiança: CONFIRMADO
Local: /meu-hebraico (aluno_meu-hebraico_390.png)
Problema: no primeiro acesso o botão principal é "Começar a lição" (lição 1) e a Aula 0, chamada
"Antes da primeira letra", fica como cartão secundário logo abaixo. A ordem que o produto recomenda
e a ordem que o botão manda são opostas.
Correção sugerida: enquanto a Aula 0 não foi aberta, o botão principal leva a ela (ou o cartão da
Aula 0 vem antes do cartão do curso).
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (decisão pedagógica)

ID: CONV-021 | Prioridade: P3 | Confiança: CONFIRMADO
Local: Hero.tsx (mockup) + BotaoAcessibilidade (390 px)
Problema: no celular o botão flutuante de acessibilidade cobre o selo "Sequência 7 dias" e o "72%"
do mockup do hero, a primeira imagem do produto que o visitante vê (capa-390-s00.png, _-390-top.png).
Correção sugerida: afastar o selo do canto direito abaixo de 640 px.
Complexidade: Mínima | Claude corrige sozinho?: Sim

---

## 2. A capa encurtada (19 para 12 seções): ficou faltando algo?

O corte foi bom para o comprimento (14.500 px no celular, preço a cerca de 11.500 px) e a ordem
Hero → Promessa → teste grátis → Ouvir e falar → Decisões → Método → Currículo → Professor →
Depoimento → Preço → FAQ → CTA conta uma história coerente. O que saiu e fazia falta:
1. **Redução de risco perto do preço** (CONV-001). Não estava nas seções cortadas, mas o corte tirou
   a última chance de alguém dizê-lo; hoje a capa inteira não fala em desistência/reembolso.
2. **"O que não está incluído"**: a FAQ da capa não tem; está só em /faq e no checkout.
3. **A ressalva "cursos à parte"** da Jornada: sumiu e restou o rodapé dizendo "do alfabeto à
   conversa" (CONV-011).
4. **O que o aluno recebe além das lições**: Aula 0, jogos, exame final, certificado, vocabulário
   não aparecem na caixa de preço (a lista é genérica: "Exercícios interativos", "Revisões liberadas
   automaticamente"). Não pede seção nova, só itens concretos na lista de "inclui".
Não faz falta: AulaAmostra (o teste grátis do Álef faz melhor), Recursos, Transformação.
Repetição que ficou: "Três decisões" e "Um método simples ... Seis passos" são adjacentes e dizem
quase a mesma coisa (CONV-010); a frase "letras por utilidade, não por ordem alfabética" aparece na
capa, no curso e em /metodo.

---

## 3. Avaliação por tema (curta, só o que não virou achado)

- **Primeira impressão (5 s)**: limpo, profissional, hebraico de verdade na tela, preço não
  escondido. Entende-se "curso de alfabetização em hebraico". Não parece golpe.
- **Headline**: A ("Ler e escrever hebraico, do zero.") é mais clara; B (perguntas) é mais
  emocional e ocupa a dobra inteira no celular. Ambas honestas. Com o volume de pré-lançamento o A/B
  dificilmente terá significância até 31/10; vale decidir por clareza.
- **Oferta e o que se recebe**: clara no checkout ("Condições desta compra" é exemplar), genérica na
  capa (ver item 4 acima).
- **Público**: bem definido em /cursos/alfabetizacao ("Para quem é"); a capa fala com viajante,
  leitor da Bíblia e curioso ao mesmo tempo, o que funciona por causa da ressalva honesta de /biblia.
- **Diferenciação**: real e demonstrável (uma letra por vez, nada de letra não ensinada, cursiva com
  correção, áudio do professor, correção de fala). O teste grátis prova isso sem cadastro: é o melhor
  ativo de conversão do site.
- **Preço**: R$ 147 à vista, 12× com juros da MP, PIX R$ 132,30, "Depois, R$ 297" com data. Sem traço
  no 297 (correto: nunca foi praticado). Convincente enquanto a data for respeitada (CONV-008).
- **Urgência/escassez**: só a data de fim do pré-lançamento; sem contador, sem "vagas". Legítimo.
- **Alegações conferidas**: "27 lições" ✓ (modules.json); "22 letras" ✓; "voz do professor
  israelense" ✓ (manifesto de áudio cheio; COM-003 resolvido); "lê palavras reais na primeira semana"
  ✓ (lição 1 já tem אִמָּא, lição 3 lê מַיִם); "certificado" ✓ e com ressalva; "cardápio" ✗ (CONV-012);
  "Letras" ✗ exagerado (CONV-005); "imagens" no depoimento ✗ (CONV-007); "lição 20 das 22" ✗ (CONV-006).
- **Identidade da empresa**: CNPJ, razão social e endereço completos no rodapé e em /suporte: forte.
  Gmail com outra marca: fraco (CONV-003).
- **Retrato**: foto real, sorridente, ao ar livre em Curitiba; carrega (lazy) e transmite pessoa
  real. É bom. A foto do hero é decorativa (IA, sem pessoas), adequada.
- **OG/WhatsApp**: og.jpg diz "27 lições · 22 letras" (COM-001 resolvido). Título das páginas e URLs
  em português limpo (/cursos/alfabetizacao, /checkout/alfabetizacao). Favicon SVG próprio (ver CONV-017).
- **Segurança de pagamento**: Mercado Pago nomeado, "Pagamento único, sem renovação", desistência no
  checkout, e-mail-comprovante com termos versionados. Faltam selos de "pagamento processado pela
  Mercado Pago" ao lado do botão da capa, o que é menor.
- **Gramática/PT-BR**: correta e natural no geral; tom adulto, sem exagero; muito hífen-com-espaço
  no lugar de travessão (estilo da casa, não erro).

---

## 4. Perguntas explícitas

**Se eu não soubesse nada sobre o criador, confiaria o bastante para pagar?**
Sim, para R$ 132-147, mas com hesitação evitável. O que me convence: o teste grátis funciona sem
cadastro, a página tem CNPJ e endereço, o checkout explica tudo, há foto real do professor e o tom
não força. O que me segura: não vejo "posso desistir em 7 dias" em lugar nenhum antes do checkout,
o contato é um Gmail com outro nome, e há um único depoimento sem sobrenome. Eu só descobriria a
desistência no checkout, e um comprador mais cauteloso não chega lá.

**Algo faz parecer projeto de hobby em vez de produto premium?**
Três coisas: o Gmail "languageswithmoshik" (CONV-003), a prova social de uma pessoa só sob um título
no plural (CONV-007) e as contradições de texto que um leitor atento acha (ordem das letras em
/sobre, "lição 20 das 22", "mesmo dia útil" vs "2 dias úteis", três versões do método). O visual,
o produto e o checkout parecem premium.

**5 maiores problemas de conversão**
1. Desistência de 7 dias invisível na capa e na página do curso (CONV-001).
2. CTA principal promete leitura e abre cadastro + pagamento (CONV-009).
3. Prova social fraca: um depoimento, com detalhe que o produto não tem (CONV-007).
4. Caixa de preço com lista genérica; não mostra Aula 0, exame, certificado, jogos, áudio do professor (seção 2, item 4).
5. Método descrito de três jeitos e repetição entre "Três decisões" e "Seis passos" (CONV-010).

**5 maiores problemas de confiança**
1. "Responda este e-mail para desistir" sem Reply-To, com caixa de contato@ não comprovada (CONV-002).
2. Gmail pessoal de outra marca como canal oficial (CONV-003).
3. Contradição sobre o crédito ao método em /sobre (CONV-004).
4. Data de pré-lançamento sem trava: em 01/11 a urgência vira mentira pública (CONV-008).
5. Credencial "Letras" exagerada e nenhuma credencial verificável (CONV-005, CONV-019).

---

## 5. Cliente oculto (cheguei por um anúncio no Instagram, nunca ouvi falar do Moshik)

1. **Impressão em 5 s**: "Curso de ler hebraico, bonito, parece sério." No celular vejo o título, três
   motivos (Israel, Bíblia, entender o alfabeto), um botão grande e um "teste grátis". Um mockup de
   app com ש e "SH ✓". O botão de acessibilidade tapa um pedaço do mockup.
2. **O que acho que é**: um curso online, no navegador, que ensina as 22 letras e as vogais com
   exercícios e áudio, para eu conseguir ler (não falar). Fica claro em /biblia que ler não é entender.
3. **Para quem é**: brasileiro adulto do zero; quem vai viajar, quem lê a Bíblia, quem tem família
   israelense. Eu me reconheço.
4. **Confio no criador?** Parcialmente. Foto real, israelense, ensinou em Curitiba, cargos em Tel
   Aviv e Buenos Aires. Mas não acho link nenhum para conferir, o e-mail é Gmail com outro nome, e
   o método "parte do livro de outra pessoa", o que é honesto mas me faz pensar "é um livro em
   formato de app?".
5. **Perguntas sem resposta antes do checkout**: posso pedir o dinheiro de volta? (só acho em /faq
   fechada ou no checkout); quanto fica a parcela? (só na MP, aceitável); funciona no iPhone e o
   microfone funciona no Safari?; quantos alunos já fizeram?; o A1 sai quando?; quem é a Natália, ela
   usou a plataforma ou teve aula com ele?
6. **Objeções**: "R$ 147 por algo que talvez eu largue"; "12 meses e depois perco?"; "e se eu não
   conseguir pronunciar?"; "já tentei app grátis (Duolingo) e não deu". A capa responde bem a última
   (uma letra por vez, sem transliteração) e mal à primeira (falta risco zero).
7. **Atritos**: botão principal me joga para criar conta sem eu ter decidido; a capa é longa no
   celular mas aceitável; a barra fixa com preço ajuda; o checkout tem 2 passos claros e PIX
   pré-selecionado com desconto.
8. **Confiança para comprar**: 6,5/10 na capa, 8/10 depois de ler o quadro "Condições desta compra"
   no checkout. O problema é que esse quadro só aparece depois do cadastro.
9. **Clareza pós-compra** (lido no código): a tela diz "Pronto. O curso é seu. Acesso liberado por
   12 meses. A primeira lição leva dez minutos" com botão "Começar agora" → /meu-hebraico;
   "em análise" e "falhou" têm textos claros ("Nada foi cobrado"). O e-mail "Seu acesso está
   liberado" traz link, valor, data de fim do acesso, número do pedido, como desistir e os termos
   versionados: muito bom, exceto o "responda este e-mail" (CONV-002). /perfil mostra "Acesso até
   30 de setembro de 2027" e o botão de desistir.
10. **Primeira sessão** (conta aluno-ux, 390 px): /meu-hebraico abre com "Bom dia, Marina 👋",
    sequência de 1 dia, cartão escuro "Curso em andamento · Módulo 1 · lição 1 - letra Álef, som
    (mudo) · 0% · Começar a lição", e abaixo "Antes da primeira letra · Como o hebraico funciona ·
    Ler agora" (CONV-020: qual faço primeiro?). A Aula 0 (/inicio) é um índice de 14 partes que abrem
    por clique, texto claro e didático, sem pressa. A lição do Álef abre com a letra enorme, "Ouvir a
    letra" e 0,7×, a meta da aula ("Você vai conseguir reconhecer, pronunciar, ler e escrever א"),
    explicação de por que o Álef é mudo e um box "Erro comum" bem pensado. Barra inferior com 7 itens
    (Hoje, Meu curso, Revisão, Praticar, Progresso, Palavras, Aula 0) é cheia mas legível. A marca
    d'água vertical "Licenciado para al…@example.invalid" na lateral é discreta. Sensação: produto
    sério, cuidado, que entrega o que a capa prometeu.

### Razões para hesitar (específicas deste site)
- Não vejo em nenhum lugar da capa que posso desistir em 7 dias.
- O contato é languageswithmoshik@gmail.com, não um e-mail da marca.
- Um único depoimento, de uma pessoa que parece ter sido aluna presencial, citando "imagens" que o curso não tem.
- O botão "Comece do zero e leia suas primeiras palavras" me pede conta e cartão.
- Em /sobre o texto diz duas coisas diferentes sobre quem definiu a ordem das letras; em /biblia, "lição 20 das 22" quando o curso tem 27.
- Nenhum link para conferir as credenciais do professor.

### Razões para comprar com confiança (específicas deste site)
- Testei o Álef de graça, sem cadastro, do mesmo jeito que é dentro do curso, e ouvi a voz do professor.
- CNPJ, razão social e endereço completos no rodapé; Termos, Privacidade e Reembolso publicados.
- Preço à vista, sem mensalidade, sem renovação automática, prazo de 12 meses dito em todo lugar.
- A página /biblia diz com clareza o que o curso NÃO faz (entender o texto), o que me faz acreditar no resto.
- O checkout lista o que não vem junto (aula ao vivo, correção por professor) antes de pagar.
- Crédito explícito ao autor do método original: ninguém inventou "método revolucionário".
- O e-mail de compra é um comprovante completo, com o botão de desistir na própria conta.

---

## 6. Estado dos itens da auditoria de 28/09 (H-com e parte comercial do F-ux)

| item | estado hoje | evidência |
|---|---|---|
| COM-001 og.jpg "21 lições" | RESOLVIDO | og.jpg lido: "27 lições · 22 letras" |
| COM-002 "letra de forma e cursiva" | RESOLVIDO | courses.json: "em cursiva ... e reconhecer a forma impressa" |
| COM-003 FAQ diz que não há áudio | RESOLVIDO | faq/page.tsx condicionado a TEM_AUDIO; texto publicado: "gravado pelo professor, um israelense" |
| COM-004 questão "real da Lição 3" | RESOLVIDO (e AulaAmostra saiu da capa) | Fecho.tsx:173 usa נ מ ת ה |
| COM-005 três estimativas de tempo | RESOLVIDO | tempoDoCursoPt() igual em capa, curso e /faq |
| COM-006 sequência "não zera" | RESOLVIDO (texto corrigido; Recursos saiu da capa) | Fecho.tsx:130 |
| COM-007 o que não está incluído | RESOLVIDO em /faq e checkout; AUSENTE na capa | ver seção 2 |
| COM-008 trilha de 4 cursos / "conversa" | PARCIAL | /cursos corrigido; rodapé e FAQ da capa continuam (CONV-011) |
| COM-009 depoimento único | CONTINUA | CONV-007 |
| COM-010 hero e Bíblia | OK | ressalva em /biblia e na FAQ da capa |
| COM-011 cardápio | CONTINUA | CONV-012 |
| COM-012 gabarito/transcrição do exame | RESOLVIDO no texto | Decisões: "corrige cada questão ... mostra quais partes pedem revisão" |
| COM-013 dificuldade nas lições | RESOLVIDO | copy.ts: "Nos jogos, a dificuldade sobe" |
| COM-014 certificado título vs ressalva | PARCIAL | frase nova "Emitido pela plataforma. Não é um certificado oficial"; ainda 13-14,5 px |
| LEGAL-014 riscado sem data | RESOLVIDO | sem traço; "até 31/10/2026. Depois, R$ 297" em capa, curso, checkout, /faq; ver CONV-008 |
| UX-001 `{{בּ}}` na página do curso | RESOLVIDO | innerText de /cursos/alfabetizacao sem `{{` |
| UX-009 "Em breve" claro demais | não medido aqui (área F) | - |
| Precisa: FAQ "Como eu pago?" juros MP | OK | /faq: "No parcelamento há juros, cobrados pela Mercado Pago" |

---

## 7. Nota da área: 76/100

O produto, o checkout e a honestidade das promessas estão acima da média de infoproduto brasileiro;
o teste grátis é excelente. O que impede nota maior e deve ser feito antes de investir em anúncio:
CONV-001 (desistência visível perto do preço), CONV-002 (Reply-To/caixa de contato@), CONV-003
(e-mail da marca), CONV-004/005/006 (três erros factuais baratos de corrigir) e CONV-008 (trava da
data de pré-lançamento, que vence em 30 dias). Nenhum deles pede redesenho; todos juntos são menos de
um dia de trabalho.

## 8. Os 5 maiores problemas da área
1. CONV-001 · P1 · A desistência de 7 dias com 100% de volta não aparece na capa nem na página do curso.
2. CONV-002 · P1 · Os e-mails mandam "responder para desistir", mas não têm Reply-To, e não há prova de que contato@ recebe.
3. CONV-003 · P2 · O canal oficial é um Gmail pessoal com outra marca (languageswithmoshik), mesmo havendo domínio próprio.
4. CONV-008 · P2 · A data do pré-lançamento (31/10) não tem trava; a âncora de R$ 297 vira propaganda enganosa se a data passar sem a virada.
5. CONV-004/005/006 · P2 · Erros factuais em páginas de confiança: /sobre se contradiz sobre a ordem das letras, a capa diz "Formação Letras" com o curso em andamento, e /biblia diz "lição 20 das 22".

Contagem: P0 0 · P1 2 · P2 7 · P3 12.
