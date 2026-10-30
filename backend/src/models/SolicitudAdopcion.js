const E = require('../constants/enums');
module.exports = (sequelize, DataTypes) => {
  const req = (type) => ({ type, allowNull: false });
  const SolicitudAdopcion = sequelize.define('SolicitudAdopcion', {
    animal_id: req(DataTypes.INTEGER),
    nombre_apellido: req(DataTypes.STRING(100)),
    email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
    dni: { type: DataTypes.STRING(8), allowNull: true },
    edad: req(DataTypes.INTEGER),
    telefono_celular: req(DataTypes.STRING(30)),
    telefono_fijo: DataTypes.STRING(30),
    ocupacion: req(DataTypes.STRING(150)),
    localidad_barrio: req(DataTypes.STRING(150)),
    direccion: req(DataTypes.STRING(150)),
    vivienda: req(DataTypes.ENUM(...E.TIPO_VIVIENDA)),
    tipo_tenencia: req(DataTypes.ENUM(...E.TIPO_TENENCIA)),
    permite_animales: DataTypes.BOOLEAN,
    detalle_vivienda: req(DataTypes.TEXT),
    personas_hogar: req(DataTypes.TEXT),
    hay_ninos_hogar: req(DataTypes.TEXT),
    otros_animales_hogar: req(DataTypes.TEXT),
    frecuencia_paseo: req(DataTypes.STRING(255)),
    cuidador_vacaciones: req(DataTypes.TEXT),
    estado: { type: DataTypes.ENUM(...E.ESTADO_SOLICITUD), defaultValue: 'pendiente' },
    fecha_resolucion: DataTypes.DATE,
    revisado_por: DataTypes.INTEGER,
    actualizado_por: DataTypes.INTEGER,
  }, { tableName: 'solicitudes_adopcion' });

  SolicitudAdopcion.associate = (db) => {
    SolicitudAdopcion.belongsTo(db.Animal, { foreignKey: 'animal_id', as: 'animal' });
    SolicitudAdopcion.belongsTo(db.Usuario, { foreignKey: 'revisado_por', as: 'revisor' });
    SolicitudAdopcion.belongsTo(db.Usuario, { foreignKey: 'actualizado_por', as: 'actualizador' });
    SolicitudAdopcion.hasMany(db.ObservacionSolicitud, { foreignKey: 'solicitud_id', as: 'observaciones' });
  };
  return SolicitudAdopcion;
};
