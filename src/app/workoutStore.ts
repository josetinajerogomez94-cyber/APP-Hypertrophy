import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Definimos qué pausas hacemos (cuándo empiezan y cuándo acaban)
export interface PauseSegment {
  start: number;
  end: number | null; // Si es null, es que seguimos en pausa
}

// Definimos todo lo que este "cerebro" sabe hacer
interface WorkoutState {
  sessionId: string | null;
  estado: 'idle' | 'active' | 'paused' | 'finished';
  startedAt: number | null;
  pauses: PauseSegment[];
  
  // Acciones (botones que pulsaremos en la pantalla)
  startSession: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // Estado inicial: no hay sesión activa
  sessionId: null,
  estado: 'idle',
  startedAt: null,
  pauses: [],

  startSession: () => set({
    sessionId: uuidv4(),
    estado: 'active',
    startedAt: Date.now(), // Guardamos la hora exacta del móvil
    pauses: []
  }),

  pauseTimer: () => {
    const { estado, pauses } = get();
    if (estado !== 'active') return;

    // Añadimos una nueva pausa que empieza AHORA
    set({
      estado: 'paused',
      pauses: [...pauses, { start: Date.now(), end: null }]
    });
  },

  resumeTimer: () => {
    const { estado, pauses } = get();
    if (estado !== 'paused' || pauses.length === 0) return;

    // Cogemos la última pausa y le ponemos la hora de fin
    const updatedPauses = [...pauses];
    const lastPauseIndex = updatedPauses.length - 1;
    updatedPauses[lastPauseIndex] = {
      ...updatedPauses[lastPauseIndex],
      end: Date.now()
    };

    set({
      estado: 'active',
      pauses: updatedPauses
    });
  },

  finishSession: () => set({
    estado: 'finished'
    // En el futuro, aquí enviaremos los datos finales a la base de datos Dexie
  })
}));
