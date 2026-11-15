/**
 * PLAN NUTRICIONAL "Camino a 98 kg" (volumen limpio)
 * Objetivo: ~3.350 kcal · P ~200-215 g · HC ~420-430 g · G ~85-90 g · agua 3,5-4 L.
 * Condiciones: sin microondas (sartén / cazo o en frío), nevera pequeña (~90 L), congelador mínimo,
 * compra en Aldi 2 veces por semana (A = domingo, B = miércoles) con raciones cuadradas a formatos reales.
 * Pesos de carne, pescado y pasta: SIEMPRE en crudo.
 * Miércoles = descanso. Sábado = entreno por la mañana.
 */

export type FoodKind = 'nevera' | 'fresco' | 'congelado' | 'despensa' | 'basico'

export interface Food {
  id: string
  name: string
  per100: [number, number, number, number] // kcal, proteína, hidratos, grasa
  kind: FoodKind
  pack: number
  packName: string
  unitG?: number
  unitName?: string
  /** se compra entero el domingo para toda la semana (aguanta y ahorra viajes) */
  weekly?: boolean
}

const WEEKLY = new Set(['huevo', 'claras', 'queso', 'pasta', 'atun', 'legumbre'])
const f = (id: string, name: string, per100: Food['per100'], kind: FoodKind, pack: number, packName: string, unitG?: number, unitName?: string): Food =>
  ({ id, name, per100, kind, pack, packName, unitG, unitName, weekly: WEEKLY.has(id) })

export const FOODS: Record<string, Food> = Object.fromEntries([
  f('avena', 'Copos / harina de avena', [372, 13.5, 58.7, 7], 'basico', 1000, 'bolsa 1 kg'),
  f('soja', 'Bebida de soja sin azúcar', [33, 3.3, 0.7, 1.8], 'despensa', 1000, 'brick 1 L'),
  f('whey', 'Whey Isolate (HSN Evolate 2.0)', [370, 85, 3, 1.5], 'basico', 2000, 'bote 2 kg'),
  f('crema', 'Crema de cacahuete 100 %', [600, 25, 12, 49], 'basico', 350, 'tarro 350 g'),
  f('miel', 'Miel', [320, 0.3, 80, 0], 'basico', 500, 'bote 500 g'),
  f('aove', 'Aceite de oliva virgen extra', [900, 0, 0, 100], 'basico', 1000, 'botella 1 L'),
  f('creatina', 'Creatina monohidrato', [0, 0, 0, 0], 'basico', 500, 'bote 500 g'),
  f('fruta', 'Manzana o kiwi', [56, 0.6, 12.5, 0.3], 'fresco', 150, 'pieza', 150, 'pieza'),
  f('platano', 'Plátano maduro', [89, 1.1, 20, 0.3], 'fresco', 120, 'unidad', 120, 'plátano'),
  f('tomate', 'Tomate', [18, 0.9, 3.9, 0.2], 'fresco', 150, 'unidad', 150, 'tomate'),
  f('pan', 'Pan de masa madre', [240, 8.5, 47, 1.5], 'despensa', 500, 'barra/hogaza 500 g'),
  f('huevo', 'Huevos L', [143, 12.6, 0.7, 9.9], 'nevera', 720, 'docena', 60, 'huevo'),
  f('claras', 'Claras de huevo pasteurizadas', [48, 11, 0.7, 0.2], 'nevera', 500, 'botella 500 ml'),
  f('queso', 'Queso fresco batido 0 %', [47, 8.3, 3.4, 0.1], 'nevera', 500, 'tarrina 500 g'),
  f('pollo', 'Pechuga de pollo o pavo', [110, 23, 0, 1.8], 'nevera', 600, 'bandeja 600 g'),
  f('picada', 'Carne picada magra', [135, 20, 0, 6], 'nevera', 500, 'bandeja 500 g'),
  f('ternera', 'Filetes de ternera', [120, 21.5, 0, 3.8], 'nevera', 500, 'bandeja 500 g'),
  f('merluza', 'Lomos de merluza', [75, 16, 0, 1.2], 'nevera', 400, 'bandeja 400 g'),
  f('verdura', 'Salteado de verduras ultracongelado', [45, 2.3, 7, 0.5], 'congelado', 750, 'bolsa 750 g (6 raciones)'),
  f('patata', 'Patatas cocidas enteras (bote)', [65, 1.8, 13, 0.2], 'despensa', 400, 'bote 400 g escurridos'),
  f('pasta', 'Pasta seca', [355, 12.5, 70, 1.5], 'despensa', 500, 'paquete 500 g'),
  f('legumbre', 'Legumbres cocidas (garbanzos/alubias/lentejas)', [115, 7, 14, 2], 'despensa', 400, 'bote grande 400 g escurridos'),
  f('atun', 'Atún al natural', [105, 24, 0, 1], 'despensa', 156, 'pack 3 latas (52 g escurrido c/u)', 52, 'lata'),
  f('tomate_t', 'Tomate triturado', [30, 1.3, 4.5, 0.2], 'despensa', 400, 'bote 400 g')
].map(x => [x.id, x]))

