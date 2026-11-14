import { v4 as uuidv4 } from 'uuid';
import type { Exercise } from './types';

export const defaultExercises: Exercise[] = [
  {
    id: uuidv4(),
    nombre: 'Press de Banca',
    variante: 'Barra plana',
    equipamiento: 'Barra',
    musculoPrincipal: 'Pecho',
    musculosSecundarios: ['Hombro frontal', 'Tríceps'],
    patronMovimiento: 'Empuje horizontal',
    unidadCarga: 'kg totales',
    incrementoMinKg: 2.5,
    rangoRepsDefault: [8, 12],
    rirDefault: 2,
    descansoDefaultSeg: 120,
    notasTecnicas: 'Tocar el pecho, pausa de 1 segundo opcional.',
    custom: false,
    comparabilityKey: 'press-banca-barra-plana' 
  },
  {
    id: uuidv4(),
    nombre: 'Sentadilla',
    variante: 'Barra alta',
    equipamiento: 'Barra',
    musculoPrincipal: 'Cuádriceps',
    musculosSecundarios: ['Glúteos', 'Adductores'],
    patronMovimiento: 'Sentadilla',
    unidadCarga: 'kg totales',
    incrementoMinKg: 2.5,
    rangoRepsDefault: [6, 10],
    rirDefault: 2,
    descansoDefaultSeg: 180,
    notasTecnicas: 'Romper el paralelo, control en la excéntrica.',
    custom: false,
    comparabilityKey: 'sentadilla-barra-alta'
  }
];
