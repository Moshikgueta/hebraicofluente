# H-com - Comercial · Landing · Copyright (28/09/2026, somente leitura)

Base: `node app/numeros.mjs` ✓ (27 lições · 22 letras · 7 módulos, 12 páginas livres batem); `node app/promessas.mjs` ✓ (manifesto com gravação, 50 páginas); `node tools/check-audio.mjs` 526/526. E-ped.md e A-qa.md: E-ped existe e foi usado (PED-042/043/052 recebidos por HANDOFF); **A-qa.md não existe → dependência** para tudo que exige navegador (marcado NOT TESTED).

## 1. Matriz de promessas

| promessa | onde está | evidência no produto | status |
|---|---|---|---|
| 22 letras (+5 finais) fora de ordem | courses.json:41; Promessa.tsx:24; og.jpg | letters.json 22; exame `letras`/`dificeis` (E-ped PASS) | PASS |
| 27 lições / 7 módulos | Promessa.tsx:60; Fecho.tsx:341; CourseClient:70-71; CheckoutClient:556; /faq:54 | modules.json 27 lições; numeros.mjs ✓ | PASS |
| **og.jpg "21 lições"** | app/public/media/og.jpg (gerado 21/09, b320384) | modules.json passou a 27 em 26/09 (9ddee5d, d356f16); numeros.mjs só lê HTML | **FAIL** → COM-001 |
| "lê uma palavra de verdade já na terceira lição" | courses.json:39; /metodo:89 ("Lição 3 · מַיִם") | letters.json: mem (lição 1) já tem אִמָּא/אֵם; מַיִם exige yod (lição 2); lição 3 é prática | PASS (subpromete) |
| AulaAmostra "Uma questão real da Lição 3 … som SH" com opções ש מ ל ב | Fecho.tsx:187-201, 170 | ש é lição 4, ל lição 5, ב lição 14 - viola a "regra nº 1" vendida em /metodo:52 | FAIL → COM-004 |
| Ler qualquer palavra com nikud | courses.json:42 | motor + nikud.json (E-ped PASS) | PASS |
| Ler sem nikud as mais frequentes | courses.json:43; Secoes.tsx:448-453 ("ler sem apoio… placa ou cardápio") | extras.json 24+2 palavras, `buildSemPontos`; NÃO no exame (PED-042) | PARTIAL |
| Escrever à mão "em letra de forma e cursiva" | courses.json:44 (/cursos, /cursos/alfabetizacao); modules.json goalsPt | Só cursiva: TraceBoard, stroke-paths da Gveret Levin; cursiva.ts; Promessa.tsx:27 e copy.ts:66 dizem só "cursiva" (coerentes) | FAIL → COM-002 (= PED-043) |
| Cursiva é ensinada, não só mostrada | copy.ts:64-66; Secoes.tsx:186-197; /faq:120 | TraceBoard `conferir(): Veredito {score,tone,message}`; EscreverPalavras; jogo `montarCursiva` | PASS |
| Decodificar placas, rótulos e cardápios | courses.json:45; Promessa.tsx:78 | real-world.json 17 cenas (placa 6, rótulo 2, conversa 2, recibo, etiqueta, anúncio, jornal, mensagem, vitrine 2), exercício `scene-reading` + parte `mundo` do exame (5 itens); nenhuma cena é cardápio | PARTIAL (cardápio só no texto) |
| Correção imediata, com explicação | Promessa.tsx:56; copy.ts:78; Fecho.tsx:131; Decisoes.tsx:296 | `porQueErrou`, `whyPt` nos exercícios (E-ped) | PASS |
| Áudio do professor em tudo / "Áudios de todas as letras e palavras" | OuvirEFalar.tsx:87; Fecho.tsx:127,343,466; copy.ts | audio.json 526/526, 5 ondas; voz do dono | PASS |
| **/faq "O curso tem áudio com voz de verdade? Ainda não… sintetizador… voz de espanhol latino"** | app/src/app/faq/page.tsx:111-115 (texto estático, sem TEM_AUDIO); presente em app/out/faq/index.html | contradiz 526 clipes, a capa e a caixa de preço | **FAIL** → COM-003 |
| Cinco tipos de exercício (escolha, digitação, associação, escuta, leitura) | copy.ts:74-77; Secoes.tsx:87 | types.ts: choice/type-hebrew·type-answer/match/audio-recognition·listen-*/scene-reading·sentence-reading (+build-*, cursive-word) | PASS (contado; há mais que 5) |
| Revisão espaçada ("intervalos crescentes", "só o que precisa") | copy.ts:82-83; Fecho.tsx:134; /metodo:99 (5 habilidades por letra) | rules.ts SRS, `SKILLS`, `weakestSkill` | PASS |
| Aviso de revisão pendente · % por módulo · tempo por semana | copy.ts:83,88 | DashboardClient CartaoRevisao/`tempoSemana`; CourseMapClient pct | PASS |
| "Dificuldade sobe conforme você acerta" | copy.ts:78 | `nivelDe` só em jogos.ts (gym/jogos); nada em exercises.ts | PARTIAL |
| Progresso salvo na conta, multi-aparelho, offline | Promessa.tsx:60; /faq:133-135; Fecho.tsx:346 | /api/progress + merge.ts (AUDIT_CONTEXT) | PASS (sync real NOT TESTED) |
| "Sequência: faltar um dia não zera nada" | Fecho.tsx:132 | rules.ts:101 `gap===1 ? current+1 : 1` - o contador ZERA salvo "folga" comprada (100 XP); só XP/recorde ficam | FAIL → COM-006 |
| 12 meses · sem mensalidade · acesso imediato | cta.ts micro; Promessa.tsx:61; Fecho.tsx:427-432; CheckoutClient:381 | accessMonths 12; cobrança única; liberação automática em modo mercadopago (pix-direto: LEGAL-017) | PASS |
| "Depois do pré-lançamento passa a custar R$ 297" (riscado) | Fecho.tsx:389-393; CourseClient:290-296; CheckoutClient:589-593 | LEGAL-014 (sem data de fim) | ver LEGAL-014 |
| Juros "da operadora" | /faq:81; CheckoutClient:313 | PAY-010 / LEGAL-015 | ver PAY-010 |
| Certificado | /faq:147-151; meta /faq | certificate.ts:156,237 "Certificado de conclusão" + "Não é um certificado oficial de proficiência"; só com 22 letras + exame ≥70% | PASS |
| Exame final "com correção, gabarito, transcrição e critérios à vista" | Decisoes.tsx:297; /sobre:79 | FinalChallengeClient: nota por parte e `examReport`; nenhum "gabarito"/"transcrição" encontrado por grep | NOT TESTED → HANDOFF QA |
| Jogos | (nenhuma página livre promete) | jogos.ts: Caça, Batalha, Cursiva (3) | PASS (não prometido) |
| "Ouça e fale" na capa | OuvirEFalar.tsx:83-88, 212 | amostras públicas /amostra-audio; FalarECorrigir (Web Speech: Chrome/Android/Safari), Firefox cai em GravarLeitura; estados `negado`/`sem-hebraico`; mic só na capa e rotas pagas (worker.js:248) | PASS no código; iOS/hebraico NOT TESTED |
| "o curso confere a sua pronúncia" dentro do curso | OuvirEFalar.tsx:88 | CompararPronuncia em LessonClient e SomLessonClient | PASS |
| A1 "em breve" / "em produção" | Fecho.tsx:473; /faq:163; /cursos | courses.json engine null, sem data, sem botão | PASS (sem data; LEGAL-019 para o "avisados primeiro") |
| Tempo: "vinte minutos por dia… seis a oito semanas" vs "27 lições de ~10 min… uma por dia < 1 mês" vs "três semanas ou três meses" | Fecho.tsx:461 · /faq:54 · CourseClient:163 | 27×10 min ≈ 4,5 h; sem aluno ainda, "a maioria termina" não tem base | FAIL → COM-005 |
| Nº de alunos / depoimentos | Trajetoria.tsx regra 1 (nenhum número) | 1 depoimento | PASS (nenhum número inventado) |
| "método"/"metodologia" | /metodo:41 "Não é método novo nem segredo"; /sobre:115 "adaptado"; Trajetoria | crédito Dzienciarsky em todas as páginas (D-legal PASS) | PASS |
| Meta descriptions (/, /cursos, /faq, /metodo, /sobre) | page.tsx:11-15; cursos/page.tsx:9; faq:15; metodo:13; sobre:24 | tudo existe; /cursos "Alfabetização, A1, A2 e B1. A trilha completa" anuncia 3 cursos inexistentes | PARTIAL → COM-008 |
| Imagens de vocabulário | (nenhuma página livre promete); depoimento cita "imagens" | 46/46 `image:null` (PED-052) | PASS na vitrine; ver COM-010 |