export interface Item { food: string; g: number; note?: string }
export interface PlanMeal { slot: 'desayuno' | 'media' | 'almuerzo' | 'merienda' | 'cena'; time: string; name: string; items: Item[]; how: string }

const VERD: Item[] = [{ food: 'verdura', g: 125, note: '1 ración del táper' }, { food: 'aove', g: 10 }]
const ENSALADA: Item[] = [{ food: 'tomate', g: 150, note: '1 tomate en ensalada' }, { food: 'aove', g: 10 }]

// ---------- Tomas fijas ----------

const desayunoSemana = (): PlanMeal => ({
  slot: 'desayuno', time: '07:00', name: 'Desayuno · Avena con soja',
  items: [{ food: 'avena', g: 100 }, { food: 'soja', g: 300, note: 'ml' }, { food: 'fruta', g: 150, note: '1 manzana o 2 kiwis' }, { food: 'miel', g: 15 }],
  how: 'En frío o templado en el cazo 2 min. Café o infusión al gusto. Truco: déjalo hecho la noche antes en un táper (overnight oats).'
})
const desayunoFinde = (): PlanMeal => ({
  slot: 'desayuno', time: '08:30', name: 'Desayuno de finde · Tostadas y huevos',
  items: [{ food: 'pan', g: 100 }, { food: 'tomate', g: 75, note: 'medio tomate rallado' }, { food: 'aove', g: 5 }, { food: 'huevo', g: 120, note: '2 huevos' }, { food: 'soja', g: 350, note: 'ml' }, { food: 'fruta', g: 150 }],
  how: 'Pan de masa madre tostado en la sartén con medio tomate rallado y aceite. 2 huevos a la plancha o revueltos.'
})
/** +200 kcal por escalón usando solo básicos de despensa (no deja nada a medias). */
const extra = (b: number): Item[] => (b ? [{ food: 'avena', g: 30 * b, note: `+${200 * b} kcal` }, { food: 'crema', g: 10 * b, note: `+${200 * b} kcal` }, { food: 'miel', g: 10 * b, note: `+${200 * b} kcal` }] : [])
const shaker = (boost: number): PlanMeal => ({
  slot: 'media', time: '11:30', name: 'Media mañana · Shaker en el trabajo',
  items: [{ food: 'whey', g: 10 }, { food: 'avena', g: 80, note: 'mejor en harina' }, { food: 'soja', g: 350, note: 'ml' }, { food: 'crema', g: 20 }, { food: 'platano', g: 120 }, ...extra(boost)],
  how: 'Lleva los polvos (whey + harina de avena) en el shaker y la soja en una botella. Agita bien. Crema de cacahuete y plátano, aparte o dentro.'
})
const bolRecuperador = (): PlanMeal => ({
  slot: 'merienda', time: '18:45', name: 'Post-entreno · Bol recuperador',
  items: [{ food: 'queso', g: 250, note: 'media tarrina' }, { food: 'platano', g: 120 }, { food: 'miel', g: 25 }, { food: 'avena', g: 30 }, { food: 'creatina', g: 5, note: '5 g' }],
  how: 'Queso batido + plátano en rodajas + miel + avena. Añade la creatina (también los días de descanso).'
})
const batidoSabado = (): PlanMeal => ({
  slot: 'merienda', time: '13:30', name: 'Post-entreno (sábado) · Batido',
  items: [{ food: 'whey', g: 30 }, { food: 'soja', g: 350, note: 'ml' }, { food: 'platano', g: 120 }, { food: 'avena', g: 20 }, { food: 'miel', g: 15 }, { food: 'creatina', g: 5, note: '5 g' }],
  how: 'Nada más salir del gimnasio. Después, almuerzo a las 15:00.'
})

// ---------- Almuerzos (15:00, pre-entreno) ----------

