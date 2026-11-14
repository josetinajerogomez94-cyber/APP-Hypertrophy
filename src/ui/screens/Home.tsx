import { useUI } from '../../app/store'
import { useProfile, useSettings } from '../hooks'

export default function Home() {
  const profile = useProfile()
  const settings = useSettings()
  const setTab = useUI(s => s.setTab)
  if (profile === undefined || settings === undefined) return <p className="muted">Cargando…</p>

  if (!settings?.profileConfirmed) {
    return (
      <>
        <h1>Bienvenido a Hypertrophy Tracker</h1>
        <p className="muted">Todo se guarda en este dispositivo. No hay cuentas ni servidores.</p>
        <section className="card">
          <h2>Primeros pasos</h2>
          <ol className="steps">
            <li><span className="tag">Ahora</span><span>Revisa y confirma tu perfil. Los valores actuales son provisionales.</span></li>
            <li><span className="tag">Fase 2–3</span><span>Crear el plan de entrenamiento.</span></li>
            <li><span className="tag">Fase 3</span><span>Completar el test inicial de calibración.</span></li>
          </ol>
          <button className="btn primary" onClick={() => setTab('ajustes')}>Configurar perfil</button>
        </section>
      </>
    )
  }
  return (
    <>
      <h1>Inicio</h1>
      <section className="card">
        <h2>Punto de partida</h2>
        <div className="kv"><span className="muted">Peso del perfil</span><b>{profile?.weightKg} kg</b></div>
        <div className="kv"><span className="muted">Inicio del plan</span><b>{profile?.startDate}</b></div>
        <div className="kv"><span className="muted">Objetivo orientativo</span><b>{profile?.targetWeightKg} kg</b></div>
        <p className="muted">Es el dato del perfil, no una medición. El seguimiento de peso llega en la Fase 4.</p>
      </section>
      <section className="card">
        <h2>Próxima sesión</h2>
        <p className="muted">Aún no hay plan. Se crea en las Fases 2 y 3.</p>
      </section>
      <section className="card">
        <h2>Actividad reciente</h2>
        <p className="muted">Sin entrenamientos registrados. No se muestran gráficas hasta que existan datos reales.</p>
      </section>
    </>
  )
}
