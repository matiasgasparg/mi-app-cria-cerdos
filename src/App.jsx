import React, { useState } from 'react'; // <-- Agrega { useState }
import { useCerdos } from './hooks/useCerdos';

// En tu archivo App.js
function App() {
  const {
    nombre,
    setNombre,
    cerdos,
    online,
    sincronizando,
    handleAddCerdo,
    handleDeleteCerdo,
    handleUpdateCerdo,
  } = useCerdos();

  const [editando, setEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const iniciarEdicion = (id, nombreActual) => {
    setEditando(id);
    setNuevoNombre(nombreActual);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoNombre('');
  };

  const guardarEdicion = async (id) => {
    await handleUpdateCerdo(id, { nombre: nuevoNombre });
    cancelarEdicion();
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
            {editando === cerdo.id ? (
              <>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                />
                <button onClick={() => guardarEdicion(cerdo.id)}>Guardar</button>
                <button onClick={cancelarEdicion}>Cancelar</button>
              </>
            ) : (
              <>
                {cerdo.nombre} - {new Date(cerdo.fecha).toLocaleString()}
                <button onClick={() => iniciarEdicion(cerdo.id, cerdo.nombre)}>Editar</button>
                <button onClick={() => handleDeleteCerdo(cerdo.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;