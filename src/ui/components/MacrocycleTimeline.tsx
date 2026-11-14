// src/ui/components/MacrocycleTimeline.tsx

export function MacrocycleTimeline() {
  // Aquí definimos los 6 bloques exactamente como los planificaste
  const mesociclos = [
    { id: 'M1', nombre: 'Adaptación y Calibración', fechas: '9 Nov - 20 Dic 2026', objetivo: 'Establecer cargas, volumen recuperable y marcas.', estado: 'proximo', color: '#4caf50' },
    { id: 'M2', nombre: 'Hipertrofia Base', fechas: '21 Dic 2026 - 31 Ene 2027', objetivo: 'Acumular trabajo de calidad en todos los grupos musculares.', estado: 'futuro', color: '#2196f3' },
    { id: 'M3', nombre: 'Fuerza e Hipertrofia', fechas: '1 Feb - 14 Mar 2027', objetivo: 'Mejorar la capacidad de mover más carga manteniendo el estímulo.', estado: 'futuro', color: '#9c27b0' },
    { id: 'M4', nombre: 'Hipertrofia Específica', fechas: '15 Mar - 25 Abr 2027', objetivo: 'Mayor prioridad a la amplitud del torso (hombros, pecho, dorsal).', estado: 'futuro', color: '#ff9800' },
    { id: 'M5', nombre: 'Especialización Estética', fechas: '26 Abr - 6 Jun 2027', objetivo: 'Maximizar hombros y brazos. Piernas en mantenimiento.', estado: 'futuro', color: '#e91e63' },
    { id: 'M6', nombre: 'Consolidación', fechas: '7 Jun - 18 Jul 2027', objetivo: 'Mantener cargas altas, evitar fatiga y llegar al verano al 100%.', estado: 'futuro', color: '#00bcd4' },
  ];

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: 'white' }}>Tu Macrociclo (2026 - 2027)</h3>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
        6 bloques de 6 semanas (5 de progresión + 1 de descarga programada).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {mesociclos.map((meso) => (
          <div key={meso.id} style={{ backgroundColor: '#1e1e1e', borderLeft: `5px solid ${meso.color}`, padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: 'white', fontSize: '16px' }}>{meso.id} · {meso.nombre}</h4>
              <span style={{ fontSize: '12px', color: '#888', backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px' }}>
                {meso.fechas}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#bbb' }}>{meso.objetivo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}