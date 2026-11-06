import { A1HomeClient } from './A1HomeClient';

/* O curso Hebraico A1 (06/10/2026): a página do curso, com as 8 unidades.
   Rota paga de OUTRO curso (worker/src/gate.js, `cursoDaRota`); o conteúdo
   chega por /api/content/a1 dentro do CourseGate. */
export default function A1Page() {
  return <A1HomeClient />;
}
