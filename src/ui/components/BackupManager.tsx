import { useState, useRef } from 'react';
import { db } from '../../persistence/db';

export function BackupManager() {
  const [mensaje, setMensaje] = useState('');
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  // Función para DESCARGAR
  const exportarDatos = async () => {
    try {
      const perfil = await db.profile.toArray();
      const ejercicios = await db.exercises.toArray();
      const sesiones = await db.sessions.toArray();
      const series = await db.setLogs.toArray();
      const medidas = await db.measurements.toArray();

      const backup = { fechaExportacion: new Date().toISOString(), perfil, ejercicios, sesiones, series, medidas };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hypertrophy_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      mostrarMensaje('✓ Copia descargada con éxito');
    } catch (error) {
      mostrarMensaje('❌ Error al exportar los datos');
    }
  };

  // Función para RESTAURAR
  const importarDatos = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = async (e) => {
      try {
        const datos = JSON.parse(e.target?.result as string);
        
        // Escribimos todo en la base de datos de golpe
        await db.transaction('rw', db.profile, db.exercises, db.sessions, db.setLogs, db.measurements, async () => {
          if (datos.perfil?.length) await db.profile.bulkPut(datos.perfil);
          if (datos.ejercicios?.length) await db.exercises.bulkPut(datos.ejercicios);
          if (datos.sesiones?.length) await db.sessions.bulkPut(datos.sesiones);
          if (datos.series?.length) await db.setLogs.bulkPut(datos.series);
          if (datos.medidas?.length) await db.measurements.bulkPut(datos.medidas);
        });

        mostrarMensaje('✓ Datos restaurados. Actualizando la app...');
        // Recargamos la página para que la app lea los datos nuevos
        setTimeout(() => window.location.reload(), 2000); 
      } catch (error) {
        mostrarMensaje('❌ Archivo no válido o error al restaurar');
      }
    };
    lector.readAsText(archivo);
  };

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 4000);
  };

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', color: 'white', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#007bff' }}>Copias de Seguridad</h3>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
        Tus datos se guardan en este dispositivo. Descarga una copia periódicamente para no perder tu progreso.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={exportarDatos}
          style={{ width: '100%', padding: '12px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
        >
          📥 Descargar Copia (JSON)
        </button>

        {/* Botón oculto para subir archivo */}
        <input 
          type="file" 
          accept=".json" 
          ref={inputArchivoRef} 
          style={{ display: 'none' }} 
          onChange={importarDatos}
        />
        
        <button 
          onClick={() => inputArchivoRef.current?.click()}
          style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#007bff', border: '2px dashed #007bff', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
        >
          📤 Restaurar Copia
        </button>
      </div>

      {mensaje && (
        <div style={{ marginTop: '15px', textAlign: 'center', color: mensaje.includes('✓') ? '#4caf50' : '#ff4d4d', fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}