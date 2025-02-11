// CerdoItem.jsx
import { useRef } from 'react';
import PropTypes from 'prop-types';

const CerdoItem = ({
  cerdo,
  editando,
  nuevoNombre,
  setNuevoNombre,
  iniciarEdicion,
  guardarEdicion,
  cancelarEdicion,
  handleDeleteCerdo,
}) => {
  const editInputRef = useRef(null);

  return (
    <li className="cerdo-item">
      {editando === cerdo.id ? (
        <>
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            ref={editInputRef}
          />
          <button onClick={() => guardarEdicion(cerdo.id)}>✔</button>
          <button onClick={cancelarEdicion}>❌</button>
        </>
      ) : (
        <>
          <span className="cerdo-nombre">{cerdo.nombre}</span>
          <span className="cerdo-peso">Peso: {cerdo.peso} kg</span>
          <span className="cerdo-raza">Raza: {cerdo.raza}</span>
          <span className="cerdo-estado-salud">Salud: {cerdo.estado_salud}</span>
          <span className="cerdo-corral">Corral ID: {cerdo.corral_id}</span>
          <span className="cerdo-fecha">{new Date(cerdo.fecha).toLocaleString()}</span>
          <button onClick={() => iniciarEdicion(cerdo.id, cerdo.nombre)}>✏</button>
          <button onClick={() => handleDeleteCerdo(cerdo.id)}>🗑</button>
        </>
      )}
    </li>
  );
};

CerdoItem.propTypes = {
  cerdo: PropTypes.shape({
    id: PropTypes.any.isRequired,
    nombre: PropTypes.string.isRequired,
    peso: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    raza: PropTypes.string.isRequired,
    estado_salud: PropTypes.string.isRequired,
    corral_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  }).isRequired,
  editando: PropTypes.any,
  nuevoNombre: PropTypes.string.isRequired,
  setNuevoNombre: PropTypes.func.isRequired,
  iniciarEdicion: PropTypes.func.isRequired,
  guardarEdicion: PropTypes.func.isRequired,
  cancelarEdicion: PropTypes.func.isRequired,
  handleDeleteCerdo: PropTypes.func.isRequired,
};

export default CerdoItem;
