const { fail } = require('../utils/response');
const { maxMb, MAX_FOTOS_POR_VEZ } = require('./upload');

const notFound = (req, res) => fail(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 'Datos inválidos', 422, err.errors.map((e) => ({ campo: e.path, mensaje: e.message })));
  }
  if (err.type === 'entity.parse.failed') return fail(res, 'El cuerpo del pedido no es un JSON válido', 400);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, `Cada foto puede pesar hasta ${maxMb} MB`, 413);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return fail(res, `Podés subir hasta ${MAX_FOTOS_POR_VEZ} fotos por vez, enviadas en el campo "fotos"`, 400);
    }
    return fail(res, err.message, 400);
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  const message = err.isOperational || status < 500 ? err.message : 'Error interno del servidor';
  return fail(res, message, status, err.errors || null);
};

module.exports = { notFound, errorHandler };
