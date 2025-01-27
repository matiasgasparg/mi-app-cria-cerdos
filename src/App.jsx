import React from 'react';
import { useCerdos } from './hooks/useCerdos';

function App() {
  const {
    nombre,
    setNombre,
    cerdos,
    online,
    sincronizando,
    handleAddCerdo,
    handleDeleteCerdo,
  } = useCerdos();

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