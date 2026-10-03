const { Usuario, PerfilUsuario, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { formatearUsuario } = require('../utils/serializers');
const auditoria = require('./auditoria.service');
const passwordService = require('./password.service');

const CON_PERFIL = [{ association: 'perfil' }];

const obtener = async (id) => {
  const usuario = await Usuario.findByPk(id, { include: CON_PERFIL });
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario;
};

// paranoid:false -> mira también los usuarios dados de baja, porque su email sigue ocupado.
const verificarEmailLibre = async (email, idPropio = null) => {
  const existente = await Usuario.findOne({ where: { email }, paranoid: false });
  if (existente && existente.id !== idPropio) {
    const motivo = existente.deletedAt ? 'pertenece a un usuario dado de baja' : 'ya está registrado';
    throw new AppError(`Ese email ${motivo}`, 409);
  }
};

const listar = async () => {
  const usuarios = await Usuario.findAll({ include: CON_PERFIL, order: [['createdAt', 'DESC']] });
  return usuarios.map(formatearUsuario);
};

const obtenerFormateado = async (id) => formatearUsuario(await obtener(id));

const crear = async ({ email, password, rol = 'administrativo', nombre, apellido }, actor) => {
  await verificarEmailLibre(email);
  const password_hash = await passwordService.hash(password);

  // Transacción: o se crean las dos filas (usuario + perfil) y queda anotado, o no pasa nada.
  const creado = await sequelize.transaction(async (t) => {
    const usuario = await Usuario.create({ email, password_hash, rol }, { transaction: t });
    await PerfilUsuario.create({ usuario_id: usuario.id, nombre, apellido }, { transaction: t });
    await auditoria.registrar(
      { tabla: 'usuarios', registroId: usuario.id, usuarioId: actor.id, accion: 'crear' },
      { transaction: t },
    );
    return usuario;
  });

  return obtenerFormateado(creado.id);
};

const actualizar = async (id, datos, usuarioActual) => {
  const usuario = await obtener(id);

  if (datos.email && datos.email !== usuario.email) await verificarEmailLibre(datos.email, id);

  // Evita que un admin se quite a sí mismo el rol y deje el sistema sin administradores.
  if (id === usuarioActual.id && datos.rol && datos.rol !== usuario.rol) {
    throw new AppError('No podés cambiar tu propio rol', 400);
  }

  const nuevoHash = datos.password ? await passwordService.hash(datos.password) : null;

  await sequelize.transaction(async (t) => {
    // Se anota qué cambió DE VERDAD (si se envía el mismo valor que ya tenía, no se registra nada).
    usuario.set({ ...(datos.email && { email: datos.email }), ...(datos.rol && { rol: datos.rol }) });
    const cambios = auditoria.diferencias(usuario);

    // La contraseña NUNCA se anota (ni la clave ni su hash): solo el hecho de que cambió.
    if (nuevoHash) {
      usuario.set('password_hash', nuevoHash);
      cambios.push({ campo: 'password', antiguo: null, actual: '[modificada]' });
    }
    if (usuario.changed()) await usuario.save({ transaction: t });

    usuario.perfil.set({
      ...(datos.nombre && { nombre: datos.nombre }),
      ...(datos.apellido && { apellido: datos.apellido }),
    });
    cambios.push(...auditoria.diferencias(usuario.perfil));
    if (usuario.perfil.changed()) await usuario.perfil.save({ transaction: t });

    if (cambios.length) {
      await auditoria.registrar(
        { tabla: 'usuarios', registroId: id, usuarioId: usuarioActual.id, accion: 'actualizar', cambios },
        { transaction: t },
      );
    }
  });

  return obtenerFormateado(id);
};

// Baja lógica (paranoid): completa deletedAt, no borra la fila.
const eliminar = async (id, usuarioActual) => {
  if (id === usuarioActual.id) throw new AppError('No podés eliminar tu propio usuario', 400);
  const usuario = await obtener(id);
  await sequelize.transaction(async (t) => {
    await usuario.destroy({ transaction: t });
    await auditoria.registrar(
      { tabla: 'usuarios', registroId: id, usuarioId: usuarioActual.id, accion: 'eliminar' },
      { transaction: t },
    );
  });
};

module.exports = { listar, obtenerFormateado, crear, actualizar, eliminar };
