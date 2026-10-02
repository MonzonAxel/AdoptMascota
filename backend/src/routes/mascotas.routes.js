const { Router } = require('express');
const mascotasController = require('../controllers/mascotas.controller');
const { verificarToken, verificarTokenOpcional, autorizarRoles } = require('../middlewares/auth');
const { fotos } = require('../middlewares/upload');

const router = Router();

// ---- Públicas (las ve cualquiera; si hay un token válido, el personal ve más) ----
// /filtros va ANTES de /:id, si no Express creería que "filtros" es un id.
router.get('/filtros', mascotasController.filtros);
router.get('/', verificarTokenOpcional, mascotasController.listar);
router.get('/:id', verificarTokenOpcional, mascotasController.obtener);

// ---- Solo personal del refugio (admin y administrativo) ----
// Primero se verifica quién es y recién después se reciben las fotos:
// así alguien sin permiso nunca llega a escribir archivos en el servidor.
const personal = [verificarToken, autorizarRoles('admin', 'administrativo')];

router.post('/', ...personal, fotos, mascotasController.crear);
router.put('/:id', ...personal, mascotasController.actualizar);
router.delete('/:id', ...personal, mascotasController.eliminar);

router.post('/:id/fotos', ...personal, fotos, mascotasController.agregarFotos);
router.delete('/:id/fotos/:fotoId', ...personal, mascotasController.quitarFoto);
router.patch('/:id/fotos/:fotoId/principal', ...personal, mascotasController.fotoPrincipal);

module.exports = router;
