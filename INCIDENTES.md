# Incidentes: o que fazer quando algo dá errado

Roteiro para vazamento de dados, invasão de conta, segredo exposto ou site
fora do ar. Escrito para ser seguido com pressa, na ordem. Criado em
28/09/2026 (auditoria, INFRA-011/LEGAL-008).

A regra que vale para tudo: **primeiro conter, depois entender, e anotar
tudo com data e hora** (num documento só seu, fora do repositório). A nota
é o que responde à ANPD, ao aluno e a você mesmo daqui a um mês.

---

## 1. Como você fica sabendo

| Sinal | De onde vem |
|---|---|
| E-mail "[Hebraico Fluente] problemas de pagamento na última hora" | a varredura de 5 em 5 min (`worker/src/alertas.js`) |
| Alerta do monitor externo (UptimeRobot): `"monitor":true` sumiu | site fora, banco fora ou varredura parada (`/api/health`) |
| E-mail "o backup diário do banco FALHOU" | Action "Backup do banco" |
| Aluno escrevendo "não consigo entrar", "fui cobrado e não liberou", "recebi e-mail estranho" | atendimento |
| Aviso da Cloudflare, do GitHub, da Mercado Pago ou da Resend sobre acesso suspeito | e-mail das contas |

Quando o sinal chega, anote: o que viu, quando viu, e o que já fez.

---

## 2. Qual é o caso

**A. Um segredo pode ter vazado** (token no print, no chat, num commit, num
computador perdido): vá para 3.
**B. Alguém pode ter entrado numa conta de aluno, ou no banco:** vá para 3 e 4.
**C. O site está fora do ar ou quebrado:** vá para 5.
**D. Pagamento liberando errado, ou não liberando:** vá para 6.

---

## 3. Conter: trocar os segredos

Troque SÓ o que pode ter vazado. Na dúvida sobre qual, troque todos: nenhum
deles apaga dado.

| Segredo | O que ele abre | Como trocar | Efeito da troca |
|---|---|---|---|
| `SESSION_SECRET` | assinar o login de qualquer conta | Cloudflare → Workers → `hebraico-fluente` → Settings → Variables and Secrets → editar (valor novo: `openssl rand -base64 48`). Ele vive SÓ no painel. | **todos os alunos saem** e entram de novo com a senha de sempre; nenhum progresso se perde |
| `CLOUDFLARE_API_TOKEN` | publicar o site, ler e ESCREVER o banco, mexer na zona | Cloudflare → My Profile → API Tokens → **Roll** (ou apagar e criar outro com as mesmas permissões) → colar no GitHub: Settings → Secrets and variables → Actions → `CLOUDFLARE_API_TOKEN` | nada para o aluno; a próxima publicação usa o novo |
| `MP_ACCESS_TOKEN` | criar cobranças, consultar e **estornar** pagamentos | Mercado Pago → Suas integrações → a aplicação → Credenciais de produção → renovar → colar no GitHub (`MP_ACCESS_TOKEN`) → publicar (Actions → Deploy → Run workflow) | nada para o aluno; entre a troca e a publicação o checkout falha |
| `MP_WEBHOOK_SECRET` | fingir um aviso da Mercado Pago | Mercado Pago → a aplicação → Webhooks → gerar nova assinatura → colar no GitHub → publicar | avisos antigos passam a ser recusados; a varredura cobre o intervalo |
| `RESEND_API_KEY` | mandar e-mail como o site | Resend → API Keys → apagar a antiga, criar nova → colar no GitHub → publicar | e-mails param até a publicação |
| Senha do Gmail do atendimento | a caixa com e-mails de alunos, e o login de administrador (`ADMIN_EMAILS`) | trocar a senha e revisar "Dispositivos" e "Apps com acesso" na conta Google | nenhum |
| Senha do GitHub / Cloudflare | tudo acima | trocar a senha, conferir a verificação em duas etapas, revisar sessões abertas | nenhum |

