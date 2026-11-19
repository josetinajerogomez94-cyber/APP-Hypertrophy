import { useState } from 'react'
import { MACROCYCLE, addDays, calendarPosition, formatDate, mesoSchedule, toISODate } from '../../domain/program'
import { DAY_NAMES, DAY_SHORT, MORNING_WINDOW, dayTimes, plannedFor, toHHMM, type DayTimes } from '../../domain/schedule'
import { warmupFor } from '../../domain/warmups'
import { useUI } from '../../app/store'
import { useFinishedSessions, useProfile } from '../hooks'
import type { WorkoutSession } from '../../domain/types'

const startOfWeek = (d: Date) => { const r = new Date(d.getFullYear(), d.getMonth(), d.getDate()); r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); return r }
const sameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b)
const abbr = (name: string) => name === 'Pierna' ? 'P' : name.split(' ').map(w => w[0]).join('')

export default function Agenda() {
  const profile = useProfile()
  const sessions = useFinishedSessions()
  const [tab, setTab] = useState<'semana' | 'mes'>('semana')
  if (!profile || !sessions) return <p className="muted">Cargando…</p>
  return (
    <>
      <h1>Agenda</h1>
      <div className="seg" role="group" aria-label="Vista" style={{ marginBottom: '.875rem' }}>
        <button aria-pressed={tab === 'semana'} onClick={() => setTab('semana')}>Horario semanal</button>
        <button aria-pressed={tab === 'mes'} onClick={() => setTab('mes')}>Calendario</button>
      </div>
      {tab === 'semana' ? <Week start={profile.startDate} sessions={sessions} /> : <Month start={profile.startDate} sessions={sessions} />}
    </>
  )
}

function doneOn(sessions: WorkoutSession[], d: Date) {
  return sessions.filter(s => sameDay(new Date(s.startedAt), d))
}

// ---------------------------------------------------------------- Semana

