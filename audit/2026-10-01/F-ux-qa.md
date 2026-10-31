# F - UX da jornada completa + QA funcional (Hebraico Fluente, 01/10/2026)

Base: main @ 6d6302d. Ambiente: http://127.0.0.1:8787 (wrangler dev --local, D1 local, build atual de app/out),
Chromium Playwright a 390 px (isMobile em parte dos testes), 360 px e 1280 px. Scripts e capturas em
`scratchpad/audit2/F/` (pub.mjs, novo.mjs, checkout.mjs, onb2.mjs, licao.mjs, fix.mjs, cta.mjs, bordas.mjs,
estresse.mjs, lixo.mjs, nojs.mjs, lento.mjs, conta.mjs, conta3.mjs, vencido.mjs, exame.mjs, cert.mjs,
quem2.mjs, extras.mjs, links.mjs, m360.mjs, h418.mjs, chaves.mjs). Nenhum arquivo do repositório foi alterado.

Contas usadas:
- `f-ux-novo-1790814719783@example.invalid` (id 27), criada pela UI; acesso concedido por SQL (`order_id F-UX-AUDIT`)
  para viver a primeira experiência de aluno sem herdar o estado da conta compartilhada. Recebeu 2 pedidos `failed`
  do checkout sem credencial e, no fim, progresso FORJADO (22 letras, exame aprovado, xp 1000) para testar
  certificado e jogos. Vencimento mexido e restaurado. **Limpar depois** (conta, entitlement, orders, progress).
- `f-ux-dois-1790815380806@example.invalid` (id 31), criada pela API; usada para aparelhos, trocar senha, sair,
  esqueci senha, depoimento e APAGAR conta (apagada pela UI no fim).
- A conta compartilhada `aluno-ux-1790733122848@example.invalid` foi só lida (GET /api/progress via curl, 1 login):
  logout e apagar NÃO foram feitos nela, porque "Sair" derruba todas as sessões da conta (ver UXQA-006) e
  atrapalharia os outros auditores.

Legenda de confiança: CONFIRMADO = reproduzido no navegador ou no código com evidência; ALTA CONFIANÇA = lido no
código e coerente com o comportamento; PRECISA VERIFICAÇÃO MANUAL = depende de algo que não existe aqui.

---

## PARTE 1 - Jornada por persona

Percurso feito de verdade, a 390 px e 1280 px: capa → /cursos → /cursos/alfabetizacao → criar conta → o que um
recém-cadastrado sem curso vê → checkout sem credencial → (acesso concedido) → login → painel → onboarding →
Aula 0 → lição Álef inteira (Conhecer, Palavras, Escrever, Praticar 14 itens, Fixação 10 itens) → painel →
revisão → checkpoint 1 → vocabulário → academia (6 jogos + digitar com teclado da tela) → loja → perfil (trocar
senha, aviso do A1, sair, aparelhos) → entrar de novo → esqueci senha (link real do emails.jsonl, uso e reuso) →
confirmar e-mail (deslogado, logado, token ruim) → depoimento → apagar conta → exame final → certificado.

### O que cada persona entende hoje

| Pergunta | A (zero) | B (viajar) | C (Bíblia) | D (já sabe um pouco) | E (mais velha, pouca tecnologia) | F (só celular) |
|---|---|---|---|---|---|---|
| O que ensina | Claro: capa, /cursos e página do curso listam "o que você vai conseguir fazer" (22 letras, nikud, cursiva, ler sem nikud) | Confuso: a capa abre com "Quer viajar para Israel? Você está no lugar certo" e só /cursos (A1) e /biblia dizem que conversa é outro curso (UXQA-010) | Muito claro: /biblia "Sim para ler. Não para entender", linkada da FAQ | Claro que é do zero | Claro | Claro |
| O que NÃO ensina | FAQ "O que não está incluído" + checkout "O que não vem junto" (sem professor, sem ao vivo) | Falta a frase "não ensina a falar" na capa e no curso | Coberto | /cursos: "Se você já lê com nikud, comece no A1 quando sair" | Coberto na FAQ (fechada em sanfona) | Coberto |
| Para quem é | Página do curso "Este curso é para você se…" | idem | "lê por motivo religioso" aparece; o onboarding não tem esse motivo (UXQA-009) | Onboarding responde "todo mundo começa pela primeira letra"; sem nivelamento nem atalho (UXQA-022) | Sim | Sim |
| Como funciona | Capa "três decisões" + "seis passos"; Aula 0 explica bem | idem | idem | idem | Aula 0 longa (14 partes) mas abre por partes | Funciona |
| Quanto dura o acesso | 12 meses, consistente em capa, curso, checkout, FAQ, perfil ("Acesso até 01/10/2027") | idem | idem | idem | idem | idem |
| O que recebe | Caixa de preço + checkout "Condições desta compra" | idem | Leituras bônus só aparecem dentro (loja) | idem | idem | idem |
| Depois de pagar | "Acesso liberado na hora", "não precisa mandar comprovante" (FAQ). Tela pós-pagamento NÃO testada (sem MP) | idem | idem | idem | Sem caminho claro se o PIX demorar: "Meu Hebraico" leva à página de vendas com o preço em cima (UXQA-007) | idem |
| Como começar | Painel "Seu curso está liberado · Começar" → onboarding → Aula 0 → Álef. Bom | idem | idem | idem | Nome pedido de novo no onboarding (UXQA-008) | idem |
| Como funciona o progresso | FAQ promete "volta exatamente na lição e na questão": falso (UXQA-003). Concluída x dominada confunde (UXQA-005) e o botão "Concluir e continuar" leva a uma letra trancada (UXQA-002) | idem | idem | O portão de 80% em cada fixação pesa para quem já sabe | Mesma confusão, agravada | idem |
| Como pedir ajuda | Rodapé da plataforma "Precisa de ajuda?" → /suporte (e-mail, WhatsApp). FAQ diz que o suporte é só para acesso/pagamento/conta, /suporte convida dúvidas do curso (UXQA-016) | idem | idem | idem | WhatsApp ajuda; derrubada de aparelho sem explicação (UXQA-006) | idem |
| Certificado e o que vale | FAQ, /certificado e a própria imagem dizem "não é oficial". A capa não menciona certificado (ok) | idem | idem | idem | idem | idem |
| Precisa saber hebraico antes | "Não", em FAQ da capa e /faq | idem | idem | idem | idem | idem |

