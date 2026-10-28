import type { Traducao } from '..';

/* app/perfil: PerfilClient.tsx, page.tsx e compras.ts */
const pt = {
  metaTitulo: 'Sua conta - Hebraico Fluente',
  metaDescricao: 'Seus dados, seus cursos, seu progresso e suas compras.',
  fraseDeVencido: (data: string) => `Seu acesso terminou em ${data}.`,

  titulo: 'Sua conta',
  subtitulo: 'Seus dados, seus cursos e o que você já fez.',
  dados: 'Dados',
  nome: 'Nome',
  email: 'E-mail',
  contaCriadaEm: 'Conta criada em',
  trocarEmailAntes: 'Para trocar o e-mail, escreva para',
  trocarEmailDepois:
    '. O e-mail é o que identifica a conta e o que recebe o link de recuperação, então trocá-lo ' +
    'sozinho pela tela é o caminho mais curto para perder a conta por um erro de digitação.',

  seusCursos: 'Seus cursos',
  acessoAte: (data: string, dias: number | null) =>
    `Acesso até ${data}${dias !== null ? ` · ${dias} ${dias === 1 ? 'dia' : 'dias'}` : ''}`,
  acessoEncerrado: 'Acesso encerrado',
  aindaNaoLancado: 'Ainda não lançado',
  naoEstaNaConta: 'Não está na sua conta',
  ativo: 'Ativo',
  renovar: (meses: number) => `Renovar por mais ${meses} meses`,
  emBreve: 'Em breve',
  verOCurso: 'Ver o curso',
  abrirBiblioteca: 'Abrir a Minha Biblioteca',

  seuProgresso: 'Seu progresso',
  letras: 'Letras',
  curso: 'Curso',
  sequencia: 'Sequência',
  conquistas: 'Conquistas',
  dias: (n: number) => `${n} d`,
  progressoDemo:
    'Estes números são deste aparelho. Nesta versão o progresso é guardado no navegador e não ' +
    'viaja com a conta.',
  progressoSemCurso:
    'Estes números são deste aparelho. O progresso passa a viajar com a conta quando você tiver ' +
    'um curso - e o que estiver aqui vai junto.',
  progressoNaConta:
    'Seu progresso fica na sua conta e é sincronizado entre os aparelhos: o que você fizer no ' +
    'celular aparece no computador. Uma cópia continua neste aparelho: o que você fizer com a ' +
    'conexão caída fica guardado e sobe quando ela voltar. Funciona em qualquer conexão; precisa ' +
    'de internet para abrir cada aula.',
  verConquistas: 'Ver conquistas',
  meuCertificado: 'Meu certificado',

  compras: 'Compras',
  carregando: 'Carregando…',
  nenhumaCompra: 'Nenhuma compra registrada nesta conta.',
  pix: 'PIX',
  cartao: 'Cartão',
  statusPago: 'Pago',
  statusAguardando: 'Aguardando',
  statusNaoConcluido: 'Não concluído',
  statusEstornado: 'Estornado',
  statusExpirado: 'Expirado',

  sair: 'Sair',
  sairTodosAparelhos:
    'Isto desconecta a sua conta em todos os aparelhos: no celular, no tablet e em qualquer ' +
    'computador onde ela estiver aberta.',
  sairProgresso:
    'Você vai precisar do e-mail e da senha para voltar. Seu progresso fica guardado na sua conta ' +
    'e volta assim que você entrar de novo, aqui ou em qualquer outro aparelho. Ele sai deste ' +
    'navegador para que ninguém que use este computador depois de você veja o que você estudou.',
  sairMesmoAssim: 'Sair mesmo assim',
  cancelar: 'Cancelar',
  sairDaConta: 'Sair da conta',
  semCursoAtivo: 'Você está logado, mas ainda não tem nenhum curso ativo.',
  verOsCursos: 'Ver os cursos',

  meusDados: 'Meus dados',
  meusDadosTexto:
    'Uma cópia, em arquivo, de tudo o que guardamos sobre a sua conta: cadastro, compras, ' +
    'aceites, registros de acesso e progresso. Por segurança, a senha e os identificadores de ' +
    'sessão não vão no arquivo.',
  baixarMeusDados: 'Baixar meus dados',

  apagarTitulo: 'Apagar minha conta',
  /* A palavra que a pessoa escreve para confirmar. Só a tela confere. */
  palavraApagar: 'APAGAR',
  escrevaParaConfirmar: (palavra: string) => `Escreva ${palavra} no campo acima para confirmar.`,
  semVolta: 'Isto não tem volta.',
  semVoltaResto:
    ' Somem o seu e-mail, o seu nome, a sua senha, todo o seu progresso e o seu acesso ao curso.',
  suaSenha: 'Sua senha',
  escreva: (palavra: string) => `Escreva ${palavra}`,
  cliqueSemQuerer: 'Para ter certeza de que não foi um clique sem querer.',
  apagando: 'Apagando…',
  apagarParaSempre: 'Apagar minha conta para sempre',
  apagarExplicacaoAntes:
    'Você pode apagar a sua conta e todos os seus dados aqui mesmo, sem precisar pedir a ' +
    'ninguém. É definitivo, e encerra também o acesso aos cursos comprados, ',
  semReembolso: 'sem reembolso',
  apagarExplicacaoMeio:
    ' - para receber o valor de volta dentro do prazo de desistência, use antes',
  desistirDaCompra: 'Desistir da compra',
  apagarExplicacaoFim: ', em Compras.',

  avisoTitulo: 'Aviso do próximo curso',
  avisoQuero: (curso: string) => `Quero receber um e-mail quando o ${curso} abrir.`,
  avisoNota:
    'Um aviso só, quando o curso abrir, e nada mais. Você sai quando quiser, desmarcando aqui ou ' +
    'pelo link que vai no próprio e-mail.',
  avisoErro: 'Não consegui salvar agora. Tente de novo em instantes.',

  senhaTitulo: 'Senha',
  senhasDiferentes: 'As duas senhas não são iguais.',
  senhaIgualAtual: 'A senha nova é igual à atual.',
  senhaAtualNaoConfere: 'A senha atual não confere.',
  senhaTrocada:
    'Senha trocada. Os outros aparelhos onde você estava logado foram desconectados - este continua.',
  senhaAtual: 'Senha atual',
  senhaNova: 'Senha nova',
  peloMenos: (n: number) => `Pelo menos ${n} caracteres.`,
  repitaSenhaNova: 'Repita a senha nova',
  trocando: 'Trocando…',
  trocarASenha: 'Trocar a senha',
  trocarSenhaExplicacao:
    'Trocar a senha desconecta os outros aparelhos. É o que você quer se achar que alguém entrou ' +
    'na sua conta.',

  emailNaoConfirmadoAntes: 'Seu e-mail ainda não foi confirmado. No cadastro mandamos um link para',
  emailNaoConfirmadoDepois:
    ' - abra esse e-mail com a conta aberta aqui, e pronto. Nada fica bloqueado enquanto isso.',
  linkEnviado: 'Link enviado. Ele vale por sete dias.',
  demonstracao: ' Demonstração: ',
  abrirOLink: 'abrir o link',
  enviando: 'Enviando…',
  mandarDeNovo: 'Mandar o link de novo',

  desistenciaPedidaEm: (quando: string) => `Desistência pedida em ${quando}.`,
  estornoAutomatico:
    'O estorno já foi pedido à Mercado Pago e o valor volta pela mesma forma de pagamento. O ' +
    'acesso fecha quando ela confirmar.',
  estornoManual: (dias: number) =>
    `O valor volta pela mesma forma de pagamento, em até ${dias} dias úteis.`,
  confirmaPorEmail: (email: string) =>
    `Vamos confirmar também por e-mail, em ${email}. Se a mensagem não chegar, esta linha, com a ` +
    'data e a hora, é o registro do seu pedido.',
  temCerteza: 'Tem certeza que quer desistir?',
  perdeAcesso: 'Ao desistir, você perde o acesso a:',
  perdeLicoes: (n: number) => `${n} lições, com o áudio do professor`,
  perdeExercicios: 'Os exercícios de escrita, leitura e revisão',
  perdeJogos: 'Os jogos de prática e o certificado de conclusão',
  jaDomina: (n: number, total: number) => `Até agora, você já domina ${n} de ${total} letras.`,
  motivoOpcional: 'Se quiser, conte o motivo: isso nos ajuda a melhorar o curso. É opcional.',
  prefiroNaoDizer: 'Prefiro não dizer',
  recebeAntes: 'Você recebe ',
  recebeForte: '100% do valor de volta',
  recebeDepois:
    ', sem precisar explicar o motivo, e o acesso ao curso é encerrado quando o reembolso for ' +
    'processado. Seu progresso fica guardado.',
  confirmarDesistencia: 'Confirmar desistência',
  voltar: 'Voltar',
  whatsappAntes:
    'Travou em alguma lição ou teve um problema técnico? Se preferir, fale antes com o professor',
  peloWhatsapp: 'pelo WhatsApp',
  whatsappDepois: '. Você pode desistir do mesmo jeito depois, dentro do prazo.',
  podeDesistirAte: (quando: string) => `Você pode desistir até ${quando}.`,

  verCodigoPix: 'Ver código PIX',
  pixValidoAte: (hora: string) =>
    `PIX copia e cola deste pedido, válido até as ${hora}. Se você já pagou, não pague de novo.`,
  copiado: 'Copiado ✓',
  copiarCodigo: 'Copiar código'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Your account - Hebraico Fluente',
  metaDescricao: 'Your details, your courses, your progress and your purchases.',
  fraseDeVencido: (data: string) => `Your access ended on ${data}.`,

  titulo: 'Your account',
  subtitulo: 'Your details, your courses and what you have done so far.',
  dados: 'Details',
  nome: 'Name',
  email: 'Email',
  contaCriadaEm: 'Account created on',
  trocarEmailAntes: 'To change your email, write to',
  trocarEmailDepois:
    '. Your email is what identifies the account and what receives the recovery link, so ' +
    'changing it yourself on screen is the shortest path to losing the account over a typo.',

  seusCursos: 'Your courses',
  acessoAte: (data: string, dias: number | null) =>
    `Access until ${data}${dias !== null ? ` · ${dias} ${dias === 1 ? 'day' : 'days'}` : ''}`,
  acessoEncerrado: 'Access ended',
  aindaNaoLancado: 'Not launched yet',
  naoEstaNaConta: 'Not in your account',
  ativo: 'Active',
  renovar: (meses: number) => `Renew for another ${meses} months`,
  emBreve: 'Coming soon',
  verOCurso: 'See the course',
  abrirBiblioteca: 'Open My Library',

  seuProgresso: 'Your progress',
  letras: 'Letters',
  curso: 'Course',
  sequencia: 'Streak',
  conquistas: 'Achievements',
  dias: (n: number) => `${n} d`,
  progressoDemo:
    'These numbers are from this device. In this version your progress is stored in the browser ' +
    'and does not travel with the account.',
  progressoSemCurso:
    'These numbers are from this device. Your progress starts traveling with the account once ' +
    'you have a course - and whatever is here comes along.',
  progressoNaConta:
    'Your progress is kept in your account and synced across devices: what you do on your phone ' +
    'shows up on your computer. A copy stays on this device: what you do while offline is saved ' +
    'and uploaded when the connection comes back. It works on any connection; you need internet ' +
    'to open each lesson.',
  verConquistas: 'See achievements',
  meuCertificado: 'My certificate',

  compras: 'Purchases',
  carregando: 'Loading…',
  nenhumaCompra: 'No purchases recorded on this account.',
  // etapa 5/6: Brasil, rever
  pix: 'PIX',
  cartao: 'Card',
  statusPago: 'Paid',
  statusAguardando: 'Pending',
  statusNaoConcluido: 'Not completed',
  statusEstornado: 'Refunded',
  statusExpirado: 'Expired',

  sair: 'Sign out',
  sairTodosAparelhos:
    'This signs your account out on every device: your phone, your tablet and any computer ' +
    'where it is open.',
  sairProgresso:
    'You will need your email and password to come back. Your progress is kept in your account ' +
    'and returns as soon as you sign in again, here or on any other device. It is removed from ' +
    'this browser so that nobody who uses this computer after you can see what you studied.',
  sairMesmoAssim: 'Sign out anyway',
  cancelar: 'Cancel',
  sairDaConta: 'Sign out of the account',
  semCursoAtivo: 'You are signed in, but you do not have an active course yet.',
  verOsCursos: 'See the courses',

  meusDados: 'My data',
  meusDadosTexto:
    'A copy, as a file, of everything we keep about your account: sign-up details, purchases, ' +
    'acceptances, access records and progress. For security, your password and session ' +
    'identifiers are not included in the file.',
  baixarMeusDados: 'Download my data',

  apagarTitulo: 'Delete my account',
  palavraApagar: 'DELETE',
  escrevaParaConfirmar: (palavra: string) => `Type ${palavra} in the field above to confirm.`,
  semVolta: 'This cannot be undone.',
  semVoltaResto:
    ' Your email, your name, your password, all your progress and your access to the course ' +
    'will be gone.',
  suaSenha: 'Your password',
  escreva: (palavra: string) => `Type ${palavra}`,
  cliqueSemQuerer: 'To make sure it was not an accidental click.',
  apagando: 'Deleting…',
  apagarParaSempre: 'Delete my account forever',
  // etapa 5/6: Brasil, rever
  apagarExplicacaoAntes:
    'You can delete your account and all your data right here, without having to ask anyone. ' +
    'It is permanent, and it also ends your access to the courses you bought, ',
  semReembolso: 'with no refund',
  apagarExplicacaoMeio: ' - to get your money back within the withdrawal period, first use',
  desistirDaCompra: 'Cancel the purchase',
  apagarExplicacaoFim: ', under Purchases.',

  avisoTitulo: 'Next course notice',
  avisoQuero: (curso: string) => `I want to get an email when ${curso} opens.`,
  avisoNota:
    'A single notice, when the course opens, and nothing else. You can leave whenever you want, ' +
    'by unchecking here or through the link in the email itself.',
  avisoErro: 'I could not save that right now. Try again in a moment.',

  senhaTitulo: 'Password',
  senhasDiferentes: 'The two passwords do not match.',
  senhaIgualAtual: 'The new password is the same as the current one.',
  senhaAtualNaoConfere: 'The current password is incorrect.',
  senhaTrocada:
    'Password changed. The other devices where you were signed in have been signed out - this ' +
    'one stays.',
  senhaAtual: 'Current password',
  senhaNova: 'New password',
  peloMenos: (n: number) => `At least ${n} characters.`,
  repitaSenhaNova: 'Repeat the new password',
  trocando: 'Changing…',
  trocarASenha: 'Change password',
  trocarSenhaExplicacao:
    'Changing your password signs out your other devices. That is what you want if you think ' +
    'someone got into your account.',

  emailNaoConfirmadoAntes: 'Your email has not been confirmed yet. When you signed up we sent a link to',
  emailNaoConfirmadoDepois:
    ' - open that email while signed in here, and you are done. Nothing is blocked in the meantime.',
  linkEnviado: 'Link sent. It is valid for seven days.',
  demonstracao: ' Demo: ',
  abrirOLink: 'open the link',
  enviando: 'Sending…',
  mandarDeNovo: 'Send the link again',

  // etapa 5/6: Brasil, rever
  desistenciaPedidaEm: (quando: string) => `Cancellation requested on ${quando}.`,
  estornoAutomatico:
    'The refund has already been requested from Mercado Pago and the money goes back through ' +
    'the same payment method. Access closes once it confirms.',
  estornoManual: (dias: number) =>
    `The money goes back through the same payment method within ${dias} business days.`,
  confirmaPorEmail: (email: string) =>
    `We will also confirm by email, at ${email}. If the message does not arrive, this line, ` +
    'with the date and time, is the record of your request.',
  temCerteza: 'Are you sure you want to cancel?',
  perdeAcesso: 'If you cancel, you lose access to:',
  perdeLicoes: (n: number) => `${n} lessons, with the teacher's audio`,
  perdeExercicios: 'The writing, reading and review exercises',
  perdeJogos: 'The practice games and the certificate of completion',
  jaDomina: (n: number, total: number) => `So far, you have mastered ${n} of ${total} letters.`,
  motivoOpcional: 'If you like, tell us why: it helps us improve the course. It is optional.',
  prefiroNaoDizer: 'I prefer not to say',
  recebeAntes: 'You get ',
  recebeForte: '100% of your money back',
  recebeDepois:
    ', with no need to explain why, and your access to the course ends when the refund is ' +
    'processed. Your progress is kept.',
  confirmarDesistencia: 'Confirm cancellation',
  voltar: 'Back',
  whatsappAntes:
    'Stuck on a lesson or had a technical problem? If you prefer, talk to the teacher first',
  peloWhatsapp: 'on WhatsApp',
  whatsappDepois: '. You can still cancel afterwards, within the deadline.',
  podeDesistirAte: (quando: string) => `You can cancel until ${quando}.`,

  verCodigoPix: 'See PIX code',
  pixValidoAte: (hora: string) =>
    `PIX copy-and-paste code for this order, valid until ${hora}. If you already paid, do not pay again.`,
  copiado: 'Copied ✓',
  copiarCodigo: 'Copy code'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
