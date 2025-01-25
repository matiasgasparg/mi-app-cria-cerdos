import React, { useState, useEffect } from 'react';
import { addCerdo, getCerdos, getCerdosNoSincronizados, deleteCerdo, isOnline } from './db/index';
import { sincronizarCerdos } from './api/sync';

// Función para transformar la fecha al formato MySQL (YYYY-MM-DD HH:MM:SS)
const transformarFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
};

function App() {
  const [nombre, setNombre] = useState('');
  const [cerdos, setCerdos] = useState([]);
  const [online, setOnline] = useState(isOnline());
  const [sincronizando, setSincronizando] = useState(false);

  // Monitorear la conexión
  useEffect(() => {
    const updateOnlineStatus = () => setOnline(isOnline());

    window.addEventListener('online', async () => {
      updateOnlineStatus();
      if (!sincronizando) await handleSync(); // Intentar sincronizar al volver en línea
    });
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [sincronizando]);

  // Cargar y limpiar datos al iniciar
  useEffect(() => {
    const inicializar = async () => {
      const data = await getCerdos();
      console.log('Datos locales cargados:', data);

      setCerdos(data);
    };
    inicializar();
  }, []);

  const handleAddCerdo = async () => {
    if (!nombre.trim()) return;

    // Transformar la fecha al formato compatible con MySQL
    const fechaTransformada = transformarFecha(new Date().toISOString());

    const nuevoCerdo = { nombre, fecha: fechaTransformada };

    // Agregar cerdo a IndexedDB
    await addCerdo(nuevoCerdo);
    console.log('Cerdo agregado localmente:', nuevoCerdo);

    // Actualizar lista de cerdos
    setCerdos(await getCerdos());
    setNombre('');

    // Intentar sincronizar si está en línea
    if (online) await handleSync();
  };

  const handleDeleteCerdo = async (id) => {
    await deleteCerdo(id);
    setCerdos(await getCerdos());
  };

  const handleSync = async () => {
    try {
      setSincronizando(true);
      // Obtener cerdos no sincronizados antes de intentar la sincronización
      const cerdosNoSincronizados = await getCerdosNoSincronizados();
      console.log('Cerdos no sincronizados:', cerdosNoSincronizados);

      // Pasar los cerdos no sincronizados a la función de sincronización
      await sincronizarCerdos(cerdosNoSincronizados);
      setCerdos(await getCerdos()); // Actualizar lista después de sincronizar
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div>
      <h1>Gestión de Cerdos</h1>
      <p>Estado de conexión: {online ? 'En línea' : 'Sin conexión'}</p>
      <input
        type="text"
        placeholder="Nombre del cerdo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button onClick={handleAddCerdo} disabled={sincronizando}>
        {sincronizando ? 'Sincronizando...' : 'Agregar Cerdo'}
      </button>
      <ul>
        {cerdos.map((cerdo) => (
          <li key={cerdo.id}>
            {cerdo.nombre} - {new Date(cerdo.fecha).toLocaleString()}
            <button onClick={() => handleDeleteCerdo(cerdo.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
