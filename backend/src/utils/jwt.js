const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

// Crea el token (la "pulsera") con el id y el rol del usuario adentro.
const firmarToken = (usuario, sessionId) =>
  jwt.sign({ id: usuario.id, rol: usuario.rol, sid: sessionId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const obtenerExpiracion = (token) => {
  const payload = jwt.decode(token);
  if (!payload || typeof payload.exp !== 'number') throw new Error('El JWT no tiene expiración');
  return new Date(payload.exp * 1000);
};

// Comprueba que el token sea auténtico y no esté vencido.
const verificarJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const vencido = err.name === 'TokenExpiredError';
    throw new AppError(vencido ? 'La sesión venció, iniciá sesión de nuevo' : 'Token inválido', 401);
  }
};

module.exports = { firmarToken, verificarJwt, obtenerExpiracion };
