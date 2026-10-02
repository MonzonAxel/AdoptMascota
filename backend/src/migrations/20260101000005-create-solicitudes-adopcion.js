const E = require('../constants/enums');
const fkUsuario = (Sequelize) => ({
  type: Sequelize.INTEGER, allowNull: true,
  references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
});
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('solicitudes_adopcion', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      animal_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'animales', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      nombre_apellido: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false },
      edad: { type: Sequelize.INTEGER, allowNull: false },
      telefono_celular: { type: Sequelize.STRING(30), allowNull: false },
      telefono_fijo: { type: Sequelize.STRING(30) },
      ocupacion: { type: Sequelize.STRING(150), allowNull: false },
      localidad_barrio: { type: Sequelize.STRING(150), allowNull: false },
      direccion: { type: Sequelize.STRING(150), allowNull: false },
      vivienda: { type: Sequelize.ENUM(...E.TIPO_VIVIENDA), allowNull: false },
      tipo_tenencia: { type: Sequelize.ENUM(...E.TIPO_TENENCIA), allowNull: false },
      permite_animales: { type: Sequelize.BOOLEAN },
      detalle_vivienda: { type: Sequelize.TEXT, allowNull: false },
      personas_hogar: { type: Sequelize.TEXT, allowNull: false },
      hay_ninos_hogar: { type: Sequelize.TEXT, allowNull: false },
      otros_animales_hogar: { type: Sequelize.TEXT, allowNull: false },
      frecuencia_paseo: { type: Sequelize.STRING(255), allowNull: false },
      cuidador_vacaciones: { type: Sequelize.TEXT, allowNull: false },
      estado: { type: Sequelize.ENUM(...E.ESTADO_SOLICITUD), defaultValue: 'pendiente' },
      fecha_resolucion: { type: Sequelize.DATE },
      revisado_por: fkUsuario(Sequelize),
      actualizado_por: fkUsuario(Sequelize),
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await qi.addIndex('solicitudes_adopcion', ['animal_id', 'estado']);
  },
  async down(qi) { await qi.dropTable('solicitudes_adopcion'); },
};
