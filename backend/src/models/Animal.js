const E = require('../constants/enums');
module.exports = (sequelize, DataTypes) => {
  const Animal = sequelize.define('Animal', {
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    especie: { type: DataTypes.ENUM(...E.ESPECIE_ANIMAL), allowNull: false },
    raza: DataTypes.STRING(100),
    sexo: { type: DataTypes.ENUM(...E.SEXO_ANIMAL), allowNull: false },
    tamano: { type: DataTypes.ENUM(...E.TAMANO_ANIMAL), allowNull: false },
    edad: DataTypes.INTEGER,
    color: { type: DataTypes.ENUM(...E.TIPO_COLOR), allowNull: false },
    comportamiento: DataTypes.TEXT,
    vacunado: { type: DataTypes.BOOLEAN, defaultValue: false },
    esterilizado: { type: DataTypes.BOOLEAN, defaultValue: false },
    estado: { type: DataTypes.ENUM(...E.ESTADO_ANIMAL), defaultValue: 'disponible' },
    fecha_ingreso: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    creado_por: DataTypes.INTEGER,
    actualizado_por: DataTypes.INTEGER,
  }, { tableName: 'animales', paranoid: true });

  Animal.associate = (db) => {
    Animal.hasMany(db.FotoAnimal, { foreignKey: 'animal_id', as: 'fotos' });
    Animal.hasMany(db.SolicitudAdopcion, { foreignKey: 'animal_id', as: 'solicitudes' });
    Animal.belongsTo(db.Usuario, { foreignKey: 'creado_por', as: 'creador' });
    Animal.belongsTo(db.Usuario, { foreignKey: 'actualizado_por', as: 'actualizador' });
  };
  return Animal;
};
