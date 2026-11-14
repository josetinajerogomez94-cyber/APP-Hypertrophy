import { useEffect } from 'react'
import { TABS, useUI } from './app/store'
import { Icon } from './ui/Icons'
import { useSettings } from './ui/hooks'
import Home from './ui/screens/Home'
// 1. Aquí traemos nuestra nueva pantalla
import { TrainScreen } from './ui/screens/TrainScreen' 
import Plan from './ui/screens/Plan'
import Progress from './ui/screens/Progress'
import SettingsScreen from './ui/screens/Settings'

// 2. Aquí la conectamos al botón "entrenar" del menú
const SCREENS = { inicio: Home, entrenar: TrainScreen, plan: Plan, progreso: Progress, ajustes: SettingsScreen }

export default function App() {
  const { tab, setTab, updateReady, applyUpdate } = useUI()
  const settings = useSettings()
  
  useEffect(() => { 
    document.documentElement.dataset.theme = settings?.theme ?? 'dark' 
  }, [settings?.theme])
  
  const Screen = SCREENS[tab]
  
  return (
    <div className="shell">
      {updateReady && (
        <div className="banner" role="status">
          <span>Hay una versión nueva. Aplícala cuando no estés entrenando.</span>
          <button onClick={() => applyUpdate?.()}>Actualizar</button>
        </div>
      )}
      <main className="main"><div className="page"><Screen /></div></main>
      <nav className="nav" aria-label="Secciones">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.id} />{t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}