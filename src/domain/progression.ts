import type { SessionExercise } from './types'
import { getExercise } from './exercises'
import { roundLoad } from './program'

export interface Suggestion { kg: number | null; text: string }

/**
 * Doble progresión.
 *  - Todas las series al máximo del rango con el RIR pedido → sube el incremento mínimo.
 *  - Alguna serie por debajo del mínimo → mantén (o baja si fallaron la mayoría).
 *  - En otro caso → mismo peso, intenta sumar repeticiones.
 */
export function suggestNext(
  last: SessionExercise | null,
  target: { reps: [number, number]; rir: number; deload?: boolean },
  exerciseId: string
): Suggestion {
  const inc = getExercise(exerciseId).increment || 2.5
  const [min, max] = target.reps
  const done = (last?.entries ?? []).filter(e => e.done && e.kg != null && e.reps != null)
  if (!done.length) return { kg: null, text: `Sin historial: elige un peso con el que hagas ${max} reps dejando ${target.rir} en reserva.` }

  const top = Math.max(...done.map(e => e.kg!))
  const atTop = done.filter(e => e.kg === top)
  if (target.deload) {
    const kg = roundLoad(top * 0.9, inc || 2.5)
    return { kg, text: `Descarga: usa ~${kg} kg (un 10 % menos) y no te acerques al fallo.` }
  }
  const allMax = atTop.every(e => e.reps! >= max && (e.rir == null || e.rir >= target.rir - 1))
  const failed = atTop.filter(e => e.reps! < min).length
  if (allMax && inc > 0) return { kg: top + inc, text: `¡Rango completado! Sube a ${top + inc} kg y busca al menos ${min} reps.` }
  if (failed > atTop.length / 2 && inc > 0) {
    const kg = Math.max(0, top - inc)
    return { kg, text: `La última vez no llegaste a ${min} reps. Baja a ${kg} kg y consolida.` }
  }
  const reps = atTop.map(e => e.reps).join(', ')
  return { kg: top, text: `Mantén ${top} kg (la última vez: ${reps}). Intenta sumar 1 rep en alguna serie.` }
}
