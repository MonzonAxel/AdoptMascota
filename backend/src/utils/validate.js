const AppError = require('./AppError');
const {
  ROL_USUARIO, ESPECIE_ANIMAL, SEXO_ANIMAL, TAMANO_ANIMAL, TIPO_COLOR, ESTADO_ANIMAL,
  TIPO_VIVIENDA, TIPO_TENENCIA, ESTADO_SOLICITUD,
} = require('../constants/enums');
const { EDAD_MINIMA_ADOPTANTE, EDAD_MAXIMA_ADOPTANTE } = require('../constants/negocio');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esTexto = (v) => typeof v === 'string' && v.trim() !== '';

const lanzarSiHay = (errores) => {
  if (errores.length) throw new AppError('Datos inválidos', 422, errores);
};

const validarLogin = (body = {}) => {
  const errores = [];
  if (!esTexto(body.email)) errores.push({ campo: 'email', mensaje: 'El email es obligatorio' });
  if (typeof body.password !== 'string' || body.password === '') {
    errores.push({ campo: 'password', mensaje: 'La contraseña es obligatoria' });
  }
  lanzarSiHay(errores);
  return { email: body.email.trim().toLowerCase(), password: body.password };
};

// alta = true  -> crear usuario (campos obligatorios)
// alta = false -> editar (solo se validan los campos que vengan)
// Devuelve SOLO los campos permitidos: ignora cualquier otra cosa que envíe el cliente.
const validarUsuario = (body = {}, { alta }) => {
  const errores = [];
  const error = (campo, mensaje) => errores.push({ campo, mensaje });
  const viene = (campo) => body[campo] !== undefined;
  const quierePassword = alta || (viene('password') && body.password !== '');

  if (alta || viene('email')) {
    if (!esTexto(body.email) || !EMAIL_RE.test(body.email.trim())) error('email', 'Ingresá un email válido');
  }

  if (quierePassword) {
    if (typeof body.password !== 'string' || body.password.length < 8) {
      error('password', 'La contraseña debe tener al menos 8 caracteres');
    } else if (Buffer.byteLength(body.password) > 72) {
      error('password', 'La contraseña no puede superar los 72 caracteres'); // límite de bcrypt
    }
  }

  // El rol es opcional al crear: si no viene, queda como "administrativo".
  if (viene('rol') && !ROL_USUARIO.includes(body.rol)) {
    error('rol', `El rol debe ser uno de: ${ROL_USUARIO.join(', ')}`);
  }

  ['nombre', 'apellido'].forEach((campo) => {
    if (alta || viene(campo)) {
      if (!esTexto(body[campo]) || body[campo].trim().length > 100) {
        error(campo, `El ${campo} es obligatorio (máximo 100 caracteres)`);
      }
    }
  });

  lanzarSiHay(errores);

  const limpio = {};
  if (viene('email')) limpio.email = body.email.trim().toLowerCase();
  if (quierePassword) limpio.password = body.password;
  if (viene('rol')) limpio.rol = body.rol;
  if (viene('nombre')) limpio.nombre = body.nombre.trim();
  if (viene('apellido')) limpio.apellido = body.apellido.trim();
  return limpio;
};

// ---------------------------------------------------------------------------
// Mascotas
// ---------------------------------------------------------------------------
const EDAD_MAX = 40; // la edad es un número entero, en años (0 = cachorro/a de menos de 1 año)

// Los formularios con fotos (multipart) mandan TODO como texto: "true", "3"...
const aBooleano = (v) => {
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === '1' || v === 1) return true;
  if (v === 'false' || v === '0' || v === 0) return false;
  return undefined;
};
const aEntero = (v) => {
  if (typeof v === 'number') return Number.isInteger(v) ? v : NaN;
  if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) return Number(v.trim());
  return NaN;
};
const esVacio = (v) => v === null || (typeof v === 'string' && v.trim() === '');

