import { MACROCYCLE, calendarPosition, estimateMinutes, resolveTarget } from './program'

/**
 * HORARIO SEMANAL
 *  - Días de entreno: M1 → lunes (tarde), miércoles y viernes (mañana).
 *                     M2 en adelante → lunes (tarde), martes, jueves y viernes (mañana).
 *  - Mañanas de entreno: despertar 6:00 · gimnasio 6:30 · salir 7:40 · en casa 7:50 · salir al trabajo 8:20.
 *  - Lunes: entra a trabajar a las 8:00 y entrena a las 17:00.
 *  - Dormir 8 h: la hora de acostarse sale de la hora de despertar del día siguiente.
 */

export const M1_DAYS = [1, 3, 5]
export const MAIN_DAYS = [1, 2, 4, 5]
export const AFTERNOON_DAYS = new Set([1])
export const SLEEP_H = 8

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const T = (h: number, m = 0) => h * 60 + m
export const toHHMM = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export const trainingDaysFor = (mesoIndex: number) => (mesoIndex === 0 ? M1_DAYS : MAIN_DAYS)

// ---------- Qué entreno toca cada día ----------

export interface Planned { mesoIndex: number; weekIndex: number; dayIndex: number; name: string; minutes: number; afternoon: boolean }

/** Entreno previsto para una fecha según la fecha de inicio y los días de entreno del mesociclo. */
export function plannedFor(date: Date, startISO: string): Planned | null {
  const pos = calendarPosition(startISO, date)
  if (pos.status !== 'during') return null
  const wd = date.getDay()
  const days = trainingDaysFor(pos.mesoIndex)
  const idx = days.indexOf(wd)
  const meso = MACROCYCLE[pos.mesoIndex]
  if (idx < 0 || idx >= meso.days.length) return null
  const day = meso.days[idx]
  const minutes = estimateMinutes(day.items.map(p => resolveTarget(meso, pos.weekIndex, p)))
  return { mesoIndex: pos.mesoIndex, weekIndex: pos.weekIndex, dayIndex: idx, name: day.name, minutes, afternoon: AFTERNOON_DAYS.has(wd) }
}

// ---------- Horas del día ----------

export interface DayTimes {
  wake: number
  gym?: { start: number; end: number; afternoon: boolean }
  home?: number
  leave?: number
  work?: number
  bed: number
}

/** Hora de despertar según el tipo de día. */
function wakeFor(date: Date, startISO: string): number {
  const wd = date.getDay()
  const p = plannedFor(date, startISO)
  if (p && !p.afternoon) return T(6)
  if (wd === 1) return T(6, 45)          // lunes: entra a las 8:00
  if (wd >= 2 && wd <= 5) return T(7)    // día laborable sin entreno por la mañana
  return T(8, 30)                        // fin de semana
}

export function dayTimes(date: Date, startISO: string): DayTimes {
  const wd = date.getDay()
  const p = plannedFor(date, startISO)
  const next = new Date(date); next.setDate(next.getDate() + 1)
  const wake = wakeFor(date, startISO)
  const bed = (wakeFor(next, startISO) - SLEEP_H * 60 + 1440) % 1440
  const t: DayTimes = { wake, bed }
  if (wd >= 1 && wd <= 5) {
    t.leave = wd === 1 ? T(7, 25) : T(8, 20)
    t.work = wd === 1 ? T(8) : T(8, 55)
  }
  if (p && !p.afternoon) {
    t.gym = { start: T(6, 30), end: T(7, 40), afternoon: false }
    t.home = T(7, 50)
  } else if (p) {
    t.gym = { start: T(17), end: T(17) + Math.max(60, p.minutes), afternoon: true }
  }
  return t
}

/** Minutos de sesión que caben en la franja de mañana (6:30 → 7:40). */
export const MORNING_WINDOW = 70
