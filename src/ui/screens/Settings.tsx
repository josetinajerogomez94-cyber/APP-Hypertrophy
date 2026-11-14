import { useEffect, useState } from 'react'
import { db, SCHEMA_VERSION } from '../../persistence/db'
import { saveProfile } from '../../persistence/bootstrap'
import { profileInputSchema } from '../../persistence/validate'
import { useProfile, useSettings } from '../hooks'
import { BackupManager } from '../components/BackupManager'

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export default function SettingsScreen() {
  const profile = useProfile()
  const settings = useSettings()
  const [form, setForm] = useState({ weightKg: '', heightCm: '', targetWeightKg: '', maxSessionMin: '', startDate: '', targetDate: '' })
  const [days, setDays] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [quota, setQuota] = useState('')

  useEffect(() => {
    if (!profile) return
    setForm({ weightKg: String(profile.weightKg), heightCm: String(profile.heightCm), targetWeightKg: String(profile.targetWeightKg),
      maxSessionMin: String(profile.maxSessionMin), startDate: profile.startDate, targetDate: profile.targetDate })
    setDays(profile.trainingDays)
  }, [profile?.updatedAt])

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
    navigator.storage?.estimate?.().then(e => e.usage != null && e.quota != null &&
      setQuota(`${(e.usage / 1048576).toFixed(1)} MB usados de ${(e.quota / 1048576).toFixed(0)} MB`)).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = profileInputSchema.safeParse({
      weightKg: Number(form.weightKg), heightCm: Number(form.heightCm), targetWeightKg: Number(form.targetWeightKg),
      maxSessionMin: Number(form.maxSessionMin), startDate: form.startDate, targetDate: form.targetDate, trainingDays: days
    })
    if (!parsed.success) { setErrors(parsed.error.issues.map(i => i.message)); return }
    try {
      await saveProfile(db, parsed.data)
      setErrors([]); setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { setErrors(['No se pudo guardar. Comprueba el almacenamiento del dispositivo e inténtalo de nuevo.']) }
  }

  async function askPersist() {
    const ok = await navigator.storage?.persist?.()
    setPersisted(ok ?? false)
  }

  return (
    <>
      <h1>Ajustes</h1>
      <form className="card" onSubmit={submit} noValidate>
        <h2>Perfil</h2>
        {profile?.provisional && <p className="muted">Valores provisionales. Revísalos y pulsa «Guardar perfil» para confirmarlos.</p>}
        <div className="field"><label htmlFor="w">Peso corporal (kg)</label><input id="w" type="number" inputMode="decimal" step="0.1" value={form.weightKg} onChange={set('weightKg')} /></div>
        <div className="field"><label htmlFor="h">Altura (cm)</label><input id="h" type="number" inputMode="numeric" value={form.heightCm} onChange={set('heightCm')} /></div>
        <div className="field"><label htmlFor="t">Peso objetivo orientativo (kg)</label><input id="t" type="number" inputMode="decimal" step="0.1" value={form.targetWeightKg} onChange={set('targetWeightKg')} /></div>
        <div className="field"><label htmlFor="m">Duración máxima de sesión (min)</label><input id="m" type="number" inputMode="numeric" value={form.maxSessionMin} onChange={set('maxSessionMin')} /></div>
        <div className="field"><label htmlFor="s">Inicio del plan</label><input id="s" type="date" value={form.startDate} onChange={set('startDate')} /></div>
        <div className="field"><label htmlFor="e">Fecha objetivo</label><input id="e" type="date" value={form.targetDate} onChange={set('targetDate')} /></div>
        <div className="field">
          <label id="dl">Días de entrenamiento</label>
          <div className="days" role="group" aria-labelledby="dl">
            {DAYS.map((d, i) => (
              <button type="button" key={d + i} aria-pressed={days.includes(i)} aria-label={['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][i]}
                onClick={() => setDays(x => x.includes(i) ? x.filter(v => v !== i) : [...x, i].sort())}>{d}</button>
            ))}
          </div>
        </div>
        {errors.map(m => <p className="error" role="alert" key={m}>{m}</p>)}
        <button className="btn primary" type="submit">Guardar perfil</button>
      </form>

      <section className="card">
        <h2>Almacenamiento y copias de seguridad</h2>
        <p>Tus datos viven solo en este dispositivo. Si borras los datos del sitio en Safari, se pierden. Guardarlos aquí no sustituye a una copia de seguridad.</p>
        <div className="kv"><span className="muted">Almacenamiento persistente</span><b>{persisted == null ? 'No disponible' : persisted ? 'Concedido' : 'No concedido'}</b></div>
        {quota && <div className="kv"><span className="muted">Uso</span><b>{quota}</b></div>}
        {persisted === false && <button className="btn" onClick={askPersist}>Solicitar almacenamiento persistente</button>}
        
        {/* Gestor de copias de seguridad añadido aquí */}
        <div style={{ marginTop: '1.5rem' }}>
          <BackupManager />
        </div>
      </section>

      <section className="card">
        <h2>Instalar en el iPhone</h2>
        <ol>
          <li>Abre la dirección publicada en Safari.</li>
          <li>Pulsa Compartir.</li>
          <li>Elige «Añadir a pantalla de inicio».</li>
          <li>Abre la app desde el nuevo icono.</li>
        </ol>
        <p className="muted">Los nombres de los menús pueden variar según la versión de iOS. La instalación exige HTTPS, salvo en desarrollo local. Una PWA no tiene las mismas capacidades que una app nativa.</p>
      </section>

      <section className="card">
        <h2>Acerca de</h2>
        <div className="kv"><span className="muted">Versión de la app</span><b>0.1.0 (Fases 1-5 integradas)</b></div>
        <div className="kv"><span className="muted">Esquema de datos</span><b>v{SCHEMA_VERSION}</b></div>
        <div className="kv"><span className="muted">Tema</span><b>{settings?.theme === 'light' ? 'Claro' : 'Oscuro'}</b></div>
        <button className="btn" onClick={() => db.settings.update('settings', { theme: settings?.theme === 'light' ? 'dark' : 'light' })}>
          Cambiar a tema {settings?.theme === 'light' ? 'oscuro' : 'claro'}
        </button>
      </section>
      {saved && <div className="toast" role="status">Perfil guardado</div>}
    </>
  )
}
