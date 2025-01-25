import axios from 'axios';
import { getCerdosNoSincronizados, marcarSincronizado } from '../db/index';

const API_URL = 'http://127.0.0.1:5000';

export const sincronizarCerdos = async () => {
  try {
    // Obtener los cerdos locales que no están sincronizados
    const cerdosNoSincronizados = await getCerdosNoSincronizados();
    console.log('Intentando sincronizar los siguientes cerdos:', cerdosNoSincronizados);

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
