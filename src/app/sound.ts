let ctx: AudioContext | null = null

/** iOS solo permite sonido si se "desbloquea" con un toque del usuario. Se llama al marcar una serie. */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext
    if (!AC) return
    ctx ??= new AC()
    if (ctx.state === 'suspended') ctx.resume()
  } catch { /* sin sonido */ }
}

export function beep(times = 3) {
  try {
    if (!ctx) return
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = i === times - 1 ? 1320 : 880
      o.connect(g); g.connect(ctx.destination)
      const t = ctx.currentTime + i * 0.35
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      o.start(t); o.stop(t + 0.3)
    }
  } catch { /* sin sonido */ }
  try { navigator.vibrate?.([200, 100, 200]) } catch { /* iOS no vibra */ }
}
