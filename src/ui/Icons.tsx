const P: Record<string, string> = {
  inicio: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  entrenar: 'M2 12h3M19 12h3M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8',
  plan: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  progreso: 'M3 20h18M6 16v-4M11 16V8M16 16v-6M21 16V5',
  ajustes: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6'
}
export const Icon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={P[name]} /></svg>
)
