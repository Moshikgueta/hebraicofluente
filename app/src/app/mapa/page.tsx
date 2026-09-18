import { courseMap } from '@/lib/content';
import { CourseMapClient } from './CourseMapClient';

export default function MapaPage() {
  return <CourseMapClient nodes={courseMap()} />;
}
