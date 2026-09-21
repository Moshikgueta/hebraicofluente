/* Esta página é COMPONENTE DE SERVIDOR, e por isso pode ler o conteúdo
   inteiro: o que ela produz é o HTML de `/inicio/`, que é rota paga e só sai
   do Worker para quem tem cookie e direito de acesso. O que não pode ler o
   conteúdo é o JavaScript do navegador - esse busca em `/api/content`. Ver a
   nota em `lib/content-servidor.ts`.

   Os números e a primeira letra saem DAQUI, do curso que existe, e não
   escritos à mão na tela. Foi um "22 letras" digitado à mão que já pôs dois
   números diferentes na mesma pergunta do site, e esta é justamente a tela
   que promete ao aluno como o curso funciona. */

import { conteudoPago } from '@/lib/content-servidor';
import { course, letterIds, totalLicoes } from '@/lib/content-publico';
import { StartHereClient } from './StartHereClient';

export default function InicioPage() {
  const { nikud, letters } = conteudoPago;

  return (
    <StartHereClient
      sounds={nikud.sounds}
      intro={nikud.intro}
      alfabeto={{
        total: course.totalLetters,
        /* As que mudam de desenho no fim da palavra. Contadas, não
           decoradas: se o dado mudar, a frase acompanha. */
        finais: letters
          .filter(l => l.finalForm)
          .map(l => ({ base: l.letter, final: l.finalForm as string, nome: l.namePt })),
        /* As quatro que se comportam de forma especial - consoante numa
           palavra, parte de um som de vogal em outra, sem som próprio numa
           terceira. Anunciadas aqui sem regra nenhuma, para que a
           contradição aparente ("mas você disse que são todas consoantes")
           não pegue ninguém de surpresa lá na lição. */
        especiais: ['alef', 'he', 'vav', 'yod']
          .map(id => letters.find(l => l.id === id))
          .filter((l): l is NonNullable<typeof l> => !!l)
          .map(l => ({ letra: l.letter, nome: l.namePt })),
        exemplo: letters[0]?.letter ?? 'א'
      }}
      curso={{
        licoes: totalLicoes(),
        modulos: course.modules.length,
        /* A primeira letra na ORDEM DE ENSINO, que é o que `letterIds()`
           devolve - e não a primeira do alfabeto. As duas por acaso não são
           a mesma coisa neste curso, e é a de ensino que o botão quer. */
        primeiraLicao: letterIds()[0] ?? 'alef'
      }}
    />
  );
}
