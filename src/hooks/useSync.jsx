// src/hooks/useSync.jsx
import { useState } from 'react';
import { getCerdosNoSincronizados, getCerdos } from '../db/index';
import { sincronizarCerdos } from '../api/sync';

export const useSync = (setCerdos) => {
  const [sincronizando, setSincronizando] = useState(false);

  const sync = async () => {
    if (sincronizando) return; // Evitar múltiples ejecuciones
    try {
      setSincronizando(true);
      const cerdosNoSincronizados = await getCerdosNoSincronizados();
      if (cerdosNoSincronizados.length > 0) {
        await sincronizarCerdos(cerdosNoSincronizados);
        // Actualiza la lista de cerdos después de sincronizar
        const data = await getCerdos();
        setCerdos(data);
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  return { sync, sincronizando, setSincronizando };
};
