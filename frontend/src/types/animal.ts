export type TipoEspecieAnimal = 'perro' | 'gato' | 'otro'
export type TipoSexoAnimal = 'macho' | 'hembra'
export type TipoTamanoAnimal = 'pequeno' | 'mediano' | 'grande'
export type EstadoAnimal = 'disponible' | 'en_proceso' | 'adoptado'
export type ColorAnimal = 'marron' | 'blanco' | 'negro' | 'beige' | 'multicolor'

export interface FotoAnimal {
  id: number
  animalId: number
  url: string
  esPrincipal: boolean
  orden: number
  creadoEn: string
  actualizadoEn: string | null
}

export interface Animal {
  id: number
  nombre: string
  especie: TipoEspecieAnimal
  raza: string | null
  sexo: TipoSexoAnimal
  tamano: TipoTamanoAnimal
  edad: number | null
  color: ColorAnimal
  comportamiento: string | null
  vacunado: boolean
  esterilizado: boolean
  estado: EstadoAnimal
  fechaIngreso: string
  creadoPor: number | null
  actualizadoPor: number | null
  creadoEn: string
  actualizadoEn: string | null
  eliminadoEn: string | null
  fotos: FotoAnimal[]
}

export interface DatosCrearAnimal {
  nombre: string
  especie: TipoEspecieAnimal
  raza?: string | null
  sexo: TipoSexoAnimal
  tamano: TipoTamanoAnimal
  edad?: number | null
  color: ColorAnimal
  comportamiento?: string | null
  vacunado?: boolean
  esterilizado?: boolean
  estado?: EstadoAnimal
  fechaIngreso?: string
}

export type DatosActualizarAnimal = Partial<DatosCrearAnimal>

export interface DatosCrearFotoAnimal {
  url: string
  esPrincipal?: boolean
  orden?: number
}

export type DatosActualizarFotoAnimal = Partial<DatosCrearFotoAnimal>

export interface FiltrosAnimales {
  especie?: TipoEspecieAnimal
  tamano?: TipoTamanoAnimal
  estado?: EstadoAnimal
  busqueda?: string
}

export type FiltrosPublicosAnimales = Pick<FiltrosAnimales, 'especie' | 'tamano' | 'busqueda'>