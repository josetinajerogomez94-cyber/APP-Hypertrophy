import Dexie, { type Table } from 'dexie'
import type { AppSettings, MetaRow, Profile, Exercise, WorkoutSession, SetLog } from '../domain/types'
import { defaultExercises } from '../domain/exerciseLibrary.seed'
import { macrocicloSeed } from '../domain/routines.seed'

export const SCHEMA_VERSION = 1

/** Tablas base para fases futuras */
type Row = { id: string }

// NUEVOS TIPOS: Le explicamos a TypeScript qué datos llevan ahora los macrociclos
export type MacrocycleRow = { id: string; name: string; durationWeeks: number }
export type MesocycleRow = { id: string; macrocycleId: string; order: number; name: string; durationWeeks: number; focus: string }
export type PlannedSessionRow = { id: string; mesocycleId: string; dayNumber: number; name: string; exercisesInfo: any }

export class HypertrophyDB extends Dexie {
  meta!: Table<MetaRow, string>
  profile!: Table<Profile, string>
  settings!: Table<AppSettings, string>
  
  exercises!: Table<Exercise, string>
  sessions!: Table<WorkoutSession, string>
  setLogs!: Table<SetLog, string>
  
  // ACTUALIZAMOS ESTAS 3 TABLAS CON SUS NUEVOS TIPOS
  macrocycles!: Table<MacrocycleRow, string>
  mesocycles!: Table<MesocycleRow, string>
  plannedSessions!: Table<PlannedSessionRow, string>
  
  // El resto sigue igual de momento
  microcycles!: Table<Row, string>
  prescriptions!: Table<Row, string>
  sessionExercises!: Table<Row, string>
  calibrationTests!: Table<Row, string>
  measurements!: Table<Row, string>
  photos!: Table<Row, string>
  alerts!: Table<Row, string>
  records!: Table<Row, string>

  constructor(name = 'hypertrophy-tracker') {
    super(name)
    // Mantenemos EXACTAMENTE tus índices originales para no romper nada
    this.version(SCHEMA_VERSION).stores({
      meta: 'id',
      profile: 'id',
      settings: 'id',
      exercises: 'id, deletedAt',
      macrocycles: 'id',
      mesocycles: 'id, macrocycleId, startDate',
      microcycles: 'id, mesocycleId, weekStart',
      plannedSessions: 'id, microcycleId, date',
      prescriptions: 'id, exerciseId',
      sessions: 'id, startedAt, status',
      sessionExercises: 'id, sessionId',
      setLogs: 'id, sessionExerciseId, exerciseId, timestamp',
      calibrationTests: 'id, exerciseId, date',
      measurements: 'id, type, date',
      photos: 'id, date',
      alerts: 'id, status',
      records: 'id, exerciseId'
    })
  }
}

export const db = new HypertrophyDB()

// Truco mágico: Cuando la base de datos esté lista, inyectamos los datos por defecto
db.on('ready', async () => {
  const exerciseCount = await db.exercises.count()
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd(defaultExercises)
  }

  const macroCount = await db.macrocycles.count()
  if (macroCount === 0) {
    await db.macrocycles.put({ 
      id: macrocicloSeed.id, 
      name: macrocicloSeed.name,
      durationWeeks: macrocicloSeed.durationWeeks
    })

    for (const meso of macrocicloSeed.mesocycles) {
      await db.mesocycles.put({
        id: meso.id,
        macrocycleId: meso.macrocycleId,
        order: meso.order,
        name: meso.name,
        durationWeeks: meso.durationWeeks,
        focus: meso.focus
      })

      for (const workout of meso.workouts) {
        const sessionId = `${meso.id}-day-${workout.dayNumber}`;
        
        await db.plannedSessions.put({
          id: sessionId,
          mesocycleId: meso.id,
          dayNumber: workout.dayNumber,
          name: workout.name,
          exercisesInfo: workout.exercises 
        })
      }
    }
    console.log("✅ Macrociclo de 98kg inyectado con éxito en la base de datos.");
  }
})