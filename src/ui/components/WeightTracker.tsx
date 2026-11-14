import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../../persistence/db';

export function WeightTracker() {
  const [pesoActual, setPesoActual] = useState<number>(92);
  const [historial, setHistorial] = useState<any[]>([]);

  // Cargar el historial de peso desde la base de datos
  const cargarHistorial = async () => {
    // Buscamos todas las mediciones que sean de tipo "weight"
    const datos = await db.measurements.where({ type: 'weight' }).toArray() || [];
    
    // Ordenamos por fecha y damos formato para la gráfica
    const datosFormateados = datos
      .sort((a: any, b: any) => a.date - b.date)
      .map((d: any) => ({
        fecha: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        peso: d.value
      }));
      
    setHistorial(datosFormateados);
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Función para guardar el peso de hoy
  const guardarPeso = async () => {
    await db.measurements.add({
      id: uuidv4(),
      type: 'weight',
      date: Date.now(),
      value: pesoActual
    } as any);
    
    cargarHistorial(); // Recargamos la gráfica
  };

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#007bff' }}>Evolución de Peso corporal</h3>
      
      {/* Controles para registrar el peso */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input 
          type="number" 
          step="0.1"
          value={pesoActual} 
          onChange={e => setPesoActual(Number(e.target.value))} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: 'white', fontSize: '18px' }} 
        />
        <button 
          onClick={guardarPeso}
          style={{ padding: '0 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Guardar Hoy
        </button>
      </div>

      {/* Gráfica visual */}
      <div style={{ height: '250px', width: '100%', backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '10px 10px 10px 0' }}>
        {historial.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historial}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="fecha" stroke="#888" fontSize={12} tickMargin={10} />
              <YAxis stroke="#888" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: 'white' }} />
              <Area type="monotone" dataKey="peso" stroke="#007bff" fill="#007bff" fillOpacity={0.3} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Añade tu primer peso para ver la gráfica
          </div>
        )}
      </div>
    </div>
  );
}