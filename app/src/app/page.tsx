import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Hebraico Fluente — aprenda hebraico de verdade, do alfabeto à conversa',
  description:
    'A plataforma de hebraico para brasileiros. Alfabetização, A1, A2 e B1 na mesma conta: ' +
    'aulas interativas, correção na hora, progresso que continua de onde você parou.'
};

export default function HomePage() { return <HomeClient />; }
