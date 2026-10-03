const E = require('../constants/enums');
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.ENUM(...E.ROL_USUARIO), allowNull: false, defaultValue: 'administrativo' },
  }, {
    tableName: 'usuarios',
    paranoid: true, // deletedAt -> baja lógica
    defaultScope: { attributes: { exclude: ['password_hash'] } },
    scopes: { withPassword: { attributes: { include: ['password_hash'] } } },
  });

  Usuario.associate = (db) => {
    Usuario.hasOne(db.PerfilUsuario, { foreignKey: 'usuario_id', as: 'perfil' });
    Usuario.hasMany(db.HistorialCambio, { foreignKey: 'usuario_id', as: 'cambios' });
  };
  return Usuario;
};