## 2. Problemas

COM-001 | P2 | app/public/media/og.jpg (gerado por tools/og.mjs em 21/09) | O cartão de WhatsApp/OG - "a primeira impressão para mais gente do que a capa" (og.mjs:5-8) - diz **"21 lições · 22 letras"**; o site e o checkout dizem 27 | imagem lida: rodapé "21 lições · 22 letras · feito para brasileiros"; modules.json mudou 26/09; numeros.mjs só varre HTML | `node tools/og.mjs` e commitar; acrescentar ao numeros.mjs (ou ao CI) uma conferência do JPEG contra `licoes` (ex.: gravar o número num sidecar `og.json` e comparar)
COM-002 | P2 | data/courses.json:44 (renderizado em /cursos e /cursos/alfabetizacao, "O que você vai conseguir fazer"); modules.json goalsPt mod1-5 | Oferta "escrever… em letra de forma e cursiva" quando o traçado é só cursivo (PED-043) - a página de curso é lida antes do checkout | cursiva.ts REGRA_CURSIVA; gen-stroke-order.py (só Gveret Levin) | "Escrever as 22 letras à mão em cursiva, na ordem certa dos traços - e reconhecer a forma impressa"; alinhar modules.json
COM-003 | P1 | app/src/app/faq/page.tsx:110-116 (está no HTML publicado app/out/faq/index.html) | A FAQ oficial diz que **não há áudio de verdade** ("sintetizador do próprio navegador, com voz de espanhol latino") enquanto a capa vende "gravações do professor, um israelense" e a caixa de preço "Áudios de todas as letras e palavras". Texto estático herdado do projeto irmão em espanhol; contradiz o produto (526 clipes) e a própria regra do copy.ts. Comprador que lê a FAQ compra achando que não tem áudio - ou desconfia do site inteiro | grep TEM_AUDIO em faq/page.tsx: ausente; `promessas.mjs` só procura promessa positiva sem áudio, não o inverso | Reescrever condicionado a `TEM_AUDIO` (como Fecho.tsx:464-467); acrescentar ao vitrine.test/promessas.mjs a regra inversa ("com manifesto cheio, nenhuma página pode dizer 'ainda não'/'sintetizador')
COM-004 | P3 | components/landing/Fecho.tsx:170,187-201 | "Uma questão real da Lição 3, do jeito que ela aparece dentro da plataforma" com Shin (lição 4), Lámed (5) e Bet (14) - não é real e contraria a "regra número um" que /metodo usa como diferencial | modules.json lições 1-3 = א מ ת נ ה י | Trocar por questão de fato gerável na lição 3 (ex.: "Qual letra faz o som M?" com מ נ ת ה) ou tirar "real da Lição 3"
COM-005 | P3 | Fecho.tsx:461 · faq/page.tsx:54 · CourseClient.tsx:163 · metodo:127 | Três estimativas de tempo incompatíveis (20 min/dia por 6-8 semanas ≈ 14-19 h; 27 lições de 10 min ≈ 4,5 h; "três semanas ou três meses") e "a maioria termina em…" sem nenhum aluno para sustentar | código | Uma frase só, derivada (`totalLicoes()` × minutos + checkpoints), sem "a maioria"; ex.: "27 lições de ~10 min: uma por dia, menos de um mês"
COM-006 | P3 | Fecho.tsx:132 "faltar um não zera nada" | O contador de sequência zera ao faltar um dia sem folga comprada (rules.ts:101); só XP e recorde ficam | rules.ts:72-118; loja.ts:33-35 | "faltar um dia não apaga XP nem o recorde; a sequência continua se você tiver uma folga guardada"
COM-007 | P3 | Fecho.tsx:41-46 e /faq (ausência); CheckoutClient.tsx:379-399 | O que NÃO está incluído nunca é dito em página livre: sem aula ao vivo, sem professor/correção humana, sem A1. Só termos/page.tsx:41 diz "não há aula ao vivo ou acompanhamento individual"; e o depoimento ("Ele faz você prestar atenção…") sugere ensino pessoal | grep "ao vivo|tutor": só Termos | Linha em "Condições desta compra" e na FAQ: "Curso autoinstrucional: sem aulas ao vivo nem acompanhamento individual; suporte só por e-mail para problemas de acesso; o A1 é curso à parte"
COM-008 | P3 | cursos/page.tsx:9 (meta), CursosClient.tsx:29-30 ("Do primeiro alfabeto à conversa… Quatro cursos, uma conta"), Secoes.tsx Jornada, design/README.md | Vitrine e meta anunciam uma trilha de 4 cursos e "a conversa" quando existe 1; preços "PROVISÓRIOS" dos 3 inexistentes já ficam em courses.json (LEGAL-021). Junto com a marca "Hebraico Fluente" e o hero "Quer viajar para Israel?", cria expectativa de fluência que a alfabetização não entrega, mitigada por: selo "alfabetização (e não fluência)", Promessa.tsx "base", Jornada "cursos à parte", FAQ Bíblia "entender, não" | código | Meta e título de /cursos: "Alfabetização disponível; A1, A2 e B1 em produção"; retirar "à conversa"; manter os cartões "Em breve"
COM-009 | P3 | Fecho.tsx:285 "Quem já está lendo." + testimonials.ts | Comercialmente, um depoimento único, sem foto, de aluna presencial (fala do professor, não da plataforma de autoestudo), com selo de resultado dado pelo dono, sob o título coletivo "Quem já está lendo" - é fraco como prova e é o único; LEGAL-023 cobre a autorização | testimonials.ts:32-41 | Ou 3-5 depoimentos de beta-testers da PLATAFORMA (o que leu, em quanto tempo) com autorização guardada, ou título singular ("Uma aluna") até lá; a menção a "imagens" na citação conflita com PED-052 (nenhuma imagem de vocabulário) - conferir com a aluna a que imagens se refere
COM-010 | P4 | Hero.tsx:135 / :172-175 ("Ler as letras da Bíblia") | Aceitável e sustentado pela FAQ/AlemDoAlfabeto ("ler em voz alta, sim; entender, não"). Só registrar que o hero A/B não repete a ressalva - fica a 2 rolagens | - | manter; se o teste A vencer, levar "Ler as letras é o primeiro passo…" para a versão A
COM-011 | P4 | Secoes.tsx:426-453 "Módulo 6-7 · ler sem apoio… como numa placa ou cardápio" | Coerente com módulo 6 (24 palavras sem nikud), mas o exame não mede (PED-042) e não há cardápio em real-world.json | - | acrescentar 1-2 cenas `cardapio` ou trocar "cardápio" por "etiqueta"
COM-012 | P4 | Decisoes.tsx:297; sobre/page.tsx:79 | "O exame final tem correção, gabarito, transcrição e critérios à vista" - não achei gabarito/transcrição no FinalChallengeClient (só nota por parte) | grep | HANDOFF → QA: abrir /desafio-final e conferir; se não houver, reduzir a "correção por parte e nota mínima à vista"
COM-013 | P4 | copy.ts:78 "Dificuldade sobe conforme você acerta" | Verdadeiro nos jogos/academia (`nivelDe`), não nas lições | jogos.ts:58 | "nos jogos, a dificuldade sobe…" ou manter se QA confirmar nas lições

## 3. Clareza da oferta (hero → CTA → /cursos/alfabetizacao → /checkout)
PASS | Antes de pagar o visitante vê: 27 lições · 7 módulos · 12 meses · preço R$147, PIX R$132,30, "até 12x no cartão" (valor da parcela só na MP, coerente com PAY-010) · liberação automática · 7 dias · "pelo navegador" · declaração de idade | CourseClient:68-80,330-348; CheckoutClient:379-399,550-606; cta.ts micro "Acesso imediato · 12 meses · sem mensalidade"
PASS | Preço e prazo vêm só de courses.json (catalog.ts/catalog.js); numeros.mjs e promessas.mjs no CI (deploy-worker.yml:317,335) | código
PASS | Sem escassez falsa: sem contagem regressiva, sem "vagas", sem "últimas"; BarraFixa sem X nem timer | grep na landing: nada
PARTIAL | Requisitos não ditos: navegador (quais?), microfone opcional, sem app nativo; GravarLeitura:149 só avisa depois de falhar | ver COM-007
NOT TESTED | Fluxo real em navegador (A/B do hero, barra fixa, /checkout com MP) | A-qa.md ausente; produção inalcançável

## 4. Expectativas de risco
PASS | Sem "fluência", "garantia", "comprovado", "rápido", "reconhecido", "exclusivo" nas páginas livres | grep -i em landing/, faq, metodo, sobre, cursos: só "Hebraico Fluente" (marca) e comentários
PASS | Comparação com outros métodos limitada a "quase nenhum curso faz" (/metodo:56) - opinião, sem citar concorrente | -
Ver LEGAL-014 (riscado sem data) · LEGAL-015/PAY-010 (juros) · LEGAL-019 (aviso do A1) · LEGAL-023 (depoimento) · LEGAL-024 (credenciais).
COM-008 cobre "trilha de 4 cursos"/marca vs alfabetização.

## 5. Copyright e ativos
PASS | Fontes: 7 famílias em app/public/fonts, cada uma com LICENSE-*.txt OFL-1.1 (Bricolage, DM Sans, Instrument Sans, Inter, Noto Sans/Serif Hebrew, Gveret Levin) - OFL permite uso comercial, embutir e derivar contornos; licença viaja com os woff2 | app/public/fonts/LICENSE-*
PASS | stroke-paths derivados da Gveret Levin (OFL, permite obras derivadas; o nome "Gveret Levin" não é usado como nome de produto) | tools/gen-stroke-order.py:36-38
PASS | Lucide: NÃO é usado (0 imports; ícones são SVG inline próprios) | grep lucide
PASS | Áudios: voz do dono (526 clipes) | audio.json
PASS | Textos bíblicos: hebraico massorético (domínio público); tradução declarada "nossa, literal, e não de uma edição com direitos" (bonus.json:18-19). Amostra de 3+: Sl 23:1 "O Senhor é o meu pastor, nada me faltará" (fórmula comum ARC/ARA - genérica); Jr 29:11 "planos de paz, e não de mal, para dar a vocês um futuro e uma esperança" (≠ ARA "pensamentos de paz… o fim que desejais", ≠ NVI "fazê-los prosperar"); Is 53:5 "ferido por causa das nossas transgressões, esmagado por causa das nossas culpas… pelas suas feridas fomos curados" (2ª metade coincide com NVI/ARA, 1ª não); Sl 119:105 ≈ ARC (domínio público). Veredito: tradução própria com ecos de fórmulas consagradas, não cópia literal de ARA/NVI - risco baixo | data/bonus.json
PASS | Design: design/Landing.dc.html e Plataforma.dc.html são handoff próprio do projeto, sem material de terceiros identificado | design/README.md
PARTIAL | Imagens: hero.webp/hero-mobile.webp gerados por IA no Higgsfield (media.ts:41-45; commit 6328dc5) - sem hebraico nem pessoas, por regra; og.jpg gerado por tools/og.mjs com a foto do hero; moshik.webp é foto do dono (commit 1b13eb7). Nada no repo registra os termos comerciais do Higgsfield nem a conta que gerou; imagem de IA não tem proteção autoral no Brasil (sem autor humano), então o risco é só contratual | git log app/public/media | Guardar fora do repo o comprovante do plano/termos do Higgsfield na data da geração
NOT TESTED | Marca "Hebraico Fluente" no INPI e conflito de nome | busca web genérica não achou curso homônimo (não conclusiva; INPI inalcançável daqui) → ADVOGADO: busca de anterioridade nas classes 41/9 antes de investir na marca; nome descritivo tem registrabilidade fraca
Ver D-legal §9 | Conteúdo derivado do livro de Damián Dzienciarsky (crédito existe em todas as páginas; licença é questão de ADVOGADO)

## 6. Certificado (comercial)
PASS | Vendido com moderação: só na FAQ (/faq:147-151, "não é por participação… não é certificado oficial nem avaliação reconhecida") e na meta de /faq; não aparece no hero, na caixa de preço nem nas "Condições da compra". A imagem diz "Certificado de conclusão" + "Registro de conclusão do curso. Não é um certificado oficial de proficiência." (certificate.ts:156,237) e a afirmação ("leu as 22 letras… sem transliteração") bate com o que o exame mede (E-ped PASS) | certificate.ts
COM-014 | P4 | certificate.ts:156 vs :237 | Título "Certificado de conclusão" e rodapé "Registro de conclusão… Não é um certificado" na mesma imagem - a ressalva está em 13-14,5 px, o título em 40-52 px; ao ser postado no LinkedIn o recorte mostra o título | código | "Declaração de conclusão" no título, ou a ressalva em corpo ≥ 16 px

## HANDOFFS
HANDOFF → QA: COM-012 (gabarito/transcrição do exame), COM-013 (dificuldade nas lições), "Ouça e fale" em iOS Safari/Android (hebraico no Web Speech), barra fixa, A/B do hero.
HANDOFF → PED: COM-004 (questão "real" da lição 3), COM-011 (cena de cardápio).
HANDOFF → LEGAL/ADVOGADO: busca INPI; termos Higgsfield; COM-007 (o que não está incluído, junto a Termos art. 3).
HANDOFF → UX: COM-014 (hierarquia da ressalva no certificado).

Resumo: P1: 1 (COM-003) · P2: 2 (COM-001, COM-002) · P3: 7 (COM-004…009, 010 é P4) · P4: 5.
