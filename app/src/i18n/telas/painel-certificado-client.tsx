import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/certificado/CertificadoClient.tsx - o certificado do curso e o cartão
   que a página de conclusão mostra (CertificateCallout). */
const pt = {
  escrevaParaBaixar: 'Escreva o seu nome no campo acima antes de baixar.',
  imagemSalva: 'Imagem salva.',
  escrevaParaCompartilhar: 'Escreva o seu nome no campo acima antes de compartilhar.',
  textoCopiado: 'Texto copiado.',
  naoCopiou: 'Não deu para copiar - selecione o texto acima.',

  /* ainda não */
  certificado: 'Certificado',
  faltaTitulo: 'Ainda falta um pouco',
  faltaTexto: 'O certificado sai quando as duas coisas estiverem feitas. Elas não têm prazo.',
  requisitoLicoes: 'As lições das {total} letras concluídas',
  /* Seguida, na tela, da regra da conclusão (lib/state/rules.ts). */
  requisitoLicoesDetalhe: '{n} de {total} concluídas.',
  irParaMapa: 'Ir para o mapa',
  requisitoExame: 'O exame final',
  melhorResultado: 'Melhor resultado: {nota}% - aprovação a partir de {minimo}%',
  aprovacaoAPartir: 'Aprovação a partir de {minimo}%',
  fazerExame: 'Fazer o exame',
  porParticipacao: 'Um certificado por participação não vale nada - nem para quem o recebe. Por isso este depende de ler, e não de terminar.',

  /* conquistado */
  aprovadoEm: 'Aprovado em {data}',
  seuCertificado: 'Seu certificado',
  geradoAqui: 'A imagem é gerada aqui no seu aparelho. Escolha o formato, confira o nome e baixe ou compartilhe.',
  imagemAria: 'Certificado de conclusão do curso Hebraico Fluente em nome de {nome}, {data}.',
  alunoReserva: 'aluno',
  nomeNoCertificado: 'Nome no certificado',
  comoAparecer: 'Como você quer aparecer',
  semNome: 'Escreva o seu nome: o certificado só sai com ele.',
  nomeEmHebraico: 'Adicionar o meu nome em hebraico ao certificado',
  grafiaNota: 'Nome não tem grafia única em hebraico. Confira como ficou e ajuste se precisar - o certificado usa exatamente o que estiver aqui.',
  grafiasSugeridas: 'Grafias sugeridas',
  conferi: 'Conferi: é assim que se escreve o meu nome',
  formato: 'Formato',
  gerando: 'Gerando…',
  compartilhar: 'Compartilhar',
  baixarPng: 'Baixar PNG',
  textoDoPost: 'Texto para o post',
  copiarTexto: 'Copiar texto',
  oQueERotulo: 'O que este certificado é:',
  /* O espaço duplo antes da nota é o que a tela sempre teve. */
  oQueETexto: 'o registro de que você concluiu as lições das 22 letras e passou no exame final deste curso, com  {nota}.',
  notaDeAprovacao: 'nota de aprovação',
  verificouRotulo: 'O que o exame verificou:',
  naoERotulo: 'O que ele não é:',
  naoETexto: 'um certificado oficial, um diploma ou uma avaliação de proficiência reconhecida. Isso está escrito na própria imagem - quem recebe merece saber, e você também.',
  oQueConquistou: 'O que você conquistou',
  continuarPraticando: 'Continuar praticando',

  /* a emissão pelo servidor (03/11/2026) */
  carregando: 'Carregando o seu certificado…',
  emitirTitulo: 'Emita o seu certificado',
  emitirTexto: 'Confira o nome como você quer que ele apareça. Depois de emitido, o certificado ganha um código que qualquer pessoa pode conferir no site, e o nome não muda mais.',
  emitir: 'Emitir o certificado',
  emitindo: 'Emitindo…',
  nomeFixo: 'O nome foi fixado na emissão do certificado.',
  codigoPagina: (codigo: string) => `Código do certificado: ${codigo}. Qualquer pessoa pode conferi-lo em hebraicofluente.com.br/verificar-certificado.`,
  faltaServidor: 'O resultado do seu exame ainda não chegou ao servidor. Abra o curso com internet por um instante e tente de novo.',
  tentarDeNovo: 'Tentar de novo',
  erroEmitir: 'Não consegui emitir agora. Confira a internet e tente de novo.',
  nomeInvalido: 'Use só letras, espaços, hífen, apóstrofo e ponto, de 3 a 80 caracteres.',

  /* o cartão da página de conclusão */
  cartaoTitulo: 'Você tem um certificado para compartilhar.',
  cartaoTexto: (alef: ReactNode) => <>Com o seu nome, a data da aprovação e as 22 letras{' '}{alef} - em quadrado ou paisagem.</>,
  verCertificado: 'Ver o certificado'
} as const;

