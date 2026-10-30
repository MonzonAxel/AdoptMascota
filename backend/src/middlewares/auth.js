const { Usuario } = require('../models');
const { SesionAuth } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verificarJwt } = require('../utils/jwt');
const { AUTH_COOKIE_NAME, clearAuthCookie } = require('../utils/authCookie');

const tokenDelPedido = (req) => {
  const cookie = req.cookies && req.cookies[AUTH_COOKIE_NAME];
  if (cookie) return cookie;

  const [tipo, ...partes] = (req.headers.authorization || '').split(' ');
  return tipo === 'Bearer' ? partes.join(' ') : null;
};

const usuarioDesdeToken = async (req) => {
  const token = tokenDelPedido(req);
  if (!token) throw new AppError('Tenés que iniciar sesión', 401);

  const payload = verificarJwt(token);
  if (!payload.sid) throw new AppError('La sesión no es válida', 401);

  const sesion = await SesionAuth.findOne({
    where: {
      id: payload.sid,
      usuario_id: payload.id,
      expira_en: { [Op.gt]: new Date() },
    },
    include: [{ association: 'usuario', include: [{ association: 'perfil' }] }],
  });
  if (!sesion || !sesion.usuario) {
    throw new AppError('La sesión venció o fue cerrada; iniciá sesión de nuevo', 401);
  }

  return { usuario: sesion.usuario, sessionId: sesion.id };
};

const verificarToken = asyncHandler(async (req, res, next) => {
  try {
    const sesion = await usuarioDesdeToken(req);
    req.usuario = sesion.usuario;
    req.authSessionId = sesion.sessionId;
    return next();
  } catch (err) {
    if (err.status === 401 && req.cookies && req.cookies[AUTH_COOKIE_NAME]) clearAuthCookie(res);
    return next(err);
  }
});

const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) return next(new AppError('Tenés que iniciar sesión', 401));
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return next(new AppError('No tenés permiso para realizar esta acción', 403));
  }
  return next();
};

const verificarTokenOpcional = async (req, res, next) => {
  if (tokenDelPedido(req)) {
    try {
      const sesion = await usuarioDesdeToken(req);
      req.usuario = sesion.usuario;
      req.authSessionId = sesion.sessionId;
    } catch (err) {
      if (err.status === 401 && req.cookies && req.cookies[AUTH_COOKIE_NAME]) clearAuthCookie(res);
      if (!(err instanceof AppError)) return next(err); // error real (ej. base caída): no lo escondemos
    }
  }
  return next();
};

module.exports = { verificarToken, verificarTokenOpcional, autorizarRoles };
