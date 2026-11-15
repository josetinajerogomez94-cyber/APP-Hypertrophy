import { describe, it, expect } from 'vitest'
import { dayPlan, macros, shoppingList, weeklyNeed, FOODS, BASE_TARGETS } from '../../src/domain/nutritionPlan'

describe('plan nutricional', () => {
  const week = [0, 1, 2, 3, 4, 5, 6].map(d => macros(dayPlan(d).flatMap(m => m.items)))
  const avg = (k: keyof typeof week[0]) => week.reduce((n, x) => n + x[k], 0) / 7
  it('la media semanal ronda las 3.350 kcal y los macros objetivo', () => {
    expect(Math.abs(avg('kcal') - BASE_TARGETS.kcal)).toBeLessThan(120)
    expect(avg('protein')).toBeGreaterThanOrEqual(190)
    expect(avg('protein')).toBeLessThanOrEqual(225)
    expect(avg('carbs')).toBeGreaterThanOrEqual(400)
    expect(avg('fat')).toBeGreaterThanOrEqual(75)
    expect(avg('fat')).toBeLessThanOrEqual(100)
  })
  it('ningún día se aleja más de 300 kcal del objetivo', () => {
    for (const d of week) expect(Math.abs(d.kcal - BASE_TARGETS.kcal)).toBeLessThan(350)
  })
  it('+200 kcal añade ~200 kcal', () => {
    const b = [0, 1, 2, 3, 4, 5, 6].map(d => macros(dayPlan(d, 1).flatMap(m => m.items)).kcal - week[d].kcal)
    for (const x of b) expect(x).toBeGreaterThan(150)
  })
  it('se gasta el 100 % de cada envase a la semana (sin sobrantes)', () => {
    for (const b of [0, 1, 2]) for (const [id, g] of Object.entries(weeklyNeed(b))) {
      const f = FOODS[id]
      if (f.kind === 'basico') continue
      const unit = f.unitG && (f.packName === 'unidad' || f.packName === 'pieza') ? f.unitG : f.pack
      expect(Math.abs(g / unit - Math.round(g / unit)), `${id}: ${g} g de ${unit}`).toBeLessThan(0.01)
    }
  })
  it('cada compra usa bandejas enteras de carne/pescado y 1 bolsa de verdura', () => {
    for (const t of [0, 1]) for (const l of shoppingList(t)) {
      if (['pollo', 'picada', 'ternera', 'merluza', 'verdura'].includes(l.food.id)) expect(l.leftover, `${t} ${l.food.id}`).toBe(0)
    }
    expect(shoppingList(0).find(l => l.food.id === 'verdura')?.packs).toBe(1)
    expect(shoppingList(1).find(l => l.food.id === 'verdura')?.packs).toBe(1)
    expect(shoppingList(0).find(l => l.food.id === 'huevo')?.packs).toBe(1)
    expect(shoppingList(1).find(l => l.food.id === 'huevo')).toBeUndefined()
  })
  it('todos los alimentos existen', () => {
    for (let d = 0; d < 7; d++) for (const m of dayPlan(d)) for (const i of m.items) expect(FOODS[i.food], i.food).toBeTruthy()
  })
})