const en: Traducao<typeof pt> = {
  escrevaParaBaixar: 'Type your name in the field above before downloading.',
  imagemSalva: 'Image saved.',
  escrevaParaCompartilhar: 'Type your name in the field above before sharing.',
  textoCopiado: 'Text copied.',
  naoCopiou: 'Could not copy - select the text above.',

  certificado: 'Certificate',
  faltaTitulo: 'Almost there',
  faltaTexto: 'The certificate is issued once both things are done. There is no deadline.',
  requisitoLicoes: 'The lessons for all {total} letters completed',
  requisitoLicoesDetalhe: '{n} of {total} completed.',
  irParaMapa: 'Go to the map',
  requisitoExame: 'The final exam',
  melhorResultado: 'Best result: {nota}% - passing from {minimo}%',
  aprovacaoAPartir: 'Passing from {minimo}%',
  fazerExame: 'Take the exam',
  porParticipacao: 'A certificate for showing up is worth nothing - not even to the person who gets it. That is why this one depends on reading, not on finishing.',

  aprovadoEm: 'Passed on {data}',
  seuCertificado: 'Your certificate',
  geradoAqui: 'The image is generated right here on your device. Pick the format, check the name, and download or share it.',
  imagemAria: 'Certificate of completion of the Hebrew Unlocked course issued to {nome}, {data}.',
  alunoReserva: 'student',
  nomeNoCertificado: 'Name on the certificate',
  comoAparecer: 'How you want your name to appear',
  semNome: 'Type your name: the certificate is only issued with it.',
  nomeEmHebraico: 'Add my name in Hebrew to the certificate',
  grafiaNota: 'Names do not have a single spelling in Hebrew. Check how it looks and adjust if needed - the certificate uses exactly what is here.',
  grafiasSugeridas: 'Suggested spellings',
  conferi: 'I checked: this is how my name is spelled',
  formato: 'Format',
  gerando: 'Generating…',
  compartilhar: 'Share',
  baixarPng: 'Download PNG',
  textoDoPost: 'Text for your post',
  copiarTexto: 'Copy text',
  oQueERotulo: 'What this certificate is:',
  oQueETexto: 'the record that you completed the lessons for the 22 letters and passed this course\'s final exam, with {nota}.',
  notaDeAprovacao: 'a passing score',
  verificouRotulo: 'What the exam checked:',
  naoERotulo: 'What it is not:',
  naoETexto: 'an official certificate, a diploma or a recognized proficiency assessment. That is written on the image itself - whoever receives it deserves to know, and so do you.',
  oQueConquistou: 'What you have achieved',
  continuarPraticando: 'Keep practicing',

  carregando: 'Loading your certificate…',
  emitirTitulo: 'Issue your certificate',
  emitirTexto: 'Check your name as you want it to appear. Once issued, the certificate gets a code anyone can check on the site, and the name can no longer change.',
  emitir: 'Issue the certificate',
  emitindo: 'Issuing…',
  nomeFixo: 'The name was fixed when the certificate was issued.',
  codigoPagina: (codigo: string) => `Certificate code: ${codigo}. Anyone can check it at the site's certificate verification page.`,
  faltaServidor: 'Your exam result has not reached the server yet. Open the course online for a moment and try again.',
  tentarDeNovo: 'Try again',
  erroEmitir: 'I could not issue it right now. Check your connection and try again.',
  nomeInvalido: 'Use only letters, spaces, hyphens, apostrophes and periods, 3 to 80 characters.',

  cartaoTitulo: 'You have a certificate to share.',
  cartaoTexto: (alef: ReactNode) => <>With your name, the date you passed and the 22 letters{' '}{alef} - in square or landscape.</>,
  verCertificado: 'See the certificate'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
