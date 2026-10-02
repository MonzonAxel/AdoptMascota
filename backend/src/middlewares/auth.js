const { Usuario } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verificarJwt } = require('../utils/jwt');

// Lee el token del pedido y devuelve al usuario (buscándolo en la base en cada pedido:
// si fue dado de baja o le cambiaron el rol, el efecto es inmediato aunque el token siga vigente).
const usuarioDesdeToken = async (req) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new AppError('Tenés que iniciar sesión', 401);

  const payload = verificarJwt(token);
  const usuario = await Usuario.findByPk(payload.id, { include: [{ association: 'perfil' }] });
  if (!usuario) throw new AppError('El usuario ya no existe o fue dado de baja', 401);
  return usuario;
};

// 1) "¿Quién sos?" -> revisa el token y deja al usuario en req.usuario
const verificarToken = asyncHandler(async (req, res, next) => {
  req.usuario = await usuarioDesdeToken(req);
  next();
});

// 2) "¿Tenés permiso?" -> se usa DESPUÉS de verificarToken.  Ej: autorizarRoles('admin')
const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) return next(new AppError('Tenés que iniciar sesión', 401));
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return next(new AppError('No tenés permiso para realizar esta acción', 403));
  }
  return next();
};

// 3) Para rutas públicas que muestran más cosas al personal.
//    Sin token (o con un token vencido/inválido) se trata como visitante: la galería pública
//    tiene que funcionar aunque en el navegador haya quedado una sesión vieja.
const verificarTokenOpcional = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      req.usuario = await usuarioDesdeToken(req);
    } catch (err) {
      if (!(err instanceof AppError)) return next(err); // error real (ej. base caída): no lo escondemos
    }
  }
  return next();
};

module.exports = { verificarToken, verificarTokenOpcional, autorizarRoles };
