const { Op } = require('sequelize');
const {
  Animal, SolicitudAdopcion, ObservacionSolicitud, HistorialCambio, sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const {
  formatearMascotaCorta, formatearObservacion, formatearSolicitudResumen, formatearSolicitudDetalle,
} = require('../utils/serializers');
const {
  ESTADOS_SOLICITUD_ACTIVA, MAX_SOLICITUDES_ACTIVAS_POR_DNI, TRANSICIONES_SOLICITUD,
} = require('../constants/negocio');
const auditoria = require('./auditoria.service');
const { fotosDe } = require('./mascotas.service');

const CON_PERSONA = [{ association: 'perfil' }];
const activas = { [Op.in]: ESTADOS_SOLICITUD_ACTIVA };

// ---------------------------------------------------------------------------
// Alta (pública)
// ---------------------------------------------------------------------------
const crear = async (datos) =>
  sequelize.transaction(async (t) => {
    // Se bloquea la mascota para serializar envíos mientras el personal cambia su disponibilidad.
    const animal = await Animal.findByPk(datos.animal_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!animal) throw new AppError('Mascota no encontrada', 404);

    if (animal.estado !== 'disponible') {
      throw new AppError('Esta mascota ya no está disponible para recibir solicitudes', 409);
    }

    const solicitudesActivasDelDni = await SolicitudAdopcion.count({
      where: { dni: datos.dni, estado: activas }, transaction: t,
    });
    if (solicitudesActivasDelDni >= MAX_SOLICITUDES_ACTIVAS_POR_DNI) {
      throw new AppError(
        `Este DNI ya alcanzó el máximo de ${MAX_SOLICITUDES_ACTIVAS_POR_DNI} solicitudes activas. El refugio debe resolver alguna antes de que puedas enviar otra.`,
        409,
      );
    }

    const solicitud = await SolicitudAdopcion.create({ ...datos, estado: 'pendiente' }, { transaction: t });

    // A quien consulta solo se le confirma lo mínimo: no se le devuelven sus propios datos.
    return { id: solicitud.id, estado: solicitud.estado, mascota: { id: animal.id, nombre: animal.nombre } };
  });

// ---------------------------------------------------------------------------
// Consulta (personal)
// ---------------------------------------------------------------------------
const listar = async (filtros, { baseUrl }) => {
  const { page, limit } = filtros;
  const where = {};
  if (filtros.estado) where.estado = { [Op.in]: filtros.estado };
  if (filtros.animal_id) where.animal_id = filtros.animal_id;

  const { rows, count } = await SolicitudAdopcion.findAndCountAll({
    where,
    include: [{
      association: 'animal', attributes: ['id', 'nombre', 'especie', 'estado'], paranoid: false, required: false,
    }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']], // las más nuevas primero
    limit,
    offset: (page - 1) * limit,
  });

  const fotos = await fotosDe([...new Set(rows.map((s) => s.animal_id))]);
  return {
    items: rows.map((s) => formatearSolicitudResumen(s, formatearMascotaCorta(s.animal, fotos.get(s.animal_id) || [], baseUrl))),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

const obtener = async (id, { baseUrl }) => {
  const solicitud = await SolicitudAdopcion.findByPk(id, {
    include: [{ association: 'revisor', include: CON_PERSONA }],
  });
  if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

  const [animal, observaciones, historial] = await Promise.all([
    Animal.findByPk(solicitud.animal_id, { paranoid: false }),
    ObservacionSolicitud.findAll({
      where: { solicitud_id: id },
      include: [{ association: 'autor', include: CON_PERSONA }],
      order: [['createdAt', 'ASC'], ['id', 'ASC']],
    }),
    HistorialCambio.findAll({
      where: { nombre_tabla: 'solicitudes_adopcion', registro_id: id },
      include: [{ association: 'usuario', include: CON_PERSONA }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
    }),
  ]);
  const fotos = animal ? (await fotosDe([animal.id])).get(animal.id) || [] : [];

  return formatearSolicitudDetalle(solicitud, {
    mascota: formatearMascotaCorta(animal, fotos, baseUrl),
    observaciones,
    historial,
  });
};

// ---------------------------------------------------------------------------
// Cambio de estado (personal)
// ---------------------------------------------------------------------------
// Aprobar marca la mascota como adoptada. El personal controla manualmente la disponibilidad.
const cambiarEstado = async (id, { estado, observacion }, usuario, ctx) => {
  await sequelize.transaction(async (t) => {
    // Se bloquea la solicitud: si dos personas del refugio la resuelven a la vez, una sola gana.
    const solicitud = await SolicitudAdopcion.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!solicitud) throw new AppError('Solicitud no encontrada', 404);

    const anterior = solicitud.estado;
    if (estado === anterior) throw new AppError(`La solicitud ya está en estado "${anterior}"`, 409);
    if (!TRANSICIONES_SOLICITUD[anterior].includes(estado)) {
      const resuelta = TRANSICIONES_SOLICITUD[anterior].length === 0;
      throw new AppError(
        resuelta
          ? `La solicitud ya fue ${anterior} y no se puede modificar`
          : `No se puede pasar de "${anterior}" a "${estado}"`,
        409,
      );
    }

    const seResuelve = estado === 'aprobada' || estado === 'rechazada';
    await solicitud.update({
      estado,
      revisado_por: estado === 'pendiente' ? null : usuario.id,
      fecha_resolucion: seResuelve ? new Date() : null,
      actualizado_por: usuario.id,
    }, { transaction: t });
    await auditoria.registrar({
      tabla: 'solicitudes_adopcion', registroId: solicitud.id, usuarioId: usuario.id, accion: 'actualizar',
      cambios: [{ campo: 'estado', antiguo: anterior, actual: estado }],
    }, { transaction: t });

    const animal = await Animal.findByPk(solicitud.animal_id, { transaction: t, lock: t.LOCK.UPDATE, paranoid: false });
    if (animal) {
      let nuevo = null;
      if (estado === 'aprobada') nuevo = 'adoptado';

      if (nuevo && nuevo !== animal.estado) {
        const previo = animal.estado;
        await animal.update({ estado: nuevo, actualizado_por: usuario.id }, { transaction: t });
        await auditoria.registrar({
          tabla: 'animales', registroId: animal.id, usuarioId: usuario.id, accion: 'actualizar',
          cambios: [{ campo: 'estado', antiguo: previo, actual: nuevo }],
        }, { transaction: t });
      }
    }

    if (observacion) {
      await ObservacionSolicitud.create(
        { solicitud_id: solicitud.id, usuario_id: usuario.id, observacion }, { transaction: t },
      );
    }
  });
  return obtener(id, ctx);
};

// ---------------------------------------------------------------------------
// Observaciones (personal)
// ---------------------------------------------------------------------------
const agregarObservacion = async (id, { observacion }, usuario) => {
  const solicitud = await SolicitudAdopcion.findByPk(id);
  if (!solicitud) throw new AppError('Solicitud no encontrada', 404);
  const creada = await ObservacionSolicitud.create({ solicitud_id: id, usuario_id: usuario.id, observacion });
  const conAutor = await ObservacionSolicitud.findByPk(creada.id, {
    include: [{ association: 'autor', include: CON_PERSONA }],
  });
  return formatearObservacion(conAutor);
};

module.exports = { crear, listar, obtener, cambiarEstado, agregarObservacion };
