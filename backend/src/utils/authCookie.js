const AUTH_COOKIE_NAME = 'adoptmascota_token';

const getCookieOptions = () => {
  const sameSite = (process.env.AUTH_COOKIE_SAME_SITE || 'lax').toLowerCase();

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
      || process.env.AUTH_COOKIE_SECURE === 'true'
      || sameSite === 'none',
    sameSite,
    path: '/api',
  };
};

const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());

module.exports = { AUTH_COOKIE_NAME, getCookieOptions, clearAuthCookie };