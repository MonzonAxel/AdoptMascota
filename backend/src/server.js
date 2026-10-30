const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Con un secreto conocido cualquiera podría fabricar tokens falsos: no arrancamos.
    const secreto = process.env.JWT_SECRET;
    if (!secreto || secreto === 'cambiar_por_un_secreto_largo') {
      throw new Error(
        'Falta un JWT_SECRET propio en el archivo .env (reemplazá "cambiar_por_un_secreto_largo" por un texto largo y aleatorio)'
      );
    }

    await db.sequelize.authenticate();
    console.log('✔ Conectado a MySQL');
    app.listen(PORT, () => console.log(`✔ API en http://localhost:${PORT}/api  (docs: /api/docs)`));
  } catch (err) {
    console.error('✘ No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
})();