// alta = true  -> crear (nombre, especie, sexo, tamano y color obligatorios)
// alta = false -> editar (solo se validan los campos que vengan)
// Devuelve SOLO los campos permitidos: cualquier otra cosa que mande el cliente se ignora.
const validarMascota = (body = {}, { alta }) => {
  const errores = [];
  const limpio = {};
  const error = (campo, mensaje) => errores.push({ campo, mensaje });
  const viene = (campo) => body[campo] !== undefined;

  const opcion = (campo, valores, obligatorio) => {
    if (!viene(campo)) {
      if (obligatorio) error(campo, `El campo ${campo} es obligatorio`);
      return;
    }
    if (valores.includes(body[campo])) limpio[campo] = body[campo];
    else error(campo, `Debe ser uno de: ${valores.join(', ')}`);
  };

  // Texto que se puede dejar vacío (enviar "" o null lo borra).
  const textoOpcional = (campo, max) => {
    if (!viene(campo)) return;
    if (esVacio(body[campo])) { limpio[campo] = null; return; }
    if (typeof body[campo] !== 'string' || body[campo].trim().length > max) error(campo, `Máximo ${max} caracteres`);
    else limpio[campo] = body[campo].trim();
  };

  if (alta || viene('nombre')) {
    if (!esTexto(body.nombre) || body.nombre.trim().length > 100) {
      error('nombre', 'El nombre es obligatorio (máximo 100 caracteres)');
    } else limpio.nombre = body.nombre.trim();
  }
  opcion('especie', ESPECIE_ANIMAL, alta);
  opcion('sexo', SEXO_ANIMAL, alta);
  opcion('tamano', TAMANO_ANIMAL, alta);
  opcion('color', TIPO_COLOR, alta);
  opcion('estado', ESTADO_ANIMAL, false);
  textoOpcional('raza', 100);
  textoOpcional('comportamiento', 2000);

  if (viene('edad')) {
    if (esVacio(body.edad)) limpio.edad = null;
    else {
      const edad = aEntero(body.edad);
      if (Number.isNaN(edad) || edad < 0 || edad > EDAD_MAX) {
        error('edad', `La edad debe ser un número entero entre 0 y ${EDAD_MAX} (en años)`);
      } else limpio.edad = edad;
    }
  }

  ['vacunado', 'esterilizado'].forEach((campo) => {
    if (!viene(campo)) return;
    const valor = aBooleano(body[campo]);
    if (valor === undefined) error(campo, 'Debe ser true o false');
    else limpio[campo] = valor;
  });

  lanzarSiHay(errores);
  return limpio;
};

// Filtros del listado: ?especie=perro,gato&tamano=grande&edad_min=1&page=2 ...
const validarFiltrosMascotas = (query = {}) => {
  const errores = [];
  const filtros = { page: 1, limit: 12 };
  const error = (campo, mensaje) => errores.push({ campo, mensaje });
  const lista = (v) => String(v).split(',').map((x) => x.trim()).filter(Boolean);

  const opciones = (campo, valores) => {
    if (query[campo] === undefined || query[campo] === '') return;
    const items = lista(query[campo]);
    const invalidos = items.filter((i) => !valores.includes(i));
    if (invalidos.length) error(campo, `Valores no válidos: ${invalidos.join(', ')}. Opciones: ${valores.join(', ')}`);
    else if (items.length) filtros[campo] = items;
  };
  opciones('especie', ESPECIE_ANIMAL);
  opciones('tamano', TAMANO_ANIMAL);
  opciones('color', TIPO_COLOR);
  opciones('estado', ESTADO_ANIMAL);

  if (typeof query.raza === 'string' && query.raza.trim() !== '') {
    if (query.raza.trim().length > 100) error('raza', 'Máximo 100 caracteres');
    else filtros.raza = query.raza.trim();
  }

  const numero = (campo, min, max) => {
    if (query[campo] === undefined || query[campo] === '') return undefined;
    const n = aEntero(query[campo]);
    if (Number.isNaN(n) || n < min || n > max) {
      error(campo, `Debe ser un número entero entre ${min} y ${max}`);
      return undefined;
    }
    return n;
  };
  const edadMin = numero('edad_min', 0, EDAD_MAX);
  const edadMax = numero('edad_max', 0, EDAD_MAX);
  if (edadMin !== undefined) filtros.edad_min = edadMin;
  if (edadMax !== undefined) filtros.edad_max = edadMax;
  if (edadMin !== undefined && edadMax !== undefined && edadMin > edadMax) {
    error('edad_min', 'edad_min no puede ser mayor que edad_max');
  }

  const page = numero('page', 1, 100000);
  const limit = numero('limit', 1, 50);
  if (page !== undefined) filtros.page = page;
  if (limit !== undefined) filtros.limit = limit;

  lanzarSiHay(errores);
  return filtros;
};

