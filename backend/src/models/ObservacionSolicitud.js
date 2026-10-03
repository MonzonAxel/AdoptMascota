module.exports = (sequelize, DataTypes) => {
  const ObservacionSolicitud = sequelize.define('ObservacionSolicitud', {
    solicitud_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    observacion: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'observaciones_solicitud' });

  ObservacionSolicitud.associate = (db) => {
    ObservacionSolicitud.belongsTo(db.SolicitudAdopcion, { foreignKey: 'solicitud_id', as: 'solicitud' });
    ObservacionSolicitud.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'autor' });
  };
  return ObservacionSolicitud;
};
