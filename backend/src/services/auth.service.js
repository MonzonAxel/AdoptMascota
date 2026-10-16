const { randomUUID } = require('crypto');
const { Op } = require('sequelize');
const { Usuario } = require('../models');
const { SesionAuth } = require('../models');
const AppError = require('../utils/AppError');
const { firmarToken, obtenerExpiracion } = require('../utils/jwt');
const { formatearUsuario } = require('../utils/serializers');
const passwordService = require('./password.service');

const login = async (email, password) => {
  // withPassword: el único lugar donde pedimos password_hash
  const usuario = await Usuario.scope('withPassword').findOne({
    where: { email },
    include: [{ association: 'perfil' }],
  });

  let valido = false;
  if (usuario) {
    valido = await passwordService.compare(password, usuario.password_hash);
  } else {
    await passwordService.compararConFalso(password); // mismo tiempo de respuesta
  }

  // Mismo mensaje para "email inexistente" y "contraseña mala":
  // así nadie puede averiguar qué emails están registrados.
  if (!valido) throw new AppError('Email o contraseña incorrectos', 401);

  await SesionAuth.destroy({ where: { expira_en: { [Op.lte]: new Date() } } });

  const sessionId = randomUUID();
  const token = firmarToken(usuario, sessionId);
  const expiraEn = obtenerExpiracion(token);
  await SesionAuth.create({ id: sessionId, usuario_id: usuario.id, expira_en: expiraEn });

  return {
    token,
    expira_en: expiraEn.toISOString(),
    usuario: formatearUsuario(usuario),
  };
};

const logout = async (sessionId) => {
  if (sessionId) await SesionAuth.destroy({ where: { id: sessionId } });
};

module.exports = { login, logout };
