const { HistorialCambio } = require('../models');

// Todo se guarda como texto en la tabla historial_cambio.
const aTexto = (v) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

// Anota quién cambió qué. Una fila por campo modificado (o una sola fila si es crear/eliminar).
// Se llama DENTRO de la transacción del cambio: si el cambio falla, el registro tampoco queda.
const registrar = async ({ tabla, registroId, usuarioId, accion, cambios = [] }, { transaction } = {}) => {
  const base = { nombre_tabla: tabla, registro_id: registroId, usuario_id: usuarioId, accion };
  const filas = cambios.length
    ? cambios.map((c) => ({ ...base, campo: c.campo, valor_antiguo: aTexto(c.antiguo), valor_actual: aTexto(c.actual) }))
    : [{ ...base, campo: null, valor_antiguo: null, valor_actual: null }];
  return HistorialCambio.bulkCreate(filas, { transaction });
};

// Qué campos de un registro cambiaron. Se usa DESPUÉS de instancia.set(...) y ANTES de instancia.save().
const diferencias = (instancia, ignorar = ['actualizado_por', 'updatedAt']) =>
  (instancia.changed() || [])
    .filter((campo) => !ignorar.includes(campo))
    .map((campo) => ({ campo, antiguo: instancia.previous(campo), actual: instancia.get(campo) }));

module.exports = { registrar, diferencias };
