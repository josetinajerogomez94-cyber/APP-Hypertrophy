import { useState } from 'react'
import { db } from '../../persistence/db'
import { saveProfile, updateSettings } from '../../persistence/bootstrap'
import {
  MACROCYCLE, MAX_SESSION_MIN, TOTAL_WEEKS, calendarPosition, estimateMinutes, formatDate, mesoSchedule, resolveTarget, roundLoad, weeklyVolume
} from '../../domain/program'
import { getExercise, MUSCLES, RM_LIFTS } from '../../domain/exercises'
import { exerciseIdFor } from '../../app/training'
import { useProfile, useRMs, useSettings } from '../hooks'
import { RmTestForm, RM_PROTOCOL } from '../components/RmTestForm'
import { formatRest } from './Train'
import type { AppSettings, Profile, RmTest } from '../../domain/types'

export default function Plan() {
  const profile = useProfile()
  const settings = useSettings()
  const rms = useRMs()
  const [section, setSection] = useState<'macro' | 'rm'>('macro')
  if (!profile || !settings || !rms) return <p className="muted">Cargando…</p>

  return (
    <>
      <h1>Plan</h1>
      <div className="seg" role="group" aria-label="Sección" style={{ marginBottom: '.875rem' }}>
        <button aria-pressed={section === 'macro'} onClick={() => setSection('macro')}>Macrociclo</button>
        <button aria-pressed={section === 'rm'} onClick={() => setSection('rm')}>Test de RM y %</button>
      </div>
      {section === 'macro' ? <Macro profile={profile} settings={settings} /> : <RmSection rms={rms} />}
    </>
  )
}

