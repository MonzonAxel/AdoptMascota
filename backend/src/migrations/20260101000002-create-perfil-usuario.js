module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('perfil_usuario', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      usuario_id: {
        type: Sequelize.INTEGER, allowNull: false, unique: true,
        references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      apellido: { type: Sequelize.STRING(100), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(qi) { await qi.dropTable('perfil_usuario'); },
};
