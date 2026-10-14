// Express 4 no atrapa solos los errores de funciones async.
// Este envoltorio los manda al errorHandler en vez de dejar el pedido colgado.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
