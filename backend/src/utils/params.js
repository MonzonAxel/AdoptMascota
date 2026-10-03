const AppError = require('./AppError');

// Convierte un id de la dirección (texto) en número y verifica que sea válido.
const leerId = (valor, nombre = 'id') => {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw new AppError(`El ${nombre} no es válido`, 400);
  return n;
};

module.exports = { leerId };
