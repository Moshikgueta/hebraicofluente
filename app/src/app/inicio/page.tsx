import { nikud } from '@/lib/content';
import { StartHereClient } from './StartHereClient';

export default function InicioPage() {
  return <StartHereClient sounds={nikud.sounds} intro={nikud.intro} />;
}
