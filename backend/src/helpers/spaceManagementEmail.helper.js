//! Este lo uso para generar un código random de retiro de la bicicleta (saldrá en el correo)
export function generateRetrievalCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}