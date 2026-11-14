import type { ReactNode } from 'react'

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="h-row"><h2 className="mb0">{title}</h2><button className="btn small ghost" onClick={onClose}>Cerrar</button></div>
        {children}
      </div>
    </div>
  )
}

/** Convierte lo escrito (admite coma decimal) a número o null. */
export function num(v: string): number | null {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
