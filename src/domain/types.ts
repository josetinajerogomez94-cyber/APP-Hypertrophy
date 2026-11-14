export type ISODate = string // YYYY-MM-DD
export type ISODateTime = string // UTC

export interface Stamped { id: string; createdAt: ISODateTime; updatedAt: ISODateTime }

export interface Profile extends Stamped {
  weightKg: number
  heightCm: number
  level: 'principiante' | 'intermedio' | 'avanzado'
  goal: string
  targetWeightKg: number
  startDate: ISODate
  targetDate: ISODate
  maxSessionMin: number
  trainingDays: number[] // 0=domingo ... 6=sábado
  /** true mientras el usuario no haya confirmado los valores iniciales */
  provisional: boolean
}

export interface AppSettings {
  id: 'settings'
  theme: 'dark' | 'light'
  secondaryMuscleWeight: number
  performanceDropThreshold: number
  backupReminderDays: number
  lastBackupAt: ISODateTime | null
  profileConfirmed: boolean
}

export interface MetaRow { id: 'meta'; schemaVersion: number; createdAt: ISODateTime }
export interface Exercise {
  id: string;
  nombre: string;
  variante: string;
  equipamiento: string;
  musculoPrincipal: string;
  musculosSecundarios: string[];
  patronMovimiento: string;
  unidadCarga: string;
  incrementoMinKg: number;
  rangoRepsDefault: [number, number];
  rirDefault: number;
  descansoDefaultSeg: number;
  notasTecnicas: string;
  custom: boolean;
  comparabilityKey: string;
}

export interface WorkoutSession {
  id: string;
  estado: 'active' | 'paused' | 'finished' | 'abandoned';
  startedAt: number;
  finishedAt?: number;
  planSnapshot: any;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  tipo: 'warmup' | 'approach' | 'working';
  kg: number;
  reps: number;
  rirReal: number | 'unknown';
  timestamp: number;
}
