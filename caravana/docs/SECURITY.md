# Segurança e privacidade

## Equipe (agências e plataforma)

- Senha com PBKDF2-SHA256, 600.000 iterações (OWASP), sal de 16 bytes; o número de
  iterações fica junto do hash, então subir no futuro não invalida senhas antigas.
- Nenhuma senha é definida por outra pessoa: a conta nasce sem senha e recebe um
  **link de uso único** (3 dias). O link volta na resposta da ação e aparece uma
  vez na tela; o banco guarda só o sha256. Usar o link derruba as sessões antigas.
- Sessão: token de 32 bytes no cookie `__Host-mcd_staff` (HttpOnly, Secure,
  SameSite=Lax, Path=/); o banco guarda o sha256. 7 dias; sair revoga.
- Login com e-mail inexistente gasta o mesmo PBKDF2 de um real; a mensagem é a
  mesma ("E-mail ou senha incorretos").
- Freio de login: 20 tentativas por endereço e 8 por e-mail a cada 15 minutos,
  decidido pela escrita atômica (`INSERT ... ON CONFLICT ... RETURNING`) **antes**
  de verificar a senha.
- Papéis: `viewer` lê; `editor` monta roteiro, conteúdo, informações e convites;
  `admin` também publica, despublica, arquiva e muda a identidade da agência.
  Conferidos no servidor em toda ação (`runAgency`); o formulário desabilitado é
  cortesia.
- Superadministração: `notFound()` para quem não é da plataforma.

## Viajantes

- **Convite pessoal**, não link público da caravana. Código de 12 caracteres
  (alfabeto Crockford, 60 bits). O banco guarda o HMAC (com o segredo do servidor) e
  uma cópia cifrada com AES-GCM, para a agência reenviar o link sem gerar outro. Um
  vazamento só do banco não entrega nem permite testar códigos fora do ar.
- Abrir o link (inclusive a pré-visualização automática do WhatsApp) só mostra o
  formulário; quem entra é o botão (POST). Isso evita gastar vaga de aparelho.
- Cada convite vale em até N aparelhos (padrão 3). Passou do limite, a agência
  libera. Revogar derruba os aparelhos conectados.
- Cookie do viajante preso ao caminho `/c/<slug>`: o de uma caravana não vale em outra.
- Respostas iguais para código inexistente, de outra caravana, revogado ou vencido.
- Freio: 10 tentativas por minuto e 40 por hora por endereço.
- O QR para material impresso leva à página de entrada, que pede o código: sozinho
  não dá acesso.
- Limite de vagas cobrado no banco (gatilho com trava), nunca só na tela.

## Demonstração

- Viajante de demonstração: acesso de 24 horas, um aparelho, apagado com o
  progresso depois; 20 entradas por hora por endereço.
- Painel de demonstração: sessão de 2 horas de um usuário sem senha, com papel
  `viewer` na agência `is_demo`. Toda escrita é recusada no servidor (o e2e força o
  envio de um formulário desabilitado e confere a recusa).

## Requisições

- Mutação só por Server Action (o Next confere a origem). Sem API aberta.
- Toda entrada validada com zod no servidor; `withScope` só aceita uuid.
- CSP com nonce por resposta e `strict-dynamic`; `frame-ancestors 'none'`,
  `object-src 'none'`, `form-action 'self'`. Mais `nosniff`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy` (câmera, microfone, localização e
  pagamento desligados) e HSTS em produção.
- Links de convite e de senha saem de `MCD_PUBLIC_URL`, nunca do cabeçalho Host.
- Áreas autenticadas: `Cache-Control: private, no-store` e `noindex`.

## Segredos

Nenhum no código. `MCD_SECRET` é obrigatório em produção (o servidor recusa subir
sem ele); em desenvolvimento há um valor local fixo, que nunca vale em produção.
Ver `.env.example`.

## LGPD: minimização

- Viajante: nenhum cadastro, e-mail, telefone ou documento. O convite pode ter só
  o **primeiro nome**, para a saudação, e é opcional.
- Endereços IP não são gravados: viram HMAC antes de entrar no freio.
- O painel da agência mostra só números agregados de engajamento; não há tela de
  progresso individual.
- Sem localização, sem câmera, sem rastreamento de terceiros; fontes servidas
  pela própria aplicação.
- Progresso da demonstração apagado em 24 horas.

Pendências para produção (ver docs/ROADMAP.md): política de privacidade e termos,
retenção e exclusão dos dados de viajante ao fim do contrato, canal do titular,
registro das operações de tratamento com cada agência (a agência é controladora
dos dados dos viajantes dela; a plataforma é operadora).
