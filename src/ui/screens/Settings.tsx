import { useEffect, useState } from 'react'
import { db, SCHEMA_VERSION } from '../../persistence/db'
import { saveProfile, updateSettings } from '../../persistence/bootstrap'
import { profileInputSchema } from '../../persistence/validate'
import { useUI } from '../../app/store'
import { useProfile, useSettings } from '../hooks'
import { BackupManager } from '../components/BackupManager'
import { Icon } from '../Icons'

export default function SettingsScreen() {
  const profile = useProfile()
  const settings = useSettings()
  const setTab = useUI(s => s.setTab)
  const [form, setForm] = useState({ weightKg: '', heightCm: '', targetWeightKg: '', startDate: '' })
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [quota, setQuota] = useState('')

  useEffect(() => {
    if (!profile) return
    setForm({ weightKg: String(profile.weightKg), heightCm: String(profile.heightCm), targetWeightKg: String(profile.targetWeightKg), startDate: profile.startDate })
  }, [profile?.updatedAt])

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
    navigator.storage?.estimate?.().then(e => e.usage != null && e.quota != null &&
      setQuota(`${(e.usage / 1048576).toFixed(1)} MB usados`)).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const n = (v: string) => Number(v.replace(',', '.'))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = profileInputSchema.safeParse({
      weightKg: n(form.weightKg), heightCm: n(form.heightCm), targetWeightKg: n(form.targetWeightKg),
      startDate: form.startDate, trainingDays: profile?.trainingDays?.length ? profile.trainingDays : [1, 3, 5]
    })
    if (!parsed.success) { setErrors(parsed.error.issues.map(i => i.message)); return }
    try {
      await saveProfile(db, parsed.data)
      setErrors([]); setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { setErrors(['No se pudo guardar. Inténtalo de nuevo.']) }
  }

  async function askPersist() {
    const ok = await navigator.storage?.persist?.()
    setPersisted(ok ?? false)
  }

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="kv"><span>{label}</span>
      <div className="seg" style={{ width: 150 }}>
        <button aria-pressed={value} onClick={() => onChange(true)}>Sí</button>
        <button aria-pressed={!value} onClick={() => onChange(false)}>No</button>
      </div>
    </div>
  )

  return (
    <>
      <div className="h-row">
        <button className="icon-btn" aria-label="Volver a inicio" onClick={() => setTab('inicio')}><Icon name="back" /></button>
        <h1 className="grow">Ajustes</h1>
      </div>

      <form className="card" onSubmit={submit} noValidate>
        <h2>Perfil</h2>
        {profile?.provisional && <p className="muted small">Valores provisionales. Revísalos y pulsa «Guardar perfil».</p>}
        <div className="field"><label htmlFor="s">Inicio del macrociclo</label><input id="s" type="date" value={form.startDate} onChange={set('startDate')} /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="w">Peso (kg)</label><input id="w" type="text" inputMode="decimal" value={form.weightKg} onChange={set('weightKg')} /></div>
          <div className="field"><label htmlFor="h">Altura (cm)</label><input id="h" type="text" inputMode="numeric" value={form.heightCm} onChange={set('heightCm')} /></div>
        </div>
        <div className="field"><label htmlFor="t">Peso objetivo orientativo (kg)</label><input id="t" type="text" inputMode="decimal" value={form.targetWeightKg} onChange={set('targetWeightKg')} /></div>
        {errors.map(m => <p className="error" role="alert" key={m}>{m}</p>)}
        <button className="btn primary" type="submit">Guardar perfil</button>
      </form>

      <section className="card">
        <h2>Entrenamiento</h2>
        <Toggle label="Pitido al acabar el descanso" value={settings?.sound !== false} onChange={v => updateSettings(db, { sound: v })} />
        <Toggle label="Pantalla siempre encendida al entrenar" value={settings?.keepAwake !== false} onChange={v => updateSettings(db, { keepAwake: v })} />
        <p className="tiny muted mt mb0">En iPhone el pitido suena con la app abierta y el modo silencio desactivado. Si bloqueas el móvil, al volver verás cuánto tiempo llevas de descanso.</p>
      </section>

      <section className="card">
        <h2>Copias de seguridad</h2>
        <p className="small">Tus datos viven solo en este iPhone. Si borras la app o los datos de Safari, se pierden. Haz una copia cada 1-2 semanas y guárdala en Archivos / iCloud.</p>
        <div className="kv small"><span className="muted">Última copia</span><b>{settings?.lastBackupAt ? new Date(settings.lastBackupAt).toLocaleDateString('es-ES') : 'Nunca'}</b></div>
        <div className="kv small"><span className="muted">Almacenamiento persistente</span><b>{persisted == null ? 'No disponible' : persisted ? 'Concedido' : 'No concedido'}</b></div>
        {quota && <div className="kv small"><span className="muted">Uso</span><b>{quota}</b></div>}
        {persisted === false && <button className="btn" onClick={askPersist}>Solicitar almacenamiento persistente</button>}
        <div className="mt"><BackupManager /></div>
      </section>

      <section className="card">
        <h2>Apariencia</h2>
        <button className="btn" onClick={() => updateSettings(db, { theme: settings?.theme === 'light' ? 'dark' : 'light' })}>
          Cambiar a tema {settings?.theme === 'light' ? 'oscuro' : 'claro'}
        </button>
      </section>

      <section className="card">
        <h2>Instalar en el iPhone</h2>
        <ol className="small">
          <li>Abre la dirección de la app en Safari.</li>
          <li>Pulsa el botón Compartir (cuadrado con flecha).</li>
          <li>Elige «Añadir a pantalla de inicio».</li>
          <li>Abre la app siempre desde ese icono.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Acerca de</h2>
        <div className="kv small"><span className="muted">Versión</span><b>0.2.0</b></div>
        <div className="kv small"><span className="muted">Esquema de datos</span><b>v{SCHEMA_VERSION}</b></div>
      </section>
      {saved && <div className="toast" role="status">Perfil guardado</div>}
    </>
  )
}