Resumo das personas: A, C e F são bem servidos pelo site; B sai achando que vai conseguir se virar em Israel;
D não tem atalho e bate no portão de 80% letra a letra; E tropeça em sessão derrubada sem explicação, nome pedido
três vezes e textos de progresso que se contradizem. F (só celular): 18 rotas da plataforma sem rolagem lateral a
360 px, alvos pequenos só em links de texto corrido (isentos), traçado por toque funciona.

### Estados de borda verificados (resultado curto)

| Caso | Resultado |
|---|---|
| Recém-cadastrado sem curso em /inicio, /meu-hebraico, /licao/alef, /mapa, /onboarding, /loja, /certificado, /modulo/99, /licao/nao-existe | 302 do Worker para /cursos/alfabetizacao/; o bloco "Esta conta ainda não tem o curso" fica abaixo da caixa de preço (abaixo da dobra a 390 px); nada diz que a página pedida é paga (UXQA-007) |
| /perfil sem curso | Abre com a navegação COMPLETA do aluno (Hoje, Meu curso, Revisão, Praticar, Progresso, Palavras, Aula 0, presente da loja, 0 XP), todos levando de volta à página de vendas (UXQA-007) |
| Checkout sem credencial MP | Passo 2 mostra PIX/cartão e condições; "Pagar" → POST /api/pay/create 502 → "Não conseguimos gerar o pagamento agora, e o problema é nosso… nada foi cobrado" (bom). Cada tentativa vira um pedido `failed` listado em Compras como "NÃO CONCLUÍDO" (UXQA-013) |
| JS desligado | Capa, curso, checkout, entrar, criar conta, FAQ, suporte: só cabeçalho, rodapé e 3 blocos-esqueleto (UXQA-001) |
| Um chunk JS abortado | Capa renderiza normalmente (10.463 caracteres) |
| Refresh no meio da prática | Volta à etapa Conhecer; a prática recomeça em 1/14 (UXQA-003) |
| Voltar do navegador no meio da lição | Sai da lição para /mapa (as etapas não entram no histórico); etapas concluídas ficam salvas (UXQA-003) |
| Deep link para lição trancada (/licao/tav) | "A letra ת ainda não abriu… Ir para Mem · Continuar de onde parei · Ver o mapa" (bom) |
| /licao/nao-existe, /modulo/99, /modulo/abc, /checkpoint/99, /som/xyz, /extra/xyz, /checkout/xyz, /nao-existe-xyz | 404 real com "Esta página não existe · Voltar ao início" (QA-001 resolvido); para aluno, /licao/x e /som/x disparam React #418 (UXQA-017) |
| /bonus/?l=xyz e ?l=<script> | "Esta leitura não existe. Ir para Recompensas" (bom, sem eco do parâmetro) |
| /entrar/?next=javascript:alert(1), //evil, https://evil, /\evil, %2F%2Fevil | Todos caem em /meu-hebraico/, nenhum diálogo, nenhum redirecionamento externo; `/mapa/?a=<b>` preservado e codificado (bom) |
| localStorage com JSON quebrado em hebraico-fluente-v1, hf-rodadas-v1, hf-progresso-dono + 500 KB de lixo | Painel, lição, exame e revisão abrem; o estado é reconstruído do servidor (bom) |
| localStorage cheio (cota estourada) | Lição abre e avança sem erro |
| localStorage inacessível (getter lança) | Login e lição funcionam; aviso "O navegador está bloqueando o armazenamento local…" (bom) |
| Sessão expirada no meio do exercício | Faixa "Sua sessão terminou. O que você fizer agora fica salvo só neste aparelho… Entrar de novo"; carga dura → /entrar?next= (QA-004 resolvido) |
| /api/progress abortado (route.abort) | Faixa "O que você acabou de fazer está salvo neste aparelho, mas ainda não chegou à sua conta…" (bom) |
| Áudio 404 | role=status "Não consegui tocar o áudio. Confira a conexão e toque de novo." (UX-012 resolvido) |
| Rede lenta (CDP: 400 ms, 400 kbit/s) | /licao/mem: esqueleto com aria-busy por ~10-15 s antes do conteúdo; capa 5,3 s até load (UXQA-020) |
| 4º aparelho entra | O 1º cai em /entrar?next=… sem nenhuma explicação (UXQA-006) |
| Esqueci senha | Mensagem neutra; e-mail "Redefinir sua senha" chegou; link abre "Escolher uma senha nova", salva e entra direto; reuso: "Esse link não vale mais…" (bom) |
| Confirmar e-mail | Deslogado: pede login com explicação de "não foi você"; token ruim: mensagem clara; conta já confirmada (pelo reset): "Pronto, confirmado" (comportamento previsto em auth.js:388-391) |
| Trocar senha | Senha atual errada → "E-mail ou senha não conferem." (UXQA-011); certa → "Senha trocada. Os outros aparelhos… foram desconectados" |
| Apagar conta | Senha + "APAGAR", depois /conta-apagada explicando o que foi e o que ficou (bom) |
| Exame final, refresh no meio da parte 1 | Volta à abertura da parte 1 ("Começar"), não à prova inteira (QA-003 resolvido em grande parte; perde até 5 respostas da parte) |
| Certificado | Nome em branco (não usa o nome da conta); download `certificado-hebraico-fluente-mae-d-agua-jose.png`; com nome vazio baixa `…-aluno.png` sem pedir nome (UXQA-008) |

---

## Achados

ID: UXQA-001 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/loading.tsx + export estático (app/out/index.html contém `<div hidden id="S:0">`)
Problema: sem JavaScript, toda página pública (capa, curso, checkout, entrar, criar conta, FAQ, suporte) mostra só
cabeçalho, rodapé e três retângulos de esqueleto. O conteúdo está no HTML, mas dentro do `div hidden` do streaming do
Next, que só o JS revela.
Evidência: nojs.mjs com `javaScriptEnabled:false`: body.innerText = 975 caracteres em todas as 8 rotas (com JS: capa
10.611); captura `F/nojs_.png` mostra só os blocos cinza. A auditoria de 28/09 registrou "landing 14 k caracteres sem
JS" como PASS, provavelmente medindo textContent.
Por que importa / Impacto: quem tem JS bloqueado (extensão, navegador corporativo, leitor antigo) vê uma página vazia
sem nenhum aviso; robôs que não executam JS (prévias, buscadores de IA) leem esqueleto. Não há `<noscript>`.
Correção sugerida: tirar o `loading.tsx` raiz (ou movê-lo só para as rotas da plataforma, que já dependem de JS) para
que o export entregue o HTML visível nas rotas públicas; no mínimo, um `<noscript>` dizendo que o site precisa de
JavaScript. Regressão: incluir em `varrer-site`/`capa.mjs` uma passada com JS desligado exigindo o h1 visível.
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (mexe no comportamento de carregamento de todas as rotas)

