// Reglas de negocio en un solo lugar: si el refugio cambia un criterio, se cambia acá.
module.exports = {
  // Quién puede pedir una adopción
  EDAD_MINIMA_ADOPTANTE: 18,
  EDAD_MAXIMA_ADOPTANTE: 110,

  // Una solicitud "activa" es la que todavía no se resolvió.
  ESTADOS_SOLICITUD_ACTIVA: ['pendiente', 'en_revision'],

  // Tope de trámites simultáneos por DNI.
  MAX_SOLICITUDES_ACTIVAS_POR_DNI: 5,

  // De qué estado se puede pasar a cuál. "aprobada" y "rechazada" son finales.
  TRANSICIONES_SOLICITUD: {
    pendiente: ['en_revision', 'aprobada', 'rechazada'],
    en_revision: ['pendiente', 'aprobada', 'rechazada'],
    aprobada: [],
    rechazada: [],
  },
};
