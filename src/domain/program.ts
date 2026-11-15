import { getExercise, MUSCLES, type Muscle } from './exercises'

/**
 * MACROCICLO DE 6 MESES (26 semanas) — fuerza e hipertrofia
 * Prioridad: pecho, hombros, espalda y piernas. Sesiones de 75 minutos como máximo.
 *
 * Cómo se lee una prescripción:
 *  - reps [min, max] → doble progresión: cuando todas las series llegan al máximo con el RIR pedido, se sube peso.
 *  - rir → repeticiones que te quedan en reserva (RIR 2 = podrías haber hecho 2 más).
 *  - pct → porcentaje de tu 1RM (sale del test de RM). La app te dice los kilos.
 *  - Cada semana del mesociclo ajusta el RIR / % (ondulación) y la última suele ser de descarga.
 */

export interface Prescription {
  ex: string
  sets: number
  reps: [number, number]
  rir: number
  pct?: number
  rest: number // segundos
  note?: string
}

export interface DayPlan {
  id: string
  name: string
  focus: string
  items: Prescription[]
  /** ejercicios básicos que se testean en las semanas de test */
  tests?: string[]
}

export interface WeekScheme {
  label: string
  rirAdj?: number
  pctAdj?: number
  deload?: boolean
  test?: boolean
  note?: string
}

export interface Mesocycle {
  id: string
  name: string
  short: string
  goal: string
  description: string
  color: string
  weeks: WeekScheme[]
  days: DayPlan[]
}

const P = (ex: string, sets: number, reps: [number, number] | number, rir: number, rest: number, extra: Partial<Prescription> = {}): Prescription =>
  ({ ex, sets, reps: typeof reps === 'number' ? [reps, reps] : reps, rir, rest, ...extra })

/*
 * ORGANIZACIÓN POR BLOQUES MUSCULARES (un músculo detrás de otro, como están las máquinas del gimnasio).
 * Prioridad: 1) pecho · 2) pierna completa (cuádriceps, isquios, glúteo) · 3) hombro · 4) espalda.
 * Sin gemelos. Brazos al mínimo (reciben trabajo indirecto de los empujes y tirones).
 * Torso A empieza por pecho (lo más pesado de pecho, con el músculo fresco).
 * Torso B empieza por hombro para que el press militar no llegue fatigado; después pecho y espalda.
 */
