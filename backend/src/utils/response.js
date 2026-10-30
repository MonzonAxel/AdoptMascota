// Contrato JSON estándar: { success, message, data } / { success:false, message, errors }
const success = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message = 'Error', status = 400, errors = null) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { success, fail };
