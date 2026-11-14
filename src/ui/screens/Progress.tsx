import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { db } from '../../persistence/db'
import { MACROCYCLE, weeklyVolume } from '../../domain/program'
import { getExercise, MUSCLES, type Muscle } from '../../domain/exercises'
import { calcularE1RM } from '../../domain/e1rm'
import { formatClock, sessionSeconds, sessionVolume } from '../../app/training'
import type { WorkoutSession } from '../../domain/types'
import { useFinishedSessions, useSettings } from '../hooks'
import { WeightTracker } from '../components/WeightTracker'

function startOfWeek(offset = 0): number {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7)
  return d.getTime()
}

export default function Progress() {
  const sessions = useFinishedSessions()
  const settings = useSettings()
  const [weekOffset, setWeekOffset] = useState(0)
  if (!sessions || !settings) return <p className="muted">Cargando…</p>

  const totalMin = Math.round(sessions.reduce((n, s) => n + sessionSeconds(s), 0) / 60)
  const from = startOfWeek(weekOffset), to = startOfWeek(weekOffset + 1)
  const inWeek = sessions.filter(s => s.startedAt >= from && s.startedAt < to)
  const done = muscleSets(inWeek, settings.secondaryMuscleWeight)
  const meso = MACROCYCLE[settings.currentMeso ?? 0]
  const planned = weeklyVolume(meso, 1, settings.secondaryMuscleWeight)

  return (
    <>
      <h1>Progreso</h1>
      <section className="card">
        <div className="grid3">
          <div className="stat"><b>{sessions.length}</b><span>Entrenos</span></div>
          <div className="stat"><b>{Math.floor(totalMin / 60)}h {totalMin % 60}′</b><span>Tiempo total</span></div>
          <div className="stat"><b>{sessions.length ? Math.round(totalMin / sessions.length) : 0}′</b><span>Media/sesión</span></div>
        </div>
      </section>

      <section className="card">
        <div className="h-row">
          <button className="btn small ghost" onClick={() => setWeekOffset(w => w - 1)} aria-label="Semana anterior">‹</button>
          <h2 className="mb0 center">{weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : `Semana del ${new Date(from).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}</h2>
          <button className="btn small ghost" disabled={weekOffset >= 0} onClick={() => setWeekOffset(w => w + 1)} aria-label="Semana siguiente">›</button>
        </div>
        <p className="small muted">Series efectivas por músculo frente a lo planificado en {meso.short}.</p>
        {MUSCLES.map(m => {
          const v = Math.round(done[m.id] * 10) / 10, t = Math.round(planned[m.id] * 10) / 10
          return (
            <div key={m.id} style={{ marginBottom: '.55rem' }}>
              <div className="kv small" style={{ padding: 0 }}><span>{m.label}{m.priority ? ' ★' : ''}</span><b>{v} / {t}</b></div>
              <div className="bar"><i style={{ width: `${t ? Math.min(100, (v / t) * 100) : 0}%`, background: v >= t && t > 0 ? 'var(--ok)' : undefined }} /></div>
            </div>
          )
        })}
      </section>

      <ExerciseChart sessions={sessions} />
      <WeightTracker />
      <History sessions={sessions} />
    </>
  )
}

function muscleSets(sessions: WorkoutSession[], secW: number): Record<Muscle, number> {
  const out = Object.fromEntries(MUSCLES.map(m => [m.id, 0])) as Record<Muscle, number>
  for (const s of sessions) for (const e of s.exercises) {
    const n = e.entries.filter(x => x.done).length
    const ex = getExercise(e.exerciseId)
    out[ex.primary] += n
    for (const sec of ex.secondary ?? []) out[sec] += n * secW
  }
  return out
}

function ExerciseChart({ sessions }: { sessions: WorkoutSession[] }) {
  const exIds = useMemo(() => {
    const count: Record<string, number> = {}
    for (const s of sessions) for (const e of s.exercises) count[e.exerciseId] = (count[e.exerciseId] ?? 0) + 1
    return Object.keys(count).sort((a, b) => count[b] - count[a])
  }, [sessions])
  const [sel, setSel] = useState<string | null>(null)
  const id = sel ?? exIds[0]
  if (!id) return (
    <section className="card"><h2>Evolución por ejercicio</h2><p className="small muted mb0">Aparecerá cuando termines tu primer entrenamiento.</p></section>
  )

  const points = [...sessions].reverse().flatMap(s => {
    const sets = s.exercises.filter(e => e.exerciseId === id).flatMap(e => e.entries.filter(x => x.done))
    if (!sets.length) return []
    const best = Math.max(...sets.map(x => calcularE1RM(x.kg ?? 0, x.reps ?? 0, x.rir ?? 0)))
    const top = sets.reduce((a, b) => ((b.kg ?? 0) > (a.kg ?? 0) ? b : a))
    return [{ fecha: new Date(s.startedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), e1rm: best || null, top: `${top.kg}×${top.reps}` }]
  })
  const bestEver = Math.max(0, ...points.map(p => p.e1rm ?? 0))

  return (
    <section className="card">
      <h2>Evolución por ejercicio</h2>
      <select value={id} onChange={e => setSel(e.target.value)} aria-label="Ejercicio">
        {exIds.map(x => <option key={x} value={x}>{getExercise(x).name}</option>)}
      </select>
      <div className="kv small mt"><span className="muted">Mejor 1RM estimado</span><b>{bestEver || '—'} kg</b></div>
      {points.length > 1 ? (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="fecha" stroke="var(--muted)" fontSize={11} />
              <YAxis stroke="var(--muted)" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: 0, borderRadius: 8, color: 'var(--text)' }} formatter={(v: any) => [`${v} kg`, '1RM est.']} />
              <Line type="monotone" dataKey="e1rm" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="small muted">Con dos sesiones de este ejercicio verás la gráfica.</p>}
      <ul className="list">
        {[...points].reverse().slice(0, 6).map((p, i) => (
          <li key={i} className="kv small"><span className="muted">{p.fecha}</span><span>Mejor serie {p.top} · e1RM {p.e1rm ?? '—'}</span></li>
        ))}
      </ul>
    </section>
  )
}

function History({ sessions }: { sessions: WorkoutSession[] }) {
  if (!sessions.length) return null
  return (
    <section className="card">
      <h2>Historial</h2>
      {sessions.map(s => {
        const v = sessionVolume(s)
        return (
          <details key={s.id} style={{ borderTop: '1px solid var(--line)', padding: '.55rem 0' }}>
            <summary>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b className="small">{s.title}</b>
                <span className="tiny muted">{new Date(s.startedAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="tiny muted">{formatClock(sessionSeconds(s))} · {v.sets} series · {Math.round(v.kg).toLocaleString('es-ES')} kg</div>
            </summary>
            <ul className="list mt">
              {s.exercises.map(e => (
                <li key={e.key} className="small"><b>{getExercise(e.exerciseId).name}</b>
                  <div className="muted">{e.entries.map(x => `${x.kg}×${x.reps}${x.rir != null ? ` @${x.rir}` : ''}`).join(' · ')}</div></li>
              ))}
            </ul>
            {s.notes && <p className="small muted">📝 {s.notes}</p>}
            <button className="btn small danger" onClick={() => confirm('¿Borrar este entrenamiento del historial?') && db.sessions.delete(s.id)}>Borrar entrenamiento</button>
          </details>
        )
      })}
    </section>
  )
}
