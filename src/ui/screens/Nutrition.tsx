import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../persistence/db'
import { updateSettings } from '../../persistence/bootstrap'
import {
  BATCH, BATCH_RULES, DAY_NOTES, HYDRATION_TARGET_ML, KIND_LABEL, TRIPS, basicsList, dayPlan, itemLabel, macros, shoppingList, targetsFor,
  type ShopLine
} from '../../domain/nutritionPlan'
import { formatDate, parseISODate, toISODate, DAY_MS } from '../../domain/program'
import type { AppSettings } from '../../domain/types'
import { useSettings } from '../hooks'
import { WeightTracker } from '../components/WeightTracker'
import { num } from '../components/Sheet'

const DAYS = [
  { id: 1, s: 'L', l: 'Lunes' }, { id: 2, s: 'M', l: 'Martes' }, { id: 3, s: 'X', l: 'Miércoles' }, { id: 4, s: 'J', l: 'Jueves' },
  { id: 5, s: 'V', l: 'Viernes' }, { id: 6, s: 'S', l: 'Sábado' }, { id: 0, s: 'D', l: 'Domingo' }
]
type Tab = 'hoy' | 'compra' | 'batch' | 'peso'
const todayISO = () => toISODate(new Date())

export default function Nutrition() {
  const settings = useSettings()
  const [tab, setTab] = useState<Tab>('hoy')
  if (!settings) return <p className="muted">Cargando…</p>
  return (
    <>
      <h1>Dieta</h1>
      <div className="seg" role="group" aria-label="Sección" style={{ marginBottom: '.875rem' }}>
        {([['hoy', 'Menú'], ['compra', 'Compra'], ['batch', 'Batch'], ['peso', 'Peso']] as [Tab, string][]).map(([id, l]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>
      {tab === 'hoy' && <Menu s={settings} />}
      {tab === 'compra' && <Shopping s={settings} />}
      {tab === 'batch' && <Batch />}
      {tab === 'peso' && <Weight s={settings} />}
    </>
  )
}

// ---------------------------------------------------------------- Menú

function Menu({ s }: { s: AppSettings }) {
  const today = new Date().getDay()
  const [day, setDay] = useState(today)
  const boost = s.nutritionBoost ?? 0
  const plan = dayPlan(day, boost)
  const t = targetsFor(boost)
  const isToday = day === today
  const done = s.mealsDone?.date === todayISO() ? s.mealsDone.slots : []
  const total = macros(plan.flatMap(m => m.items))
  const eaten = macros(plan.filter(m => done.includes(m.slot)).flatMap(m => m.items))
  const shown = isToday ? eaten : total
  const water = s.water?.date === todayISO() ? s.water.ml : 0

  const toggle = (slot: string) => {
    const slots = done.includes(slot) ? done.filter(x => x !== slot) : [...done, slot]
    updateSettings(db, { mealsDone: { date: todayISO(), slots } })
  }
  const addWater = (ml: number) => updateSettings(db, { water: { date: todayISO(), ml: Math.max(0, water + ml) } })

  return (
    <>
      <div className="seg" role="group" aria-label="Día de la semana" style={{ marginBottom: '.875rem' }}>
        {DAYS.map(d => <button key={d.id} aria-pressed={d.id === day} aria-label={d.l} onClick={() => setDay(d.id)}>{d.s}{d.id === today ? '•' : ''}</button>)}
      </div>

      <section className="card">
        <div className="h-row"><h2 className="mb0">{DAYS.find(d => d.id === day)!.l}{isToday ? ' (hoy)' : ''}</h2>
          {boost > 0 && <span className="chip warn">+{200 * boost} kcal</span>}</div>
        {DAY_NOTES[day] && <div className="note">{DAY_NOTES[day]}</div>}
        <p className="tiny muted">{isToday ? 'Comido hasta ahora (marca cada comida al terminarla):' : 'Total planificado del día:'}</p>
        <Bar label="Calorías" v={shown.kcal} t={isToday ? t.kcal : total.kcal} unit="kcal" />
        <Bar label="Proteína" v={shown.protein} t={isToday ? t.protein : total.protein} unit="g" />
        <Bar label="Hidratos" v={shown.carbs} t={isToday ? t.carbs : total.carbs} unit="g" />
        <Bar label="Grasas" v={shown.fat} t={isToday ? t.fat : total.fat} unit="g" />
        {!isToday && <p className="tiny muted mb0">Objetivo diario: {t.kcal} kcal · P {t.protein} · HC {t.carbs} · G {t.fat}</p>}
      </section>

      {plan.map(m => {
        const mm = macros(m.items)
        const ok = isToday && done.includes(m.slot)
        return (
          <section key={m.slot} className="card" style={ok ? { borderColor: 'var(--ok)' } : undefined}>
            <details>
              <summary>
                <div className="row">
                  <span className="chip">{m.time}</span>
                  <b className="grow small">{m.name.split(' · ')[1] ?? m.name}</b>
                  {ok && <span className="ok">✓</span>}
                </div>
                <div className="tiny muted mt">{m.name.split(' · ')[0]} · {mm.kcal} kcal · P {mm.protein} · HC {mm.carbs} · G {mm.fat}</div>
              </summary>
              <ul className="list mt">{m.items.map((it, i) => <li key={i} className="small">{itemLabel(it)}</li>)}</ul>
              <div className="note small">{m.how}</div>
            </details>
            {isToday && <button className={`btn small mt${ok ? ' ok' : ''}`} style={{ width: '100%' }} onClick={() => toggle(m.slot)}>{ok ? '✓ Completada' : 'Marcar como completada'}</button>}
          </section>
        )
      })}

      {isToday && (
        <section className="card">
          <h2>💧 Agua</h2>
          <div className="kv"><span className="muted">Hoy</span><b>{(water / 1000).toFixed(2).replace('.', ',')} / {HYDRATION_TARGET_ML / 1000} L</b></div>
          <div className="bar"><i style={{ width: `${Math.min(100, (water / HYDRATION_TARGET_ML) * 100)}%`, background: water >= HYDRATION_TARGET_ML ? 'var(--ok)' : undefined }} /></div>
          <div className="mt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 56px', gap: '.4rem' }}>
            <button className="btn small" style={{ width: '100%' }} onClick={() => addWater(250)}>+250 ml</button>
            <button className="btn small" style={{ width: '100%' }} onClick={() => addWater(500)}>+500 ml</button>
            <button className="btn small" style={{ width: '100%' }} onClick={() => addWater(1500)}>+1,5 L</button>
            <button className="btn small ghost" style={{ width: '100%' }} aria-label="Quitar 250 ml" onClick={() => addWater(-250)}>−</button>
          </div>
        </section>
      )}
    </>
  )
}

function Bar({ label, v, t, unit }: { label: string; v: number; t: number; unit: string }) {
  return (
    <div style={{ marginBottom: '.55rem' }}>
      <div className="kv small" style={{ padding: 0 }}><span>{label}</span><b>{v} / {t} {unit}</b></div>
      <div className="bar"><i style={{ width: `${t ? Math.min(100, (v / t) * 100) : 0}%`, background: v >= t * 0.97 ? 'var(--ok)' : undefined }} /></div>
    </div>
  )
}

// ---------------------------------------------------------------- Compra

function Shopping({ s }: { s: AppSettings }) {
  const [trip, setTrip] = useState<'A' | 'B' | 'basicos'>(new Date().getDay() >= 3 && new Date().getDay() <= 6 ? 'B' : 'A')
  const boost = s.nutritionBoost ?? 0
  const lines = trip === 'basicos' ? basicsList(boost) : shoppingList(trip === 'A' ? 0 : 1, boost)
  const checked = s.shopChecked?.[trip] ?? []
  const toggle = (id: string) => updateSettings(db, {
    shopChecked: { ...(s.shopChecked ?? {}), [trip]: checked.includes(id) ? checked.filter(x => x !== id) : [...checked, id] }
  })
  const reset = () => updateSettings(db, { shopChecked: { ...(s.shopChecked ?? {}), [trip]: [] } })
  const groups = [...new Set(lines.map(l => l.food.kind))]
  const info = trip === 'basicos' ? null : TRIPS[trip === 'A' ? 0 : 1]

  return (
    <>
      <div className="seg" role="group" aria-label="Lista" style={{ marginBottom: '.875rem' }}>
        <button aria-pressed={trip === 'A'} onClick={() => setTrip('A')}>A · Domingo</button>
        <button aria-pressed={trip === 'B'} onClick={() => setTrip('B')}>B · Miércoles</button>
        <button aria-pressed={trip === 'basicos'} onClick={() => setTrip('basicos')}>Básicos</button>
      </div>
      <section className="card">
        <div className="h-row mb0">
          <div>
            <h2 className="mb0">{info ? info.name : 'Básicos permanentes'}</h2>
            <p className="tiny muted mb0">{info ? info.covers : 'Repón cuando se acaben. Te digo cuánto gastas por semana.'}</p>
          </div>
          <span className="chip">{checked.length}/{lines.length}</span>
        </div>
      </section>
      {groups.map(g => (
        <section key={g} className="card">
          <h2>{KIND_LABEL[g]}</h2>
          {g === 'congelado' && <div className="note warn small">Saltea la bolsa entera nada más llegar a casa.</div>}
          <ul className="list">
            {lines.filter(l => l.food.kind === g).map(l => <ShopRow key={l.food.id} l={l} weekly={trip === 'basicos'} done={checked.includes(l.food.id)} onToggle={() => toggle(l.food.id)} />)}
          </ul>
        </section>
      ))}
      <button className="btn" onClick={reset}>Desmarcar todo (nueva compra)</button>
      <p className="tiny muted mt">Las cantidades salen del menú; si activas el +200 kcal, se recalculan solas.</p>
    </>
  )
}

function ShopRow({ l, done, weekly, onToggle }: { l: ShopLine; done: boolean; weekly: boolean; onToggle: () => void }) {
  const qty = weekly
    ? `Gastas ~${l.grams >= 1000 ? `${(l.grams / 1000).toFixed(1).replace('.', ',')} kg` : `${l.grams} g`}/semana · 1 ${l.food.packName} dura ~${Math.max(1, Math.round(l.food.pack / l.grams * 7))} días`
    : l.food.packName === 'unidad' || l.food.packName === 'pieza'
      ? `${l.units} ${l.food.unitName}${(l.units ?? 0) > 1 ? 's' : ''}`
      : `${l.packs} × ${l.food.packName}`
  return (
    <li>
      <label className="row" style={{ fontWeight: 500, margin: 0, opacity: done ? 0.5 : 1 }}>
        <input type="checkbox" checked={done} onChange={onToggle} style={{ width: 24, height: 24, flex: 'none' }} />
        <span className="grow">
          <span style={{ textDecoration: done ? 'line-through' : undefined }}>{l.food.name}</span>
          <div className="tiny muted">{qty}</div>
        </span>
      </label>
    </li>
  )
}

// ---------------------------------------------------------------- Batch

function Batch() {
  return (
    <>
      <section className="card" style={{ borderColor: 'var(--warn)' }}>
        <h2>🍳 Reglas del batch cooking</h2>
        <ul className="list">{BATCH_RULES.map((r, i) => <li key={i} className="small">{r}</li>)}</ul>
      </section>
      {BATCH.map(b => (
        <section key={b.id} className="card">
          <div className="h-row"><h2 className="mb0">{b.title}</h2><span className="chip">{b.time}</span></div>
          <ol className="small" style={{ paddingLeft: '1.2rem', margin: 0 }}>{b.steps.map((st, i) => <li key={i} style={{ marginBottom: '.4rem' }}>{st}</li>)}</ol>
        </section>
      ))}
    </>
  )
}

// ---------------------------------------------------------------- Peso y ajuste

function Weight({ s }: { s: AppSettings }) {
  const logs = useLiveQuery(() => db.measurements.where('type').equals('weight').sortBy('date'), [])
  const [startW, setStartW] = useState(String(s.nutritionStartWeight ?? 89).replace('.', ','))
  const start = s.nutritionStart
  const boost = s.nutritionBoost ?? 0
  const t = targetsFor(boost)
  if (!logs) return null

  const startMs = start ? parseISODate(start).getTime() : null
  const days = startMs ? Math.floor((Date.now() - startMs) / DAY_MS) : 0
  const recent = logs.filter(l => !startMs || l.date >= startMs).slice(-3)
  const current = recent.length ? Math.round((recent.reduce((n, l) => n + l.value, 0) / recent.length) * 10) / 10 : null
  const w0 = s.nutritionStartWeight ?? 89
  const gain = current != null ? Math.round((current - w0) * 10) / 10 : null
  const checkpoint = (week: number) => startMs ? formatDate(new Date(startMs + week * 7 * DAY_MS), true) : '—'

  let advice: { cls: string; text: string } | null = null
  if (start && current != null && days >= 14) {
    if (current < w0 + 0.5 && boost < 2) advice = { cls: 'warn', text: `Llevas ${days} días y tu media (${current} kg) no supera ${(w0 + 0.5).toFixed(1)} kg. Toca activar +200 kcal.` }
    else if (gain! > 0.6 * (days / 7) + 1.5) advice = { cls: 'warn', text: `Estás subiendo rápido (+${gain} kg en ${days} días). Si ves que acumulas grasa en la cintura, vuelve un escalón atrás.` }
    else advice = { cls: 'ok', text: `Vas bien: +${gain} kg en ${days} días. Mantén las calorías.` }
  } else if (start && days < 14) {
    advice = { cls: '', text: `Día ${days} de 14. Los primeros días el peso sube por glucógeno y creatina (es normal llegar a 90,5-91,5 kg). Evalúa en la semana 2.` }
  }

  return (
    <>
      <section className="card">
        <h2>Control de peso</h2>
        {!start ? (
          <>
            <p className="small">Marca el <b>Día 0</b> el día que empieces el menú. A partir de ahí te digo si hay que subir calorías.</p>
            <div className="field"><label htmlFor="w0">Peso del Día 0 (kg)</label><input id="w0" type="text" inputMode="decimal" value={startW} onChange={e => setStartW(e.target.value)} /></div>
            <button className="btn primary" onClick={() => updateSettings(db, { nutritionStart: todayISO(), nutritionStartWeight: num(startW) ?? 89 })}>Empezar hoy (Día 0)</button>
          </>
        ) : (
          <>
            <div className="grid3">
              <div className="stat"><b>{w0}</b><span>Día 0 (kg)</span></div>
              <div className="stat"><b>{current ?? '—'}</b><span>Media últimos 3</span></div>
              <div className="stat"><b className={gain != null && gain >= 0 ? 'ok' : ''}>{gain != null ? `${gain >= 0 ? '+' : ''}${gain}` : '—'}</b><span>Cambio (kg)</span></div>
            </div>
            <table className="t mt">
              <tbody>
                <tr><td>Día 0</td><td className="n">{formatDate(parseISODate(start), true)}</td><td className="n">{w0} kg</td></tr>
                <tr><td>Semana 2 (revisión)</td><td className="n">{checkpoint(2)}</td><td className="n muted">≥ {(w0 + 0.5).toFixed(1).replace('.', ',')} kg</td></tr>
                <tr><td>Semana 4</td><td className="n">{checkpoint(4)}</td><td className="n muted">≈ {(w0 + 1.5).toFixed(1).replace('.', ',')}-{(w0 + 2.5).toFixed(1).replace('.', ',')} kg</td></tr>
                <tr><td>Objetivo</td><td className="n" /><td className="n"><b>≥ 98 kg</b></td></tr>
              </tbody>
            </table>
            {advice && <div className={`note ${advice.cls}`}>{advice.text}</div>}
            <button className="btn small ghost mt" onClick={() => confirm('¿Reiniciar el Día 0?') && updateSettings(db, { nutritionStart: null })}>Cambiar Día 0</button>
          </>
        )}
      </section>

      <section className="card">
        <h2>Calorías</h2>
        <div className="seg" role="group" aria-label="Ajuste de calorías">
          {[0, 1, 2].map(b => <button key={b} aria-pressed={boost === b} onClick={() => updateSettings(db, { nutritionBoost: b })}>{b === 0 ? 'Base' : `+${200 * b} kcal`}</button>)}
        </div>
        <p className="small mt mb0">Objetivo actual: <b>{t.kcal} kcal</b> · P {t.protein} g · HC {t.carbs} g · G {t.fat} g</p>
        <p className="tiny muted">Cada escalón de +200 kcal añade al shaker 30 g de avena, 10 g de crema de cacahuete y 10 g de miel. Son básicos de despensa, así que no deja ningún envase a medias. El menú se actualiza solo.</p>
      </section>

      <WeightTracker />
    </>
  )
}