ID: UXQA-002 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/licao/[letterId]/LessonClient.tsx (tela de resultado da fixação) + app/src/app/meu-hebraico/DashboardClient.tsx (cartão "Continuar aprendendo")
Problema: com fixação abaixo de 80%, a tela de resultado oferece "Concluir e continuar · Em seguida: letra Mem", e o
painel oferece "Começar a lição · letra Mem". Os dois levam a "A letra מ ainda não abriu… esta letra abre a partir de 80%".
Evidência: fix.mjs (Álef a 50%): botões "Refazer o teste" e "Concluir e continuar", rodapé "Em seguida: letra Mem";
cta.mjs: os dois caminhos terminam em /licao/mem/ com o cartão de trancado. Painel ao mesmo tempo: "1 lição concluída · 0 letras dominadas".
Por que importa / Impacto: o aluno faz o que o botão manda e bate numa porta; parece defeito, e é o momento mais
sensível do curso (primeira letra). Persona E desiste aqui.
Correção sugerida: quando a nota fica abaixo do portão, o botão principal vira "Refazer a fixação (precisa de 80%)" e
"Em seguida" some; o painel aponta "Terminar Álef" em vez de "Começar Mem". Teste no `portao.mjs`.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: UXQA-003 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/faq/page.tsx ("Meu progresso fica salvo?") x LessonClient.tsx (etapa e posição só em estado React)
Problema: a FAQ promete "a plataforma volta exatamente na lição e na questão em que você parou". Na prática, recarregar
(ou a aba ser descartada pelo celular) no meio da Prática volta para a etapa Conhecer e a Prática recomeça em 1/14; o
botão Voltar do navegador sai da lição (as etapas não são entradas de histórico).
Evidência: bordas.mjs e estresse.mjs: "ANTES RELOAD: Praticar 4 / 14" → "DEPOIS RELOAD: א Álef (mudo)… QUANDO TERMINAR
ESTA AULA" (etapa 1); goBack na lição → /mapa/.
Por que importa / Impacto: promessa escrita que o produto não cumpre (o CDC trata a oferta como vinculante); no
celular o sistema descarta abas em segundo plano o tempo todo, então persona F perde até 14 respostas com frequência.
Correção sugerida: guardar `{letra, etapa, índice, respostas}` em sessionStorage como o exame já faz
(FinalChallengeClient.tsx:44-64) e abrir na etapa pendente; ou, mais barato, reescrever a FAQ para "volta na lição e
na etapa" e ao menos abrir na primeira etapa não concluída.
Complexidade: Média (retomar) / Mínima (texto) | Claude corrige sozinho?: Sim

ID: UXQA-004 | Prioridade: P2 | Confiança: CONFIRMADO
Local: worker/src/gate.js:125 (302 para /cursos/alfabetizacao/) + app/src/app/cursos/[slug]/CourseClient.tsx (bloco "Esta conta ainda não tem o curso")
Problema: aluno com acesso VENCIDO é mandado à página de vendas com "Esta conta ainda não tem o curso… Já pagou e
continua vendo esta tela? Não pague de novo. Escreva para…". Não existe texto de "seu acesso terminou em X, renove".
O checkout também não diz "renovação".
Evidência: vencido.mjs (expires_at da conta 27 posto em ontem e restaurado): /meu-hebraico e /licao/alef → bloco acima;
grep por "venceu|expirou|acesso terminou" em app/src: nada fora de e-mail e admin.
Por que importa / Impacto: a instrução é o contrário do que a pessoa precisa (ela precisa pagar de novo para renovar)
e gera e-mails ao suporte daqui a 12 meses; parece que o curso "sumiu".
Correção sugerida: `/api/me` já devolve o direito vencido (ou dá para devolver `expiredAt`); com ele, o bloco diz "Seu
acesso terminou em dd/mm. Seu progresso está guardado. Renovar" e o checkout mostra "Renovar por 12 meses".
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (texto comercial e regra de renovação)

