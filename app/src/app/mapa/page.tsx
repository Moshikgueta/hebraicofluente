import { CourseMapClient } from './CourseMapClient';

/* O mapa monta a si mesmo a partir de `course.modules`, e por isso não recebe
   mais `courseMap()`: a lista achatada de nós (intro, letra, checkpoint,
   final) servia à espinha antiga, que era uma linha só. A linha do tempo é
   por MÓDULO, que é a unidade em que o plano de aulas pensa. */
export default function MapaPage() {
  return <CourseMapClient />;
}
