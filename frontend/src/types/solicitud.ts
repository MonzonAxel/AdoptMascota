export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada'
export type TipoVivienda = 'depto' | 'casa' | 'otro'
export type TipoTenencia = 'propietario' | 'inquilino'

export interface SolicitudAdopcion {
  id: number
  animalId: number
  nombreApellido: string
  correoElectronico: string
  edad: number
  telefonoCelular: string
  telefonoFijo: string | null
  ocupacion: string
  localidadBarrio: string
  direccion: string
  vivienda: TipoVivienda
  tipoTenencia: TipoTenencia
  permiteAnimales: boolean | null
  detalleVivienda: string
  personasHogar: string
  hayNinosHogar: string
  otrosAnimalesHogar: string
  frecuenciaPaseo: string
  cuidadorVacaciones: string
  estado: EstadoSolicitud
  fechaResolucion: string | null
  revisadoPor: number | null
  actualizadoPor: number | null
  creadoEn: string
  actualizadoEn: string | null
}

export type DatosCrearSolicitud = Omit<
  SolicitudAdopcion,
  | 'id'
  | 'telefonoFijo'
  | 'permiteAnimales'
  | 'estado'
  | 'fechaResolucion'
  | 'revisadoPor'
  | 'actualizadoPor'
  | 'creadoEn'
  | 'actualizadoEn'
> & {
  telefonoFijo?: string | null
  permiteAnimales?: boolean | null
}

export interface ResumenSolicitudAdopcion {
  id: number
  nombreApellido: string
  creadoEn: string
  estado: EstadoSolicitud
  animal: {
    id: number
    nombre: string
  }
}

export interface FiltrosSolicitudes {
  estado?: EstadoSolicitud
  animalId?: number
  busqueda?: string
}

export interface ObservacionSolicitud {
  id: number
  solicitudId: number
  usuarioId: number
  observacion: string
  creadoEn: string
  actualizadoEn: string | null
}

export type DatosCrearObservacion = Pick<ObservacionSolicitud, 'observacion'>