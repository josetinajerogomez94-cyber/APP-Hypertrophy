import { useEffect, useMemo, useRef, useState } from 'react'
import { db } from '../../persistence/db'
import { updateSettings } from '../../persistence/bootstrap'
import { useUI } from '../../app/store'
import { MACROCYCLE, calendarPosition, estimateMinutes, resolveTarget, warmupRamp } from '../../domain/program'
import { alternativesFor, EXERCISES, getExercise } from '../../domain/exercises'
import { suggestNext } from '../../domain/progression'
import { calcularE1RM } from '../../domain/e1rm'
import type { RmTest, SessionExercise, WorkoutSession } from '../../domain/types'
import {
  buildSession, exerciseIdFor, formatClock, lastPerformance, nextDayIndex, pctLoad, sessionSeconds, sessionVolume
} from '../../app/training'
import { beep, unlockAudio } from '../../app/sound'
import { useActiveSession, useFinishedSessions, useProfile, useRMs, useSettings, useTick } from '../hooks'
import { RmTestForm } from '../components/RmTestForm'
import { warmupFor } from '../../domain/warmups'
import { plannedFor } from '../../domain/schedule'
import { Sheet, NumInput } from '../components/Sheet'
import { lockScreenActive, notifyRestEnd, setRestConfig, startRestAudio, stopRestAudio } from '../../app/restAlert'

export default function Train() {
  const active = useActiveSession()
  if (active === undefined) return <p className="muted">Cargando…</p>
  return active ? <ActiveWorkout key={active.id} initial={active} /> : <PickWorkout />
}

// =====================================================================
// Elegir entrenamiento
// =====================================================================