function Week({ start, sessions }: { start: string; sessions: WorkoutSession[] }) {
  const [offset, setOffset] = useState(0)
  const monday = addDays(startOfWeek(new Date()), offset * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const pos = calendarPosition(start, days[0])
  return (
    <>
      <div className="h-row">
        <button className="btn small ghost" aria-label="Semana anterior" onClick={() => setOffset(o => o - 1)}>‹</button>
        <div className="center">
          <b>{offset === 0 ? 'Esta semana' : offset === 1 ? 'Semana que viene' : `Semana del ${formatDate(monday)}`}</b>
          <div className="tiny muted">{pos.status === 'during' ? `${MACROCYCLE[pos.mesoIndex].short} · semana ${pos.weekIndex + 1}` : pos.status === 'before' ? 'Antes de empezar el plan' : 'Plan terminado'}</div>
        </div>
        <button className="btn small ghost" aria-label="Semana siguiente" onClick={() => setOffset(o => o + 1)}>›</button>
      </div>
      {days.map(d => <DayCard key={toISODate(d)} date={d} start={start} done={doneOn(sessions, d)} />)}
      <p className="tiny muted">Dormir 8 h: la hora de acostarte depende de a qué hora te levantas al día siguiente.</p>
    </>
  )
}

function DayCard({ date, start, done }: { date: Date; start: string; done: WorkoutSession[] }) {
  const { setTab, setPick } = useUI()
  const p = plannedFor(date, start)
  const t = dayTimes(date, start)
  const today = sameDay(date, new Date())
  const [open, setOpen] = useState(today)
  const meso = p ? MACROCYCLE[p.mesoIndex] : null
  const tooLong = p && !p.afternoon && p.minutes > MORNING_WINDOW

  return (
    <section className="card" style={{ borderColor: today ? 'var(--accent)' : undefined, ...(meso ? { borderLeft: `5px solid ${meso.color}` } : {}) }}>
      <button className="pick" style={{ border: 0, padding: 0, margin: 0, background: 'none' }} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="row">
          <b className="grow">{DAY_NAMES[date.getDay()]} {date.getDate()}{today ? ' · hoy' : ''}</b>
          {done.length > 0 && <span className="chip ok">✓ hecho</span>}
          {p ? <span className="chip accent">{p.name}{p.afternoon ? ' · tarde' : ''}</span> : <span className="chip">Descanso</span>}
        </div>
        <div className="small muted mt">⏰ {toHHMM(t.wake)}{t.gym ? ` · 🏋️ ${toHHMM(t.gym.start)}` : ''}{t.leave ? ` · 🚪 ${toHHMM(t.leave)}` : ''} · 🛏 {toHHMM(t.bed)}</div>
      </button>
      {open && (
        <div className="mt">
          <TimeTable t={t} />
          {tooLong && <div className="note warn small">La sesión de hoy dura ≈{p!.minutes} min y por la mañana tienes {MORNING_WINDOW}. Sáltate los ejercicios de brazo marcados como opcionales.</div>}
          {p && <p className="small muted mb0 mt">{meso!.short} · semana {p.weekIndex + 1} · {meso!.days[p.dayIndex].focus} · ≈{p.minutes} min · calentamiento: {warmupFor(p.name).title.toLowerCase()}</p>}
          {p && today && done.length === 0 && (
            <button className="btn primary small mt" style={{ width: '100%' }} onClick={() => { setPick({ mesoIdx: p.mesoIndex, weekIdx: p.weekIndex, dayIdx: p.dayIndex }); setTab('entrenar') }}>Preparar el entreno de hoy</button>
          )}
        </div>
      )}
    </section>
  )
}

function TimeTable({ t }: { t: DayTimes }) {
  const rows: [string, string, string][] = [['⏰', 'Despertar', toHHMM(t.wake)]]
  if (t.gym && !t.gym.afternoon) {
    rows.push(['🏋️', 'Gimnasio (5 min de movilidad + rutina)', `${toHHMM(t.gym.start)} – ${toHHMM(t.gym.end)}`])
    if (t.home != null) rows.push(['🏠', 'Llegar a casa · ducha y bol post-entreno', toHHMM(t.home)])
  }
  if (t.leave != null) rows.push(['🚪', 'Salir al trabajo', toHHMM(t.leave)])
  if (t.work != null) rows.push(['💼', 'Entrar a trabajar', toHHMM(t.work)])
  if (t.gym?.afternoon) rows.push(['🏋️', 'Gimnasio (5 min de movilidad + rutina)', `${toHHMM(t.gym.start)} – ${toHHMM(t.gym.end)}`])
  rows.push(['🛏', 'A la cama (8 h de sueño)', toHHMM(t.bed)])
  return (
    <table className="t">
      <tbody>{rows.map(([i, l, h]) => <tr key={l}><td style={{ width: 28 }}>{i}</td><td>{l}</td><td className="n"><b>{h}</b></td></tr>)}</tbody>
    </table>
  )
}

// ---------------------------------------------------------------- Mes

function Month({ start, sessions }: { start: string; sessions: WorkoutSession[] }) {
  const [offset, setOffset] = useState(0)
  const [sel, setSel] = useState<Date>(new Date())
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const gridStart = startOfWeek(first)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const sched = mesoSchedule(start)
  const mesoAt = (d: Date) => sched.find(s => d >= s.start && d <= s.end)?.meso ?? null

  return (
    <>
      <section className="card">
        <div className="h-row">
          <button className="btn small ghost" aria-label="Mes anterior" onClick={() => setOffset(o => o - 1)}>‹</button>
          <b>{(m => m[0].toUpperCase() + m.slice(1))(first.toLocaleDateString('es-ES', { month: 'long' }))} {first.getFullYear()}</b>
          <button className="btn small ghost" aria-label="Mes siguiente" onClick={() => setOffset(o => o + 1)}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {[1, 2, 3, 4, 5, 6, 0].map(d => <div key={d} className="tiny muted center">{DAY_SHORT[d]}</div>)}
          {cells.map(d => {
            const inMonth = d.getMonth() === first.getMonth()
            const p = plannedFor(d, start)
            const done = doneOn(sessions, d).length > 0
            const m = mesoAt(d)
            const isSel = sameDay(d, sel), isToday = sameDay(d, now)
            return (
              <button key={toISODate(d)} onClick={() => setSel(d)} aria-label={formatDate(d, true)} aria-pressed={isSel}
                style={{
                  minHeight: 48, borderRadius: 10, padding: '2px 0', font: 'inherit', color: 'var(--text)', opacity: inMonth ? 1 : 0.35,
                  background: done ? 'color-mix(in srgb, var(--ok) 25%, var(--bg))' : 'var(--bg)',
                  border: isSel ? '2px solid var(--accent)' : isToday ? '1px solid var(--accent)' : '1px solid var(--line)',
                  borderBottom: m ? `4px solid ${m.color}` : undefined
                }}>
                <div className="small" style={{ fontWeight: isToday ? 800 : 500 }}>{d.getDate()}</div>
                <div className="tiny" style={{ fontWeight: 700, color: done ? 'var(--ok)' : 'var(--accent)' }}>{done ? '✓' : p ? abbr(p.name) : ''}</div>
              </button>
            )
          })}
        </div>
        <div className="chips mt">
          {MACROCYCLE.map(m => <span key={m.id} className="chip" style={{ borderColor: m.color }}><span style={{ width: 10, height: 10, borderRadius: 3, background: m.color, display: 'inline-block' }} />{m.short}</span>)}
        </div>
        <p className="tiny muted mt mb0">TA/TB = Torso A/B · PA/PB = Pierna A/B · P = Pierna (M1) · ✓ = entrenado</p>
      </section>
      <DayCard key={toISODate(sel)} date={sel} start={start} done={doneOn(sessions, sel)} />
    </>
  )
}
