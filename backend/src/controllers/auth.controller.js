const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { validarLogin } = require('../utils/validate');

const login = asyncHandler(async (req, res) => {
  const { email, password } = validarLogin(req.body);
  const data = await authService.login(email, password);
  return success(res, data, 'Sesión iniciada');
});

// Con JWT el "cierre de sesión" real lo hace el frontend borrando el token.
// Este endpoint existe para tener un punto único donde, más adelante, se pueda
// registrar el cierre o invalidar el token.
const logout = (req, res) => success(res, null, 'Sesión cerrada');

module.exports = { login, logout };
