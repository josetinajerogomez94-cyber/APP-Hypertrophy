// src/ui/components/MicrocycleSelector.tsx
import { useState } from 'react';

export function MicrocycleSelector({ onSelectSession }: { onSelectSession: (nombre: string) => void }) {
  // Las 4 sesiones exactas que te programó la IA + opción libre
  const sesiones = [
    { id: 'torso_a', nombre: 'Torso A (Pecho y Espalda)', dia: 'Lunes' },
    { id: 'pierna_a', nombre: 'Pierna A (Cuádriceps)', dia: 'Martes' },
    { id: 'torso_b', nombre: 'Torso B (Hombros y Brazos)', dia: 'Jueves' },
    { id: 'pierna_b', nombre: 'Pierna B (Isquios y Glúteos)', dia: 'Viernes' },
    { id: 'libre', nombre: 'Entrenamiento Libre', dia: 'Extra' }
  ];

  const [seleccionada, setSeleccionada] = useState(sesiones[0].id);

  return (
    <div style={{ marginBottom: '25px', backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px' }}>
      <h3 style={{ color: 'white', marginBottom: '5px', marginTop: 0 }}>Rutina de hoy</h3>
      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>
        Selecciona la sesión correspondiente a tu microciclo:
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sesiones.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setSeleccionada(s.id);
              onSelectSession(s.nombre);
            }}
            style={{
              padding: '12px 15px',
              borderRadius: '8px',
              border: seleccionada === s.id ? '2px solid #007bff' : '1px solid #333',
              backgroundColor: seleccionada === s.id ? '#007bff22' : '#2a2a2a',
              color: 'white',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{s.dia}</span>
            <span style={{ fontSize: '14px', color: seleccionada === s.id ? '#66b2ff' : '#aaa' }}>{s.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}