export const MACROCYCLE: Mesocycle[] = [
  {
    id: 'm1', short: 'M1', name: 'Reactivación', color: '#6EDC9A',
    goal: 'Recuperar el hábito, la técnica y medir tu fuerza',
    description: '3 días por semana (Torso A · Pierna · Torso B), un músculo detrás de otro. Volumen moderado y RIR alto al principio para volver a coger ritmo sin agujetas brutales. En la semana 4 haces el test de RM de los básicos.',
    weeks: [
      { label: 'Semana 1', rirAdj: 1, note: 'Toma de contacto: elige pesos cómodos y cuida la técnica.' },
      { label: 'Semana 2' },
      { label: 'Semana 3', rirAdj: -1 },
      { label: 'Semana 4 · Test RM', test: true, note: 'Al empezar la sesión haz el test de RM del básico indicado. Después sigue con el resto.' }
    ],
    days: [
      { id: 'm1d1', name: 'Torso A', focus: 'Pecho → hombro → espalda', tests: ['bench'], items: [
        P('bench', 3, [6, 8], 2, 150),
        P('incline_db', 3, [8, 12], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60),
        P('lat_raise', 3, [12, 15], 1, 60),
        P('chest_row', 3, [8, 10], 2, 120),
        P('lat_pulldown', 3, [8, 12], 2, 90)
      ] },
      { id: 'm1d2', name: 'Pierna', focus: 'Cuádriceps → isquios → glúteo', tests: ['squat', 'deadlift'], items: [
        P('squat', 3, [6, 8], 2, 180),
        P('leg_press', 3, [10, 12], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('rdl', 3, [8, 10], 2, 150),
        P('lying_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [8, 12], 2, 90)
      ] },
      { id: 'm1d3', name: 'Torso B', focus: 'Hombro → pecho → espalda', tests: ['ohp'], items: [
        P('ohp', 3, [6, 8], 2, 150),
        P('cable_lat_raise', 3, [12, 15], 1, 45),
        P('rear_delt', 2, [12, 15], 1, 45),
        P('machine_chest', 3, [8, 12], 2, 90),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('pullup', 3, [6, 10], 2, 150),
        P('cable_row', 3, [10, 12], 2, 90)
      ] }
    ]
  },
  {
    id: 'm2', short: 'M2', name: 'Hipertrofia · Acumulación', color: '#4FD1E5',
    goal: 'Subir el volumen semanal con 4 días',
    description: 'Torso/Pierna 4 días por bloques musculares. Pecho ~16 series por semana, pierna 26-30 (cuádriceps, isquios y glúteo), hombro ~14 y espalda ~12. El RIR baja semana a semana y la 5ª es de descarga.',
    weeks: [
      { label: 'Semana 1', rirAdj: 1 },
      { label: 'Semana 2' },
      { label: 'Semana 3', rirAdj: -1 },
      { label: 'Semana 4', rirAdj: -1, note: 'Semana más dura del bloque.' },
      { label: 'Semana 5 · Descarga', deload: true, note: 'Menos series y lejos del fallo para recuperar.' }
    ],
    days: [
      { id: 'm2d1', name: 'Torso A', focus: 'Pecho → hombro → espalda', items: [
        P('bench', 4, [6, 8], 2, 150),
        P('incline_db', 3, [8, 12], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60),
        P('lat_raise', 4, [12, 20], 1, 45),
        P('bb_row', 3, [8, 10], 2, 120),
        P('lat_pulldown', 3, [10, 12], 2, 90),
        P('pushdown', 2, [10, 15], 1, 60, { note: 'Brazos: opcional si vas justo de tiempo.' })
      ] },
      { id: 'm2d2', name: 'Pierna A', focus: 'Cuádriceps → isquios → glúteo', items: [
        P('squat', 4, [6, 8], 2, 180),
        P('leg_press', 3, [10, 12], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('seated_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [8, 12], 2, 90)
      ] },
      { id: 'm2d3', name: 'Torso B', focus: 'Hombro → pecho → espalda', items: [
        P('ohp', 4, [6, 8], 2, 150),
        P('cable_lat_raise', 3, [12, 15], 1, 45),
        P('face_pull', 3, [12, 15], 1, 45),
        P('dips', 3, [8, 12], 2, 120),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('pullup', 3, [6, 10], 2, 150),
        P('cable_row', 3, [10, 12], 2, 90),
        P('ez_curl', 2, [8, 12], 1, 60, { note: 'Brazos: opcional si vas justo de tiempo.' })
      ] },
      { id: 'm2d4', name: 'Pierna B', focus: 'Isquios → glúteo → cuádriceps', items: [
        P('rdl', 4, [6, 8], 2, 150),
        P('lying_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [10, 12], 2, 90),
        P('hack', 3, [8, 12], 2, 120),
        P('bulgarian', 3, [8, 12], 2, 75)
      ] }
    ]
  },
  {
    id: 'm3', short: 'M3', name: 'Fuerza-Hipertrofia', color: '#B794F4',
    goal: 'Ganar fuerza en los básicos manteniendo el volumen',
    description: 'Cada bloque empieza por su básico a porcentaje de tu 1RM (banca, sentadilla, militar y peso muerto), subiendo un 2,5 % por semana. El resto, hipertrofia. La 5ª semana es descarga con nuevo test de RM.',
    weeks: [
      { label: 'Semana 1' },
      { label: 'Semana 2', pctAdj: 2.5 },
      { label: 'Semana 3', pctAdj: 5, rirAdj: -1 },
      { label: 'Semana 4', pctAdj: 7.5, rirAdj: -1, note: 'Semana más pesada del bloque.' },
      { label: 'Semana 5 · Descarga + Test RM', deload: true, test: true, note: 'Haz el test de RM del básico al principio y el resto de la sesión en modo descarga.' }
    ],
    days: [
      { id: 'm3d1', name: 'Torso A', focus: 'Pecho (fuerza en banca) → hombro → espalda', tests: ['bench'], items: [
        P('bench', 4, 5, 2, 180, { pct: 75 }),
        P('incline_bb', 3, [6, 10], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60),
        P('lat_raise', 4, [12, 15], 1, 45),
        P('bb_row', 3, [6, 8], 2, 150),
        P('lat_pulldown', 3, [8, 12], 2, 90)
      ] },
      { id: 'm3d2', name: 'Pierna A', focus: 'Cuádriceps (fuerza en sentadilla) → isquios → glúteo', tests: ['squat'], items: [
        P('squat', 4, 5, 2, 180, { pct: 75 }),
        P('leg_press', 3, [8, 12], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('seated_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [8, 10], 2, 90)
      ] },
      { id: 'm3d3', name: 'Torso B', focus: 'Hombro (fuerza en militar) → pecho → espalda', tests: ['ohp'], items: [
        P('ohp', 4, 6, 2, 150, { pct: 72.5 }),
        P('cable_lat_raise', 3, [12, 15], 1, 45),
        P('rear_delt', 3, [15, 20], 1, 45),
        P('db_bench', 3, [8, 12], 2, 120),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('pullup', 3, [5, 8], 2, 150, { note: 'Si haces más de 8, añade lastre.' }),
        P('chest_row', 3, [8, 12], 2, 90)
      ] },
      { id: 'm3d4', name: 'Pierna B', focus: 'Isquios (fuerza en peso muerto) → glúteo → cuádriceps', tests: ['deadlift'], items: [
        P('deadlift', 3, 4, 2, 210, { pct: 77.5 }),
        P('lying_curl', 3, [8, 12], 1, 75),
        P('hip_thrust', 3, [6, 10], 2, 120),
        P('hack', 3, [8, 10], 2, 120),
        P('bulgarian', 3, [8, 10], 2, 75)
      ] }
    ]
  },
  {
    id: 'm4', short: 'M4', name: 'Hipertrofia · Especialización pecho', color: '#F2B84B',
    goal: 'Máximo volumen para pecho, con hombro y pierna altos',
    description: 'Bloque de especialización: pecho a ~19 series por semana (3 ejercicios cada día de torso), hombro ~15 y pierna completa ~28. La espalda baja a volumen de mantenimiento-progreso. 3 semanas duras y 1 de descarga.',
    weeks: [
      { label: 'Semana 1' },
      { label: 'Semana 2', rirAdj: -1 },
      { label: 'Semana 3', rirAdj: -1, note: 'Lleva las series de aislamiento a RIR 0-1.' },
      { label: 'Semana 4 · Descarga', deload: true }
    ],
    days: [
      { id: 'm4d1', name: 'Torso A', focus: 'Pecho → hombro → espalda', items: [
        P('incline_bb', 4, [6, 10], 2, 150),
        P('machine_chest', 3, [8, 12], 2, 90),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('lat_raise', 4, [12, 20], 1, 45),
        P('bb_row', 3, [8, 10], 2, 120),
        P('lat_pulldown', 3, [10, 12], 2, 90),
        P('overhead_ext', 2, [10, 15], 1, 60, { note: 'Brazos: opcional si vas justo de tiempo.' })
      ] },
      { id: 'm4d2', name: 'Pierna A', focus: 'Cuádriceps → isquios → glúteo', items: [
        P('hack', 4, [8, 10], 2, 150),
        P('leg_press', 3, [10, 12], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('seated_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [8, 12], 2, 90)
      ] },
      { id: 'm4d3', name: 'Torso B', focus: 'Hombro → pecho → espalda', items: [
        P('db_shoulder', 4, [8, 10], 2, 120),
        P('cable_lat_raise', 4, [12, 15], 1, 45),
        P('face_pull', 3, [15, 20], 1, 45),
        P('incline_db', 3, [8, 12], 2, 120),
        P('dips', 3, [8, 12], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60),
        P('pullup', 3, [6, 10], 2, 150)
      ] },
      { id: 'm4d4', name: 'Pierna B', focus: 'Isquios → glúteo → cuádriceps', items: [
        P('rdl', 4, [8, 10], 2, 150),
        P('lying_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [10, 12], 2, 90),
        P('squat', 3, [8, 10], 2, 150),
        P('bulgarian', 3, [8, 12], 2, 75)
      ] }
    ]
  },
  {
    id: 'm5', short: 'M5', name: 'Intensificación', color: '#FF7A7A',
    goal: 'Pico de fuerza en los básicos',
    description: 'Básicos al 80-87,5 % del 1RM con pocas repeticiones al empezar cada bloque; accesorios en rangos medios. La semana 4 es descarga con test de RM para medir lo ganado.',
    weeks: [
      { label: 'Semana 1' },
      { label: 'Semana 2', pctAdj: 2.5 },
      { label: 'Semana 3', pctAdj: 5, rirAdj: -1, note: 'Semana más pesada del macrociclo.' },
      { label: 'Semana 4 · Descarga + Test RM', deload: true, test: true }
    ],
    days: [
      { id: 'm5d1', name: 'Torso A', focus: 'Pecho (fuerza en banca) → hombro → espalda', tests: ['bench'], items: [
        P('bench', 4, 4, 2, 210, { pct: 80 }),
        P('incline_db', 3, [8, 10], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60),
        P('lat_raise', 4, [12, 15], 1, 45),
        P('bb_row', 3, [6, 8], 2, 150),
        P('lat_pulldown', 3, [8, 12], 2, 90)
      ] },
      { id: 'm5d2', name: 'Pierna A', focus: 'Cuádriceps (fuerza en sentadilla) → isquios → glúteo', tests: ['squat'], items: [
        P('squat', 4, 4, 2, 210, { pct: 80 }),
        P('leg_press', 3, [8, 10], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('seated_curl', 3, [8, 12], 1, 75),
        P('hip_thrust', 3, [6, 10], 2, 90)
      ] },
      { id: 'm5d3', name: 'Torso B', focus: 'Hombro (fuerza en militar) → pecho → espalda', tests: ['ohp'], items: [
        P('ohp', 4, 5, 2, 180, { pct: 77.5 }),
        P('cable_lat_raise', 3, [12, 15], 1, 45),
        P('rear_delt', 3, [15, 20], 1, 45),
        P('db_bench', 3, [8, 10], 2, 120),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('pullup', 3, [6, 10], 2, 150),
        P('chest_row', 3, [8, 10], 2, 90)
      ] },
      { id: 'm5d4', name: 'Pierna B', focus: 'Isquios (fuerza en peso muerto) → glúteo → cuádriceps', tests: ['deadlift'], items: [
        P('deadlift', 3, 3, 2, 240, { pct: 82.5 }),
        P('lying_curl', 3, [8, 10], 1, 75),
        P('hip_thrust', 3, [6, 8], 2, 120),
        P('hack', 3, [8, 10], 2, 120),
        P('bulgarian', 3, [8, 10], 2, 75)
      ] }
    ]
  },
  {
    id: 'm6', short: 'M6', name: 'Hipertrofia final', color: '#F687B3',
    goal: 'Aprovechar la fuerza ganada para el máximo volumen útil',
    description: 'Vuelta a rangos de hipertrofia con las cargas que ahora mueves y la misma prioridad: pecho, pierna, hombro y espalda. En la última serie de los aislamientos puedes usar myo-reps. Cierra con una semana de descarga.',
    weeks: [
      { label: 'Semana 1' },
      { label: 'Semana 2', rirAdj: -1 },
      { label: 'Semana 3', rirAdj: -2, note: 'Aislamientos al fallo técnico (RIR 0).' },
      { label: 'Semana 4 · Descarga final', deload: true, note: 'Fin del macrociclo. Haz un test de RM opcional para ver tu progreso.' }
    ],
    days: [
      { id: 'm6d1', name: 'Torso A', focus: 'Pecho → hombro → espalda', items: [
        P('bench', 4, [6, 8], 2, 150),
        P('incline_db', 3, [8, 10], 2, 120),
        P('cable_fly', 3, [12, 15], 1, 60, { note: 'Última serie: myo-reps opcional.' }),
        P('lat_raise', 4, [12, 20], 1, 45),
        P('db_row', 3, [8, 12], 2, 75),
        P('lat_pulldown', 3, [10, 12], 2, 90),
        P('skull', 2, [8, 12], 1, 60, { note: 'Brazos: opcional si vas justo de tiempo.' })
      ] },
      { id: 'm6d2', name: 'Pierna A', focus: 'Cuádriceps → isquios → glúteo', items: [
        P('squat', 4, [6, 8], 2, 180),
        P('leg_press', 3, [10, 15], 2, 120),
        P('leg_ext', 3, [12, 15], 1, 60),
        P('seated_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [10, 12], 2, 90)
      ] },
      { id: 'm6d3', name: 'Torso B', focus: 'Hombro → pecho → espalda', items: [
        P('ohp', 3, [6, 8], 2, 150),
        P('cable_lat_raise', 4, [12, 15], 1, 45, { note: 'Última serie: myo-reps opcional.' }),
        P('rear_delt', 3, [15, 20], 1, 45),
        P('machine_chest', 3, [8, 12], 2, 90),
        P('pec_deck', 3, [12, 15], 1, 60),
        P('pullup', 3, [6, 10], 2, 150),
        P('cable_row', 3, [10, 12], 2, 90),
        P('incline_curl', 2, [10, 12], 1, 60, { note: 'Brazos: opcional si vas justo de tiempo.' })
      ] },
      { id: 'm6d4', name: 'Pierna B', focus: 'Isquios → glúteo → cuádriceps', items: [
        P('rdl', 4, [8, 10], 2, 150),
        P('lying_curl', 3, [10, 12], 1, 75),
        P('hip_thrust', 3, [10, 12], 2, 90),
        P('hack', 3, [10, 12], 2, 120),
        P('bulgarian', 3, [10, 12], 2, 75)
      ] }
    ]
  }
]

export const PLAN_VERSION = 2

export const TOTAL_WEEKS = MACROCYCLE.reduce((n, m) => n + m.weeks.length, 0)
export const MAX_SESSION_MIN = 75

// ---------- Prescripción resuelta para una semana concreta ----------

export interface Target {
  ex: string
  sets: number
  reps: [number, number]
  rir: number
  pct?: number
  rest: number
  note?: string
  deload: boolean
}

export function resolveTarget(meso: Mesocycle, weekIdx: number, p: Prescription): Target {
  const w = meso.weeks[Math.min(weekIdx, meso.weeks.length - 1)]
  if (w.deload) {
    return {
      ex: p.ex, sets: Math.max(2, Math.ceil(p.sets / 2)), reps: p.reps, rir: Math.max(3, p.rir + 2),
      pct: p.pct != null ? p.pct - 15 : undefined, rest: p.rest, note: p.note, deload: true
    }
  }
  return {
    ex: p.ex, sets: p.sets, reps: p.reps,
    rir: Math.max(0, Math.min(5, p.rir + (w.rirAdj ?? 0))),
    pct: p.pct != null ? p.pct + (w.pctAdj ?? 0) : undefined,
    rest: p.rest, note: p.note, deload: false
  }
}

/** Duración estimada (min): calentamiento + series × (descanso + ejecución) + cambios de ejercicio. */
export function estimateMinutes(items: { ex: string; sets: number; rest: number }[]): number {
  let s = 8 * 60
  for (const it of items) {
    const ex = getExercise(it.ex)
    const work = ex.unilateral ? 80 : 40
    s += it.sets * (work + it.rest) + 60
  }
  return Math.round(s / 60)
}

/** Series semanales por músculo (el músculo secundario cuenta como media serie). */
export function weeklyVolume(meso: Mesocycle, weekIdx = 0, secondaryWeight = 0.5): Record<Muscle, number> {
  const vol = Object.fromEntries(MUSCLES.map(m => [m.id, 0])) as Record<Muscle, number>
  for (const d of meso.days) for (const p of d.items) {
    const t = resolveTarget(meso, weekIdx, p)
    const ex = getExercise(p.ex)
    vol[ex.primary] += t.sets
    for (const s of ex.secondary ?? []) vol[s] += t.sets * secondaryWeight
  }
  return vol
}

// ---------- Calendario a partir de la fecha de inicio ----------

export const DAY_MS = 86_400_000

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
export function formatDate(d: Date, withYear = false): string {
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) })
}

export interface MesoDates { meso: Mesocycle; index: number; start: Date; end: Date; startWeek: number }

export function mesoSchedule(startISO: string): MesoDates[] {
  const start = parseISODate(startISO)
  let week = 0
  return MACROCYCLE.map((meso, index) => {
    const s = addDays(start, week * 7)
    const e = addDays(s, meso.weeks.length * 7 - 1)
    const r = { meso, index, start: s, end: e, startWeek: week }
    week += meso.weeks.length
    return r
  })
}

export interface CalendarPosition {
  status: 'before' | 'during' | 'after'
  daysUntilStart: number
  globalWeek: number // 0-based
  mesoIndex: number
  weekIndex: number
  nextMesoStart: Date | null
  end: Date
}

export function calendarPosition(startISO: string, today = new Date()): CalendarPosition {
  const sched = mesoSchedule(startISO)
  const start = sched[0].start
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((t.getTime() - start.getTime()) / DAY_MS)
  const end = sched[sched.length - 1].end
  if (days < 0) return { status: 'before', daysUntilStart: -days, globalWeek: 0, mesoIndex: 0, weekIndex: 0, nextMesoStart: start, end }
  const gw = Math.floor(days / 7)
  if (gw >= TOTAL_WEEKS) {
    const last = sched.length - 1
    return { status: 'after', daysUntilStart: 0, globalWeek: TOTAL_WEEKS - 1, mesoIndex: last, weekIndex: sched[last].meso.weeks.length - 1, nextMesoStart: null, end }
  }
  const md = sched.find(s => gw >= s.startWeek && gw < s.startWeek + s.meso.weeks.length)!
  return {
    status: 'during', daysUntilStart: 0, globalWeek: gw, mesoIndex: md.index, weekIndex: gw - md.startWeek,
    nextMesoStart: sched[md.index + 1]?.start ?? null, end
  }
}

// ---------- Cargas ----------

export function roundLoad(kg: number, step = 2.5): number {
  return Math.round(kg / step) * step
}

/** Calentamiento por aproximación para un peso de trabajo. */
export function warmupRamp(workKg: number): { pct: number; kg: number; reps: number }[] {
  if (!workKg || workKg < 30) return []
  return [
    { pct: 0, kg: 20, reps: 10 },
    { pct: 40, kg: roundLoad(workKg * 0.4), reps: 8 },
    { pct: 60, kg: roundLoad(workKg * 0.6), reps: 5 },
    { pct: 75, kg: roundLoad(workKg * 0.75), reps: 3 },
    { pct: 85, kg: roundLoad(workKg * 0.85), reps: 1 }
  ].filter((s, i, a) => i === 0 || s.kg > a[i - 1].kg)
}
