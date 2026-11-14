// src/ui/components/CalibrationCalculator.tsx
import { useState } from 'react';
import { calcularE1RM } from '../../domain/e1rm';

export function CalibrationCalculator() {
  const [kg, setKg] = useState(80);
  const [reps, setReps] = useState(5);
  const [rir, setRir] = useState(1);

  // Llamamos a nuestra fórmula matemática
  const e1rm = calcularE1RM(kg, reps, rir);

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', color: 'white', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Test Inicial (Calculadora e1RM)</h3>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
        Introduce los datos de tu mejor serie pesada para estimar tu 100% de fuerza en un ejercicio básico. No es necesario llegar al fallo (RIR 0).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#888' }}>Kilos levantados</label>
          <input type="number" value={kg} onChange={e => setKg(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#888' }}>Reps Limpias</label>
          <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#888' }}>RIR (Reserva)</label>
          <input type="number" value={rir} onChange={e => setRir(Number(e.target.value))} style={inputStyle} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#888' }}>Tu Fuerza Máxima Estimada (1RM) es:</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: e1rm > 0 ? '#4caf50' : '#ff4d4d', marginTop: '10px' }}>
          {e1rm > 0 ? `${e1rm} kg` : 'Datos inválidos'}
        </div>
        {e1rm === 0 && <div style={{ fontSize: '12px', color: '#ff4d4d', marginTop: '5px' }}>Haz el test con cargas de entre 1 y 12 repeticiones máximas.</div>}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#333', color: 'white', boxSizing: 'border-box' as const };