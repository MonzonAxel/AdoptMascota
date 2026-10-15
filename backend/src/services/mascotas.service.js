const { Op } = require('sequelize');
const E = require('../constants/enums');
const { Animal, FotoAnimal, SolicitudAdopcion, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { formatearMascotaResumen, formatearMascotaDetalle } = require('../utils/serializers');
const { ESTADOS_SOLICITUD_ACTIVA } = require('../constants/negocio');
const fotosService = require('./fotos.service');
const auditoria = require('./auditoria.service');

const ORDEN_FOTOS = [['es_principal', 'DESC'], ['orden', 'ASC'], ['id', 'ASC']]; // principal primero

// Trae las fotos de varias mascotas con UNA sola consulta -> Map(animal_id -> [fotos])
const fotosDe = async (ids) => {
  const mapa = new Map();
  if (!ids.length) return mapa;
  const fotos = await FotoAnimal.findAll({ where: { animal_id: ids }, order: ORDEN_FOTOS });
  fotos.forEach((f) => {
    if (!mapa.has(f.animal_id)) mapa.set(f.animal_id, []);
    mapa.get(f.animal_id).push(f);
  });
  return mapa;
};

// El público SOLO ve mascotas disponibles. El personal ve todas (y puede filtrar por estado).
const construirWhere = (filtros, esPersonal) => {
  const where = {};
  if (!esPersonal) where.estado = 'disponible';
  else if (filtros.estado) where.estado = { [Op.in]: filtros.estado };

  if (filtros.especie) where.especie = { [Op.in]: filtros.especie };
  if (filtros.tamano) where.tamano = { [Op.in]: filtros.tamano };
  if (filtros.color) where.color = { [Op.in]: filtros.color };
  if (filtros.raza) where.raza = filtros.raza;
  if (filtros.edad_min !== undefined || filtros.edad_max !== undefined) {
    where.edad = {};
    if (filtros.edad_min !== undefined) where.edad[Op.gte] = filtros.edad_min;
    if (filtros.edad_max !== undefined) where.edad[Op.lte] = filtros.edad_max;
  }
  return where;
};

const listar = async (filtros, { baseUrl, esPersonal }) => {
  const { page, limit } = filtros;
  const { rows, count } = await Animal.findAndCountAll({
    where: construirWhere(filtros, esPersonal),
    order: [['fecha_ingreso', 'DESC'], ['id', 'DESC']], // las más nuevas primero
    limit,
    offset: (page - 1) * limit,
  });
  const fotos = await fotosDe(rows.map((a) => a.id));
  return {
    items: rows.map((a) => formatearMascotaResumen(a, fotos.get(a.id) || [], baseUrl, esPersonal)),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

// Opciones para los desplegables del filtro: solo lo que realmente existe entre las disponibles
// (así nadie elige un color que después no devuelve ninguna mascota).
const opcionesDeFiltros = async () => {
  const filas = await Animal.findAll({
    where: { estado: 'disponible' }, attributes: ['especie', 'raza', 'color', 'tamano'], raw: true,
  });
  const enUso = (campo) => new Set(filas.map((f) => f[campo]));
  const enOrden = (valores, campo) => valores.filter((v) => enUso(campo).has(v)); // respeta el orden del ENUM
  return {
    especies: enOrden(E.ESPECIE_ANIMAL, 'especie'),
    tamanos: enOrden(E.TAMANO_ANIMAL, 'tamano'),
    colores: enOrden(E.TIPO_COLOR, 'color'),
    razas: [...new Set(filas.map((f) => f.raza).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
  };
};

const asegurarExiste = async (id) => {
  const animal = await Animal.findByPk(id);
  if (!animal) throw new AppError('Mascota no encontrada', 404);
  return animal;
};

const obtener = async (id, { baseUrl, esPersonal }) => {
  const animal = await asegurarExiste(id);
  // Para el público, una mascota adoptada o en proceso "no existe".
  if (!esPersonal && animal.estado !== 'disponible') throw new AppError('Mascota no encontrada', 404);
  const fotos = (await fotosDe([animal.id])).get(animal.id) || [];
  return formatearMascotaDetalle(animal, fotos, baseUrl, esPersonal);
};

const crear = async (datos, archivos, usuario, ctx) => {
  // Transacción: o se guarda la mascota CON sus fotos, o no se guarda nada.
  const animal = await sequelize.transaction(async (t) => {
    const nuevo = await Animal.create(
      { ...datos, creado_por: usuario.id, actualizado_por: usuario.id },
      { transaction: t },
    );
    await fotosService.agregar(nuevo.id, archivos, { transaction: t });
    await auditoria.registrar(
      { tabla: 'animales', registroId: nuevo.id, usuarioId: usuario.id, accion: 'crear' },
      { transaction: t },
    );
    return nuevo;
  });
  return obtener(animal.id, { ...ctx, esPersonal: true });
};

const actualizar = async (id, datos, usuario, ctx) => {
  await sequelize.transaction(async (t) => {
    const animal = await Animal.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!animal) throw new AppError('Mascota no encontrada', 404);
    animal.set(datos);
    const cambios = auditoria.diferencias(animal); // qué campos cambiaron realmente
    animal.set('actualizado_por', usuario.id);
    await animal.save({ transaction: t });
    if (cambios.length) {
      await auditoria.registrar(
        { tabla: 'animales', registroId: id, usuarioId: usuario.id, accion: 'actualizar', cambios },
        { transaction: t },
      );
    }
  });
  return obtener(id, { ...ctx, esPersonal: true });
};

// Baja lógica. No se puede dar de baja una mascota que tiene trámites de adopción en curso.
const eliminar = async (id, usuario) => {
  const animal = await asegurarExiste(id);
  const activas = await SolicitudAdopcion.count({
    where: { animal_id: id, estado: { [Op.in]: ESTADOS_SOLICITUD_ACTIVA } },
  });
  if (activas > 0) {
    throw new AppError(`No se puede dar de baja: tiene ${activas} solicitud(es) de adopción activa(s)`, 409);
  }
  await sequelize.transaction(async (t) => {
    await animal.destroy({ transaction: t });
    await auditoria.registrar(
      { tabla: 'animales', registroId: id, usuarioId: usuario.id, accion: 'eliminar' },
      { transaction: t },
    );
  });
};

module.exports = { listar, opcionesDeFiltros, obtener, crear, actualizar, eliminar, asegurarExiste, fotosDe };