function PickWorkout() {
  const settings = useSettings()
  const profile = useProfile()
  const sessions = useFinishedSessions()
  const rms = useRMs()
  const { pick, setPick } = useUI()
  const [mesoIdx, setMesoIdx] = useState<number | null>(null)
  const [weekIdx, setWeekIdx] = useState(0)
  const [dayIdx, setDayIdx] = useState(0)
  const [starting, setStarting] = useState(false)

  const ready = settings && profile && sessions && rms
  const defaultsFor = (m: number) => {
    const meso = MACROCYCLE[m]
    const { dayIdx: d, doneInMeso } = nextDayIndex(sessions ?? [], m)
    const cal = profile ? calendarPosition(profile.startDate) : null
    const w = cal && cal.status === 'during' && cal.mesoIndex === m
      ? cal.weekIndex
      : Math.min(meso.weeks.length - 1, Math.floor(doneInMeso / meso.days.length))
    return { w, d }
  }

  useEffect(() => {
    if (!ready || mesoIdx !== null) return
    if (pick) { setMesoIdx(pick.mesoIdx); setWeekIdx(pick.weekIdx); setDayIdx(pick.dayIdx); setPick(null); return }
    const m = settings.currentMeso ?? 0
    const today = plannedFor(new Date(), profile.startDate)
    if (today && today.mesoIndex === m) { setMesoIdx(m); setWeekIdx(today.weekIndex); setDayIdx(today.dayIndex); return }
    const { w, d } = defaultsFor(m)
    setMesoIdx(m); setWeekIdx(w); setDayIdx(d)
  }, [ready])

  if (!ready || mesoIdx === null) return <p className="muted">Cargando…</p>

  const meso = MACROCYCLE[mesoIdx]
  const week = meso.weeks[weekIdx]
  const day = meso.days[dayIdx]
  const suggestedDay = nextDayIndex(sessions, mesoIdx).dayIdx
  const swaps = settings.swaps ?? {}
  const targets = day.items.map((p, i) => ({ t: resolveTarget(meso, weekIdx, p), exId: exerciseIdFor(day.id, i, p.ex, swaps), base: p.ex }))
  const minutes = estimateMinutes(targets.map(x => x.t))

  function changeMeso(m: number) {
    const { w, d } = defaultsFor(m)
    setMesoIdx(m); setWeekIdx(w); setDayIdx(d)
  }

  async function start() {
    setStarting(true)
    unlockAudio()
    const s = await buildSession(mesoIdx!, weekIdx, dayIdx, swaps)
    await db.sessions.add(s)
  }

  return (
    <>
      <h1>Entrenar</h1>
      <p className="muted small">Elige libremente cualquier mesociclo, semana y día. Te dejo marcado lo que te tocaría.</p>

      <section className="card">
        <div className="field">
          <label htmlFor="meso">Mesociclo</label>
          <select id="meso" value={mesoIdx} onChange={e => changeMeso(Number(e.target.value))}>
            {MACROCYCLE.map((m, i) => (
              <option key={m.id} value={i}>{m.short} · {m.name}{i === (settings.currentMeso ?? 0) ? '  (actual)' : ''}</option>
            ))}
          </select>
          <p className="small muted mt mb0">{meso.days.length} días/semana · {meso.goal}</p>
        </div>
        <label>Semana</label>
        <div className="seg" role="group" aria-label="Semana">
          {meso.weeks.map((w, i) => (
            <button key={i} aria-pressed={i === weekIdx} onClick={() => setWeekIdx(i)}>
              S{i + 1}{w.deload ? ' ↓' : ''}{w.test ? ' 🎯' : ''}
            </button>
          ))}
        </div>
        <p className="small muted mt mb0">{week.label}{week.deload ? ' — menos series y lejos del fallo' : ''}</p>
        {week.note && <div className="note">{week.note}</div>}
      </section>

      <section className="card">
        <h2>Día</h2>
        {meso.days.map((d, i) => {
          const est = estimateMinutes(d.items.map(p => resolveTarget(meso, weekIdx, p)))
          return (
            <button key={d.id} className="pick" aria-pressed={i === dayIdx} onClick={() => setDayIdx(i)}>
              <div className="row"><b>{d.name}</b>{i === suggestedDay && <span className="chip accent">Te toca</span>}</div>
              <div className="small muted">{d.focus} · ≈{est} min</div>
            </button>
          )
        })}
      </section>

      <section className="card">
        <div className="h-row"><h2 className="mb0">{day.name}</h2><span className="chip">≈{minutes} min</span></div>
        {week.test && day.tests?.length ? <div className="note warn">🎯 Semana de test: hoy empiezas con el test de RM de {day.tests.map(t => getExercise(t).name).join(' y ')}.</div> : null}
        <ul className="list">
          {targets.map(({ t, exId, base }, i) => {
            const kg = t.pct != null && exId === base ? pctLoad(t.pct, rms[exId]?.e1rm, exId) : null
            return (
              <li key={i}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b className="grow">{i + 1}. {getExercise(exId).name}</b>
                  {exId !== base && <span className="chip warn">cambiado</span>}
                </div>
                <div className="small muted">
                  {t.sets} × {t.reps[0] === t.reps[1] ? t.reps[0] : `${t.reps[0]}-${t.reps[1]}`} · RIR {t.rir} · desc. {formatRest(t.rest)}
                  {t.pct != null && exId === base && <> · <span className="accent">{t.pct}% 1RM{kg ? ` = ${kg} kg` : ' (sin test)'}</span></>}
                </div>
              </li>
            )
          })}
        </ul>
        <button className="btn primary mt" disabled={starting} onClick={start}>Empezar entrenamiento</button>
      </section>
    </>
  )
}

export function formatRest(s: number) {
  return s % 60 === 0 ? `${s / 60}′` : `${Math.floor(s / 60)}′${String(s % 60).padStart(2, '0')}″`
}

// =====================================================================
// Sesión en curso
// =====================================================================

function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let lock: any = null
    const req = async () => { try { lock = await (navigator as any).wakeLock.request('screen') } catch { /* no disponible */ } }
    req()
    const vis = () => { if (document.visibilityState === 'visible') req() }
    document.addEventListener('visibilitychange', vis)
    return () => { document.removeEventListener('visibilitychange', vis); try { lock?.release() } catch { /* */ } }
  }, [enabled])
}

