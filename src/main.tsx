import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { db } from './persistence/db'
import { ensureInitialData } from './persistence/bootstrap'
import { useUI } from './app/store'
import './ui/styles/tokens.css'
import './ui/styles/base.css'

const updateSW = registerSW({
  onNeedRefresh: () => useUI.getState().setUpdate({ updateReady: true, applyUpdate: () => updateSW(true) }),
  onOfflineReady: () => useUI.getState().setUpdate({ offlineReady: true })
})

ensureInitialData(db)
  .catch(err => console.error('No se pudo inicializar la base de datos', err))
  .finally(() => createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>))