function Macro({ profile, settings }: { profile: Profile; settings: AppSettings }) {
  const [open, setOpen] = useState<number | null>(settings.currentMeso ?? 0)
  const sched = mesoSchedule(profile.startDate)
  const cal = calendarPosition(profile.startDate)
  const cur = settings.currentMeso ?? 0

  return (
    <>
      <section className="card">
        <h2>Fecha de inicio</h2>
        <input type="date" value={profile.startDate} onChange={e => e.target.value && saveProfile(db, { startDate: e.target.value })} aria-label="Fecha de inicio del macrociclo" />
        <p className="small muted mt mb0">
          {TOTAL_WEEKS} semanas (6 meses): del <b>{formatDate(sched[0].start, true)}</b> al <b>{formatDate(cal.end, true)}</b>.
          Las fechas son orientativas: el mesociclo lo cambias tú cuando quieras.
        </p>
      </section>

      {sched.map(({ meso, index, start, end }) => {
        const isCur = index === cur
        const vol = weeklyVolume(meso, 1, settings.secondaryMuscleWeight)
        return (
          <section key={meso.id} className="card meso" style={{ ['--c' as any]: meso.color }}>
            <button className="pick" style={{ border: 0, padding: 0, background: 'none', margin: 0 }} onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}>
              <div className="row">
                <b className="grow">{meso.short} · {meso.name}</b>
                {isCur && <span className="chip accent">Actual</span>}
                {cal.status === 'during' && cal.mesoIndex === index && !isCur && <span className="chip warn">Por fechas</span>}
              </div>
              <div className="small muted">{formatDate(start)} – {formatDate(end)} · {meso.weeks.length} semanas · {meso.days.length} días/sem</div>
            </button>

            {open === index && (
              <div className="mt">
                <p className="small">{meso.description}</p>
                {!isCur && <button className="btn small" onClick={() => updateSettings(db, { currentMeso: index })}>Marcar como mesociclo actual</button>}

                <h3 className="small mt" style={{ marginBottom: '.3rem' }}>Semanas</h3>
                <ul className="list">
                  {meso.weeks.map((w, i) => (
                    <li key={i} className="small">
                      <b>{w.label}</b>
                      <span className="muted"> · {w.deload ? 'series a la mitad, RIR ≥3, −15 % en básicos' : [
                        w.rirAdj ? `RIR ${w.rirAdj > 0 ? '+' : ''}${w.rirAdj}` : 'RIR base',
                        w.pctAdj ? `+${w.pctAdj}% en básicos` : null
                      ].filter(Boolean).join(' · ')}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="small mt" style={{ marginBottom: '.3rem' }}>Series efectivas por semana</h3>
                <div className="chips">
                  {MUSCLES.map(m => <span key={m.id} className={`chip${m.priority ? ' accent' : ''}`}>{m.label} {Math.round(vol[m.id] * 10) / 10}</span>)}
                </div>
                <p className="tiny muted mt mb0">Los músculos secundarios cuentan como media serie. Semana tipo (sin descarga).</p>

                {meso.days.map(d => {
                  const ts = d.items.map(p => resolveTarget(meso, 1, p))
                  const min = estimateMinutes(ts)
                  return (
                    <details key={d.id} className="mt">
                      <summary className="row" style={{ justifyContent: 'space-between' }}>
                        <b>{d.name} <span className="small muted">· {d.focus}</span></b>
                        <span className={`chip${min > MAX_SESSION_MIN ? ' warn' : ''}`}>≈{min}′</span>
                      </summary>
                      <table className="t mt">
                        <thead><tr><th>Ejercicio</th><th className="n">Series</th><th className="n">Reps</th><th className="n">RIR/%</th><th className="n">Desc.</th></tr></thead>
                        <tbody>
                          {d.items.map((p, i) => {
                            const exId = exerciseIdFor(d.id, i, p.ex, settings.swaps)
                            return (
                              <tr key={i}>
                                <td>{getExercise(exId).name}{exId !== p.ex && <span className="warn tiny"> (cambiado)</span>}</td>
                                <td className="n">{p.sets}</td>
                                <td className="n">{p.reps[0] === p.reps[1] ? p.reps[0] : `${p.reps[0]}-${p.reps[1]}`}</td>
                                <td className="n">{p.pct ? `${p.pct}%` : p.rir}</td>
                                <td className="n">{formatRest(p.rest)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </details>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      {settings.swaps && Object.keys(settings.swaps).length > 0 && (
        <section className="card">
          <h2>Cambios guardados</h2>
          <p className="small muted">Has sustituido {Object.keys(settings.swaps).length} ejercicio(s) del plan original.</p>
          <button className="btn" onClick={() => confirm('¿Volver a los ejercicios originales del plan?') && updateSettings(db, { swaps: {} })}>Restaurar plan original</button>
        </section>
      )}
    </>
  )
}

function RmSection({ rms }: { rms: Record<string, RmTest> }) {
  const [lift, setLift] = useState<string>(RM_LIFTS[0])
  const rm = rms[lift]?.e1rm

  return (
    <>
      <section className="card">
        <h2>Tus 1RM</h2>
        <table className="t">
          <tbody>
            {RM_LIFTS.map(id => (
              <tr key={id}><td>{getExercise(id).name}</td><td className="n"><b>{rms[id] ? `${rms[id].e1rm} kg` : '—'}</b></td>
                <td className="n tiny muted">{rms[id] ? formatDate(new Date(rms[id].date)) : 'sin test'}</td></tr>
            ))}
            {Object.values(rms).filter(t => !(RM_LIFTS as readonly string[]).includes(t.exerciseId)).map(t => (
              <tr key={t.id}><td>{getExercise(t.exerciseId).name}</td><td className="n"><b>{t.e1rm} kg</b></td><td className="n tiny muted">{formatDate(new Date(t.date))}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="tiny muted mt mb0">Tests previstos en el plan: final del M1, del M3 y del M5. Los mesociclos M3 y M5 calculan los kilos de los básicos a partir de aquí.</p>
      </section>

      <section className="card">
        <h2>Hacer un test</h2>
        <RmTestForm />
      </section>

      <section className="card">
        <h2>Tabla de porcentajes</h2>
        <select value={lift} onChange={e => setLift(e.target.value)} aria-label="Ejercicio">
          {RM_LIFTS.map(id => <option key={id} value={id}>{getExercise(id).name}</option>)}
          {Object.values(rms).filter(t => !(RM_LIFTS as readonly string[]).includes(t.exerciseId)).map(t => <option key={t.id} value={t.exerciseId}>{getExercise(t.exerciseId).name}</option>)}
        </select>
        {rm ? (
          <table className="t mt">
            <thead><tr><th>%</th><th className="n">Kg</th><th className="n">Reps orientativas</th></tr></thead>
            <tbody>
              {[100, 95, 90, 87.5, 85, 82.5, 80, 77.5, 75, 72.5, 70, 65, 60, 50].map(p => (
                <tr key={p}><td>{p}%</td><td className="n"><b>{roundLoad(rm * p / 100)}</b></td><td className="n muted">{repsAt(p)}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p className="small muted mt mb0">Haz el test de este ejercicio para ver la tabla.</p>}
      </section>

      <section className="card">
        <h2>Cómo hacer el test</h2>
        <p className="small mb0">{RM_PROTOCOL}</p>
      </section>
    </>
  )
}

function repsAt(p: number): string {
  const table: [number, string][] = [[100, '1'], [95, '2'], [92.5, '3'], [90, '3-4'], [87.5, '4-5'], [85, '5-6'], [82.5, '6-7'],
    [80, '7-8'], [77.5, '8-9'], [75, '9-10'], [72.5, '10-11'], [70, '11-12'], [65, '13-15']]
  return table.find(([pct]) => p >= pct)?.[1] ?? '15+'
}
