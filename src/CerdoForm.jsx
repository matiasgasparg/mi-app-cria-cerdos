// CerdoForm.jsx
import { useRef } from 'react';
import { useCerdoContext } from './context/CerdoContext';
import PropTypes from 'prop-types';

const CerdoForm = ({ inputRef }) => {
  const {
    nombre,
    setNombre,
    peso,
    setPeso,
    raza,
    setRaza,
    estadoSalud,
    setEstadoSalud,
    corralId,
    setCorralId,
    handleAddCerdo,
    sincronizando,
  } = useCerdoContext();

  // Refs para avanzar en el formulario
  const pesoRef = useRef(null);
  const razaRef = useRef(null);
  const estadoSaludRef = useRef(null);
  const corralIdRef = useRef(null);

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter' && nextFieldRef?.current) {
      e.preventDefault();
      nextFieldRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (Number(peso) <= 0) {
      alert('El peso debe ser un número positivo.');
      return;
    }
    handleAddCerdo();
  };

  return (
    <form className="input-group" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="nombre">Nombre del cerdo</label>
        <input
          id="nombre"
          type="text"
          placeholder="Ej: Chanchito"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          ref={inputRef}
          autoFocus
          onKeyDown={(e) => handleKeyDown(e, pesoRef)}
          aria-label="Nombre del cerdo"
        />
      </div>
      <div className="form-field">
        <label htmlFor="peso">Peso (kg)</label>
        <input
          id="peso"
          type="number"
          placeholder="Ej: 25"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          ref={pesoRef}
          min="1"
          inputMode="numeric"
          onKeyDown={(e) => handleKeyDown(e, razaRef)}
          aria-label="Peso del cerdo en kilogramos"
        />
      </div>
      <div className="form-field">
        <label htmlFor="raza">Raza</label>
        <input
          id="raza"
          type="text"
          placeholder="Ej: Large White"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
          ref={razaRef}
          onKeyDown={(e) => handleKeyDown(e, estadoSaludRef)}
          aria-label="Raza del cerdo"
        />
      </div>
      <div className="form-field">
        <label htmlFor="estadoSalud">Estado de salud</label>
        <select
          id="estadoSalud"
          value={estadoSalud}
          onChange={(e) => setEstadoSalud(e.target.value)}
          ref={estadoSaludRef}
          onKeyDown={(e) => handleKeyDown(e, corralIdRef)}
          aria-label="Estado de salud del cerdo"
        >
          <option value="">Seleccione...</option>
          <option value="sano">Sano</option>
          <option value="enfermo">Enfermo</option>
          <option value="en tratamiento">En tratamiento</option>
          <option value="recuperado">Recuperado</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="corralId">Corral ID</label>
        <input
          id="corralId"
          type="number"
          placeholder="Ej: 3"
          value={corralId}
          onChange={(e) => setCorralId(e.target.value)}
          ref={corralIdRef}
          min="1"
          inputMode="numeric"
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
          aria-label="Número del corral"
        />
      </div>
      <button type="submit" disabled={sincronizando} className="btn-add">
  {sincronizando ? (
    // Puedes usar un ícono o componente de spinner
    <span className="spinner">⏳</span>
  ) : (
    '➕ Agregar'
  )}
</button>
    </form>
  );
};

CerdoForm.propTypes = {
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
};

export default CerdoForm;
