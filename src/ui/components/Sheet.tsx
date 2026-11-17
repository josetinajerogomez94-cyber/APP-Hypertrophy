import { useEffect, useState, type ReactNode } from 'react'

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

/**
 * Campo numérico que admite decimales con coma o punto ("82,5").
 * Guarda el texto mientras escribes y solo avisa del número cuando es válido,
 * para que la coma no desaparezca a mitad de escribir.
 */
export function NumInput({ value, onValue, decimal = true, ...rest }: {
  value: number | null; onValue: (n: number | null) => void; decimal?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const fmt = (n: number | null) => (n == null ? '' : String(n).replace('.', ','))
  const [text, setText] = useState(fmt(value))
  useEffect(() => { if (num(text) !== value) setText(fmt(value)) }, [value])
  return (
    <input {...rest} type="text" inputMode={decimal ? 'decimal' : 'numeric'} value={text}
      onChange={e => {
        const t = e.target.value.replace(/[^0-9.,]/g, '')
        setText(t)
        onValue(t === '' ? null : num(t))
      }} />
  )
}
