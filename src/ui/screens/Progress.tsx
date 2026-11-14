import { WeightTracker } from '../components/WeightTracker';

export default function Progress() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <h2 style={{ marginBottom: '5px' }}>Progreso</h2>
      <p style={{ color: '#aaa', marginTop: '0', fontSize: '14px', marginBottom: '30px' }}>
        Analíticas de tu macrociclo y seguimiento físico.
      </p>

      {/* Panel de registro de peso y gráfica */}
      <WeightTracker />

      {/* Cajas reservadas para futuras métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Series esta semana</div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>0</div>
        </div>
        <div style={{ backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Entrenamientos</div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>0</div>
        </div>
      </div>
    </div>
  );
}