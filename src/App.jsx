// App.jsx
import { useState, useRef } from 'react';
import { CerdoProvider, useCerdoContext } from './context/CerdoContext';
import CerdoForm from './CerdoForm';
import CerdoItem from './CerdoItem';

const AppContent = () => {
  // Se extraen únicamente las variables y funciones que se usan
  const { cerdos, online, handleDeleteCerdo, handleUpdateCerdo } = useCerdoContext();

  // Estado local para edición
  const [editando, setEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const inputRef = useRef(null);

  const iniciarEdicion = (id, nombreActual) => {
    setEditando(id);
    setNuevoNombre(nombreActual);
    setTimeout(() => inputRef.current?.focus(), 100);
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
    <div className="container">
      <h1>Gestión de Cerdos</h1>
      <p className={`status ${online ? 'online' : 'offline'}`}>
        Estado: {online ? '🟢 En línea' : '🔴 Sin conexión'}
      </p>
      {/* El formulario obtiene sus datos desde el contexto */}
      <CerdoForm inputRef={inputRef} />
      <ul className="cerdo-list">
        {cerdos.map((cerdo) => (
          <CerdoItem
            key={cerdo.id}
            cerdo={cerdo}
            editando={editando}
            nuevoNombre={nuevoNombre}
            setNuevoNombre={setNuevoNombre}
            iniciarEdicion={iniciarEdicion}
            guardarEdicion={guardarEdicion}
            cancelarEdicion={cancelarEdicion}
            handleDeleteCerdo={handleDeleteCerdo}
          />
        ))}
      </ul>
    </div>
  );
};

function App() {
  return (
    <CerdoProvider>
      <AppContent />
    </CerdoProvider>
  );
}

export default App;
