export type ISODate = string // YYYY-MM-DD
export type ISODateTime = string // UTC

export interface Stamped { id: string; createdAt: ISODateTime; updatedAt: ISODateTime }

export interface Profile extends Stamped {
  weightKg: number
  heightCm: number
  level: 'principiante' | 'intermedio' | 'avanzado'
  goal: string
  targetWeightKg: number
  /** día en que empieza el macrociclo */
  startDate: ISODate
  targetDate?: ISODate
  maxSessionMin: number
  trainingDays: number[] // 0=domingo ... 6=sábado
  /** true mientras el usuario no haya confirmado los valores iniciales */
  provisional: boolean
}

export interface NutritionTargets { kcal: number; protein: number; carbs: number; fat: number }

export interface AppSettings {
  id: 'settings'
  theme: 'dark' | 'light'
  secondaryMuscleWeight: number
  performanceDropThreshold: number
  backupReminderDays: number
  lastBackupAt: ISODateTime | null
  profileConfirmed: boolean
  /** mesociclo en el que el usuario dice estar (lo cambia él, nunca la app) */
  currentMeso?: number
  /** sustituciones guardadas: "idDía:posición" → id de ejercicio */
  swaps?: Record<string, string>
  sound?: boolean
  keepAwake?: boolean
  nutrition?: NutritionTargets | null
  /** escalones de +200 kcal activados (0, 1 o 2) */
  nutritionBoost?: number
  /** Día 0 del plan nutricional y peso de ese día */
  nutritionStart?: string | null
  nutritionStartWeight?: number | null
  /** casillas marcadas de cada lista de la compra */
  shopChecked?: Record<string, string[]>
  /** comidas marcadas como hechas (solo se guarda el día actual) */
  mealsDone?: { date: string; slots: string[] }
  water?: { date: string; ml: number }
  planVersion?: number
  /** temporizador de descanso en la pantalla de bloqueo (reproduce audio) */
  lockScreenTimer?: boolean
  /** notificación al terminar el descanso */
  restNotify?: boolean
}

export interface MetaRow { id: 'meta'; schemaVersion: number; createdAt: ISODateTime }

export interface SetEntry {
  kg: number | null
  reps: number | null
  rir: number | null
  done: boolean
  doneAt?: number
}

export interface SessionExercise {
  key: string // idDía:posición (o extra-N)
  exerciseId: string
  sets: number
  reps: [number, number]
  rir: number
  pct?: number
  rest: number
  note?: string
  /** peso que proponía la app al empezar la sesión */
  suggestedKg: number | null
  entries: SetEntry[]
  comment?: string
}

export interface WorkoutSession {
  id: string
  status: 'active' | 'finished'
  startedAt: number
  finishedAt?: number
  pausedMs: number
  pausedAt?: number | null
  mesoId: string
  weekIndex: number
  dayId: string
  title: string
  deload: boolean
  exercises: SessionExercise[]
  restEndsAt?: number | null
  restTotal?: number
  notes?: string
}

export interface RmTest {
  id: string
  exerciseId: string
  date: number
  kg: number
  reps: number
  rir: number
  e1rm: number
}

export interface Measurement { id: string; type: 'weight'; date: number; value: number }

export interface Meal {
  id: string
  name: string
  foods: string
  kcal?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
}

export interface MenuDay { id: number; meals: Meal[] } // id = día de la semana (0=domingo)
