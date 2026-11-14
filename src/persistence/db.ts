import Dexie, { type Table } from 'dexie'
import type { AppSettings, MetaRow, Profile, WorkoutSession, RmTest, Measurement, MenuDay } from '../domain/types'

export const SCHEMA_VERSION = 2

export class HypertrophyDB extends Dexie {
  meta!: Table<MetaRow, string>
  profile!: Table<Profile, string>
  settings!: Table<AppSettings, string>
  sessions!: Table<WorkoutSession, string>
  rmTests!: Table<RmTest, string>
  measurements!: Table<Measurement, string>
  menu!: Table<MenuDay, number>

  constructor(name = 'hypertrophy-tracker') {
    super(name)
    // Versión 1 (la de Gemini). Se declara para que Dexie pueda actualizar desde ella.
    this.version(1).stores({
      meta: 'id', profile: 'id', settings: 'id', exercises: 'id, deletedAt', macrocycles: 'id',
      mesocycles: 'id, macrocycleId, startDate', microcycles: 'id, mesocycleId, weekStart',
      plannedSessions: 'id, microcycleId, date', prescriptions: 'id, exerciseId', sessions: 'id, startedAt, status',
      sessionExercises: 'id, sessionId', setLogs: 'id, sessionExerciseId, exerciseId, timestamp',
      calibrationTests: 'id, exerciseId, date', measurements: 'id, type, date', photos: 'id, date',
      alerts: 'id, status', records: 'id, exerciseId'
    })
    // Versión 2: el plan vive en el código; aquí solo se guardan TUS datos.
    // Se conservan perfil, ajustes y peso corporal. Las tablas de la v1 que nunca llegaron a usarse se eliminan.
    this.version(2).stores({
      meta: 'id', profile: 'id', settings: 'id', measurements: 'id, type, date',
      sessions: 'id, startedAt, status, mesoId',
      rmTests: 'id, exerciseId, date',
      menu: 'id',
      exercises: null, macrocycles: null, mesocycles: null, microcycles: null, plannedSessions: null,
      prescriptions: null, sessionExercises: null, setLogs: null, calibrationTests: null, photos: null,
      alerts: null, records: null
    }).upgrade(async tx => {
      // Las "sesiones" de la v1 no tenían el formato actual (y nunca se guardaron desde la app).
      await tx.table('sessions').clear()
      await tx.table('meta').put({ id: 'meta', schemaVersion: 2, createdAt: new Date().toISOString() })
    })
  }
}

export const db = new HypertrophyDB()
