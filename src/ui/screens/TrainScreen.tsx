import React, { useEffect, useState } from 'react';
import { db } from '../../persistence/db';
import { useProfile } from '../hooks';

export function TrainScreen() {
  const profile = useProfile();
  const [mesocycles, setMesocycles] = useState<any[]>([]);
  const [selectedMesoId, setSelectedMesoId] = useState('');
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!profile) return;
      try {
        const allMesos = await db.mesocycles.toArray();
        allMesos.sort((a, b) => a.order - b.order);
        setMesocycles(allMesos);
        if (allMesos.length > 0) {
          const firstId = allMesos[0].id;
          setSelectedMesoId(firstId);
          await loadWorkoutsForMeso(firstId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  async function loadWorkoutsForMeso(mesoId: string) {
    const todas = await db.plannedSessions.toArray();
    const sesiones = todas.filter(s => s.mesocycleId === mesoId);
    sesiones.sort((a, b) => a.dayNumber - b.dayNumber);
    setAvailableWorkouts(sesiones);
    if (sesiones.length > 0) {
      setWorkout(sesiones[0]);
    } else {
      setWorkout(null);
    }
  }

  const handleMesoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedMesoId(newId);
    await loadWorkoutsForMeso(newId);
  };

  const handleWorkoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableWorkouts.find(w => w.id === e.target.value);
    if (selected) setWorkout(selected);
  };

  if (loading) return <div style={{ padding: '20px', color: '#aaa' }}>Cargando...</div>;
  if (!workout || availableWorkouts.length === 0) return <div style={{ padding: '20px', color: 'white' }}><h2>Descanso</h2></div>;

  if (isTraining) {
    return (
      <div style={{ padding: '20px', paddingBottom: '90px', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#007bff' }}>Entrenando...</h2>
          <button onClick={() => setIsTraining(false)} style={{ backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Abortar</button>
        </div>
        <h1 style={{ fontSize: '22px', marginBottom: '25px' }}>{workout.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {workout.exercisesInfo?.map((ex: any, exIndex: number) => (
            <div key={exIndex} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', border: '1px solid #333' }}>
              <h3 style={{ marginTop: 0, color: '#fff', fontSize: '18px', marginBottom: '5px' }}>{ex.name}</h3>
              <div style={{ fontSize: '13px', color: '#88b8ff', marginBottom: '15px', fontWeight: 'bold' }}>Objetivo: {ex.series}x{ex.reps} | RIR {ex.rir} | {ex.restSecs}s</div>
              {Array.from({ length: ex.series }).map((_, serieIndex) => (
                <div key={serieIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '25px', textAlign: 'center', fontWeight: 'bold', color: '#888' }}>{serieIndex + 1}</div>
                  <input type="number" placeholder="kg" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2a2a2a', color: 'white', fontSize: '16px', textAlign: 'center' }} />
                  <input type="number" placeholder="reps" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2a2a2a', color: 'white', fontSize: '16px', textAlign: 'center' }} />
                  <button style={{ padding: '12px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button style={{ marginTop: '30px', width: '100%', padding: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Finalizar Entrenamiento</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '90px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Fase Actual</label>
          <select value={selectedMesoId} onChange={handleMesoChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1b2a3a', color: 'white', border: '1px solid #333', fontSize: '14px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}>
            {mesocycles.map(m => (
              <option key={m.id} value={m.id}>{m.order}. {m.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Día de Entrenamiento</label>
          <select value={workout.id} onChange={handleWorkoutChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1b2a3a', color: '#007bff', border: '1px solid #007bff', fontSize: '14px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}>
            {availableWorkouts.map(w => (
              <option key={w.id} value={w.id}>Día {w.dayNumber}: {w.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>
      </div>
      <h1 style={{ marginTop: '10px', fontSize: '24px', marginBottom: '15px' }}>{workout.name}</h1>
      <div style={{ backgroundColor: '#1b2a3a', padding: '15px', borderRadius: '10px', marginBottom: '25px', borderLeft: '4px solid #007bff' }}>
        <p style={{ margin: 0, color: '#ddd', fontSize: '14px', lineHeight: '1.5' }}><strong>Objetivo de hoy:</strong> Prioriza el control excéntrico y la técnica.</p>
      </div>
      <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>Ejercicios Programados</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {workout.exercisesInfo?.map((ex: any, index: number) => (
          <div key={index} style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#fff' }}>{index + 1}. {ex.name}</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#2a2a2a', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{ex.series} series</span>
              <span style={{ backgroundColor: '#2a2a2a', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{ex.reps} reps</span>
              <span style={{ backgroundColor: '#007bff22', color: '#88b8ff', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>RIR {ex.rir}</span>
              <span style={{ backgroundColor: '#2a2a2a', color: '#aaa', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>{ex.restSecs}s</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setIsTraining(true)} style={{ marginTop: '30px', width: '100%', padding: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,123,255,0.3)' }}>Comenzar Entrenamiento</button>
    </div>
  );
}