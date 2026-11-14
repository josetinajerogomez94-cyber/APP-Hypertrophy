import { v4 as uuid } from 'uuid'
import { db } from '../persistence/db'
import { MACROCYCLE, resolveTarget, roundLoad } from '../domain/program'
import { getExercise } from '../domain/exercises'
import { suggestNext } from '../domain/progression'
import type { RmTest, SessionExercise, WorkoutSession } from '../domain/types'

export const finishedSessions = () =>
  db.sessions.where('status').equals('finished').toArray().then(s => s.sort((a, b) => b.startedAt - a.startedAt))

export const activeSession = () => db.sessions.where('status').equals('active').first()

/** Último 1RM (test más reciente) de cada ejercicio. */
export async function currentRMs(): Promise<Record<string, RmTest>> {
  const tests = await db.rmTests.orderBy('date').toArray()
  const out: Record<string, RmTest> = {}
  for (const t of tests) out[t.exerciseId] = t
  return out
}

/** Última vez que se hizo un ejercicio (prefiriendo semanas que no sean de descarga). */
export function lastPerformance(sessions: WorkoutSession[], exerciseId: string, skipDeload = true): SessionExercise | null {
  for (const s of sessions) {
    if (skipDeload && s.deload) continue
    const ex = s.exercises.find(e => e.exerciseId === exerciseId && e.entries.some(x => x.done))
    if (ex) return ex
  }
  return null
}

export function pctLoad(pct: number, rm: number | undefined, exerciseId: string): number | null {
  if (!rm) return null
  return roundLoad(rm * pct / 100, getExercise(exerciseId).increment >= 2.5 ? 2.5 : 1)
}

export function exerciseIdFor(dayId: string, idx: number, defaultId: string, swaps: Record<string, string> = {}) {
  return swaps[`${dayId}:${idx}`] ?? defaultId
}

export async function buildSession(mesoIdx: number, weekIdx: number, dayIdx: number, swaps: Record<string, string> = {}): Promise<WorkoutSession> {
  const meso = MACROCYCLE[mesoIdx]
  const day = meso.days[dayIdx]
  const week = meso.weeks[weekIdx]
  const history = await finishedSessions()
  const rms = await currentRMs()
  const exercises: SessionExercise[] = day.items.map((p, i) => {
    const t = resolveTarget(meso, weekIdx, p)
    const exId = exerciseIdFor(day.id, i, p.ex, swaps)
    let suggestedKg: number | null
    if (t.pct != null && exId === p.ex) suggestedKg = pctLoad(t.pct, rms[exId]?.e1rm, exId)
    else suggestedKg = suggestNext(lastPerformance(history, exId), t, exId).kg
    return {
      key: `${day.id}:${i}`, exerciseId: exId, sets: t.sets, reps: t.reps, rir: t.rir,
      pct: exId === p.ex ? t.pct : undefined, rest: t.rest, note: t.note, suggestedKg,
      entries: Array.from({ length: t.sets }, () => ({ kg: null, reps: null, rir: null, done: false }))
    }
  })
  return {
    id: uuid(), status: 'active', startedAt: Date.now(), pausedMs: 0, pausedAt: null,
    mesoId: meso.id, weekIndex: weekIdx, dayId: day.id,
    title: `${meso.short} · ${week.label.split(' · ')[0]} · ${day.name}`,
    deload: !!week.deload, exercises, restEndsAt: null
  }
}

export function sessionSeconds(s: WorkoutSession, now = Date.now()): number {
  const end = s.finishedAt ?? now
  const paused = s.pausedMs + (s.pausedAt ? now - s.pausedAt : 0)
  return Math.max(0, Math.floor((end - s.startedAt - paused) / 1000))
}

export function formatClock(sec: number): string {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`
}

/** Siguiente día recomendado dentro de un mesociclo: el siguiente al último que hiciste. */
export function nextDayIndex(sessions: WorkoutSession[], mesoIdx: number): { dayIdx: number; doneInMeso: number } {
  const meso = MACROCYCLE[mesoIdx]
  const inMeso = sessions.filter(s => s.mesoId === meso.id)
  if (!inMeso.length) return { dayIdx: 0, doneInMeso: 0 }
  const lastIdx = meso.days.findIndex(d => d.id === inMeso[0].dayId)
  return { dayIdx: (lastIdx + 1) % meso.days.length, doneInMeso: inMeso.length }
}

export function sessionVolume(s: WorkoutSession): { sets: number; kg: number } {
  let sets = 0, kg = 0
  for (const e of s.exercises) for (const x of e.entries) if (x.done) { sets++; kg += (x.kg ?? 0) * (x.reps ?? 0) }
  return { sets, kg }
}