const ALMUERZO: Record<number, () => PlanMeal> = {
  1: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo · Pollo con patatas', how: 'Pollo del batch del domingo. Saltea el bote de patatas 4 min y calienta pollo y verdura en la misma sartén con un chorrito de agua y tapa.',
    items: [{ food: 'pollo', g: 300, note: 'media bandeja ≈ 220 g cocinado' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] }),
  2: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo · Pollo con pasta', how: 'Cuece la pasta 10 min (o la noche antes). Mézclala en la sartén con el pollo y la verdura.',
    items: [{ food: 'pollo', g: 300, note: 'media bandeja' }, { food: 'pasta', g: 170 }, ...VERD] }),
  3: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo (descanso) · Legumbres con atún', how: 'Comida de despensa: enjuaga las legumbres y mézclalas con el atún, la verdura y el aceite. Fría o templada en la sartén.',
    items: [{ food: 'legumbre', g: 400, note: '1 bote grande' }, { food: 'atun', g: 104, note: '2 latas' }, ...VERD] }),
  4: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo · Picada en salsa con patatas', how: 'Media picada en tomate del batch del miércoles. Patatas salteadas 4 min y todo junto a la sartén.',
    items: [{ food: 'picada', g: 250, note: 'media bandeja ≈ 180 g cocinado' }, { food: 'tomate_t', g: 200, note: 'medio bote' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] }),
  5: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo · Ternera con patatas', how: 'Ternera del batch del miércoles, recalentada 1-2 min por lado. Patatas salteadas.',
    items: [{ food: 'ternera', g: 250, note: 'media bandeja ≈ 185 g cocinado' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] }),
  6: () => ({ slot: 'almuerzo', time: '15:00', name: 'Almuerzo · Ternera con pasta', how: 'Segunda mitad de la ternera del miércoles con pasta recién cocida.',
    items: [{ food: 'ternera', g: 250, note: 'media bandeja' }, { food: 'pasta', g: 170 }, ...VERD] }),
  0: () => ({ slot: 'almuerzo', time: '14:30', name: 'Almuerzo · Pasta con atún, tomate y pan', how: 'Comida de despensa (antes de la compra A). Pasta con atún, ensalada de tomate y pan de masa madre.',
    items: [{ food: 'pasta', g: 165 }, { food: 'atun', g: 104, note: '2 latas' }, { food: 'pan', g: 150 }, ...ENSALADA] })
}

// ---------- Cenas (21:00) ----------

const CENA: Record<number, () => PlanMeal> = {
  1: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Tortilla de patata', how: 'Dora las patatas del bote troceadas 4 min, añade 3 huevos + el resto de las claras y cuaja por los dos lados. Verdura al lado.',
    items: [{ food: 'huevo', g: 180, note: '3 huevos' }, { food: 'claras', g: 250, note: 'ml · termina la botella' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] }),
  2: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Atún con patatas', how: 'Cena de despensa: patatas salteadas 4 min con el atún y la verdura.',
    items: [{ food: 'atun', g: 104, note: '2 latas' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] }),
  3: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Merluza con pasta', how: 'Día de la compra B: los dos lomos a la plancha, 3-4 min por lado. Uno ahora y otro para mañana. Pasta recién cocida.',
    items: [{ food: 'merluza', g: 200, note: '1 lomo' }, { food: 'pasta', g: 165 }, ...VERD] }),
  4: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Merluza con pasta', how: 'El lomo que cocinaste ayer, recalentado con tapa 3 min. Pasta recién cocida.',
    items: [{ food: 'merluza', g: 200, note: '1 lomo' }, { food: 'pasta', g: 165 }, ...VERD] }),
  5: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Pasta boloñesa', how: 'Segunda mitad de la picada en tomate del miércoles con pasta recién cocida.',
    items: [{ food: 'picada', g: 250, note: 'media bandeja' }, { food: 'tomate_t', g: 200, note: 'medio bote' }, { food: 'pasta', g: 165 }, ...VERD] }),
  6: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Revuelto con pan', how: 'Revuelto de 3 huevos. Pan de masa madre y ensalada de tomate.',
    items: [{ food: 'huevo', g: 180, note: '3 huevos' }, { food: 'pan', g: 150 }, ...ENSALADA] }),
  0: () => ({ slot: 'cena', time: '21:00', name: 'Cena · Revuelto de patata y verdura', how: 'Tras el batch de la compra A. Saltea un bote de patatas con la verdura recién hecha y cuaja 2 huevos + la mitad de la botella de claras.',
    items: [{ food: 'huevo', g: 120, note: '2 huevos' }, { food: 'claras', g: 250, note: 'ml · media botella' }, { food: 'patata', g: 400, note: '1 bote' }, ...VERD] })
}

