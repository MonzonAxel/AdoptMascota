module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('observaciones_solicitud', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      solicitud_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'solicitudes_adopcion', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      usuario_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      observacion: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(qi) { await qi.dropTable('observaciones_solicitud'); },
};