function ActiveWorkout({ initial }: { initial: WorkoutSession }) {
  const [s, setS] = useState(initial)
  const settings = useSettings()
  const history = useFinishedSessions()
  const rms = useRMs()
  const [finishOpen, setFinishOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  useTick(1000)
  useWakeLock(settings?.keepAwake !== false)
  useEffect(() => {
    setRestConfig({ lockScreen: settings?.lockScreenTimer === true, sound: settings?.sound !== false, notify: settings?.restNotify === true })
  }, [settings?.lockScreenTimer, settings?.sound, settings?.restNotify])

  const save = (next: WorkoutSession) => { setS(next); db.sessions.put(next) }
  const meso = MACROCYCLE.find(m => m.id === s.mesoId)!
  const week = meso.weeks[s.weekIndex]
  const day = meso.days.find(d => d.id === s.dayId)!
  const paused = !!s.pausedAt
  const elapsed = sessionSeconds(s)
  const { sets: doneSets } = sessionVolume(s)
  const totalSets = s.exercises.reduce((n, e) => n + e.entries.length, 0)

  function togglePause() {
    if (paused) save({ ...s, pausedMs: s.pausedMs + (Date.now() - s.pausedAt!), pausedAt: null })
    else save({ ...s, pausedAt: Date.now() })
  }
  function updateEx(i: number, ex: SessionExercise, rest?: number) {
    const exercises = s.exercises.map((e, j) => (j === i ? ex : e))
    const next: WorkoutSession = { ...s, exercises }
    if (rest) { next.restEndsAt = Date.now() + rest * 1000; next.restTotal = rest }
    save(next)
  }
  async function discard() {
    if (!confirm('¿Descartar este entrenamiento? Se borrará todo lo apuntado en esta sesión.')) return
    stopRestAudio()
    await db.sessions.delete(s.id)
  }
  function addExercise(id: string) {
    const ex: SessionExercise = {
      key: `extra-${Date.now()}`, exerciseId: id, sets: 3, reps: [8, 12], rir: 1, rest: 90,
      suggestedKg: suggestNext(lastPerformance(history ?? [], id), { reps: [8, 12], rir: 1 }, id).kg,
      entries: Array.from({ length: 3 }, () => ({ kg: null, reps: null, rir: null, done: false }))
    }
    save({ ...s, exercises: [...s.exercises, ex] })
    setAddOpen(false)
  }

  return (
    <>
      <div className="session-top">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="grow">
            <div className="small muted">{s.title}</div>
            <div className="clock" aria-live="off">{formatClock(elapsed)}{paused && <span className="warn small"> · en pausa</span>}</div>
          </div>
          <button className="btn small" onClick={togglePause}>{paused ? 'Reanudar' : 'Pausa'}</button>
          <button className="btn small primary" onClick={() => setFinishOpen(true)}>Terminar</button>
        </div>
        <div className="bar mt"><i style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }} /></div>
        <div className="tiny muted mt">{doneSets}/{totalSets} series</div>
      </div>

      {s.deload && <div className="note warn">Semana de descarga: menos series, pesos algo más bajos y lejos del fallo.</div>}
      {week.note && !s.deload && <div className="note">{week.note}</div>}

      <WarmupCard dayName={day.name} />

      {week.test && day.tests?.length ? (
        <section className="card">
          <h2>🎯 Test de RM</h2>
          <p className="small muted">Hazlo antes que nada, con el cuerpo fresco. Calienta por aproximación y llega a una serie de 3-5 repeticiones a RIR 0-1.</p>
          {day.tests.map(t => <div key={t} className="mt"><RmTestForm exerciseId={t} compact /></div>)}
        </section>
      ) : null}

      {s.exercises.map((ex, i) => (
        <ExerciseCard key={ex.key} index={i} ex={ex} session={s} history={history ?? []} rms={rms ?? {}}
          baseId={ex.key.startsWith('extra') ? ex.exerciseId : day.items[Number(ex.key.split(':')[1])]?.ex ?? ex.exerciseId}
          onChange={(e, rest) => updateEx(i, e, rest)}
          onRemove={() => { if (confirm('¿Quitar este ejercicio de la sesión?')) save({ ...s, exercises: s.exercises.filter((_, j) => j !== i) }) }} />
      ))}

      <button className="btn dashed" onClick={() => setAddOpen(true)}>+ Añadir ejercicio</button>

      <section className="card mt">
        <label htmlFor="notes">Notas de la sesión</label>
        <textarea id="notes" value={s.notes ?? ''} placeholder="Sensaciones, molestias, sueño…" onChange={e => save({ ...s, notes: e.target.value })} />
      </section>

      <button className="btn primary" onClick={() => setFinishOpen(true)}>Terminar entrenamiento</button>
      <button className="btn danger" onClick={discard}>Descartar sesión</button>
      <div className="pad-rest" />

      <RestTimer s={s} sound={settings?.sound !== false}
        onChange={(restEndsAt, restTotal) => save({ ...s, restEndsAt, restTotal: restTotal ?? s.restTotal })} />

      {addOpen && (
        <Sheet title="Añadir ejercicio" onClose={() => setAddOpen(false)}>
          <ul className="list">
            {EXERCISES.map(e => <li key={e.id}><button className="pick" onClick={() => addExercise(e.id)}><b>{e.name}</b><div className="small muted">{e.primary}</div></button></li>)}
          </ul>
        </Sheet>
      )}
      {finishOpen && <FinishSheet s={s} history={history ?? []} onClose={() => setFinishOpen(false)} onConfirm={save} />}
    </>
  )
}

