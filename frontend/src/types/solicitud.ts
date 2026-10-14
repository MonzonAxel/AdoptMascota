export type EstadoSolicitud = 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada'
export type TipoVivienda = 'casa' | 'departamento' | 'ph' | 'otro'
export type TipoTenencia = 'propietario' | 'inquilino'

export interface MascotaSolicitud {
  id: number
  nombre: string
  especie: 'perro' | 'gato'
  estado: 'disponible' | 'en_proceso' | 'adoptado'
  foto_principal: string | null
}

export interface PersonaSolicitud {
  id: number
  nombre: string | null
  apellido: string | null
}

export interface ObservacionSolicitud {
  id: number
  observacion: string
  creado: string
  autor: PersonaSolicitud | null
}

export interface CambioSolicitud {
  id: number
  accion: string
  campo: string | null
  valor_antiguo: string | null
  valor_actual: string | null
  creado: string
  usuario: PersonaSolicitud | null
}

export interface ResumenSolicitudAdopcion {
  id: number
  estado: EstadoSolicitud
  nombre_apellido: string
  email: string
  telefono_celular: string
  creado: string
  fecha_resolucion: string | null
  mascota: MascotaSolicitud | null
}

export interface SolicitudAdopcion extends ResumenSolicitudAdopcion {
  edad: number
  telefono_fijo: string | null
  ocupacion: string
  localidad_barrio: string
  direccion: string
  vivienda: TipoVivienda
  tipo_tenencia: TipoTenencia
  permite_animales: boolean | null
  detalle_vivienda: string
  personas_hogar: string
  hay_ninos_hogar: string
  otros_animales_hogar: string
  frecuencia_paseo: string
  cuidador_vacaciones: string
  revisado_por: PersonaSolicitud | null
  observaciones: ObservacionSolicitud[]
  historial: CambioSolicitud[]
}

export interface DatosCrearSolicitud {
  animal_id: number
  nombre_apellido: string
  email: string
  edad: number
  telefono_celular: string
  telefono_fijo?: string | null
  ocupacion: string
  localidad_barrio: string
  direccion: string
  vivienda: TipoVivienda
  tipo_tenencia: TipoTenencia
  permite_animales?: boolean | null
  detalle_vivienda: string
  personas_hogar: string
  hay_ninos_hogar: string
  otros_animales_hogar: string
  frecuencia_paseo: string
  cuidador_vacaciones: string
}

export interface DatosCambioEstado {
  estado: EstadoSolicitud
  observacion?: string
}

export interface DatosCrearObservacion {
  observacion: string
}

export interface PaginaSolicitudes {
  items: ResumenSolicitudAdopcion[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FiltrosSolicitudes {
  estado?: EstadoSolicitud
  animal_id?: number
  page?: number
  limit?: number
}