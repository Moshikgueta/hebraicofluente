# Fase 2 - Estratégia por canal (23/10/2026)

Escrita sobre as hipóteses do diagnóstico (`01-diagnostico.md`), a pedido do dono, antes de haver
números de venda e de tráfego. Cada canal diz o objetivo, a hipótese **[H]**, o que já é evidência
**[E]**, o primeiro experimento e a métrica que decide se continua. Quando os números chegarem,
cada hipótese é confirmada ou cortada aqui, com data.

Skills usadas: `product-marketing`, `social`, `content-strategy`, `seo-audit`, `programmatic-seo`,
`ai-seo`, `cro`, `signup`, `emails`, `lead-magnets`, `co-marketing`, `influencer-marketing`,
`ads`, `ad-creative`, `ab-testing`, `marketing-psychology`.

## 0. A mensagem central (vale para todos os canais)

**Para quem:** adulto brasileiro que nunca leu hebraico (ou tentou e parou) e tem um motivo
pessoal: viajar a Israel, ler as letras da Bíblia, a família ou as raízes sefarditas. [E: os três
motivos da página de venda; a persona é hipótese até haver pesquisa com compradores.]

**Promessa:** ler hebraico do zero, uma letra por vez, com a voz de um professor israelense e
correção na hora. Ler, não falar fluente (a página `/biblia` já diz o que o curso não faz).

**Prova que já temos:** o teste grátis sem cadastro, a voz do professor, CNPJ e políticas à vista,
7 dias para desistir, preço único sem mensalidade. [E]

**Três ângulos** (um por motivo), que viram as linhas de conteúdo e de anúncio:

| Ângulo | Gancho de exemplo (texto a aprovar) | Para onde leva |
|---|---|---|
| Viagem | "Você vai a Israel. Que tal ler a placa da rua?" | teste grátis |
| Bíblia | "As letras em que a Bíblia foi escrita, uma por vez." | `/biblia`, depois teste grátis |
| Raízes e família | "O sobrenome da sua avó tem uma história. O alfabeto também." | teste grátis; lista do Raízes |

**O que nunca entra** (identidade e regras do projeto): número de alunos, "fluência em 30 dias",
preço riscado sem data, cronômetro, depoimento inventado ou trocado por brinde, fato sobre o dono
que ele não informou, hebraico novo escrito pelo Claude sem a aprovação do dono.

## 1. Instagram orgânico (Reels, carrosséis, stories)

**Objetivo:** levar gente ao teste grátis e à lista de interessados, não só seguidores.
**[H]** o conteúdo que ensina algo pequeno e verificável (ler uma palavra em 30 s) traz quem compra;
conteúdo genérico sobre Israel traz seguidor que não compra.

**Pilares** (skill `social`, proporção a ajustar com os números do perfil):

| Pilar | Peso | Formato principal | Exemplo |
|---|---|---|---|
| Uma letra, uma palavra | 35% | Reels de 20 a 40 s | o professor mostra uma letra e lê uma palavra do curso que só usa letras já mostradas |
| Israel por quem nasceu lá | 25% | Reels e carrossel | placa, cardápio, embalagem: "o que está escrito aqui?" |
| As letras da Bíblia | 15% | carrossel | uma palavra bíblica conhecida (שָׁלוֹם), letra por letra |
| Bastidores e o método | 15% | stories | gravando os áudios, por que uma letra por vez |
| Convite | 10% | stories com figurinha de link | teste grátis, prévia, lista |

**Ritmo de partida (sustentável para uma pessoa):** 3 Reels, 1 carrossel e stories em 4 dias por
semana. Gravação em lote de 2 a 3 horas por semana. Cada Reel vira carrossel e story (repetição
planejada, skill `social`).

**Funil:** bio → `/comece-aqui` (já existe); stories → `/stories`; direct → `/dm`; ManyChat com
palavras-chave novas além de EBOOK (ex.: LER → teste grátis; LISTA → lista de interessados).

**Primeiro experimento (2 semanas):** 6 Reels do pilar "uma letra, uma palavra" contra 6 do pilar
"Israel por quem nasceu lá", com o mesmo convite no fim. Decide quem gera mais cliques em
`/stories` e `/dm` e mais "visto → pronto" no teste grátis. Não decide por curtida.

