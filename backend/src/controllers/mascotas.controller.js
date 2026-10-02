const mascotasService = require('../services/mascotas.service');
const fotosService = require('../services/fotos.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { borrarSubidos } = require('../utils/archivos');
const { leerId } = require('../utils/params');
const { success } = require('../utils/response');
const { validarMascota, validarFiltrosMascotas } = require('../utils/validate');

// Qué necesita saber el servicio sobre este pedido: cómo armar las URLs de las fotos
// y si quien pregunta es personal del refugio (token válido) o un visitante.
const contexto = (req) => ({
  baseUrl: process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
  esPersonal: Boolean(req.usuario),
});
const comoPersonal = (req) => ({ ...contexto(req), esPersonal: true });

// multer guarda las fotos ANTES de que corra el controller. Si después algo falla
// (datos inválidos, límite de fotos...), las borramos para no dejar archivos huérfanos.
const conLimpieza = (fn) => asyncHandler(async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    await borrarSubidos(req.files);
    throw err;
  }
});

// ---- Públicos ----
const listar = asyncHandler(async (req, res) =>
  success(res, await mascotasService.listar(validarFiltrosMascotas(req.query), contexto(req))));

const filtros = asyncHandler(async (req, res) =>
  success(res, await mascotasService.opcionesDeFiltros()));

const obtener = asyncHandler(async (req, res) =>
  success(res, await mascotasService.obtener(leerId(req.params.id), contexto(req))));

// ---- Personal (admin y administrativo) ----
const crear = conLimpieza(async (req, res) => {
  const datos = validarMascota(req.body, { alta: true });
  const mascota = await mascotasService.crear(datos, req.files || [], req.usuario, contexto(req));
  return success(res, mascota, 'Mascota creada', 201);
});

const actualizar = asyncHandler(async (req, res) => {
  const id = leerId(req.params.id);
  const datos = validarMascota(req.body, { alta: false });
  if (Object.keys(datos).length === 0) throw new AppError('No enviaste ningún dato para actualizar', 400);
  return success(res, await mascotasService.actualizar(id, datos, req.usuario, contexto(req)), 'Mascota actualizada');
});

const eliminar = asyncHandler(async (req, res) => {
  await mascotasService.eliminar(leerId(req.params.id), req.usuario);
  return success(res, null, 'Mascota dada de baja');
});

const agregarFotos = conLimpieza(async (req, res) => {
  const id = leerId(req.params.id);
  const archivos = req.files || [];
  if (archivos.length === 0) throw new AppError('Subí al menos una foto en el campo "fotos"', 400);
  await mascotasService.asegurarExiste(id);
  await fotosService.agregar(id, archivos);
  return success(res, await mascotasService.obtener(id, comoPersonal(req)), 'Fotos agregadas', 201);
});

const quitarFoto = asyncHandler(async (req, res) => {
  const id = leerId(req.params.id);
  await mascotasService.asegurarExiste(id);
  await fotosService.quitar(id, leerId(req.params.fotoId, 'id de la foto'));
  return success(res, await mascotasService.obtener(id, comoPersonal(req)), 'Foto eliminada');
});

const fotoPrincipal = asyncHandler(async (req, res) => {
  const id = leerId(req.params.id);
  await mascotasService.asegurarExiste(id);
  await fotosService.marcarPrincipal(id, leerId(req.params.fotoId, 'id de la foto'));
  return success(res, await mascotasService.obtener(id, comoPersonal(req)), 'Foto principal actualizada');
});

module.exports = { listar, filtros, obtener, crear, actualizar, eliminar, agregarFotos, quitarFoto, fotoPrincipal };
