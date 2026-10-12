const E = require('../constants/enums');
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('historial_cambio', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre_tabla: { type: Sequelize.STRING(50), allowNull: false },
      registro_id: { type: Sequelize.INTEGER, allowNull: false },
      usuario_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      accion: { type: Sequelize.ENUM(...E.TIPO_ACCION), allowNull: false },
      campo: { type: Sequelize.STRING(100) },
      valor_antiguo: { type: Sequelize.TEXT },
      valor_actual: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await qi.addIndex('historial_cambio', ['nombre_tabla', 'registro_id']);
  },
  async down(qi) { await qi.dropTable('historial_cambio'); },
};
