const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { validarLogin } = require('../utils/validate');
const { AUTH_COOKIE_NAME, getCookieOptions, clearAuthCookie } = require('../utils/authCookie');

const login = asyncHandler(async (req, res) => {
  const { email, password } = validarLogin(req.body);
  const data = await authService.login(email, password);
  res.cookie(AUTH_COOKIE_NAME, data.token, {
    ...getCookieOptions(),
    expires: new Date(data.expira_en),
  });
  return success(res, { expira_en: data.expira_en, usuario: data.usuario }, 'Sesión iniciada');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.authSessionId);
  clearAuthCookie(res);
  return success(res, null, 'Sesión cerrada');
});

module.exports = { login, logout };