// ---------------------------------------------------------------------------
// Solicitudes de adopción
// ---------------------------------------------------------------------------
const TELEFONO_RE = /^[0-9+()\-\s]{6,30}$/;
const DNI_RE = /^[0-9]{7,8}$/;

// Formulario público: TODO lo que importa se valida acá. Devuelve solo los campos permitidos
// (el estado, quién la revisó, etc. nunca se aceptan desde afuera).
const validarSolicitud = (body = {}) => {
  const errores = [];
  const limpio = {};
  const error = (campo, mensaje) => errores.push({ campo, mensaje });

  const texto = (campo, max, etiqueta) => {
    if (!esTexto(body[campo]) || body[campo].trim().length > max) {
      error(campo, `${etiqueta} es obligatorio (máximo ${max} caracteres)`);
    } else limpio[campo] = body[campo].trim();
  };
  const opcion = (campo, valores, etiqueta) => {
    if (valores.includes(body[campo])) limpio[campo] = body[campo];
    else error(campo, `${etiqueta}: elegí una opción válida (${valores.join(', ')})`);
  };

  const animalId = aEntero(body.animal_id);
  if (Number.isNaN(animalId) || animalId < 1) error('animal_id', 'Elegí la mascota que querés adoptar');
  else limpio.animal_id = animalId;

  texto('nombre_apellido', 100, 'El nombre y apellido');

  if (!esTexto(body.email) || !EMAIL_RE.test(body.email.trim()) || body.email.trim().length > 150) {
    error('email', 'Ingresá un email válido');
  } else limpio.email = body.email.trim().toLowerCase();

  const dni = typeof body.dni === 'string' ? body.dni.trim() : '';
  if (!DNI_RE.test(dni)) error('dni', 'Ingresá un DNI válido de 7 u 8 dígitos');
  else limpio.dni = dni;

  const edad = aEntero(body.edad);
  if (Number.isNaN(edad) || edad > EDAD_MAXIMA_ADOPTANTE || edad < 0) error('edad', 'Ingresá una edad válida');
  else if (edad < EDAD_MINIMA_ADOPTANTE) error('edad', `Tenés que ser mayor de ${EDAD_MINIMA_ADOPTANTE} años para adoptar`);
  else limpio.edad = edad;

  if (!esTexto(body.telefono_celular) || !TELEFONO_RE.test(body.telefono_celular.trim())) {
    error('telefono_celular', 'Ingresá un teléfono celular válido (solo números, espacios, + - y paréntesis)');
  } else limpio.telefono_celular = body.telefono_celular.trim();

  if (esVacio(body.telefono_fijo) || body.telefono_fijo === undefined) limpio.telefono_fijo = null;
  else if (typeof body.telefono_fijo !== 'string' || !TELEFONO_RE.test(body.telefono_fijo.trim())) {
    error('telefono_fijo', 'Ingresá un teléfono fijo válido o dejalo vacío');
  } else limpio.telefono_fijo = body.telefono_fijo.trim();

  texto('ocupacion', 150, 'La ocupación');
  texto('localidad_barrio', 150, 'La localidad o barrio');
  texto('direccion', 150, 'La dirección');
  opcion('vivienda', TIPO_VIVIENDA, 'Tipo de vivienda');
  opcion('tipo_tenencia', TIPO_TENENCIA, 'Propietario/a o inquilino/a');

  // Solo tiene sentido preguntarlo a quien alquila.
  if (body.tipo_tenencia === 'inquilino') {
    const permite = aBooleano(body.permite_animales);
    if (permite === undefined) error('permite_animales', 'Indicá si tu propietario permite animales (true o false)');
    else limpio.permite_animales = permite;
  } else limpio.permite_animales = null;

  texto('detalle_vivienda', 2000, 'El detalle de la vivienda');
  texto('personas_hogar', 2000, 'Cuántas personas viven en el hogar y sus edades');
  texto('hay_ninos_hogar', 2000, 'Si hay niños en la casa');
  texto('otros_animales_hogar', 2000, 'Si hay otros animales en la casa');
  texto('frecuencia_paseo', 255, 'Cuántas veces por día lo sacarías a pasear');
  texto('cuidador_vacaciones', 2000, 'Quién lo cuidaría durante las vacaciones');

  lanzarSiHay(errores);
  return limpio;
};

