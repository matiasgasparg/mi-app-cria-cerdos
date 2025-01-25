import { openDB } from 'idb';

export const isOnline = () => navigator.onLine; // Retorna true si hay conexión, false si no

const dbPromise = openDB('cerdosDB', 3, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const store = db.createObjectStore('cerdos', { keyPath: 'id', autoIncrement: true });
      store.createIndex('sincronizado', 'sincronizado', { unique: false }); // Índice para sincronizado
    }
  },
});

// Agregar un cerdo localmente
export const addCerdo = async (cerdo) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.store;

  // Asegurarse de que sincronizado es booleano
  const cerdoConSincronizado = { ...cerdo, sincronizado: false };
  console.log('Agregando cerdo a IndexedDB:', cerdoConSincronizado);

  // Asegurándonos de que todo esté dentro de la misma transacción
  await store.add(cerdoConSincronizado); // Añadir cerdo a la base de datos
  await tx.done; // Espera a que la transacción esté completamente lista
};

// Obtener todos los cerdos
export const getCerdos = async () => {
  const db = await dbPromise;
  return await db.getAll('cerdos');
};

// Validar y corregir el campo 'sincronizado' en todos los cerdos
const validarSincronizado = async () => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.store;
  const allCerdos = await store.getAll();

  allCerdos.forEach((cerdo) => {
    if (typeof cerdo.sincronizado !== 'boolean') {
      console.warn(`Corigiendo valor no booleano para 'sincronizado' en cerdo con ID ${cerdo.id}`);
      cerdo.sincronizado = cerdo.sincronizado === 'false' || cerdo.sincronizado === 'true' ? cerdo.sincronizado === 'true' : false;
      store.put(cerdo); // Corregir valor
    }
  });

  await tx.done;
};

// Obtener cerdos no sincronizados usando el índice
export const getCerdosNoSincronizados = async () => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readonly');
  const store = tx.store;

  // Validar sincronización en la base de datos antes de consultar
  await validarSincronizado();

  // Asegurarnos de que estamos trabajando dentro de una transacción activa
  const index = store.index('sincronizado');
  const results = await index.getAll(IDBKeyRange.only(false));

  console.log('Cerdos no sincronizados:', results);

  // Aquí ya no usamos tx.done ya que se hace al final del proceso
  return results;
};

// Marcar un cerdo como sincronizado
export const marcarSincronizado = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.store;
  const cerdo = await store.get(id);

  if (cerdo) {
    cerdo.sincronizado = true; // Asegurarse de que sea booleano
    await store.put(cerdo);
    console.log(`Cerdo con ID ${id} marcado como sincronizado.`);
  } else {
    console.warn(`Cerdo con ID ${id} no encontrado.`);
  }

  await tx.done; // Asegurarnos de que la transacción se complete después de todo
};

// Eliminar un cerdo
export const deleteCerdo = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction('cerdos', 'readwrite');
  const store = tx.store;

  await store.delete(id);
  console.log(`Cerdo con ID ${id} eliminado.`);

  await tx.done; // Espera a que la transacción esté completamente lista
};
