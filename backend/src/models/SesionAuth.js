module.exports = (sequelize, DataTypes) => {
  const SesionAuth = sequelize.define('SesionAuth', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    expira_en: { type: DataTypes.DATE, allowNull: false },
  }, {
    tableName: 'sesiones_auth',
    updatedAt: false,
  });

  SesionAuth.associate = (db) => {
    SesionAuth.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };

  return SesionAuth;
};