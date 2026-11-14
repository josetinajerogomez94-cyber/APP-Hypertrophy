/**
 * 1RM estimado a partir de una serie submáxima.
 * Repeticiones hasta el fallo = repeticiones hechas + RIR.
 * Brzycki (1-5 reps) y Epley (6-12 reps). Por encima de 12 reps no es fiable → 0.
 */
export function calcularE1RM(kg: number, repsLimpias: number, rir: number): number {
  const rtf = repsLimpias + rir
  if (rtf <= 0 || kg <= 0) return 0
  if (rtf > 12) return 0
  const e1rm = rtf <= 5 ? kg * (36 / (37 - rtf)) : kg * (1 + rtf / 30)
  return Math.round(e1rm * 10) / 10
}
