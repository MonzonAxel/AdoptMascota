module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('sesiones_auth', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      expira_en: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await qi.addIndex('sesiones_auth', ['usuario_id']);
    await qi.addIndex('sesiones_auth', ['expira_en']);
  },
  async down(qi) {
    await qi.dropTable('sesiones_auth');
  },
};