const validarTextoLargo = (valor, campo, etiqueta, errores, { obligatorio }) => {
  if (valor === undefined || esVacio(valor)) {
    if (obligatorio) errores.push({ campo, mensaje: `${etiqueta} es obligatoria` });
    return undefined;
  }
  if (typeof valor !== 'string' || valor.trim().length > 2000) {
    errores.push({ campo, mensaje: `${etiqueta} puede tener hasta 2000 caracteres` });
    return undefined;
  }
  return valor.trim();
};

// Cambio de estado: { estado, observacion? } (la observación es una nota opcional, ej. el motivo del rechazo)
const validarCambioEstado = (body = {}) => {
  const errores = [];
  const limpio = {};
  if (!ESTADO_SOLICITUD.includes(body.estado)) {
    errores.push({ campo: 'estado', mensaje: `Debe ser uno de: ${ESTADO_SOLICITUD.join(', ')}` });
  } else limpio.estado = body.estado;
  const nota = validarTextoLargo(body.observacion, 'observacion', 'La observación', errores, { obligatorio: false });
  if (nota) limpio.observacion = nota;
  lanzarSiHay(errores);
  return limpio;
};

const validarObservacion = (body = {}) => {
  const errores = [];
  const observacion = validarTextoLargo(body.observacion, 'observacion', 'La observación', errores, { obligatorio: true });
  lanzarSiHay(errores);
  return { observacion };
};

// Listado del personal: ?estado=pendiente,en_revision&animal_id=3&page=1&limit=20
const validarFiltrosSolicitudes = (query = {}) => {
  const errores = [];
  const filtros = { page: 1, limit: 20 };
  const error = (campo, mensaje) => errores.push({ campo, mensaje });

  if (query.estado !== undefined && query.estado !== '') {
    const items = String(query.estado).split(',').map((x) => x.trim()).filter(Boolean);
    const invalidos = items.filter((i) => !ESTADO_SOLICITUD.includes(i));
    if (invalidos.length) error('estado', `Valores no válidos: ${invalidos.join(', ')}. Opciones: ${ESTADO_SOLICITUD.join(', ')}`);
    else if (items.length) filtros.estado = items;
  }
  const numero = (campo, min, max) => {
    if (query[campo] === undefined || query[campo] === '') return undefined;
    const n = aEntero(query[campo]);
    if (Number.isNaN(n) || n < min || n > max) { error(campo, `Debe ser un número entero entre ${min} y ${max}`); return undefined; }
    return n;
  };
  const animalId = numero('animal_id', 1, 2147483647);
  const page = numero('page', 1, 100000);
  const limit = numero('limit', 1, 100);
  if (animalId !== undefined) filtros.animal_id = animalId;
  if (page !== undefined) filtros.page = page;
  if (limit !== undefined) filtros.limit = limit;

  lanzarSiHay(errores);
  return filtros;
};

module.exports = {
  validarLogin, validarUsuario, validarMascota, validarFiltrosMascotas,
  validarSolicitud, validarCambioEstado, validarObservacion, validarFiltrosSolicitudes,
};
