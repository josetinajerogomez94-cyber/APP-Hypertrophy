import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { db } from '../../persistence/db'
import { calcularE1RM } from '../../domain/e1rm'
import { EXERCISES, getExercise, RM_LIFTS } from '../../domain/exercises'
import { formatDate } from '../../domain/program'
import { useRMs } from '../hooks'
import { num } from './Sheet'

export const RM_PROTOCOL = 'Calienta por aproximación (barra × 10, 40 % × 8, 60 % × 5, 75 % × 3, 85 % × 1) y sube en saltos hasta una serie de 3 a 5 repeticiones en la que te queden 0-1 en reserva. Apunta esa serie: la app calcula tu 1RM sin que tengas que arriesgar con una sola repetición máxima.'

export function RmTestForm({ exerciseId, onSaved, compact }: { exerciseId?: string; onSaved?: () => void; compact?: boolean }) {
  const rms = useRMs()
  const [ex, setEx] = useState(exerciseId ?? RM_LIFTS[0])
  const [kg, setKg] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('1')
  const [saved, setSaved] = useState(false)
  const k = num(kg) ?? 0, r = num(reps) ?? 0, ri = num(rir) ?? 0
  const e1rm = calcularE1RM(k, r, ri)
  const current = rms?.[ex]

  async function save() {
    if (!e1rm) return
    await db.rmTests.add({ id: uuid(), exerciseId: ex, date: Date.now(), kg: k, reps: r, rir: ri, e1rm })
    setSaved(true); setKg(''); setReps(''); onSaved?.()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      {!exerciseId && (
        <div className="field">
          <label htmlFor="rmex">Ejercicio</label>
          <select id="rmex" value={ex} onChange={e => setEx(e.target.value)}>
            <optgroup label="Básicos del plan">{RM_LIFTS.map(id => <option key={id} value={id}>{getExercise(id).name}</option>)}</optgroup>
            <optgroup label="Otros">{EXERCISES.filter(e => !(RM_LIFTS as readonly string[]).includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>
          </select>
        </div>
      )}
      {exerciseId && <p className="mb0"><b>{getExercise(ex).name}</b></p>}
      <p className="small muted">{current ? `1RM actual: ${current.e1rm} kg (${formatDate(new Date(current.date), true)})` : 'Todavía no tienes 1RM registrado.'}</p>
      {!compact && <p className="small muted">{RM_PROTOCOL}</p>}
      <div className="grid3">
        <div><label className="small" htmlFor={`k-${ex}`}>Kg</label><input id={`k-${ex}`} type="text" inputMode="decimal" value={kg} onChange={e => setKg(e.target.value)} placeholder="100" /></div>
        <div><label className="small" htmlFor={`r-${ex}`}>Reps</label><input id={`r-${ex}`} type="text" inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)} placeholder="3-5" /></div>
        <div><label className="small" htmlFor={`i-${ex}`}>RIR</label>
          <select id={`i-${ex}`} value={rir} onChange={e => setRir(e.target.value)}>{[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <div className="note ok">1RM estimado: <b>{e1rm ? `${e1rm} kg` : '—'}</b>{k > 0 && r > 0 && !e1rm && <span className="danger"> · Usa una serie de 1 a 12 repeticiones hasta el fallo.</span>}</div>
      <button className="btn primary" disabled={!e1rm} onClick={save}>{saved ? '✓ Guardado' : 'Guardar como mi 1RM'}</button>
    </div>
  )
}
