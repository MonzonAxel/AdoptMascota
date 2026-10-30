// ENUMs del DER. Fuente única de verdad para migraciones, modelos y validaciones.
module.exports = {
  ROL_USUARIO: ['admin', 'administrativo'],
  ESPECIE_ANIMAL: ['perro', 'gato'],
  SEXO_ANIMAL: ['macho', 'hembra'],
  TAMANO_ANIMAL: ['pequeno', 'mediano', 'grande'],
  // Los colores no estaban listados en el documento: ajustar a gusto.
  TIPO_COLOR: ['negro', 'blanco', 'marron', 'gris', 'naranja', 'crema', 'dorado', 'atigrado', 'manchado', 'tricolor', 'otro'],
  ESTADO_ANIMAL: ['disponible', 'en_proceso', 'adoptado'],
  TIPO_VIVIENDA: ['casa', 'departamento', 'ph', 'otro'],
  TIPO_TENENCIA: ['propietario', 'inquilino'],
  ESTADO_SOLICITUD: ['pendiente', 'en_revision', 'aprobada', 'rechazada'],
  TIPO_ACCION: ['crear', 'actualizar', 'eliminar'],
};
