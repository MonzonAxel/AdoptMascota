const { Router } = require('express');
const solicitudesController = require('../controllers/solicitudes.controller');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');
const { limitarSolicitudes } = require('../middlewares/limites');

const router = Router();

// ---- Público: el formulario de adopción (con límite de envíos por IP contra el spam) ----
router.post('/', limitarSolicitudes, solicitudesController.crear);

// ---- Todo lo de abajo es solo para el personal (admin y administrativo) ----
// Las solicitudes tienen datos personales (teléfono, dirección): nunca son públicas.
router.use(verificarToken, autorizarRoles('admin', 'administrativo'));

router.get('/', solicitudesController.listar);
router.get('/:id', solicitudesController.obtener);
router.put('/:id/estado', solicitudesController.cambiarEstado);
router.post('/:id/observaciones', solicitudesController.agregarObservacion);

module.exports = router;
