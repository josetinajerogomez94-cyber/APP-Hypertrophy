import { create } from 'zustand'

export type Tab = 'inicio' | 'entrenar' | 'plan' | 'progreso' | 'ajustes'
export const TABS: { id: Tab; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'entrenar', label: 'Entrenar' },
  { id: 'plan', label: 'Plan' },
  { id: 'progreso', label: 'Progreso' },
  { id: 'ajustes', label: 'Ajustes' }
]

const fromHash = (): Tab => {
  const h = window.location.hash.replace('#/', '') as Tab
  return TABS.some(t => t.id === h) ? h : 'inicio'
}

interface UIState {
  tab: Tab
  setTab: (t: Tab) => void
  updateReady: boolean
  offlineReady: boolean
  applyUpdate: (() => void) | null
  setUpdate: (p: Partial<Pick<UIState, 'updateReady' | 'offlineReady' | 'applyUpdate'>>) => void
}

export const useUI = create<UIState>(set => ({
  tab: typeof window === 'undefined' ? 'inicio' : fromHash(),
  setTab: tab => { window.location.hash = `#/${tab}`; set({ tab }) },
  updateReady: false, offlineReady: false, applyUpdate: null,
  setUpdate: p => set(p)
}))

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => useUI.setState({ tab: fromHash() }))
}
