import { useEffect, useState } from 'react';
import { useWorkoutStore } from '../../app/workoutStore';

export function WorkoutTimer() {
  const { estado, startedAt, pauses, pauseTimer, resumeTimer } = useWorkoutStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Si no estamos entrenando, el reloj se queda a 0
    if (estado === 'idle' || !startedAt) {
      setElapsedSeconds(0);
      return;
    }

    // Esta función calcula el tiempo real
    const calculateTime = () => {
      const now = Date.now();
      
      // Sumamos todo el tiempo que hemos estado en pausa
      let totalPausedTime = 0;
      pauses.forEach(p => {
        if (p.end) {
          totalPausedTime += (p.end - p.start);
        } else {
          // Si seguimos en pausa AHORA mismo
          totalPausedTime += (now - p.start);
        }
      });

      // El tiempo real es: Ahora - Inicio - Pausas
      const realElapsedMs = now - startedAt - totalPausedTime;
      setElapsedSeconds(Math.floor(realElapsedMs / 1000));
    };

    // Calculamos el tiempo inmediatamente
    calculateTime();

    // Actualizamos la pantalla cada 1 segundo
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  }, [estado, startedAt, pauses]);

  // Convertimos los segundos a formato MM:SS (ejemplo: 05:30)
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

  // Si no hay sesión, no dibujamos nada
  if (estado === 'idle') return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', backgroundColor: '#1e1e1e', borderRadius: '8px', color: 'white' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace' }}>
        ⏱ {minutes}:{seconds}
      </div>
      
      {/* Botón para Pausar / Reanudar */}
      <button 
        onClick={estado === 'active' ? pauseTimer : resumeTimer}
        style={{ padding: '8px 16px', fontSize: '16px', borderRadius: '6px', border: 'none', backgroundColor: estado === 'active' ? '#ff4d4d' : '#4caf50', color: 'white', fontWeight: 'bold' }}
      >
        {estado === 'active' ? 'Pausar' : 'Reanudar'}
      </button>
    </div>
  );
}