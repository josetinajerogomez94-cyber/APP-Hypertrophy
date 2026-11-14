// src/domain/e1rm.ts

export function calcularE1RM(kg: number, repsLimpias: number, rir: number): number {
  // Las repeticiones totales que habrías hecho si llegas al fallo
  const rtf = repsLimpias + rir; 
  
  if (rtf <= 0 || kg <= 0) return 0;
  
  // Si son más de 12 repeticiones, las fórmulas pierden precisión
  if (rtf > 12) return 0; 

  let e1rm = 0;
  if (rtf <= 5) {
    // Fórmula de Brzycki (mejor para rangos muy pesados de 1 a 5 reps)
    e1rm = kg * (36 / (37 - rtf));
  } else {
    // Fórmula de Epley (mejor para rangos de 6 a 12 reps)
    e1rm = kg * (1 + rtf / 30);
  }

  // Devolvemos el resultado redondeado a un decimal
  return Math.round(e1rm * 10) / 10;
}