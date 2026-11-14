import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../persistence/db'
import { currentRMs, finishedSessions } from '../app/training'

/** undefined = cargando; null = no existe */
export const useProfile = () => useLiveQuery(async () => (await db.profile.get('profile')) ?? null, [])
export const useSettings = () => useLiveQuery(async () => (await db.settings.get('settings')) ?? null, [])
export const useActiveSession = () => useLiveQuery(async () => (await db.sessions.where('status').equals('active').first()) ?? null, [])
export const useFinishedSessions = () => useLiveQuery(finishedSessions, [])
export const useRMs = () => useLiveQuery(currentRMs, [])

/** Fuerza un re-render cada `ms` milisegundos (para cronómetros). */
export function useTick(ms = 1000, enabled = true) {
  const [, set] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => set(n => n + 1), ms)
    const vis = () => set(n => n + 1)
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', vis) }
  }, [ms, enabled])
}
