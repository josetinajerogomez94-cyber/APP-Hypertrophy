// src/ui/screens/Plan.tsx
import { CalibrationCalculator } from '../components/CalibrationCalculator';
import { MacrocycleTimeline } from '../components/MacrocycleTimeline'; // Importamos la línea de tiempo

export default function Plan() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <h2 style={{ marginBottom: '5px' }}>Planificación</h2>
      <p style={{ color: '#aaa', marginTop: '0', fontSize: '14px' }}>
        Estructura de entrenamiento y calibración de cargas.
      </p>

      <CalibrationCalculator />
      
      {/* Insertamos la vista de los 6 mesociclos */}
      <MacrocycleTimeline />
    </div>
  );
}