**Aprovação do dono:** todo roteiro e toda arte antes de publicar; todo hebraico citado vem de
palavra do curso.

## 2. SEO e busca por IA

**Objetivo:** tráfego que não depende de postar todo dia. **[H]** há busca recorrente por
"alfabeto hebraico", "letras hebraicas", "como ler hebraico", "nikud", "Shalom em hebraico", nome de
cada letra. Volume a confirmar no Search Console e numa ferramenta de palavra-chave.

**[E]** hoje há 19 páginas no sitemap, nenhuma de referência sobre o alfabeto. A regra do projeto
proíbe pôr o conteúdo pago no pacote público, então as páginas novas são **referência**, não aula.

**Proposta (skills `programmatic-seo` e `ai-seo`):**
1. `/alfabeto-hebraico`: a tabela das 22 letras, nome, som em português, forma final, com o teste
   grátis no meio. Página pilar.
2. Uma página por letra (`/alfabeto-hebraico/alef` ...): forma, som, uma palavra exemplo já
   gravada, letras parecidas, e "aprenda esta letra no curso". 22 páginas de valor próprio, com
   dado nosso (a gravação e a comparação com o português), o que o `programmatic-seo` pede para não
   virar página rala. Os diagramas de traçado continuam atrás do portão.
3. Três guias: "como ler hebraico", "o que é o nikud", "hebraico para quem vai a Israel".
4. Dados estruturados (já existe JSON-LD do curso) e respostas curtas no topo de cada página, que
   é o que a busca por IA cita.

**Experimento:** publicar a pilar e 5 letras, medir impressões e cliques em 8 semanas antes de
fazer as outras 17. **Aprovação:** todo hebraico e toda transliteração passam pelo dono.

## 3. Landing page e checkout (CRO)

**[E]** a auditoria de 01/10 deu 76/100 e os cinco problemas dela estão resolvidos. O que sobra
são hipóteses de ganho, para testar uma de cada vez (skill `ab-testing`: com pouco tráfego, um
teste por vez e decisão por diferença grande, não por significância fina).

| # | Hipótese [H] | Mudança | Métrica |
|---|---|---|---|
| C1 | A capa com três jornadas de mesmo peso reduz o clique no curso | curso em primeiro, "Em breve" numa linha com lista de espera | `cta-curso` / `visto` |
| C2 | Quem termina o teste grátis e não compra quer pensar | no fim do teste: "me mande a próxima letra" (e-mail) ao lado de "começar o curso" | inscrições / `pronto` |
| C3 | Falta prova de comprador | depoimentos novos (ver canal 5 do diagnóstico) perto do preço | clique em "Começar o curso" |
| C4 | Criar conta antes de ver as condições assusta | mostrar "Condições desta compra" antes do cadastro | pedidos criados / cliques no botão |
| C5 | O PIX com 10% já é o mais escolhido | medir a escolha antes de mexer | proporção PIX x cartão |

Nada disso troca a identidade: sem cronômetro, sem pop-up de saída, sem escassez.

## 4. Parcerias (associações, caravanas, comunidades)

**Objetivo:** custo de aquisição baixo, com confiança emprestada de quem o público já conhece.
**[E]** o mecanismo de link por parceiro grava o nome no pedido; `/sefarad` (@adsefarditas) existe.

**Quem (skill `co-marketing`, pontuação por sobreposição de público):**
1. Associações e comunidades sefarditas (raízes e família).
2. Agências e guias de caravanas a Israel (viagem): o curso antes do embarque.
3. Igrejas, seminários e grupos de estudo bíblico (Bíblia).
4. Escolas e clubes judaicos, cursos de cultura israelense.

**Oferta ao parceiro:** uma aula aberta de 20 min ("leia sua primeira palavra em hebraico"), ao vivo
ou gravada, o link próprio, um texto de WhatsApp e um post prontos. **Condição de grupo** só com a
decisão do dono. **Atenção:** comissão em dinheiro para o parceiro é "afiliados", que o
`CLAUDE.md` (Enquadramento) manda apontar ao dono **antes**, por poder mudar o enquadramento
fiscal. Por isso o piloto começa sem comissão.

