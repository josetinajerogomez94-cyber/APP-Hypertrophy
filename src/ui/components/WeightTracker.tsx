import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { db } from '../../persistence/db'
import { useProfile } from '../hooks'
import { num } from './Sheet'

export function WeightTracker() {
  const profile = useProfile()
  const data = useLiveQuery(() => db.measurements.where('type').equals('weight').sortBy('date'), [])
  const [value, setValue] = useState('')
  if (!data) return null
  const points = data.map(d => ({ fecha: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), peso: d.value }))
  const first = data[0]?.value, last = data[data.length - 1]?.value

  async function save() {
    const v = num(value)
    if (!v || v < 30 || v > 300) return
    await db.measurements.add({ id: uuid(), type: 'weight', date: Date.now(), value: v })
    setValue('')
  }

  return (
    <section className="card">
      <h2>Peso corporal</h2>
      <div className="row">
        <input className="grow" type="text" inputMode="decimal" placeholder={String(last ?? profile?.weightKg ?? 'kg')} value={value} onChange={e => setValue(e.target.value)} aria-label="Peso de hoy en kg" />
        <button className="btn primary small" style={{ minHeight: 52 }} onClick={save}>Guardar hoy</button>
      </div>
      <p className="tiny muted mt">Pésate en ayunas, después de ir al baño, 3-4 días por semana. Fíjate en la media, no en un día suelto. Ritmo ideal de volumen limpio: ~0,25 kg por semana (≈1 kg al mes).</p>
      {points.length > 1 ? (
        <>
          <div className="kv small"><span className="muted">Cambio total</span><b className={last! - first! >= 0 ? 'ok' : 'warn'}>{last! - first! >= 0 ? '+' : ''}{(last! - first!).toFixed(1)} kg</b></div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="fecha" stroke="var(--muted)" fontSize={11} />
                <YAxis stroke="var(--muted)" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ background: 'var(--surface-2)', border: 0, borderRadius: 8, color: 'var(--text)' }} />
                <Area type="monotone" dataKey="peso" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : <p className="small muted mb0">{points.length ? `Último registro: ${last} kg. Con dos registros verás la gráfica.` : 'Aún no hay registros.'}</p>}
      {data.length > 0 && (
        <details className="mt">
          <summary className="small accent">Ver / borrar registros</summary>
          <ul className="list">
            {[...data].reverse().map(d => (
              <li key={d.id} className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small">{new Date(d.date).toLocaleDateString('es-ES')} · <b>{d.value} kg</b></span>
                <button className="btn small ghost danger" style={{ border: 0 }} onClick={() => db.measurements.delete(d.id)}>Borrar</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
