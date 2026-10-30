export type RolUsuario = 'admin' | 'administrativo'

export interface PerfilUsuario {
  id: number
  usuarioId: number
  nombre: string
  apellido: string
  creadoEn: string
  actualizadoEn: string | null
}

export interface Usuario {
  id: number
  correoElectronico: string
  rol: RolUsuario
  perfil: PerfilUsuario
  creadoEn: string
  actualizadoEn: string | null
  eliminadoEn: string | null
}

export interface DatosCrearUsuario {
  correoElectronico: string
  contrasena: string
  rol: RolUsuario
  nombre: string
  apellido: string
}

export interface DatosActualizarUsuario {
  correoElectronico?: string
  contrasena?: string
  rol?: RolUsuario
  nombre?: string
  apellido?: string
}

export interface FiltrosUsuarios {
  estado?: 'activos' | 'inactivos'
}