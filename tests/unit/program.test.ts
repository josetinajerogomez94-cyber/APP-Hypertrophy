import { describe, it, expect } from 'vitest'
import { MACROCYCLE, TOTAL_WEEKS, MAX_SESSION_MIN, calendarPosition, estimateMinutes, mesoSchedule, resolveTarget, weeklyVolume } from '../../src/domain/program'
import { EXERCISES, getExercise } from '../../src/domain/exercises'
import { calcularE1RM } from '../../src/domain/e1rm'
import { suggestNext } from '../../src/domain/progression'

describe('macrociclo', () => {
  it('dura 26 semanas (6 meses) y empieza con 3 días', () => {
    expect(TOTAL_WEEKS).toBe(26)
    expect(MACROCYCLE).toHaveLength(6)
    expect(MACROCYCLE[0].days).toHaveLength(3)
    expect(MACROCYCLE.slice(1).every(m => m.days.length === 4)).toBe(true)
  })
  it('ninguna sesión supera los 75 minutos en ninguna semana', () => {
    for (const m of MACROCYCLE) m.weeks.forEach((_, w) => m.days.forEach(d => {
      const min = estimateMinutes(d.items.map(p => resolveTarget(m, w, p)))
      expect(min, `${m.short} S${w + 1} ${d.name}`).toBeLessThanOrEqual(MAX_SESSION_MIN)
    }))
  })
  it('todos los ejercicios existen en la biblioteca', () => {
    const ids = new Set(EXERCISES.map(e => e.id))
    for (const m of MACROCYCLE) for (const d of m.days) for (const p of d.items) expect(ids.has(p.ex), p.ex).toBe(true)
  })
  it('respeta la prioridad pecho > pierna > hombro > espalda y no hay gemelos', () => {
    for (const m of MACROCYCLE.slice(1)) {
      const v = weeklyVolume(m, 1)
      const legs = v.cuadriceps + v.isquios + v.gluteos
      expect(v.pecho, `${m.short} pecho`).toBeGreaterThanOrEqual(15)
      expect(v.pecho, `${m.short} pecho >= hombro`).toBeGreaterThanOrEqual(v.hombros)
      expect(v.hombros, `${m.short} hombro >= 12`).toBeGreaterThanOrEqual(12)
      expect(v.espalda, `${m.short} espalda >= 10`).toBeGreaterThanOrEqual(10)
      expect(legs, `${m.short} pierna`).toBeGreaterThanOrEqual(25)
      for (const k of ['cuadriceps', 'isquios', 'gluteos'] as const) expect(v[k], `${m.short} ${k}`).toBeGreaterThanOrEqual(8)
      expect(v.gemelos).toBe(0)
    }
  })
  it('los ejercicios de cada día van agrupados por músculo (no se repite un músculo después de cambiar)', () => {
    for (const m of MACROCYCLE) for (const d of m.days) {
      const seq = d.items.map(p => getExercise(p.ex).primary)
      const seen = new Set<string>()
      seq.forEach((mu, i) => { if (i > 0 && seq[i - 1] !== mu) { expect(seen.has(mu), `${m.short} ${d.name}: ${seq.join(' → ')}`).toBe(false) } seen.add(mu) })
    }
  })
  it('la descarga reduce series y porcentaje', () => {
    const m3 = MACROCYCLE[2]
    const p = m3.days[0].items[0]
    const t = resolveTarget(m3, 4, p)
    expect(t.deload).toBe(true)
    expect(t.sets).toBeLessThan(p.sets)
    expect(t.pct).toBe(p.pct! - 15)
    expect(resolveTarget(m3, 3, p).pct).toBe(p.pct! + 7.5)
  })
})

describe('calendario', () => {
  it('calcula el mesociclo según la fecha', () => {
    const sched = mesoSchedule('2026-11-16')
    expect(sched[1].start.getDate()).toBe(14) // 4 semanas después: 14 dic
    const pos = calendarPosition('2026-11-16', new Date(2026, 11, 20))
    expect(pos.status).toBe('during')
    expect(pos.mesoIndex).toBe(1)
    expect(pos.weekIndex).toBe(0)
    expect(calendarPosition('2026-11-16', new Date(2026, 10, 10)).status).toBe('before')
  })
})

describe('cálculos', () => {
  it('e1RM', () => {
    expect(calcularE1RM(100, 1, 0)).toBe(100)
    expect(calcularE1RM(100, 5, 0)).toBeCloseTo(112.5, 0)
    expect(calcularE1RM(100, 15, 0)).toBe(0)
  })
  it('doble progresión', () => {
    const mk = (reps: number[]) => ({ entries: reps.map(r => ({ kg: 80, reps: r, rir: 2, done: true })) } as any)
    expect(suggestNext(mk([10, 10, 10]), { reps: [8, 10], rir: 2 }, 'bench').kg).toBe(82.5)
    expect(suggestNext(mk([10, 9, 8]), { reps: [8, 10], rir: 2 }, 'bench').kg).toBe(80)
    expect(suggestNext(mk([6, 6, 7]), { reps: [8, 10], rir: 2 }, 'bench').kg).toBe(77.5)
    expect(suggestNext(null, { reps: [8, 10], rir: 2 }, 'bench').kg).toBeNull()
  })
})

import { buildRestWav } from '../../src/app/restAlert'
describe('audio del descanso', () => {
  it('dura el descanso + los pitidos', () => {
    const b = buildRestWav(90, true)
    expect(b.size).toBe(44 + Math.round(91.1 * 8000))
    expect(buildRestWav(90, false).size).toBe(44 + Math.round(90.2 * 8000))
  })
})
