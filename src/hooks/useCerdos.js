import { useState, useEffect } from 'react';
import { addCerdo, getCerdos, getCerdosNoSincronizados, deleteCerdo, isOnline } from '../db/index';
import { sincronizarCerdos, eliminarCerdoEnBackend } from '../api/sync';
import { transformarFecha } from '../utils/dateUtils';

export const useCerdos = () => {
  const [nombre, setNombre] = useState('');
  const [cerdos, setCerdos] = useState([]);
  const [online, setOnline] = useState(isOnline());
  const [sincronizando, setSincronizando] = useState(false);

  // Monitorear la conexión
  useEffect(() => {
    const updateOnlineStatus = () => setOnline(isOnline());
  
    const handleOnline = async () => {
      updateOnlineStatus();
      if (!sincronizando) await handleSync(); // Sincronizar solo si no está en proceso
    };
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', updateOnlineStatus);
  
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [sincronizando]);
  
  // Cargar datos al iniciar
  useEffect(() => {
    const inicializar = async () => {
      const data = await getCerdos();
      setCerdos(data);
    };
    inicializar();
  }, []);

  // Agregar un cerdo
  const handleAddCerdo = async () => {
    if (!nombre.trim()) return;

    const nuevoCerdo = { nombre, fecha: transformarFecha(new Date().toISOString()) };
    await addCerdo(nuevoCerdo);
    setCerdos(await getCerdos());
    setNombre('');

    if (online) await handleSync();
  };

  // Eliminar un cerdo
  const handleDeleteCerdo = async (id) => {
    await deleteCerdo(id);

    if (online) {
      try {
        await eliminarCerdoEnBackend(id);
      } catch (error) {
        console.error(`Error al eliminar el cerdo con ID ${id} del backend:`, error);
      }
    }

    setCerdos(await getCerdos());
  };

  // Sincronizar cerdos
  const handleSync = async () => {
    if (sincronizando) return; // Evitar múltiples ejecuciones simultáneas
  
    try {
      setSincronizando(true);
      const cerdosNoSincronizados = await getCerdosNoSincronizados();
  
      if (cerdosNoSincronizados.length > 0) {
        await sincronizarCerdos(cerdosNoSincronizados);
        setCerdos(await getCerdos());
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  return {
    nombre,
    setNombre,
    cerdos,
    online,
    sincronizando,
    handleAddCerdo,
    handleDeleteCerdo,
  };
};