const E = require('../constants/enums');
const fkUsuario = (Sequelize) => ({
  type: Sequelize.INTEGER, allowNull: true,
  references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
});
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('animales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      especie: { type: Sequelize.ENUM(...E.ESPECIE_ANIMAL), allowNull: false },
      raza: { type: Sequelize.STRING(100) },
      sexo: { type: Sequelize.ENUM(...E.SEXO_ANIMAL), allowNull: false },
      tamano: { type: Sequelize.ENUM(...E.TAMANO_ANIMAL), allowNull: false },
      edad: { type: Sequelize.INTEGER },
      color: { type: Sequelize.ENUM(...E.TIPO_COLOR), allowNull: false },
      comportamiento: { type: Sequelize.TEXT },
      vacunado: { type: Sequelize.BOOLEAN, defaultValue: false },
      esterilizado: { type: Sequelize.BOOLEAN, defaultValue: false },
      estado: { type: Sequelize.ENUM(...E.ESTADO_ANIMAL), defaultValue: 'disponible' },
      fecha_ingreso: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      creado_por: fkUsuario(Sequelize),
      actualizado_por: fkUsuario(Sequelize),
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE },
    });
    await qi.addIndex('animales', ['especie', 'estado']);
  },
  async down(qi) { await qi.dropTable('animales'); },
};