export function dayPlan(weekday: number, boost = 0): PlanMeal[] {
  const weekend = weekday === 0 || weekday === 6
  return [
    weekend ? desayunoFinde() : desayunoSemana(),
    shaker(boost),
    ALMUERZO[weekday](),
    weekday === 6 ? batidoSabado() : bolRecuperador(),
    CENA[weekday]()
  ].sort((a, b) => a.time.localeCompare(b.time))
}

export const DAY_NOTES: Record<number, string> = {
  0: 'Hoy toca la compra A y el batch cooking de la tarde.',
  3: 'Día de descanso. Hoy toca la compra B y el batch cooking. Mantén la comida igual: el músculo crece descansando.',
  6: 'Entreno por la mañana: batido nada más salir del gimnasio.'
}

export function macros(items: Item[]) {
  const t = [0, 0, 0, 0]
  for (const it of items) { const x = FOODS[it.food]; for (let i = 0; i < 4; i++) t[i] += x.per100[i] * it.g / 100 }
  return { kcal: Math.round(t[0]), protein: Math.round(t[1]), carbs: Math.round(t[2]), fat: Math.round(t[3]) }
}

export function itemLabel(it: Item): string {
  const x = FOODS[it.food]
  const qty = it.note === 'ml' ? `${it.g} ml` : `${it.g} g`
  const note = it.note && it.note !== 'ml' ? ` (${it.note})` : ''
  return `${qty} ${x.name.toLowerCase()}${note}`
}

export const BASE_TARGETS = { kcal: 3350, protein: 200, carbs: 430, fat: 88 }
export const targetsFor = (boost: number) => ({ ...BASE_TARGETS, kcal: BASE_TARGETS.kcal + 200 * boost, carbs: BASE_TARGETS.carbs + 45 * boost })

// ---------- Lista de la compra ----------

export const TRIPS = [
  { id: 'A', name: 'Compra A · Domingo', covers: 'Del domingo por la noche al almuerzo del miércoles + huevos, claras, queso batido, pasta, atún y legumbres de toda la semana', foodDays: [1, 2, 3],
    mains: [[0, 'cena'], [1, 'almuerzo'], [1, 'cena'], [2, 'almuerzo'], [2, 'cena'], [3, 'almuerzo']] as [number, PlanMeal['slot']][] },
  { id: 'B', name: 'Compra B · Miércoles', covers: 'De la cena del miércoles al almuerzo del domingo', foodDays: [4, 5, 6, 0],
    mains: [[3, 'cena'], [4, 'almuerzo'], [4, 'cena'], [5, 'almuerzo'], [5, 'cena'], [6, 'almuerzo'], [6, 'cena'], [0, 'almuerzo']] as [number, PlanMeal['slot']][] }
] as const

export interface ShopLine { food: Food; grams: number; packs: number; leftover: number; units?: number }

function needFor(days: readonly number[], mains: readonly (readonly [number, PlanMeal['slot']])[], boost: number): Record<string, number> {
  const need: Record<string, number> = {}
  const add = (m: PlanMeal) => m.items.forEach(i => { need[i.food] = (need[i.food] ?? 0) + i.g })
  for (const d of days) dayPlan(d, boost).filter(m => m.slot !== 'almuerzo' && m.slot !== 'cena').forEach(add)
  for (const [d, slot] of mains) add(dayPlan(d, boost).find(m => m.slot === slot)!)
  return need
}

/** Consumo total de la semana por alimento. */
export function weeklyNeed(boost = 0): Record<string, number> {
  const need: Record<string, number> = {}
  for (let d = 0; d < 7; d++) dayPlan(d, boost).forEach(m => m.items.forEach(i => { need[i.food] = (need[i.food] ?? 0) + i.g }))
  return need
}

/**
 * Lista de cada compra. Los productos "semanales" se compran todos el domingo.
 * El resto: la compra A coge los envases que necesita y la B el resto de la semana,
 * de modo que el total semanal son envases completos y no sobra nada.
 */
