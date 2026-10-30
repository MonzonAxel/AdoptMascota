const bcrypt = require('bcrypt');

const ROUNDS = 10; // "costo" del encriptado: más vueltas = más seguro pero más lento

// Hash de relleno: sirve para que el login tarde lo mismo aunque el email no exista.
const HASH_FALSO = bcrypt.hashSync('contrasena-que-no-existe', ROUNDS);

const hash = (plano) => bcrypt.hash(plano, ROUNDS);
const compare = (plano, hasheada) => bcrypt.compare(plano, hasheada);
const compararConFalso = (plano) => bcrypt.compare(plano, HASH_FALSO);

module.exports = { hash, compare, compararConFalso };
