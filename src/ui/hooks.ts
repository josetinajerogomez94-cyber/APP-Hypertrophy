import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../persistence/db'

/** undefined = cargando; null = no existe */
export const useProfile = () => useLiveQuery(async () => (await db.profile.get('profile')) ?? null, [])
export const useSettings = () => useLiveQuery(async () => (await db.settings.get('settings')) ?? null, [])