export function shoppingList(tripIdx: number, boost = 0): ShopLine[] {
  const week = weeklyNeed(boost)
  const a = needFor(TRIPS[0].foodDays, TRIPS[0].mains, boost)
  const lines: ShopLine[] = []
  for (const [id, total] of Object.entries(week)) {
    const food = FOODS[id]
    if (food.kind === 'basico') continue
    const unit = food.unitG && (food.packName === 'unidad' || food.packName === 'pieza') ? food.unitG : food.pack
    const weekPacks = Math.ceil(total / unit - 0.01)
    const aPacks = food.weekly ? weekPacks : Math.min(weekPacks, Math.ceil((a[id] ?? 0) / unit - 0.01))
    const packs = tripIdx === 0 ? aPacks : weekPacks - aPacks
    if (packs <= 0) continue
    const grams = tripIdx === 0 ? (food.weekly ? total : (a[id] ?? 0)) : total - (a[id] ?? 0)
    lines.push({ food, grams: Math.round(grams), packs, leftover: Math.max(0, Math.round(weekPacks * unit - total)), units: unit === food.unitG ? packs : undefined })
  }
  return lines.sort((x, y) => KIND_ORDER.indexOf(x.food.kind) - KIND_ORDER.indexOf(y.food.kind) || x.food.name.localeCompare(y.food.name))
}

/** Básicos de despensa / suplementos: consumo semanal para saber cuánto dura cada bote. */
export function basicsList(boost = 0): ShopLine[] {
  return toLines(weeklyNeed(boost), k => FOODS[k].kind === 'basico')
}

function toLines(need: Record<string, number>, keep: (id: string) => boolean): ShopLine[] {
  return Object.entries(need).filter(([k]) => keep(k)).map(([id, grams]) => {
    const food = FOODS[id]
    const packs = Math.ceil(grams / food.pack - 0.02)
    return { food, grams: Math.round(grams), packs, leftover: Math.max(0, Math.round(packs * food.pack - grams)), units: food.unitG ? Math.ceil(grams / food.unitG - 0.02) : undefined }
  }).sort((a, b) => KIND_ORDER.indexOf(a.food.kind) - KIND_ORDER.indexOf(b.food.kind) || a.food.name.localeCompare(b.food.name))
}

export const KIND_ORDER: FoodKind[] = ['nevera', 'fresco', 'congelado', 'despensa', 'basico']
export const KIND_LABEL: Record<FoodKind, string> = {
  nevera: 'Frescos (nevera)', fresco: 'Frutería', congelado: 'Congelados', despensa: 'Despensa', basico: 'Básicos permanentes'
}

// ---------- Batch cooking ----------

export const BATCH_RULES = [
  'Las bandejas se cocinan ENTERAS nada más llegar y se dividen por la mitad en el táper. La carne pierde ~25 % de peso al cocinarse: 300 g crudos ≈ 220 g cocinados.',
  'La bolsa de verduras se saltea ENTERA al llegar (8 min, 1 cucharada de aceite) y se guarda en un táper plano dividida en 6 raciones.',
  'Pasta: cuécela en el momento (10 min) o la noche antes. Nunca más de 1 día cocida en la nevera.',
  'Sin microondas: recalienta en sartén con un chorrito de agua y tapa, 3-4 min a fuego medio.',
  'Duración en nevera: carne cocinada 3-4 días; pescado cocinado 1 día; verdura salteada 4 días.'
]

export const BATCH = [
  {
    id: 'A', title: 'Domingo · tras la compra A', time: '≈ 30 min',
    steps: [
      'Verduras: saltea la bolsa entera 8 min → táper plano con 6 raciones.',
      'Pollo: bandeja entera (600 g) en tiras con sal, pimentón y ajo en polvo, 8-10 min → 2 raciones (almuerzos de lunes y martes).',
      'Abre las claras hoy: media botella para la cena de hoy y la otra media para la tortilla de mañana (una vez abiertas, aguantan 2-3 días).',
      'Cena: revuelto de patata, verdura recién salteada, 2 huevos y claras.'
    ]
  },
  {
    id: 'B', title: 'Miércoles · tras la compra B', time: '≈ 40 min',
    steps: [
      'Verduras: bolsa entera salteada 8 min → 6 raciones.',
      'Ternera: filetes vuelta y vuelta, 1-2 min por lado → 2 raciones (almuerzos de viernes y sábado). Quedan mejor algo jugosos, porque se recalientan.',
      'Picada: dórala entera (500 g) y añade el bote entero de tomate triturado (400 g), 10 min → 2 raciones (almuerzo del jueves y cena del viernes).',
      'Merluza: los 2 lomos a la plancha 3-4 min por lado. Uno para la cena de hoy y otro para mañana (máximo 1 día).',
      'Pan de masa madre: es para el fin de semana. Guárdalo en una bolsa de tela; la masa madre aguanta bien 4-5 días.'
    ]
  }
]

export const HYDRATION_TARGET_ML = 3750
