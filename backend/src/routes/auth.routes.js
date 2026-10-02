const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth');
const { limitarLogin } = require('../middlewares/limites');

const router = Router();

router.post('/login', limitarLogin, authController.login);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