Depois de trocar os segredos do GitHub, publique (Actions → "Deploy platform
to Cloudflare" → Run workflow) para eles chegarem ao Worker.

Se o problema é UMA conta de aluno: Actions → Acesso → `consultar` para ver o
que ela tem; `revogar` fecha o acesso na hora. O aluno troca a própria senha
em "Esqueci minha senha", e isso derruba todas as outras sessões dele.

---

## 4. Preservar e entender

**Antes de qualquer limpeza, guarde a trilha.** O sistema apaga sozinho:
`access_log` com 180 dias, `registros_acesso` e o IP das desistências com
190 dias, e as cópias diárias com 90 dias.

1. Actions → "Backup do banco" → Run workflow → `copiar`. Anote o nome da
   cópia (`diario/hebraico-fluente-AAAAMMDD-HHMMSS.sql.gz`). Ela tem a trilha
   do jeito que estava.
2. Actions → Acesso → `pagamento` e `envios` mostram o que aconteceu com
   cobranças e e-mails.
3. Perguntas a responder, e anotar:
   - **o quê**: quais dados (e-mail? nome? hash de senha? progresso? pedidos?);
   - **de quem**: quantos alunos, e quais;
   - **quando**: desde quando o acesso indevido pode ter existido;
   - **como**: por onde entrou, e se a porta já está fechada.

O banco NÃO guarda CPF nem dado de cartão. Senha fica como hash PBKDF2.

---

## 5. Site fora do ar ou quebrado

1. A última publicação quebrou? Se a conferência pós-publicação falhou duas
   vezes, **o site já voltou sozinho** para a versão anterior (passo 10 do
   `scripts/cloudflare-setup.sh`). Se não voltou, à mão:
   `npx wrangler rollback` (escolhe a versão anterior) ou reverter o merge no
   GitHub e publicar.
2. O banco sumiu ou corrompeu? Recupere pela cópia:
   - Actions → "Backup do banco" → `ensaiar` prova que a cópia restaura;
   - para restaurar de verdade: baixar a cópia do R2, criar o banco e
     executar o `.sql` nele (o mesmo que `scripts/backup-nuvem.sh ensaiar` faz,
     com o nome de produção). Faça com calma, e com o site em manutenção.
   - Perde-se no máximo um dia (o que aconteceu depois da última cópia).
   - **As gravações do painel não estão na cópia.** A tabela `gravacoes`
     (os áudios de /admin/gravar) fica fora do backup desde 01/10/2026: cada
     áudio em hexadecimal passa do teto de 1 MB por comando do SQLite, e uma
     cópia com eles não restaurava em lugar nenhum. Depois da restauração a
     tabela volta vazia e o curso toca os arquivos `audio/<id>.mp3` do git,
     que é o mesmo som, já cortado e nivelado (o Worker serve do git sempre
     que não há linha no banco). Nada a fazer para o aluno. O que se perde é
     só a gravação feita DEPOIS da última exportação para o git: o resumo
     diário do backup lista esses ids ("ainda SEM arquivo em `audio/`"), e
     o job `exportar_gravacoes` do deploy-worker.yml (Run workflow, caixa
     marcada) leva do banco para um ramo e um PR. Rode-o depois de cada
     sessão de gravação, e a perda é zero.
3. Cloudflare fora: não há o que fazer além de esperar e avisar os alunos.

---

## 6. Pagamento errado

- **Liberou sem pagar:** Actions → Acesso → `revogar`, e procure o motivo
  (Acesso → `pagamento`, e o pedido com `pedido`).
- **Pagou e não liberou:** Acesso → `pedido` confere o pedido; `liberar` dá o
  acesso; a varredura normalmente resolve sozinha em 5 minutos.
- **Estorno automático falhou:** o lembrete diário lista; devolva pelo painel
  da Mercado Pago.

---

## 7. Comunicar

### À ANPD (Autoridade Nacional de Proteção de Dados)

Obrigatório quando o incidente **pode causar risco ou dano relevante** aos
alunos (LGPD, art. 48). Na prática: vazamento de e-mail com senha (mesmo em
hash), acesso de terceiro a contas, ou exposição de dados de muitos alunos.

- **Prazo: 3 dias úteis** a partir de quando você soube (Resolução CD/ANPD
  nº 15/2024). Confirme o prazo e o enquadramento com o advogado.
- **Onde:** formulário de comunicação de incidente no site da ANPD (gov.br/anpd).
- **O que dizer:** o que foi afetado, quantos titulares, quando começou e
  quando foi descoberto, o que foi feito para conter, os riscos, e o contato
  (o e-mail de privacidade de `data/empresa.json`).
- Pode comunicar com o que já sabe e complementar depois.

### Aos alunos afetados

No mesmo prazo, por e-mail, em português simples:
- o que aconteceu, e quando;
- quais dados deles;
- o que já foi feito;
- o que eles devem fazer (ex.: trocar a senha, se usam a mesma em outro lugar);
- como falar com você.

Não prometa o que não sabe ("nenhum dado foi acessado") antes de ter certeza.

---

## 8. Corrigir a causa e registrar

1. Corrija a causa (código, configuração, senha fraca, permissão demais).
2. Um teste que falhe se o problema voltar (`app/tests/auditoria.test.ts` é
   onde os ataques fechados moram).
3. Guarde a nota do incidente (o que, quando, quem, o que foi feito, o que
   foi comunicado) por pelo menos 5 anos, fora do repositório.

---

## 9. Mudança relevante nos Termos ou na Política de Privacidade

Não é incidente, mas tem prazo e pede o mesmo cuidado (auditoria de
01/10/2026, LEGAL-105). A Política de Privacidade (item 8) promete:
"Alteração relevante no tratamento dos seus dados é avisada por e-mail antes
de valer". Os Termos (art. 9) dizem que mudança que afete um acesso já
comprado não retroage.

**Relevante** é o que muda o que o aluno recebe, paga ou tem de fazer, ou o
que se faz com os dados dele: preço ou forma de pagamento para quem já
comprou, limite de uso (como os 3 aparelhos), dado novo coletado, operador
novo, prazo de guarda, regra de suspensão. Correção de texto, esclarecimento
e mudança só para compras futuras não são.

1. **Antes de publicar**, decida com o advogado se a mudança é relevante e se
   vale para quem já comprou. Se não puder valer para eles, a regra nova
   precisa distinguir as contas (pela data do pedido) no código.
2. **Liste quem tem direito ativo**, na sua máquina (o resultado tem e-mails:
   não cole em issue, PR nem resumo do Actions):
   ```
   npx wrangler d1 execute hebraico-fluente --remote --command \
     "SELECT a.email, e.expires_at FROM entitlements e JOIN accounts a ON a.id = e.account_id
      WHERE e.expires_at IS NULL OR e.expires_at > unixepoch()*1000"
   ```
3. **Mande um e-mail a cada um**, com pelo menos 15 dias de antecedência
   (prazo a confirmar com o advogado): o que muda, a partir de quando, o link
   da versão nova e da versão que valeu para a compra dele
   (`/termos/v/<código>/`, ver RUNBOOK-ATENDIMENTO.md) e o que ele pode fazer
   se não concordar. **Não existe rota de envio em massa no site**: a lista
   do aviso do próximo curso (`novidades`) é só para propaganda com
   consentimento e não serve para isto. Até existir uma ferramenta, o envio
   é pelo seu e-mail, em cópia oculta, ou um a um.
4. **Publique** a mudança na data anunciada. A versão nova nasce sozinha no
   build (`data/politicas-versoes/`); faça commit da cópia fixa.
5. Guarde a lista de destinatários e a data do envio fora do repositório,
   pelo mesmo prazo das notas de incidente.

Mudanças de 29 e 30/09/2026 (limite de 3 aparelhos, marca invisível, marca
d'água com parte do e-mail, estatísticas de aprendizagem) entraram para
todas as contas sem esse aviso. Se houve venda real antes de 29/09, ver
ANTES-DE-VENDER.md, item 9.

---

## Contatos

| Quem | Para quê |
|---|---|
| Cloudflare: dash.cloudflare.com → Support | Worker, banco, domínio |
| Mercado Pago: painel → Ajuda | cobranças, estornos, credenciais |
| Resend: resend.com → Support | e-mail |
| GitHub: github.com/contact | repositório, Actions |
| ANPD: gov.br/anpd | comunicação de incidente |
| Advogado | (preencher) |
| Contador | (preencher) |
