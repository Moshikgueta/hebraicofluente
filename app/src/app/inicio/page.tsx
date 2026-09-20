/* Esta página é COMPONENTE DE SERVIDOR, e por isso pode ler o conteúdo
   inteiro: o que ela produz é o HTML de `/inicio/`, que é rota paga e só sai
   do Worker para quem tem cookie e direito de acesso. O que não pode ler o
   conteúdo é o JavaScript do navegador - esse busca em `/api/content`. Ver a
   nota em `lib/content-servidor.ts`. */

import { conteudoPago } from '@/lib/content-servidor';
import { StartHereClient } from './StartHereClient';

export default function InicioPage() {
  const { nikud } = conteudoPago;
  return <StartHereClient sounds={nikud.sounds} intro={nikud.intro} />;
}