// ---------------------------------------------------------------------

function WarmupCard({ dayName }: { dayName: string }) {
  const w = warmupFor(dayName)
  const [done, setDone] = useState<number[]>([])
  const [open, setOpen] = useState(true)
  const all = done.length === w.steps.length
  return (
    <section className="card" style={all ? { borderColor: 'var(--ok)' } : undefined}>
      <button className="pick" style={{ border: 0, padding: 0, margin: 0, background: 'none' }} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="row"><b className="grow">🔥 Calentamiento · 5 min</b><span className={`chip${all ? ' ok' : ''}`}>{done.length}/{w.steps.length}</span></div>
        <div className="tiny muted">{w.title} · con goma elástica y movilidad. Después, las series de aproximación del primer ejercicio.</div>
      </button>
      {open && (
        <ul className="list mt">
          {w.steps.map((st, i) => (
            <li key={i}>
              <label className="row" style={{ fontWeight: 500, margin: 0, alignItems: 'flex-start' }}>
                <input type="checkbox" checked={done.includes(i)} style={{ width: 22, height: 22, flex: 'none', marginTop: 2 }}
                  onChange={() => { const n = done.includes(i) ? done.filter(x => x !== i) : [...done, i]; setDone(n); if (n.length === w.steps.length) setOpen(false) }} />
                <span className="grow" style={{ opacity: done.includes(i) ? .5 : 1 }}>
                  <span className="small"><b>{st.name}</b> · {st.dose}</span>
                  {st.tip && <div className="tiny muted">{st.tip}</div>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ExerciseCard({ ex, index, session, history, rms, baseId, onChange, onRemove }: {
  ex: SessionExercise; index: number; session: WorkoutSession; history: WorkoutSession[]; rms: Record<string, RmTest>
  baseId: string; onChange: (e: SessionExercise, rest?: number) => void; onRemove: () => void
}) {
  const def = getExercise(ex.exerciseId)
  const [info, setInfo] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [errRow, setErrRow] = useState<number | null>(null)
  const last = useMemo(() => lastPerformance(history, ex.exerciseId), [history, ex.exerciseId])
  const lastDate = useMemo(() => history.find(h => h.exercises.some(e => e === last))?.startedAt, [history, last])
  const sug = ex.pct != null
    ? { kg: ex.suggestedKg, text: ex.suggestedKg ? `${ex.pct}% de tu 1RM (${rms[ex.exerciseId]?.e1rm} kg) → ${ex.suggestedKg} kg` : `Trabajo al ${ex.pct}% del 1RM, pero aún no tienes test. Hazlo en Plan → Test de RM, o elige un peso para ${ex.reps[0]} reps a RIR ${ex.rir}.` }
    : suggestNext(last, { reps: ex.reps, rir: ex.rir, deload: session.deload }, ex.exerciseId)
  const repsLabel = ex.reps[0] === ex.reps[1] ? `${ex.reps[0]}` : `${ex.reps[0]}-${ex.reps[1]}`
  const workKg = ex.suggestedKg ?? sug.kg ?? null
  const ramp = def.compound && workKg ? warmupRamp(workKg) : []

  const setEntry = (i: number, patch: Partial<SessionExercise['entries'][number]>) =>
    onChange({ ...ex, entries: ex.entries.map((e, j) => (j === i ? { ...e, ...patch } : e)) })

  function placeholderKg(i: number) {
    for (let j = i - 1; j >= 0; j--) if (ex.entries[j].done && ex.entries[j].kg != null) return ex.entries[j].kg
    return ex.suggestedKg ?? sug.kg
  }

  function toggleDone(i: number) {
    unlockAudio()
    const e = ex.entries[i]
    if (e.done) { setEntry(i, { done: false }); return }
    const kg = e.kg ?? placeholderKg(i)
    const reps = e.reps ?? (ex.reps[0] === ex.reps[1] ? ex.reps[0] : null)
    if (kg == null || reps == null) { setErrRow(i); setTimeout(() => setErrRow(null), 1500); return }
    const entries = ex.entries.map((x, j) => (j === i ? { ...x, kg, reps, rir: x.rir ?? ex.rir, done: true, doneAt: Date.now() } : x))
    const isLastOfSession = session.exercises.every(se => se === ex ? entries.every(z => z.done) : se.entries.every(z => z.done))
    if (!isLastOfSession) startRestAudio(ex.rest, ex.rest, def.name) // dentro del toque: iOS lo permite
    onChange({ ...ex, entries }, isLastOfSession ? undefined : ex.rest)
  }

  function swap(id: string, remember: boolean) {
    const s = suggestNext(lastPerformance(history, id), { reps: ex.reps, rir: ex.rir, deload: session.deload }, id)
    onChange({
      ...ex, exerciseId: id, pct: id === baseId ? ex.pct : undefined,
      suggestedKg: id === baseId && ex.pct != null ? pctLoad(ex.pct, rms[id]?.e1rm, id) : s.kg,
      entries: ex.entries.map(e => (e.done ? e : { ...e, kg: null }))
    })
    if (remember && !ex.key.startsWith('extra')) {
      db.settings.get('settings').then(st => {
        const swaps = { ...(st?.swaps ?? {}) }
        if (id === baseId) delete swaps[ex.key]; else swaps[ex.key] = id
        updateSettings(db, { swaps })
      })
    }
    setSwapOpen(false)
  }

  const bestE1rm = Math.max(0, ...ex.entries.filter(e => e.done).map(e => calcularE1RM(e.kg ?? 0, e.reps ?? 0, e.rir ?? 0)))

  return (
    <section className="card ex-card">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="grow">
          <h3>{index + 1}. {def.name}</h3>
          <div className="small muted">
            {ex.entries.length} × {repsLabel} · RIR {ex.rir} · descanso {formatRest(ex.rest)}
            {ex.pct != null && <> · <span className="accent">{ex.pct}%</span></>}
          </div>
        </div>
        <button className="icon-btn" aria-label="Técnica" onClick={() => setInfo(v => !v)}><svg viewBox="0 0 24 24"><path d="M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg></button>
        <button className="icon-btn" aria-label="Cambiar ejercicio" onClick={() => setSwapOpen(true)}><svg viewBox="0 0 24 24"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" /></svg></button>
      </div>

      {info && <div className="note">{def.tips ?? 'Técnica controlada y recorrido completo.'}</div>}
      {ex.note && <div className="note">{ex.note}</div>}
      <div className="note ok small">💡 {sug.text}</div>
      {last && <p className="tiny muted mb0">Última vez{lastDate ? ` (${new Date(lastDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})` : ''}: {last.entries.filter(e => e.done).map(e => `${e.kg}×${e.reps}`).join(' · ')}</p>}

      {ramp.length > 0 && (
        <details className="mt">
          <summary className="small accent">Ver calentamiento para {workKg} kg</summary>
          <p className="small mb0">{ramp.map(r => `${r.kg} kg × ${r.reps}`).join('  →  ')}</p>
        </details>
      )}

      <div className="set-head"><span>#</span><span>Kg</span><span>Reps</span><span>RIR</span><span /></div>
      {ex.entries.map((e, i) => (
        <div key={i} className={`set-row${e.done ? ' done' : ''}${errRow === i ? ' err' : ''}`}>
          <span className="num">{i + 1}</span>
          <NumInput aria-label={`Kilos serie ${i + 1}`} placeholder={String(placeholderKg(i) ?? 'kg').replace('.', ',')}
            value={e.kg} onValue={n => setEntry(i, { kg: n })} />
          <NumInput decimal={false} aria-label={`Repeticiones serie ${i + 1}`} placeholder={repsLabel}
            value={e.reps} onValue={n => setEntry(i, { reps: n == null ? null : Math.round(n) })} />
          <select aria-label={`RIR serie ${i + 1}`} value={e.rir ?? ex.rir} onChange={v => setEntry(i, { rir: Number(v.target.value) })}>
            {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className="check" aria-label={e.done ? 'Desmarcar serie' : 'Marcar serie hecha'} onClick={() => toggleDone(i)}>✓</button>
        </div>
      ))}
      {errRow != null && <p className="error">Escribe al menos las repeticiones (y los kilos si no hay propuesta).</p>}

      <div className="row mt">
        <button className="btn small ghost" onClick={() => onChange({ ...ex, entries: [...ex.entries, { kg: null, reps: null, rir: null, done: false }] })}>+ Serie</button>
        {ex.entries.length > 1 && !ex.entries[ex.entries.length - 1].done &&
          <button className="btn small ghost" onClick={() => onChange({ ...ex, entries: ex.entries.slice(0, -1) })}>− Serie</button>}
        <span className="grow" />
        {bestE1rm > 0 && <span className="chip">e1RM {bestE1rm} kg</span>}
        <button className="btn small ghost danger" style={{ border: 0 }} onClick={onRemove}>Quitar</button>
      </div>

      {swapOpen && <SwapSheet current={ex.exerciseId} baseId={baseId} canRemember={!ex.key.startsWith('extra')} onPick={swap} onClose={() => setSwapOpen(false)} />}
    </section>
  )
}

function SwapSheet({ current, baseId, canRemember, onPick, onClose }: {
  current: string; baseId: string; canRemember: boolean; onPick: (id: string, remember: boolean) => void; onClose: () => void
}) {
  const [remember, setRemember] = useState(false)
  const options = [getExercise(baseId), ...alternativesFor(baseId)].filter(e => e.id !== current)
  return (
    <Sheet title="Cambiar ejercicio" onClose={onClose}>
      <p className="small muted">Alternativas que trabajan el mismo músculo ({getExercise(baseId).primary}). Útil si la máquina está ocupada o tienes alguna molestia.</p>
      {canRemember && (
        <label className="row small" style={{ fontWeight: 500 }}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 22, height: 22 }} />
          Usar siempre este cambio en este día del plan
        </label>
      )}
      <ul className="list mt">
        {options.map(o => (
          <li key={o.id}><button className="pick" onClick={() => onPick(o.id, remember)}>
            <b>{o.name}</b>{o.id === baseId && <span className="chip accent" style={{ marginLeft: 8 }}>original del plan</span>}
          </button></li>
        ))}
      </ul>
    </Sheet>
  )
}

// ---------------------------------------------------------------------

function RestTimer({ s, sound, onChange }: { s: WorkoutSession; sound: boolean; onChange: (endsAt: number | null, total?: number) => void }) {
  useTick(250, !!s.restEndsAt)
  const alerted = useRef<number | null>(null)
  const endsAt = s.restEndsAt
  const remaining = endsAt ? Math.ceil((endsAt - Date.now()) / 1000) : 0

  useEffect(() => {
    if (!endsAt || remaining > 0 || alerted.current === endsAt) return
    alerted.current = endsAt
    if (lockScreenActive()) return // el pitido y la notificación los da el audio de la pantalla de bloqueo
    if (sound && Date.now() - endsAt < 4000) beep()
    if (document.visibilityState === 'hidden') notifyRestEnd()
  }, [endsAt, remaining, sound])

  useEffect(() => { // se oculta solo tras 2 minutos sin tocar nada
    if (endsAt && remaining < -120) onChange(null)
  }, [endsAt, remaining])

  if (!endsAt) return null
  const over = remaining <= 0
  const total = s.restTotal || 60
  return (
    <div className={`rest${over ? ' over' : ''}`} role="timer" aria-live="polite">
      <div className="row">
        <div className="grow">
          <div className="tiny muted">{over ? '¡Descanso terminado! A por la siguiente serie' : 'Descanso'}</div>
          <div className="clock">{over ? `+${formatClock(-remaining)}` : formatClock(remaining)}</div>
        </div>
        {!over && <>
          <button className="btn small" onClick={() => { startRestAudio(remaining - 15, total); onChange(endsAt - 15000) }}>−15</button>
          <button className="btn small" onClick={() => { startRestAudio(remaining + 15, total + 15); onChange(endsAt + 15000, total + 15) }}>+15</button>
        </>}
        <button className="btn small primary" onClick={() => { stopRestAudio(); onChange(null) }}>{over ? 'OK' : 'Saltar'}</button>
      </div>
      {!over && <div className="bar mt"><i style={{ width: `${Math.max(0, Math.min(100, (remaining / total) * 100))}%` }} /></div>}
    </div>
  )
}

// ---------------------------------------------------------------------

function FinishSheet({ s, history, onClose, onConfirm }: {
  s: WorkoutSession; history: WorkoutSession[]; onClose: () => void; onConfirm: (s: WorkoutSession) => void
}) {
  const { sets, kg } = sessionVolume(s)
  const pending = s.exercises.reduce((n, e) => n + e.entries.filter(x => !x.done).length, 0)
  const prs = s.exercises.flatMap(e => {
    const best = Math.max(0, ...e.entries.filter(x => x.done).map(x => calcularE1RM(x.kg ?? 0, x.reps ?? 0, x.rir ?? 0)))
    if (!best) return []
    const prev = Math.max(0, ...history.flatMap(h => h.exercises.filter(he => he.exerciseId === e.exerciseId)
      .flatMap(he => he.entries.filter(x => x.done).map(x => calcularE1RM(x.kg ?? 0, x.reps ?? 0, x.rir ?? 0)))))
    return prev > 0 && best > prev ? [{ name: getExercise(e.exerciseId).name, best, prev }] : []
  })

  function confirmFinish() {
    stopRestAudio()
    const now = Date.now()
    const clean: WorkoutSession = {
      ...s, status: 'finished', finishedAt: now, restEndsAt: null,
      pausedMs: s.pausedMs + (s.pausedAt ? now - s.pausedAt : 0), pausedAt: null,
      exercises: s.exercises.map(e => ({ ...e, entries: e.entries.filter(x => x.done) })).filter(e => e.entries.length > 0)
    }
    onConfirm(clean)
  }

  return (
    <Sheet title="Terminar entrenamiento" onClose={onClose}>
      <div className="grid3">
        <div className="stat"><b>{formatClock(sessionSeconds(s))}</b><span>Duración</span></div>
        <div className="stat"><b>{sets}</b><span>Series</span></div>
        <div className="stat"><b>{Math.round(kg).toLocaleString('es-ES')}</b><span>Kg movidos</span></div>
      </div>
      {prs.length > 0 && (
        <div className="note ok mt">
          <b>🏆 Nuevos récords (1RM estimado)</b>
          {prs.map(p => <div key={p.name} className="small">{p.name}: {p.prev} → <b>{p.best} kg</b></div>)}
        </div>
      )}
      {pending > 0 && <div className="note warn">Te quedan {pending} series sin marcar. No se guardarán.</div>}
      <button className="btn primary mt" onClick={confirmFinish}>Guardar y terminar</button>
      <button className="btn" onClick={onClose}>Seguir entrenando</button>
    </Sheet>
  )
}
