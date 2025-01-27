import { openDB } from 'idb';

export const isOnline = () => navigator.onLine; // Retorna true si hay conexión, false si no
const dbPromise = openDB('cerdosDB', 4, {
  async upgrade(db, oldVersion) {
    console.log(`Actualizando base de datos de la versión ${oldVersion} a la versión 4...`);
    if (oldVersion < 1) {
      console.log('Creando objectStore "cerdos"...');
      const store = db.createObjectStore('cerdos', { keyPath: 'id', autoIncrement: true });
      store.createIndex('sincronizado', 'sincronizado', { unique: false });
    }
    if (oldVersion < 4) {
      console.log('Migrando datos a la versión 4...');
      const tx = db.transaction('cerdos', 'readwrite');
      const store = tx.objectStore('cerdos');
      const cerdos = await store.getAll();

      for (const cerdo of cerdos) {
        if (typeof cerdo.sincronizado === 'boolean') {
          console.log(`Corrigiendo cerdo con ID ${cerdo.id}...`);
          cerdo.sincronizado = cerdo.sincronizado ? 1 : 0; // Convertir a número
          await store.put(cerdo);
        }
      }

      await tx.done; // Esperar a que la transacción se complete
    }
  },
});
// Agregar un cerdo localmente
export const addCerdo = async (cerdo) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.objectStore('cerdos');

  // Usar 0 para no sincronizado y 1 para sincronizado
  const cerdoConSincronizado = { ...cerdo, sincronizado: 0 };
  console.log('Agregando cerdo a IndexedDB:', cerdoConSincronizado);

  await store.add(cerdoConSincronizado);
  await tx.done;
};
// Obtener todos los cerdos
export const getCerdos = async () => {
  const db = await dbPromise;
  const cerdos = await db.getAll('cerdos');
  return cerdos.filter((cerdo) => !cerdo.eliminado); // Excluir cerdos marcados como eliminados
};

export const getCerdosNoSincronizados = async () => {
  console.log('Iniciando getCerdosNoSincronizados...');
  const db = await dbPromise;
  console.log('Base de datos obtenida:', db);

  const tx = db.transaction('cerdos', 'readonly');
  console.log('Transacción creada:', tx);

  const store = tx.objectStore('cerdos');
  console.log('ObjectStore obtenido:', store);

  try {
    const index = store.index('sincronizado');
    console.log('Índice obtenido:', index);

    const results = await index.getAll(IDBKeyRange.only(0)); // Buscar cerdos no sincronizados (0)
    console.log('Resultados obtenidos:', results);

    return results;
  } catch (error) {
    console.error('Error al obtener cerdos no sincronizados:', error);
    throw error;
  } finally {
    if (!tx.finished) {
      console.log('Completando transacción...');
      await tx.done;
    }
  }
};
// Marcar un cerdo como sincronizado
export const marcarSincronizado = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.objectStore('cerdos');
  const cerdo = await store.get(id);

  if (cerdo) {
    cerdo.sincronizado = 1; // Marcar como sincronizado
    await store.put(cerdo);
    console.log(`Cerdo con ID ${id} marcado como sincronizado.`);
  } else {
    console.warn(`Cerdo con ID ${id} no encontrado.`);
  }

  await tx.done;
};

// Eliminar un cerdo
export const deleteCerdo = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.objectStore('cerdos');
  const cerdo = await store.get(id);

  if (cerdo) {
    // Marcar el cerdo como "pendiente de eliminación"
    cerdo.eliminado = true;
    await store.put(cerdo);
    console.log(`Cerdo con ID ${id} marcado como pendiente de eliminación.`);
  } else {
    console.warn(`Cerdo con ID ${id} no encontrado.`);
  }

  await tx.done;
};