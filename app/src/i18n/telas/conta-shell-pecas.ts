import type { Traducao } from '..';

/* components/shell: MarcaDagua.tsx, RedesSociais.tsx, DemoNotice.tsx e Logo.tsx */
const pt = {
  licenciadoPara: (email: string) => `Licenciado para ${email}`,
  copia: (numero: string) => `cópia ${numero}`,
  avisoDeDireitos:
    'Conteúdo protegido por direito autoral (Lei 9.610/1998), licenciado para uso pessoal desta ' +
    'conta. Copiar, gravar para distribuir ou revender sem autorização pode gerar ' +
    'responsabilização civil e criminal.',
  termosArtigo5: 'Termos de Uso, artigo 5',

  instagram: 'Instagram',
  instagramSr: ' do Hebraico Fluente (abre em outra aba)',
  linkedin: 'LinkedIn',
  linkedinSr: ' do professor (abre em outra aba)',

  demoTitulo: 'Ambiente de demonstração.',
  demoTexto:
    'Esta versão não tem servidor: contas e pagamentos ficam só neste navegador, nada é cobrado ' +
    'e o acesso não vale em outro aparelho.',

  marca: 'Hebraico Fluente'
} as const;

const en: Traducao<typeof pt> = {
  licenciadoPara: (email: string) => `Licensed to ${email}`,
  copia: (numero: string) => `copy ${numero}`,
  // etapa 5/6: Brasil, rever (a lei citada é a brasileira)
  avisoDeDireitos:
    'Content protected by copyright (Brazilian Law 9,610/1998), licensed for the personal use of ' +
    'this account. Copying, recording for distribution or reselling without permission may lead ' +
    'to civil and criminal liability.',
  termosArtigo5: 'Terms of Use, article 5',

  instagram: 'Instagram',
  instagramSr: ' of Hebraico Fluente (opens in a new tab)',
  linkedin: 'LinkedIn',
  linkedinSr: ' of the teacher (opens in a new tab)',

  demoTitulo: 'Demo environment.',
  demoTexto:
    'This version has no server: accounts and payments stay only in this browser, nothing is ' +
    'charged and access does not work on another device.',

  marca: 'Hebraico Fluente'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
