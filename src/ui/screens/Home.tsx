import { useState } from 'react'
import { useUI } from '../../app/store'
import { db } from '../../persistence/db'
import { saveProfile, updateSettings } from '../../persistence/bootstrap'
import { MACROCYCLE, TOTAL_WEEKS, calendarPosition, formatDate, mesoSchedule, parseISODate, toISODate } from '../../domain/program'
import { dayPlan } from '../../domain/nutritionPlan'
import { formatClock, nextDayIndex, sessionSeconds, sessionVolume } from '../../app/training'
import { useActiveSession, useFinishedSessions, useProfile, useSettings } from '../hooks'
import { Icon } from '../Icons'

export default function Home() {
  const profile = useProfile()
  const settings = useSettings()
  const sessions = useFinishedSessions()
  const active = useActiveSession()
  const { setTab, setPick } = useUI()
  if (!profile || !settings || !sessions || active === undefined) return <p className="muted">Cargando…</p>

  const cal = calendarPosition(profile.startDate)
  const sched = mesoSchedule(profile.startDate)
  const cur = settings.currentMeso ?? 0
  const meso = MACROCYCLE[cur]
  const { dayIdx, doneInMeso } = nextDayIndex(sessions, cur)
  const weekIdx = cal.status === 'during' && cal.mesoIndex === cur
    ? cal.weekIndex
    : Math.min(meso.weeks.length - 1, Math.floor(doneInMeso / meso.days.length))
  const calAhead = cal.status !== 'before' && cal.mesoIndex > cur
  const calBehind = cal.status === 'during' && cal.mesoIndex < cur
  const weekStart = startOfWeek()
  const thisWeek = sessions.filter(s => s.startedAt >= weekStart.getTime())
  const daysSinceBackup = settings.lastBackupAt ? Math.floor((Date.now() - Date.parse(settings.lastBackupAt)) / 86_400_000) : null
  const needBackup = sessions.length > 0 && (daysSinceBackup == null || daysSinceBackup >= settings.backupReminderDays)

  function startSuggested() {
    setPick({ mesoIdx: cur, weekIdx, dayIdx })
    setTab('entrenar')
  }

  return (
    <>
      <div className="h-row">
        <h1>Hypertrophy</h1>
        <button className="icon-btn" aria-label="Ajustes" onClick={() => setTab('ajustes')}><Icon name="ajustes" /></button>
      </div>

      {!settings.profileConfirmed && <FirstSteps startDate={profile.startDate} />}

      {active && (
        <section className="card" style={{ borderColor: 'var(--accent)' }}>
          <h2>Entrenamiento en curso</h2>
          <p className="mb0">{active.title}</p>
          <p className="small muted">{formatClock(sessionSeconds(active))} · {sessionVolume(active).sets} series hechas</p>
          <button className="btn primary" onClick={() => setTab('entrenar')}>Continuar</button>
        </section>
      )}

      <section className="card meso" style={{ ['--c' as any]: meso.color }}>
        <div className="h-row mb0">
          <div>
            <div className="tiny muted">MESOCICLO ACTUAL</div>
            <h2 className="mb0">{meso.short} · {meso.name}</h2>
          </div>
          <span className="chip">{meso.days.length} días/sem</span>
        </div>
        <p className="small muted mt">{meso.goal}</p>
        <div className="kv small"><span className="muted">Fechas previstas</span><b>{formatDate(sched[cur].start)} – {formatDate(sched[cur].end)}</b></div>
        <div className="kv small"><span className="muted">Sesiones hechas en este meso</span><b>{doneInMeso}</b></div>

        {cal.status === 'before' && <div className="note">El macrociclo empieza el <b>{formatDate(sched[0].start, true)}</b> (en {cal.daysUntilStart} días). Puedes entrenar antes si quieres.</div>}
        {calAhead && (
          <div className="note warn">
            Según tu fecha de inicio, desde el <b>{formatDate(sched[cal.mesoIndex].start)}</b> te toca el <b>{MACROCYCLE[cal.mesoIndex].short} · {MACROCYCLE[cal.mesoIndex].name}</b>.
            <button className="btn small primary mt" onClick={() => updateSettings(db, { currentMeso: cur + 1 })}>Pasar al {MACROCYCLE[cur + 1]?.short}</button>
          </div>
        )}
        {calBehind && <div className="note">Vas por delante del calendario (según fechas estarías en el {MACROCYCLE[cal.mesoIndex].short}).</div>}
        {!calAhead && cal.status === 'during' && cal.mesoIndex === cur && cal.nextMesoStart && (
          <p className="small muted mb0">Semana {cal.weekIndex + 1} de {meso.weeks.length}. Cambio previsto al {MACROCYCLE[cur + 1].short} el <b>{formatDate(cal.nextMesoStart)}</b>.</p>
        )}
        {cal.status === 'after' && <div className="note ok">¡Has completado las {TOTAL_WEEKS} semanas del macrociclo! Haz un test de RM para ver tu progreso.</div>}
      </section>

      {!active && (
        <section className="card">
          <div className="tiny muted">TE TOCA</div>
          <h2 className="mb0">{meso.days[dayIdx].name}</h2>
          <p className="small muted">{meso.days[dayIdx].focus} · {meso.weeks[weekIdx].label}</p>
          <button className="btn primary" onClick={startSuggested}>Preparar este entrenamiento</button>
          <button className="btn" onClick={() => setTab('entrenar')}>Elegir otro</button>
        </section>
      )}

      <section className="card">
        <h2>Esta semana</h2>
        <div className="grid3">
          <div className="stat"><b>{thisWeek.length}/{meso.days.length}</b><span>Sesiones</span></div>
          <div className="stat"><b>{thisWeek.reduce((n, s) => n + sessionVolume(s).sets, 0)}</b><span>Series</span></div>
          <div className="stat"><b>{Math.round(thisWeek.reduce((n, s) => n + sessionSeconds(s), 0) / 60)}′</b><span>Entrenado</span></div>
        </div>
      </section>

      <section className="card">
        <div className="h-row mb0"><h2 className="mb0">Menú de hoy</h2><button className="btn small ghost" onClick={() => setTab('dieta')}>Ver</button></div>
        <ul className="list mt">
          {dayPlan(new Date().getDay(), settings.nutritionBoost ?? 0).map(m => {
            const done = settings.mealsDone?.date === toISODate(new Date()) && settings.mealsDone.slots.includes(m.slot)
            return <li key={m.slot} className="row small"><span className="chip">{m.time}</span><span className={`grow${done ? ' muted' : ''}`} style={done ? { textDecoration: 'line-through' } : undefined}>{m.name.split(' · ')[1] ?? m.name}</span>{done && <span className="ok">✓</span>}</li>
          })}
        </ul>
      </section>

      {sessions.length > 0 && (
        <section className="card">
          <h2>Últimos entrenamientos</h2>
          <ul className="list">
            {sessions.slice(0, 3).map(s => (
              <li key={s.id} className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small">{s.title}</span>
                <span className="small muted">{new Date(s.startedAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {needBackup && (
        <div className="note warn">
          {daysSinceBackup == null ? 'Aún no has hecho ninguna copia de seguridad.' : `Hace ${daysSinceBackup} días de tu última copia de seguridad.`} Tus datos solo están en este iPhone.
          <button className="btn small mt" onClick={() => setTab('ajustes')}>Hacer copia</button>
        </div>
      )}
    </>
  )
}

function FirstSteps({ startDate }: { startDate: string }) {
  const [date, setDate] = useState(startDate)
  return (
    <section className="card" style={{ borderColor: 'var(--warn)' }}>
      <h2>Bienvenido 👋</h2>
      <p className="small">Lo primero: elige el <b>día en que empiezas</b> el macrociclo de 6 meses. A partir de ahí te iré diciendo cuándo toca cambiar de mesociclo (el cambio lo haces tú).</p>
      <label htmlFor="start">Fecha de inicio</label>
      <input id="start" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button className="btn primary mt" disabled={!date} onClick={() => saveProfile(db, { startDate: date })}>Empezar el {date ? formatDate(parseISODate(date), true) : '…'}</button>
      <p className="tiny muted mt mb0">Puedes cambiarla cuando quieras en Plan o Ajustes. Revisa también tu peso y altura en Ajustes.</p>
    </section>
  )
}

function startOfWeek(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // lunes
  return d
}
