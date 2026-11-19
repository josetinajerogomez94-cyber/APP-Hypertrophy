/**
 * CALENTAMIENTO ESPECÍFICO (≈5 min) con una goma elástica y movilidad.
 * Se hace al llegar al gimnasio, antes de las series de aproximación del primer ejercicio.
 */
export interface WarmupStep { name: string; dose: string; tip?: string }
export interface Warmup { id: string; title: string; steps: WarmupStep[] }

export const WARMUPS: Record<string, Warmup> = {
  torsoA: { id: 'torsoA', title: 'Torso · pecho primero', steps: [
    { name: 'Círculos de brazos y hombros', dose: '30 s', tip: 'Adelante y atrás, cada vez más amplios.' },
    { name: 'Dislocaciones con goma', dose: '10', tip: 'Agarre ancho, pasa la goma por encima de la cabeza hasta la espalda sin doblar codos.' },
    { name: 'Pull-apart con goma', dose: '15', tip: 'Brazos rectos al frente, separa la goma juntando escápulas.' },
    { name: 'Rotación externa con goma', dose: '12 por brazo', tip: 'Codo pegado al costado a 90°, gira el antebrazo hacia fuera.' },
    { name: 'Apertura torácica (open book)', dose: '6 por lado', tip: 'Tumbado de lado con rodillas flexionadas, abre el brazo de arriba hacia el otro lado.' },
    { name: 'Flexiones lentas', dose: '10', tip: 'Bajada en 3 s; al subir, empuja el suelo y separa las escápulas.' }
  ] },
  torsoB: { id: 'torsoB', title: 'Torso · hombro primero', steps: [
    { name: 'Círculos de brazos y hombros', dose: '30 s' },
    { name: 'Dislocaciones con goma', dose: '10', tip: 'Agarre ancho, sin doblar codos.' },
    { name: 'Face pull con goma', dose: '15', tip: 'Goma enganchada a la altura de la cara; tira separando las manos.' },
    { name: 'Rotación externa con goma', dose: '12 por brazo', tip: 'Codo pegado al costado.' },
    { name: 'Y-T-W de pie inclinado', dose: '5 de cada', tip: 'Torso inclinado a 45°, brazos sin peso formando las letras.' },
    { name: 'Press de hombro con goma', dose: '12', tip: 'Pisa la goma y empuja por encima de la cabeza.' }
  ] },
  piernaA: { id: 'piernaA', title: 'Pierna · cuádriceps primero', steps: [
    { name: 'Balanceo de pierna adelante-atrás y lateral', dose: '10 de cada por pierna', tip: 'Apóyate en algo.' },
    { name: 'Tobillo: rodilla a la pared', dose: '10 por lado', tip: 'Talón pegado al suelo, lleva la rodilla más allá de la punta del pie.' },
    { name: 'Estiramiento del corredor con giro', dose: '5 por lado', tip: 'Zancada profunda, codo al suelo por dentro del pie y gira el pecho abriendo el brazo.' },
    { name: 'Sentadilla con pausa abajo', dose: '10', tip: 'Peso corporal, 2 s abajo empujando las rodillas hacia fuera.' },
    { name: 'Paso lateral con goma (monster walk)', dose: '10 pasos por lado', tip: 'Goma por encima de las rodillas, media sentadilla.' },
    { name: 'Puente de glúteo con goma', dose: '15', tip: 'Aprieta 1 s arriba abriendo las rodillas contra la goma.' }
  ] },
  piernaB: { id: 'piernaB', title: 'Pierna · isquios primero', steps: [
    { name: 'Balanceo de pierna adelante-atrás y lateral', dose: '10 de cada por pierna' },
    { name: 'Bisagra de cadera sin peso', dose: '10', tip: 'Manos en la cadera, llévala atrás con la espalda recta hasta notar los isquios.' },
    { name: 'Inchworm (caminata de manos)', dose: '5', tip: 'Piernas casi rectas, camina con las manos hasta plancha y vuelve.' },
    { name: 'Movilidad de cadera 90/90', dose: '5 por lado', tip: 'Sentado, gira las dos piernas de un lado a otro.' },
    { name: 'Puente de glúteo con goma', dose: '15', tip: 'Aprieta 1 s arriba.' },
    { name: 'Paso lateral con goma (monster walk)', dose: '10 pasos por lado' }
  ] }
}

/** Calentamiento que corresponde a un día del plan. */
export function warmupFor(dayName: string): Warmup {
  if (dayName === 'Torso B') return WARMUPS.torsoB
  if (dayName.startsWith('Torso')) return WARMUPS.torsoA
  if (dayName === 'Pierna B') return WARMUPS.piernaB
  return WARMUPS.piernaA
}
