import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCerdos, addCerdo, deleteCerdo, updateCerdo, isOnline } from '../db/index';
import { eliminarCerdoEnBackend, actualizarCerdoEnBackend } from '../api/sync';
import { transformarFecha } from '../utils/dateUtils';
import { useSync } from '../hooks/useSync'; // Hook de sincronización

// Creamos el contexto
const CerdoContext = createContext();

export const CerdoProvider = ({ children }) => {
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [peso, setPeso] = useState('');
  const [raza, setRaza] = useState('');
  const [estadoSalud, setEstadoSalud] = useState('');
  const [corralId, setCorralId] = useState('');
  // Estado de la lista de cerdos y conexión
  const [cerdos, setCerdos] = useState([]);
  const [online, setOnline] = useState(isOnline());

  // Utilizamos el hook de sincronización (que actualiza la lista de cerdos)
  const { sync, sincronizando } = useSync(setCerdos);

  // Monitoreo del estado de conexión
  useEffect(() => {
    const updateOnlineStatus = () => setOnline(isOnline());
    const handleOnline = async () => {
      updateOnlineStatus();
      if (!sincronizando) await sync(); // Sincroniza al volver online
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [sincronizando, sync]);

  // Cargar datos al iniciar
  useEffect(() => {
    const inicializar = async () => {
      const data = await getCerdos();
      setCerdos(data);
    };
    inicializar();
  }, []);

  // Función para agregar un cerdo
  const handleAddCerdo = async () => {
    if (!nombre.trim()) return;
    const nuevoCerdo = {
      nombre,
      peso,
      raza,
      estado_salud: estadoSalud,
      corral_id: corralId,
      fecha: transformarFecha(new Date().toISOString()),
    };
    await addCerdo(nuevoCerdo);
    setCerdos(await getCerdos());
    // Limpiar el formulario
    setNombre('');
    setPeso('');
    setRaza('');
    setEstadoSalud('');
    setCorralId('');
    if (online) await sync();
  };

  // Función para eliminar un cerdo
  const handleDeleteCerdo = async (id) => {
    await deleteCerdo(id);
    if (online) {
      try {
        await eliminarCerdoEnBackend(id);
      } catch (error) {
        console.error(`Error al eliminar el cerdo con ID ${id} en el backend:`, error);
      }
    }
    setCerdos(await getCerdos());
  };

  // Función para actualizar un cerdo
  const handleUpdateCerdo = async (id, nuevosDatos) => {
    if (!nuevosDatos.nombre?.trim()) return;
    await updateCerdo(id, nuevosDatos);
    if (online) {
      try {
        await actualizarCerdoEnBackend(id, nuevosDatos);
        console.log(`Cerdo con ID ${id} actualizado en el backend.`);
      } catch (error) {
        console.error(`Error al actualizar el cerdo con ID ${id} en el backend:`, error);
      }
    }
    setCerdos(await getCerdos());
  };

  return (
    <CerdoContext.Provider
      value={{
        // Estados del formulario
        nombre, setNombre,
        peso, setPeso,
        raza, setRaza,
        estadoSalud, setEstadoSalud,
        corralId, setCorralId,
        // Estado global
        cerdos,
        online,
        sincronizando,
        // Funciones
        handleAddCerdo,
        handleDeleteCerdo,
        handleUpdateCerdo,
        sync,
      }}
    >
      {children}
    </CerdoContext.Provider>
  );
};

// Validación de PropTypes para children
CerdoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook para consumir el contexto
export const useCerdoContext = () => {
  const context = useContext(CerdoContext);
  if (!context) {
    throw new Error('useCerdoContext debe usarse dentro de un CerdoProvider');
  }
  return context;
};
