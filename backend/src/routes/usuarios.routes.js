const { Router } = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const { verificarToken, autorizarRoles } = require('../middlewares/auth');

const router = Router();

// Todo lo de abajo exige estar logueado...
router.use(verificarToken);
router.get('/me', usuariosController.me); // cualquier rol

// ...y todo lo de abajo exige además ser admin.
// (/me va ANTES de /:id, si no Express creería que "me" es un id)
router.use(autorizarRoles('admin'));
router.get('/', usuariosController.listar);
router.patch('/:id/reactivar', usuariosController.reactivar);
router.get('/:id', usuariosController.obtener);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar);

module.exports = router;
