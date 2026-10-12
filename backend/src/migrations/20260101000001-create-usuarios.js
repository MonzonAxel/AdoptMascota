const E = require('../constants/enums');
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('usuarios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      rol: { type: Sequelize.ENUM(...E.ROL_USUARIO), allowNull: false, defaultValue: 'administrativo' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      deletedAt: { type: Sequelize.DATE },
    });
  },
  async down(qi) { await qi.dropTable('usuarios'); },
};
