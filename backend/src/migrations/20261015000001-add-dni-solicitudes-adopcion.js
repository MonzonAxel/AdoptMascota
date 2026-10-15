module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('solicitudes_adopcion', 'dni', {
      type: Sequelize.STRING(8),
      allowNull: true,
    });
    await queryInterface.addIndex('solicitudes_adopcion', ['dni', 'estado'], {
      name: 'solicitudes_adopcion_dni_estado_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('solicitudes_adopcion', 'solicitudes_adopcion_dni_estado_idx');
    await queryInterface.removeColumn('solicitudes_adopcion', 'dni');
  },
};