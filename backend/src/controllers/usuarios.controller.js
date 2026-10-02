const usuariosService = require('../services/usuarios.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { formatearUsuario } = require('../utils/serializers');
const { validarUsuario } = require('../utils/validate');

const leerId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError('El id no es válido', 400);
  return id;
};

const me = (req, res) => success(res, formatearUsuario(req.usuario));

const listar = asyncHandler(async (req, res) =>
  success(res, await usuariosService.listar()));

const obtener = asyncHandler(async (req, res) =>
  success(res, await usuariosService.obtenerFormateado(leerId(req))));

const crear = asyncHandler(async (req, res) => {
  const datos = validarUsuario(req.body, { alta: true });
  return success(res, await usuariosService.crear(datos, req.usuario), 'Usuario creado', 201);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = leerId(req);
  const datos = validarUsuario(req.body, { alta: false });
  if (Object.keys(datos).length === 0) throw new AppError('No enviaste ningún dato para actualizar', 400);
  return success(res, await usuariosService.actualizar(id, datos, req.usuario), 'Usuario actualizado');
});

const eliminar = asyncHandler(async (req, res) => {
  await usuariosService.eliminar(leerId(req), req.usuario);
  return success(res, null, 'Usuario dado de baja');
});

module.exports = { me, listar, obtener, crear, actualizar, eliminar };
