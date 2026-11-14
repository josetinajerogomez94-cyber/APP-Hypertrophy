import type { AppSettings, Profile } from '../domain/types'
import { SCHEMA_VERSION, type HypertrophyDB } from './db'

const now = () => new Date().toISOString()

export const defaultProfile = (): Profile => ({
  id: 'profile',
  weightKg: 92,
  heightCm: 196,
  level: 'avanzado',
  goal: 'Ganar masa muscular hasta el verano de 2027',
  targetWeightKg: 97, // orientativo (+5 kg); no garantiza que sea músculo
  startDate: '2026-11-09',
  targetDate: '2027-07-18',
  maxSessionMin: 75,
  trainingDays: [1, 2, 4, 5],
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
  profileConfirmed: false
})

/** Crea los registros iniciales solo si no existen. Nunca sobrescribe datos del usuario. */
export async function ensureInitialData(db: HypertrophyDB): Promise<void> {
  await db.transaction('rw', db.meta, db.profile, db.settings, async () => {
    if (!(await db.meta.get('meta'))) await db.meta.put({ id: 'meta', schemaVersion: SCHEMA_VERSION, createdAt: now() })
    if (!(await db.profile.get('profile'))) await db.profile.put(defaultProfile())
    if (!(await db.settings.get('settings'))) await db.settings.put(defaultSettings())
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
