import type { AppSettings, Profile } from '../domain/types'
import { toISODate } from '../domain/program'
import { SCHEMA_VERSION, type HypertrophyDB } from './db'

const now = () => new Date().toISOString()

/** Próximo lunes (o hoy si es lunes). */
function nextMonday(): string {
  const d = new Date()
  const add = (8 - d.getDay()) % 7
  d.setDate(d.getDate() + add)
  return toISODate(d)
}

export const defaultProfile = (): Profile => ({
  id: 'profile',
  weightKg: 92,
  heightCm: 196,
  level: 'avanzado',
  goal: 'Ganar fuerza y masa muscular',
  targetWeightKg: 97,
  startDate: nextMonday(),
  maxSessionMin: 75,
  trainingDays: [1, 3, 5],
  provisional: true,
  createdAt: now(),
  updatedAt: now()
})

export const defaultSettings = (): AppSettings => ({
  id: 'settings',
  theme: 'dark',
  secondaryMuscleWeight: 0.5,
  performanceDropThreshold: 0.05,
  backupReminderDays: 14,
  lastBackupAt: null,
  profileConfirmed: false,
  currentMeso: 0,
  swaps: {},
  sound: true,
  keepAwake: true,
  nutrition: null
})

/** Crea los registros iniciales solo si no existen. Nunca sobrescribe datos del usuario. */
export async function ensureInitialData(db: HypertrophyDB): Promise<void> {
  await db.transaction('rw', db.meta, db.profile, db.settings, async () => {
    if (!(await db.meta.get('meta'))) await db.meta.put({ id: 'meta', schemaVersion: SCHEMA_VERSION, createdAt: now() })
    if (!(await db.profile.get('profile'))) await db.profile.put(defaultProfile())
    const s = await db.settings.get('settings')
    if (!s) await db.settings.put(defaultSettings())
    else await db.settings.put({ ...defaultSettings(), ...s }) // añade campos nuevos sin tocar los existentes
  })
}

export async function saveProfile(db: HypertrophyDB, patch: Partial<Profile>): Promise<void> {
  await db.transaction('rw', db.profile, db.settings, async () => {
    const current = (await db.profile.get('profile')) ?? defaultProfile()
    await db.profile.put({ ...current, ...patch, id: 'profile', provisional: false, updatedAt: now() })
    const s = (await db.settings.get('settings')) ?? defaultSettings()
    await db.settings.put({ ...s, profileConfirmed: true })
  })
}

export async function updateSettings(db: HypertrophyDB, patch: Partial<AppSettings>): Promise<void> {
  const s = (await db.settings.get('settings')) ?? defaultSettings()
  await db.settings.put({ ...s, ...patch, id: 'settings' })
}
