const solicitudesService = require('../services/solicitudes.service');
const asyncHandler = require('../utils/asyncHandler');
const { leerId } = require('../utils/params');
const { success } = require('../utils/response');
const {
  validarSolicitud, validarCambioEstado, validarObservacion, validarFiltrosSolicitudes,
} = require('../utils/validate');

const contexto = (req) => ({ baseUrl: process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}` });

// ---- Público ----
const crear = asyncHandler(async (req, res) => {
  const datos = validarSolicitud(req.body);
  const resultado = await solicitudesService.crear(datos);
  return success(res, resultado, 'Solicitud enviada. El refugio se va a comunicar con vos.', 201);
});

// ---- Personal ----
const listar = asyncHandler(async (req, res) =>
  success(res, await solicitudesService.listar(validarFiltrosSolicitudes(req.query), contexto(req))));

const obtener = asyncHandler(async (req, res) =>
  success(res, await solicitudesService.obtener(leerId(req.params.id), contexto(req))));

const cambiarEstado = asyncHandler(async (req, res) => {
  const id = leerId(req.params.id);
  const datos = validarCambioEstado(req.body);
  return success(res, await solicitudesService.cambiarEstado(id, datos, req.usuario, contexto(req)), 'Estado actualizado');
});

const agregarObservacion = asyncHandler(async (req, res) => {
  const id = leerId(req.params.id);
  const datos = validarObservacion(req.body);
  return success(res, await solicitudesService.agregarObservacion(id, datos, req.usuario), 'Observación agregada', 201);
});

module.exports = { crear, listar, obtener, cambiarEstado, agregarObservacion };
