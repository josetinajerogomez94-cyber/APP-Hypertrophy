export type Muscle =
  | 'pecho' | 'espalda' | 'hombros' | 'cuadriceps' | 'isquios'
  | 'gluteos' | 'biceps' | 'triceps' | 'gemelos' | 'core'

export const MUSCLES: { id: Muscle; label: string; priority: boolean }[] = [
  { id: 'pecho', label: 'Pecho', priority: true },
  { id: 'espalda', label: 'Espalda', priority: true },
  { id: 'hombros', label: 'Hombros', priority: true },
  { id: 'cuadriceps', label: 'Cuádriceps', priority: true },
  { id: 'isquios', label: 'Isquios', priority: true },
  { id: 'gluteos', label: 'Glúteos', priority: true },
  { id: 'biceps', label: 'Bíceps', priority: false },
  { id: 'triceps', label: 'Tríceps', priority: false },
  { id: 'gemelos', label: 'Gemelos', priority: false },
  { id: 'core', label: 'Core', priority: false }
]

export interface ExerciseDef {
  id: string
  name: string
  primary: Muscle
  secondary?: Muscle[]
  /** salto mínimo de carga recomendado */
  increment: number
  /** ejercicio multiarticular pesado: se le propone calentamiento por aproximación */
  compound?: boolean
  /** con barra olímpica: el calentamiento empieza con la barra vacía */
  bar?: boolean
  /** se hace a una pierna/brazo: cada serie cuenta doble en el tiempo estimado */
  unilateral?: boolean
  tips?: string
}

