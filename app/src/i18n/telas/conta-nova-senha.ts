import type { Traducao } from '..';

/* components/platform/NovaSenha.tsx e app/nova-senha/page.tsx */
const pt = {
  metaTitulo: 'Nova senha - Hebraico Fluente',
  metaDescricao: 'Escolha uma senha nova e volte para o curso.',
  senhasDiferentes: 'As duas senhas não são iguais.',
  titulo: 'Escolher uma senha nova',
  entraDireto: 'Depois disso você já entra direto - não precisa fazer login de novo.',
  soComLink: 'Este endereço só funciona com o link que mandamos por e-mail.',
  senhaNova: 'Senha nova',
  peloMenos: (n: number) => `Pelo menos ${n} caracteres.`,
  repitaSenha: 'Repita a senha',
  salvando: 'Salvando…',
  salvarEEntrar: 'Salvar e entrar',
  faltouLink:
    'Faltou o link. Peça um novo - eles duram uma hora e funcionam uma vez só, então é normal ' +
    'precisar de outro.',
  pedirLinkNovo: 'Pedir um link novo',
  lembrouSenha: 'Lembrou a senha?',
  entrar: 'Entrar'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'New password - Hebraico Fluente',
  metaDescricao: 'Choose a new password and get back to the course.',
  senhasDiferentes: 'The two passwords do not match.',
  titulo: 'Choose a new password',
  entraDireto: 'After this you are signed in right away - no need to sign in again.',
  soComLink: 'This address only works with the link we sent you by email.',
  senhaNova: 'New password',
  peloMenos: (n: number) => `At least ${n} characters.`,
  repitaSenha: 'Repeat the password',
  salvando: 'Saving…',
  salvarEEntrar: 'Save and sign in',
  faltouLink:
    'The link is missing. Ask for a new one - they last one hour and work only once, so it is ' +
    'normal to need another.',
  pedirLinkNovo: 'Ask for a new link',
  lembrouSenha: 'Remembered your password?',
  entrar: 'Sign in'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
