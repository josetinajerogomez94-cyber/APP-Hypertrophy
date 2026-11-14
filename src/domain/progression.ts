export interface SerieAnterior {
  kg: number;
  reps: number;
  rir: number;
}

export function calcularSiguientePaso(
  seriesAnteriores: SerieAnterior[],
  repsMin: number,
  repsMax: number,
  rirObjetivo: number,
  incrementoMin: number = 2.5
) {
  // Si no hay historial, no podemos predecir
  if (!seriesAnteriores || seriesAnteriores.length === 0) {
    return { 
      mensaje: "Primer día. Busca tu peso para el rango objetivo.", 
      kgPropuesto: null 
    };
  }

  const pesoActual = seriesAnteriores[0].kg;

  // 1. ¿Superó el rango máximo con el esfuerzo correcto? -> SUBIR PESO
  const todasAlMaximo = seriesAnteriores.every(s => s.reps >= repsMax && s.rir >= rirObjetivo);
  
  // 2. ¿No llegó al mínimo exigido? -> REVISAR/BAJAR PESO
  const algunaFallo = seriesAnteriores.some(s => s.reps < repsMin);

  if (todasAlMaximo) {
    return { 
      mensaje: `¡Dominado! Sube ${incrementoMin}kg e intenta sacar al menos ${repsMin} reps.`, 
      kgPropuesto: pesoActual + incrementoMin 
    };
  }

  if (algunaFallo) {
    return { 
      mensaje: `Rendimiento bajo. Mantén ${pesoActual}kg y descansa más, o reduce carga.`, 
      kgPropuesto: pesoActual 
    };
  }

  // 3. Progreso normal (doble progresión): MANTENER PESO y SUMAR REPS
  return { 
    mensaje: `Mantén ${pesoActual}kg. Intenta sacar 1 o 2 repeticiones más que el último día.`, 
    kgPropuesto: pesoActual 
  };
}