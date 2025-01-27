export const transformarFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
  };