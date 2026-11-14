import { v4 as uuidv4 } from 'uuid';

export const MACROCICLO_ID = "macro-hipertrofia-98kg";

export const macrocicloSeed = {
  id: MACROCICLO_ID,
  name: "Camino a 98kg - Fuerza e Hipertrofia",
  durationWeeks: 24,
  mesocycles: [
    {
      id: "meso-1", 
      macrocycleId: MACROCICLO_ID, 
      order: 1, 
      name: "1. Base Estructural y Volumen", 
      durationWeeks: 6, 
      focus: "Hipertrofia inicial",
      workouts: [
        { dayNumber: 1, name: "Día 1: Torso A", exercises: [{ name: "Press Banca Plano", series: 3, reps: "8-10", rir: 2, restSecs: 120 }, { name: "Press Inclinado", series: 3, reps: "10-12", rir: 1, restSecs: 90 }, { name: "Remo en Máquina", series: 3, reps: "10-12", rir: 2, restSecs: 90 }, { name: "Elevaciones Laterales", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Extensión Tríceps", series: 3, reps: "10-12", rir: 1, restSecs: 60 }] },
        { dayNumber: 2, name: "Día 2: Pierna A", exercises: [{ name: "Sentadilla / Prensa", series: 4, reps: "8-10", rir: 2, restSecs: 150 }, { name: "Extensión Cuádriceps", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Peso Muerto Rumano", series: 3, reps: "8-10", rir: 2, restSecs: 120 }, { name: "Curl Isquios", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Gemelo", series: 3, reps: "12-15", rir: 1, restSecs: 60 }] },
        { dayNumber: 3, name: "Día 3: Torso B", exercises: [{ name: "Dominadas / Jalón", series: 3, reps: "8-10", rir: 2, restSecs: 120 }, { name: "Remo Gironda", series: 3, reps: "10-12", rir: 1, restSecs: 90 }, { name: "Press Militar", series: 3, reps: "8-10", rir: 2, restSecs: 120 }, { name: "Pájaros Hombro", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Curl Bíceps", series: 3, reps: "10-12", rir: 1, restSecs: 60 }] },
        { dayNumber: 4, name: "Día 4: Pierna B", exercises: [{ name: "Hip Thrust", series: 4, reps: "8-10", rir: 2, restSecs: 150 }, { name: "Prensa Inclinada", series: 3, reps: "10-12", rir: 1, restSecs: 90 }, { name: "Zancadas / Búlgaras", series: 3, reps: "10-12", rir: 1, restSecs: 90 }, { name: "Curl Femoral", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Gemelo Sentado", series: 3, reps: "12-15", rir: 1, restSecs: 60 }] }
      ]
    },
    {
      id: "meso-2", 
      macrocycleId: MACROCICLO_ID, 
      order: 2, 
      name: "2. Intensificación y Sobrecarga", 
      durationWeeks: 6, 
      focus: "Tensión mecánica y menor RIR",
      workouts: [
        { dayNumber: 1, name: "Día 1: Torso A", exercises: [{ name: "Press Banca Plano", series: 4, reps: "6-8", rir: 1, restSecs: 150 }, { name: "Press Inclinado Mancuernas", series: 3, reps: "8-10", rir: 1, restSecs: 120 }, { name: "Remo con Barra", series: 4, reps: "8-10", rir: 1, restSecs: 120 }, { name: "Elevaciones Laterales", series: 4, reps: "10-12", rir: 1, restSecs: 60 }, { name: "Press Francés", series: 3, reps: "8-10", rir: 1, restSecs: 90 }] },
        { dayNumber: 2, name: "Día 2: Pierna A", exercises: [{ name: "Sentadilla Libre", series: 4, reps: "6-8", rir: 1, restSecs: 180 }, { name: "Extensión Cuádriceps", series: 3, reps: "10-12", rir: 1, restSecs: 90 }, { name: "Peso Muerto Rumano", series: 4, reps: "6-8", rir: 1, restSecs: 150 }, { name: "Curl Isquios", series: 3, reps: "10-12", rir: 1, restSecs: 60 }, { name: "Gemelo Standing", series: 4, reps: "10-12", rir: 1, restSecs: 60 }] },
        { dayNumber: 3, name: "Día 3: Torso B", exercises: [{ name: "Dominadas Lastradas", series: 4, reps: "6-8", rir: 1, restSecs: 150 }, { name: "Remo Polea Baja", series: 3, reps: "8-10", rir: 1, restSecs: 90 }, { name: "Press Militar de Pie", series: 4, reps: "6-8", rir: 1, restSecs: 150 }, { name: "Pájaros Posteriores", series: 3, reps: "12-15", rir: 1, restSecs: 60 }, { name: "Curl Barra Z", series: 3, reps: "8-10", rir: 1, restSecs: 90 }] },
        { dayNumber: 4, name: "Día 4: Pierna B", exercises: [{ name: "Hip Thrust Pesado", series: 4, reps: "6-8", rir: 1, restSecs: 150 }, { name: "Prensa Inclinada", series: 3, reps: "8-10", rir: 1, restSecs: 120 }, { name: "Sentadilla Búlgara", series: 3, reps: "8-10", rir: 1, restSecs: 90 }, { name: "Curl Femoral", series: 3, reps: "10-12", rir: 1, restSecs: 60 }, { name: "Gemelo Máquina", series: 4, reps: "10-12", rir: 1, restSecs: 60 }] }
      ]
    }
  ]
};