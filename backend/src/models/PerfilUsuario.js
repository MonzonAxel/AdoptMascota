module.exports = (sequelize, DataTypes) => {
  const PerfilUsuario = sequelize.define('PerfilUsuario', {
    usuario_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'perfil_usuario' });

  PerfilUsuario.associate = (db) => {
    PerfilUsuario.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };
  return PerfilUsuario;
};