export const EXERCISES: ExerciseDef[] = [
  // Pecho
  { id: 'bench', bar: true, name: 'Press banca con barra', primary: 'pecho', secondary: ['triceps'], increment: 2.5, compound: true, tips: 'Escápulas retraídas, pies firmes, la barra toca el pecho bajo control.' },
  { id: 'incline_bb', bar: true, name: 'Press inclinado con barra', primary: 'pecho', secondary: ['triceps'], increment: 2.5, compound: true, tips: 'Banco a 30°. Baja a la parte alta del pecho.' },
  { id: 'incline_db', name: 'Press inclinado con mancuernas', primary: 'pecho', secondary: ['triceps'], increment: 2, compound: true, tips: 'Banco a 30°. Estira abajo sin perder la retracción escapular.' },
  { id: 'db_bench', name: 'Press plano con mancuernas', primary: 'pecho', secondary: ['triceps'], increment: 2, compound: true, tips: 'Recorrido completo, codos a unos 45° del torso.' },
  { id: 'machine_chest', name: 'Press de pecho en máquina', primary: 'pecho', secondary: ['triceps'], increment: 5, tips: 'Ajusta el asiento para que los agarres queden a la altura del pecho medio.' },
  { id: 'dips', name: 'Fondos en paralelas', primary: 'pecho', secondary: ['triceps'], increment: 2.5, compound: true, tips: 'Inclina el torso hacia delante. Añade lastre si superas el rango.' },
  { id: 'cable_fly', name: 'Cruces en polea', primary: 'pecho', increment: 2.5, tips: 'Codos ligeramente flexionados y fijos; aprieta al cerrar.' },
  { id: 'pec_deck', name: 'Contractor (pec deck)', primary: 'pecho', increment: 5, tips: 'Busca el estiramiento atrás sin adelantar los hombros.' },
  // Espalda
  { id: 'pullup', name: 'Dominadas', primary: 'espalda', secondary: ['biceps'], increment: 2.5, compound: true, tips: 'Desde brazos estirados hasta barbilla por encima de la barra. Si superas el rango, añade lastre (anota solo el lastre en kg).' },
  { id: 'lat_pulldown', name: 'Jalón al pecho', primary: 'espalda', secondary: ['biceps'], increment: 5, tips: 'Lleva los codos hacia las costillas, sin balancear el torso.' },
  { id: 'neutral_pulldown', name: 'Jalón agarre neutro', primary: 'espalda', secondary: ['biceps'], increment: 5, tips: 'Agarre estrecho y neutro; estira completamente arriba.' },
  { id: 'bb_row', bar: true, name: 'Remo con barra', primary: 'espalda', secondary: ['biceps'], increment: 2.5, compound: true, tips: 'Torso a unos 45°, espalda neutra; lleva la barra al ombligo.' },
  { id: 'chest_row', name: 'Remo con apoyo en pecho', primary: 'espalda', secondary: ['biceps'], increment: 5, tips: 'Máquina o banco inclinado. Sin despegar el pecho del apoyo.' },
  { id: 'cable_row', name: 'Remo en polea baja', primary: 'espalda', secondary: ['biceps'], increment: 5, tips: 'Estira hacia delante y tira con los codos pegados.' },
  { id: 'db_row', name: 'Remo con mancuerna', primary: 'espalda', secondary: ['biceps'], increment: 2, unilateral: true, tips: 'Apoya rodilla y mano en el banco; lleva el codo hacia la cadera.' },
  // Hombros
  { id: 'ohp', bar: true, name: 'Press militar con barra de pie', primary: 'hombros', secondary: ['triceps'], increment: 2.5, compound: true, tips: 'Glúteos y abdomen apretados; la cabeza "atraviesa" al subir la barra.' },
  { id: 'db_shoulder', name: 'Press de hombro con mancuernas sentado', primary: 'hombros', secondary: ['triceps'], increment: 2, compound: true, tips: 'Banco casi vertical; baja hasta la altura de las orejas.' },
  { id: 'lat_raise', name: 'Elevaciones laterales con mancuernas', primary: 'hombros', increment: 1, tips: 'Sube hasta la línea de los hombros, guiando con los codos. Sin impulso.' },
  { id: 'cable_lat_raise', name: 'Elevación lateral en polea', primary: 'hombros', increment: 2.5, unilateral: true, tips: 'Polea baja, cable por delante o por detrás del cuerpo. Tensión constante.' },
  { id: 'rear_delt', name: 'Pájaros (deltoides posterior)', primary: 'hombros', increment: 2.5, tips: 'Contractor invertido o mancuernas. Brazos abiertos, sin juntar escápulas.' },
  { id: 'face_pull', name: 'Face pull', primary: 'hombros', secondary: ['espalda'], increment: 2.5, tips: 'Cuerda a la altura de la cara; separa las manos al final.' },
  // Pierna
  { id: 'belt_squat', name: 'Belt squat (sentadilla con cinturón)', primary: 'cuadriceps', secondary: ['gluteos'], increment: 2.5, compound: true, tips: 'Cinturón bien ajustado a la cadera y pies en la plataforma un poco por delante. Torso erguido, baja todo lo que puedas sin despegar los talones y sube empujando el suelo. No carga la columna.' },
  { id: 'squat', bar: true, name: 'Sentadilla trasera', primary: 'cuadriceps', secondary: ['gluteos'], increment: 2.5, compound: true, tips: 'Rompe el paralelo, rodillas siguiendo la punta de los pies, tronco firme.' },
  { id: 'hack', name: 'Sentadilla hack / péndulo', primary: 'cuadriceps', secondary: ['gluteos'], increment: 5, compound: true, tips: 'Recorrido profundo y controlado.' },
  { id: 'leg_press', name: 'Prensa de piernas', primary: 'cuadriceps', secondary: ['gluteos'], increment: 5, compound: true, tips: 'Baja hasta que la cadera vaya a despegarse del respaldo, no más.' },
  { id: 'bulgarian', name: 'Sentadilla búlgara', primary: 'cuadriceps', secondary: ['gluteos'], increment: 2, unilateral: true, tips: 'Anota el peso de UNA mancuerna. Series por pierna.' },
  { id: 'leg_ext', name: 'Extensión de cuádriceps', primary: 'cuadriceps', increment: 5, tips: 'Pausa de 1 s arriba; baja lento.' },
  { id: 'deadlift', bar: true, name: 'Peso muerto convencional', primary: 'isquios', secondary: ['gluteos', 'espalda'], increment: 2.5, compound: true, tips: 'Barra pegada a las piernas, espalda neutra, empuja el suelo.' },
  { id: 'rdl', bar: true, name: 'Peso muerto rumano', primary: 'isquios', secondary: ['gluteos'], increment: 2.5, compound: true, tips: 'Cadera atrás, rodillas semiflexionadas, baja hasta notar estiramiento en isquios.' },
  { id: 'lying_curl', name: 'Curl femoral tumbado', primary: 'isquios', increment: 2.5, tips: 'Cadera pegada al banco; baja lento.' },
  { id: 'seated_curl', name: 'Curl femoral sentado', primary: 'isquios', increment: 5, tips: 'Inclínate ligeramente hacia delante para estirar más el isquio.' },
  { id: 'hip_thrust', bar: true, name: 'Hip thrust', primary: 'gluteos', secondary: ['isquios'], increment: 5, compound: true, tips: 'Barbilla al pecho, pausa de 1 s arriba apretando glúteo.' },
  { id: 'calf_stand', name: 'Gemelo de pie', primary: 'gemelos', increment: 5, tips: 'Estira abajo 1-2 s; sube hasta la punta.' },
  { id: 'calf_seat', name: 'Gemelo sentado', primary: 'gemelos', increment: 5, tips: 'Rango completo con pausa abajo.' },
  // Brazos
  { id: 'ez_curl', name: 'Curl con barra Z', primary: 'biceps', increment: 2.5, tips: 'Codos quietos, sin balanceo.' },
  { id: 'incline_curl', name: 'Curl inclinado con mancuernas', primary: 'biceps', increment: 1, tips: 'Banco a 45°, brazos colgando por detrás del torso.' },
  { id: 'hammer', name: 'Curl martillo', primary: 'biceps', increment: 1, tips: 'Agarre neutro, sube alternando o a la vez.' },
  { id: 'pushdown', name: 'Extensión de tríceps en polea', primary: 'triceps', increment: 2.5, tips: 'Codos pegados al cuerpo; extiende por completo.' },
  { id: 'overhead_ext', name: 'Extensión de tríceps sobre la cabeza (polea)', primary: 'triceps', increment: 2.5, tips: 'De espaldas a la polea; busca el estiramiento detrás de la cabeza.' },
  { id: 'skull', name: 'Press francés', primary: 'triceps', increment: 2.5, tips: 'Barra Z hacia la frente o detrás de la cabeza; codos fijos.' },
  // Core
  { id: 'cable_crunch', name: 'Crunch en polea', primary: 'core', increment: 5, tips: 'Flexiona la columna, no la cadera.' },
  { id: 'hanging_raise', name: 'Elevación de piernas colgado', primary: 'core', increment: 0, tips: 'Sube la pelvis, sin balanceo.' }
]

const byId = new Map(EXERCISES.map(e => [e.id, e]))

export function getExercise(id: string): ExerciseDef {
  return byId.get(id) ?? { id, name: id, primary: 'core', increment: 2.5 }
}

/** Ejercicios que trabajan el mismo músculo principal (para sustituir uno por otro). */
export function alternativesFor(id: string): ExerciseDef[] {
  const ex = getExercise(id)
  return EXERCISES.filter(e => e.primary === ex.primary && e.id !== id)
}

/** Ejercicios básicos que se trabajan por porcentaje del 1RM. */
export const RM_LIFTS = ['belt_squat', 'bench', 'deadlift', 'ohp'] as const
