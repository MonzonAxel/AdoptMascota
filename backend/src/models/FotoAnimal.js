module.exports = (sequelize, DataTypes) => {
  const FotoAnimal = sequelize.define('FotoAnimal', {
    animal_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    es_principal: { type: DataTypes.BOOLEAN, defaultValue: false },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'fotos_animal' });

  FotoAnimal.associate = (db) => {
    FotoAnimal.belongsTo(db.Animal, { foreignKey: 'animal_id', as: 'animal' });
  };
  return FotoAnimal;
};
