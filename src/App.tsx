import { useEffect } from 'react'
import { TABS, useUI } from './app/store'
import { Icon } from './ui/Icons'
import { useSettings } from './ui/hooks'
import Home from './ui/screens/Home'
import Train from './ui/screens/Train'
import Plan from './ui/screens/Plan'
import Agenda from './ui/screens/Agenda'
import Nutrition from './ui/screens/Nutrition'
import Progress from './ui/screens/Progress'
import SettingsScreen from './ui/screens/Settings'

const SCREENS = { inicio: Home, entrenar: Train, agenda: Agenda, plan: Plan, dieta: Nutrition, progreso: Progress, ajustes: SettingsScreen }

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
