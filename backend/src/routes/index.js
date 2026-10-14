const { Router } = require('express');
const { success } = require('../utils/response');

const router = Router();

router.get('/health', (req, res) => success(res, { uptime: process.uptime() }, 'API funcionando'));

router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/mascotas', require('./mascotas.routes'));
router.use('/solicitudes', require('./solicitudes.routes'));

module.exports = router;
