import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../../persistence/db'
import { updateSettings } from '../../persistence/bootstrap'
import type { Meal, MenuDay, NutritionTargets } from '../../domain/types'
import { useProfile, useSettings } from '../hooks'
import { Sheet, num } from '../components/Sheet'

const DAYS = [
  { id: 1, s: 'L', l: 'Lunes' }, { id: 2, s: 'M', l: 'Martes' }, { id: 3, s: 'X', l: 'Miércoles' }, { id: 4, s: 'J', l: 'Jueves' },
  { id: 5, s: 'V', l: 'Viernes' }, { id: 6, s: 'S', l: 'Sábado' }, { id: 0, s: 'D', l: 'Domingo' }
]
const DEFAULT_MEALS = ['Desayuno', 'Media mañana', 'Comida', 'Merienda', 'Cena']

export default function Nutrition() {
  const [day, setDay] = useState(new Date().getDay())
  const [editing, setEditing] = useState<Meal | null>(null)
  const [copyOpen, setCopyOpen] = useState(false)
  const [targetsOpen, setTargetsOpen] = useState(false)
  const menu = useLiveQuery(() => db.menu.get(day), [day])
  const settings = useSettings()
  const meals = menu?.meals ?? []
  const label = DAYS.find(d => d.id === day)!.l
  const targets = settings?.nutrition ?? null

  const sum = (k: 'kcal' | 'protein' | 'carbs' | 'fat') => meals.reduce((n, m) => n + (m[k] ?? 0), 0)
  const saveMeals = (ms: Meal[]) => db.menu.put({ id: day, meals: ms })

  function saveMeal(m: Meal) {
    const exists = meals.some(x => x.id === m.id)
    saveMeals(exists ? meals.map(x => (x.id === m.id ? m : x)) : [...meals, m])
    setEditing(null)
  }
  function move(i: number, d: number) {
    const ms = [...meals]; const j = i + d
    if (j < 0 || j >= ms.length) return
    ;[ms[i], ms[j]] = [ms[j], ms[i]]; saveMeals(ms)
  }

  return (
    <>
      <h1>Dieta</h1>
      <div className="seg" role="group" aria-label="Día de la semana" style={{ marginBottom: '.875rem' }}>
        {DAYS.map(d => (
          <button key={d.id} aria-pressed={d.id === day} onClick={() => setDay(d.id)} aria-label={d.l}>
            {d.s}{d.id === new Date().getDay() ? '•' : ''}
          </button>
        ))}
      </div>

      <section className="card">
        <div className="h-row"><h2 className="mb0">{label}{day === new Date().getDay() ? ' (hoy)' : ''}</h2>
          <button className="btn small ghost" onClick={() => setCopyOpen(true)} disabled={!meals.length}>Copiar a…</button></div>

        {!meals.length && (
          <>
            <p className="small muted">No hay menú para este día.</p>
            <button className="btn" onClick={() => saveMeals(DEFAULT_MEALS.map(n => ({ id: uuid(), name: n, foods: '' })))}>Crear con las 5 comidas típicas</button>
          </>
        )}

        <ul className="list">
          {meals.map((m, i) => (
            <li key={m.id}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <button className="grow pick" style={{ border: 0, padding: 0, margin: 0, background: 'none' }} onClick={() => setEditing(m)}>
                  <b>{m.name}</b>
                  <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{m.foods || <span className="muted">Toca para escribir qué comes</span>}</div>
                  {(m.kcal || m.protein) ? <div className="tiny muted">{m.kcal ? `${m.kcal} kcal` : ''}{m.protein ? ` · P ${m.protein} g` : ''}{m.carbs ? ` · HC ${m.carbs} g` : ''}{m.fat ? ` · G ${m.fat} g` : ''}</div> : null}
                </button>
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn small ghost" aria-label="Subir" onClick={() => move(i, -1)}>↑</button>
                  <button className="btn small ghost" aria-label="Bajar" onClick={() => move(i, 1)}>↓</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {meals.length > 0 && <button className="btn dashed mt" onClick={() => setEditing({ id: uuid(), name: '', foods: '' })}>+ Añadir comida</button>}
      </section>

      <section className="card">
        <div className="h-row"><h2 className="mb0">Totales del día</h2><button className="btn small ghost" onClick={() => setTargetsOpen(true)}>Objetivos</button></div>
        <Macro label="Calorías" v={sum('kcal')} t={targets?.kcal} unit="kcal" />
        <Macro label="Proteína" v={sum('protein')} t={targets?.protein} unit="g" />
        <Macro label="Hidratos" v={sum('carbs')} t={targets?.carbs} unit="g" />
        <Macro label="Grasas" v={sum('fat')} t={targets?.fat} unit="g" />
        {!targets && <p className="tiny muted mb0">Pon tus objetivos para ver cuánto te falta cada día.</p>}
      </section>

      {editing && <MealSheet meal={editing} onSave={saveMeal} onClose={() => setEditing(null)}
        onDelete={meals.some(x => x.id === editing.id) ? () => { saveMeals(meals.filter(x => x.id !== editing.id)); setEditing(null) } : undefined} />}
      {copyOpen && <CopySheet from={day} meals={meals} onClose={() => setCopyOpen(false)} />}
      {targetsOpen && <TargetsSheet current={targets} onClose={() => setTargetsOpen(false)} />}
    </>
  )
}

function Macro({ label, v, t, unit }: { label: string; v: number; t?: number; unit: string }) {
  return (
    <div style={{ marginBottom: '.6rem' }}>
      <div className="kv small" style={{ padding: 0 }}><span>{label}</span><b>{Math.round(v)}{t ? ` / ${t}` : ''} {unit}</b></div>
      {t ? <div className="bar"><i style={{ width: `${Math.min(100, (v / t) * 100)}%`, background: v > t * 1.05 ? 'var(--warn)' : undefined }} /></div> : null}
    </div>
  )
}

function MealSheet({ meal, onSave, onClose, onDelete }: { meal: Meal; onSave: (m: Meal) => void; onClose: () => void; onDelete?: () => void }) {
  const [m, setM] = useState(meal)
  const n = (k: keyof Meal) => (e: React.ChangeEvent<HTMLInputElement>) => setM({ ...m, [k]: num(e.target.value) })
  return (
    <Sheet title={meal.name || 'Nueva comida'} onClose={onClose}>
      <div className="field"><label htmlFor="mn">Nombre</label><input id="mn" type="text" value={m.name} placeholder="Ej.: Comida, Post-entreno…" onChange={e => setM({ ...m, name: e.target.value })} /></div>
      <div className="field"><label htmlFor="mf">Qué comes</label><textarea id="mf" value={m.foods} placeholder={'Ej.:\n150 g arroz\n200 g pechuga de pollo\nVerduras'} onChange={e => setM({ ...m, foods: e.target.value })} /></div>
      <div className="grid2">
        <div className="field"><label htmlFor="mk">Kcal</label><input id="mk" type="text" inputMode="decimal" value={m.kcal ?? ''} onChange={n('kcal')} /></div>
        <div className="field"><label htmlFor="mp">Proteína (g)</label><input id="mp" type="text" inputMode="decimal" value={m.protein ?? ''} onChange={n('protein')} /></div>
        <div className="field"><label htmlFor="mc">Hidratos (g)</label><input id="mc" type="text" inputMode="decimal" value={m.carbs ?? ''} onChange={n('carbs')} /></div>
        <div className="field"><label htmlFor="mg">Grasas (g)</label><input id="mg" type="text" inputMode="decimal" value={m.fat ?? ''} onChange={n('fat')} /></div>
      </div>
      <p className="tiny muted">Los números son opcionales.</p>
      <button className="btn primary" disabled={!m.name.trim()} onClick={() => onSave(m)}>Guardar</button>
      {onDelete && <button className="btn danger" onClick={() => confirm('¿Borrar esta comida?') && onDelete()}>Borrar</button>}
    </Sheet>
  )
}

function CopySheet({ from, meals, onClose }: { from: number; meals: Meal[]; onClose: () => void }) {
  const [to, setTo] = useState<number[]>([])
  async function copy() {
    const rows: MenuDay[] = to.map(id => ({ id, meals: meals.map(m => ({ ...m, id: uuid() })) }))
    await db.menu.bulkPut(rows)
    onClose()
  }
  return (
    <Sheet title="Copiar menú" onClose={onClose}>
      <p className="small muted">Copia el menú del {DAYS.find(d => d.id === from)!.l.toLowerCase()} a estos días (se reemplaza lo que tengan):</p>
      <div className="days" role="group">
        {DAYS.map(d => (
          <button key={d.id} type="button" disabled={d.id === from} aria-pressed={to.includes(d.id)} aria-label={d.l}
            onClick={() => setTo(x => x.includes(d.id) ? x.filter(v => v !== d.id) : [...x, d.id])}>{d.s}</button>
        ))}
      </div>
      <button className="btn primary mt" disabled={!to.length} onClick={copy}>Copiar</button>
    </Sheet>
  )
}

function TargetsSheet({ current, onClose }: { current: NutritionTargets | null; onClose: () => void }) {
  const profile = useProfile()
  const [t, setT] = useState({ kcal: String(current?.kcal ?? ''), protein: String(current?.protein ?? ''), carbs: String(current?.carbs ?? ''), fat: String(current?.fat ?? '') })
  function suggest() {
    const w = profile?.weightKg ?? 80
    const kcal = Math.round((w * 33 + 300) / 50) * 50 // mantenimiento aproximado + superávit ligero para ganar músculo
    const protein = Math.round(w * 2)
    const fat = Math.round(w * 0.9)
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
    setT({ kcal: String(kcal), protein: String(protein), carbs: String(carbs), fat: String(fat) })
  }
  async function save() {
    const v = { kcal: num(t.kcal) ?? 0, protein: num(t.protein) ?? 0, carbs: num(t.carbs) ?? 0, fat: num(t.fat) ?? 0 }
    await updateSettings(db, { nutrition: v.kcal || v.protein ? v : null })
    onClose()
  }
  const f = (k: keyof typeof t, l: string) => (
    <div className="field"><label htmlFor={`t-${k}`}>{l}</label><input id={`t-${k}`} type="text" inputMode="decimal" value={t[k]} onChange={e => setT({ ...t, [k]: e.target.value })} /></div>
  )
  return (
    <Sheet title="Objetivos diarios" onClose={onClose}>
      <div className="grid2">{f('kcal', 'Kcal')}{f('protein', 'Proteína (g)')}{f('carbs', 'Hidratos (g)')}{f('fat', 'Grasas (g)')}</div>
      <button className="btn" onClick={suggest}>Calcular orientativo con mi peso</button>
      <p className="tiny muted mt">Estimación general para ganar músculo (≈2 g/kg de proteína, ligero superávit). Ajústala según evolucione tu peso: si en 2-3 semanas no sube, añade ~150-200 kcal. No sustituye a un nutricionista.</p>
      <button className="btn primary" onClick={save}>Guardar</button>
    </Sheet>
  )
}
