import type { Metadata } from 'next';
import { CursosClient } from './CursosClient';

export const metadata: Metadata = {
  title: 'Cursos de Hebraico — Hebraico Fluente',
  description:
    'Alfabetização, A1, A2 e B1. A trilha completa do hebraico para brasileiros, ' +
    'na mesma conta e com o mesmo progresso.'
};

export default function CursosPage() { return <CursosClient />; }
