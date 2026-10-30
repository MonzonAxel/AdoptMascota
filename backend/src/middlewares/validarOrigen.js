const AppError = require('../utils/AppError');

const METODOS_MUTABLES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const validarOrigen = (req, res, next) => {
  if (!METODOS_MUTABLES.has(req.method)) return next();

  const origen = req.get('origin');
  if (!origen) return next();

  const origenPermitido = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origenApi = `${req.protocol}://${req.get('host')}`;
  if (origen !== origenPermitido && origen !== origenApi) {
    return next(new AppError('Origen no permitido', 403));
  }

  return next();
};

module.exports = validarOrigen;