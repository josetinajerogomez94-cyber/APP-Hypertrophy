import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../persistence/db';
import { useWorkoutStore } from '../../app/workoutStore';
import { calcularSiguientePaso } from '../../domain/progression';

export function SetRow({ numeroSerie, ejercicioId }: { numeroSerie: number, ejercicioId: string }) {
  const [kg, setKg] = useState(0);
  const [reps, setReps] = useState(0);
  const [rir, setRir] = useState(2);
  const [guardado, setGuardado] = useState(false); 
  const [consejo, setConsejo] = useState('Buscando historial...');

  const { sessionId } = useWorkoutStore();

  const ajustarKg = (cantidad: number) => setKg(prev => Math.max(0, prev + cantidad));
  const ajustarReps = (cantidad: number) => setReps(prev => Math.max(0, prev + cantidad));
  const ajustarRir = (cantidad: number) => setRir(prev => Math.max(0, Math.min(4, prev + cantidad)));

  // Buscamos la última vez que hiciste este ejercicio para darte un consejo
  useEffect(() => {
    const analizarHistorial = async () => {
      if (!ejercicioId) return;
      
      // Buscamos las series de este ejercicio en la base de datos
      const seriesAntiguas = await db.setLogs.where({ exerciseId: ejercicioId }).toArray();
      
      if (seriesAntiguas.length === 0) {
        setConsejo("No hay datos. Busca tu peso inicial.");
        return;
      }

      // Ordenamos para coger las más recientes y adaptamos los datos al motor
      const ultimasSeries = seriesAntiguas
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3) // Cogemos las 3 últimas a modo de referencia
        .map(s => ({ kg: s.kg, reps: s.reps, rir: s.rirReal === 'unknown' ? 0 : s.rirReal }));

      // Llamamos a nuestro motor de doble progresión (asumiendo rango 8-12 reps)
      const recomendacion = calcularSiguientePaso(ultimasSeries, 8, 12, 2, 2.5);
      
      setConsejo(recomendacion.mensaje);
      if (recomendacion.kgPropuesto && kg === 0) {
        setKg(recomendacion.kgPropuesto); // Ponemos los kilos automáticamente
      }
    };

    analizarHistorial();
  }, [ejercicioId]);

  const guardarSerie = async () => {
    if (!sessionId) return;
    await db.setLogs.add({
      id: uuidv4(), sessionId, exerciseId: ejercicioId, tipo: 'working',
      kg, reps, rirReal: rir, timestamp: Date.now()
    });
    setGuardado(true);
  };

  return (
    <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '12px', marginBottom: '15px', color: 'white', opacity: guardado ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, color: '#aaa' }}>Serie {numeroSerie}</h4>
        <span style={{ fontSize: '14px', backgroundColor: '#444', padding: '4px 8px', borderRadius: '6px' }}>Efectiva</span>
      </div>

      {/* AQUÍ ESTÁ LA MAGIA: El consejo de la aplicación */}
      <div style={{ backgroundColor: '#1b2a3a', padding: '10px', borderRadius: '6px', marginBottom: '15px', borderLeft: '4px solid #007bff' }}>
        <span style={{ fontSize: '13px', color: '#88b8ff' }}>💡 IA Progresión: </span>
        <span style={{ fontSize: '13px', color: '#ddd' }}>{consejo}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Kg</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px' }}>
            <button onClick={() => ajustarKg(-2.5)} disabled={guardado} style={btnStyle}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{kg}</span>
            <button onClick={() => ajustarKg(2.5)} disabled={guardado} style={btnStyle}>+</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Reps</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px' }}>
            <button onClick={() => ajustarReps(-1)} disabled={guardado} style={btnStyle}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{reps}</span>
            <button onClick={() => ajustarReps(1)} disabled={guardado} style={btnStyle}>+</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>RIR</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px' }}>
            <button onClick={() => ajustarRir(-1)} disabled={guardado} style={btnStyle}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{rir}</span>
            <button onClick={() => ajustarRir(1)} disabled={guardado} style={btnStyle}>+</button>
          </div>
        </div>
      </div>

      <button 
        onClick={guardarSerie} disabled={guardado} 
        style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: guardado ? '#1b5e20' : '#4caf50', color: guardado ? '#aaa' : 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
      >
        {guardado ? '✓ Serie Guardada' : 'Guardar Serie'}
      </button>
    </div>
  );
}

const btnStyle = { backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', width: '30px', height: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' };