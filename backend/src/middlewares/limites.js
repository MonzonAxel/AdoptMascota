const rateLimit = require('express-rate-limit');
const { fail } = require('../utils/response');

const enProduccion = process.env.NODE_ENV === 'production';

// Límite de pedidos por IP. Al pasarse responde 429 con el mismo formato JSON de siempre.
const crearLimitador = ({ minutos, max, mensaje, soloFallidos = false }) =>
  rateLimit({
    windowMs: minutos * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7', // avisa en los headers cuántos pedidos quedan
    legacyHeaders: false,
    skipSuccessfulRequests: soloFallidos, // true = solo cuentan los pedidos que fallan
    handler: (req, res) => fail(res, mensaje, 429),
  });

// Mientras se desarrolla los límites son holgados (para poder probar sin trabarse);
// en producción son estrictos. Se pueden cambiar desde el .env.
const limitarLogin = crearLimitador({
  minutos: 15,
  max: Number(process.env.LOGIN_MAX_INTENTOS) || (enProduccion ? 10 : 100),
  soloFallidos: true, // un login correcto no suma: solo frena a quien prueba contraseñas
  mensaje: 'Demasiados intentos fallidos de inicio de sesión. Probá de nuevo en unos minutos.',
});

const limitarSolicitudes = crearLimitador({
  minutos: 60,
  max: Number(process.env.SOLICITUDES_MAX_POR_HORA) || (enProduccion ? 5 : 100),
  mensaje: 'Enviaste muchas solicitudes seguidas. Probá de nuevo más tarde.',
});

module.exports = { limitarLogin, limitarSolicitudes };