ID: UXQA-005 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/app/concluido/CompletionClient.tsx:23,52,59; app/src/app/checkpoint/[n]/* ("Você já domina"); app/src/app/loja/LojaClient.tsx:144-150; lib/state/rules.ts:227 (MASTERY_MARK 0.75) e lib/engine/exercises.ts:783 (fixação com 10 itens)
Problema: "concluída" e "dominada" aparecem trocadas e com números diferentes em cada tela:
- checkpoint 1: "VOCÊ JÁ DOMINA ✓ Álef" com Álef a 50% (conta concluída, rotula domínio);
- /concluido: "1 / 22 letras dominadas" (conta `isLessonComplete`) e "Conquistas 0 de 11" (fixo no código; /conquistas diz "0 de 17", ACHIEVEMENTS tem 18 ids);
- /certificado: "0 de 22 concluídas" (conta domínio, rotula conclusão);
- loja: "Dominar uma letra é… acertar pelo menos 6 de 8 na fixação" (a fixação tem 10 itens; a régua é 75%, ou seja 8 de 10, e a próxima letra só abre com 80%);
- exame: "Faltam 22 letras" com 1 lição concluída.
Evidência: bordas.mjs, pratica.mjs, cert.mjs (saídas citadas acima); grep "6 de 8" e "de 11".
Por que importa / Impacto: o aluno não consegue saber o que falta para o exame e o certificado; números que se
contradizem minam a confiança no produto inteiro.
Correção sugerida: um só vocabulário ("concluída" = 5 etapas; "dominada" = 80% na fixação, alinhando com o portão),
`lettersMastered` em /concluido e no checkpoint, "de {ACHIEVEMENTS.length}" em vez de 11, e o texto da loja derivado
das constantes ("8 de 10"). Teste que procure "6 de 8" no export.
Complexidade: Pequena | Claude corrige sozinho?: Sim (o número da régua: Revisar antes com o dono/PED)

ID: UXQA-006 | Prioridade: P2 | Confiança: CONFIRMADO
Local: worker/src/lib/aparelhos.js (4ª entrada derruba a mais antiga) + worker/src/api/auth.js:507-519 (logout sobe session_version e apaga TODOS os aparelhos) + app/src/app/perfil/PerfilClient.tsx:217-244 (texto da confirmação de sair) + gate.js:116-121
Problema: (a) o aparelho derrubado pelo limite de 3 cai em /entrar sem nenhuma explicação; (b) "Sair" num aparelho
desconecta também o celular e o tablet, e a confirmação ("Você vai precisar do e-mail e da senha para voltar…") não diz
isso; (c) não existe lista de aparelhos no perfil. A FAQ explica o limite, mas ninguém a lê no momento em que é derrubado.
Evidência: conta.mjs: aparelho A + 3 logins → A em `/entrar/?next=%2Fmeu-hebraico%2F` com a tela padrão "Bem-vindo de
volta"; código do logout acima.
Por que importa / Impacto: persona E sai no computador da biblioteca e o celular pede senha no dia seguinte, sem saber
por quê; quem esqueceu a senha entra em "esqueci senha", que derruba tudo de novo. Gera suporte e sensação de conta invadida.
Correção sugerida: o portão manda `?motivo=outro-aparelho` / `?motivo=saiu` quando o cookie existe mas o aparelho ou a
versão não valem, e /entrar mostra uma linha explicando ("Sua conta foi aberta em outro aparelho; ela fica aberta em até
3"); a confirmação de sair diz "isto desconecta todos os seus aparelhos" (ou o logout passa a derrubar só o aparelho atual e
"sair de todos" vira opção).
Complexidade: Pequena | Claude corrige sozinho?: Revisar antes (decisão de segurança: logout global)

ID: UXQA-007 | Prioridade: P2 | Confiança: CONFIRMADO
Local: app/src/components/shell/Chrome.tsx (/perfil sem curso usa AppShell) + components/shell/PublicShell.tsx:145-146 ("Meu Hebraico" para qualquer logado) + gate.js:125 + CourseClient.tsx (ordem dos blocos)
Problema: quem tem conta e não tem curso (inclusive quem acabou de pagar por PIX e aguarda a confirmação) vê no
cabeçalho "Meu Hebraico" e, em /perfil, toda a navegação do aluno com "0 XP"; cada um desses links e qualquer link
profundo (/licao/alef, /mapa) volta à página de vendas, onde a primeira coisa a 390 px é o preço e "Desbloquear curso";
o aviso "Esta conta ainda não tem o curso… Não pague de novo" fica abaixo da caixa de preço.
Evidência: novo.mjs e capturas `F/novo_licao_alef_.png` (preço na dobra, aviso fora) e `F/novo_perfil_.png` (barra
inferior com 7 destinos).
Por que importa / Impacto: risco de pagamento duplicado e de suporte ("paguei e não abre"); laço de navegação sem saída.
Correção sugerida: com sessão sem direito, o gate redireciona com `?sem-acesso=1` e a página do curso mostra o aviso ACIMA
do preço; /perfil sem curso usa a casca pública (ou esconde a navegação de aluno); "Meu Hebraico" só para quem tem direito.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: UXQA-008 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/onboarding/page.tsx:47,127-133; app/src/app/certificado/CertificadoClient.tsx:61; app/src/app/meu-nome/MeuNomeClient.tsx:43
Problema: o nome é pedido três vezes (cadastro, onboarding passo 4, "Meu nome") e nunca reaproveitado: o onboarding
abre vazio e diz "Opcional. Fica só no seu navegador" (falso: o estado inteiro, `onboarding` incluído, sobe para
/api/progress e fica no D1); o certificado só lê `onboarding.name`, então quem pulou o passo vê o campo vazio e baixa
`certificado-hebraico-fluente-aluno.png` sem nenhum aviso de que falta o nome.
Evidência: onb-3.png; GET /api/progress da conta 27 devolve `onboarding {reason, goalMinutes, startingPoint, completedAt}`;
quem2.mjs: valor inicial "" e download "…-aluno.png" com nome vazio.
Por que importa / Impacto: atrito para persona E; afirmação de privacidade incorreta; certificado sem nome.
Correção sugerida: preencher onboarding, certificado e "Meu nome" com `account.name`; trocar o texto para "Fica na sua
conta"; pedir o nome antes de baixar o certificado.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: UXQA-009 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/onboarding/page.tsx:18-25 (REASONS)
Problema: a capa abre com "Ler as letras da Bíblia no original?" e o curso tem /biblia, leituras bônus e guia de nikud
bíblico, mas o onboarding não oferece motivo religioso/Bíblia (viajar, família, morar, idiomas, trabalho, outro).
Impacto: persona C escolhe "Outro motivo" e o tom das mensagens (que o motivo personaliza) não fala com ela.
Correção sugerida: acrescentar "Ler a Bíblia / textos religiosos" e usar o motivo para apontar /nikud-biblico mais cedo.
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (texto e tom das mensagens)

ID: UXQA-010 | Prioridade: P3 | Confiança: CONFIRMADO
Local: capa (Hero, "Quer viajar para Israel? … Você está no lugar certo") e /cursos/alfabetizacao (seção "O que você vai conseguir fazer")
Problema: nem a capa nem a página do curso dizem que o curso não ensina a falar ou a entender hebraico falado; isso só
aparece em /cursos (descrição do A1) e em /biblia. A FAQ da capa "O que acontece depois que termino?" cita o A1, sem dizer o porquê.
Impacto: persona B compra esperando se comunicar na viagem; risco de desistência no 7º dia e de propaganda lida como enganosa.
Correção sugerida: uma linha na página do curso e na FAQ da capa: "Este curso ensina a LER e escrever. Conversação começa
no A1." (o mesmo padrão honesto da /biblia).
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (texto comercial) | HANDOFF → COM

ID: UXQA-011 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/perfil/PerfilClient.tsx (formulário "Trocar a senha")
Problema: senha atual errada responde "E-mail ou senha não conferem." numa tela que não pede e-mail.
Evidência: conta.mjs "SENHA ATUAL ERRADA: … E-mail ou senha não conferem."
Correção sugerida: mapear `bad-credentials` nesse formulário para "A senha atual não confere."
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: UXQA-012 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/academia/AcademiaClient.tsx:435-465
Problema: "Digitar em hebraico" abre com "Este é o único exercício do curso que pede o teclado hebraico do seu aparelho.
Adicione uma vez…" e o guia de instalação por sistema; a saída "Usar o teclado da tela" só aparece no fim, embaixo do guia.
Impacto: personas E e F acham que precisam configurar o celular; o teclado da tela (que funciona: digitou "אא") foi feito
justamente para elas.
Correção sugerida: inverter a ordem: "Usar o teclado da tela" como botão principal no topo; guia de instalação como opção.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: UXQA-013 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/api/pay.js:242 (pedido vira `failed` quando a criação falha) + PerfilClient.tsx (Compras)
Problema: cada clique em "Pagar" que falha na criação (502, nada enviado à Mercado Pago) vira uma linha "NÃO CONCLUÍDO"
em Compras; duas tentativas = duas compras listadas.
Evidência: perfil da conta 27: "Alfabetização em Hebraico · Cartão · R$ 147 · NÃO CONCLUÍDO" e "· PIX · R$ 132,30 · NÃO
CONCLUÍDO"; D1: 2 orders `failed`.
Impacto: quem leu "nada foi cobrado" vê duas "compras" e escreve ao suporte.
Correção sugerida: não listar pedidos `failed` sem `provider_id` (ou agrupar como "tentativa não concluída, nada cobrado").
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (PAY)

ID: UXQA-014 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/components/shell/AppShell.tsx:474 (toast "Conquista desbloqueada") + BotaoAcessibilidade (flutuante)
Problema: o toast de conquista aparece no pé da tela por cima do teclado hebraico da tela (fileira das finais), e o botão
flutuante de acessibilidade cobre as teclas de nikud da direita. Continuação de UX-018/UX-017.
Evidência: captura `F/teclado-virtual.png` (390 px).
Correção sugerida: toast no topo quando há teclado na tela (ou acima dele); reservar espaço para o botão flutuante no teclado.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: UXQA-015 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/concluido/CompletionClient.tsx (sem trava)
Problema: /concluido abre para qualquer aluno, a qualquer momento, com "Você está lendo hebraico. Há algumas semanas isto
era um conjunto de símbolos." e "O que você sabe fazer agora ✓ Reconhecer as 22 letras…" com 1 lição feita.
Evidência: bordas.mjs "/concluido … 1 / 22 letras dominadas … ✓ Reconhecer as 22 letras".
Impacto: baixo (só por URL ou pelo link do exame/certificado), mas é texto que afirma o que não aconteceu.
Correção sugerida: abaixo de 22 concluídas, mostrar o "onde você está" sem a lista de competências e sem "há algumas semanas".
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: UXQA-016 | Prioridade: P3 | Confiança: CONFIRMADO
Local: app/src/app/faq/page.tsx ("O que não está incluído", "Ficou alguma pergunta… mesmo dia útil") x app/src/app/suporte/page.tsx ("Dúvida sobre o curso em si… escreva", "até 2 dias úteis")
Problema: a FAQ diz que o suporte é "para acesso, pagamento e conta"; /suporte convida a escrever dúvidas do curso. A FAQ
promete "mesmo dia útil", o suporte e o rodapé "até 2 dias úteis". Dentro da plataforma não há canal para dúvida de
conteúdo ("Achei um erro" foi desligado por decisão do dono, CLAUDE.md:657).
Impacto: persona A com dúvida sobre uma letra não sabe se pode perguntar.
Correção sugerida: decidir e dizer uma coisa só (ex.: "dúvidas de conteúdo também, respondidas em até 2 dias úteis").
Complexidade: Mínima | Claude corrige sozinho?: Revisar antes (decisão do dono)

ID: UXQA-017 | Prioridade: P4 | Confiança: CONFIRMADO
Local: rotas dinâmicas pagas que dão 404 para aluno (/licao/<inexistente>, /som/<inexistente>)
Problema: pageerror "Minified React error #418" (hidratação) ao abrir a 404 dentro das rotas da plataforma; a tela final está certa.
Evidência: h418.mjs: visitante ok em todas; aluno: /licao/nao-existe e /som/xyz com #418.
Correção sugerida: servir a 404 sem a casca do aluno ou alinhar o HTML do 404.html com o que o cliente renderiza.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: UXQA-018 | Prioridade: P4 | Confiança: CONFIRMADO
Local: provedor de conta (GET /api/me) e de progresso nas páginas públicas
Problema: 2 erros "401 (Unauthorized)" no console em toda página pública para visitante (QA-005/UX-023 continuam).
Evidência: pub.mjs: 22 rotas x 2 larguras, sempre `CE 401 | CE 401`.
Correção sugerida: /api/me responde 200 `{signedIn:false}`; não buscar progresso sem sessão.
Complexidade: Pequena | Claude corrige sozinho?: Sim

ID: UXQA-019 | Prioridade: P4 | Confiança: CONFIRMADO
Local: app/src/app/perfil/PerfilClient.tsx:619-623
Problema: a desistência afirma "A confirmação é enviada para {email}" sem saber se o envio saiu (QA-006 continua, com outra redação).
Correção sugerida: frasear como intenção ("vamos confirmar por e-mail") ou condicionar à resposta do Worker.
Complexidade: Mínima | Claude corrige sozinho?: Sim

ID: UXQA-020 | Prioridade: P3 | Confiança: CONFIRMADO
Local: worker/src/api/content.js (GET /api/content, `Cache-Control: no-store`)
Problema: o conteúdo pago inteiro (296 KB, 79 KB gzip) é baixado a cada carga dura de qualquer rota da plataforma; em
rede lenta (CDP 400 ms / 400 kbit/s) a lição fica ~10-15 s no esqueleto.
Evidência: curl com sessão: 296.300 bytes / 78.877 gzip; lento.mjs: conteúdo da /licao/mem só aparece entre 5 e 10 s após `load` (que levou 9,6 s).
Impacto: persona F com 3G/4G fraco espera a cada abertura.
Correção sugerida: cache em memória/sessionStorage por sessão (a marca por aluno já identifica a cópia) ou `private, max-age` curto com ETag.
Complexidade: Média | Claude corrige sozinho?: Revisar antes (há proteção de conteúdo e marca d'água envolvidas, SEC)

ID: UXQA-021 | Prioridade: P4 | Confiança: CONFIRMADO
Local: app/content/biblia.json (página pública /biblia, Gênesis 1:1)
Problema: duas palavras do versículo de demonstração (אֵת `he-75751a4d`, וְאֵת `he-2b2c41bf`) apontam para áudios que não
existem em app/out/audio (539 arquivos, todos os outros 539 ids do manifesto existem). O botão é escondido, então não quebra, mas a demonstração fica incompleta.
Correção sugerida: gravar os dois clipes (onda do painel) ou tirar o `audioId`.
Complexidade: Mínima | Claude corrige sozinho?: Não (gravação) | HANDOFF → PED

ID: UXQA-022 | Prioridade: P3 | Confiança: CONFIRMADO (comportamento) / decisão de produto
Local: app/src/app/onboarding/page.tsx:3-9 + portão de 80% (LessonClient.tsx:778+)
Problema: persona D ("Já consigo ler um pouco") ouve "todo mundo começa pela primeira letra" e precisa de 80% em cada
uma das 27 fixações, em ordem, sem teste de nivelamento nem "já sei esta letra".
Impacto: risco de abandono/desistência no prazo de 7 dias por quem já lê algo.
Correção sugerida: um "teste de entrada" opcional por módulo que, com 80%, marque as letras como concluídas (sem contar domínio), ou deixar a fixação acessível antes das etapas 1-4. Decisão do dono.
Complexidade: Média | Claude corrige sozinho?: Revisar antes | HANDOFF → PED

---

## PARTE 2 - Inventário funcional

Legenda de estado: OK = testado e funciona; OK* = funciona com ressalva (achado citado); NT = não testado aqui.

| Funcionalidade | Esperado | Implementação | Bordas / erro | Celular | Estado |
|---|---|---|---|---|---|
| Navegação pública (cabeçalho, ☰, âncoras /#decisoes /#duvidas) | Levar às seções | components/shell/PublicShell.tsx | Escape fecha o ☰ (UX-004 resolvido, PublicShell.tsx:61-67) | ☰ a 390 | OK |
| Navegação do aluno (sidebar, barra inferior 7 destinos, presente, XP, inicial) | Destinos do dia | components/shell/AppShell.tsx:55-90 | Aparece para quem não tem curso em /perfil | 360 sem rolagem | OK* (UXQA-007) |
| CTAs de compra (capa, curso, /cursos, rodapé) | Ir ao checkout | landing/*, cursos/* | Aluno com curso vê "Já é seu" (auditoria 28/09) | sim | OK |
| Teste grátis da capa (Álef em 5 passos, "Ouça e descubra", "Fale e seja corrigido") | Amostra sem cadastro | components/landing/* | Áudio /amostra-audio/shin.mp3 200; reconhecimento de fala depende do navegador | sim | OK (fala: NT, sem microfone) |
| FAQ sanfona | Abrir/fechar | `<details>` nativo em faq/page.tsx | Sem JS: invisível (esqueleto) | sim | OK* (UXQA-001) |
| Cadastro | Conta + cookie | AuthForm.tsx → POST /api/auth/signup | Vazio: "Esse e-mail não parece válido"; senha curta; sem termos: mensagem própria; nome opcional | sim | OK |
| Login / logout | Entrar / sair | auth.js login/logout | Senha errada com mensagem; `next` malicioso ignorado; logout derruba todos os aparelhos | sim | OK* (UXQA-006) |
| Limite de 3 aparelhos | Derrubar o mais antigo | lib/aparelhos.js | Sem explicação na tela | sim | OK* (UXQA-006) |
| Esqueci / nova senha | Link de 1 h, uso único | EsqueciSenha.tsx, auth.js forgot/reset | Resposta neutra; reuso recusado; entra direto após salvar | sim | OK |
| Trocar senha | Derruba outros aparelhos | PerfilClient.tsx | Mensagem errada para senha atual errada | sim | OK* (UXQA-011) |
| Confirmar e-mail | Só com a sessão da conta | ConfirmarEmail.tsx, auth.js verify | Deslogado, token ruim, já confirmado: textos claros. Reenvio para .invalid: "Alguma coisa quebrou" (artefato de teste) | sim | OK (envio real: NT) |
| Apagar conta | Senha + APAGAR | PerfilClient.tsx ApagarConta, auth.js | /conta-apagada explica retenção | sim | OK |
| Aviso do A1 (novidades) | Opt-in | PerfilClient.tsx + /api/novidades | Marcou sem erro; sem confirmação visível | sim | OK |
| Checkout (2 passos, PIX/cartão) | Criar cobrança | checkout/[slug]/CheckoutClient.tsx, api/pay.js | Sem credencial: 502 com texto digno; pedidos `failed` aparecem em Compras | sim | OK* (UXQA-013); pagamento real NT |
| Acesso pago (gate) | 302 sem sessão/sem curso | worker/src/gate.js | Vencido recebe texto de "ainda não tem" | - | OK* (UXQA-004) |
| Onboarding (4 passos) | Motivo, meta, nível, nome | app/onboarding/page.tsx | Volta funciona; nome repetido; sem motivo Bíblia | sim | OK* (UXQA-008, 009) |
| Aula 0 | 14 partes por botão + checagens | app/inicio/* | "Abrir todas as partes" ok | sim | OK |
| Lição (5 etapas) | Conhecer → Fixação | app/licao/[letterId]/LessonClient.tsx | Abas trancadas; refresh/back perdem posição; resultado <80% manda para letra trancada | sim | OK* (UXQA-002, 003) |
| Exercícios: escolha, intrusa, cursiva×impressa, montar sílaba (nikud), escrever transliteração, ligar pares, mesmo som | Corrigir na hora com explicação | components/learn/ExercisePlayer.tsx, Answers.tsx, engine/exercises.ts | Teclas 1-5 e Enter; feedback em aria-live | sim | OK |
| Traçado (escrever com o dedo) | Avaliar o traço, não bloquear | components/learn (Tracer) | "Continuar para a prática" disponível sem traçar (FAQ promete) | toque | OK |
| Áudio (letra, sílaba, 0,7×) | Tocar gravação | components/learn/AudioButton.tsx | 404: mensagem em role=status; ids sem gravação escondem o botão | sim | OK |
| Gravar e comparar / Fale e seja corrigido | Gravar no aparelho; fala via navegador | CompararPronuncia, FalarECorrigir | Sem microfone: texto próprio (auditoria 28/09) | NT | NT (sem microfone) |
| Teclado hebraico virtual | Escrever no cursor | components/learn/TecladoHebraico.tsx | Digitou "אא"; coberto por toast e botão flutuante | sim | OK* (UXQA-012, 014) |
| Revisão rápida | 5 questões do que pesou | app/revisao/ReviewClient.tsx | Estado vazio explica | sim | OK |
| Checkpoints | 12 questões, 70% | app/checkpoint/[n]/* | "Fazer mesmo assim"; rótulo "domina" errado; /checkpoint/99 → 404 | sim | OK* (UXQA-005) |
| Vocabulário | Palavras das letras concluídas | app/vocabulario/VocabularioClient.tsx | Vazio explica; "Ouvir {translit}" (UX-011 resolvido) | sim | OK |
| Jogos da academia (Caça, Batalha, Impressa×cursiva, Match, Blast, Teste) + modos por assunto | Jogar com letras já vistas | components/game/*, app/academia | Sem material: "Siga mais uma lição e volte"; células com nome da letra (UX-005 resolvido) | toque | OK |
| Progresso, sequência, folgas | Sincronizar, folga cobre dia perdido | lib/state/*, /api/progress | 409 tratado; servidor aceita estado forjado (QA-002 continua) | - | OK (folga em dia real: NT) |
| Loja (XP) | Saldo, folga, carta, nome decorado, leituras bônus | app/loja/LojaClient.tsx, lib/loja.ts | Saldo insuficiente desliga botão; texto "6 de 8" errado | sim | OK* (UXQA-005) |
| Nome decorado (download) | PNG com o nome | lib/nome-decorado.ts | "Meu nome" funciona (Moshe → מושה); compra e download NT (xp forjado não chegou a ser gasto) | sim | NT |
| Exame final | 45 questões, 10 partes | app/desafio-final, engine/exam.ts | Trancado com explicação; refresh volta à parte | sim | OK |
| Certificado | PNG quadrado/paisagem, compartilhar | app/certificado, lib/certificate.ts | Nome vazio; arquivo `certificado-hebraico-fluente-<slug>.png` | sim | OK* (UXQA-008) |
| /concluido | Fecho do curso | app/concluido/CompletionClient.tsx | Abre antes da hora com afirmações falsas | sim | OK* (UXQA-015) |
| Leituras bônus e guia de nikud | Ler após troca | app/bonus, app/nikud-biblico | ?l= inválido tratado | sim | OK |
| Depoimento | Enviar com autorização | app/depoimento/DepoimentoClient.tsx | Mínimo 20 caracteres com contador; "Recebido" | sim | OK |
| Novidades / sair da lista | Opt-in e descadastro | /sair-da-lista | NT ponta a ponta (sem e-mail de campanha) | - | NT |
| Controles de acessibilidade | Tamanho, contraste, voz, foco | components/shell/BotaoAcessibilidade.tsx | Foco vai ao 1º controle (UX-003 resolvido, linha 116) | sim | OK (não re-medido) |
| Suporte | E-mail, WhatsApp, atalhos | app/suporte/page.tsx | Texto diverge da FAQ | sim | OK* (UXQA-016) |
| Sessão expirada / API fora / armazenamento ruim | Avisar e não perder | AppShell avisos, SessaoCaiu, store | Todos tratados | sim | OK |

### Varredura de código e do export

| Verificação | Resultado |
|---|---|
| TODO/FIXME/XXX/HACK em app/src, worker/src, data, scripts, tools | Nenhum marcador real (só "TODO" como palavra em comentários e "R$ XXX" citado num comentário de Fecho.tsx:9) |
| `href="#"` e links vazios | 0 em app/src |
| Lorem/placeholder/e-mail de exemplo | 0 |
| console.log em app/src | 0. Em app/out/_next: só 2 internos do Next ("SERVER ACTION APPLY FAILED", "REFRESH FAILED"). worker: 1 log operacional em reconcile.js:54 (aceitável) |
| `debugger;`, sourcemaps publicados | 0 |
| localhost no export | só dentro de polyfills do Next |
| Assets locais (links.mjs): 114 HTML, 4.238 href e 1.694 src/srcset/poster locais | 0 ausentes |
| Links internos para rotas | 0 quebrados (rotas dinâmicas e /api/* tratadas pelo Worker) |
| Áudio: manifesto x app/out/audio | 539 = 539; 2 ids de app/content/biblia.json sem arquivo (UXQA-021) |
| Marcação crua `{{ }}` visível | 0 em /cursos/alfabetizacao, /mapa, /modulo/5, /modulo/7, /inicio, /som/*, /extra/* (UX-001 resolvido). Aparece só no payload RSC, que o `<Prose>` converte |
| Dados de teste em produção | Nenhum no código; contas e pedidos de teste só no D1 local |
| Rotas mortas | /amostra-audio/ responde 404 como página (é pasta de assets, correto); "Achei um erro" removido por decisão (rotas 404 testadas pelo projeto) |
| Funcionalidade inacabada visível | A1/A2/B1 "Em breve" (decisão comercial, coerente em /cursos e perfil) |

---

## (1) Auditoria de 28/09 na minha área: estado atual

A-qa.md:
- QA-001 (404 vira login): RESOLVIDO. /nao-existe-xyz e /checkout/xyz dão a página "Esta página não existe" para visitante, sem curso e aluno. Resta o #418 em 404 de rota paga (UXQA-017).
- QA-002 (certificado/XP/estado só no cliente): CONTINUA. PUT aceitou 22 lições, exame aprovado e xp 1000 forjados (GET confirma); certificado gerado. Decisão de produto documentada (certificado "não oficial").
- QA-003 (refresh perde o exame): RESOLVIDO EM GRANDE PARTE. Retoma na parte (perde até 5 respostas da parte em curso).
- QA-004 (sessão morta silenciosa): RESOLVIDO. Faixa "Sua sessão terminou… Entrar de novo".
- QA-005 (ruído 401/403 no console): CONTINUA (UXQA-018).
- QA-006 (afirma confirmação por e-mail da desistência): CONTINUA com nova redação (UXQA-019).
- PASSes de 28/09 reconferidos hoje: cadastro, login, esqueci senha (agora com link real ponta a ponta), apagar conta, checkout 502, links do export, mobile 360. Todos continuam.

F-ux.md:
- UX-001 (`{{}}` na página de vendas): RESOLVIDO.
- UX-002 (foco cai no body): RESOLVIDO no código (LessonClient.tsx:137 foca a etapa atual); não re-medido em todos os jogos.
- UX-003 (diálogo de acessibilidade sem foco): RESOLVIDO no código (BotaoAcessibilidade.tsx:116).
- UX-004 (☰ sem Escape): RESOLVIDO (PublicShell.tsx:61-67).
- UX-005 (Caça à letra "letra" x12): RESOLVIDO (CacaLetra.tsx:217 com nome da letra).
- UX-006 (teal em texto): RESOLVIDO por token (`--teal-ink` para texto, tokens.css:63-67); não re-medido.
- UX-007 (dica 1-4 na sidebar): RESOLVIDO (texto removido).
- UX-008 (`--ink-muted`): RESOLVIDO (#5F6A66).
- UX-009 ("Em breve" 2,1:1): RESOLVIDO no token (comentário: texto informativo usa `--ink-muted`); não re-medido.
- UX-010 (reflow do teclado-hebraico): sem rolagem a 360 px; 320 px NÃO re-medido.
- UX-011 (32 "Ouvir"): RESOLVIDO.
- UX-012 (falha de áudio engolida): RESOLVIDO.
- UX-013/014 (jogos sem heading, atalhos prometidos): PARCIAL; a promessa saiu (UX-014 resolvido), keydown continua só no Blast.
- UX-016 (aria-invalid no login): PARCIAL; só para o erro de termos (AuthForm.tsx:124-125), não para senha errada.
- UX-017/UX-018 (botão flutuante e toast cobrindo conteúdo): CONTINUAM, agora também sobre o teclado da tela (UXQA-014).
- UX-019 (skip link alvo não focável): RESOLVIDO (layout.tsx:143 tabIndex -1).
- UX-020 (polling no checkout antes do pedido): CONTINUA no código (CheckoutClient.tsx:141), sem impacto visível.
- UX-021/022: sem mudança relevante.
- UX-023 (401 em toda página pública): CONTINUA (UXQA-018).
- "Sem JavaScript: PASS": NÃO CONFERE hoje (UXQA-001).

## (2) Nota da área: 76/100

O núcleo funciona e é robusto: nenhum link ou asset quebrado no export, nenhum código de depuração, estados de erro
(sessão, API, áudio, armazenamento) tratados com texto claro, recuperação de senha e exclusão de conta exemplares,
redirecionamentos maliciosos neutralizados. Nada P0/P1.

O que impede subir com tranquilidade (P2): a FAQ promete retomar "na questão" e o produto volta ao começo da lição
(UXQA-003); o botão do resultado e o painel mandam para uma letra trancada (UXQA-002); concluída/dominada se contradizem
em cinco telas (UXQA-005); quem tem conta sem curso, ou com curso vencido, recebe instruções erradas na página de vendas
(UXQA-004, UXQA-007); sessão derrubada por aparelho ou por "Sair" em outro lugar sem explicação (UXQA-006); e as
páginas públicas sem JS são esqueleto (UXQA-001). Todos são de complexidade Mínima a Pequena, exceto a retomada
dentro da etapa.

## (3) Os 5 maiores problemas

UX (jornada):
1. UXQA-002: "Concluir e continuar → letra Mem" e "Começar a lição" do painel levam a uma letra trancada quando a fixação fica abaixo de 80%.
2. UXQA-005: concluída x dominada inconsistente (checkpoint "já domina" a 50%, /concluido conta errado e diz "de 11", loja diz "6 de 8" quando é 8 de 10).
3. UXQA-006: aparelho derrubado (limite de 3) e "Sair" que desconecta todos os aparelhos, sem nenhuma explicação na tela de login.
4. UXQA-007: conta sem curso vê a navegação do aluno e cai sempre na página de vendas com o preço antes do aviso "não pague de novo".
5. UXQA-010: capa vende viagem a Israel sem dizer que o curso não ensina a falar (persona B).

Funcionais:
1. UXQA-003: refresh/aba descartada/voltar no meio da lição perdem a etapa e a posição, contra a promessa escrita da FAQ.
2. UXQA-001: sem JavaScript as páginas públicas mostram só esqueleto (conteúdo preso em `div hidden` do streaming).
3. UXQA-004: acesso vencido recebe o texto de "ainda não tem o curso / não pague de novo" e nenhum caminho de renovação.
4. UXQA-008: nome nunca reaproveitado (onboarding vazio com "fica só no seu navegador", falso; certificado baixa sem nome como "aluno").
5. UXQA-013: tentativas de pagamento que falharam na criação aparecem como compras "NÃO CONCLUÍDO" no perfil.

## Não testado
- Tela de retorno da Mercado Pago, PIX pendente, liberação automática, recibo por e-mail (sem credencial; área PAY).
- E-mail de confirmação de cadastro chegando (endereços .invalid não recebem por design); campanha do A1 e /sair-da-lista ponta a ponta.
- Microfone (gravar/comparar, fala corrigida), Safari/iOS, Firefox, leitores de tela reais, zoom 320 px nas rotas novas.
- Compra e download do nome decorado (o "Meu nome" foi testado até a grafia).
- Uso real de uma folga (exige virar o dia).

## Handoffs
- HANDOFF → SEC: no emails.jsonl há um "Confirme seu e-mail" cuja saudação traz "Oi, Sua conta foi bloqueada. Regularize em https://pagamento-hebraico.example/pix" (nome do cadastro refletido no corpo do e-mail); parece teste de outro auditor, mas confirma que o nome entra sem filtro no texto do e-mail. Também UXQA-020 (cache do /api/content x proteção de conteúdo).
- HANDOFF → COM: UXQA-010 (o que o curso não ensina na capa) e UXQA-016 (prazo e escopo do suporte).
- HANDOFF → PED: UXQA-005 (régua de domínio 75% x portão 80% x texto "6 de 8"), UXQA-021 (dois áudios da /biblia), UXQA-022 (nivelamento para quem já lê).
- HANDOFF → PAY: UXQA-013 (pedidos `failed` sem cobrança listados em Compras), UXQA-004 (renovação depois do vencimento).

## Limpeza pedida (D1 local)
- Conta id 27 `f-ux-novo-1790814719783@example.invalid`: linha `entitlements` (order `F-UX-AUDIT`), 2 `orders` failed, `progress` forjado, linhas em `aparelhos`/`aceites`/`registros_acesso`.
- Conta id 31 `f-ux-dois-1790815380806@example.invalid`: apagada pela UI (o que a exclusão mantém, por lei, fica).
