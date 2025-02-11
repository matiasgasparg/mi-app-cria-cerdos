// src/hooks/useSync.jsx
import { useState } from 'react';
import { getCerdosNoSincronizados, getCerdos } from '../db/index';
import { sincronizarCerdos } from '../api/sync';
import { toast } from 'react-toastify';

// Función para crear un delay (promesa que se resuelve después de ms milisegundos)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useSync = (setCerdos) => {
  const [sincronizando, setSincronizando] = useState(false);

  const sync = async () => {
    if (sincronizando) return;
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    while (attempts < maxAttempts && !success) {
      try {
        setSincronizando(true);
        const cerdosNoSincronizados = await getCerdosNoSincronizados();
        if (cerdosNoSincronizados.length > 0) {
          await sincronizarCerdos(cerdosNoSincronizados);
          const data = await getCerdos();
          setCerdos(data);
          success = true;
          toast.success("Sincronización completada con éxito");
        } else {
          // No hay datos para sincronizar, consideramos que se realizó correctamente
          success = true;
        }
      } catch (error) {
        attempts++;
        toast.error(`Error al sincronizar, reintentando... (Intento ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          // Espera un tiempo (por ejemplo, 1s * número de intento) antes de reintentar
          await delay(1000 * attempts);
        }
      } finally {
        setSincronizando(false);
      }
    }
    if (!success) {
      toast.error("No se pudo sincronizar después de varios intentos.");
    }
  };

  return { sync, sincronizando, setSincronizando };
};
