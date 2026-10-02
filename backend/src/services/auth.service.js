const { Usuario } = require('../models');
const AppError = require('../utils/AppError');
const { firmarToken } = require('../utils/jwt');
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

  return {
    token: firmarToken(usuario),
    tipo: 'Bearer',
    expira_en: process.env.JWT_EXPIRES_IN || '8h',
    usuario: formatearUsuario(usuario),
  };
};

module.exports = { login };
