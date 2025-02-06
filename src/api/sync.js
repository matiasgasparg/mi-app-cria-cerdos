import axios from 'axios';
import { getCerdosNoSincronizados, marcarSincronizado } from '../db/index';

const API_URL = 'http://127.0.0.1:5000';

export const sincronizarCerdos = async () => {
  try {
    const cerdosNoSincronizados = await getCerdosNoSincronizados();
    console.log('Cerdos no sincronizados:', cerdosNoSincronizados);

    if (cerdosNoSincronizados.length === 0) {
      console.log('No hay cerdos para sincronizar.');
      return;
    }

    for (const cerdo of cerdosNoSincronizados) {
      try {
        // Validar cerdo antes de enviarlo
        if (!cerdo.nombre || !cerdo.fecha) {
          console.warn('Cerdo inválido, se omitirá:', cerdo);
          continue;
        }

        // Enviar cerdo al servidor
        console.log(`Sincronizando cerdo con ID ${cerdo.id}...`);
        const response = await axios.post(`${API_URL}/cerdos`, cerdo);

        if (response.status === 201) {
          console.log(`Cerdo con ID ${cerdo.id} sincronizado con éxito.`);
          // Marcar como sincronizado en IndexedDB
          await marcarSincronizado(cerdo.id);
        } else {
          console.warn(`Sincronización fallida para cerdo con ID ${cerdo.id}:`, response.statusText);
        }
      } catch (innerError) {
        console.error(`Error al sincronizar cerdo con ID ${cerdo.id}:`, innerError);
      }
    }

    console.log('Sincronización completa.');
  } catch (error) {
    console.error('Error durante la sincronización:', error);
  }
};
// En tu archivo sync.js
export const actualizarCerdoEnBackend = async (id, nuevosDatos) => {
  try {
    console.log(`Actualizando cerdo con ID ${id} en el backend...`);
    const response = await axios.put(`${API_URL}/cerdos/${id}`, nuevosDatos);

    if (response.status === 200) {
      console.log(`Cerdo con ID ${id} actualizado en el backend con éxito.`);
    } else {
      console.warn(`Actualización fallida para cerdo con ID ${id}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error al actualizar cerdo con ID ${id} en el backend:`, error);
    throw error;
  }
};
export const eliminarCerdoEnBackend = async (id) => {
  try {
    console.log(`Eliminando cerdo con ID ${id} del backend...`);
    const response = await axios.delete(`${API_URL}/cerdos/${id}`);

    if (response.status === 200) {
      console.log(`Cerdo con ID ${id} eliminado del backend con éxito.`);
    } else {
      console.warn(`Eliminación fallida para cerdo con ID ${id}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error al eliminar cerdo con ID ${id} del backend:`, error);
    throw error;
  }
};
