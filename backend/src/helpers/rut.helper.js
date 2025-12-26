//! Función para formatear rut al estándar de la BD
export function formatRut(rut) {
  let cleanRut = rut.replace(/[.-]/g, '').toUpperCase();

  if (cleanRut.length < 2) return cleanRut;

  let body = cleanRut.slice(0, -1);
  let dv = cleanRut.slice(-1);

  return `${body}-${dv}`;
}