**Experimento:** 3 parceiros em 6 semanas. Métrica: visitas e compras por link; custo = horas do
dono. Escala para mais parceiros só se algum passar de um patamar que o dono definir (ex.: 5
compras por parceiro no mês).

## 5. E-mail marketing

**[E]** hoje o site envia só e-mail de serviço e tem uma única lista de propaganda (o aviso do A1,
para quem tem conta). A Política de Privacidade diz que **não há outro e-mail de propaganda**. Uma
sequência para interessados exige mudar a Privacidade e a aprovação do dono, antes de qualquer
envio.

**Proposta (skills `emails` e `lead-magnets`):**
- **Ímã:** "a próxima letra por e-mail" (o Mem, que o e-mail `SEGUNDA_LETRA` já tem pronto), e a
  lista de espera dos "Em breve".
- **Sequência de interessado, 6 e-mails em 14 dias:** (1) a segunda letra, na hora; (2) a terceira
  letra e a primeira palavra possível; (3) por que uma letra por vez; (4) uma dúvida comum (Bíblia,
  pronúncia, tempo); (5) o que um aluno conseguiu ler (só com depoimento real); (6) o convite com o
  preço e os 7 dias para desistir. Uma tarefa por e-mail; saída em um clique.
- **Pós-compra (já existe recibo):** um e-mail no dia 3 sem lição ("quer ajuda para começar?") e
  um no fim do módulo 1 pedindo depoimento.
- Envio pela Resend, que já está ligada. Consentimento desmarcado, finalidade escrita, link de saída
  assinado (o mecanismo de `/sair-da-lista` já existe).

**Métrica:** abertura não decide (é imprecisa); decide clique e compra por e-mail da sequência.

## 6. Tráfego pago

**Quando:** só depois de (a) a origem gravada no pedido (diagnóstico, oportunidade 1) e (b) uma
taxa de conversão de base da página de venda com tráfego orgânico. **[E]** sem isso não há como
calcular custo por compra.

**Restrição da casa:** o site não tem pixel e a CSP bloqueia scripts de terceiros; a Privacidade
diz que não há analítica. Pôr pixel da Meta é decisão do dono, com mudança na Privacidade. A
alternativa sem pixel: medir pelo link e pela UTM gravados pelo próprio site, e otimizar a
campanha para clique no link (mais caro de otimizar, mais simples de manter).

**Primeiro teste (skills `ads` e `ad-creative`), com teto definido pelo dono:**
- Meta (Instagram), público amplo no Brasil, três conceitos = os três ângulos, 3 peças por conceito
  (o algoritmo atual premia variedade de criativo, não segmentação fina).
- Impulsionar os 2 Reels orgânicos que mais levaram ao teste grátis, em vez de produzir anúncio do
  zero.
- 14 dias, verba pequena e fixa; regra de parada escrita antes (ex.: custo por "teste grátis
  concluído" acima de X, desliga).
- Google Ads só em buscas de intenção ("curso de hebraico online", "aprender alfabeto hebraico"),
  depois que o SEO mostrar o volume.

**Aprovação:** campanha, verba, texto e arte, uma por uma. Nada é ligado sem o dono.

## Ordem sugerida

1. Medição (base) → 2. Lista e e-mail (com a Privacidade revista) → 3. Instagram com os pilares e
os experimentos → 4. Parcerias piloto → 5. CRO, um teste por vez → 6. SEO pilar + 5 letras →
7. Tráfego pago pequeno. A Fase 3 transforma isso em semanas.

## Decisões que dependem do dono

1. Mudar a Privacidade para permitir a lista de interessados e a sequência de e-mails.
2. Testar o peso do curso na capa (C1).
3. Condição de grupo para parceiros; e se algum dia houver comissão, a conversa com o contador.
4. Pixel da Meta (com Privacidade nova) ou medição só pelo próprio site.
5. Teto mensal para o teste de anúncio e a regra de parada.
