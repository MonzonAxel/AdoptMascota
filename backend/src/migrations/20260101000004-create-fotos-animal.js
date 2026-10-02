module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('fotos_animal', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      animal_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'animales', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      url: { type: Sequelize.STRING(500), allowNull: false },
      es_principal: { type: Sequelize.BOOLEAN, defaultValue: false },
      orden: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  async down(qi) { await qi.dropTable('fotos_animal'); },
};
