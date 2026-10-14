const E = require('../constants/enums');
module.exports = (sequelize, DataTypes) => {
  const HistorialCambio = sequelize.define('HistorialCambio', {
    nombre_tabla: { type: DataTypes.STRING(50), allowNull: false },
    registro_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    accion: { type: DataTypes.ENUM(...E.TIPO_ACCION), allowNull: false },
    campo: DataTypes.STRING(100),
    valor_antiguo: DataTypes.TEXT,
    valor_actual: DataTypes.TEXT,
  }, { tableName: 'historial_cambio', updatedAt: false }); // solo createdAt

  HistorialCambio.associate = (db) => {
    HistorialCambio.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };
  return HistorialCambio;
};
