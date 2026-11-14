import { useState } from 'react';
import { SetRow } from './SetRow';
import type { Exercise } from '../../domain/types';

// Este componente representa todo el bloque: El selector y sus series
export function ExerciseBlock({ ejerciciosDisponibles }: { ejerciciosDisponibles: Exercise[] }) {
  const [ejercicioSeleccionadoId, setEjercicioSeleccionadoId] = useState<string>(
    ejerciciosDisponibles.length > 0 ? ejerciciosDisponibles[0].id : ''
  );
  const [cantidadSeries, setCantidadSeries] = useState(1);

  return (
    <div style={{ marginTop: '20px', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px' }}>
      
      {/* Selector de ejercicio */}
      <select 
        value={ejercicioSeleccionadoId}
        onChange={(e) => setEjercicioSeleccionadoId(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#333', color: 'white', border: '1px solid #555', fontSize: '16px' }}
      >
        {ejerciciosDisponibles.map(ej => (
          <option key={ej.id} value={ej.id}>{ej.nombre} ({ej.variante})</option>
        ))}
      </select>
      
      {/* Lista de series */}
      {Array.from({ length: cantidadSeries }).map((_, indice) => (
        <SetRow 
          key={indice} 
          numeroSerie={indice + 1} 
          ejercicioId={ejercicioSeleccionadoId} 
        />
      ))}

      {/* Botón para añadir serie a este ejercicio */}
      <button 
        onClick={() => setCantidadSeries(prev => prev + 1)}
        style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#007bff', border: '2px dashed #007bff', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', marginTop: '5px' }}
      >
        + Añadir Serie
      </button>
    </div>
  );
}