import { create } from 'zustand'

export type Tab = 'inicio' | 'entrenar' | 'plan' | 'dieta' | 'progreso' | 'ajustes'
export const TABS: { id: Tab; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'entrenar', label: 'Entrenar' },
  { id: 'plan', label: 'Plan' },
  { id: 'dieta', label: 'Dieta' },
  { id: 'progreso', label: 'Progreso' }
]
const ALL: Tab[] = ['inicio', 'entrenar', 'plan', 'dieta', 'progreso', 'ajustes']

const fromHash = (): Tab => {
  const h = window.location.hash.replace('#/', '') as Tab
  return ALL.includes(h) ? h : 'inicio'
}

export interface TrainPick { mesoIdx: number; weekIdx: number; dayIdx: number }

interface UIState {
  tab: Tab
  setTab: (t: Tab) => void
  pick: TrainPick | null
  setPick: (p: TrainPick | null) => void
  updateReady: boolean
  offlineReady: boolean
  applyUpdate: (() => void) | null
  setUpdate: (p: Partial<Pick<UIState, 'updateReady' | 'offlineReady' | 'applyUpdate'>>) => void
}

export const useUI = create<UIState>(set => ({
  tab: typeof window === 'undefined' ? 'inicio' : fromHash(),
  setTab: tab => { window.location.hash = `#/${tab}`; set({ tab }); document.querySelector('.main')?.scrollTo(0, 0) },
  pick: null,
  setPick: pick => set({ pick }),
  updateReady: false, offlineReady: false, applyUpdate: null,
  setUpdate: p => set(p)
}))

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => useUI.setState({ tab: fromHash() }))
}
