import { useRef, useState } from 'react'
import { db } from '../../persistence/db'
import { updateSettings } from '../../persistence/bootstrap'

const FORMAT = 'hypertrophy-backup'

export function BackupManager() {
  const [msg, setMsg] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const show = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 5000) }

  async function exportData() {
    try {
      const data = {
        format: FORMAT, version: 2, exportedAt: new Date().toISOString(),
        profile: await db.profile.toArray(), settings: await db.settings.toArray(), sessions: await db.sessions.toArray(),
        rmTests: await db.rmTests.toArray(), measurements: await db.measurements.toArray(), menu: await db.menu.toArray()
      }
      const name = `Hypertrophy_copia_${new Date().toISOString().slice(0, 10)}.json`
      const file = new File([JSON.stringify(data, null, 2)], name, { type: 'application/json' })
      // En iPhone, compartir permite "Guardar en Archivos", enviarlo por WhatsApp, mail…
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Copia de Hypertrophy' }) }
        catch (e: any) { if (e?.name === 'AbortError') return; throw e }
      } else {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a'); a.href = url; a.download = name
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      }
      await updateSettings(db, { lastBackupAt: new Date().toISOString() })
      show('✓ Copia creada. Guárdala en Archivos o en la nube.')
    } catch { show('❌ No se pudo crear la copia.') }
  }

  async function importData(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (data.format !== FORMAT) { show('❌ Este archivo no es una copia de esta app.'); return }
      if (!confirm('Se reemplazarán TODOS los datos actuales por los de la copia. ¿Continuar?')) return
      await db.transaction('rw', [db.profile, db.settings, db.sessions, db.rmTests, db.measurements, db.menu], async () => {
        for (const t of [db.profile, db.settings, db.sessions, db.rmTests, db.measurements, db.menu]) await t.clear()
        if (data.profile?.length) await db.profile.bulkPut(data.profile)
        if (data.settings?.length) await db.settings.bulkPut(data.settings)
        if (data.sessions?.length) await db.sessions.bulkPut(data.sessions)
        if (data.rmTests?.length) await db.rmTests.bulkPut(data.rmTests)
        if (data.measurements?.length) await db.measurements.bulkPut(data.measurements)
        if (data.menu?.length) await db.menu.bulkPut(data.menu)
      })
      show('✓ Datos restaurados.')
    } catch { show('❌ Archivo no válido o error al restaurar.') }
  }

  return (
    <div>
      <button className="btn primary" onClick={exportData}>Crear copia de seguridad</button>
      <input type="file" accept=".json,application/json" ref={input} style={{ display: 'none' }} onChange={importData} />
      <button className="btn" onClick={() => input.current?.click()}>Restaurar una copia</button>
      {msg && <p className={`small mt ${msg.startsWith('✓') ? 'ok' : 'danger'}`} role="status">{msg}</p>}
    </div>
  )
}
