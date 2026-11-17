/**
 * Aviso de fin de descanso.
 *
 * iOS congela las apps web al bloquear la pantalla, así que un temporizador normal no puede avisar.
 * Truco: el descanso se reproduce como un AUDIO (silencio + pitidos al final). Así:
 *  - iOS lo muestra en la pantalla de bloqueo como "reproduciendo", con barra y tiempo restante;
 *  - el pitido suena aunque el móvil esté bloqueado (forma parte del propio audio);
 *  - al terminar el audio se lanza también una notificación (si se dio permiso).
 * Inconveniente: al empezar, iOS pausa la música de otras apps. Por eso es opcional.
 */

interface RestConfig { lockScreen: boolean; sound: boolean; notify: boolean }
let config: RestConfig = { lockScreen: false, sound: true, notify: false }
let audio: HTMLAudioElement | null = null
let currentUrl: string | null = null

export function setRestConfig(c: Partial<RestConfig>) { config = { ...config, ...c } }
export const lockScreenActive = () => config.lockScreen

const RATE = 8000

/** WAV mono de 8 bits: `seconds` de silencio seguidos de 3 pitidos (o nada si el sonido está desactivado). */
export function buildRestWav(seconds: number, withBeep: boolean): Blob {
  const beepLen = withBeep ? 1.1 : 0.2
  const n = Math.max(1, Math.round((seconds + beepLen) * RATE))
  const buf = new ArrayBuffer(44 + n)
  const v = new DataView(buf)
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, RATE, true); v.setUint32(28, RATE, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true)
  str(36, 'data'); v.setUint32(40, n, true)
  const data = new Uint8Array(buf, 44)
  data.fill(128) // silencio
  if (withBeep) {
    const start = Math.round(seconds * RATE)
    const beeps = [[0, 880], [0.35, 880], [0.7, 1320]]
    for (const [t, f] of beeps) {
      const s0 = start + Math.round(t * RATE), len = Math.round(0.25 * RATE)
      for (let i = 0; i < len && s0 + i < n; i++) {
        const env = Math.min(1, i / 80, (len - i) / 80)
        data[s0 + i] = 128 + Math.round(90 * env * Math.sin((2 * Math.PI * f * i) / RATE))
      }
    }
  }
  return new Blob([buf], { type: 'audio/wav' })
}

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

/**
 * Empieza (o reajusta) el audio del descanso. Debe llamarse dentro de un toque del usuario
 * (marcar serie, +15, −15), porque iOS no deja reproducir audio de otra forma.
 */
export function startRestAudio(remainingSec: number, totalSec: number, nextLabel = '') {
  if (!config.lockScreen || remainingSec <= 0) return
  try {
    audio ??= new Audio()
    if (currentUrl) URL.revokeObjectURL(currentUrl)
    currentUrl = URL.createObjectURL(buildRestWav(remainingSec, config.sound))
    audio.src = currentUrl
    audio.onended = () => { notifyRestEnd(); clearMedia() }
    audio.play().catch(() => { /* iOS lo ha bloqueado: queda el aviso normal en pantalla */ })
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Descanso ${fmt(totalSec)}`,
        artist: nextLabel ? `Siguiente: ${nextLabel}` : 'Hypertrophy',
        album: 'Hypertrophy',
        artwork: [{ src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' }]
      })
      const noop = () => {}
      for (const a of ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'] as MediaSessionAction[]) {
        try { navigator.mediaSession.setActionHandler(a, noop) } catch { /* acción no soportada */ }
      }
    }
  } catch { /* sin audio */ }
}

export function stopRestAudio() {
  try { audio?.pause() } catch { /* */ }
  clearMedia()
}

function clearMedia() {
  if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null }
  try { if ('mediaSession' in navigator) navigator.mediaSession.metadata = null } catch { /* */ }
}

// ---------- Notificaciones ----------

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

export async function requestNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

export function notifyRestEnd() {
  if (!config.notify || !notificationsSupported() || Notification.permission !== 'granted') return
  navigator.serviceWorker.ready
    .then(r => r.showNotification('⏱ Descanso terminado', {
      body: 'A por la siguiente serie 💪', tag: 'rest', icon: './icons/icon-192.png', badge: './icons/icon-192.png', silent: false
    } as NotificationOptions))
    .catch(() => { /* */ })
}
