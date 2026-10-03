// Decide qué datos de un usuario se le muestran al cliente.
// Nunca incluye password_hash.
const formatearUsuario = (u) => ({
  id: u.id,
  email: u.email,
  rol: u.rol,
  nombre: u.perfil ? u.perfil.nombre : null,
  apellido: u.perfil ? u.perfil.apellido : null,
  creado: u.createdAt,
});

// ---- Mascotas ----
// En la base la foto se guarda como "/uploads/abc.jpg"; al cliente le llega la dirección completa.
const urlAbsoluta = (url, baseUrl) => (url && url.startsWith('/') ? `${baseUrl}${url}` : url);

const formatearFoto = (f, baseUrl) => ({
  id: f.id,
  url: urlAbsoluta(f.url, baseUrl),
  es_principal: Boolean(f.es_principal),
  orden: f.orden,
});

// Las fotos llegan ordenadas (principal primero); por las dudas buscamos la marcada.
const principalDe = (fotos) => fotos.find((f) => f.es_principal) || fotos[0] || null;

// Para las tarjetas de la galería
const formatearMascotaResumen = (a, fotos, baseUrl, esPersonal) => {
  const principal = principalDe(fotos);
  return {
    id: a.id,
    nombre: a.nombre,
    especie: a.especie,
    raza: a.raza,
    sexo: a.sexo,
    tamano: a.tamano,
    edad: a.edad,
    color: a.color,
    estado: a.estado,
    foto_principal: principal ? urlAbsoluta(principal.url, baseUrl) : null,
    ...(esPersonal ? { vacunado: a.vacunado, esterilizado: a.esterilizado, fecha_ingreso: a.fecha_ingreso } : {}),
  };
};

// Para la pantalla de detalle. Los datos internos (quién la cargó) solo los ve el personal.
const formatearMascotaDetalle = (a, fotos, baseUrl, esPersonal) => ({
  id: a.id,
  nombre: a.nombre,
  especie: a.especie,
  raza: a.raza,
  sexo: a.sexo,
  tamano: a.tamano,
  edad: a.edad,
  color: a.color,
  comportamiento: a.comportamiento,
  vacunado: a.vacunado,
  esterilizado: a.esterilizado,
  estado: a.estado,
  fecha_ingreso: a.fecha_ingreso,
  fotos: fotos.map((f) => formatearFoto(f, baseUrl)),
  ...(esPersonal ? { creado_por: a.creado_por, actualizado_por: a.actualizado_por } : {}),
});

// ---- Solicitudes de adopción ----
const formatearPersona = (u) => (u ? {
  id: u.id,
  nombre: u.perfil ? u.perfil.nombre : null,
  apellido: u.perfil ? u.perfil.apellido : null,
} : null);

// La mascota "en miniatura" que se muestra dentro de una solicitud
const formatearMascotaCorta = (a, fotos, baseUrl) => (a ? {
  id: a.id,
  nombre: a.nombre,
  especie: a.especie,
  estado: a.estado,
  foto_principal: principalDe(fotos) ? urlAbsoluta(principalDe(fotos).url, baseUrl) : null,
} : null);

const formatearObservacion = (o) => ({
  id: o.id,
  observacion: o.observacion,
  creado: o.createdAt,
  autor: formatearPersona(o.autor),
});

const formatearCambio = (h) => ({
  id: h.id,
  accion: h.accion,
  campo: h.campo,
  valor_antiguo: h.valor_antiguo,
  valor_actual: h.valor_actual,
  creado: h.createdAt,
  usuario: formatearPersona(h.usuario),
});

// Fila del listado del personal
const formatearSolicitudResumen = (s, mascota) => ({
  id: s.id,
  estado: s.estado,
  nombre_apellido: s.nombre_apellido,
  email: s.email,
  telefono_celular: s.telefono_celular,
  creado: s.createdAt,
  fecha_resolucion: s.fecha_resolucion,
  mascota,
});

// Detalle completo: mismos nombres de campo que el formulario público, más lo que agrega el refugio.
const formatearSolicitudDetalle = (s, { mascota, observaciones, historial }) => ({
  id: s.id,
  estado: s.estado,
  creado: s.createdAt,
  fecha_resolucion: s.fecha_resolucion,
  revisado_por: formatearPersona(s.revisor),
  nombre_apellido: s.nombre_apellido,
  edad: s.edad,
  email: s.email,
  telefono_celular: s.telefono_celular,
  telefono_fijo: s.telefono_fijo,
  ocupacion: s.ocupacion,
  localidad_barrio: s.localidad_barrio,
  direccion: s.direccion,
  vivienda: s.vivienda,
  tipo_tenencia: s.tipo_tenencia,
  permite_animales: s.permite_animales,
  detalle_vivienda: s.detalle_vivienda,
  personas_hogar: s.personas_hogar,
  hay_ninos_hogar: s.hay_ninos_hogar,
  otros_animales_hogar: s.otros_animales_hogar,
  frecuencia_paseo: s.frecuencia_paseo,
  cuidador_vacaciones: s.cuidador_vacaciones,
  mascota,
  observaciones: observaciones.map(formatearObservacion),
  historial: historial.map(formatearCambio),
});

module.exports = {
  formatearUsuario,
  formatearMascotaResumen,
  formatearMascotaDetalle,
  formatearMascotaCorta,
  formatearObservacion,
  formatearSolicitudResumen,
  formatearSolicitudDetalle,
};
