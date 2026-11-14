import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { HypertrophyDB, SCHEMA_VERSION } from '../../src/persistence/db'
import { ensureInitialData, saveProfile } from '../../src/persistence/bootstrap'
import { profileInputSchema } from '../../src/persistence/validate'

let n = 0
let db: HypertrophyDB
beforeEach(() => { db = new HypertrophyDB(`test-${++n}`) })

describe('base de datos local', () => {
  it('crea meta, perfil provisional y ajustes por defecto', async () => {
    await ensureInitialData(db)
    expect((await db.meta.get('meta'))?.schemaVersion).toBe(SCHEMA_VERSION)
    const p = await db.profile.get('profile')
    expect(p).toMatchObject({ weightKg: 92, heightCm: 196, provisional: true })
    const s = await db.settings.get('settings')
    expect(s).toMatchObject({ theme: 'dark', currentMeso: 0, sound: true })
  })
  it('no sobrescribe datos existentes al volver a inicializar', async () => {
    await ensureInitialData(db)
    await saveProfile(db, { weightKg: 90 })
    await ensureInitialData(db)
    expect((await db.profile.get('profile'))?.weightKg).toBe(90)
  })
  it('guardar el perfil lo confirma y persiste tras cerrar y reabrir', async () => {
    await ensureInitialData(db)
    await saveProfile(db, { weightKg: 93.4 })
    const name = db.name
    db.close()
    const reopened = new HypertrophyDB(name)
    const p = await reopened.profile.get('profile')
    expect(p?.weightKg).toBe(93.4)
    expect(p?.provisional).toBe(false)
    expect((await reopened.settings.get('settings'))?.profileConfirmed).toBe(true)
  })
})

describe('validación del perfil', () => {
  const ok = { weightKg: 92, heightCm: 196, targetWeightKg: 97, startDate: '2026-11-16', trainingDays: [1, 3, 5] }
  it('acepta datos válidos', () => expect(profileInputSchema.safeParse(ok).success).toBe(true))
  it('rechaza peso fuera de rango', () => expect(profileInputSchema.safeParse({ ...ok, weightKg: 5 }).success).toBe(false))
  it('rechaza fecha no válida', () => expect(profileInputSchema.safeParse({ ...ok, startDate: 'mañana' }).success).toBe(false))
})
